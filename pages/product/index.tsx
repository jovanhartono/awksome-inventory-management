import {GetStaticProps, NextPage} from "next";
import {Variant as PrismaVariant} from "@prisma/client";
import {prisma} from "prisma/config";
import Head from "next/head";
import {ArrowRightIcon, ChevronDownIcon, MinusIcon, PlusIcon} from "@heroicons/react/24/outline";
import {ChangeEvent, Fragment, useEffect, useMemo, useState} from "react";
import Dialog from "components/dialog";
import TextField from "components/text-field";
import Dropdown from "components/dropdown";
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import axios from "lib/axios";
import {AxiosError} from "axios";
import {Product, ProductDetail} from "types/prisma.types";
import {Disclosure} from "@headlessui/react";
import {ProductDTO} from "types/dto";
import Link from "next/link";
import {useRouter} from "next/router";

type ProductPageProps = {
    products: Product[],
    variants: PrismaVariant[]
}

const schema = z.object({
    name: z.string().min(1, 'Product name cannot be empty!'),
    details: z.object({
        qty: z.number({invalid_type_error: 'Qty must be a positive number!'}).positive(),
        variantId: z.string(),
        price: z.number({invalid_type_error: 'Price must be a positive number!'}).positive()
    }).array()
}).required();

const ProductPage: NextPage<ProductPageProps> = ({products, variants: variantsProp}: ProductPageProps) => {
    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        control,
        reset: resetForm
    } = useForm<ProductDTO>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            name: '',
            details: [
                {
                    price: 55000,
                    qty: 1,
                    variantId: ''
                }
            ]
        }
    });
    const productDetails = useWatch({
        name: "details",
        control
    })

    const {fields, append, remove} = useFieldArray({
        name: 'details',
        control
    })
    const [variants, setVariants] = useState<PrismaVariant[]>(variantsProp);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const filterProducts = useMemo(() => {
        return products.filter((product: Product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);
    const router = useRouter();

    useEffect(() => {
        setVariants(() => {
            const selectedVariantId: string[] = productDetails.map(({variantId}) => variantId);
            return variantsProp.filter(({id}) => !selectedVariantId.includes(id));
        });
    }, [productDetails]);

    async function onSubmit(data: ProductDTO) {
        try {
            await axios.post('/product', {...data});
            setIsDialogOpen(false);
            resetForm();
            router.reload();
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            console.warn(axiosError.response?.data, axiosError.response?.status);
        }
    }

    return (
        <>
            <Head>
                <title>Product Page</title>
            </Head>
            <section>
                <Dialog isOpen={isDialogOpen}
                        onClose={() => {
                            setIsDialogOpen(false);
                        }}
                        title={"New Products :)"}
                >
                    <form className="mt-6 space-y-3 overflow-auto max-h-[75vh]" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-1">
                            <TextField label="Name" {...register("name")}/>
                            {
                                errors.name &&
                                <small
                                    className="text-sm font-light text-amber-700">{errors.name.message}</small>
                            }
                        </div>
                        {
                            fields.map((field, index: number) => {
                                return (
                                    <Fragment key={field.id}>
                                        <div className="space-y-3 flex-grow">
                                            <div className="flex items-center justify-between">
                                                <h3>Variant</h3>
                                                {
                                                    index > 0 ?
                                                        <div
                                                            className="cursor-pointer p-2 flex items-center justify-center rounded-full bg-red-50"
                                                            onClick={() => {
                                                                remove(index);
                                                            }}
                                                        >
                                                            <MinusIcon className="w-4 h-4 text-red-500"/>
                                                        </div>
                                                        :
                                                        <button
                                                            type={"button"}
                                                            className="button-small max-w-max"
                                                            onClick={() => {
                                                                append({
                                                                    qty: 1,
                                                                    variantId: '',
                                                                    price: 55000
                                                                })
                                                            }}
                                                        >
                                                            <PlusIcon className="w-4 h-4 text-gray-500 mr-2"/>
                                                            Add Variant
                                                        </button>
                                                }
                                            </div>
                                            <Dropdown
                                                options={variants.map((variant: PrismaVariant) => {
                                                    return {
                                                        value: variant.id,
                                                        label: variant.name
                                                    }
                                                })}
                                                changeHandler={({value}) => {
                                                    setValue(`details.${index}.variantId`, value);
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <TextField
                                                    label="Price" {...register(`details.${index}.price`, {valueAsNumber: true})}/>
                                                {
                                                    errors.details?.[index]?.price && <small
                                                        className="text-sm font-light text-amber-700">{errors.details?.[index]?.price?.message}</small>
                                                }
                                            </div>
                                            <div className="space-y-1">
                                                <TextField
                                                    label="Quantity" {...register(`details.${index}.qty`, {valueAsNumber: true})}/>
                                                {
                                                    errors.details?.[index]?.qty && <small
                                                        className="text-sm font-light text-amber-700">{errors.details?.[index]?.qty?.message}</small>
                                                }
                                            </div>
                                        </div>
                                    </Fragment>
                                )
                            })
                        }

                        <button
                            type="submit"
                            className="!mt-6 button-submit"
                        >
                            Store Products
                        </button>
                    </form>
                </Dialog>

                <p className="text-gray-700 font-medium text-lg mb-3">Stored Items</p>

                <div className="flex justify-between pb-3 items-center space-x-3">
                    <input type={'text'} placeholder={'Search'}
                           onInput={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}/>
                    <div
                        className="cursor-pointer whitespace-nowrap flex items-center border border-gray-400 hover:text-gray-700 hover:border-gray-700 basic-transition rounded p-2 text-gray-500 font-light text-sm"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <PlusIcon className="w-4 h-4 text-gray-500 mr-2"/>
                        Products
                    </div>
                </div>
                <div className="mt-3 space-y-3">
                    {
                        filterProducts.map((product: Product) => {
                            const totalQty = product.productDetail.reduce((acc, curr) => acc + curr.qty, 0);
                            return (
                                <Disclosure key={product.id} as={"div"}>
                                    {({open}) => (
                                        <>
                                            <Disclosure.Button as={"div"}
                                                               className={`${open ? 'bg-slate-100' : 'bg-gray-50'} 
                                                                   rounded basic-transition p-3 flex
                                                                   justify-between items-center cursor-pointer 
                                                                   hover:bg-slate-100`}
                                            >
                                                <div className="space-y-1">
                                                    <h3>{product.name}</h3>
                                                    <p className="text-gray-500 text-sm font-light">Total
                                                        Quantity: {totalQty}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="rounded-full p-2 bg-gray-100">
                                                        <ChevronDownIcon
                                                            className={`${open && 'rotate-180'} basic-transition w-4 h-4 text-gray-700`}/>
                                                    </div>
                                                </div>
                                            </Disclosure.Button>

                                            <Disclosure.Panel className={"p-3 rounded-b bg-gray-50"}>
                                                <div className="flex flex-col">
                                                    {
                                                        product.productDetail.map((details: ProductDetail) => {
                                                            return (
                                                                <div className="grid grid-cols-3 gap-3"
                                                                     key={details.id}>
                                                                    <h4 className="text-base font-medium">{details.variant.name}</h4>
                                                                    <span
                                                                        className="place-self-center font-light text-sm">{details.qty} pcs</span>
                                                                    <span
                                                                        className={"justify-self-end"}>Rp {details.price.toLocaleString('id')}</span>
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                    {
                                                        product.productDetail.length === 0 &&
                                                        <small>Product has no variants.</small>
                                                    }
                                                    <Link href={`/product/${product.id}`}>
                                                        <a className={"basic-transition ml-auto flex items-center max-w-max mt-3 text-sm text-slate-700 rounded px-2.5 py-1.5 bg-slate-200 shadow-sm hover:shadow"}>
                                                            <span>Update</span>
                                                            <ArrowRightIcon className="ml-1 w-3 h-3"/>
                                                        </a>
                                                    </Link>
                                                </div>
                                            </Disclosure.Panel>
                                        </>
                                    )
                                    }
                                </Disclosure>
                            )
                        })
                    }
                </div>
            </section>
        </>
    )
}

export default ProductPage;

export const getStaticProps: GetStaticProps = async () => {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            productDetail: {
                include: {
                    variant: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });


    const serializedProducts: Product[] = products.map(({productDetail, ...rest}) => {
        return {
            ...rest,
            productDetail: productDetail.map((details) => {
                return {
                    ...details,
                    price: details.price.toNumber()
                }
            })
        }
    });

    const variants: PrismaVariant[] = await prisma.variant.findMany();

    return {
        props: {
            products: serializedProducts,
            variants
        }
    }
}