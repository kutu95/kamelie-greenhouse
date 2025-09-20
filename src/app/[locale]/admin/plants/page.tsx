'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  ArrowLeft,
  Filter
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'

interface Plant {
  id: string
  plant_code: string
  age_years: number
  height_cm: number
  pot_size: string
  price_euros: number
  status: string
  is_quick_buy: boolean
  cultivar: {
    cultivar_name: string
    flower_color: string
    flower_form: string
    special_characteristics: string
    species: {
      scientific_name: string
    }
  }
  photos: Array<{
    id: string
    photo_url: string
    is_primary: boolean
  }>
}

export default function AdminPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPlants()
  }, [])

  const loadPlants = async () => {
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

      // Load all plants
      const { data: plantsData, error } = await supabase
        .from('plants')
        .select(`
          *,
          cultivar:cultivars(
            cultivar_name,
            flower_color,
            flower_form,
            special_characteristics,
            species:species(scientific_name)
          ),
          photos:plant_photos(*)
        `)
        .order('plant_code')

      if (error) {
        setError('Failed to load plants')
        return
      }

      setPlants(plantsData || [])
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.plant_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.cultivar.cultivar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.cultivar.species.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || plant.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case 'reserved':
        return <Badge className="bg-yellow-100 text-yellow-800">Reserved</Badge>
      case 'sold':
        return <Badge className="bg-red-100 text-red-800">Sold</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plants...</p>
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
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Plant Management</h1>
                <p className="text-gray-600">Manage your plant inventory</p>
              </div>
            </div>
            <Button onClick={() => router.push('/admin/plants/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plant
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by plant code, name, or species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => {
            const featuredPhoto = plant.photos?.find(photo => photo.is_primary) || plant.photos?.[0]
            
            return (
              <Card key={plant.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gradient-to-br from-green-100 to-green-200">
                  {featuredPhoto && featuredPhoto.photo_url ? (
                    <Image
                      src={featuredPhoto.photo_url}
                      alt={plant.cultivar.cultivar_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-green-600 text-2xl mb-2">🌿</div>
                        <p className="text-green-700 font-medium">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  {plant.is_quick_buy && (
                    <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                      Quick Buy
                    </Badge>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    {getStatusBadge(plant.status)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {plant.cultivar.cultivar_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {plant.cultivar.species.scientific_name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Code: {plant.plant_code}
                    </p>
                  </div>

                  {/* Plant Details */}
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span>{plant.age_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Height:</span>
                      <span>{plant.height_cm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pot:</span>
                      <span>{plant.pot_size}</span>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold text-green-600">
                        €{plant.price_euros.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/de/catalog?plant=${plant.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/admin/plants/${plant.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredPlants.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌿</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plants found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first plant.'
                }
              </p>
              <Button onClick={() => router.push('/admin/plants/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plant
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
