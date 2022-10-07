import {Variant as PrismaVariant} from "@prisma/client";

export type ProductDetail = {
    id: string
    productId: string
    price: number
    qty: number
    variant: PrismaVariant
}

export type Product = {
    id: string,
    name: string,
    productDetail: ProductDetail[]
}
