'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Save,
  X,
  Loader2,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getPriceGroupDescription } from '@/lib/supabase/pricing'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface Cultivar {
  id: string
  cultivar_name: string
  price_group: 'A' | 'B' | 'C' | null
  species: {
    id: string
    scientific_name: string
  }
}

interface EditingCultivar {
  id: string
  cultivar_name: string
  price_group: 'A' | 'B' | 'C' | null
}

export default function AdminCultivarsPage() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  
  const [cultivars, setCultivars] = useState<Cultivar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingCultivar, setEditingCultivar] = useState<EditingCultivar | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriceGroup, setFilterPriceGroup] = useState<'all' | 'A' | 'B' | 'C' | 'null'>('all')
  const [selectedCultivars, setSelectedCultivars] = useState<Set<string>>(new Set())
  const [bulkPriceGroup, setBulkPriceGroup] = useState<'A' | 'B' | 'C' | 'none'>('none')
  const [bulkSaving, setBulkSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadCultivars()
  }, [])

  const loadCultivars = async () => {
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

      if (!profile || (profile as any).user_roles?.name !== 'admin') {
        router.push('/admin/login')
        return
      }

      // Load cultivars with price groups
      const { data: cultivarsData, error } = await supabase
        .from('cultivars')
        .select(`
          id,
          cultivar_name,
          price_group,
          species!inner(id, scientific_name)
        `)
        .order('cultivar_name')

      if (error) {
        setError('Failed to load cultivars')
        return
      }

      // Transform the data to match the expected interface
      const transformedCultivars = (cultivarsData || []).map(cultivar => ({
        ...cultivar,
        species: Array.isArray(cultivar.species) ? cultivar.species[0] : cultivar.species
      }))
      setCultivars(transformedCultivars)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredCultivars = cultivars.filter(cultivar => {
    const matchesSearch = cultivar.cultivar_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cultivar.species.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriceGroup = filterPriceGroup === 'all' || 
      (filterPriceGroup === 'null' ? cultivar.price_group === null : cultivar.price_group === filterPriceGroup)
    
    return matchesSearch && matchesPriceGroup
  })

  const getPriceGroupBadge = (group: 'A' | 'B' | 'C' | null) => {
    if (!group) {
      return <Badge variant="secondary">No Group</Badge>
    }
    
    const colors = {
      'A': 'bg-blue-100 text-blue-800',
      'B': 'bg-purple-100 text-purple-800', 
      'C': 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[group]}>
        {getPriceGroupDescription(group, 'en')}
      </Badge>
    )
  }

  const startEditing = (cultivar: Cultivar) => {
    setEditingCultivar({
      id: cultivar.id,
      cultivar_name: cultivar.cultivar_name,
      price_group: cultivar.price_group
    })
  }

  const cancelEditing = () => {
    setEditingCultivar(null)
  }

  const handleEditChange = (field: keyof EditingCultivar, value: string | null) => {
    if (!editingCultivar) return
    
    setEditingCultivar({
      ...editingCultivar,
      [field]: value
    })
  }

  const saveCultivar = async () => {
    if (!editingCultivar) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('cultivars')
        .update({
          price_group: editingCultivar.price_group,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCultivar.id)

      if (error) throw error

      setSuccess(t('price_group_updated'))
      setEditingCultivar(null)
      await loadCultivars()
    } catch (err: any) {
      setError(err.message || t('failed_to_update'))
    } finally {
      setSaving(false)
    }
  }

  const handleSelectCultivar = (cultivarId: string) => {
    const newSelected = new Set(selectedCultivars)
    if (newSelected.has(cultivarId)) {
      newSelected.delete(cultivarId)
    } else {
      newSelected.add(cultivarId)
    }
    setSelectedCultivars(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCultivars.size === filteredCultivars.length) {
      setSelectedCultivars(new Set())
    } else {
      setSelectedCultivars(new Set(filteredCultivars.map(c => c.id)))
    }
  }

  const bulkUpdatePriceGroups = async () => {
    if (selectedCultivars.size === 0 || bulkPriceGroup === 'none') return

    setBulkSaving(true)
    setError('')
    setSuccess('')

    try {
      let priceGroupValue: 'A' | 'B' | 'C' | null = null
      if ((bulkPriceGroup as any) !== 'none') {
        priceGroupValue = bulkPriceGroup as 'A' | 'B' | 'C'
      }
      
      const { error } = await supabase
        .from('cultivars')
        .update({
          price_group: priceGroupValue,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedCultivars))

      if (error) throw error

      setSuccess(t('bulk_updated', { count: selectedCultivars.size, group: bulkPriceGroup }))
      setSelectedCultivars(new Set())
      setBulkPriceGroup('none')
      await loadCultivars()
    } catch (err: any) {
      setError(err.message || t('failed_to_update_bulk'))
    } finally {
      setBulkSaving(false)
    }
  }

  const getPriceGroupStats = () => {
    const stats = {
      'A': 0,
      'B': 0,
      'C': 0,
      'null': 0
    }
    
    cultivars.forEach(cultivar => {
      if (cultivar.price_group) {
        stats[cultivar.price_group]++
      } else {
        stats.null++
      }
    })
    
    return stats
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

  const stats = getPriceGroupStats()

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
                {t('back_to_dashboard')}
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('cultivar_price_group_management')}</h1>
                <p className="text-gray-600">{t('cultivar_price_groups_desc')}</p>
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
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Group A (Standard)</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.A}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">A</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Group B (Premium)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.B}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">B</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Group C (Rare)</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.C}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">C</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No Group</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.null}</p>
                </div>
                <Badge variant="secondary">-</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('search_cultivars_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterPriceGroup}
                  onChange={(e) => setFilterPriceGroup(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">{t('all_groups')}</option>
                  <option value="A">{t('group_a_standard')}</option>
                  <option value="B">{t('group_b_premium')}</option>
                  <option value="C">{t('group_c_rare')}</option>
                  <option value="null">{t('no_group_assigned')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCultivars.size > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {t('cultivars_selected', { count: selectedCultivars.size })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bulk_price_group" className="text-sm">{t('set_to')}</Label>
                    <Select value={bulkPriceGroup} onValueChange={(value: any) => setBulkPriceGroup(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('remove_group')}</SelectItem>
                        <SelectItem value="A">{t('group_a_standard')}</SelectItem>
                        <SelectItem value="B">{t('group_b_premium')}</SelectItem>
                        <SelectItem value="C">{t('group_c_rare')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={bulkUpdatePriceGroups}
                      disabled={bulkSaving || bulkPriceGroup === 'none'}
                      size="sm"
                    >
                      {bulkSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('apply')
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCultivars(new Set())}
                >
                  {t('clear_selection')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cultivars Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cultivars_total', { count: filteredCultivars.length })}</CardTitle>
            <CardDescription>
              {t('select_cultivars_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900 w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        {selectedCultivars.size === filteredCultivars.length && filteredCultivars.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium text-gray-900">{t('cultivar_name')}</th>
                    <th className="text-left p-3 font-medium text-gray-900">{t('scientific_name')}</th>
                    <th className="text-left p-3 font-medium text-gray-900">{t('current_price_group')}</th>
                    <th className="text-left p-3 font-medium text-gray-900">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCultivars.map((cultivar) => (
                    <tr key={cultivar.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <button
                          onClick={() => handleSelectCultivar(cultivar.id)}
                          className="flex items-center justify-center w-6 h-6 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          {selectedCultivars.has(cultivar.id) ? (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">
                          {cultivar.cultivar_name}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">
                          {cultivar.species.scientific_name}
                        </div>
                      </td>
                      <td className="p-3">
                        {editingCultivar?.id === cultivar.id ? (
                          <Select 
                            value={editingCultivar.price_group || 'none'} 
                            onValueChange={(value: string) => handleEditChange('price_group', value === 'none' ? null : value as 'A' | 'B' | 'C')}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder={t('select_group')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('no_group')}</SelectItem>
                              <SelectItem value="A">{t('group_a_standard')}</SelectItem>
                              <SelectItem value="B">{t('group_b_premium')}</SelectItem>
                              <SelectItem value="C">{t('group_c_rare')}</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getPriceGroupBadge(cultivar.price_group)
                        )}
                      </td>
                      <td className="p-3">
                        {editingCultivar?.id === cultivar.id ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={saveCultivar} 
                              disabled={saving}
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEditing(cultivar)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredCultivars.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌿</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_cultivars_found')}</h3>
              <p className="text-gray-600">
                {searchTerm || filterPriceGroup !== 'all' 
                  ? t('adjust_search_filter')
                  : t('no_cultivars_available')
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
