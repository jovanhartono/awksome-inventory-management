import useSWR from "swr";
import { useLoaderStore } from "@store";
import { useEffect, useState } from "react";
import { OrderGroupByDate } from "types/prisma.types";

type UseOrder = {
  orders: Array<OrderGroupByDate>;
  isLoading: boolean;
  isError: boolean;
};

export function useOrder(filter?: { [key: string]: string }): UseOrder {
  const { data, error } = useSWR<OrderGroupByDate[]>([
    "/order",
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
    orders: data ?? [],
    isLoading: !error && !data,
    isError: error,
  };
}
