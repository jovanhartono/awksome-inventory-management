import { prisma } from "prisma/config";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id: orderId } = request.query as { id: string };
  if (request.method === "DELETE") {
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isDeleted: true,
      },
    });
    return response.status(200).json("OK");
  }
}
