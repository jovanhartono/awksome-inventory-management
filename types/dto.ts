export type ProductDTO = {
  name: string;
  details: {
    qty: number;
    price: number;
    variantId: string;
  }[];
};

export type OrderInput = {
  date: Date;
  orderDetail: {
    productId: string;
    productLabel: string;
    variantId: string;
    variantLabel: string;
    qty: number;
  }[];
};
