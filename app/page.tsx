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

export default function Home() {
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [imageFromImage, setImageFromImage] = useState<string | null>(null);
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
    if (!baseImage) {
      console.error("No base image provided");
      return;
    }

    try {
      const response = await fetch("/api/generate-one-image-from-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseImage, prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setImageFromImage(data.image);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">AI Image Generator</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Generate Single Image from another image</h2>
            <ImageGenerationDrawer
              onGenerate={handleGenerateSingleImageFromImage}
              triggerText="Generate Image from Image"
            />
            {imageFromImage && (
              <div className="mt-4">
                <Image src={imageFromImage} alt="Generated" width={400} height={400} className="max-w-[400px] w-full h-auto object-contain mx-auto" />
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
                <Image src={singleImage} alt="Generated" width={400} height={400} className="max-w-[400px] w-full h-auto object-contain mx-auto" />
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
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedImage === image ? 'ring-4 ring-blue-500' : ''
                            }`}
                            onClick={() => setSelectedImage(selectedImage === image ? null : image)}
                          >
                            <CardContent className="flex items-center justify-center p-6">
                              <Image
                                src={image}
                                alt={`Generated ${index + 1}`}
                                width={400}
                                height={400}
                                className="w-full h-auto object-contain"
                              />
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
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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