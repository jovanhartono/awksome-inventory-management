import {GetStaticProps, NextPage} from "next";
import {Product} from "@prisma/client";
import {prisma} from "../prisma/config";
import {SerializedProduct} from "../types/prisma.types";
import Head from "next/head";
import {ChevronRightIcon} from "@heroicons/react/24/outline";

type ProductPageProps = {
    products: SerializedProduct[]
}

const ProductPage: NextPage<ProductPageProps> = ({products}: ProductPageProps) => {
    return (
        <>
            <Head>
                <title>Product Page</title>
            </Head>
            <main>
                <section className={'p-6'}>
                    <div className="border-b border-b-gray-300 pb-3">
                        <p className="text-gray-700 font-light">Stored Items</p>
                    </div>
                    <div className="space-y-6 pt-3">
                        <input type={'text'} className="input-form"/>
                        {
                            products.map((product: SerializedProduct) => {
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

    return {
        props: {
            products
        }
    }
}
