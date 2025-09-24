'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ShoppingCart, Leaf, Calendar, Package, Euro, Check, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Plant } from '@/lib/supabase/plants'
import { calculatePlantPrice, formatPrice, getPriceGroupDescription } from '@/lib/supabase/pricing'
import { translateFlowerColor, translateFlowerForm, translateGrowthHabit, translateFoliageType } from '@/lib/utils/translations'

interface PlantSelection {
  plant: Plant
  calculatedPrice: number
}

interface PlantSelectionModalProps {
  cultivarId: string | null
  isOpen: boolean
  onClose: () => void
  onBackToVariety: () => void
  locale: string
}

export function PlantSelectionModal({ 
  cultivarId, 
  isOpen, 
  onClose, 
  onBackToVariety, 
  locale 
}: PlantSelectionModalProps) {
  const [cultivar, setCultivar] = useState<any>(null)
  const [availablePlants, setAvailablePlants] = useState<PlantSelection[]>([])
  const [selectedPlant, setSelectedPlant] = useState<PlantSelection | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculatingPrices, setCalculatingPrices] = useState(false)

  const isGerman = locale === 'de'

  useEffect(() => {
    async function loadCultivarAndPlants() {
      if (!cultivarId) return
      
      const supabase = createClient()
      
      try {
        setLoading(true)
        
        // Load cultivar information
        const { data: cultivarData, error: cultivarError } = await supabase
          .from('cultivars')
          .select(`
            *,
            species (*)
          `)
          .eq('id', cultivarId)
          .single()

        if (cultivarError) throw cultivarError
        setCultivar(cultivarData)

        // Load available plants for this cultivar
        const { data: plantsData, error: plantsError } = await supabase
          .from('plants')
          .select(`
            *,
            cultivar (*),
            photos (*)
          `)
          .eq('cultivar_id', cultivarId)
          .eq('status', 'available')
          .order('age_years')

        if (plantsError) throw plantsError

        // Calculate prices for each plant
        setCalculatingPrices(true)
        const plantsWithPrices: PlantSelection[] = []
        
        for (const plant of plantsData) {
          try {
            const calculatedPrice = await calculatePlantPrice(
              plant.cultivar.price_group,
              plant.age_years
            )
            plantsWithPrices.push({
              plant,
              calculatedPrice
            })
          } catch (error) {
            console.error(`Error calculating price for plant ${plant.id}:`, error)
            // Fallback to existing price
            plantsWithPrices.push({
              plant,
              calculatedPrice: plant.price_euros || 0
            })
          }
        }

        setAvailablePlants(plantsWithPrices)
      } catch (error) {
        console.error('Error loading cultivar and plants:', error)
      } finally {
        setLoading(false)
        setCalculatingPrices(false)
      }
    }

    if (isOpen && cultivarId) {
      loadCultivarAndPlants()
    }
  }, [cultivarId, isOpen])

  const handleAddToCart = () => {
    if (selectedPlant) {
      // TODO: Implement add to cart functionality
      console.log('Adding to cart:', selectedPlant)
      // For now, just show a success message and close modal
      alert(isGerman ? 'Pflanze zum Warenkorb hinzugefügt!' : 'Plant added to cart!')
      onClose()
    }
  }

  if (!isOpen) return null

  const featuredPhoto = cultivar?.photo_url ? {
    photo_url: cultivar.photo_url,
    alt_text_de: cultivar.photo_alt_text_de || '',
    alt_text_en: cultivar.photo_alt_text_en || '',
    is_primary: true
  } : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBackToVariety}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isGerman ? 'Pflanze auswählen' : 'Select Plant'}
              </h2>
              {cultivar && (
                <p className="text-gray-600">
                  {cultivar.cultivar_name} - {availablePlants.length} {isGerman ? 'verfügbar' : 'available'}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {isGerman ? 'Lade Pflanzen...' : 'Loading plants...'}
                </p>
              </div>
            </div>
          ) : !cultivar ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {isGerman ? 'Kultivar nicht gefunden' : 'Cultivar not found'}
              </h3>
              <p className="text-gray-600">
                {isGerman ? 'Das angeforderte Kultivar konnte nicht gefunden werden.' : 'The requested cultivar could not be found.'}
              </p>
            </div>
          ) : (
            <>
              {/* Cultivar Info */}
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Cultivar Image */}
                <div className="lg:w-1/3">
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
                          <Leaf className="h-16 w-16 text-green-600 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">
                            {isGerman ? 'Kamelie' : 'Camellia'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cultivar Details */}
                <div className="lg:w-2/3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {cultivar.cultivar_name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {cultivar.species.scientific_name}
                  </p>
                  
                  {cultivar.special_characteristics && (
                    <p className="text-gray-700 mb-4 text-sm">
                      {cultivar.special_characteristics}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {cultivar.price_group && (
                      <Badge variant="secondary">
                        {getPriceGroupDescription(cultivar.price_group, locale)}
                      </Badge>
                    )}
                    <Badge className="bg-green-600 text-white">
                      {availablePlants.length} {isGerman ? 'verfügbar' : 'available'}
                    </Badge>
                  </div>

                  {/* Quick Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {cultivar.flower_color && (
                      <div>
                        <p className="text-gray-500">{isGerman ? 'Blütenfarbe' : 'Flower Color'}</p>
                        <p className="font-medium">{translateFlowerColor(cultivar.flower_color, locale)}</p>
                      </div>
                    )}
                    {cultivar.flower_form && (
                      <div>
                        <p className="text-gray-500">{isGerman ? 'Blütenform' : 'Flower Form'}</p>
                        <p className="font-medium">{translateFlowerForm(cultivar.flower_form, locale)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Plant Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isGerman ? 'Verfügbare Pflanzen' : 'Available Plants'}
                </h3>

                {calculatingPrices && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">
                      {isGerman ? 'Preise werden berechnet...' : 'Calculating prices...'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePlants.map((plantSelection) => {
                    const featuredPhoto = plantSelection.plant.photos?.find(photo => photo.is_primary) || plantSelection.plant.photos?.[0]
                    
                    return (
                      <div
                        key={plantSelection.plant.id}
                        className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedPlant?.plant.id === plantSelection.plant.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setSelectedPlant(plantSelection)}
                      >
                        {/* Plant Image */}
                        <div className="aspect-square relative bg-gradient-to-br from-green-100 to-green-200">
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
                                <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                <p className="text-green-700 font-medium text-sm">
                                  {isGerman ? 'Kamelie' : 'Camellia'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Selection indicator */}
                          {selectedPlant?.plant.id === plantSelection.plant.id && (
                            <div className="absolute top-2 right-2">
                              <div className="bg-green-600 text-white rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Plant Details */}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {plantSelection.plant.age_years} {isGerman ? 'Jahre' : 'years'}
                              </span>
                            </div>
                            
                            {plantSelection.plant.height_cm && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Leaf className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {plantSelection.plant.height_cm} cm {isGerman ? 'Höhe' : 'height'}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Euro className="h-4 w-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(plantSelection.calculatedPrice, isGerman ? 'de-DE' : 'en-US')}
                              </span>
                            </div>
                          </div>

                          {plantSelection.plant.plant_code && (
                            <div className="text-xs text-gray-500">
                              {isGerman ? 'Code' : 'Code'}: {plantSelection.plant.plant_code}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {availablePlants.length === 0 && !calculatingPrices && (
                  <div className="text-center py-8">
                    <Leaf className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {isGerman ? 'Keine Pflanzen verfügbar' : 'No plants available'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {selectedPlant && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedPlant.plant.age_years} {isGerman ? 'Jahre' : 'years'}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPlant.plant.plant_code}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">{isGerman ? 'Preis' : 'Price'}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(selectedPlant.calculatedPrice, isGerman ? 'de-DE' : 'en-US')}
                  </p>
                </div>
                <Button size="lg" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isGerman ? 'In den Warenkorb' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
