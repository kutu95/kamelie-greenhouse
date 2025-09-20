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
              Unsere Leistungen
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professionelle Kamelien-Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Von der Beratung bis zur Pflege - wir bieten Ihnen umfassende Services rund um Ihre Kamelien. 
              Über 35 Jahre Erfahrung für Ihre Pflanzen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/contact" className="flex items-center">
                  Beratung anfragen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/catalog">
                  Katalog ansehen
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
                Unsere Hauptleistungen
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Professionelle Services für alle Ihre Kamelien-Bedürfnisse
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Plant Consultation */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Pflanzenberatung</CardTitle>
                  <CardDescription className="text-gray-600">
                    Individuelle Beratung für Standort, Pflege und Sortenauswahl
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Standortanalyse
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Sortenempfehlungen
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Pflegeanleitung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Problemlösung
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Ab 50€</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Beratung buchen</Link>
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
                  <CardTitle className="text-2xl font-bold text-gray-900">Pflanzenpflege</CardTitle>
                  <CardDescription className="text-gray-600">
                    Professionelle Pflege Ihrer Kamelien durch unsere Experten
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Regelmäßige Kontrolle
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Düngung & Bewässerung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Schnitt & Formung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Schädlingsbekämpfung
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Ab 80€/Monat</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Pflege buchen</Link>
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
                  <CardTitle className="text-2xl font-bold text-gray-900">Winterlagerung</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sichere Überwinterung Ihrer Kamelien in unserem Gewächshaus
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Optimale Temperaturen
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Regelmäßige Pflege
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Abholung & Lieferung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Versicherung inklusive
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Ab 25€/Monat</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Lagerung buchen</Link>
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
                  <CardTitle className="text-2xl font-bold text-gray-900">Lieferung</CardTitle>
                  <CardDescription className="text-gray-600">
                    Professioneller Transport Ihrer Kamelien direkt zu Ihnen
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Vorsichtiger Transport
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Terminvereinbarung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Aufstellung vor Ort
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Pflegehinweise
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Ab 15€</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Lieferung anfragen</Link>
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
                  <CardTitle className="text-2xl font-bold text-gray-900">Pflanzung</CardTitle>
                  <CardDescription className="text-gray-600">
                    Professionelle Pflanzung und Einrichtung Ihrer Kamelien
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Standortvorbereitung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Fachgerechte Pflanzung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Bewässerungssystem
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Nachbetreuung
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Ab 120€</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Pflanzung buchen</Link>
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
                  <CardTitle className="text-2xl font-bold text-gray-900">Garantie</CardTitle>
                  <CardDescription className="text-gray-600">
                    Umfassende Garantie und Service für Ihre Kamelien
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      2 Jahre Anwuchsgarantie
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Kostenlose Beratung
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Ersatz bei Ausfall
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      Lebenslanger Support
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Inklusive</Badge>
                    <Button className="w-full" asChild>
                      <Link href="/contact">Details anfragen</Link>
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
                Spezialisierte Services
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Zusätzliche Services für besondere Anforderungen
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
                      <CardTitle className="text-2xl font-bold text-gray-900">Gesundheitscheck</CardTitle>
                      <CardDescription className="text-gray-600">
                        Professionelle Analyse Ihrer Kamelien
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Detaillierte Untersuchung Ihrer Pflanzen auf Krankheiten, Schädlinge und Nährstoffmangel. 
                    Mit anschließender Behandlungsempfehlung.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Ab 60€</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Termin buchen</Link>
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
                      <CardTitle className="text-2xl font-bold text-gray-900">Umtopfen</CardTitle>
                      <CardDescription className="text-gray-600">
                        Professionelles Umtopfen Ihrer Kamelien
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Fachgerechtes Umtopfen mit optimaler Erde und passendem Topf. 
                    Inklusive Wurzelpflege und Düngung.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Ab 40€</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Service buchen</Link>
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
                      <CardTitle className="text-2xl font-bold text-gray-900">Saisonale Pflege</CardTitle>
                      <CardDescription className="text-gray-600">
                        Angepasste Pflege je nach Jahreszeit
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Spezielle Pflegemaßnahmen für Frühling, Sommer, Herbst und Winter. 
                    Optimale Bedingungen für jede Jahreszeit.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Ab 100€/Saison</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Pflegeplan erstellen</Link>
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
                      <CardTitle className="text-2xl font-bold text-gray-900">Notdienst</CardTitle>
                      <CardDescription className="text-gray-600">
                        Schnelle Hilfe bei akuten Problemen
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Bei akuten Problemen mit Ihren Kamelien bieten wir schnelle Hilfe. 
                    Notfallberatung und Vor-Ort-Service.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Ab 80€</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Notfall melden</Link>
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
                So funktioniert's
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Einfacher Ablauf für Ihre Service-Anfrage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Anfrage</h3>
                <p className="text-gray-600">
                  Kontaktieren Sie uns telefonisch oder per E-Mail mit Ihren Wünschen
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Beratung</h3>
                <p className="text-gray-600">
                  Wir besprechen Ihre Anforderungen und erstellen ein individuelles Angebot
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Termin</h3>
                <p className="text-gray-600">
                  Vereinbarung eines passenden Termins für die Durchführung des Services
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Durchführung</h3>
                <p className="text-gray-600">
                  Professionelle Ausführung des Services durch unsere Experten
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
              Bereit für Ihre Kamelien-Services?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie uns für eine individuelle Beratung und ein unverbindliches Angebot. 
              Wir freuen uns auf Ihre Anfrage!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" asChild>
                <Link href="/contact" className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Jetzt anrufen
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-green-600" asChild>
                <Link href="/contact" className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  E-Mail senden
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
