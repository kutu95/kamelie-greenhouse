'use client'

import { Button } from '@/components/ui/button'
import { Leaf, Users, Home, Calendar, Phone, Mail, MapPin, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Greenhouse Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/quartier-grosspflanzen.jpg"
            alt="Kamelie Greenhouse Quarter with Large Plants"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/70 to-emerald-900/80"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-green-600/20 text-green-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Image
                    src="/images/icons/April-Rose-icon-small.png"
                    alt="April Rose Camellia Icon"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  {t('hero.badge')}
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  {t('hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-green-100 mb-6 font-light">
                  {t('hero.subtitle')}
                </p>
                <p className="text-lg text-green-200 mb-12 max-w-2xl leading-relaxed">
                  {t('hero.detailedDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="text-lg px-8 py-4 h-auto bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/catalog" className="flex items-center">
                      {t('hero.catalogButton')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2 border-white text-white bg-transparent hover:bg-white hover:text-green-600 font-semibold" asChild>
                    <Link href="/contact">
                      {t('hero.contactButton')}
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Image Content */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 flex items-center justify-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-10 right-10 w-24 h-24 bg-emerald-400 rounded-full blur-2xl"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-300 rounded-full blur-3xl"></div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="text-center relative z-10">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 mb-6 inline-block">
                        <Image
                          src="/images/icons/April-Rose-icon-small.png"
                          alt="April Rose Camellia Icon"
                          width={96}
                          height={96}
                          className="mx-auto"
                        />
                      </div>
                      <h3 className="text-green-800 text-3xl font-bold mb-2">{t('hero.collectionTitle')}</h3>
                      <p className="text-green-700 text-xl mb-4">{t('hero.collectionSubtitle')}</p>
                      <div className="flex justify-center space-x-4 text-sm text-green-600">
                        <span className="bg-white/30 px-3 py-1 rounded-full">{t('hero.plantCount')}</span>
                        <span className="bg-white/30 px-3 py-1 rounded-full">{t('hero.experience')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-xl border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-800">{t('hero.greenhouseSize')}</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl border border-emerald-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-800">{t('hero.plantCount')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              {t('features.badge')}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('features.expertise.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.expertise.description')}
              </p>
            </div>

            <div className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('features.consultation.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.consultation.description')}
              </p>
            </div>

            <div className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Home className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('features.greenhouse.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.greenhouse.description')}
              </p>
            </div>

            <div className="text-center group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-600 to-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('features.blooming.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.blooming.description')}
              </p>
            </div>
          </div>

          {/* Image Gallery Preview */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('gallery.title')}
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('gallery.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 flex items-center justify-center relative">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-green-400 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-emerald-400 rounded-full blur-xl animate-pulse delay-1000"></div>
                  </div>
                  <div className="text-center relative z-10">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-6 mb-4 inline-block">
                      <Leaf className="h-12 w-12 text-green-600 mx-auto" />
                    </div>
                    <h4 className="text-green-800 font-bold text-lg mb-2">{t('gallery.collection.title')}</h4>
                    <p className="text-green-700 text-sm">{t('gallery.collection.subtitle')}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-lg mb-1">{t('gallery.collection.title')}</p>
                    <p className="text-sm opacity-90">{t('gallery.collection.description')}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 via-pink-200 to-rose-200 flex items-center justify-center relative">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-pink-400 rounded-full blur-2xl animate-pulse delay-500"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-rose-400 rounded-full blur-xl animate-pulse delay-1500"></div>
                  </div>
                  <div className="text-center relative z-10">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-6 mb-4 inline-block">
                      <Leaf className="h-12 w-12 text-pink-600 mx-auto" />
                    </div>
                    <h4 className="text-pink-800 font-bold text-lg mb-2">{t('gallery.blooming.title')}</h4>
                    <p className="text-pink-700 text-sm">{t('gallery.blooming.subtitle')}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-lg mb-1">{t('gallery.blooming.title')}</p>
                    <p className="text-sm opacity-90">{t('gallery.blooming.description')}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 via-emerald-200 to-teal-200 flex items-center justify-center relative">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-emerald-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-teal-400 rounded-full blur-xl animate-pulse delay-2000"></div>
                  </div>
                  <div className="text-center relative z-10">
                    <div className="bg-white/30 backdrop-blur-sm rounded-full p-6 mb-4 inline-block">
                      <Home className="h-12 w-12 text-emerald-600 mx-auto" />
                    </div>
                    <h4 className="text-emerald-800 font-bold text-lg mb-2">{t('gallery.greenhouse.title')}</h4>
                    <p className="text-emerald-700 text-sm">{t('gallery.greenhouse.subtitle')}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-lg mb-1">{t('gallery.greenhouse.title')}</p>
                    <p className="text-sm opacity-90">{t('gallery.greenhouse.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm mb-4">
                {t('gallery.tip')}
              </p>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                {t('gallery.viewAllButton')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('contact.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('contact.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('contact.address.title')}</h3>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t('contact.address.content') }}>
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('contact.phone.title')}</h3>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t('contact.phone.content') }}>
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('contact.email.title')}</h3>
                <p className="text-gray-600">
                  {t('contact.email.content')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
              <Link href="/catalog">
                {t('cta.catalogButton')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-green-600" asChild>
              <Link href="/services">
                {t('cta.servicesButton')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
