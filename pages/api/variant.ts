import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    const variants = await prisma.variant.findMany();

    response.status(200).json(variants);
  }
}
