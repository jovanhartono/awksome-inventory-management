import {NextApiRequest, NextApiResponse} from "next";
import {prisma} from "prisma/config";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const {id: productId} = request.query as { id: string };
    console.log(productId);

    const changes = [
        {
            id: '1',
            price: 10000,
            qty: 1
        },
        {
            id: '2',
            price: 20000,
            qty: 2
        },
        {
            id: '3',
            price: 30000,
            qty: 3
        }
    ]

    if (request.method === 'PUT') {
        await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: 'updated name',
                productDetail: {
                    deleteMany: {
                        id: {notIn: ['1', '2', '3']}
                    },
                    upsert: changes.map((value) => {
                        return {
                            where: {
                                id: value.id
                            },
                            create: {
                                price: 10,
                                qty: 5,
                                variant: {
                                    connect: {
                                        id: '1'
                                    }
                                }
                            },
                            update: {
                                qty: value.qty,
                                price: value.price
                            }
                        }
                    })
                }
            }
        });

        console.log('success');
    }

    response.status(200).send('ok');
}
