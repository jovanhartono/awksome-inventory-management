import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // TODO implement in the future
  // if (request.query.secret !== process.env.REVALIDATE_TOKEN) {
  //     return response.status(401).json({ message: "Invalid token" });
  // }

  try {
    await response.revalidate(`/order`);
    return response.json({ revalidated: true });
  } catch (err) {
    return response.status(500).send("Error revalidating");
  }
}
