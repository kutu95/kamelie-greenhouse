'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Eye,
  Edit,
  User,
  Users,
  Shield,
  Mail,
  Calendar,
  Plus
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  phone: string
  city: string
  country: string
  language: string
  is_b2b_customer: boolean
  b2b_discount_percentage: number
  created_at: string
  updated_at: string
  user_roles: {
    id: string
    name: string
    description: string
  }
  _count?: {
    orders: number
  }
}

interface UserRole {
  id: string
  name: string
  description: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
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

      // Load all users with role information
      const { data: usersData, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner(
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load users')
        return
      }

      setUsers(usersData || [])
    } catch (err) {
      setError('An unexpected error occurred')
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = filterRole === 'all' || (user as any).user_roles.name === filterRole
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (roleName: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Admin' },
      staff: { color: 'bg-blue-100 text-blue-800', label: 'Staff' },
      retail: { color: 'bg-green-100 text-green-800', label: 'Customer' },
      b2b: { color: 'bg-purple-100 text-purple-800', label: 'B2B Customer' }
    }
    
    const config = roleConfig[roleName as keyof typeof roleConfig] || roleConfig.retail
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const updateUserRole = async (userId: string, newRoleId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role_id: newRoleId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        setError('Failed to update user role')
        return
      }

      // Reload users
      loadUsers()
    } catch (err) {
      setError('Failed to update user role')
    }
  }

  const toggleB2BStatus = async (userId: string, isB2B: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_b2b_customer: !isB2B,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        setError('Failed to update B2B status')
        return
      }

      // Reload users
      loadUsers()
    } catch (err) {
      setError('Failed to update B2B status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {users.length} users
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  {getRoleBadge((user as any).user_roles.name)}
                </div>

                <div className="space-y-2 mb-4">
                  {user.company_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span> {user.company_name}
                    </p>
                  )}
                  {user.phone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {user.phone}
                    </p>
                  )}
                  {user.city && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {user.city}, {user.country}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* B2B Status */}
                {user.is_b2b_customer && (
                  <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800">B2B Customer</span>
                      <span className="text-sm text-purple-600">
                        {user.b2b_discount_percentage}% discount
                      </span>
                    </div>
                  </div>
                )}

                {/* Role Management */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select 
                    value={user.user_roles.id} 
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                {/* B2B Toggle */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                    variant={user.is_b2b_customer ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleB2BStatus(user.id, user.is_b2b_customer)}
                    className="w-full"
                  >
                    {user.is_b2b_customer ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        B2B Customer
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Make B2B
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No users have registered yet.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
