import Link from 'next/link'
import Image from 'next/image'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div>
                <Image
                  src="/images/icons/April-Rose-icon-small.png"
                  alt="April Rose Camellia Icon"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Kamelie Greenhouse</h3>
                <p className="text-sm text-gray-400">Michael von Allesch</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Deutschlands größte Kameliensammlung mit über 35 Jahren Erfahrung. 
              Persönliche Beratung und qualitativ hochwertige Pflanzen.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="text-sm">Kurfürstendeich 54, 21037 Hamburg</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-sm">+49 40 220 94 58</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-sm">info@kamelie.net</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Leistungen
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services/winter-storage" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Überwinterung
                </Link>
              </li>
              <li>
                <Link href="/services/consulting" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Beratung
                </Link>
              </li>
              <li>
                <Link href="/services/b2b" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  B2B Services
                </Link>
              </li>
              <li>
                <Link href="/services/plant-care" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Pflanzenpflege
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Rechtliches</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/impressum" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/widerruf" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                  Widerruf
                </Link>
              </li>
            </ul>
            
            <div className="pt-4">
              <h5 className="text-sm font-semibold text-white mb-3">Öffnungszeiten</h5>
              <div className="text-sm text-gray-300 space-y-1">
                <p>März - Mai</p>
                <p>Di - Sa: 14:00 - 18:00</p>
                <p>Sonntag & Montag: Geschlossen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 Kameliengärtnerei Michael von Allesch. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ in Hamburg</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
