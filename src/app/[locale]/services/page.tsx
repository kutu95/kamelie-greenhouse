'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Leaf, 
  Home, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Truck, 
  Wrench, 
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  TreePine,
  Droplets,
  Sun,
  Thermometer
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function ServicesPage() {
  const t = useTranslations('services')

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              {t('main_services')}
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/contact" className="flex items-center">
                  {t('cta_consultation')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/catalog">
                  {t('cta_catalog')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('main_services')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('main_services_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Plant Consultation */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('consultation')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('consultation_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('consultation_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('consultation_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('consultation_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('consultation_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('consultation_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('consultation_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plant Care */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('plant_care')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('plant_care_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('plant_care_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('plant_care_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('plant_care_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('plant_care_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('plant_care_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('plant_care_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Winter Storage */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Home className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('winter_storage')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('winter_storage_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('winter_storage_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('winter_storage_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('winter_storage_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('winter_storage_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('winter_storage_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('winter_storage_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plant Delivery */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('delivery')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('delivery_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('delivery_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('delivery_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('delivery_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('delivery_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('delivery_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('delivery_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plant Installation */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Wrench className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('planting')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('planting_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('planting_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('planting_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('planting_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('planting_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('planting_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('planting_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plant Guarantee */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">{t('guarantee')}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {t('guarantee_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('guarantee_feature1')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('guarantee_feature2')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('guarantee_feature3')}
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {t('guarantee_feature4')}
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">{t('guarantee_price')}</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">{t('guarantee_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('specialized_services')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('specialized_services_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plant Health Check */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center">
                      <TreePine className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{t('health_check')}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {t('health_check_desc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {t('health_check_desc_long')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{t('health_check_price')}</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">{t('health_check_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Potting */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center">
                      <Droplets className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{t('repotting')}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {t('repotting_desc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {t('repotting_desc_long')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{t('repotting_price')}</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">{t('repotting_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seasonal Care */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{t('seasonal_care')}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {t('seasonal_care_desc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {t('seasonal_care_desc_long')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{t('seasonal_care_price')}</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">{t('seasonal_care_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Service */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{t('emergency')}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {t('emergency_desc')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {t('emergency_desc_long')}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{t('emergency_price')}</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">{t('emergency_book')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('how_it_works')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('how_it_works_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('step1')}</h3>
                <p className="text-gray-600">
                  {t('step1_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('step2')}</h3>
                <p className="text-gray-600">
                  {t('step2_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('step3')}</h3>
                <p className="text-gray-600">
                  {t('step3_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('step4')}</h3>
                <p className="text-gray-600">
                  {t('step4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              {t('cta_title')}
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              {t('cta_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/contact" className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('cta_call_now')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-green-600" asChild>
                <Link href="/contact" className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  {t('cta_send_email')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
