export type ProductInputForm = {
    name: string,
    details: {
        qty: number,
        price: number,
        variantId: string
    }[]
}
