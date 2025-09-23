'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Shield,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postal_code: string | null
  country: string
  language: string
  is_b2b_customer: boolean
  b2b_discount_percentage: number
  notes: string | null
  role_id: string | null
  user_roles: {
    id: string
    name: string
    description: string
  }
}

interface UserRole {
  id: string
  name: string
  description: string
}

export default function EditUserPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Germany',
    language: 'de',
    is_b2b_customer: false,
    b2b_discount_percentage: 0,
    notes: '',
    role_id: ''
  })

  useEffect(() => {
    loadUser()
    loadRoles()
  }, [userId])

  const loadUser = async () => {
    try {
      // Check if current user is admin
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/admin/login')
        return
      }

      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select(`
          id,
          role_id,
          user_roles!inner(name)
        `)
        .eq('id', currentUser.id)
        .single()

      if (!currentProfile || (currentProfile as any).user_roles?.name !== 'admin') {
        router.push('/admin/login')
        return
      }

      // Load the user to edit
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner(
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        setError('User not found')
        return
      }

      setUser(userData)
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        company_name: userData.company_name || '',
        phone: userData.phone || '',
        address_line1: userData.address_line1 || '',
        address_line2: userData.address_line2 || '',
        city: userData.city || '',
        postal_code: userData.postal_code || '',
        country: userData.country || 'Germany',
        language: userData.language || 'de',
        is_b2b_customer: userData.is_b2b_customer || false,
        b2b_discount_percentage: userData.b2b_discount_percentage || 0,
        notes: userData.notes || '',
        role_id: userData.role_id || ''
      })
    } catch (err) {
      setError('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name')

      if (error) {
        console.error('Failed to load roles:', error)
        return
      }

      setRoles(rolesData || [])
    } catch (err) {
      console.error('Error loading roles:', err)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          company_name: formData.company_name || null,
          phone: formData.phone || null,
          address_line1: formData.address_line1 || null,
          address_line2: formData.address_line2 || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country,
          language: formData.language,
          is_b2b_customer: formData.is_b2b_customer,
          b2b_discount_percentage: formData.b2b_discount_percentage,
          notes: formData.notes || null,
          role_id: formData.role_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        setError('Failed to update user')
        return
      }

      setSuccess('User updated successfully')
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (err) {
      setError('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
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
                onClick={() => router.push('/admin/users')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                <p className="text-gray-600">
                  {user.first_name} {user.last_name} ({user.email})
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Basic user details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
              <CardDescription>
                Business details and B2B settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_b2b">B2B Customer</Label>
                  <p className="text-sm text-gray-500">Enable B2B pricing and features</p>
                </div>
                <Switch
                  id="is_b2b"
                  checked={formData.is_b2b_customer}
                  onCheckedChange={(checked) => handleInputChange('is_b2b_customer', checked)}
                />
              </div>

              {formData.is_b2b_customer && (
                <div>
                  <Label htmlFor="b2b_discount">B2B Discount (%)</Label>
                  <Input
                    id="b2b_discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.b2b_discount_percentage}
                    onChange={(e) => handleInputChange('b2b_discount_percentage', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role_id} onValueChange={(value) => handleInputChange('role_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
              <CardDescription>
                User's physical address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleInputChange('address_line1', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleInputChange('address_line2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Additional Notes
              </CardTitle>
              <CardDescription>
                Internal notes about this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any notes about this user..."
                rows={6}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

