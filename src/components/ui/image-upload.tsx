'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, Loader2, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ImageSelector } from '@/components/ui/image-selector'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  className?: string
  folder?: string
}

export function ImageUpload({ value, onChange, label = "Featured Image", className = "", folder = "blog-images" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Try direct Supabase upload first
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${folder}/${fileName}`

        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        setPreview(publicUrl)
        onChange(publicUrl)
        return

      } catch (directUploadError) {
        console.log('Direct upload failed, trying API route:', directUploadError)
        
        // Fallback to API route
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        setPreview(result.url)
        onChange(result.url)
      }

    } catch (error) {
      console.error('Error uploading file:', error)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleManualUrlChange = (url: string) => {
    setPreview(url)
    onChange(url)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      {/* Image Preview */}
      {preview && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => setPreview(null)}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowImageSelector(true)}
            className="flex-1"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Choose Existing
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </>
            )}
          </Button>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-sm text-gray-500">
          Or enter image URL manually:
        </div>
        
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => handleManualUrlChange(e.target.value)}
        />
      </div>

      <div className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
      </div>

      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={(url) => {
          setPreview(url)
          onChange(url)
        }}
        currentValue={value}
      />
    </div>
  )
}
