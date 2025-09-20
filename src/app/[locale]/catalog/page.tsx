'use client'

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CatalogClient } from './catalog-client'

export default function CatalogPage() {
  const t = useTranslations('catalog')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
              <p className="text-gray-600">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4 mr-2" />
                {t('grid')}
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                {t('list')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Client-side interactive content */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      }>
        <CatalogClient
          initialPlants={[]}
          initialSpecies={[]}
          initialTotal={0}
          initialFilters={{
            search: '',
            species: '',
            status: 'available',
            color: '',
            size: '',
            priceRange: '',
            hardiness: ''
          }}
          initialPagination={{
            page: 1,
            limit: 12,
            offset: 0
          }}
        />
      </Suspense>
    </div>
  )
}