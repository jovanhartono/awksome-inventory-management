import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.query.secret !== process.env.REVALIDATE_TOKEN) {
        return response.status(401).json({ message: "Invalid token" });
    }

    try {
        const { productId } = request.body;
        await response.revalidate(`/product/${productId}`);
        return response.json({ revalidated: true });
    } catch (err) {
        return response.status(500).send("Error revalidating");
    }
}
