import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('agb')
  
  return {
    title: t('title'),
    description: t('description')
  }
}

export default function AGBPage() {
  const t = useTranslations('agb')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('title')}
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section1.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section1.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section2.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section2.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section3.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section3.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section4.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section4.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section5.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section5.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section6.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section6.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section7.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section7.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section8.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section8.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section9.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section9.content')}
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('section10.title')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t('section10.content')}
              </p>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {t('lastUpdated')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
