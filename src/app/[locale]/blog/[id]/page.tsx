'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Leaf, Home, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
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
  }
}

export default function BlogPostPage() {
  const t = useTranslations('blog')
  const tCommon = useTranslations('common')
  const params = useParams()
  const postSlug = params.id as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchBlogPost()
  }, [postSlug])

  const fetchBlogPost = async () => {
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
        .eq('slug', postSlug)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setPost(data)
    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError('Failed to load blog post')
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
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button variant="ghost" asChild className="hover:bg-green-50 hover:text-green-600">
                <Link href="/blog" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('back_to_blog') || 'Back to Blog'}
                </Link>
              </Button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Leaf className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {t('badge')}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {getLocalizedContent(post, 'title')}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                {getLocalizedContent(post, 'excerpt')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64 lg:h-96">
                <Image
                  src={post.featured_image_url || '/images/hero/quartier-grosspflanzen.jpg'}
                  alt={getLocalizedContent(post, 'title')}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 text-white">
                    {post.tags[0] || 'Article'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 lg:p-12">
                {/* Article Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.published_at).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {calculateReadTime(getLocalizedContent(post, 'content'))} min
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author.first_name} {post.author.last_name}
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {getLocalizedContent(post, 'content')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

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