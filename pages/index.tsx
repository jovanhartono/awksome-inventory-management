import { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import { useImmer } from "use-immer";

import { CustomLineChart } from "@components";
import { useOrderFilter } from "@hooks";
import { useLoaderStore } from "../store/loader.store";
import buttonFilter from "../const/buttonFilter";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
  const [buttonActiveFilter, setButtonActiveFilter] = useState<string>("1Y");
  const { show: showLoader, hide: hideLoader } = useLoaderStore();
  const [orderDateFilter, setOrderDateFilter] = useImmer({
    orderDateFrom: dayjs().subtract(1, "y").format("YYYY-MM-DD"),
    orderDateTo: dayjs().format("YYYY-MM-DD"),
    sort: "ASC",
  });
  const { orders, isLoading } = useOrderFilter({ ...orderDateFilter });
  const { data: session, status } = useSession();

  useEffect(() => {
    isLoading || status === "loading" ? showLoader() : hideLoader();
  }, [isLoading, status]);

  const lineChartData = useMemo(() => {
    return orders.map((order) => ({
      key: order.orderDate,
      value: order.data.reduce(
        (previousValue, currentValue) => previousValue + currentValue.qty,
        0
      ),
    }));
  }, [orders]);

  return (
    <>
      <Head>
        <title>Hello Awksome</title>
      </Head>
      <div>
        <section className={"space-y-3"}>
          <h2>Hello, {session?.user?.name}</h2>
          <div className="space-y-1">
            <h2>Order Summary</h2>
            <p className={"text-sm text-gray-500"}>
              {dayjs(orderDateFilter.orderDateFrom).format("D MMMM YYYY")} -{" "}
              {dayjs(orderDateFilter.orderDateTo).format("D MMMM YYYY")}
            </p>
          </div>
          <CustomLineChart data={lineChartData} />
          <div className="flex justify-between">
            {buttonFilter.map((orderFilter, index: number) => (
              <button
                key={index}
                className={`${
                  buttonActiveFilter === orderFilter.key &&
                  "bg-amber-100 text-amber-700"
                } basic-transition hover:text-amber-700 hover:bg-amber-100 p-1.5 rounded text-sm`}
                onClick={() => {
                  setOrderDateFilter((filter) => {
                    filter.orderDateFrom = orderFilter.orderDateFrom;
                  });
                  setButtonActiveFilter(orderFilter.key);
                }}
              >
                {orderFilter.key}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
