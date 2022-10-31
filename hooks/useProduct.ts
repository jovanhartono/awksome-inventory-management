import useSWR from "swr";
import {Product} from "../types/prisma.types";

type UseProduct = {
    products: Array<Product>,
    isLoading: boolean,
    isError: boolean
}

export default function useProduct(id?: string): UseProduct {
  const { data, error } = useSWR("/product");

  return {
    products: data ?? [],
    isLoading: !error && !data,
    isError: error,
  };
}
