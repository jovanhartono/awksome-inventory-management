import type {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from "../../prisma/config";
import {nanoid} from "nanoid";
import {ProductInputForm} from "../../types/dto";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'POST') {
        const {name, details}: ProductInputForm = request.body as ProductInputForm;
        const productId = `PR-${nanoid(5)}`;

        const product = await prisma.product.create({
            data: {
                id: productId,
                name,
                productDetail: {
                    create: details.map(({qty, variantId, price}) => {
                        return {
                            id: `PRD-${nanoid(5)}`,
                            qty,
                            price,
                            variant: {
                                connect: {
                                    id: variantId
                                }
                            }
                        }
                    })
                }
            }
        });

        response.status(200).json(product);
    } else {
        response.status(404).send('Method not allowed!');
    }
}
