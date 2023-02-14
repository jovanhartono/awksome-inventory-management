import useSWR from "swr";
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

  return {
    orders: data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
