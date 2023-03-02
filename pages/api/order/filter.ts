import { NextApiRequest, NextApiResponse } from "next";
import { OrderGroup } from "types/prisma.types";
import { prisma } from "prisma/config";
import { Prisma } from "@prisma/client";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);
import dayjs from "dayjs";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    const {
      orderDateFrom,
      orderDateTo,
      sort: sortDirection = "DESC",
    } = request.query;
    const orderList: Array<OrderGroup> = await prisma.$queryRaw`
            SELECT DATE(CONVERT_TZ(o.createdAt, '+00:00', '+07:00')) as createdAt, p.name as productName, v.name as variant, SUM(od.qty) as qty
            FROM \`Order\` o 
            JOIN OrderDetails od 
            ON od.orderId = o.id 
            JOIN ProductDetail pd 
            ON od.productDetailsId = pd.id 
            JOIN Product p 
            ON p.id = pd.productId 
            JOIN Variant v 
            ON v.id = pd.variantId
            WHERE DATE(CONVERT_TZ(o.createdAt, '+00:00', '+07:00')) BETWEEN ${orderDateFrom} AND ${orderDateTo}  
            GROUP BY createdAt, p.name, v.name
            ${
              sortDirection === "ASC"
                ? Prisma.sql`ORDER BY createdAt ASC`
                : Prisma.sql`ORDER BY createdAt DESC`
            }
        `;
    const groupedData = orderList.reduce((acc, curr) => {
      const date = dayjs(curr.createdAt).format("YYYY-MM-DD");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        ...curr,
        qty: Number(curr.qty),
      });
      return acc;
    }, {} as { [key: string]: OrderGroup[] });

    const groupedDataArray = Object.entries(groupedData).map(
      ([date, data]) => ({
        date,
        data,
      })
    );

    const convertedOrderList = groupedDataArray.map((order) => ({
      orderDate: order.date,
      data: order.data,
    }));

    response.status(200).send(convertedOrderList);
  }
}
