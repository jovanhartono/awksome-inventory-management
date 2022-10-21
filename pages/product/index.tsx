import { GetStaticProps, NextPage } from "next";
import { Variant as PrismaVariant } from "@prisma/client";
import { prisma } from "prisma/config";
import Head from "next/head";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ChangeEvent, Fragment, useMemo, useState } from "react";
import Dialog from "components/dialog";
import TextField from "components/text-field";
import Dropdown from "components/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import axios from "lib/axios";
import { AxiosError } from "axios";
import { Product, ProductDetail } from "types/prisma.types";
import { Disclosure } from "@headlessui/react";
import { ProductDTO } from "types/dto";
import Link from "next/link";
import { useRouter } from "next/router";
import ButtonSubmit from "../../components/button-submit";
import { useLoaderStore } from "../../store/state";

type ProductPageProps = {
  products: Product[];
  variants: PrismaVariant[];
};

const schema = z
  .object({
    name: z.string().min(1, "Product name cannot be empty!"),
    details: z
      .object({
        qty: z
          .number({ invalid_type_error: "Qty must be a positive number!" })
          .positive(),
        variantId: z.string(),
        price: z
          .number({ invalid_type_error: "Price must be a positive number!" })
          .positive(),
      })
      .array(),
  })
  .required();

const ProductPage: NextPage<ProductPageProps> = ({
  products,
  variants,
}: ProductPageProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset: resetForm,
  } = useForm<ProductDTO>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      details: [
        {
          price: 55000,
          qty: 1,
          variantId: variants[0].id,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "details",
    control,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filterProducts = useMemo(() => {
    return products.filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  const { show: showLoader, hide: hideLoader } = useLoaderStore();
  const router = useRouter();

  async function deleteProduct(id: string) {
    showLoader();
    try {
      await axios.delete(`/product/${id}`);
    } catch (e) {
      console.warn("Failed to delete product");
    } finally {
      hideLoader();
      setTimeout(() => {
        router.reload();
      }, 250);
    }
  }

  async function onSubmit(data: ProductDTO) {
    setLoading(true);
    try {
      await axios.post("/product", { ...data });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.warn(axiosError.response?.data, axiosError.response?.status);
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
      resetForm();
      setTimeout(() => {
        router.reload();
      }, 250);
    }
  }

  return (
    <>
      <Head>
        <title>Product Page</title>
      </Head>
      <section>
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          title={"New Products :)"}
        >
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <TextField
                label="Name"
                {...register("name")}
                placeholder={"Product name"}
              />
              {errors.name && (
                <small className="text-sm font-light text-amber-700">
                  {errors.name.message}
                </small>
              )}
            </div>
            {fields.map((field, index: number) => {
              return (
                <Fragment key={field.id}>
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center justify-between">
                      <h3>Variant</h3>
                      {index > 0 ? (
                        <div
                          className="cursor-pointer p-2 flex items-center justify-center rounded-full bg-red-50"
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <MinusIcon className="w-4 h-4 text-red-500" />
                        </div>
                      ) : (
                        <button
                          type={"button"}
                          className="button-small max-w-max"
                          onClick={() => {
                            append({
                              qty: 1,
                              variantId: "",
                              price: 55000,
                            });
                          }}
                        >
                          <PlusIcon className="w-4 h-4 text-gray-500 mr-2" />
                          Add Variant
                        </button>
                      )}
                    </div>
                    <Dropdown
                      value={field.variantId}
                      options={variants.map((variant: PrismaVariant) => {
                        return {
                          value: variant.id,
                          label: variant.name,
                        };
                      })}
                      changeHandler={({ value }) => {
                        setValue(`details.${index}.variantId`, value);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <TextField
                        label="Price"
                        {...register(`details.${index}.price`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.details?.[index]?.price && (
                        <small className="text-sm font-light text-amber-700">
                          {errors.details?.[index]?.price?.message}
                        </small>
                      )}
                    </div>
                    <div className="space-y-1">
                      <TextField
                        label="Quantity"
                        {...register(`details.${index}.qty`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.details?.[index]?.qty && (
                        <small className="text-sm font-light text-amber-700">
                          {errors.details?.[index]?.qty?.message}
                        </small>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
            <ButtonSubmit
              text={"Store Products"}
              className={"!mt-6"}
              loading={loading}
            />
          </form>
        </Dialog>

        <p className="text-gray-700 font-medium text-lg mb-3">Stored Items</p>

        <div className="flex justify-between pb-3 items-center space-x-3">
          <input
            type={"text"}
            placeholder={"Search"}
            onInput={(event: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(event.target.value)
            }
          />
          <button
            className="button-small py-2 text-base border-gray-300"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusIcon className="w-4 h-4 text-gray-500 mr-2" />
            Products
          </button>
        </div>
        <div className="mt-3 divide-y divide-gray-100 divide">
          {filterProducts.map((product: Product) => {
            const totalQty = product.productDetail.reduce(
              (acc, curr) => acc + curr.qty,
              0
            );
            return (
              <Disclosure key={product.id} as={"div"}>
                {({ open }) => (
                  <>
                    <Disclosure.Button
                      as={"div"}
                      className={`${
                        open && "bg-slate-50"
                      } rounded basic-transition p-3 flex 
                      justify-between items-center cursor-pointer 
                      hover:bg-slate-50`}
                    >
                      <div className="space-y-1 text-gray-700">
                        <h3 className={"capitalize"}>{product.name}</h3>
                        <p className="text-gray-500 text-sm font-light">
                          Total Quantity: {totalQty}
                        </p>
                      </div>
                      <div className="flex items-center mr-1">
                        <ChevronDownIcon
                          className={`${
                            open && "rotate-180"
                          } basic-transition w-4 h-4 text-gray-500`}
                        />
                      </div>
                    </Disclosure.Button>

                    <Disclosure.Panel className={"p-3 rounded-b"}>
                      <div className="flex flex-col">
                        {product.productDetail.map((details: ProductDetail) => {
                          return (
                            <div
                              className="grid grid-cols-3 gap-3 text-gray-500 text-sm"
                              key={details.id}
                            >
                              <p className="text-sm">{details.variant.name}</p>
                              <span className="place-self-center font-light">
                                {details.qty} pcs
                              </span>
                              <span className={"justify-self-end"}>
                                Rp {details.price.toLocaleString("id")}
                              </span>
                            </div>
                          );
                        })}
                        {product.productDetail.length === 0 && (
                          <small>Product has no variants.</small>
                        )}
                        <div className="flex items-center mt-6 space-x-6 justify-between">
                          <button
                            className="text-red-600 ring-red-600 ring-1 basic-transition px-2 py-1 rounded-md shadow flex items-center justify-center hover:shadow-md"
                            type={"button"}
                            onClick={async () => {
                              await deleteProduct(product.id);
                            }}
                          >
                            <small>Delete</small>
                            <TrashIcon className={"w-4 h-4 ml-2"} />
                          </button>
                          <Link href={`/product/${product.id}`}>
                            <a
                              className={
                                "basic-transition flex items-center max-w-max text-sm text-gray-700 border-b border-b-gray-700"
                              }
                            >
                              <span>Edit</span>
                              <ArrowRightIcon className="ml-1 w-3 h-3" />
                            </a>
                          </Link>
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ProductPage;

export const getStaticProps: GetStaticProps = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      productDetail: {
        include: {
          variant: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const serializedProducts: Product[] = products.map(
    ({ productDetail, ...rest }) => {
      return {
        ...rest,
        productDetail: productDetail.map((details) => {
          return {
            ...details,
            price: details.price.toNumber(),
          };
        }),
      };
    }
  );

  const variants: PrismaVariant[] = await prisma.variant.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return {
    props: {
      products: serializedProducts,
      variants,
    },
  };
};
