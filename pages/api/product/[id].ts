import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/config";
import { ProductDTO } from "types/dto";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id: productId } = request.query as { id: string };

  if (request.method === "GET") {
    try {
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          name: true,
          productDetail: {
            include: {
              variant: true,
            },
            where: {
              isDeleted: false,
            },
          },
        },
      });

      if (product && product.productDetail.length < 0) {
        throw new Error("Not Found");
      }

      response.status(200).json(product);
    } catch (e) {
      response.status(500).send("ERROR");
    }
  } else if (request.method === "DELETE") {
    await prisma.productDetail.updateMany({
      where: {
        productId,
      },
      data: {
        isDeleted: true,
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
          upsert: details.map(({ variantId, qty, price }) => {
            return {
              where: {
                productDetailCompositeID: { variantId, productId },
              },
              update: { qty, price, isDeleted: false },
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

    await prisma.productDetail.updateMany({
      where: {
        productId,
        variantId: { notIn: details.map(({ variantId }) => variantId) },
      },
      data: {
        isDeleted: true,
      },
    });

    response.status(200).send("Successfully update product.");
  } else {
    response.status(404).send("Method not allowed!");
  }
}
