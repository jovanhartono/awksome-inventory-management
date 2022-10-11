import {NextApiRequest, NextApiResponse} from "next";

export default function handler (request: NextApiRequest, response: NextApiResponse) {
    const {id: productId} = request.query as {id: string};
    console.log(productId);

    response.status(200).send('ok');
}
