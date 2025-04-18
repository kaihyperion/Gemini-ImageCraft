// node.js image generation logic here
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';


// TypeScript Types for the response object to ensure type safety 



export async function generateOneImageFromText(prompt: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Add portrait aspect ratio specification to the prompt
    const enhancedPrompt = `${prompt}. Please make sure the aspect ratio is 16:9 and there is no text/characters in the image`;

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

export async function addCharacterNameToPortrait(base64Image: string, characterName: string): Promise<string> {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Create a new image with text overlay
    const image = sharp(imageBuffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    const width = metadata.width || 384;
    const height = metadata.height || 384;
    
    // Create SVG text overlay with background
    const svgText = `
        <svg width="${width}" height="${height}">
            <style>
                .title { fill: white; font-size: 24px; font-weight: bold; }
                .background { fill: rgba(0, 0, 0, 0.5); }
            </style>
            <rect x="0" y="0" width="${width}" height="40" class="background" />
            <text x="10" y="30" class="title">${characterName}</text>
        </svg>
    `;
    
    // Composite the text onto the image
    const processedBuffer = await image
        .composite([{
            input: Buffer.from(svgText),
            top: 0,
            left: 0,
        }])
        .toBuffer();
    
    return processedBuffer.toString('base64');
}

export async function generateOneImageFromImage(baseImages: string | string[], prompt?: string, characterNames?: string[]) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Convert single image to array for consistent handling
    const imagesArray = Array.isArray(baseImages) ? baseImages : [baseImages];
    const namesArray = characterNames || imagesArray.map((_, i) => `Character ${i + 1}`);
    
    console.log(`Processing ${imagesArray.length} base image(s)`);
    console.log(`Character names: ${namesArray.join(', ')}`);
    
    // Process all images
    const processedImages = await Promise.all(imagesArray.map(async (baseImage, index) => {
        console.log(`Processing base image ${index + 1}/${imagesArray.length} for character ${namesArray[index]}`);
        
        // Remove the data URL prefix if present
        const base64Image = baseImage.replace(/^data:image\/\w+;base64,/, '');
        
        // Add character name to the image
        const imageWithName = await addCharacterNameToPortrait(base64Image, namesArray[index]);
        
        // Compress the image
        const compressedImage = await compressImage(imageWithName);
        console.log(`Base image ${index + 1} processed successfully`);
        return compressedImage;
    }));

    console.log(`All ${processedImages.length} images processed successfully`);

    // Create contents array with prompt and all images
    const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        {
            text: prompt || "Keep the 16:9 aspect ratio."
        }
    ];
    
    // Add all processed images to the contents array
    processedImages.forEach((compressedImage, index) => {
        console.log(`Adding processed image ${index + 1} to contents array`);
        contents.push({
            inlineData: {
                mimeType: "image/png",
                data: compressedImage
            }
        });
    });

    console.log(`Sending request to Gemini API with ${contents.length} content items (1 prompt + ${processedImages.length} images)`);

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contents,
        config: {
            responseModalities: ["Text", "Image"]
        },
    });

    console.log("Received response from Gemini API");

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log("Text part from response:", part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;  // base64-encoded string
                if (imageData) {
                    console.log("Image data received successfully");
                    return `data:image/png;base64,${imageData}`;
                } else {
                    console.error("Image data is undefined in response");
                    throw new Error("Image data is undefined");
                }
            }
        }
    }
    
    console.error("No valid image data found in response");
}

async function compressImage(base64Image: string): Promise<string> {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Use sharp to compress the image
    // Resize to optimal dimensions for Gemini token calculation
    // Using 384x384 as the maximum dimension to stay within the 258 token limit
    const compressedBuffer = await sharp(imageBuffer)
        .resize(384, 384, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 80 }) // Compress PNG
        .toBuffer();
    
    // Convert back to base64
    return compressedBuffer.toString('base64');
}

