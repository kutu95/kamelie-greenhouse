'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  TreeDeciduous, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye,
  ArrowLeft,
  CheckSquare,
  Square,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  Flower
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Cultivar = Database['public']['Tables']['cultivars']['Row'] & {
  species: Database['public']['Tables']['species']['Row'] | null;
}

export default function VarietyManagement() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [cultivars, setCultivars] = useState<Cultivar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecies, setFilterSpecies] = useState('')
  const [filterPriceGroup, setFilterPriceGroup] = useState('')
  const [species, setSpecies] = useState<any[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    loadCultivars()
    loadSpecies()
  }, [])

  const loadCultivars = async () => {
    try {
      const { data: cultivarsData, error: cultivarsError } = await supabase
        .from('cultivars')
        .select(`
          *,
          species:species(*)
        `)
        .order('cultivar_name')

      if (cultivarsError) throw cultivarsError

      setCultivars(cultivarsData || [])
    } catch (err) {
      console.error('Error loading cultivars:', err)
      setError('Failed to load varieties')
    } finally {
      setLoading(false)
    }
  }

  const loadSpecies = async () => {
    try {
      const { data: speciesData, error: speciesError } = await supabase
        .from('species')
        .select('*')
        .order('scientific_name')

      if (speciesError) throw speciesError

      setSpecies(speciesData || [])
    } catch (err) {
      console.error('Error loading species:', err)
    }
  }

  const filteredCultivars = cultivars.filter(cultivar => {
    const matchesSearch = !searchTerm || 
      cultivar.cultivar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cultivar.species?.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecies = !filterSpecies || 
      cultivar.species?.scientific_name === filterSpecies
    
    const matchesPriceGroup = !filterPriceGroup || 
      cultivar.price_group === filterPriceGroup

    return matchesSearch && matchesSpecies && matchesPriceGroup
  })

  const getPriceGroupDescription = (priceGroup: string | null, locale: string) => {
    if (!priceGroup) return locale === 'de' ? 'Keine Gruppe' : 'No Group'
    
    const descriptions = {
      'A': locale === 'de' ? 'Gruppe A (Standard)' : 'Group A (Standard)',
      'B': locale === 'de' ? 'Gruppe B (Premium)' : 'Group B (Premium)',
      'C': locale === 'de' ? 'Gruppe C (Selten)' : 'Group C (Rare)'
    }
    
    return descriptions[priceGroup as keyof typeof descriptions] || priceGroup
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_cultivars')}</p>
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${locale}/admin/dashboard`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('back_to_dashboard')}</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {locale === 'de' ? 'Sortenverwaltung' : 'Variety Management'}
                </h1>
                <p className="text-gray-600">
                  {locale === 'de' ? 'Verwalten Sie Ihre Kameliensorten' : 'Manage your camellia varieties'}
                </p>
              </div>
            </div>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{locale === 'de' ? 'Filter' : 'Filters'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Suche' : 'Search'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={locale === 'de' ? 'Sortenname oder Art suchen...' : 'Search variety name or species...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Species Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Art' : 'Species'}
                </label>
                <select
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{locale === 'de' ? 'Alle Arten' : 'All Species'}</option>
                  {species.map((s) => (
                    <option key={s.id} value={s.scientific_name}>
                      {s.scientific_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Group Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'de' ? 'Preisgruppe' : 'Price Group'}
                </label>
                <select
                  value={filterPriceGroup}
                  onChange={(e) => setFilterPriceGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{locale === 'de' ? 'Alle Gruppen' : 'All Groups'}</option>
                  <option value="A">{locale === 'de' ? 'Gruppe A' : 'Group A'}</option>
                  <option value="B">{locale === 'de' ? 'Gruppe B' : 'Group B'}</option>
                  <option value="C">{locale === 'de' ? 'Gruppe C' : 'Group C'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {locale === 'de' ? 'Sorten' : 'Varieties'} ({filteredCultivars.length})
                </CardTitle>
                <CardDescription>
                  {locale === 'de' ? 'Verwalten Sie Ihre Kameliensorten' : 'Manage your camellia varieties'}
                </CardDescription>
              </div>
              <Button onClick={() => router.push(`/${locale}/admin/varieties/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                {locale === 'de' ? 'Neue Sorte' : 'New Variety'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCultivars.length === 0 ? (
              <div className="text-center py-12">
                <TreeDeciduous className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {locale === 'de' ? 'Keine Sorten gefunden' : 'No varieties found'}
                </h3>
                <p className="text-gray-500">
                  {locale === 'de' ? 'Versuchen Sie, Ihre Suchkriterien anzupassen.' : 'Try adjusting your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCultivars.map((cultivar) => (
                  <Card key={cultivar.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Image */}
                      <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 relative overflow-hidden">
                        {cultivar.photo_url ? (
                          <img
                            src={cultivar.photo_url}
                            alt={cultivar.cultivar_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <TreeDeciduous className="h-16 w-16 text-green-600" />
                          </div>
                        )}
                        
                        {/* Price Group Badge */}
                        {cultivar.price_group && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 right-2 bg-white/90 text-gray-700"
                          >
                            {cultivar.price_group}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {cultivar.cultivar_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cultivar.species?.scientific_name}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          {cultivar.flower_color && (
                            <div className="flex items-center space-x-2">
                              <Flower className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {locale === 'de' ? 'Farbe' : 'Color'}: {cultivar.flower_color}
                              </span>
                            </div>
                          )}
                          
                          {cultivar.flower_form && (
                            <div className="flex items-center space-x-2">
                              <Flower className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {locale === 'de' ? 'Form' : 'Form'}: {cultivar.flower_form}
                              </span>
                            </div>
                          )}

                          {cultivar.year_introduced && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {locale === 'de' ? 'Eingeführt' : 'Introduced'}: {cultivar.year_introduced}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/${locale}/admin/varieties/${cultivar.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {locale === 'de' ? 'Bearbeiten' : 'Edit'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/${locale}/catalog/${cultivar.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {locale === 'de' ? 'Anzeigen' : 'View'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
