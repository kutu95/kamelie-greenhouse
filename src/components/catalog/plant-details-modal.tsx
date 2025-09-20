'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Leaf, Calendar, Ruler, Package, Euro, ShoppingCart, Heart } from 'lucide-react'
import { Plant } from '@/lib/supabase/plants'
import Image from 'next/image'

interface PlantDetailsModalProps {
  plant: Plant | null
  isOpen: boolean
  onClose: () => void
  locale: string
}

export function PlantDetailsModal({ plant, isOpen, onClose, locale }: PlantDetailsModalProps) {
  if (!isOpen || !plant) return null

  const isGerman = locale === 'de'
  const featuredPhoto = plant.photos?.find(photo => photo.is_primary) || plant.photos?.[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {plant.cultivar.cultivar_name}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                {featuredPhoto && featuredPhoto.photo_url ? (
                  <Image
                    src={featuredPhoto.photo_url}
                    alt={isGerman ? featuredPhoto.alt_text_de : featuredPhoto.alt_text_en}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Leaf className="h-24 w-24 text-green-600 mx-auto mb-4" />
                      <p className="text-green-700 font-medium text-lg">
                        {isGerman ? 'Kamelie' : 'Camellia'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Photos */}
              {plant.photos && plant.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {plant.photos.slice(1, 5).map((photo, index) => (
                    <div key={index} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={photo.photo_url}
                        alt={isGerman ? photo.alt_text_de : photo.alt_text_en}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plant.cultivar.species.scientific_name}
                </h3>
                {plant.cultivar.special_characteristics && (
                  <p className="text-gray-600 mb-4">
                    {plant.cultivar.special_characteristics}
                  </p>
                )}

                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {plant.is_quick_buy && (
                    <Badge className="bg-green-600 text-white">
                      {isGerman ? 'Schnellkauf' : 'Quick Buy'}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {plant.price_band}
                  </Badge>
                </div>
              </div>

              {/* Plant Details */}
              <div className="grid grid-cols-2 gap-4">
                {plant.cultivar.flower_color && (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-gradient-to-r from-pink-400 to-red-400"></div>
                    <div>
                      <p className="text-sm text-gray-500">{isGerman ? 'Blütenfarbe' : 'Flower Color'}</p>
                      <p className="font-medium">{plant.cultivar.flower_color}</p>
                    </div>
                  </div>
                )}

                {plant.cultivar.flower_form && (
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{isGerman ? 'Blütenform' : 'Flower Form'}</p>
                      <p className="font-medium">{plant.cultivar.flower_form}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{isGerman ? 'Alter' : 'Age'}</p>
                    <p className="font-medium">{plant.age_years} {isGerman ? 'Jahre' : 'years'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Ruler className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{isGerman ? 'Höhe' : 'Height'}</p>
                    <p className="font-medium">{plant.height_cm} cm</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{isGerman ? 'Topf' : 'Pot'}</p>
                    <p className="font-medium">{plant.pot_size}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Euro className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{isGerman ? 'Preis' : 'Price'}</p>
                    <p className="font-medium text-green-600">€{plant.price_euros.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Plant Code */}
              <div>
                <p className="text-sm text-gray-500">{isGerman ? 'Pflanzen-Code' : 'Plant Code'}</p>
                <p className="font-mono text-lg">{plant.plant_code}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-500">{isGerman ? 'Status' : 'Status'}</p>
                <Badge 
                  variant={plant.status === 'available' ? 'default' : 'secondary'}
                  className={plant.status === 'available' ? 'bg-green-600 text-white' : ''}
                >
                  {isGerman 
                    ? (plant.status === 'available' ? 'Verfügbar' : 'Nicht verfügbar')
                    : (plant.status === 'available' ? 'Available' : 'Unavailable')
                  }
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  {isGerman ? 'Zu Favoriten' : 'Add to Favorites'}
                </Button>
                <Button className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isGerman ? 'In den Warenkorb' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
