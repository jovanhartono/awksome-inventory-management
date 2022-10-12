import {NextRouter, useRouter} from "next/router";
import axios from "../../lib/axios";
import Head from "next/head";
import {GetStaticPaths, GetStaticProps} from "next";
import {prisma} from "prisma/config";
import {Variant} from '@prisma/client';
import {useFieldArray, useForm} from "react-hook-form";
import TextField from "../../components/text-field";
import {zodResolver} from "@hookform/resolvers/zod";

type ProductProps = {
    id: string,
    name: string,
    productDetail: {
        variant: Variant,
        qty: number
    }[]
}

type ProductForm = Omit<ProductProps, "id">;

type ProductDetailPageProps = {
    product: ProductProps
}

export default function ProductDetail({product}: ProductDetailPageProps) {
    const {register, handleSubmit, formState: {errors}, control} = useForm<ProductForm>({
        defaultValues: {
            name: product.name,
            productDetail: product.productDetail
        },
    });
    const {fields, append, remove} = useFieldArray({
        name: 'productDetail',
        control
    })

    const {query}: NextRouter = useRouter();
    const {id} = query as { id: string };

    const onSubmit = (data: ProductForm) => {
        console.log(data);
    }

    return (
        <>
            <Head>
                <title>Detail</title>
            </Head>
            <section>
                <form onSubmit={handleSubmit(onSubmit)}
                      className={"space-y-3"}
                >
                    <TextField label={'Product Name'} {...register("name")}/>
                    {
                        fields.map((field, index: number) => {
                            return (
                                <div key={field.id}>
                                    <p>{field.variant.name}</p>
                                    <p>{field.qty}</p>
                                </div>
                            )
                        })
                    }

                    <button className="button-submit"
                            onClick={() => {

                            }}
                    >
                        Update
                    </button>
                </form>
                {
                    product.productDetail.map((detail, index: number) => {
                        return (
                            <div key={index}>
                                <span>qty: {detail.qty}</span>
                                <span>variant :{detail.variant.name}</span>
                            </div>
                        )
                    })
                }

            </section>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const ids: Array<{ id: string }> = await prisma.product.findMany({
        select: {
            id: true
        }
    });

    const paths = ids.map(({id}) => {
        return {
            params: {
                id
            }
        }
    })

    return {
        paths,
        fallback: true
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const id = params?.id as string;
    const product: ProductProps | null = await prisma.product.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            productDetail: {
                select: {
                    variant: true,
                    qty: true,
                }
            }
        }
    })

    if (!product) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            product
        }
    }
}
