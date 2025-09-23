'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CultivarCard } from '@/components/catalog/cultivar-card'

interface CatalogClientProps {
  initialPlants: any[]
  initialSpecies: any[]
  initialTotal: number
  initialFilters: {
    search: string
    species: string
    status: string
    color: string
    size: string
    priceRange: string
    hardiness: string
    flowerShape: string
  }
  initialPagination: {
    page: number
    limit: number
    offset: number
  }
  locale: string
}

export function CatalogClient({
  initialPlants,
  initialSpecies,
  initialTotal,
  initialFilters,
  initialPagination,
  locale
}: CatalogClientProps) {
  const t = useTranslations('catalog')
  
  const [cultivars, setCultivars] = useState(initialPlants) // Using cultivars instead of plants
  const [species, setSpecies] = useState(initialSpecies)
  const [loading, setLoading] = useState(initialPlants.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(initialTotal)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)

  // Fetch function with useCallback to prevent infinite re-renders
  const fetchCultivars = useCallback(async (newFilters = filters) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all cultivars first
      const response = await fetch('/api/cultivars')
      
      if (!response.ok) {
        throw new Error('Failed to fetch cultivars')
      }
      
      const data = await response.json()
      let allCultivars = data.cultivars || []
      
      // Apply client-side filtering since we're fetching all cultivars
      if (newFilters.search) {
        const searchTerm = newFilters.search.toLowerCase()
        allCultivars = allCultivars.filter((cultivar: any) => 
          cultivar.cultivar_name.toLowerCase().includes(searchTerm) ||
          cultivar.species?.scientific_name.toLowerCase().includes(searchTerm)
        )
      }
      
      if (newFilters.species) {
        allCultivars = allCultivars.filter((cultivar: any) => 
          cultivar.species?.scientific_name === newFilters.species
        )
      }
      
      if (newFilters.color) {
        allCultivars = allCultivars.filter((cultivar: any) => 
          cultivar.flower_color === newFilters.color
        )
      }
      
      if (newFilters.flowerShape) {
        allCultivars = allCultivars.filter((cultivar: any) => 
          cultivar.flower_form === newFilters.flowerShape
        )
      }
      
      setCultivars(allCultivars)
      setTotal(allCultivars.length)
    } catch (error) {
      console.error('Error fetching cultivars:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch cultivars')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch species function with useCallback
  const fetchSpecies = useCallback(async () => {
    try {
      const response = await fetch('/api/species')
      if (response.ok) {
        const data = await response.json()
        setSpecies(data.species || [])
      }
    } catch (error) {
      console.error('Error fetching species:', error)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    if (initialPlants.length === 0) {
      fetchCultivars()
      fetchSpecies()
    }
  }, [fetchCultivars, fetchSpecies, initialPlants.length]) // Add all dependencies

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchCultivars(newFilters)
  }

  const handleSpeciesFilter = (speciesName: string) => {
    const newFilters = { ...filters, species: speciesName }
    setFilters(newFilters)
    fetchCultivars(newFilters)
  }

  const resetFilters = () => {
    const newFilters = {
      search: '',
      species: '',
      status: 'available',
      color: '',
      size: '',
      priceRange: '',
      hardiness: '',
      flowerShape: ''
    }
    setFilters(newFilters)
    fetchCultivars(newFilters)
  }

  // No pagination - show all plants

  // Calculate if filters are active
  const hasActiveFilters = filters.search || filters.species || filters.color || 
                          filters.size || filters.priceRange || filters.hardiness || 
                          filters.flowerShape || filters.status !== 'available'

  return (
    <>
      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                {t('reset_filters')}
              </Button>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Species Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('species') || 'Species'}
                </label>
                <select
                  value={filters.species}
                  onChange={(e) => handleSpeciesFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('all_species')}</option>
                  {species.map((spec) => (
                    <option key={spec.id} value={spec.scientific_name}>
                      {spec.scientific_name}
                    </option>
                  ))}
                </select>
              </div>

         {/* Color Filter */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             {t('color') || 'Color'}
           </label>
           <select
             value={filters.color}
             onChange={(e) => {
               const newFilters = { ...filters, color: e.target.value }
               setFilters(newFilters)
               fetchCultivars(newFilters)
             }}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
           >
             <option value="">{t('all_colors') || 'All Colors'}</option>
             <option value="Rosa">{t('color_pink') || 'Pink'}</option>
             <option value="Rot">{t('color_red') || 'Red'}</option>
             <option value="Gelb-Weiß">{t('color_yellow_white') || 'Yellow-White'}</option>
             <option value="Rosa-Weiß">{t('color_pink_white') || 'Pink-White'}</option>
             <option value="Rot-Weiß">{t('color_red_white') || 'Red-White'}</option>
             <option value="Mehrfarbig">{t('color_multicolored') || 'Multi-colored'}</option>
           </select>
         </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('size') || 'Size'}
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => {
                    const newFilters = { ...filters, size: e.target.value }
                    setFilters(newFilters)
                    fetchCultivars(newFilters)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('all_sizes') || 'All Sizes'}</option>
                  <option value="small">Small (0-50cm)</option>
                  <option value="medium">Medium (50-100cm)</option>
                  <option value="large">Large (100-200cm)</option>
                  <option value="extra-large">Extra Large (200cm+)</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('price_range') || 'Price Range'}
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => {
                    const newFilters = { ...filters, priceRange: e.target.value }
                    setFilters(newFilters)
                    fetchCultivars(newFilters)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('all_prices') || 'All Prices'}</option>
                  <option value="budget">Budget (€0-50)</option>
                  <option value="standard">Standard (€50-150)</option>
                  <option value="premium">Premium (€150-300)</option>
                  <option value="luxury">Luxury (€300+)</option>
                </select>
              </div>

              {/* Winter Hardiness Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('hardiness') || 'Winter Hardiness'}
                </label>
                <select
                  value={filters.hardiness}
                  onChange={(e) => {
                    const newFilters = { ...filters, hardiness: e.target.value }
                    setFilters(newFilters)
                    fetchCultivars(newFilters)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('all_hardiness') || 'All Hardiness'}</option>
                  <option value="5">★★★★★ (5 stars - Excellent)</option>
                  <option value="4">★★★★ (4 stars - Very Good)</option>
                  <option value="3">★★★ (3 stars - Good)</option>
                  <option value="2">★★ (2 stars - Fair)</option>
                  <option value="1">★ (1 star - Poor)</option>
                </select>
              </div>

              {/* Flower Shape Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('flower_shape') || 'Flower Shape'}
                </label>
                <select
                  value={filters.flowerShape}
                  onChange={(e) => {
                    const newFilters = { ...filters, flowerShape: e.target.value }
                    setFilters(newFilters)
                    fetchCultivars(newFilters)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('all_shapes') || 'All Shapes'}</option>
                  <option value="Einfach">{t('shape_single') || 'Single'}</option>
                  <option value="Halb gefüllt">{t('shape_semi_double') || 'Semi-double'}</option>
                  <option value="Vollständig gefüllt">{t('shape_double') || 'Fully Double'}</option>
                  <option value="Päonienförmig">{t('shape_peony') || 'Peony Form'}</option>
                  <option value="Anemonenförmig">{t('shape_anemone') || 'Anemone Form'}</option>
                  <option value="Rosenförmig">{t('shape_rose') || 'Rose Form'}</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && cultivars.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">
              {t('loading_plants')}
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchCultivars()}>
              {t('try_again')}
            </Button>
          </div>
        ) : cultivars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {t('no_plants_found')}
            </p>
            <Button variant="outline" onClick={resetFilters}>
              {t('reset_filters')}
            </Button>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {hasActiveFilters 
                    ? (t('plants_found', { count: total }) || `${total} plants found`)
                    : `${total} ${t('total_plants') || 'plants found'}`
                  }
                </h3>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t('reset_filters')}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cultivars.map((cultivar) => (
                <CultivarCard key={cultivar.id} cultivar={cultivar} locale={locale} />
              ))}
            </div>
            
            {/* Show total count */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                {hasActiveFilters 
                  ? `${t('plants_found', { count: total }) || `${total} plants found`} (${t('filter') || 'filtered'})`
                  : `${total} ${t('total_plants') || 'plants found'}`
                }
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}