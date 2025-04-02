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

interface ImageGenerationDrawerProps {
  onGenerate: (prompt: string, baseImage?: string) => Promise<void>;
  triggerText?: string;
}

export function ImageGenerationDrawer({
  onGenerate,
  triggerText = "Generate Image",
}: ImageGenerationDrawerProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      await onGenerate(prompt, selectedImage || undefined);
      setPrompt("");
      setSelectedImage(null);
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
                Enter a prompt and optionally upload an image to generate variations.
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
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {selectedImage && (
                  <div className="mt-2">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-w-[200px] h-auto rounded-md"
                    />
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