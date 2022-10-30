import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/config";
import { ProductDTO } from "types/dto";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id: productId } = request.query as { id: string };

  if (request.method === "DELETE") {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    response.status(200).send("Delete product success");
  } else if (request.method === "PUT") {
    const { name: productName, details }: ProductDTO = request.body;
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: productName,
        productDetail: {
          deleteMany: {
            variantId: { notIn: details.map(({ variantId }) => variantId) },
          },
          upsert: details.map(({ variantId, qty, price }) => {
            return {
              where: {
                productDetailCompositeID: { variantId, productId },
              },
              update: { qty, price },
              create: {
                qty,
                price,
                variant: {
                  connect: {
                    id: variantId,
                  },
                },
              },
            };
          }),
        },
      },
    });

    response.status(200).send("Successfully update product.");
  } else {
    response.status(404).send("Method not allowed!");
  }
}
