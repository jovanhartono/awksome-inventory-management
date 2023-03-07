import { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import produce from "immer";
import { useImmer } from "use-immer";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@heroicons/react/20/solid";
import {
  Product as PrismaProduct,
  Variant as PrismaVariant,
} from "@prisma/client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowRightIcon, CogIcon, PlusIcon } from "@heroicons/react/24/outline";
import axios from "lib/axios";

import { useOrderFilter, useProduct } from "@hooks";
import { OrderGroupByDate } from "types/prisma.types";
import {
  AutoComplete,
  ButtonSubmit,
  DateRange,
  ListBox,
  ListSort,
} from "@components";
import Link from "next/link";
import { useAlertStore, AlertStatus } from "@store";

type ProductDropdown = Omit<PrismaProduct, "updatedAt">;

type OrderDetail = {
  productId: string;
  productLabel: string;
  variantId: string;
  variantLabel: string;
  qty: number;
};

type OrderForm = {
  date: Date;
  orderDetail: OrderDetail;
};

const schema = z.object({
  date: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({ invalid_type_error: "Must be type of Date!" })),
  orderDetail: z.object({
    qty: z
      .number({ invalid_type_error: "Quantity must be number!" })
      .positive(),
    variantId: z.string(),
    variantLabel: z.string(),
    productId: z.string({ required_error: "Please add product!" }),
    productLabel: z.string(),
  }),
});

const Order: NextPage = () => {
  const { show: showAlert } = useAlertStore();
  const { products, isLoading: isProductLoading } = useProduct();

  const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [buttonActiveFilter, setButtonActiveFilter] = useState<string>("1W");
  const [orderDateFilter, setOrderDateFilter] = useImmer({
    orderDateFrom: dayjs().subtract(7, "d").format("YYYY-MM-DD"),
    orderDateTo: dayjs().format("YYYY-MM-DD"),
    sort: "DESC",
  });
  const {
    orders,
    isLoading: isOrderLoading,
    mutate,
  } = useOrderFilter({
    ...orderDateFilter,
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset: resetForm,
    control,
    watch,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const date = useWatch({
    control,
    name: "date",
  });

  const selectedProductId = useWatch({
    control,
    name: "orderDetail.productId",
  });

  const selectedVariantId = useWatch({
    control,
    name: "orderDetail.variantId",
  });

  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct: PrismaVariant = products.filter(
        (x) => x.id === selectedProductId
      )[0].productDetail[0].variant;

      setValue("orderDetail.variantId", selectedProduct.id);
      setValue("orderDetail.variantLabel", selectedProduct.name);
    }
  }, [selectedProductId]);

  const availableQty = useMemo(() => {
    const product = products.find(({ id }) => id === selectedProductId);
    return (
      product?.productDetail.find(
        ({ variant }) => variant.id === selectedVariantId
      )?.qty ?? 0
    );
  }, [selectedProductId, selectedVariantId]);

  useEffect(() => {
    if (products.length > 0) {
      resetForm({
        date: dayjs(dayjs().format("YYYY-MM-DD")).toDate(),
        orderDetail: {
          productId: undefined,
          variantId: undefined,
          productLabel: undefined,
          variantLabel: undefined,
          qty: 1,
        },
      });
    }
  }, [products]);

  function handleAddProduct(data: OrderForm): void {
    if (data.orderDetail.qty > availableQty) {
      showAlert(
        `${data.orderDetail.productLabel} quantity cannot be higher than ${availableQty}`,
        AlertStatus.ERROR
      );
      return;
    }

    const isDuplicate = orderDetail.some((item: OrderDetail) => {
      return (
        data.orderDetail.productId === item.productId &&
        data.orderDetail.variantId === item.variantId
      );
    });

    if (isDuplicate) {
      showAlert("Cannot add duplicate product", AlertStatus.ERROR);
      return;
    }

    setOrderDetail(
      produce((draft) => {
        draft.push(data.orderDetail);
      })
    );
  }

  async function submitOrder() {
    if (orderDetail.length <= 0) {
      showAlert("Product cannot be empty", AlertStatus.ERROR);
      return;
    }

    setIsButtonLoading(true);
    try {
      await axios.post("/order", { date: getValues("date"), orderDetail });
      setOrderDetail([]);
      showAlert("Successfully add order.");
      await mutate();
    } catch (e) {
      showAlert("There is an error when adding order.", AlertStatus.ERROR);
    } finally {
      setIsButtonLoading(false);
    }
  }

  if (isProductLoading) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Order Page</title>
      </Head>
      <section className={"space-y-3"}>
        <div className="flex justify-between items-center">
          <h2>Add Order</h2>
          <p className="leading-none font-light text-sm text-gray-500">
            {dayjs(date).format("dddd, DD MMMM YYYY")}
          </p>
        </div>
        <form className={"space-y-3"} onSubmit={handleSubmit(handleAddProduct)}>
          <div>
            <label htmlFor={"order-date"}>Date</label>
            <Controller
              control={control}
              name={"date"}
              render={({ field }) => (
                <input
                  id={"order-date"}
                  type="date"
                  defaultValue={dayjs(new Date()).format("YYYY-MM-DD")}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(dayjs(event.target.value).toDate());
                  }}
                />
              )}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="mb-0">Products</label>
              <button className="button-small" type={"submit"}>
                <PlusIcon className="w-4 h-4 text-gray-500 mr-2" />
                Add Products
              </button>
            </div>
            <AutoComplete
              value={watch("orderDetail.productId")}
              options={products.map((product: ProductDropdown) => {
                return {
                  label: product.name,
                  value: product.id,
                };
              })}
              onChange={({ value, label }) => {
                setValue("orderDetail.productId", value, {
                  shouldValidate: true,
                });
                setValue("orderDetail.productLabel", label, {
                  shouldValidate: true,
                });
              }}
            />
            {errors.orderDetail?.productId && (
              <small className="text-sm font-light text-amber-700">
                {errors.orderDetail?.productId?.message}
              </small>
            )}
          </div>
          <div className={"grid grid-cols-2 gap-3"}>
            <div className={"space-y-1"}>
              <label htmlFor={"order-variant"} className={"mb-0"}>
                Variants
              </label>
              <ListBox
                value={watch("orderDetail.variantId")}
                options={
                  products
                    .find((x) => x.id === watch("orderDetail.productId"))
                    ?.productDetail.map(({ variant }) => {
                      return {
                        label: variant.name,
                        value: variant.id,
                      };
                    }) || []
                }
                onChange={({ value, label }) => {
                  setValue(`orderDetail.variantId`, value);
                  setValue(`orderDetail.variantLabel`, label);
                }}
              />
            </div>
            <div>
              <div className="space-y-1">
                <div className={"flex justify-between items-center"}>
                  <h3>Quantity</h3>
                  <small className={"text-sm font-light text-amber-700"}>
                    (stocks: {availableQty})
                  </small>
                </div>
                <input
                  {...register(`orderDetail.qty`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.orderDetail?.qty && (
                <small className="text-sm font-light text-amber-700">
                  {errors.orderDetail?.qty?.message}
                </small>
              )}
            </div>
          </div>
        </form>
        <div className="p-4 rounded border">
          <table className={"table-auto w-full"}>
            <thead className={"uppercase text-sm"}>
              <tr className={"bg-gray-50 text-left rounded-xl overflow-hidden"}>
                {["Product", "Variant", "Qty", ""].map(
                  (value: string, index: number) => {
                    return (
                      <th
                        key={index}
                        className={"p-3 font-medium text-gray-700 min-w-[55px]"}
                      >
                        {value}
                      </th>
                    );
                  }
                )}
              </tr>
            </thead>
            <tbody className={"text-sm divide-y divide-y-gray-50"}>
              {orderDetail.map((detail: OrderDetail) => {
                return (
                  <tr key={`${detail.productId}${detail.variantId}`}>
                    <td className={"p-3 text-amber-700"}>
                      {detail.productLabel}
                    </td>
                    <td className={"p-3 font-light"}>{detail.variantLabel}</td>
                    <td className={"p-3 font-light"}>{detail.qty}</td>
                    <td className={"p-3 flex justify-center items-center"}>
                      <div
                        className="p-1.5 rounded-full bg-red-50 cursor-pointer"
                        onClick={() => {
                          setOrderDetail(
                            produce((draft: OrderDetail[]) =>
                              draft.filter(
                                (item: OrderDetail) =>
                                  item.variantId !== detail.variantId ||
                                  item.productId !== detail.productId
                              )
                            )
                          );
                        }}
                      >
                        <TrashIcon className={"w-4 h-4 text-red-600"} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ButtonSubmit
          text={"Add Order"}
          loading={isButtonLoading}
          onClick={submitOrder}
        />
      </section>
      <section className={"space-y-3 mt-6"}>
        <div className="flex justify-between items-center">
          <h2>Recent Order</h2>
          <div className="flex space-x-3">
            <button
              className={`${
                buttonActiveFilter === "1W" && "bg-amber-100 text-amber-700"
              } basic-transition hover:text-amber-700 hover:bg-amber-100 p-1.5 rounded text-sm`}
              onClick={() => {
                setOrderDateFilter((filter) => {
                  filter.orderDateFrom = dayjs()
                    .subtract(1, "w")
                    .format("YYYY-MM-DD");
                  filter.orderDateTo = dayjs().format("YYYY-MM-DD");
                });
                setButtonActiveFilter("1W");
              }}
            >
              1W
            </button>
            <button
              className={`${
                buttonActiveFilter === "2W" && "bg-amber-100 text-amber-700"
              } basic-transition hover:text-amber-700 hover:bg-amber-100 p-1.5 rounded text-sm`}
              onClick={() => {
                setOrderDateFilter((filter) => {
                  filter.orderDateFrom = dayjs()
                    .subtract(2, "w")
                    .format("YYYY-MM-DD");
                  filter.orderDateTo = dayjs().format("YYYY-MM-DD");
                });
                setButtonActiveFilter("2W");
              }}
            >
              2W
            </button>
            <DateRange
              active={buttonActiveFilter === "custom-date"}
              onChange={(dateFrom, dateTo) => {
                setOrderDateFilter((filter) => {
                  filter.orderDateFrom = dateFrom;
                  filter.orderDateTo = dateTo;
                });
                setButtonActiveFilter("custom-date");
              }}
            />
          </div>
        </div>
        <div className={"flex justify-between items-center"}>
          <p className={"text-sm text-gray-500"}>
            {dayjs(orderDateFilter.orderDateFrom).format("D MMMM YYYY")} -{" "}
            {dayjs(orderDateFilter.orderDateTo).format("D MMMM YYYY")}
          </p>
          <ListSort
            sortDirection={orderDateFilter.sort}
            onChange={(sortDir) => {
              setOrderDateFilter((draft) => {
                draft.sort = sortDir;
              });
            }}
          />
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-visible p-0.5">
          {isOrderLoading ? (
            <div className="flex space-x-3 justify-center min-h-[24rem]">
              <p className={"text-gray-900 text-base"}>Loading</p>
              <CogIcon className={"w-4 h-4 text-amber-700 animate-spin"} />
            </div>
          ) : (
            orders.map((order: OrderGroupByDate, index: number) => {
              return (
                <div className={"rounded shadow p-3"} key={index}>
                  <p className={"text-sm text-gray-500 mb-2"}>
                    {dayjs(order.orderDate).format("dddd, DD MMMM YYYY")}
                  </p>
                  {order.data.map((dataGroup, index: number) => {
                    return (
                      <div
                        key={index}
                        className={"grid grid-cols-3 items-center"}
                      >
                        <small className={"text-sm text-gray-700"}>
                          {dataGroup.productName}
                        </small>
                        <small
                          className={
                            "text-sm text-gray-700 justify-self-center"
                          }
                        >
                          {dataGroup.variant}
                        </small>
                        <small
                          className={"text-sm text-gray-700 justify-self-end"}
                        >
                          {dataGroup.qty} pcs
                        </small>
                      </div>
                    );
                  })}
                  <Link href={`/order/${order.orderDate}`}>
                    <a
                      className={
                        "ml-auto mt-3 basic-transition justify-end flex items-center max-w-max text-sm text-gray-700 border-b border-b-gray-700"
                      }
                    >
                      <span>Details</span>
                      <ArrowRightIcon className="ml-1 w-3 h-3" />
                    </a>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};

export default Order;
