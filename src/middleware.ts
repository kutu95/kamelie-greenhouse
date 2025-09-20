import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always'
})

export function middleware(request: any) {
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!_next|_static|api|.*\\..*).*)',
  ]
}
