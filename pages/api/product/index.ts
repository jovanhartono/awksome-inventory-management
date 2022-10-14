import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/config";
import { nanoid } from "nanoid";
import { ProductDTO } from "../../../types/dto";
import axios from "axios";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<string>
) {
  if (request.method === "POST") {
    const { name, details }: ProductDTO = request.body as ProductDTO;
    const productId = `PR-${nanoid(5)}`;

    try {
      await prisma.product.create({
        data: {
          id: productId,
          name,
          productDetail: {
            create: details.map(({ qty, variantId, price }) => {
              return {
                id: `PRD-${nanoid(5)}`,
                qty,
                price,
                variant: {
                  connect: {
                    id: variantId,
                  },
                },
              };
            }),
          },
        },
      });

      const revalidatePath: string[] = ["product", "order"];

      await Promise.all(
        revalidatePath.map((path: string) => {
          axios.post(
            `${process.env.HOST}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`,
            { path }
          );
        })
      );

      response.status(201).send("Successfully created product.");
    } catch (e) {
      response.status(409).send("Identifier conflict when creating product.");
    }
  } else {
    response.status(404).send("Method not allowed!");
  }
}
