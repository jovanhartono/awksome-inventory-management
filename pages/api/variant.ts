import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/config";
import { Variant as PrismaVariant } from "@prisma/client";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    const variants: PrismaVariant[] = await prisma.variant.findMany({
      orderBy: {
        name: "asc",
      },
    });

    response.status(200).json(variants);
  }
}
