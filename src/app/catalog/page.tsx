'use client'

import { Button } from '@/components/ui/button'
import { Leaf, Search, Filter, Grid, List } from 'lucide-react'

export default function CatalogPage() {
  // Hardcoded translations for non-localized version
  const t = {
    title: 'Kamelien-Katalog',
    subtitle: 'Entdecken Sie unsere Sammlung von über 3.000 Kamelienpflanzen',
    search_placeholder: 'Kamelien suchen...',
    filter: 'Filter',
    grid: 'Grid',
    list: 'Liste',
    load_more: 'Mehr Pflanzen laden',
    details: 'Details'
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4 mr-2" />
                {t.grid}
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                {t.list}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.search_placeholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t.filter}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Sample Plant Cards */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-16 w-16 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Kamelie #{i + 1}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Camellia japonica 'Alba Plena'</h3>
                <p className="text-sm text-gray-600 mb-3">Weiße gefüllte Blüte, sehr robuste Sorte</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">€89,00</span>
                  <Button size="sm">{t.details}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            {t.load_more}
          </Button>
        </div>
      </div>
    </div>
  )
}
