import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/config";
import { ProductDTO } from "types/dto";
import axios from "axios";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id: productId } = request.query as { id: string };

  if (request.method === "DELETE") {
      await prisma.product.delete({
          where: {
              id: productId
          }
      })

      response.status(200).send("Delete product success");
  }

  else if (request.method === "PUT") {
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

    const revalidatePath: string[] = ["product", "order"];

    await Promise.all([
      revalidatePath.map((path: string) => {
        axios.post(
          `${process.env.HOST}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`,
          { path }
        );
      }),
      axios.post(
        `${process.env.HOST}/api/product/${productId}/revalidate?secret=${process.env.REVALIDATE_TOKEN}`,
        {
          productId,
        }
      ),
    ]);

    await response.status(200).send("Successfully update product.");
  } else {
    response.status(404).send("Method not allowed!");
  }
}
