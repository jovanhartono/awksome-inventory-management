export type ProductDTO = {
    name: string,
    details: {
        qty: number,
        price: number,
        variantId: string
    }[]
}
