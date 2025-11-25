'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  TreePine, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Species = Database['public']['Tables']['species']['Row']

export default function SpeciesManagement() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadSpecies()
  }, [])

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
      setError(locale === 'de' ? 'Fehler beim Laden der Arten' : 'Failed to load species')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (speciesItem: Species) => {
    // Check if species has cultivars
    const { data: cultivars, error: checkError } = await supabase
      .from('cultivars')
      .select('id')
      .eq('species_id', speciesItem.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking cultivars:', checkError)
      setError(locale === 'de' ? 'Fehler beim Prüfen der Sorten' : 'Error checking cultivars')
      return
    }

    if (cultivars && cultivars.length > 0) {
      alert(
        locale === 'de' 
          ? `Diese Art kann nicht gelöscht werden, da sie noch ${cultivars.length} Sorte(n) hat. Bitte löschen Sie zuerst alle Sorten.`
          : `This species cannot be deleted because it has ${cultivars.length} cultivar(s). Please delete all cultivars first.`
      )
      return
    }

    if (!confirm(
      locale === 'de' 
        ? `Sind Sie sicher, dass Sie "${speciesItem.scientific_name}" löschen möchten?`
        : `Are you sure you want to delete "${speciesItem.scientific_name}"?`
    )) {
      return
    }

    try {
      const { error } = await supabase
        .from('species')
        .delete()
        .eq('id', speciesItem.id)

      if (error) throw error

      // Update local state
      setSpecies(species.filter(s => s.id !== speciesItem.id))
    } catch (err) {
      console.error('Error deleting species:', err)
      setError(locale === 'de' ? 'Fehler beim Löschen der Art' : 'Error deleting species')
    }
  }

  const filteredSpecies = species.filter(speciesItem => {
    const matchesSearch = !searchTerm || 
      speciesItem.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speciesItem.common_name_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speciesItem.common_name_en && speciesItem.common_name_en.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            {locale === 'de' ? 'Lade Arten...' : 'Loading species...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === 'de' ? 'Arten verwalten' : 'Manage Species'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'de' 
              ? 'Verwalten Sie die Pflanzenarten in Ihrer Datenbank'
              : 'Manage the plant species in your database'}
          </p>
        </div>
        <Button onClick={() => router.push(`/${locale}/admin/species/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          {locale === 'de' ? 'Neue Art hinzufügen' : 'Add New Species'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {locale === 'de' ? 'Alle Arten' : 'All Species'}
              </CardTitle>
              <CardDescription>
                {filteredSpecies.length} {locale === 'de' ? 'Arten gefunden' : 'species found'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={locale === 'de' ? 'Suchen...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSpecies.length === 0 ? (
            <div className="text-center py-12">
              <TreePine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {locale === 'de' 
                  ? 'Keine Arten gefunden. Fügen Sie eine neue Art hinzu.'
                  : 'No species found. Add a new species to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSpecies.map((speciesItem) => (
                <Card key={speciesItem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <TreePine className="h-5 w-5 text-primary" />
                          <h3 className="text-xl font-semibold">
                            {speciesItem.scientific_name}
                          </h3>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">{locale === 'de' ? 'Deutsch:' : 'German:'}</span> {speciesItem.common_name_de}
                          </p>
                          {speciesItem.common_name_en && (
                            <p>
                              <span className="font-medium">{locale === 'de' ? 'Englisch:' : 'English:'}</span> {speciesItem.common_name_en}
                            </p>
                          )}
                          {speciesItem.flowering_period_start && speciesItem.flowering_period_end && (
                            <p>
                              <span className="font-medium">{locale === 'de' ? 'Blütezeit:' : 'Flowering:'}</span> {locale === 'de' ? 'Monat' : 'Month'} {speciesItem.flowering_period_start} - {speciesItem.flowering_period_end}
                            </p>
                          )}
                          {speciesItem.hardiness_zone_min && speciesItem.hardiness_zone_max && (
                            <p>
                              <span className="font-medium">{locale === 'de' ? 'Winterhärte:' : 'Hardiness:'}</span> Zone {speciesItem.hardiness_zone_min} - {speciesItem.hardiness_zone_max}
                            </p>
                          )}
                          {speciesItem.sun_exposure && (
                            <p>
                              <span className="font-medium">{locale === 'de' ? 'Sonneneinstrahlung:' : 'Sun exposure:'}</span> {
                                speciesItem.sun_exposure === 'full_sun' ? (locale === 'de' ? 'Volle Sonne' : 'Full Sun') :
                                speciesItem.sun_exposure === 'partial_shade' ? (locale === 'de' ? 'Halbschatten' : 'Partial Shade') :
                                (locale === 'de' ? 'Schatten' : 'Shade')
                              }
                            </p>
                          )}
                          {speciesItem.soil_type && (
                            <p>
                              <span className="font-medium">{locale === 'de' ? 'Bodentyp:' : 'Soil type:'}</span> {
                                speciesItem.soil_type === 'acidic' ? (locale === 'de' ? 'Sauer' : 'Acidic') :
                                speciesItem.soil_type === 'neutral' ? (locale === 'de' ? 'Neutral' : 'Neutral') :
                                (locale === 'de' ? 'Alkalisches' : 'Alkaline')
                              }
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${locale}/admin/species/${speciesItem.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {locale === 'de' ? 'Bearbeiten' : 'Edit'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(speciesItem)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {locale === 'de' ? 'Löschen' : 'Delete'}
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
    </div>
  )
}

