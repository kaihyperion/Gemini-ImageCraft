"use client";
// Generate a portrait of a character with the following information:
// looks like: Amy Adams, Julianne Moore, Naomi Watts
// gender: female
// age range: late 30s
// ethnicity: white
// Description: A driven and ambitious news anchor, secretly the leader of a vigilante group called 'Scarlet Fever'. She is intelligent and capable, but also ruthless when necessary.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface ImageGenerationDrawerProps {
  onGenerate: (prompt: string, baseImage?: string) => Promise<void>;
  onAddBaseImage?: (image: string) => void;
  triggerText?: string;
}

export function ImageGenerationDrawer({
  onGenerate,
  onAddBaseImage,
  triggerText = "Generate Image",
}: ImageGenerationDrawerProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log(`${files.length} image file(s) selected`);
      
      // Process each file
      Array.from(files).forEach((file, index) => {
        console.log(`Processing file ${index + 1}/${files.length}: ${file.name}, size: ${file.size} bytes`);
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageData = reader.result as string;
          console.log(`File ${index + 1} loaded successfully`);
          
          // Add to selected images
          setSelectedImages(prev => {
            const newImages = [...prev, imageData];
            console.log(`Selected images updated, now have ${newImages.length} images`);
            return newImages;
          });
          
          // If onAddBaseImage is provided, add the image to the base images
          if (onAddBaseImage) {
            console.log(`Adding image ${index + 1} to base images collection`);
            onAddBaseImage(imageData);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveSelectedImage = (index: number) => {
    console.log(`Removing selected image at index ${index}`);
    setSelectedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log(`Selected images updated, now have ${newImages.length} images`);
      return newImages;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    console.log(`Generating image with prompt: "${prompt}"`);
    console.log(`Selected images: ${selectedImages.length}`);
    
    setIsLoading(true);
    try {
      console.log("Calling onGenerate function");
      // Pass all selected images to onGenerate
      await onGenerate(prompt, selectedImages.length > 0 ? selectedImages[0] : undefined);
      console.log("Image generation completed");
      setPrompt("");
      setSelectedImages([]);
      console.log("Form reset");
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>{triggerText}</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Generate Image</DrawerTitle>
            <div className="space-y-4">
              <DrawerDescription>
                Enter a prompt and optionally upload images to generate variations.
              </DrawerDescription>
              <div className="text-sm space-y-2">
                <span>Create detailed images by following these prompt guidelines:</span>
                <ul className="list-disc pl-4 space-y-2 text-sm">
                  <li><strong>Character Description:</strong> Start with the basic details (age, gender, species, etc.)</li>
                  <li><strong>Physical Features:</strong> Include specific details about appearance (hair, eyes, height, etc.)</li>
                  <li><strong>Style & Mood:</strong> Specify the art style and emotional tone</li>
                  <li><strong>Pose & Expression:</strong> Describe the character&apos;s pose and facial expression</li>
                  <li><strong>Environment:</strong> Mention the setting or background if relevant</li>
                  <li><strong>Additional Details:</strong> Add any unique features or accessories</li>
                </ul>
                <span className="text-sm italic block">Example:  &quot;Generate a portrait of a character with the following information:<br />
looks like: Amy Adams, Julianne Moore, Naomi Watts<br />
gender: female<br />
age range: late 30s<br />
ethnicity: white<br />
Description: A driven and ambitious news anchor, secretly the leader of a vigilante group called &apos;Scarlet Fever&apos;. She is intelligent and capable, but also ruthless when necessary.&quot;</span>
              </div>
            </div>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your character in detail..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Images (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {selectedImages.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Selected ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-auto object-contain rounded-md"
                        />
                        <button
                          onClick={() => handleRemoveSelectedImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 