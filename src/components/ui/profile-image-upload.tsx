'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageSelector } from '@/components/ui/image-selector'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload, X, User } from 'lucide-react'
import Image from 'next/image'

interface ProfileImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  className?: string
}

export function ProfileImageUpload({ 
  value, 
  onChange, 
  disabled = false,
  className = '' 
}: ProfileImageUploadProps) {
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageSelect = (url: string) => {
    onChange(url)
    setIsImageSelectorOpen(false)
  }

  const handleImageUpload = (url: string) => {
    onChange(url)
  }

  const handleRemoveImage = () => {
    onChange(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Profile Image Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {value ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={value}
                alt="Profile"
                fill
                className="object-cover"
                sizes="128px"
              />
              {!disabled && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {!disabled && (
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Upload New Image */}
            <ImageUpload
              value={value || ''}
              onChange={handleImageUpload}
              label="Upload New Image"
              className="w-full sm:w-auto"
              folder="profile-images"
            />

            {/* Select Existing Image */}
            <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Existing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Choose Profile Image</DialogTitle>
                  <DialogDescription>
                    Select an existing image from your gallery or upload a new one.
                  </DialogDescription>
                </DialogHeader>
                <ImageSelector
                  isOpen={isImageSelectorOpen}
                  onSelect={handleImageSelect}
                  onClose={() => setIsImageSelectorOpen(false)}
                  folder="profile-images"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Image Preview Card */}
      {value && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={value}
                  alt="Profile preview"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Profile Image</p>
                <p className="text-xs text-gray-500 truncate">
                  {value.split('/').pop()}
                </p>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
