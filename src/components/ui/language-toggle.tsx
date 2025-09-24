'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const newLocale = locale === 'de' ? 'en' : 'de'
    
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 hover:bg-green-50 hover:text-green-600"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">
        {locale === 'de' ? 'EN' : 'DE'}
      </span>
    </Button>
  )
}


