'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Leaf, ShoppingCart, Heart, Eye } from 'lucide-react'
import Image from 'next/image'
import { PlantDetailsModal } from './plant-details-modal'
import Link from 'next/link'
import { getCultivarPriceRange, formatPrice, getPriceGroupDescription } from '@/lib/supabase/pricing'
import { PriceRange } from '@/lib/supabase/pricing'

interface Cultivar {
  id: string
  cultivar_name: string
  flower_color: string
  flower_form: string
  flower_size?: string
  foliage_type?: string
  growth_habit?: string
  special_characteristics?: string
  hardiness_rating?: number
  price_group?: string
  photo_url?: string
  photo_alt_text_de?: string
  photo_alt_text_en?: string
  species: {
    id: string
    scientific_name: string
    common_name_de: string
    common_name_en?: string
  }
}

interface CultivarCardProps {
  cultivar: Cultivar
  locale: string
}

export function CultivarCard({ cultivar, locale }: CultivarCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const isGerman = locale === 'de'

  // Load price range when component mounts
  useEffect(() => {
    async function loadPriceRange() {
      if (cultivar.price_group) {
        try {
          const range = await getCultivarPriceRange(cultivar.price_group as 'A' | 'B' | 'C')
          setPriceRange(range)
        } catch (error) {
          console.error('Error loading price range:', error)
        } finally {
          setLoadingPrice(false)
        }
      } else {
        setLoadingPrice(false)
      }
    }
    
    loadPriceRange()
  }, [cultivar.price_group])

  // Create a mock plant object for the modal (since PlantDetailsModal expects a plant)
  const mockPlant = {
    id: parseInt(cultivar.id),
    cultivar_id: parseInt(cultivar.id),
    cultivar: cultivar,
    photos: [], // Photos are accessed via cultivar.photos in the modal
    status: 'available' as const,
    age_years: null,
    height_cm: null,
    width_cm: null,
    pot_size: null,
    plant_code: '',
    price_euros: null,
    price_band: null,
    location: null,
    notes: null,
    is_quick_buy: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as any

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div 
        className="aspect-square relative bg-gradient-to-br from-green-100 to-green-200 cursor-pointer overflow-hidden"
        onClick={() => setIsModalOpen(true)}
      >
        {cultivar.photo_url ? (
          <Image
            src={cultivar.photo_url}
            alt={isGerman ? cultivar.photo_alt_text_de || cultivar.cultivar_name : cultivar.photo_alt_text_en || cultivar.cultivar_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Leaf className="h-16 w-16 text-green-600 mx-auto mb-2" />
              <p className="text-green-700 font-medium">
                {isGerman ? 'Kamelie' : 'Camellia'}
              </p>
            </div>
          </div>
        )}
        
        {/* Price Group Badge */}
        {cultivar.price_group && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-white/90 text-gray-700"
          >
            {getPriceGroupDescription(cultivar.price_group as 'A' | 'B' | 'C', locale)}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Species */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
            {cultivar.cultivar_name}
          </h3>
          <p className="text-sm text-gray-600">
            {isGerman ? cultivar.species.common_name_de : cultivar.species.common_name_en}
          </p>
          <p className="text-xs text-gray-500 italic">
            {cultivar.species.scientific_name}
          </p>
        </div>

        {/* Characteristics */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Color:</span>
            <span className="font-medium text-gray-900">{cultivar.flower_color}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Form:</span>
            <span className="font-medium text-gray-900">{cultivar.flower_form}</span>
          </div>
          {cultivar.hardiness_rating && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Hardiness:</span>
              <span className="font-medium text-gray-900">
                {'★'.repeat(cultivar.hardiness_rating)}
              </span>
            </div>
          )}
        </div>


        {/* Price */}
        <div className="mb-4">
          {loadingPrice ? (
            <p className="text-sm text-gray-500">Loading price...</p>
          ) : priceRange ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">
                {formatPrice(priceRange.min_price)} - {formatPrice(priceRange.max_price)}
              </p>
              <p className="text-xs text-gray-500">Price range</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Price on request</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsModalOpen(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal */}
      <PlantDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plant={mockPlant}
        locale={locale}
      />
    </div>
  )
}
