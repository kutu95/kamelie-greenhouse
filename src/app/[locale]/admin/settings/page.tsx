'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Save, Globe, Mail, Phone, MapPin, Clock, Settings, DollarSign, Building } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

interface SystemSetting {
  id: string
  key: string
  value: any
  description: string
  updated_at: string
}

export default function SystemSettingsPage() {
  const t = useTranslations('admin')
  const { user, profile } = useAuthStore()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    site_name: '',
    default_language: 'de',
    currency: 'EUR',
    tax_rate: 0.19,
    winter_storage_fee_per_month: 15.00,
    min_order_amount: 50.00,
    contact_email: '',
    contact_phone: '',
    contact_mobile: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: '',
    greenhouse_size: 1700,
    total_area: 14000,
    business_hours_monday: 'closed',
    business_hours_tuesday: '14:00-18:00',
    business_hours_wednesday: '14:00-18:00',
    business_hours_thursday: '14:00-18:00',
    business_hours_friday: '14:00-18:00',
    business_hours_saturday: '14:00-18:00',
    business_hours_sunday: 'closed',
    seasonal_hours: true,
    opening_months: ['march', 'april', 'may']
  })

  const supabase = createClient()

  useEffect(() => {
    if (user && profile?.user_roles?.name === 'admin') {
      fetchSettings()
    }
  }, [user, profile])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key')

      if (error) throw error

      const settingsMap: { [key: string]: any } = {}
      data?.forEach(setting => {
        settingsMap[setting.key] = setting.value
      })

      setFormData({
        site_name: settingsMap.site_name || '',
        default_language: settingsMap.default_language || 'de',
        currency: settingsMap.currency || 'EUR',
        tax_rate: settingsMap.tax_rate || 0.19,
        winter_storage_fee_per_month: settingsMap.winter_storage_fee_per_month || 15.00,
        min_order_amount: settingsMap.min_order_amount || 50.00,
        contact_email: settingsMap.contact_email || '',
        contact_phone: settingsMap.contact_phone || '',
        contact_mobile: settingsMap.contact_mobile || '',
        address_street: settingsMap.address?.street || '',
        address_city: settingsMap.address?.city || '',
        address_postal_code: settingsMap.address?.postal_code || '',
        address_country: settingsMap.address?.country || '',
        greenhouse_size: settingsMap.greenhouse_size || 1700,
        total_area: settingsMap.total_area || 14000,
        business_hours_monday: settingsMap.business_hours?.monday || 'closed',
        business_hours_tuesday: settingsMap.business_hours?.tuesday || '14:00-18:00',
        business_hours_wednesday: settingsMap.business_hours?.wednesday || '14:00-18:00',
        business_hours_thursday: settingsMap.business_hours?.thursday || '14:00-18:00',
        business_hours_friday: settingsMap.business_hours?.friday || '14:00-18:00',
        business_hours_saturday: settingsMap.business_hours?.saturday || '14:00-18:00',
        business_hours_sunday: settingsMap.business_hours?.sunday || 'closed',
        seasonal_hours: settingsMap.seasonal_hours || true,
        opening_months: settingsMap.opening_months || ['march', 'april', 'may']
      })
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to fetch system settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const settingsToUpdate = [
        { key: 'site_name', value: formData.site_name },
        { key: 'default_language', value: formData.default_language },
        { key: 'currency', value: formData.currency },
        { key: 'tax_rate', value: formData.tax_rate },
        { key: 'winter_storage_fee_per_month', value: formData.winter_storage_fee_per_month },
        { key: 'min_order_amount', value: formData.min_order_amount },
        { key: 'contact_email', value: formData.contact_email },
        { key: 'contact_phone', value: formData.contact_phone },
        { key: 'contact_mobile', value: formData.contact_mobile },
        { 
          key: 'address', 
          value: {
            street: formData.address_street,
            city: formData.address_city,
            postal_code: formData.address_postal_code,
            country: formData.address_country
          }
        },
        { key: 'greenhouse_size', value: formData.greenhouse_size },
        { key: 'total_area', value: formData.total_area },
        { 
          key: 'business_hours', 
          value: {
            monday: formData.business_hours_monday,
            tuesday: formData.business_hours_tuesday,
            wednesday: formData.business_hours_wednesday,
            thursday: formData.business_hours_thursday,
            friday: formData.business_hours_friday,
            saturday: formData.business_hours_saturday,
            sunday: formData.business_hours_sunday
          }
        },
        { key: 'seasonal_hours', value: formData.seasonal_hours },
        { key: 'opening_months', value: formData.opening_months }
      ]

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!user || profile?.user_roles?.name !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Configure your website and business settings</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic website and business configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="default_language">Default Language</Label>
                  <Select value={formData.default_language} onValueChange={(value) => setFormData(prev => ({ ...prev, default_language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
              <CardDescription>
                Contact details and business address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_mobile">Mobile</Label>
                  <Input
                    id="contact_mobile"
                    value={formData.contact_mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_mobile: e.target.value }))}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_street">Street</Label>
                    <Input
                      id="address_street"
                      value={formData.address_street}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_street: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      value={formData.address_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_postal_code">Postal Code</Label>
                    <Input
                      id="address_postal_code"
                      value={formData.address_postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_postal_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_country">Country</Label>
                    <Input
                      id="address_country"
                      value={formData.address_country}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Operating hours and seasonal settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="seasonal_hours"
                  checked={formData.seasonal_hours}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, seasonal_hours: checked }))}
                />
                <Label htmlFor="seasonal_hours">Seasonal Business Hours</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="business_hours_monday">Monday</Label>
                  <Input
                    id="business_hours_monday"
                    value={formData.business_hours_monday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_monday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_tuesday">Tuesday</Label>
                  <Input
                    id="business_hours_tuesday"
                    value={formData.business_hours_tuesday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_tuesday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_wednesday">Wednesday</Label>
                  <Input
                    id="business_hours_wednesday"
                    value={formData.business_hours_wednesday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_wednesday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_thursday">Thursday</Label>
                  <Input
                    id="business_hours_thursday"
                    value={formData.business_hours_thursday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_thursday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_friday">Friday</Label>
                  <Input
                    id="business_hours_friday"
                    value={formData.business_hours_friday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_friday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_saturday">Saturday</Label>
                  <Input
                    id="business_hours_saturday"
                    value={formData.business_hours_saturday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_saturday: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="business_hours_sunday">Sunday</Label>
                  <Input
                    id="business_hours_sunday"
                    value={formData.business_hours_sunday}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_hours_sunday: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing Settings
              </CardTitle>
              <CardDescription>
                Configure pricing and fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="winter_storage_fee_per_month">Winter Storage Fee (per month)</Label>
                  <Input
                    id="winter_storage_fee_per_month"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.winter_storage_fee_per_month}
                    onChange={(e) => setFormData(prev => ({ ...prev, winter_storage_fee_per_month: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">Minimum Order Amount</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facility Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Facility Information
              </CardTitle>
              <CardDescription>
                Greenhouse and facility details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="greenhouse_size">Greenhouse Size (m²)</Label>
                  <Input
                    id="greenhouse_size"
                    type="number"
                    min="0"
                    value={formData.greenhouse_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, greenhouse_size: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="total_area">Total Area (m²)</Label>
                  <Input
                    id="total_area"
                    type="number"
                    min="0"
                    value={formData.total_area}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_area: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
