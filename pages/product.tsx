import {GetStaticProps, NextPage} from "next";
import {Product, Variant} from "@prisma/client";
import {prisma} from "../prisma/config";
import {SerializedProduct} from "../types/prisma.types";
import Head from "next/head";
import {ChevronRightIcon, PlusIcon} from "@heroicons/react/24/outline";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import Dialog from "../components/dialog";
import TextField from "../components/text-field";
import Dropdown from "../components/dropdown";

type ProductPageProps = {
    products: SerializedProduct[],
    variants: Variant[]
}

const ProductPage: NextPage<ProductPageProps> = ({products, variants}: ProductPageProps) => {
    const [variant, setVariant] = useState<string>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const filterProducts = useMemo(() => {
        const filteredProducts: SerializedProduct[] = products.filter((product: SerializedProduct) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return filteredProducts;
    }, [searchQuery]);

    useEffect(() => {
        console.log(variant);
    }, [variant]);

    return (
        <>
            <Head>
                <title>Product Page</title>
            </Head>
            <main>
                <section className={'p-6'}>
                    <Dialog isOpen={isDialogOpen}
                            onClose={() => {
                                setIsDialogOpen(false);
                            }}
                            title={"New Products :)"}
                    >
                        <form className="mt-6 space-y-3">
                            <TextField label="Name"/>
                            <div className="space-y-1 flex-grow">
                                <h3>Variant</h3>
                                <Dropdown
                                    options={variants.map((variant: Variant) => {
                                        return {
                                            value: variant.id.toString(),
                                            label: variant.name
                                        }
                                    })}
                                    changeHandler={({value}) => {
                                        setVariant(value);
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <TextField label="Price" inputType="number"/>
                                <TextField label="Quantity" inputType="number"/>
                            </div>

                            <button
                                type="button"
                                className="!mt-6 w-full justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={() => setIsDialogOpen(false)}
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
                    <div className="space-y-6 mt-3">
                        {
                            filterProducts.map((product: SerializedProduct) => {
                                return (
                                    <div key={product.id} className="flex justify-between ">
                                        <div className="space-y-1">
                                            <h3>{product.name}</h3>
                                            <p className="text-gray-500 text-sm font-light">Qty: some qty</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="rounded-full p-2 bg-gray-50">
                                                <ChevronRightIcon className="w-4 h-4 text-gray-500"/>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </section>
            </main>
        </>
    )
}

export default ProductPage;

export const getStaticProps: GetStaticProps = async () => {
    const prismaProducts: Product[] = await prisma.product.findMany();
    const products = prismaProducts.map(({id, name}: Product) => ({id, name}))
    const variants: Variant[] = await prisma.variant.findMany();

    return {
        props: {
            products,
            variants
        }
    }
}
