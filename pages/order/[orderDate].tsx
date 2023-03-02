import { useRouter } from "next/router";
import useSWR from "swr";
import { useEffect } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import { useLoaderStore } from "../../store/loader.store";
import { TrashIcon } from "@heroicons/react/24/outline";
import axios from "../../lib/axios";

interface OrderDetailsByDate {
  id: string;
  orderDetails: {
    productName: string;
    variantName: string;
    qty: number;
  }[];
}

export default function OrderDetails() {
  const { query } = useRouter();
  const { orderDate } = query as { orderDate: string };
  const { data } = useSWR<Array<OrderDetailsByDate>>(
    orderDate ? `/order/${orderDate}` : null
  );
  const { show: showLoader, hide: hideLoader } = useLoaderStore();

  useEffect(() => {
    if (!data) {
      showLoader();
      return;
    }
    hideLoader();
  }, [data]);

  async function deleteOrder(id: string): Promise<void> {
      showLoader();
      try {
        await axios.delete(`/order/delete/${id}`);
      }
      catch (e) {

      }
      finally {
          hideLoader();
      }
  }

  if (!data) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Order Details {orderDate}</title>
      </Head>
      <section className={"space-y-6"}>
        <div className="flex justify-between items-center">
          <h2>Order List</h2>
          <p className={"text-gray-700 font-light text-base"}>
            {dayjs(orderDate).format("dddd, DD MMMM YYYY")}
          </p>
        </div>
        <div className="space-y-3">
          {data.map((orderList, index: number) => {
            return (
              <div className="rounded shadow p-3 flex flex-col" key={index}>
                {orderList.orderDetails.map((detail, index: number) => {
                  return (
                    <div
                      className={
                        "flex justify-between items-center text-gray-700 font-light"
                      }
                      key={index}
                    >
                      <p>{detail.productName}</p>
                      <p className={"justify-self-center"}>
                        {detail.variantName}
                      </p>
                      <p className={"justify-self-end"}>{detail.qty} pcs</p>
                    </div>
                  );
                })}
                <button
                  className="ml-auto w-24 mt-6 text-red-600 ring-red-600 ring-1 basic-transition px-2 py-1 rounded-md shadow flex items-center justify-center hover:shadow-md"
                  type={"button"}
                  onClick={async () => await deleteOrder(orderList.id)}
                >
                  <small>Delete</small>
                  <TrashIcon className={"w-4 h-4 ml-2"} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
