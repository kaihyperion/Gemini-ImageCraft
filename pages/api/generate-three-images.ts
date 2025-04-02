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

        // Generate three images with the same prompt
        const imagePromises = Array(3).fill(null).map(() => generateOneImageFromText(prompt));
        const images = await Promise.all(imagePromises);

        res.status(200).json({ images });
    } catch (err) {
        res.status(500).json({ message: 'Image generation failed', error: err })
    }
}