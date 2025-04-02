import type { NextApiRequest, NextApiResponse } from "next";
import { generateOneImageFromImage } from "@/utils/image-generator";

// Increase the body size limit to 10MB
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb'
        }
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }

    try {
        const { baseImage } = req.body;
        if (!baseImage) {
            return res.status(400).json({ message: 'Base image is required' });
        }

        // Generate three new variations of the selected image
        const imagePromises = Array(3).fill(null).map(() => generateOneImageFromImage(baseImage));
        const images = await Promise.all(imagePromises);

        res.status(200).json({ images });
    } catch (err) {
        res.status(500).json({ message: 'Image generation failed', error: err })
    }
} 