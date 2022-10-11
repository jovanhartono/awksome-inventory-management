import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // Check for secret to confirm this is a valid request
    if (request.query.secret !== process.env.REVALIDATE_TOKEN) {
        return response.status(401).json({ message: 'Invalid token' })
    }

    try {
        const {path} = request.body;

        // this should be the actual path not a rewritten path
        // e.g. for "/blog/[slug]" this should be "/blog/post-1"
        await response.revalidate(`/${path}`);
        return response.json({ revalidated: true })
    } catch (err) {
        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        return response.status(500).send('Error revalidating')
    }
}
