'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth'

interface BlogPost {
  id: string
  title_de: string
  title_en: string
  slug: string
  content_de: string
  content_en: string
  excerpt_de: string
  excerpt_en: string
  featured_image_url: string
  status: 'draft' | 'published' | 'archived'
  published_at: string
  meta_title_de: string
  meta_title_en: string
  meta_description_de: string
  meta_description_en: string
  tags: string[]
  created_at: string
  updated_at: string
  author_id: string
  author: {
    first_name: string
    last_name: string
  }
}

export default function BlogManagementPage() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const { user, profile } = useAuthStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title_de: '',
    title_en: '',
    slug: '',
    content_de: '',
    content_en: '',
    excerpt_de: '',
    excerpt_en: '',
    featured_image_url: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    meta_title_de: '',
    meta_title_en: '',
    meta_description_de: '',
    meta_description_en: '',
    tags: [] as string[],
    tagInput: ''
  })

  const supabase = createClient()

  // Helper functions to get localized field values
  const getLocalizedTitle = (post: BlogPost) => {
    return locale === 'en' && post.title_en ? post.title_en : post.title_de
  }

  const getLocalizedExcerpt = (post: BlogPost) => {
    return locale === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt_de
  }

  const getLocalizedContent = (post: BlogPost) => {
    return locale === 'en' && post.content_en ? post.content_en : post.content_de
  }

  useEffect(() => {
    if (user && profile?.user_roles?.name === 'admin') {
      fetchPosts()
    }
  }, [user, profile])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:user_profiles!blog_posts_author_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    try {
      // Prepare insert data, excluding fields that shouldn't be inserted
      const insertData = {
        title_de: formData.title_de,
        title_en: formData.title_en,
        slug: formData.slug,
        content_de: formData.content_de,
        content_en: formData.content_en,
        excerpt_de: formData.excerpt_de,
        excerpt_en: formData.excerpt_en,
        featured_image_url: formData.featured_image_url,
        status: formData.status,
        meta_title_de: formData.meta_title_de,
        meta_title_en: formData.meta_title_en,
        meta_description_de: formData.meta_description_de,
        meta_description_en: formData.meta_description_en,
        tags: formData.tags,
        author_id: user?.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      }

      console.log('Creating blog post with data:', insertData)

      // Validate required fields
      if (!insertData.title_de || !insertData.slug || !insertData.content_de) {
        throw new Error('Missing required fields: title_de, slug, or content_de')
      }

      const { error } = await supabase
        .from('blog_posts')
        .insert(insertData)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setIsCreateDialogOpen(false)
      resetForm()
      fetchPosts()
    } catch (err) {
      console.error('Error creating blog post:', err)
      setError(`Failed to create blog post: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleUpdatePost = async () => {
    if (!editingPost) return

    try {
      // Prepare update data, excluding fields that shouldn't be updated
      const updateData = {
        title_de: formData.title_de,
        title_en: formData.title_en,
        slug: formData.slug,
        content_de: formData.content_de,
        content_en: formData.content_en,
        excerpt_de: formData.excerpt_de,
        excerpt_en: formData.excerpt_en,
        featured_image_url: formData.featured_image_url,
        status: formData.status,
        meta_title_de: formData.meta_title_de,
        meta_title_en: formData.meta_title_en,
        meta_description_de: formData.meta_description_de,
        meta_description_en: formData.meta_description_en,
        tags: formData.tags,
        published_at: formData.status === 'published' && editingPost.status !== 'published' 
          ? new Date().toISOString() 
          : editingPost.published_at
      }

      console.log('Updating blog post with data:', updateData)
      console.log('Blog post ID:', editingPost.id)

      // Validate required fields
      if (!updateData.title_de || !updateData.slug || !updateData.content_de) {
        throw new Error('Missing required fields: title_de, slug, or content_de')
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', editingPost.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setIsEditDialogOpen(false)
      setEditingPost(null)
      resetForm()
      fetchPosts()
    } catch (err) {
      console.error('Error updating blog post:', err)
      setError(`Failed to update blog post: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      fetchPosts()
    } catch (err) {
      console.error('Error deleting blog post:', err)
      setError('Failed to delete blog post')
    }
  }

  const resetForm = () => {
    setFormData({
      title_de: '',
      title_en: '',
      slug: '',
      content_de: '',
      content_en: '',
      excerpt_de: '',
      excerpt_en: '',
      featured_image_url: '',
      status: 'draft',
      meta_title_de: '',
      meta_title_en: '',
      meta_description_de: '',
      meta_description_en: '',
      tags: [],
      tagInput: ''
    })
  }

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title_de: post.title_de,
      title_en: post.title_en || '',
      slug: post.slug,
      content_de: post.content_de,
      content_en: post.content_en || '',
      excerpt_de: post.excerpt_de || '',
      excerpt_en: post.excerpt_en || '',
      featured_image_url: post.featured_image_url || '',
      status: post.status,
      meta_title_de: post.meta_title_de || '',
      meta_title_en: post.meta_title_en || '',
      meta_description_de: post.meta_description_de || '',
      meta_description_en: post.meta_description_en || '',
      tags: post.tags || [],
      tagInput: ''
    })
    setIsEditDialogOpen(true)
  }

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const filteredPosts = posts.filter(post => {
    const localizedTitle = getLocalizedTitle(post)
    const matchesSearch = localizedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Blog Post</DialogTitle>
                      <DialogDescription>
                        Create a new blog post for your website
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title_de">Title (German) *</Label>
                        <Input
                          id="title_de"
                          value={formData.title_de}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              title_de: e.target.value,
                              slug: generateSlug(e.target.value)
                            }))
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="title_en">Title (English)</Label>
                        <Input
                          id="title_en"
                          value={formData.title_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="excerpt_de">Excerpt (German)</Label>
                        <Textarea
                          id="excerpt_de"
                          value={formData.excerpt_de}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt_de: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                        <Textarea
                          id="excerpt_en"
                          value={formData.excerpt_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="content_de">Content (German) *</Label>
                        <Textarea
                          id="content_de"
                          value={formData.content_de}
                          onChange={(e) => setFormData(prev => ({ ...prev, content_de: e.target.value }))}
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="content_en">Content (English)</Label>
                        <Textarea
                          id="content_en"
                          value={formData.content_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                          rows={6}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <ImageUpload
                          value={formData.featured_image_url}
                          onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                          label="Featured Image"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            id="tags"
                            placeholder="Add a tag..."
                            value={formData.tagInput}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost} disabled={!formData.title_de || !formData.slug || !formData.content_de}>
                        Create Post
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <div className="grid gap-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No blog posts found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{getLocalizedTitle(post)}</CardTitle>
                      {locale === 'en' && post.title_de && (
                        <CardDescription className="text-sm text-gray-600 mb-2">
                          {post.title_de}
                        </CardDescription>
                      )}
                      {locale === 'de' && post.title_en && (
                        <CardDescription className="text-sm text-gray-600 mb-2">
                          {post.title_en}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author.first_name} {post.author.last_name}
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {post.tags.length} tags
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'destructive'}>
                        {post.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {getLocalizedExcerpt(post) || getLocalizedContent(post).substring(0, 150) + '...'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Blog Post</DialogTitle>
              <DialogDescription>
                Update the blog post information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title_de">Title (German) *</Label>
                <Input
                  id="edit_title_de"
                  value={formData.title_de}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_de: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_title_en">Title (English)</Label>
                <Input
                  id="edit_title_en"
                  value={formData.title_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_slug">Slug *</Label>
                <Input
                  id="edit_slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_excerpt_de">Excerpt (German)</Label>
                <Textarea
                  id="edit_excerpt_de"
                  value={formData.excerpt_de}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt_de: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_excerpt_en">Excerpt (English)</Label>
                <Textarea
                  id="edit_excerpt_en"
                  value={formData.excerpt_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_content_de">Content (German) *</Label>
                <Textarea
                  id="edit_content_de"
                  value={formData.content_de}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_de: e.target.value }))}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit_content_en">Content (English)</Label>
                <Textarea
                  id="edit_content_en"
                  value={formData.content_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                  rows={6}
                />
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  value={formData.featured_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                  label="Featured Image"
                />
              </div>
              <div>
                <Label htmlFor="edit_tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit_tags"
                    placeholder="Add a tag..."
                    value={formData.tagInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePost} disabled={!formData.title_de || !formData.slug || !formData.content_de}>
                Update Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
