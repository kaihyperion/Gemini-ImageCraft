import type { NextApiRequest, NextApiResponse } from "next";
import { addCharacterNameToPortrait } from "@/utils/image-generator";

// Increase the body size limit to 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { imageData, characterName } = req.body;
        
        if (!imageData || !characterName) {
            return res.status(400).json({ message: 'Image data and character name are required' });
        }

        console.log('Processing image with name:', characterName);
        console.log('Image data length:', imageData.length);
        
        // Remove the data URL prefix if present
        const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');
        console.log('Base64 image length after prefix removal:', base64Image.length);
        
        try {
            // Process the image with the character name
            const processedImage = await addCharacterNameToPortrait(base64Image, characterName);
            console.log('Image processed successfully');
            
            res.status(200).json({ 
                image: `data:image/png;base64,${processedImage}` 
            });
        } catch (processError) {
            console.error('Error in addCharacterNameToPortrait:', processError);
            throw processError;
        }
    } catch (err) {
        console.error('Error processing image:', err);
        res.status(500).json({ 
            message: 'Image processing failed', 
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined
        });
    }
} 