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
        const { baseImages, prompt } = req.body;
        
        console.log(`API request received with ${Array.isArray(baseImages) ? baseImages.length : 1} base image(s)`);
        console.log(`baseImages type: ${typeof baseImages}, isArray: ${Array.isArray(baseImages)}`);
        if (Array.isArray(baseImages)) {
            console.log(`baseImages array length: ${baseImages.length}`);
            console.log(`First image data length: ${baseImages[0]?.length || 0}`);
        }
        
        if (!baseImages || (Array.isArray(baseImages) && baseImages.length === 0)) {
            console.error("No base images provided in request");
            return res.status(400).json({ message: 'At least one base image is required' });
        }

        // Generate a new variation of the image with the provided prompt
        console.log("Calling generateOneImageFromImage function");
        const image = await generateOneImageFromImage(baseImages, prompt);
        console.log("Image generation completed successfully");

        res.status(200).json({ image });
    } catch (err) {
        console.error('Error generating image:', err);
        res.status(500).json({ message: 'Image generation failed', error: err });
    }
} 