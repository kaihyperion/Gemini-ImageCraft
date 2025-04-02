// This is API route (server side)
import type { NextApiRequest, NextApiResponse } from "next";
import { generateOneImageFromText } from "@/utils/image-generator";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const imageData = await generateOneImageFromText(prompt);
        res.status(200).json({ image: imageData });
    } catch (err) {
        res.status(500).json({ message: 'Image generation failed', error: err })
    }
}