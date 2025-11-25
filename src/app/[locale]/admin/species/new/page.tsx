'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, 
  Save, 
  TreePine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  scientific_name: string
  common_name_de: string
  common_name_en: string
  description_de: string
  description_en: string
  care_notes_de: string
  care_notes_en: string
  flowering_period_start: string
  flowering_period_end: string
  hardiness_zone_min: string
  hardiness_zone_max: string
  max_height_cm: string
  max_width_cm: string
  sun_exposure: 'full_sun' | 'partial_shade' | 'shade' | ''
  soil_type: 'acidic' | 'neutral' | 'alkaline' | ''
}

export default function NewSpecies() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    scientific_name: '',
    common_name_de: '',
    common_name_en: '',
    description_de: '',
    description_en: '',
    care_notes_de: '',
    care_notes_en: '',
    flowering_period_start: '',
    flowering_period_end: '',
    hardiness_zone_min: '',
    hardiness_zone_max: '',
    max_height_cm: '',
    max_width_cm: '',
    sun_exposure: '',
    soil_type: ''
  })
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.scientific_name.trim()) {
      setError(locale === 'de' ? 'Wissenschaftlicher Name ist erforderlich' : 'Scientific name is required')
      return
    }

    if (!formData.common_name_de.trim()) {
      setError(locale === 'de' ? 'Deutscher Name ist erforderlich' : 'German common name is required')
      return
    }

    setSaving(true)

    try {
      const insertData: any = {
        scientific_name: formData.scientific_name.trim(),
        common_name_de: formData.common_name_de.trim(),
        common_name_en: formData.common_name_en.trim() || null,
        description_de: formData.description_de.trim() || null,
        description_en: formData.description_en.trim() || null,
        care_notes_de: formData.care_notes_de.trim() || null,
        care_notes_en: formData.care_notes_en.trim() || null,
        flowering_period_start: formData.flowering_period_start ? parseInt(formData.flowering_period_start) : null,
        flowering_period_end: formData.flowering_period_end ? parseInt(formData.flowering_period_end) : null,
        hardiness_zone_min: formData.hardiness_zone_min ? parseInt(formData.hardiness_zone_min) : null,
        hardiness_zone_max: formData.hardiness_zone_max ? parseInt(formData.hardiness_zone_max) : null,
        max_height_cm: formData.max_height_cm ? parseInt(formData.max_height_cm) : null,
        max_width_cm: formData.max_width_cm ? parseInt(formData.max_width_cm) : null,
        sun_exposure: formData.sun_exposure || null,
        soil_type: formData.soil_type || null
      }

      const { data, error } = await supabase
        .from('species')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      setSuccess(locale === 'de' ? 'Art erfolgreich erstellt' : 'Species created successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/${locale}/admin/species`)
      }, 1000)
    } catch (err: any) {
      console.error('Error creating species:', err)
      setError(err.message || (locale === 'de' ? 'Fehler beim Erstellen der Art' : 'Error creating species'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.push(`/${locale}/admin/species`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {locale === 'de' ? 'Zurück zu Arten' : 'Back to Species'}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <TreePine className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'de' ? 'Neue Art hinzufügen' : 'Add New Species'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'de' 
              ? 'Fügen Sie eine neue Pflanzenart zur Datenbank hinzu'
              : 'Add a new plant species to the database'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'de' ? 'Grundinformationen' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {locale === 'de' 
                  ? 'Erforderliche Informationen zur Art'
                  : 'Required information about the species'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scientific_name">
                    {locale === 'de' ? 'Wissenschaftlicher Name *' : 'Scientific Name *'}
                  </Label>
                  <Input
                    id="scientific_name"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                    placeholder="z.B. Camellia japonica"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="common_name_de">
                    {locale === 'de' ? 'Deutscher Name *' : 'German Common Name *'}
                  </Label>
                  <Input
                    id="common_name_de"
                    value={formData.common_name_de}
                    onChange={(e) => setFormData({ ...formData, common_name_de: e.target.value })}
                    placeholder="z.B. Japanische Kamelie"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="common_name_en">
                    {locale === 'de' ? 'Englischer Name' : 'English Common Name'}
                  </Label>
                  <Input
                    id="common_name_en"
                    value={formData.common_name_en}
                    onChange={(e) => setFormData({ ...formData, common_name_en: e.target.value })}
                    placeholder="e.g. Japanese Camellia"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description_de">
                  {locale === 'de' ? 'Beschreibung (Deutsch)' : 'Description (German)'}
                </Label>
                <Textarea
                  id="description_de"
                  value={formData.description_de}
                  onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                  rows={4}
                  placeholder={locale === 'de' ? 'Beschreibung der Art...' : 'Description of the species...'}
                />
              </div>

              <div>
                <Label htmlFor="description_en">
                  {locale === 'de' ? 'Beschreibung (Englisch)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  placeholder="Description of the species..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Care Information */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'de' ? 'Pflegeinformationen' : 'Care Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="care_notes_de">
                  {locale === 'de' ? 'Pflegetipps (Deutsch)' : 'Care Notes (German)'}
                </Label>
                <Textarea
                  id="care_notes_de"
                  value={formData.care_notes_de}
                  onChange={(e) => setFormData({ ...formData, care_notes_de: e.target.value })}
                  rows={4}
                  placeholder={locale === 'de' ? 'Pflegetipps und Anmerkungen...' : 'Care tips and notes...'}
                />
              </div>

              <div>
                <Label htmlFor="care_notes_en">
                  {locale === 'de' ? 'Pflegetipps (Englisch)' : 'Care Notes (English)'}
                </Label>
                <Textarea
                  id="care_notes_en"
                  value={formData.care_notes_en}
                  onChange={(e) => setFormData({ ...formData, care_notes_en: e.target.value })}
                  rows={4}
                  placeholder="Care tips and notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Growing Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'de' ? 'Wachstumsbedingungen' : 'Growing Conditions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="flowering_period_start">
                    {locale === 'de' ? 'Blütezeit Start (Monat)' : 'Flowering Period Start (Month)'}
                  </Label>
                  <Input
                    id="flowering_period_start"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.flowering_period_start}
                    onChange={(e) => setFormData({ ...formData, flowering_period_start: e.target.value })}
                    placeholder="1-12"
                  />
                </div>
                <div>
                  <Label htmlFor="flowering_period_end">
                    {locale === 'de' ? 'Blütezeit Ende (Monat)' : 'Flowering Period End (Month)'}
                  </Label>
                  <Input
                    id="flowering_period_end"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.flowering_period_end}
                    onChange={(e) => setFormData({ ...formData, flowering_period_end: e.target.value })}
                    placeholder="1-12"
                  />
                </div>
                <div>
                  <Label htmlFor="hardiness_zone_min">
                    {locale === 'de' ? 'Winterhärtezone Minimum' : 'Hardiness Zone Minimum'}
                  </Label>
                  <Input
                    id="hardiness_zone_min"
                    type="number"
                    value={formData.hardiness_zone_min}
                    onChange={(e) => setFormData({ ...formData, hardiness_zone_min: e.target.value })}
                    placeholder="z.B. 7"
                  />
                </div>
                <div>
                  <Label htmlFor="hardiness_zone_max">
                    {locale === 'de' ? 'Winterhärtezone Maximum' : 'Hardiness Zone Maximum'}
                  </Label>
                  <Input
                    id="hardiness_zone_max"
                    type="number"
                    value={formData.hardiness_zone_max}
                    onChange={(e) => setFormData({ ...formData, hardiness_zone_max: e.target.value })}
                    placeholder="z.B. 9"
                  />
                </div>
                <div>
                  <Label htmlFor="sun_exposure">
                    {locale === 'de' ? 'Sonneneinstrahlung' : 'Sun Exposure'}
                  </Label>
                  <Select
                    value={formData.sun_exposure}
                    onValueChange={(value: 'full_sun' | 'partial_shade' | 'shade') => 
                      setFormData({ ...formData, sun_exposure: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locale === 'de' ? 'Wählen Sie...' : 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_sun">
                        {locale === 'de' ? 'Volle Sonne' : 'Full Sun'}
                      </SelectItem>
                      <SelectItem value="partial_shade">
                        {locale === 'de' ? 'Halbschatten' : 'Partial Shade'}
                      </SelectItem>
                      <SelectItem value="shade">
                        {locale === 'de' ? 'Schatten' : 'Shade'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="soil_type">
                    {locale === 'de' ? 'Bodentyp' : 'Soil Type'}
                  </Label>
                  <Select
                    value={formData.soil_type}
                    onValueChange={(value: 'acidic' | 'neutral' | 'alkaline') => 
                      setFormData({ ...formData, soil_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={locale === 'de' ? 'Wählen Sie...' : 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acidic">
                        {locale === 'de' ? 'Sauer' : 'Acidic'}
                      </SelectItem>
                      <SelectItem value="neutral">
                        {locale === 'de' ? 'Neutral' : 'Neutral'}
                      </SelectItem>
                      <SelectItem value="alkaline">
                        {locale === 'de' ? 'Alkalisches' : 'Alkaline'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Information */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'de' ? 'Größeninformationen' : 'Size Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_height_cm">
                    {locale === 'de' ? 'Maximale Höhe (cm)' : 'Maximum Height (cm)'}
                  </Label>
                  <Input
                    id="max_height_cm"
                    type="number"
                    value={formData.max_height_cm}
                    onChange={(e) => setFormData({ ...formData, max_height_cm: e.target.value })}
                    placeholder="z.B. 300"
                  />
                </div>
                <div>
                  <Label htmlFor="max_width_cm">
                    {locale === 'de' ? 'Maximale Breite (cm)' : 'Maximum Width (cm)'}
                  </Label>
                  <Input
                    id="max_width_cm"
                    type="number"
                    value={formData.max_width_cm}
                    onChange={(e) => setFormData({ ...formData, max_width_cm: e.target.value })}
                    placeholder="z.B. 200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/admin/species`)}
              disabled={saving}
            >
              {locale === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving 
                ? (locale === 'de' ? 'Wird gespeichert...' : 'Saving...') 
                : (locale === 'de' ? 'Art speichern' : 'Save Species')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

