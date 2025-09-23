'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Save,
  X,
  Loader2,
  Euro,
  Calculator
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPrice } from '@/lib/supabase/pricing'

interface PricingMatrixEntry {
  id: string
  price_group: 'A' | 'B' | 'C'
  age_years: number
  pot_size: string
  base_price_euros: number
  is_available: boolean
}

interface EditingEntry {
  id: string | null
  price_group: 'A' | 'B' | 'C'
  age_years: number
  pot_size: string
  base_price_euros: number
  is_available: boolean
}

export default function AdminPricingPage() {
  const [pricingEntries, setPricingEntries] = useState<PricingMatrixEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null)
  const [filterGroup, setFilterGroup] = useState<'all' | 'A' | 'B' | 'C'>('all')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPricingMatrix()
  }, [])

  const loadPricingMatrix = async () => {
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

      // Load pricing matrix
      const { data: pricingData, error } = await supabase
        .from('pricing_matrix')
        .select('*')
        .order('price_group')
        .order('age_years')
        .order('pot_size')

      if (error) {
        setError('Failed to load pricing matrix')
        return
      }

      setPricingEntries(pricingData || [])
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = pricingEntries.filter(entry => 
    filterGroup === 'all' || entry.price_group === filterGroup
  )

  const getPriceGroupBadge = (group: 'A' | 'B' | 'C') => {
    const colors = {
      'A': 'bg-blue-100 text-blue-800',
      'B': 'bg-purple-100 text-purple-800', 
      'C': 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[group]}>
        Group {group}
      </Badge>
    )
  }

  const startEditing = (entry: PricingMatrixEntry | null) => {
    if (entry) {
      setEditingEntry({ ...entry })
    } else {
      setEditingEntry({
        id: null,
        price_group: 'A',
        age_years: 1,
        pot_size: '',
        base_price_euros: 0,
        is_available: true
      })
    }
  }

  const cancelEditing = () => {
    setEditingEntry(null)
  }

  const handleEditChange = (field: keyof EditingEntry, value: string | number | boolean) => {
    if (!editingEntry) return
    
    setEditingEntry({
      ...editingEntry,
      [field]: value
    })
  }

  const saveEntry = async () => {
    if (!editingEntry) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (editingEntry.id) {
        // Update existing entry
        const { error } = await supabase
          .from('pricing_matrix')
          .update({
            price_group: editingEntry.price_group,
            age_years: editingEntry.age_years,
            pot_size: editingEntry.pot_size,
            base_price_euros: editingEntry.base_price_euros,
            is_available: editingEntry.is_available,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id)

        if (error) throw error
        setSuccess('Pricing entry updated successfully')
      } else {
        // Create new entry
        const { error } = await supabase
          .from('pricing_matrix')
          .insert({
            price_group: editingEntry.price_group,
            age_years: editingEntry.age_years,
            pot_size: editingEntry.pot_size,
            base_price_euros: editingEntry.base_price_euros,
            is_available: editingEntry.is_available
          })

        if (error) throw error
        setSuccess('Pricing entry created successfully')
      }

      setEditingEntry(null)
      await loadPricingMatrix()
    } catch (err: any) {
      setError(err.message || 'Failed to save pricing entry')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing matrix...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Pricing Matrix Management</h1>
                <p className="text-gray-600">Manage A/B/C pricing groups and price calculations</p>
              </div>
            </div>
            <Button onClick={() => startEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
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
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>Filter by Price Group:</Label>
              <Select value={filterGroup} onValueChange={(value: any) => setFilterGroup(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="A">Group A (Standard)</SelectItem>
                  <SelectItem value="B">Group B (Premium)</SelectItem>
                  <SelectItem value="C">Group C (Rare)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Editing Form */}
        {editingEntry && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingEntry.id ? 'Edit Pricing Entry' : 'Add New Pricing Entry'}
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_group">Price Group *</Label>
                  <Select 
                    value={editingEntry.price_group} 
                    onValueChange={(value: 'A' | 'B' | 'C') => handleEditChange('price_group', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Group A (Standard)</SelectItem>
                      <SelectItem value="B">Group B (Premium)</SelectItem>
                      <SelectItem value="C">Group C (Rare)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_years">Age (years) *</Label>
                  <Input
                    id="age_years"
                    type="number"
                    min="0"
                    value={editingEntry.age_years}
                    onChange={(e) => handleEditChange('age_years', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pot_size">Pot Size *</Label>
                  <Input
                    id="pot_size"
                    value={editingEntry.pot_size}
                    onChange={(e) => handleEditChange('pot_size', e.target.value)}
                    placeholder="e.g., 20cm, 5L"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_price_euros">Base Price (€) *</Label>
                  <Input
                    id="base_price_euros"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingEntry.base_price_euros}
                    onChange={(e) => handleEditChange('base_price_euros', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={editingEntry.is_available}
                  onCheckedChange={(checked) => handleEditChange('is_available', checked)}
                />
                <Label htmlFor="is_available">Available for pricing</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEntry} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Matrix Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Pricing Matrix ({filteredEntries.length} entries)
            </CardTitle>
            <CardDescription>
              Configure base prices for different plant ages and pot sizes within each price group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">Price Group</th>
                    <th className="text-left p-3 font-medium text-gray-900">Age (years)</th>
                    <th className="text-left p-3 font-medium text-gray-900">Pot Size</th>
                    <th className="text-left p-3 font-medium text-gray-900">Base Price</th>
                    <th className="text-left p-3 font-medium text-gray-900">Status</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {getPriceGroupBadge(entry.price_group)}
                      </td>
                      <td className="p-3 text-gray-900">{entry.age_years}</td>
                      <td className="p-3 text-gray-900">{entry.pot_size}</td>
                      <td className="p-3 text-gray-900 font-medium">
                        €{formatPrice(entry.base_price_euros, 'en-US')}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={entry.is_available 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {entry.is_available ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditing(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing entries found</h3>
                <p className="text-gray-600 mb-4">
                  {filterGroup !== 'all' 
                    ? `No entries found for Group ${filterGroup}.` 
                    : 'Get started by adding your first pricing entry.'
                  }
                </p>
                <Button onClick={() => startEditing(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
