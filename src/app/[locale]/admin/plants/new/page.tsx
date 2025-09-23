'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  TreeDeciduous,
  Flower,
  MapPin,
  Calendar,
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Cultivar = Database['public']['Tables']['cultivars']['Row']

interface FormData {
  cultivar_id: string
  age_years: string
  height_cm: string
  pot_size: string
  plant_code: string
  status: string
  location: string
  notes: string
}

export default function NewPlant() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [cultivars, setCultivars] = useState<Cultivar[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    cultivar_id: '',
    age_years: '',
    height_cm: '',
    pot_size: '',
    plant_code: '',
    status: 'available',
    location: '',
    notes: ''
  })

  const [selectedCultivar, setSelectedCultivar] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadCultivars()
  }, [])

  const loadCultivars = async () => {
    try {
      const { data, error } = await supabase
        .from('cultivars')
        .select('*')
        .order('cultivar_name')

      if (error) throw error
      setCultivars(data || [])
    } catch (err) {
      console.error('Error loading cultivars:', err)
    } finally {
      setLoading(false)
    }
  }


  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // If cultivar is selected, update the selected cultivar info
    if (field === 'cultivar_id') {
      const cultivar = cultivars.find(c => c.id.toString() === value)
      setSelectedCultivar(cultivar || null)
    }
  }

  const handleSave = async () => {
    if (!formData.cultivar_id) {
      setError(locale === 'de' ? 'Sorte ist erforderlich' : 'Variety is required')
      return
    }

    if (!formData.age_years || parseInt(formData.age_years) < 0) {
      setError(locale === 'de' ? 'Alter muss angegeben werden und größer als 0 sein' : 'Age must be specified and greater than 0')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const cultivarId = parseInt(formData.cultivar_id)
      if (isNaN(cultivarId)) {
        setError(locale === 'de' ? 'Ungültige Sorte ausgewählt' : 'Invalid variety selected')
        return
      }

      const { error } = await supabase
        .from('plants')
        .insert({
          cultivar_id: cultivarId,
          age_years: parseInt(formData.age_years), // Required field
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          pot_size: formData.pot_size || null,
          plant_code: formData.plant_code || null,
          status: formData.status || 'available',
          location: formData.location || null,
          notes: formData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess(locale === 'de' ? 'Pflanze erfolgreich erstellt' : 'Plant created successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin/plants`)
      }, 2000)
    } catch (err) {
      console.error('Error creating plant:', err)
      console.error('Form data:', formData)
      setError(locale === 'de' ? `Fehler beim Erstellen der Pflanze: ${err instanceof Error ? err.message : JSON.stringify(err)}` : `Error creating plant: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'de' ? 'Lade...' : 'Loading...'}</p>
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
                onClick={() => router.push(`/${locale}/admin/plants`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{locale === 'de' ? 'Zurück' : 'Back'}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'de' ? 'Neue Pflanze' : 'New Plant'}
                </h1>
                <p className="text-gray-600">
                  {locale === 'de' ? 'Erstellen Sie eine neue Pflanze im Inventar' : 'Create a new plant in inventory'}
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? (locale === 'de' ? 'Erstellen...' : 'Creating...') : (locale === 'de' ? 'Erstellen' : 'Create')}
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
            {/* Plant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TreeDeciduous className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Pflanzeninformationen' : 'Plant Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cultivar_id">
                    {locale === 'de' ? 'Sorte *' : 'Variety *'}
                  </Label>
                  <Select value={formData.cultivar_id} onValueChange={(value) => handleInputChange('cultivar_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={locale === 'de' ? 'Sorte auswählen' : 'Select variety'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cultivars.map((cultivar) => (
                        <SelectItem key={cultivar.id} value={cultivar.id.toString()}>
                          {cultivar.cultivar_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age_years">
                      {locale === 'de' ? 'Alter (Jahre) *' : 'Age (Years) *'}
                    </Label>
                    <Input
                      id="age_years"
                      type="number"
                      required
                      min="0"
                      value={formData.age_years}
                      onChange={(e) => handleInputChange('age_years', e.target.value)}
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height_cm">
                      {locale === 'de' ? 'Höhe (cm)' : 'Height (cm)'}
                    </Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange('height_cm', e.target.value)}
                      placeholder="150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pot_size">
                      {locale === 'de' ? 'Topfgröße' : 'Pot Size'}
                    </Label>
                    <Input
                      id="pot_size"
                      value={formData.pot_size}
                      onChange={(e) => handleInputChange('pot_size', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. 20L' : 'e.g. 20L'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plant_code">
                      {locale === 'de' ? 'Pflanzencode' : 'Plant Code'}
                    </Label>
                    <Input
                      id="plant_code"
                      value={formData.plant_code}
                      onChange={(e) => handleInputChange('plant_code', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. P001' : 'e.g. P001'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {locale === 'de' ? 'Status' : 'Status'}
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={locale === 'de' ? 'Status auswählen' : 'Select status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          {locale === 'de' ? 'Verfügbar' : 'Available'}
                        </SelectItem>
                        <SelectItem value="reserved">
                          {locale === 'de' ? 'Reserviert' : 'Reserved'}
                        </SelectItem>
                        <SelectItem value="sold">
                          {locale === 'de' ? 'Verkauft' : 'Sold'}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {locale === 'de' ? 'Wartung' : 'Maintenance'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {locale === 'de' ? 'Standort' : 'Location'}
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={locale === 'de' ? 'z.B. Gewächshaus A' : 'e.g. Greenhouse A'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {locale === 'de' ? 'Notizen' : 'Notes'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={locale === 'de' ? 'Zusätzliche Notizen zur Pflanze...' : 'Additional notes about the plant...'}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cultivar Information Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flower className="h-5 w-5 mr-2" />
                  {locale === 'de' ? 'Sorteninformationen' : 'Variety Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCultivar ? (
                  <div className="space-y-4">
                    {/* Cultivar Image */}
                    {selectedCultivar.photo_url && (
                      <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                        <img
                          src={selectedCultivar.photo_url}
                          alt={locale === 'de' ? selectedCultivar.photo_alt_text_de || selectedCultivar.cultivar_name : selectedCultivar.photo_alt_text_en || selectedCultivar.cultivar_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Cultivar Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">
                          {selectedCultivar.cultivar_name}
                        </h4>
                        {selectedCultivar.breeder && (
                          <p className="text-sm text-gray-600">
                            {locale === 'de' ? 'Züchter:' : 'Breeder:'} {selectedCultivar.breeder}
                          </p>
                        )}
                        {selectedCultivar.year_introduced && (
                          <p className="text-sm text-gray-600">
                            {locale === 'de' ? 'Eingeführt:' : 'Introduced:'} {selectedCultivar.year_introduced}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedCultivar.flower_color && (
                          <div>
                            <span className="font-medium text-gray-700">
                              {locale === 'de' ? 'Blütenfarbe:' : 'Flower Color:'}
                            </span>
                            <p className="text-gray-600">{selectedCultivar.flower_color}</p>
                          </div>
                        )}
                        {selectedCultivar.flower_form && (
                          <div>
                            <span className="font-medium text-gray-700">
                              {locale === 'de' ? 'Blütenform:' : 'Flower Form:'}
                            </span>
                            <p className="text-gray-600">{selectedCultivar.flower_form}</p>
                          </div>
                        )}
                        {selectedCultivar.growth_habit && (
                          <div>
                            <span className="font-medium text-gray-700">
                              {locale === 'de' ? 'Wuchsform:' : 'Growth Habit:'}
                            </span>
                            <p className="text-gray-600">{selectedCultivar.growth_habit}</p>
                          </div>
                        )}
                        {selectedCultivar.hardiness_rating && (
                          <div>
                            <span className="font-medium text-gray-700">
                              {locale === 'de' ? 'Winterhärte:' : 'Hardiness:'}
                            </span>
                            <p className="text-gray-600">{selectedCultivar.hardiness_rating}/5</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedCultivar.special_characteristics && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">
                            {locale === 'de' ? 'Besonderheiten:' : 'Special Characteristics:'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedCultivar.special_characteristics}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Flower className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {locale === 'de' ? 'Wählen Sie eine Sorte aus, um Informationen anzuzeigen' : 'Select a variety to view information'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
