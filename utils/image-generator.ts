// node.js image gneerationl logic here
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';


// TypeScript Types for the response object to ensure type safety 



export async function generateOneImageFromText(prompt: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

    // Add portrait aspect ratio specification to the prompt
    const enhancedPrompt = `${prompt}, portrait orientation, vertical composition, aspect ratio 2:3, full body shot`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: enhancedPrompt,
        config: {
            responseModalities: ["Text", "Image"]
        },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;  // base64-enccoded string
                if (imageData) {
                    return `data:image/png;base64,${imageData}`;
                } else {
                    throw new Error("Image data is undefined");
                }
            }
        }
    }
}

export async function generateOneImageFromImage(baseImage: string, prompt?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

    // Remove the data URL prefix if present
    const base64Image = baseImage.replace(/^data:image\/\w+;base64,/, '');

    // Compress the image by reducing its quality
    const compressedImage = await compressImage(base64Image);

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: [
            {
                text: prompt || "Generate a variation of this image while maintaining the same style and subject, but with slight differences in pose, expression, or background. Keep the portrait orientation and 2:3 aspect ratio."
            },
            {
                inlineData: {
                    mimeType: "image/png",
                    data: compressedImage
                }
            }
        ],
        config: {
            responseModalities: ["Text", "Image"]
        },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;  // base64-encoded string
                if (imageData) {
                    return `data:image/png;base64,${imageData}`;
                } else {
                    throw new Error("Image data is undefined");
                }
            }
        }
    }
}

async function compressImage(base64Image: string): Promise<string> {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Use sharp to compress the image
    const compressedBuffer = await sharp(imageBuffer)
        .resize(800, 1200, { // Maintain 2:3 aspect ratio
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 80 }) // Compress PNG
        .toBuffer();
    
    // Convert back to base64
    return compressedBuffer.toString('base64');
}

