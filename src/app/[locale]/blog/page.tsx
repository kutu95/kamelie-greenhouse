'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowRight, Leaf, Home, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

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
  status: string
  published_at: string
  tags: string[]
  author: {
    first_name: string
    last_name: string
  } | null
}

export default function BlogPage() {
  const t = useTranslations('blog')
  const tCommon = useTranslations('common')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
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
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error) throw error
      setBlogPosts(data || [])
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const getLocalizedContent = (post: BlogPost, field: 'title' | 'excerpt' | 'content') => {
    const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'de'
    const suffix = locale === 'en' ? '_en' : '_de'
    return post[`${field}${suffix}` as keyof BlogPost] as string
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const featuredPost = blogPosts.find(post => post.tags.includes('featured'))
  const regularPosts = blogPosts.filter(post => !post.tags.includes('featured'))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Leaf className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {t('badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={featuredPost.featured_image_url || '/images/hero/quartier-grosspflanzen.jpg'}
                    alt={getLocalizedContent(featuredPost, 'title')}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600 text-white">
                      {featuredPost.tags[0] || 'Featured'}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 sm:p-8 lg:p-12">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.published_at).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateReadTime(getLocalizedContent(featuredPost, 'content'))} min
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author?.first_name && featuredPost.author?.last_name 
                        ? `${featuredPost.author.first_name} ${featuredPost.author.last_name}`
                        : 'Unknown Author'}
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {getLocalizedContent(featuredPost, 'title')}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {getLocalizedContent(featuredPost, 'excerpt')}
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700" asChild>
                    <Link href={`/blog/${featuredPost.slug}`} className="flex items-center">
                      {t('read_article')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={post.featured_image_url || '/images/hero/quartier-grosspflanzen.jpg'}
                    alt={getLocalizedContent(post, 'title')}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-600 text-white">
                      {post.tags[0] || 'Article'}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(post.published_at).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {calculateReadTime(getLocalizedContent(post, 'content'))} min
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl line-clamp-2 group-hover:text-green-600 transition-colors">
                    {getLocalizedContent(post, 'title')}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {getLocalizedContent(post, 'excerpt')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {post.author?.first_name && post.author?.last_name 
                        ? `${post.author.first_name} ${post.author.last_name}`
                        : 'Unknown Author'}
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-green-600 hover:text-green-700">
                      <Link href={`/blog/${post.slug}`} className="flex items-center">
                        {t('read')}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 sm:py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t('newsletter_title')}
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            {t('newsletter_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('newsletter_placeholder')}
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300 focus:outline-none"
            />
            <Button className="bg-white text-green-600 hover:bg-green-50 px-6 py-3">
              {t('newsletter_subscribe')}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t('contact_title')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('contact_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('contact_phone')}</h3>
                <p className="text-sm text-gray-600">+49 40 220 94 58</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('contact_email')}</h3>
                <p className="text-sm text-gray-600">info@kamelie.net</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">{t('contact_visit')}</h3>
                <p className="text-sm text-gray-600">Kurfürstendeich 54, Hamburg</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/contact">{t('contact_cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
