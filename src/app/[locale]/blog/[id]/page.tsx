'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, ArrowLeft, Leaf, Home, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

export default function BlogPostPage() {
  const t = useTranslations('blog')
  const tCommon = useTranslations('common')
  const params = useParams()
  const postId = parseInt(params.id as string)

  // Sample blog posts data (same as in main blog page)
  const blogPosts = [
    {
      id: 1,
      title: t('posts.care_timing.title'),
      excerpt: t('posts.care_timing.excerpt'),
      content: 'Die Kamelien-Pflege ist eine Kunst, die Geduld und Wissen erfordert. Der beste Zeitpunkt für die Pflege Ihrer Kamelien hängt von verschiedenen Faktoren ab. Im Frühjahr, wenn die Pflanze aus ihrer Winterruhe erwacht, ist der ideale Zeitpunkt für den Rückschnitt und die Düngung. Der Sommer eignet sich besonders gut für das Umtopfen und die Vermehrung. Im Herbst sollten Sie Ihre Kamelien auf den Winter vorbereiten, während der Winter selbst eine Ruhephase für die Pflanzen darstellt.',
      author: 'Michael von Allesch',
      date: '2024-01-15',
      readTime: '5 min',
      category: t('posts.care_timing.category'),
      image: '/images/hero/quartier-grosspflanzen.jpg',
      featured: true
    },
    {
      id: 2,
      title: t('posts.garden_varieties.title'),
      excerpt: t('posts.garden_varieties.excerpt'),
      content: 'Mit über 3.000 verschiedenen Sorten in unserer Sammlung bieten wir eine beeindruckende Vielfalt für jeden Garten. Von kompakten Sorten für kleine Gärten bis hin zu imposanten Exemplaren für große Landschaften - die Auswahl ist grenzenlos. Besonders beliebt sind die winterharten Sorten, die auch in kälteren Regionen Deutschlands gedeihen. Wir beraten Sie gerne bei der Auswahl der passenden Sorte für Ihren Standort und Ihre Bedürfnisse.',
      author: 'Michael von Allesch',
      date: '2024-01-10',
      readTime: '7 min',
      category: t('posts.garden_varieties.category'),
      image: '/images/hero/quartier-grosspflanzen.jpg',
      featured: false
    },
    {
      id: 3,
      title: t('posts.wintering.title'),
      excerpt: t('posts.wintering.excerpt'),
      content: 'Die Überwinterung ist ein entscheidender Faktor für gesunde Kamelien. In unserem Gewächshaus sorgen wir für optimale Bedingungen während der kalten Monate. Die Temperatur wird konstant zwischen 5-10°C gehalten, und wir achten auf ausreichende Luftfeuchtigkeit. Regelmäßige Kontrollen auf Schädlinge und Krankheiten sind unerlässlich. Mit über 35 Jahren Erfahrung haben wir die besten Methoden für die erfolgreiche Überwinterung entwickelt.',
      author: 'Michael von Allesch',
      date: '2024-01-05',
      readTime: '6 min',
      category: t('posts.wintering.category'),
      image: '/images/hero/quartier-grosspflanzen.jpg',
      featured: false
    },
    {
      id: 4,
      title: t('posts.history.title'),
      excerpt: t('posts.history.excerpt'),
      content: t('posts.history.content'),
      author: 'Michael von Allesch',
      date: '2024-01-01',
      readTime: '8 min',
      category: t('posts.history.category'),
      image: '/images/hero/quartier-grosspflanzen.jpg',
      featured: false
    }
  ]

  // Find the blog post by ID
  const post = blogPosts.find(p => p.id === postId)

  if (!post) {
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
                {post.title}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                {post.excerpt}
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
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 text-white">
                    {post.category}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 lg:p-12">
                {/* Article Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.date).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.content}
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
