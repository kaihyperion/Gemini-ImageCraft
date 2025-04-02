import type { NextApiRequest, NextApiResponse } from "next";
import { generateOneImageFromImage } from "@/utils/image-generator";

// Increase the body size limit to handle large image uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb'
        }
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { baseImage, prompt } = req.body;
        
        if (!baseImage) {
            return res.status(400).json({ message: 'Base image is required' });
        }

        // Generate a new variation of the image with the provided prompt
        const image = await generateOneImageFromImage(baseImage, prompt);

        res.status(200).json({ image });
    } catch (err) {
        console.error('Error generating image:', err);
        res.status(500).json({ message: 'Image generation failed', error: err });
    }
} 