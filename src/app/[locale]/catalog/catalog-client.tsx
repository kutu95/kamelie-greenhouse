'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PlantCard } from '@/components/catalog/plant-card'

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
  }
  initialPagination: {
    page: number
    limit: number
    offset: number
  }
}

export function CatalogClient({
  initialPlants,
  initialSpecies,
  initialTotal,
  initialFilters,
  initialPagination
}: CatalogClientProps) {
  const t = useTranslations('catalog')
  
  const [plants, setPlants] = useState(initialPlants)
  const [species, setSpecies] = useState(initialSpecies)
  const [loading, setLoading] = useState(initialPlants.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(initialTotal)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)

  // Fetch function with useCallback to prevent infinite re-renders
  const fetchPlants = useCallback(async (newFilters = filters) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (newFilters.search) params.append('search', newFilters.search)
      if (newFilters.species) params.append('species', newFilters.species)
      if (newFilters.status) params.append('status', newFilters.status)
      if (newFilters.color) params.append('color', newFilters.color)
      if (newFilters.size) params.append('size', newFilters.size)
      if (newFilters.priceRange) params.append('priceRange', newFilters.priceRange)
      if (newFilters.hardiness) params.append('hardiness', newFilters.hardiness)
      params.append('limit', '1000') // Fetch all plants at once
      params.append('offset', '0')

      const url = `/api/plants?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch plants')
      }
      
      const data = await response.json()
      setPlants(data.plants || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching plants:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch plants')
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
      fetchPlants()
      fetchSpecies()
    }
  }, [fetchPlants, fetchSpecies, initialPlants.length]) // Add all dependencies

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    fetchPlants(newFilters)
  }

  const handleSpeciesFilter = (speciesName: string) => {
    const newFilters = { ...filters, species: speciesName }
    setFilters(newFilters)
    fetchPlants(newFilters)
  }

  const resetFilters = () => {
    const newFilters = {
      search: '',
      species: '',
      status: 'available',
      color: '',
      size: '',
      priceRange: '',
      hardiness: ''
    }
    setFilters(newFilters)
    fetchPlants(newFilters)
  }

  // No pagination - show all plants

  // Calculate if filters are active
  const hasActiveFilters = filters.search || filters.species || filters.color || 
                          filters.size || filters.priceRange || filters.hardiness || 
                          filters.status !== 'available'

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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
               fetchPlants(newFilters)
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
                    fetchPlants(newFilters)
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
                    fetchPlants(newFilters)
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
                    fetchPlants(newFilters)
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status') || 'Status'}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    const newFilters = { ...filters, status: e.target.value }
                    setFilters(newFilters)
                    fetchPlants(newFilters)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="available">{t('available') || 'Available'}</option>
                  <option value="reserved">{t('reserved') || 'Reserved'}</option>
                  <option value="sold">{t('sold') || 'Sold'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && plants.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">
              {t('loading_plants')}
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchPlants()}>
              {t('try_again')}
            </Button>
          </div>
        ) : plants.length === 0 ? (
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
              {plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} locale="de" />
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