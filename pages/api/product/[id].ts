import {NextApiRequest, NextApiResponse} from "next";
import {prisma} from "prisma/config";
import {ProductDTO} from "types/dto";
import axios from "axios";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const {id: productId} = request.query as { id: string };
    const {name: productName, details}: ProductDTO = request.body;

    if (request.method === 'PUT') {
        await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: productName,
                productDetail: {
                    deleteMany: {
                        variantId: {notIn: details.map(({variantId}) => variantId)}
                    },
                    upsert: details.map(({variantId, qty, price}) => {
                        return {
                            where: {
                                productDetailCompositeID: {variantId, productId}
                            },
                            update: {qty, price},
                            create: {
                                qty,
                                price,
                                variant: {
                                    connect: {
                                        id: variantId
                                    }
                                }
                            }
                        }
                    })
                }
            }
        });

        await axios.post(`${process.env.HOST}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`, {
            path: 'product'
        })

        await axios.post(`${process.env.HOST}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`, {
            path: 'order'
        })

        response.status(200).send('Successfully update product.');
    } else {
        response.status(404).send('Method not allowed!');
    }
}
