import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, Character } from '@/lib/supabase'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

interface CharacterManagerProps {
  onSelectCharacter?: (character: Character) => void;
}

export function CharacterManager({ onSelectCharacter }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCharacters()
    }
  }, [open])

  const fetchCharacters = async () => {
    try {
      console.log('Fetching characters...')
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }

      console.log('Characters fetched successfully:', data)
      setCharacters(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching characters:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleCharacterClick = (character: Character) => {
    if (onSelectCharacter) {
      onSelectCharacter(character);
      setOpen(false); // Close the dialog after selection
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (isDeleting) return; // Prevent multiple delete attempts
    
    setIsDeleting(characterId);
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;

      // Update the local state to remove the deleted character
      setCharacters(prev => prev.filter(char => char.id !== characterId));
    } catch (err) {
      console.error('Error deleting character:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Character Manager</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Character Manager</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {characters.map((character) => (
            <div 
              key={character.id} 
              className={`border rounded-lg p-4 ${onSelectCharacter ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''}`}
              onClick={() => !isDeleting && handleCharacterClick(character)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{character.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCharacter(character.id);
                  }}
                  disabled={isDeleting === character.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative aspect-square w-full">
                <Image
                  src={`data:image/png;base64,${character.image_data}`}
                  alt={character.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Created: {new Date(character.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {characters.length === 0 && !error && (
            <div className="col-span-2 text-center text-gray-500">
              No characters saved yet. Generate and save some characters to see them here.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 