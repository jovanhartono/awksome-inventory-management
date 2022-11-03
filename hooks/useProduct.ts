import useSWR from "swr";
import { Product } from "../types/prisma.types";
import { useLoaderStore } from "../store/loader.store";
import { useEffect, useState } from "react";

type UseProduct = {
  products: Array<Product>;
  isLoading: boolean;
  isError: boolean;
};

export function useProduct(): UseProduct {
  const { data, error } = useSWR("/product");
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
