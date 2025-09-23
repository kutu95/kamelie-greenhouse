'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Leaf, ShoppingCart, Heart, Eye } from 'lucide-react'
import { Plant } from '@/lib/supabase/plants'
import Image from 'next/image'
import { PlantDetailsModal } from './plant-details-modal'
import Link from 'next/link'
import { getCultivarPriceRange, formatPrice, getPriceGroupDescription } from '@/lib/supabase/pricing'
import { PriceRange } from '@/lib/supabase/pricing'

interface PlantCardProps {
  plant: Plant
  locale: string
}

export function PlantCard({ plant, locale }: PlantCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const featuredPhoto = plant.photos?.find(photo => photo.is_primary) || plant.photos?.[0]
  const isGerman = locale === 'de'

  // Load price range when component mounts
  useEffect(() => {
    async function loadPriceRange() {
      if (plant.cultivar?.price_group) {
        try {
          const range = await getCultivarPriceRange(plant.cultivar.price_group)
          setPriceRange(range)
        } catch (error) {
          console.error('Error loading price range:', error)
          // The pricing function now handles fallback internally
        } finally {
          setLoadingPrice(false)
        }
      } else {
        setLoadingPrice(false)
      }
    }
    
    loadPriceRange()
  }, [plant.cultivar?.price_group])


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
             {/* Image */}
             <div 
               className="aspect-square relative bg-gradient-to-br from-green-100 to-green-200 cursor-pointer"
               onClick={() => setIsModalOpen(true)}
             >
               {featuredPhoto && featuredPhoto.photo_url ? (
                 <Image
                   src={featuredPhoto.photo_url}
                   alt={isGerman ? featuredPhoto.alt_text_de : featuredPhoto.alt_text_en}
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
        
        {/* Quick Buy Badge */}
        {plant.is_quick_buy && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            {isGerman ? 'Schnellkauf' : 'Quick Buy'}
          </Badge>
        )}
        
        {/* Price Group Badge */}
        {plant.cultivar?.price_group && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-white/90 text-gray-700"
          >
            {getPriceGroupDescription(plant.cultivar.price_group, locale)}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {plant.cultivar?.cultivar_name || 'Unknown Plant'}
          </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {plant.cultivar?.species?.scientific_name || 'Unknown Species'}
                </p>
                {(plant.cultivar?.flower_color || plant.cultivar?.flower_form) && (
                  <div className="flex gap-2 mb-2">
                    {plant.cultivar?.flower_color && (
                      <Badge variant="secondary" className="text-xs">
                        {plant.cultivar.flower_color}
                      </Badge>
                    )}
                    {plant.cultivar?.flower_form && (
                      <Badge variant="outline" className="text-xs">
                        {plant.cultivar.flower_form}
                      </Badge>
                    )}
                  </div>
                )}
                {plant.cultivar?.special_characteristics && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {plant.cultivar.special_characteristics}
                  </p>
                )}
        </div>

        {/* Plant Details */}
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>{isGerman ? 'Alter:' : 'Age:'}</span>
            <span>{plant.age_years} {isGerman ? 'Jahre' : 'years'}</span>
          </div>
          <div className="flex justify-between">
            <span>{isGerman ? 'Höhe:' : 'Height:'}</span>
            <span>{plant.height_cm} cm</span>
          </div>
          <div className="flex justify-between">
            <span>{isGerman ? 'Topf:' : 'Pot:'}</span>
            <span>{plant.pot_size}</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center">
          <div>
            {loadingPrice ? (
              <div className="text-sm text-gray-400">
                {isGerman ? 'Preis wird geladen...' : 'Loading price...'}
              </div>
            ) : priceRange ? (
              <div>
                <div className="text-lg font-bold text-green-600">
                  {priceRange.min_price === priceRange.max_price 
                    ? formatPrice(priceRange.min_price, isGerman ? 'de-DE' : 'en-US')
                    : `${formatPrice(priceRange.min_price, isGerman ? 'de-DE' : 'en-US')} - ${formatPrice(priceRange.max_price, isGerman ? 'de-DE' : 'en-US')}`
                  }
                </div>
                <p className="text-xs text-gray-500">
                  {isGerman ? 'Je nach Größe/Alter' : 'Depending on size/age'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(plant.price_euros || 0, isGerman ? 'de-DE' : 'en-US')}
                </span>
                <p className="text-xs text-gray-500">
                  {plant.plant_code}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 w-8 p-0"
              onClick={() => setIsModalOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="h-8">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Plant Details Modal */}
      <PlantDetailsModal
        plant={plant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
      />
    </div>
  )
}
