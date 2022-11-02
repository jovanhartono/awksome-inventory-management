import type { NextApiRequest, NextApiResponse } from "next";
import { OrderInput } from "types/dto";
import { prisma } from "prisma/config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    const body = request.body as OrderInput;
    try {
      await prisma.order.create({
        data: {
          createdAt: body.date,
          detail: {
            create: body.orderDetail.map(({ productId, variantId, qty }) => {
              return {
                qty,
                productDetails: {
                  connect: {
                      productDetailCompositeID: {
                          productId,
                          variantId
                      }
                  },
                },
              };
            }),
          },
        },
      });
      response.status(200).send("ok");
    } catch (e) {
      console.log(e);
      response.status(500).send("error");
    }
  }
}
