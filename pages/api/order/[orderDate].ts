import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/config";
import dayjs from "dayjs";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { orderDate } = request.query as { orderDate: string };
  if (request.method === "GET") {
    const orderByDate = await prisma.order.findMany({
      where: {
        createdAt: {
          equals: dayjs(orderDate).toDate(),
        },
        isDeleted: false,
      },
      include: {
        detail: {
          include: {
            productDetails: {
              include: {
                variant: true,
                product: true,
                orderDetail: true,
              },
            },
          },
        },
      },
    });

    const convertedOrder = orderByDate.map((order) => {
      return {
        id: order.id,
        orderDetails: order.detail.map((orderDetail) => ({
          productName: orderDetail.productDetails.product.name,
          variantName: orderDetail.productDetails.variant.name,
          qty: orderDetail.qty,
        })),
      };
    });
    return response.status(200).json(convertedOrder);
  }
}
