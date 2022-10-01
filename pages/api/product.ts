// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from"../../prisma/config";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET'){
        const products = await prisma.product.findMany();

        response.status(200).json(products);
    }
}
