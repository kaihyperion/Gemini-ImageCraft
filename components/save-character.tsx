import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface SaveCharacterProps {
  imageData: string
}

export function SaveCharacter({ imageData }: SaveCharacterProps) {
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    setError(null)
    try {
      // First, process the image with the character name
      const processResponse = await fetch("/api/process-image-with-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          characterName: name.trim(),
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const { image: processedImageData } = await processResponse.json();
      setProcessedImage(processedImageData);

      // Remove the data URL prefix to get just the base64 data
      const base64Data = processedImageData.replace(/^data:image\/\w+;base64,/, "")

      const { error: supabaseError } = await supabase
        .from("characters")
        .insert([
          {
            name: name.trim(),
            image_data: base64Data,
          },
        ])

      if (supabaseError) throw supabaseError

      toast.success("Character saved successfully!");
      setName("")
      setProcessedImage(null)
    } catch (error) {
      console.error("Error saving character:", error)
      setError(error instanceof Error ? error.message : 'Failed to save character')
      toast.error(error instanceof Error ? error.message : 'Failed to save character')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Character name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-[200px]"
        />
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
        >
          {isSaving ? "Saving..." : "Save Character"}
        </Button>
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}
      {processedImage && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Preview with character name:</p>
          <img 
            src={processedImage} 
            alt={`${name} preview`} 
            className="max-w-[200px] rounded-md"
          />
        </div>
      )}
    </div>
  )
} 