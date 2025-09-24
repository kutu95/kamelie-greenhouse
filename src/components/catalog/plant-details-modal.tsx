'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Leaf, Calendar, Euro, ShoppingCart, Heart, Users } from 'lucide-react'
import { Plant } from '@/lib/supabase/plants'
import Image from 'next/image'
import { getCultivarPriceRange, formatPrice, getPriceGroupDescription, calculatePlantPrice } from '@/lib/supabase/pricing'
import { PriceRange } from '@/lib/supabase/pricing'
import { translateFlowerColor, translateFlowerForm, translateGrowthHabit, translateFoliageType } from '@/lib/utils/translations'
import { useCartStore } from '@/lib/store/cart'
import { useFavouritesStore } from '@/lib/store/favourites'

interface PlantDetailsModalProps {
  plant: Plant | null
  isOpen: boolean
  onClose: () => void
  locale: string
}

export function PlantDetailsModal({ plant, isOpen, onClose, locale }: PlantDetailsModalProps) {
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedAge, setSelectedAge] = useState<number>(3)
  const [quantity, setQuantity] = useState<number>(1)
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [loadingPriceCalculation, setLoadingPriceCalculation] = useState(false)

  const { addPlant } = useCartStore()
  const { addPlant: addToFavourites, removeItem: removeFromFavourites, isFavourite } = useFavouritesStore()
  const isGerman = locale === 'de'
  const featuredPhoto = plant?.cultivar?.photo_url ? {
    photo_url: plant.cultivar.photo_url,
    alt_text_de: plant.cultivar.photo_alt_text_de || '',
    alt_text_en: plant.cultivar.photo_alt_text_en || '',
    is_primary: true
  } : null
  const cultivar = (plant as any)?.cultivar

  // Load price range when modal opens
  useEffect(() => {
    async function loadPriceRange() {
      if ((plant as any)?.cultivar?.price_group) {
        try {
          const range = await getCultivarPriceRange((plant as any).cultivar.price_group)
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
    
    if (isOpen && plant) {
      loadPriceRange()
    }
  }, [isOpen, (plant as any)?.cultivar?.price_group])

  // Calculate price when age changes
  useEffect(() => {
    async function calculatePrice() {
      if (cultivar?.price_group) {
        setLoadingPriceCalculation(true)
        try {
          const price = await calculatePlantPrice(
            cultivar.price_group as 'A' | 'B' | 'C',
            selectedAge
          )
          setCalculatedPrice(price)
        } catch (error) {
          console.error('Error calculating price:', error)
          setCalculatedPrice(null)
        } finally {
          setLoadingPriceCalculation(false)
        }
      }
    }
    
    if (cultivar?.price_group) {
      calculatePrice()
    }
  }, [selectedAge, cultivar?.price_group])

  const handleAddToCart = async () => {
    if (!plant || !cultivar || !calculatedPrice) return
    
    try {
      // Create plant object with calculated price
      const plantWithPrice = {
        ...plant,
        price_euros: calculatedPrice,
        age_years: selectedAge
      }
      
      // Add to cart with selected quantity
      addPlant(plantWithPrice as any, quantity)
      setAddedToCart(true)
      
      // Reset after 2 seconds
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error('Error adding plant to cart:', error)
    }
  }

  const handleToggleFavourite = () => {
    if (!plant) return
    
    if (isFavourite(plant.id)) {
      removeFromFavourites(plant.id)
    } else {
      addToFavourites(plant as any)
    }
  }


  if (!isOpen || !plant) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {cultivar?.cultivar_name}
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

              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {cultivar?.species?.scientific_name}
                  </h3>
                  {cultivar?.special_characteristics && (
                    <p className="text-gray-600 mb-4">
                      {cultivar?.special_characteristics}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {plant.is_quick_buy && (
                      <Badge className="bg-green-600 text-white">
                        {isGerman ? 'Schnellkauf' : 'Quick Buy'}
                      </Badge>
                    )}
                    {(plant as any).cultivar?.price_group && (
                      <Badge variant="secondary">
                        {getPriceGroupDescription((plant as any).cultivar.price_group, locale)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Variety Details */}
                <div className="grid grid-cols-2 gap-4">
                  {cultivar?.flower_color && (
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-gradient-to-r from-pink-400 to-red-400"></div>
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Blütenfarbe' : 'Flower Color'}</p>
                        <p className="font-medium">{translateFlowerColor(cultivar?.flower_color, locale)}</p>
                      </div>
                    </div>
                  )}

                  {cultivar?.flower_form && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Blütenform' : 'Flower Form'}</p>
                        <p className="font-medium">{translateFlowerForm(cultivar?.flower_form, locale)}</p>
                      </div>
                    </div>
                  )}

                  {cultivar?.growth_habit && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Wuchsform' : 'Growth Habit'}</p>
                        <p className="font-medium">{translateGrowthHabit(cultivar?.growth_habit, locale)}</p>
                      </div>
                    </div>
                  )}

                  {cultivar?.foliage_type && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Laub' : 'Foliage'}</p>
                        <p className="font-medium">{translateFoliageType(cultivar?.foliage_type, locale)}</p>
                      </div>
                    </div>
                  )}

                  {cultivar?.breeder && cultivar?.breeder !== 'Unknown' && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Züchter' : 'Breeder'}</p>
                        <p className="font-medium">{cultivar?.breeder}</p>
                      </div>
                    </div>
                  )}

                  {cultivar?.year_introduced && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Einführungsjahr' : 'Year Introduced'}</p>
                        <p className="font-medium">{cultivar?.year_introduced}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Euro className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{isGerman ? 'Preis' : 'Price'}</p>
                        {loadingPriceCalculation ? (
                          <div className="text-sm text-gray-400">
                            {isGerman ? 'Preis wird berechnet...' : 'Calculating price...'}
                          </div>
                        ) : calculatedPrice ? (
                          <div>
                            <p className="font-medium text-green-600 text-lg">
                              {formatPrice(calculatedPrice, isGerman ? 'de-DE' : 'en-US')}
                              {quantity > 1 && (
                                <span className="text-sm text-gray-500 ml-2">
                                  {isGerman ? 'pro Stück' : 'each'}
                                </span>
                              )}
                            </p>
                            {quantity > 1 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {isGerman ? 'Gesamt' : 'Total'}: {formatPrice(calculatedPrice * quantity, isGerman ? 'de-DE' : 'en-US')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            {isGerman ? 'Preis nicht verfügbar' : 'Price not available'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Age Selection */}
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">
                        {isGerman ? 'Alter (Jahre)' : 'Age (Years)'}
                      </label>
                      <div className="flex space-x-2">
                        {[3, 4, 5, 6].map((age) => (
                          <button
                            key={age}
                            onClick={() => setSelectedAge(age)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              selectedAge === age
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {age} {isGerman ? 'Jahre' : 'Years'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selection */}
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">
                        {isGerman ? 'Menge' : 'Quantity'}
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          disabled={quantity <= 1}
                        >
                          <span className="text-gray-600">-</span>
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-600">+</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Hardiness Information */}
                {(plant as any).cultivar.hardiness_rating && (
                  <div>
                    <p className="text-sm text-gray-500">{isGerman ? 'Winterhärte' : 'Hardiness'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div
                            key={rating}
                            className={`w-4 h-4 rounded-full ${
                              rating <= cultivar?.hardiness_rating!
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {cultivar?.hardiness_rating}/5
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleToggleFavourite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavourite(plant.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavourite(plant.id) 
                      ? (isGerman ? 'Aus Favoriten entfernen' : 'Remove from Favorites')
                      : (isGerman ? 'Zu Favoriten' : 'Add to Favorites')
                    }
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleAddToCart}
                    disabled={addedToCart || !calculatedPrice || loadingPriceCalculation}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addedToCart
                      ? (isGerman ? 'Hinzugefügt!' : 'Added!')
                      : loadingPriceCalculation
                      ? (isGerman ? 'Berechne...' : 'Calculating...')
                      : !calculatedPrice
                      ? (isGerman ? 'Preis nicht verfügbar' : 'Price not available')
                      : quantity > 1
                      ? (isGerman ? `${quantity} × In den Warenkorb` : `Add ${quantity} to Cart`)
                      : (isGerman ? 'In den Warenkorb' : 'Add to Cart')
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}