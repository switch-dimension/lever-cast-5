"use client"

import { useState } from "react"
import { ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageUploadProps {
  onImageChange: (image: string | null) => void
}

export function ImageUpload({ onImageChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setPreview(imageUrl)
        onImageChange(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setPreview(null)
    onImageChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Add Image</label>
      {!preview ? (
        <Card className="p-4 border-dashed">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload an image
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </Card>
      ) : (
        <div className="relative">
          <Card className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          </Card>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 