import type { NextApiRequest, NextApiResponse } from "next";
import { OrderInput } from "types/dto";
import { prisma } from "prisma/config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    const body = request.body as OrderInput;
    let flag: boolean = false;

    try {
      await Promise.all(
        body.orderDetail.map(async ({ productId, variantId, qty }) => {
          const product = await prisma.productDetail.findUnique({
            where: {
              productDetailCompositeID: {
                productId,
                variantId,
              },
            },
          });

          if (!product) {
            return;
          }

          if (product.qty < qty) {
            flag = true;
          }
        })
      );

      if (flag) {
        throw new Error("");
      }

      for (const { productId, variantId, qty } of body.orderDetail) {
        await prisma.productDetail.update({
          where: {
            productDetailCompositeID: {
              productId,
              variantId,
            },
          },
          data: {
            qty: {
              decrement: qty,
            },
          },
        });
      }

      await prisma.order.create({
        data: {
          createdAt: body.date,
          detail: {
            create: body.orderDetail.map(({ productId, variantId, qty }) => ({
              qty,
              productDetails: {
                connect: {
                  productDetailCompositeID: {
                    productId,
                    variantId,
                  },
                },
              },
            })),
          },
        },
      });

      response.status(200).send("ok");
    } catch (e) {
      response.status(500).send("Product quantity must be lower!");
    }
  }
}
