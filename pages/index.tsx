import { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import { useImmer } from "use-immer";

import { CustomLineChart } from "@components";
import { useOrderFilter, useProduct } from "@hooks";
import { useSession } from "next-auth/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useLoaderStore } from "@store";
import buttonFilter from "../const/buttonFilter";

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
  const { products } = useProduct({ isOutOfStock: true });

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
          {products.length > 0 && (
            <div className="p-3 bg-amber-50 rounded">
              <div className="flex items-center mb-1">
                <h3 className={"text-amber-700 mr-2"}>Out of Stock</h3>
                <ExclamationTriangleIcon className={"w-5 h-5 text-red-700"} />
              </div>
              <div className="grid grid-cols-2">
                {products.map((product, firstIndex: number) => {
                  return product.productDetail.map(
                    (detail, secondIndex: number) => (
                      <p key={`${firstIndex}, ${secondIndex}`}>
                        {product.name} - {detail.variant.name}
                      </p>
                    )
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;
