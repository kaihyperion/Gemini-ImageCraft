"use client";

import { useState } from "react";
import { ImageGenerationDrawer } from "@/components/ImageGenerationDrawer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { CharacterManager } from "@/components/character-manager"
import { SaveCharacter } from "@/components/save-character"

export default function Home() {
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [imageFromImage, setImageFromImage] = useState<string | null>(null);
  const [baseImages, setBaseImages] = useState<string[]>([]);
  const [threeImages, setThreeImages] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerateSingleImage = async (prompt: string) => {
    try {
      const response = await fetch("/api/generate-one-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setSingleImage(data.image);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleGenerateSingleImageFromImage = async (prompt: string, baseImage?: string) => {
    if (!baseImage && baseImages.length === 0) {
      console.error("No base image provided");
      return;
    }

    console.log(`Generating image with prompt: "${prompt}"`);
    console.log(`Using ${baseImage ? 1 : baseImages.length} base image(s)`);
    
    // Create a new array with all images
    const imagesToUse = [...baseImages];
    
    // If a new image is uploaded, add it to the array
    if (baseImage && !imagesToUse.includes(baseImage)) {
      console.log("Adding newly uploaded image to imagesToUse array");
      imagesToUse.push(baseImage);
      
      // Also update the state for future use
      setBaseImages(imagesToUse);
    }
    
    console.log(`Sending ${imagesToUse.length} images to API`);

    try {
      console.log("Sending request to API");
      const response = await fetch("/api/generate-one-image-from-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          baseImages: imagesToUse, 
          prompt 
        }),
      });

      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        throw new Error("Failed to generate image");
      }

      console.log("API request successful, processing response");
      const data = await response.json();
      console.log("Response processed, setting generated image");
      setImageFromImage(data.image);
      console.log("Generated image set successfully");
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleGenerateThreeImages = async (prompt: string) => {
    try {
      const response = await fetch("/api/generate-three-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate images");
      }

      const data = await response.json();
      setThreeImages(data.images);
    } catch (error) {
      console.error("Error generating images:", error);
    }
  };

  const handleGenerateMoreImages = async (baseImage: string) => {
    try {
      const response = await fetch("/api/generate-more-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate more images");
      }

      const data = await response.json();
      setThreeImages(data.images);
      setSelectedImage(null); // Reset selection after generating new images
    } catch (error) {
      console.error("Error generating more images:", error);
    }
  };

  const handleAddBaseImage = (image: string) => {
    console.log("Adding new base image");
    setBaseImages(prev => {
      const newImages = [...prev, image];
      console.log(`Base images updated, now have ${newImages.length} images`);
      return newImages;
    });
  };

  const handleRemoveBaseImage = (index: number) => {
    console.log(`Removing base image at index ${index}`);
    setBaseImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log(`Base images updated, now have ${newImages.length} images`);
      return newImages;
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Character Generator</h1>
          <CharacterManager />
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Generate Single Image from another image</h2>
            <ImageGenerationDrawer
              onGenerate={handleGenerateSingleImageFromImage}
              onAddBaseImage={handleAddBaseImage}
              triggerText="Generate Image from Image"
            />
            {baseImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-medium mb-2">Base Images:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {baseImages.map((image, index) => (
                    <div key={index} className="relative">
                      <Image 
                        src={image} 
                        alt={`Base ${index + 1}`} 
                        width={200} 
                        height={112} 
                        className="w-full h-auto object-contain rounded-md" 
                      />
                      <button
                        onClick={() => handleRemoveBaseImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {imageFromImage && (
              <div className="mt-4">
                <h3 className="text-xl font-medium mb-2">Generated Image:</h3>
                <Image src={imageFromImage} alt="Generated" width={400} height={225} className="w-full h-auto object-contain mx-auto" />
                <SaveCharacter imageData={imageFromImage} />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Generate Single Image</h2>
            <ImageGenerationDrawer
              onGenerate={handleGenerateSingleImage}
              triggerText="Generate Single Image"
            />
            {singleImage && (
              <div className="mt-4">
                <Image src={singleImage} alt="Generated" width={400} height={225} className="w-full h-auto object-contain mx-auto" />
                <SaveCharacter imageData={singleImage} />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Generate Three Images</h2>
            <ImageGenerationDrawer
              onGenerate={handleGenerateThreeImages}
              triggerText="Generate Three Images"
            />
            {threeImages && (
              <div className="mt-4">
                <Carousel className="w-full max-w-[400px] mx-auto">
                  <CarouselContent>
                    {threeImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card 
                            className={`cursor-pointer transition-all ${
                              selectedImage === image ? 'ring-4 ring-blue-500' : ''
                            }`}
                            onClick={() => setSelectedImage(selectedImage === image ? null : image)}
                          >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                              <Image
                                src={image}
                                alt={`Generated ${index + 1}`}
                                width={400}
                                height={225}
                                className="w-full h-auto object-contain"
                              />
                              <div className="mt-4">
                                <SaveCharacter imageData={image} />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                {selectedImage && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => handleGenerateMoreImages(selectedImage)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Generate More Like This
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 