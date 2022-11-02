import { NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import ListBox from "components/listBox";
import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Product as PrismaProduct,
  Variant as PrismaVariant,
} from "@prisma/client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TextField from "components/text-field";
import { useProduct } from "@hooks";
import produce from "immer";
import { AlertStatus, useAlertStore } from "store/alert.store";
import { TrashIcon } from "@heroicons/react/20/solid";
import axios from "../lib/axios";

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
      .number({ invalid_type_error: "Qty must be a positive number!" })
      .positive(),
    variantId: z.string(),
    variantLabel: z.string(),
    productId: z.string(),
    productLabel: z.string(),
  }),
});

const Order: NextPage = () => {
  const { show: showAlert } = useAlertStore();
  const { products, isLoading: isProductLoading } = useProduct();

  const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      date: new Date(),
      orderDetail: {
        qty: 1,
      },
    },
  });

  const date = useWatch({
    control,
    name: "date",
  });
  const selectedProductId = useWatch({
    control,
    name: "orderDetail.productId",
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

  useEffect(() => {
    if (products.length > 0) {
      setValue("orderDetail.productId", products[0].id);
      setValue("orderDetail.productLabel", products[0].name);
      setValue(
        "orderDetail.variantId",
        products[0].productDetail[0].variant.id
      );
      setValue(
        "orderDetail.variantLabel",
        products[0].productDetail[0].variant.name
      );
    }
  }, [products]);

  function handleAddProduct(data: OrderForm): void {
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
    try {
      await axios.post("/order", { date: getValues("date"), orderDetail });
      setOrderDetail([]);
    } catch (e) {
        console.log(e);
    }
  }

  if (isProductLoading) {
    return <p>Loading...</p>;
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
            <input
              id={"order-date"}
              type="date"
              {...register("date")}
              defaultValue={dayjs(new Date()).format("YYYY-MM-DD")}
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
            <ListBox
              value={watch("orderDetail.productId")}
              options={products.map((product: ProductDropdown) => {
                return {
                  label: product.name,
                  value: product.id,
                };
              })}
              onChange={({ value, label }) => {
                setValue("orderDetail.productId", value);
                setValue("orderDetail.productLabel", label);
              }}
            />
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
              <TextField
                label="Quantity"
                {...register(`orderDetail.qty`, {
                  valueAsNumber: true,
                })}
              />
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
                        className={"p-3 font-medium text-gray-700"}
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
        <button
          type="submit"
          className={"mt-3 button-submit"}
          onClick={submitOrder}
        >
          Add Order
        </button>
      </section>
    </>
  );
};

export default Order;
