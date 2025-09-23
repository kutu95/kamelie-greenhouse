'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ShoppingCart, Leaf, Calendar, Package, Euro, Check, ArrowLeft, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getPriceGroupDescription } from '@/lib/supabase/pricing'
import { translateFlowerColor, translateFlowerForm, translateGrowthHabit, translateFoliageType } from '@/lib/utils/translations'

interface AvailabilityRequestModalProps {
  cultivarId: string | null
  isOpen: boolean
  onClose: () => void
  onBackToVariety: () => void
  locale: string
}

interface PricingOption {
  age_years: number
  pot_size: string
  base_price_euros: number
}

export function AvailabilityRequestModal({ 
  cultivarId, 
  isOpen, 
  onClose, 
  onBackToVariety, 
  locale 
}: AvailabilityRequestModalProps) {
  const [cultivar, setCultivar] = useState<any>(null)
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([])
  const [selectedAge, setSelectedAge] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)

  const isGerman = locale === 'de'

  useEffect(() => {
    async function loadCultivarAndPricing() {
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

        // Load pricing options for this cultivar's price group
        if (cultivarData.price_group) {
          const { data: pricingData, error: pricingError } = await supabase
            .from('pricing_matrix')
            .select('age_years, pot_size, base_price_euros')
            .eq('price_group', cultivarData.price_group)
            .eq('is_available', true)
            .order('age_years')

          if (pricingError) throw pricingError
          setPricingOptions(pricingData || [])
        }

      } catch (error) {
        console.error('Error loading cultivar and pricing:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCultivarAndPricing()
  }, [cultivarId])

  const handleRequestAvailability = () => {
    // In a real implementation, this would send an email or create a quote request
    setRequestSent(true)
    
    // Simulate sending request
    setTimeout(() => {
      setRequestSent(false)
      onClose()
    }, 2000)
  }

  const handleContactDirectly = () => {
    // Open email client or phone
    const subject = isGerman 
      ? `Anfrage für ${cultivar?.cultivar_name}`
      : `Inquiry for ${cultivar?.cultivar_name}`
    
    const body = isGerman
      ? `Hallo,\n\nich interessiere mich für ${cultivar?.cultivar_name}.\n\nGewünschtes Alter: ${selectedAge ? `${selectedAge} Jahre` : 'Beliebig'}\n\nBitte teilen Sie mir die Verfügbarkeit und den genauen Preis mit.\n\nVielen Dank!`
      : `Hello,\n\nI am interested in ${cultivar?.cultivar_name}.\n\nDesired age: ${selectedAge ? `${selectedAge} years` : 'Any'}\n\nPlease let me know about availability and exact pricing.\n\nThank you!`
    
    const emailLink = `mailto:info@kamelie.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailLink)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBackToVariety}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {isGerman ? 'Verfügbarkeit anfragen' : 'Request Availability'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">{isGerman ? 'Lade Informationen...' : 'Loading information...'}</p>
              </div>
            </div>
          ) : requestSent ? (
            <div className="text-center py-8">
              <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isGerman ? 'Anfrage gesendet!' : 'Request Sent!'}
              </h3>
              <p className="text-gray-600">
                {isGerman ? 'Wir melden uns bald bei Ihnen.' : 'We will contact you soon.'}
              </p>
            </div>
          ) : cultivar ? (
            <div className="space-y-6">
              {/* Cultivar Information */}
              <div className="flex items-start space-x-4">
                {cultivar.photo_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={cultivar.photo_url}
                      alt={isGerman ? cultivar.photo_alt_text_de || cultivar.cultivar_name : cultivar.photo_alt_text_en || cultivar.cultivar_name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{cultivar.cultivar_name}</h3>
                  <p className="text-gray-600">{cultivar.species?.scientific_name}</p>
                  {cultivar.price_group && (
                    <Badge variant="secondary" className="mt-2">
                      {getPriceGroupDescription(cultivar.price_group as 'A' | 'B' | 'C', locale)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Pricing Options */}
              {pricingOptions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {isGerman ? 'Verfügbare Größen und Preise:' : 'Available Sizes and Prices:'}
                  </h4>
                  <div className="grid gap-3">
                    {pricingOptions.map((option) => (
                      <div
                        key={`${option.age_years}-${option.pot_size}`}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAge === option.age_years
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAge(option.age_years)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {option.age_years} {isGerman ? 'Jahre' : 'years'} ({option.pot_size})
                            </p>
                            <p className="text-sm text-gray-500">
                              {isGerman ? 'Standardgröße' : 'Standard size'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              {formatPrice(option.base_price_euros, isGerman ? 'de-DE' : 'en-US')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Options */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {isGerman ? 'Kontakt für Verfügbarkeit:' : 'Contact for Availability:'}
                </h4>
                <div className="space-y-3">
                  <Button 
                    onClick={handleContactDirectly}
                    className="w-full"
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isGerman ? 'E-Mail senden' : 'Send Email'}
                  </Button>
                  <Button 
                    onClick={() => window.open('tel:+49402209458')}
                    className="w-full"
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {isGerman ? 'Anrufen: +49 40 220 94 58' : 'Call: +49 40 220 94 58'}
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {isGerman 
                      ? 'Wir prüfen gerne die Verfügbarkeit für Ihre gewünschte Größe und teilen Ihnen den genauen Preis mit.'
                      : 'We will gladly check availability for your desired size and provide you with the exact price.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isGerman ? 'Fehler beim Laden der Informationen.' : 'Error loading information.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
