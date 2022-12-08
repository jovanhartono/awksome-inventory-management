import { OrderList } from "../types/dto";
import useSWR from "swr";
import { useLoaderStore } from "../store/loader.store";
import { useEffect, useState } from "react";

type UseOrder = {
  orders: Array<OrderList>;
  isLoading: boolean;
  isError: boolean;
};

export function useOrder(): UseOrder {
  const { data, error } = useSWR<OrderList[]>("/order");
  const { show, hide } = useLoaderStore();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(!error && !data);
  }, [error, data]);

  useEffect(() => {
    loading ? show() : hide();
  }, [loading]);

  return {
    orders: data ?? [],
    isLoading: !error && !data,
    isError: error,
  };
}
