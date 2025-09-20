'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  TreeDeciduous
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface PlantData {
  id: string
  plant_code: string | null
  age_years: number
  height_cm: number | null
  width_cm: number | null
  pot_size: string | null
  price_band: 'budget' | 'standard' | 'premium' | 'luxury' | null
  price_euros: number | null
  status: 'available' | 'reserved' | 'sold' | 'maintenance'
  location: string | null
  notes: string | null
  is_quick_buy: boolean
  cultivar: {
    id: string
    cultivar_name: string
    species: {
      id: string
      scientific_name: string
    }
  }
}

interface Cultivar {
  id: string
  cultivar_name: string
  species: {
    id: string
    scientific_name: string
  }
}

export default function EditPlantPage() {
  const [plant, setPlant] = useState<PlantData | null>(null)
  const [cultivars, setCultivars] = useState<Cultivar[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const plantId = params.id as string

  const [formData, setFormData] = useState({
    cultivar_id: '',
    plant_code: '',
    age_years: 0,
    height_cm: '',
    width_cm: '',
    pot_size: '',
    price_band: '',
    price_euros: '',
    status: 'available',
    location: '',
    notes: '',
    is_quick_buy: false
  })

  useEffect(() => {
    loadPlantData()
    loadCultivars()
  }, [plantId])

  const loadPlantData = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          id,
          role_id,
          user_roles!inner(name)
        `)
        .eq('id', user.id)
        .single()

      if (profile?.user_roles?.name !== 'admin') {
        router.push('/admin/login')
        return
      }

      // Load plant data
      const { data: plantData, error } = await supabase
        .from('plants')
        .select(`
          *,
          cultivar:cultivars(
            id,
            cultivar_name,
            species:species(id, scientific_name)
          )
        `)
        .eq('id', plantId)
        .single()

      if (error) {
        setError('Failed to load plant data')
        return
      }

      if (!plantData) {
        setError('Plant not found')
        return
      }

      setPlant(plantData)
      setFormData({
        cultivar_id: plantData.cultivar_id,
        plant_code: plantData.plant_code || '',
        age_years: plantData.age_years,
        height_cm: plantData.height_cm?.toString() || '',
        width_cm: plantData.width_cm?.toString() || '',
        pot_size: plantData.pot_size || '',
        price_band: plantData.price_band || '',
        price_euros: plantData.price_euros?.toString() || '',
        status: plantData.status,
        location: plantData.location || '',
        notes: plantData.notes || '',
        is_quick_buy: plantData.is_quick_buy
      })
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadCultivars = async () => {
    try {
      const { data: cultivarsData, error } = await supabase
        .from('cultivars')
        .select(`
          id,
          cultivar_name,
          species:species(id, scientific_name)
        `)
        .order('cultivar_name')

      if (error) {
        console.error('Failed to load cultivars:', error)
        return
      }

      setCultivars(cultivarsData || [])
    } catch (err) {
      console.error('Error loading cultivars:', err)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.cultivar_id) {
        setError('Cultivar is required')
        return
      }

      if (formData.age_years < 0) {
        setError('Age must be a positive number')
        return
      }

      // Prepare update data
      const updateData = {
        cultivar_id: formData.cultivar_id,
        plant_code: formData.plant_code || null,
        age_years: formData.age_years,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        width_cm: formData.width_cm ? parseInt(formData.width_cm) : null,
        pot_size: formData.pot_size || null,
        price_band: formData.price_band || null,
        price_euros: formData.price_euros ? parseFloat(formData.price_euros) : null,
        status: formData.status,
        location: formData.location || null,
        notes: formData.notes || null,
        is_quick_buy: formData.is_quick_buy,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('plants')
        .update(updateData)
        .eq('id', plantId)

      if (error) {
        setError('Failed to update plant: ' + error.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/plants')
      }, 1500)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plant data...</p>
        </div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🌿</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Plant not found</h3>
          <p className="text-gray-600 mb-4">The plant you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/plants')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plants
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/plants')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plants
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Plant</h1>
                <p className="text-gray-600">
                  {plant.cultivar.cultivar_name} - {plant.cultivar.species.scientific_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <TreeDeciduous className="h-3 w-3 mr-1" />
                {plant.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        
        {success ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Plant updated successfully! Redirecting...
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core plant details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cultivar">Cultivar *</Label>
                <Select value={formData.cultivar_id} onValueChange={(value) => handleInputChange('cultivar_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cultivar" />
                  </SelectTrigger>
                  <SelectContent>
                    {cultivars.map((cultivar) => (
                      <SelectItem key={cultivar.id} value={cultivar.id}>
                        {cultivar.cultivar_name} - {cultivar.species.scientific_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant_code">Plant Code</Label>
                <Input
                  id="plant_code"
                  value={formData.plant_code}
                  onChange={(e) => handleInputChange('plant_code', e.target.value)}
                  placeholder="e.g., CAM-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_years">Age (years) *</Label>
                  <Input
                    id="age_years"
                    type="number"
                    min="0"
                    value={formData.age_years}
                    onChange={(e) => handleInputChange('age_years', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Greenhouse location"
                />
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Properties</CardTitle>
              <CardDescription>Size and container information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => handleInputChange('height_cm', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width_cm">Width (cm)</Label>
                  <Input
                    id="width_cm"
                    type="number"
                    value={formData.width_cm}
                    onChange={(e) => handleInputChange('width_cm', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pot_size">Pot Size</Label>
                <Input
                  id="pot_size"
                  value={formData.pot_size}
                  onChange={(e) => handleInputChange('pot_size', e.target.value)}
                  placeholder="e.g., 20cm, 5L"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_quick_buy"
                  checked={formData.is_quick_buy}
                  onCheckedChange={(checked) => handleInputChange('is_quick_buy', checked)}
                />
                <Label htmlFor="is_quick_buy">Quick Buy (Standard sizes only)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Price band and actual price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price_band">Price Band</Label>
                <Select value={formData.price_band} onValueChange={(value) => handleInputChange('price_band', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_euros">Price (€)</Label>
                <Input
                  id="price_euros"
                  type="number"
                  step="0.01"
                  value={formData.price_euros}
                  onChange={(e) => handleInputChange('price_euros', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Internal notes and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special notes about this plant..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="min-w-32"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
