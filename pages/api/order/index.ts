import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../prisma/config";
import dayjs from "dayjs";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method === "POST") {
        const variants = await prisma.order.create({
            data: {
                createdAt: dayjs(Date.now()).toDate()
            }
        });

        response.status(200).json(variants);
    }
}
