import useSWR from "swr";
import { useLoaderStore } from "store/loader.store";
import { useEffect, useState } from "react";
import { OrderGroupByDate } from "types/prisma.types";

type UseOrder = {
  orders: Array<OrderGroupByDate>;
  isLoading: boolean;
  isError: boolean;
  mutate: any;
};

export function useOrderFilter(filter: { [key: string]: string }): UseOrder {
  const { data, error, mutate } = useSWR<OrderGroupByDate[]>([
    "/order/filter",
    {
      params: { ...filter },
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
    orders: data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
