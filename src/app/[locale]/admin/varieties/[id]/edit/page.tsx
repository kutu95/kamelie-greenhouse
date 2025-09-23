'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  X,
  Search,
  AlertCircle,
  Flower,
  Calendar,
  Leaf,
  User,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Cultivar = Database['public']['Tables']['cultivars']['Row']
type Species = Database['public']['Tables']['species']['Row']

interface FormData {
  cultivar_name: string
  species_id: string
  flower_color: string
  flower_form: string
  growth_habit: string
  foliage_type: string
  breeder: string
  year_introduced: string
  hardiness_rating: string
  description_de: string
  description_en: string
  price_group: string | null
  photo_url: string | null
  photo_alt_text_de: string
  photo_alt_text_en: string
}

export default function EditVariety() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const cultivarId = params.id as string
  const router = useRouter()
  
  const [cultivar, setCultivar] = useState<Cultivar | null>(null)
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    cultivar_name: '',
    species_id: '',
    flower_color: '',
    flower_form: '',
    growth_habit: '',
    foliage_type: '',
    breeder: '',
    year_introduced: '',
    hardiness_rating: '',
    description_de: '',
    description_en: '',
    price_group: null,
    photo_url: null,
    photo_alt_text_de: '',
    photo_alt_text_en: ''
  })

  const [showImageSelector, setShowImageSelector] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingImages, setLoadingImages] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (cultivarId) {
      loadCultivar()
      loadSpecies()
      loadGalleryImages()
    }
  }, [cultivarId])

  const loadCultivar = async () => {
    try {
      const { data, error } = await supabase
        .from('cultivars')
        .select('*')
        .eq('id', cultivarId)
        .single()

      if (error) throw error

      setCultivar(data)
      setFormData({
        cultivar_name: data.cultivar_name || '',
        species_id: data.species_id?.toString() || '',
        flower_color: data.flower_color || '',
        flower_form: data.flower_form || '',
        growth_habit: data.growth_habit || '',
        foliage_type: data.foliage_type || '',
        breeder: data.breeder || '',
        year_introduced: data.year_introduced || '',
        hardiness_rating: data.hardiness_rating || '',
        description_de: data.description_de || '',
        description_en: data.description_en || '',
        price_group: data.price_group,
        photo_url: data.photo_url,
        photo_alt_text_de: data.photo_alt_text_de || '',
        photo_alt_text_en: data.photo_alt_text_en || ''
      })
    } catch (err) {
      console.error('Error loading cultivar:', err)
      setError('Failed to load variety')
    } finally {
      setLoading(false)
    }
  }

  const loadSpecies = async () => {
    try {
      const { data, error } = await supabase
        .from('species')
        .select('*')
        .order('scientific_name')

      if (error) throw error
      setSpecies(data || [])
    } catch (err) {
      console.error('Error loading species:', err)
    }
  }

  const loadGalleryImages = async () => {
    setLoadingImages(true)
    try {
      const response = await fetch('/api/gallery-images')
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images')
      }
      const data = await response.json()
      setGalleryImages(data.images || [])
    } catch (err) {
      console.error('Error loading gallery images:', err)
      // Fallback to empty array if API fails
      setGalleryImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('cultivars')
        .update({
          cultivar_name: formData.cultivar_name,
          species_id: formData.species_id ? parseInt(formData.species_id) : null,
          flower_color: formData.flower_color || null,
          flower_form: formData.flower_form || null,
          growth_habit: formData.growth_habit || null,
          foliage_type: formData.foliage_type || null,
          breeder: formData.breeder || null,
          year_introduced: formData.year_introduced || null,
          hardiness_rating: formData.hardiness_rating || null,
          description_de: formData.description_de || null,
          description_en: formData.description_en || null,
          price_group: formData.price_group || null,
          photo_url: formData.photo_url,
          photo_alt_text_de: formData.photo_alt_text_de || null,
          photo_alt_text_en: formData.photo_alt_text_en || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', cultivarId)

      if (error) throw error

      setSuccess(locale === 'de' ? 'Sorte erfolgreich aktualisiert' : 'Variety updated successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin/varieties`)
      }, 2000)
    } catch (err) {
      console.error('Error saving cultivar:', err)
      setError(locale === 'de' ? 'Fehler beim Speichern der Sorte' : 'Error saving variety')
    } finally {
      setSaving(false)
    }
  }

  const handleImageSelect = (imageName: string) => {
    const imageUrl = `/images/gallery/${imageName}`
    setFormData(prev => ({
      ...prev,
      photo_url: imageUrl,
      photo_alt_text_de: `Kamelie ${cultivar?.cultivar_name}`,
      photo_alt_text_en: `Camellia ${cultivar?.cultivar_name}`
    }))
    setShowImageSelector(false)
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      photo_url: null,
      photo_alt_text_de: '',
      photo_alt_text_en: ''
    }))
  }

  const filteredImages = galleryImages.filter(image =>
    image.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'de' ? 'Lade Sorte...' : 'Loading variety...'}</p>
        </div>
      </div>
    )
  }

  if (!cultivar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {locale === 'de' ? 'Sorte nicht gefunden' : 'Variety not found'}
          </h2>
          <Button onClick={() => router.push(`/${locale}/admin/varieties`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {locale === 'de' ? 'Zurück zur Übersicht' : 'Back to overview'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/admin/varieties`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'de' ? 'Sorte bearbeiten' : 'Edit Variety'}
                </h1>
                <p className="text-gray-600">{cultivar.cultivar_name}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (locale === 'de' ? 'Speichern...' : 'Saving...') : (locale === 'de' ? 'Speichern' : 'Save')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flower className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Grundinformationen' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cultivar_name">
                      {locale === 'de' ? 'Sortenname *' : 'Variety Name *'}
                    </Label>
                    <Input
                      id="cultivar_name"
                      value={formData.cultivar_name}
                      onChange={(e) => handleInputChange('cultivar_name', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. April Rose' : 'e.g. April Rose'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species_id">
                      {locale === 'de' ? 'Art *' : 'Species *'}
                    </Label>
                    <Select value={formData.species_id} onValueChange={(value) => handleInputChange('species_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={locale === 'de' ? 'Art auswählen' : 'Select species'} />
                      </SelectTrigger>
                      <SelectContent>
                        {species.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.scientific_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flower_color">
                      {locale === 'de' ? 'Blütenfarbe' : 'Flower Color'}
                    </Label>
                    <Input
                      id="flower_color"
                      value={formData.flower_color}
                      onChange={(e) => handleInputChange('flower_color', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Rosa' : 'e.g. Pink'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flower_form">
                      {locale === 'de' ? 'Blütenform' : 'Flower Form'}
                    </Label>
                    <Input
                      id="flower_form"
                      value={formData.flower_form}
                      onChange={(e) => handleInputChange('flower_form', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Einfach' : 'e.g. Single'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="growth_habit">
                      {locale === 'de' ? 'Wuchsform' : 'Growth Habit'}
                    </Label>
                    <Input
                      id="growth_habit"
                      value={formData.growth_habit}
                      onChange={(e) => handleInputChange('growth_habit', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Aufrecht' : 'e.g. Upright'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foliage_type">
                      {locale === 'de' ? 'Blatttyp' : 'Foliage Type'}
                    </Label>
                    <Input
                      id="foliage_type"
                      value={formData.foliage_type}
                      onChange={(e) => handleInputChange('foliage_type', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Immergrün' : 'e.g. Evergreen'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Zusätzliche Details' : 'Additional Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breeder">
                      {locale === 'de' ? 'Züchter' : 'Breeder'}
                    </Label>
                    <Input
                      id="breeder"
                      value={formData.breeder}
                      onChange={(e) => handleInputChange('breeder', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. John Smith' : 'e.g. John Smith'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year_introduced">
                      {locale === 'de' ? 'Einführungsjahr' : 'Year Introduced'}
                    </Label>
                    <Input
                      id="year_introduced"
                      type="number"
                      value={formData.year_introduced}
                      onChange={(e) => handleInputChange('year_introduced', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hardiness_rating">
                    {locale === 'de' ? 'Winterhärte' : 'Hardiness Rating'}
                  </Label>
                  <Select 
                    value={formData.hardiness_rating || 'none'} 
                    onValueChange={(value) => handleInputChange('hardiness_rating', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locale === 'de' ? 'Winterhärte auswählen' : 'Select hardiness rating'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {locale === 'de' ? 'Keine Bewertung' : 'No Rating'}
                      </SelectItem>
                      <SelectItem value="1">
                        {locale === 'de' ? '1 - Sehr empfindlich' : '1 - Very Tender'}
                      </SelectItem>
                      <SelectItem value="2">
                        {locale === 'de' ? '2 - Empfindlich' : '2 - Tender'}
                      </SelectItem>
                      <SelectItem value="3">
                        {locale === 'de' ? '3 - Mäßig winterhart' : '3 - Moderately Hardy'}
                      </SelectItem>
                      <SelectItem value="4">
                        {locale === 'de' ? '4 - Winterhart' : '4 - Hardy'}
                      </SelectItem>
                      <SelectItem value="5">
                        {locale === 'de' ? '5 - Sehr winterhart' : '5 - Very Hardy'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Preisgruppe' : 'Price Group'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="price_group">
                    {locale === 'de' ? 'Preisgruppe' : 'Price Group'}
                  </Label>
                  <Select 
                    value={formData.price_group || 'none'} 
                    onValueChange={(value) => handleInputChange('price_group', value === 'none' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locale === 'de' ? 'Preisgruppe auswählen' : 'Select price group'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {locale === 'de' ? 'Keine Gruppe' : 'No Group'}
                      </SelectItem>
                      <SelectItem value="A">
                        {locale === 'de' ? 'Gruppe A (Standard)' : 'Group A (Standard)'}
                      </SelectItem>
                      <SelectItem value="B">
                        {locale === 'de' ? 'Gruppe B (Premium)' : 'Group B (Premium)'}
                      </SelectItem>
                      <SelectItem value="C">
                        {locale === 'de' ? 'Gruppe C (Selten)' : 'Group C (Rare)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'de' ? 'Beschreibungen' : 'Descriptions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description_de">
                    {locale === 'de' ? 'Deutsche Beschreibung' : 'German Description'}
                  </Label>
                  <Textarea
                    id="description_de"
                    value={formData.description_de}
                    onChange={(e) => handleInputChange('description_de', e.target.value)}
                    placeholder={locale === 'de' ? 'Deutsche Beschreibung der Sorte...' : 'German description of the variety...'}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {locale === 'de' ? 'Englische Beschreibung' : 'English Description'}
                  </Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => handleInputChange('description_en', e.target.value)}
                    placeholder={locale === 'de' ? 'Englische Beschreibung der Sorte...' : 'English description of the variety...'}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Bild' : 'Image'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.photo_url ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                      <img
                        src={formData.photo_url}
                        alt={formData.photo_alt_text_de || formData.cultivar_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageSelector(true)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {locale === 'de' ? 'Ändern' : 'Change'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {locale === 'de' ? 'Kein Bild' : 'No image'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowImageSelector(true)}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {locale === 'de' ? 'Bild auswählen' : 'Select Image'}
                    </Button>
                  </div>
                )}

                {/* Alt Text */}
                {formData.photo_url && (
                  <div className="space-y-2">
                    <Label htmlFor="photo_alt_text_de">
                      {locale === 'de' ? 'Alt-Text (Deutsch)' : 'Alt Text (German)'}
                    </Label>
                    <Input
                      id="photo_alt_text_de"
                      value={formData.photo_alt_text_de}
                      onChange={(e) => handleInputChange('photo_alt_text_de', e.target.value)}
                      placeholder={locale === 'de' ? 'Beschreibung des Bildes' : 'Image description'}
                    />
                  </div>
                )}

                {formData.photo_url && (
                  <div className="space-y-2">
                    <Label htmlFor="photo_alt_text_en">
                      {locale === 'de' ? 'Alt-Text (Englisch)' : 'Alt Text (English)'}
                    </Label>
                    <Input
                      id="photo_alt_text_en"
                      value={formData.photo_alt_text_en}
                      onChange={(e) => handleInputChange('photo_alt_text_en', e.target.value)}
                      placeholder={locale === 'de' ? 'Beschreibung des Bildes' : 'Image description'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Selector Modal */}
        {showImageSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {locale === 'de' ? 'Bild auswählen' : 'Select Image'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={locale === 'de' ? 'Bilder durchsuchen...' : 'Search images...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {loadingImages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          {locale === 'de' ? 'Lade Bilder...' : 'Loading images...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {filteredImages.map((imageName) => (
                        <div
                          key={imageName}
                          className="cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                          onClick={() => handleImageSelect(imageName)}
                        >
                          <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden mb-2">
                            <img
                              src={`/images/gallery/${imageName}`}
                              alt={imageName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 truncate px-1">
                            {imageName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!loadingImages && filteredImages.length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {locale === 'de' ? 'Keine Bilder gefunden' : 'No images found'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
