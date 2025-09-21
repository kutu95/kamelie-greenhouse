'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Search, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ImageSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentValue?: string
  folder?: string
}

interface ImageFile {
  name: string
  id: string
  updated_at: string
  publicUrl: string
}

export function ImageSelector({ isOpen, onClose, onSelect, currentValue, folder = "blog-images" }: ImageSelectorProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(currentValue || null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchImages()
    }
  }, [isOpen])

  const fetchImages = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/images?folder=${encodeURIComponent(folder)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.error) {
        console.error('Error fetching images:', data.error)
        throw new Error(data.error)
      }

      const imageFiles = data.images || []
      setImages(imageFiles)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        // Add to images list
        const newImage = {
          name: fileName,
          id: data.id,
          updated_at: new Date().toISOString(),
          publicUrl
        }
        setImages(prev => [newImage, ...prev])
        setSelectedImage(publicUrl)

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
        
        // Add to images list
        const newImage = {
          name: result.path.split('/').pop() || file.name,
          id: Date.now().toString(),
          updated_at: new Date().toISOString(),
          publicUrl: result.url
        }
        setImages(prev => [newImage, ...prev])
        setSelectedImage(result.url)
      }

    } catch (error) {
      console.error('Error uploading file:', error)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      onClose()
    }
  }

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Featured Image</DialogTitle>
          <DialogDescription>
            Choose an existing image or upload a new one for your blog post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Upload Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-images">Search Images</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search-images"
                  placeholder="Search by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('upload-new-image')?.click()}
                disabled={uploading}
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
              <Input
                id="upload-new-image"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Images Grid */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading images...</span>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No images found matching your search.' : 'No images uploaded yet.'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Upload your first image to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedImage === image.publicUrl
                        ? 'ring-2 ring-green-500 shadow-lg'
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedImage(image.publicUrl)}
                  >
                    <CardContent className="p-2">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image.publicUrl}
                          alt={image.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {selectedImage === image.publicUrl && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate" title={image.name}>
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(image.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedImage}
            className="bg-green-600 hover:bg-green-700"
          >
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
