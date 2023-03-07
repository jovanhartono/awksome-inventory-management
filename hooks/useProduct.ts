import useSWR from "swr";
import { Product } from "../types/prisma.types";
import { useEffect, useState } from "react";
import { useLoaderStore } from "@store";

type UseProduct = {
  products: Array<Product>;
  isLoading: boolean;
  isError: boolean;
};

export function useProduct(filter?: { [key: string]: any }): UseProduct {
  const { data, error } = useSWR([
    "/product",
    {
      params: {
        ...filter,
      },
    },
  ]);
  const { show, hide } = useLoaderStore();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(!error && !data);
  }, [error, data]);

  useEffect(() => {
    loading ? show() : hide();
  }, [loading]);

  return {
    products: data ?? [],
    isLoading: !error && !data,
    isError: error,
  };
}
