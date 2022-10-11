import {GetStaticProps, NextPage} from "next";
import Head from "next/head";
import dayjs from "dayjs";
import Dropdown from "../components/dropdown";
import {ChangeEvent, FormEvent, Fragment, useEffect, useState} from "react";
import {PlusIcon, TrashIcon} from "@heroicons/react/24/outline";
import {prisma} from "../prisma/config";
import {Product as PrismaProduct, Variant as PrismaVariant} from "@prisma/client";
import {nanoid} from "nanoid";

type ProductDetail = {
    key?: string,
    productId: string,
    variantId: string,
    qty: string
}

type OrderProps = {
    products: Array<ProductDropdown>,
    variants: Array<PrismaVariant>
}

type ProductDropdown = Omit<PrismaProduct, "updatedAt">;

const Order: NextPage<OrderProps> = ({products, variants}: OrderProps) => {
    const baseProduct: ProductDetail = {
        productId: products[0].id.toString(),
        qty: '1',
        variantId: variants[0].id.toString()
    }
    // dayjs unix value is floored into the nearest second. so we need to multiply into milliseconds.
    const [orderDate, setOrderDate] = useState<number>(dayjs().unix() * 1000);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

    useEffect(() => {
        setProductDetails([{...baseProduct, key: nanoid(10)}]);
    }, []);

    const handleProductDetails = (value: string, index: number, key: keyof ProductDetail) => {
        setProductDetails((currentValue: ProductDetail[]) => {
            const newValue = currentValue;
            newValue[index][key] = value;
            return [...newValue];
        });
    }

    function submitForm(event: FormEvent): void {
        event.preventDefault();
        console.log(orderDate, productDetails);
    }

    return (
        <>
            <Head>
                <title>Order Page</title>
            </Head>
            <section>
                <div className="flex justify-between items-center">
                    <h2>Add Order</h2>
                    <p className="leading-none font-light text-sm text-gray-500">
                        {dayjs().format('dddd, D MMMM YYYY')}
                    </p>
                </div>
                <div className="pt-3">
                    <form className={'space-y-3'} onSubmit={submitForm}>
                        <div>
                            <label htmlFor={'order-date'}>Date</label>
                            <input id={'order-date'}
                                   type="date"
                                   value={dayjs(orderDate).format('YYYY-MM-DD')}
                                   onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                       setOrderDate(dayjs(event.target.value).unix() * 1000)
                                   }}
                            />
                        </div>
                        {
                            productDetails.map((productDetail: ProductDetail, index: number) => {
                                return (
                                    <Fragment key={productDetail.key}>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="mb-0">Products</label>
                                                {
                                                    index === 0 ?
                                                        (
                                                            <button
                                                                className="button-small"
                                                                onClick={() => {
                                                                    setProductDetails((currentValue: ProductDetail[]) => {
                                                                        const newValue = [...currentValue, {
                                                                            ...baseProduct,
                                                                            key: nanoid(10)
                                                                        }]
                                                                        return [...newValue];
                                                                    })
                                                                }}
                                                            >
                                                                <PlusIcon className="w-4 h-4 text-gray-500 mr-2"/>
                                                                Add Products
                                                            </button>
                                                        ) :
                                                        (
                                                            <div
                                                                className="basic-transition hover:bg-red-100 cursor-pointer rounded-full p-2 bg-red-50 flex items-center justify-center"
                                                                onClick={() => setProductDetails((currentValue: ProductDetail[]) => {
                                                                    const newValue = [...currentValue];
                                                                    return newValue.filter((_, idx: number) => idx !== index);
                                                                })}
                                                            >
                                                                <TrashIcon className="w-4 h-4 text-red-500"/>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                            <Dropdown
                                                value={productDetails[index].productId}
                                                options={products.map((product: ProductDropdown) => {
                                                    return {
                                                        label: product.name,
                                                        value: product.id
                                                    }
                                                })}
                                                changeHandler={({value}) => {
                                                    handleProductDetails(value, index, "productId")
                                                }}
                                            />
                                        </div>
                                        <div className={'grid grid-cols-2 gap-3'}>
                                            <div>
                                                <label htmlFor={'order-variant'}>Variants</label>
                                                <Dropdown
                                                    options={variants.map((variant: PrismaVariant) => {
                                                        return {
                                                            label: variant.name,
                                                            value: variant.id
                                                        }
                                                    })}
                                                    changeHandler={
                                                        data => {
                                                            handleProductDetails(data.value, index, "variantId")
                                                        }
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label>Qty</label>
                                                <input id={'order-qty'}
                                                       type="number"
                                                       onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                                           const qty = event.target.value;
                                                           const arrQty = qty.split('');
                                                           if (arrQty[0] === '0') {
                                                               arrQty.shift();
                                                           }
                                                           handleProductDetails(qty, index, "qty")
                                                       }}/>
                                            </div>
                                        </div>
                                    </Fragment>
                                )
                            })
                        }
                        <div className="rounded bg-gray-100 p-4">
                            <h3>Preview</h3>
                            {

                            }
                        </div>

                        <div>
                            <button type="submit"
                                    className={'w-full mt-3 text-gray-50 capitalize bg-blue-500 text-center p-2 rounded-xl'}
                            >
                                Add Order
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const products: ProductDropdown[] = await prisma.product.findMany({
        select: {
            name: true,
            id: true
        }
    });
    const variants: PrismaVariant[] = await prisma.variant.findMany();

    const mappedProducts: Array<ProductDropdown> = products.map(({id, name}) => ({id, name}))

    return {
        props: {
            products: mappedProducts,
            variants
        }
    }
}

export default Order;
