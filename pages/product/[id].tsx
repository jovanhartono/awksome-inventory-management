import { NextRouter, useRouter } from "next/router";
import axios from "../../lib/axios";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "prisma/config";
import { Variant as PrismaVariant } from "@prisma/client";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import TextField from "../../components/text-field";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Fragment, useEffect, useState } from "react";
import { MinusIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/dropdown";
import { ProductDTO } from "../../types/dto";
import { Product } from "../../types/prisma.types";
import { AxiosError, AxiosResponse } from "axios";
import ButtonSubmit from "../../components/button-submit";
import { AlertStatus, useAlertStore } from "../../store/alert.store";

type ProductDetailPageProps = {
  product: Product;
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
      .array()
      .min(1, "Variant cannot be empty bebski"),
  })
  .required();

export default function ProductDetail({
  product,
  variants: variantsProp,
}: ProductDetailPageProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ProductDTO>({
    mode: "onChange",
    defaultValues: {
      name: product?.name,
      details: product?.productDetail.map((detail) => {
        return {
          qty: detail?.qty,
          variantId: detail?.variant.id,
          price: detail?.price,
        };
      }),
    },
    resolver: zodResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    name: "details",
    control,
  });
  const productDetails = useWatch({
    control,
    name: "details",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { show: showAlert, hide: hideAlert } = useAlertStore();
  const { query }: NextRouter = useRouter();
  const { id } = query as { id: string };
  const [variants, setVariants] = useState<PrismaVariant[]>(variantsProp);

  useEffect(() => {
    errors.details
      ? showAlert(errors.details.message ?? "", AlertStatus.ERROR)
      : hideAlert();
    setVariants(() => {
      const selectedVariantId: string[] = productDetails.map(
        ({ variantId }) => variantId
      );
      return variantsProp.filter(({ id }) => !selectedVariantId.includes(id));
    });
  }, [productDetails]);

  const onSubmit = async (data: ProductDTO) => {
    setLoading(true);
    try {
      const res: AxiosResponse<string> = await axios.put(`/product/${id}`, {
        ...data,
      });
      showAlert(res.data, AlertStatus.SUCCESS);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.warn(axiosError.response?.data, axiosError.response?.status);
      showAlert("Error nich :(. Tell jovan to fix.", AlertStatus.ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (router.isFallback) {
    return <h2>LOADING</h2>;
  }

  return (
    <>
      <Head>
        <title>Detail</title>
      </Head>
      <section>
        <form onSubmit={handleSubmit(onSubmit)} className={"space-y-3"}>
          <div className="space-y-1">
            <TextField label={"Product Name"} {...register("name")} />
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
                        className="button-small"
                        type={"button"}
                        onClick={() => {
                          if (variants.length > 0) {
                            append({
                              qty: 1,
                              variantId: "",
                              price: 55000,
                            });

                            return;
                          }

                          // variant array is 0
                          showAlert(
                            "Cannot add anymore variant",
                            AlertStatus.ERROR
                          );
                        }}
                      >
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
          <ButtonSubmit text={"Update"} loading={loading} />
        </form>
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ids: Array<{ id: string }> = await prisma.product.findMany({
    select: {
      id: true,
    },
  });

  const paths = ids.map(({ id }) => {
    return {
      params: {
        id,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      productDetail: {
        include: {
          variant: true,
        },
      },
    },
  });

  const variants: PrismaVariant[] = await prisma.variant.findMany();

  if (!product || product.productDetail.length === 0) {
    return {
      notFound: true,
    };
  }

  const serializedProductDetail = product?.productDetail.map((detail) => {
    return {
      ...detail,
      price: detail.price.toNumber(),
    };
  });

  const serializedProducts: Product = {
    ...product,
    productDetail: serializedProductDetail,
  };

  return {
    props: {
      product: serializedProducts,
      variants,
    },
  };
};
