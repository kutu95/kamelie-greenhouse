'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  CreditCard, 
  Save, 
  TestTube, 
  Globe, 
  Key, 
  Webhook,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface StripeSetting {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: 'string' | 'boolean' | 'number'
  description: string | null
  is_encrypted: boolean
  updated_at: string
}

export default function StripeSettingsPage() {
  const t = useTranslations('admin')
  const params = useParams()
  const locale = params.locale as string
  
  const [settings, setSettings] = useState<StripeSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  const supabase = createClient()
  const isGerman = locale === 'de'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_settings')
        .select('*')
        .order('setting_key')

      if (error) throw error
      setSettings(data || [])
    } catch (err: any) {
      console.error('Error loading Stripe settings:', err)
      setError(isGerman ? 'Fehler beim Laden der Einstellungen' : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: String(value) }
        : setting
    ))
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update each setting
      for (const setting of settings) {
        const { error } = await supabase
          .from('stripe_settings')
          .update({ setting_value: setting.setting_value })
          .eq('setting_key', setting.setting_key)

        if (error) throw error
      }

      setSuccess(isGerman ? 'Einstellungen erfolgreich gespeichert!' : 'Settings saved successfully!')
    } catch (err: any) {
      console.error('Error saving Stripe settings:', err)
      setError(isGerman ? 'Fehler beim Speichern der Einstellungen' : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const getSettingIcon = (key: string) => {
    if (key.includes('webhook')) return <Webhook className="h-4 w-4" />
    if (key.includes('key')) return <Key className="h-4 w-4" />
    if (key.includes('test_mode') || key.includes('enabled')) return <TestTube className="h-4 w-4" />
    if (key.includes('currency') || key.includes('url')) return <Globe className="h-4 w-4" />
    return <CreditCard className="h-4 w-4" />
  }

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      stripe_publishable_key: isGerman ? 'Veröffentlichbarer Schlüssel' : 'Publishable Key',
      stripe_secret_key: isGerman ? 'Geheimer Schlüssel' : 'Secret Key',
      stripe_webhook_secret: isGerman ? 'Webhook Geheimnis' : 'Webhook Secret',
      stripe_webhook_url: isGerman ? 'Webhook URL' : 'Webhook URL',
      stripe_test_mode: isGerman ? 'Test-Modus' : 'Test Mode',
      stripe_currency: isGerman ? 'Währung' : 'Currency',
      stripe_payment_methods: isGerman ? 'Zahlungsmethoden' : 'Payment Methods',
      stripe_success_url: isGerman ? 'Erfolgs-URL' : 'Success URL',
      stripe_cancel_url: isGerman ? 'Abbruch-URL' : 'Cancel URL',
      stripe_enabled: isGerman ? 'Stripe aktiviert' : 'Stripe Enabled'
    }
    return labels[key] || key.replace('stripe_', '').replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">{isGerman ? 'Lade Stripe-Einstellungen...' : 'Loading Stripe settings...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-green-600" />
            <span>{isGerman ? 'Stripe-Zahlungseinstellungen' : 'Stripe Payment Settings'}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {isGerman 
              ? 'Konfigurieren Sie Ihre Stripe-Zahlungsverarbeitung'
              : 'Configure your Stripe payment processing'
            }
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{isGerman ? 'Grundkonfiguration' : 'Basic Configuration'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Enabled */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    {getSettingLabel('stripe_enabled')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {isGerman 
                      ? 'Aktivieren Sie Stripe-Zahlungen auf Ihrer Website'
                      : 'Enable Stripe payments on your website'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.find(s => s.setting_key === 'stripe_enabled')?.setting_value === 'true'}
                  onCheckedChange={(checked) => handleSettingChange('stripe_enabled', checked)}
                />
              </div>

              {/* Test Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    {getSettingLabel('stripe_test_mode')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {isGerman 
                      ? 'Verwenden Sie Test-Zahlungen für die Entwicklung'
                      : 'Use test payments for development'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.find(s => s.setting_key === 'stripe_test_mode')?.setting_value === 'true'}
                  onCheckedChange={(checked) => handleSettingChange('stripe_test_mode', checked)}
                />
              </div>

              {/* Currency */}
              <div>
                <Label htmlFor="stripe_currency">
                  {getSettingLabel('stripe_currency')}
                </Label>
                <Input
                  id="stripe_currency"
                  value={settings.find(s => s.setting_key === 'stripe_currency')?.setting_value || 'EUR'}
                  onChange={(e) => handleSettingChange('stripe_currency', e.target.value)}
                  placeholder="EUR"
                  className="max-w-32"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman ? '3-stelliger Währungscode (z.B. EUR, USD)' : '3-letter currency code (e.g. EUR, USD)'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>{isGerman ? 'API-Schlüssel' : 'API Keys'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Publishable Key */}
              <div>
                <Label htmlFor="stripe_publishable_key">
                  {getSettingLabel('stripe_publishable_key')}
                </Label>
                <div className="relative">
                  <Input
                    id="stripe_publishable_key"
                    type="text"
                    value={settings.find(s => s.setting_key === 'stripe_publishable_key')?.setting_value || ''}
                    onChange={(e) => handleSettingChange('stripe_publishable_key', e.target.value)}
                    placeholder="pk_test_..."
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getSettingIcon('stripe_publishable_key')}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'Ihr öffentlicher Stripe-Schlüssel (beginnt mit pk_)'
                    : 'Your public Stripe key (starts with pk_)'
                  }
                </p>
              </div>

              {/* Secret Key */}
              <div>
                <Label htmlFor="stripe_secret_key">
                  {getSettingLabel('stripe_secret_key')}
                </Label>
                <div className="relative">
                  <Input
                    id="stripe_secret_key"
                    type={showSecrets['stripe_secret_key'] ? 'text' : 'password'}
                    value={settings.find(s => s.setting_key === 'stripe_secret_key')?.setting_value || ''}
                    onChange={(e) => handleSettingChange('stripe_secret_key', e.target.value)}
                    placeholder="sk_test_..."
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('stripe_secret_key')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets['stripe_secret_key'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {getSettingIcon('stripe_secret_key')}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'Ihr privater Stripe-Schlüssel (beginnt mit sk_) - wird verschlüsselt gespeichert'
                    : 'Your private Stripe key (starts with sk_) - stored encrypted'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-5 w-5" />
                <span>{isGerman ? 'Webhook-Konfiguration' : 'Webhook Configuration'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Webhook URL */}
              <div>
                <Label htmlFor="stripe_webhook_url">
                  {getSettingLabel('stripe_webhook_url')}
                </Label>
                <Input
                  id="stripe_webhook_url"
                  type="url"
                  value={settings.find(s => s.setting_key === 'stripe_webhook_url')?.setting_value || ''}
                  onChange={(e) => handleSettingChange('stripe_webhook_url', e.target.value)}
                  placeholder="https://yourdomain.com/api/stripe/webhook"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'URL für Stripe-Webhook-Ereignisse'
                    : 'URL for Stripe webhook events'
                  }
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <Label htmlFor="stripe_webhook_secret">
                  {getSettingLabel('stripe_webhook_secret')}
                </Label>
                <div className="relative">
                  <Input
                    id="stripe_webhook_secret"
                    type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
                    value={settings.find(s => s.setting_key === 'stripe_webhook_secret')?.setting_value || ''}
                    onChange={(e) => handleSettingChange('stripe_webhook_secret', e.target.value)}
                    placeholder="whsec_..."
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('stripe_webhook_secret')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets['stripe_webhook_secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {getSettingIcon('stripe_webhook_secret')}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'Webhook-Endpunkt-Geheimnis von Ihrem Stripe-Dashboard'
                    : 'Webhook endpoint secret from your Stripe dashboard'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{isGerman ? 'Zahlungsmethoden' : 'Payment Methods'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="stripe_payment_methods">
                  {getSettingLabel('stripe_payment_methods')}
                </Label>
                <Input
                  id="stripe_payment_methods"
                  value={settings.find(s => s.setting_key === 'stripe_payment_methods')?.setting_value || 'card,sepa_debit'}
                  onChange={(e) => handleSettingChange('stripe_payment_methods', e.target.value)}
                  placeholder="card,sepa_debit,ideal"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'Kommagetrennte Liste der verfügbaren Zahlungsmethoden'
                    : 'Comma-separated list of available payment methods'
                  }
                  <br />
                  <span className="text-xs">
                    {isGerman 
                      ? 'Verfügbare Optionen: card, sepa_debit, ideal, bancontact, eps, giropay, sofort'
                      : 'Available options: card, sepa_debit, ideal, bancontact, eps, giropay, sofort'
                    }
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>{isGerman ? 'Weiterleitungs-URLs' : 'Redirect URLs'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="stripe_success_url">
                  {getSettingLabel('stripe_success_url')}
                </Label>
                <Input
                  id="stripe_success_url"
                  value={settings.find(s => s.setting_key === 'stripe_success_url')?.setting_value || '/checkout/success'}
                  onChange={(e) => handleSettingChange('stripe_success_url', e.target.value)}
                  placeholder="/checkout/success"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'URL für erfolgreiche Zahlungen'
                    : 'URL for successful payments'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="stripe_cancel_url">
                  {getSettingLabel('stripe_cancel_url')}
                </Label>
                <Input
                  id="stripe_cancel_url"
                  value={settings.find(s => s.setting_key === 'stripe_cancel_url')?.setting_value || '/checkout/cancel'}
                  onChange={(e) => handleSettingChange('stripe_cancel_url', e.target.value)}
                  placeholder="/checkout/cancel"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {isGerman 
                    ? 'URL für abgebrochene Zahlungen'
                    : 'URL for cancelled payments'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>{isGerman ? 'Hilfe & Links' : 'Help & Links'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    {isGerman ? 'Nützliche Links:' : 'Useful Links:'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <a 
                        href="https://dashboard.stripe.com/apikeys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{isGerman ? 'Stripe API-Schlüssel' : 'Stripe API Keys'}</span>
                      </a>
                    </div>
                    <div>
                      <a 
                        href="https://dashboard.stripe.com/webhooks" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{isGerman ? 'Stripe Webhooks' : 'Stripe Webhooks'}</span>
                      </a>
                    </div>
                    <div>
                      <a 
                        href="https://stripe.com/docs/payments/payment-methods" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{isGerman ? 'Verfügbare Zahlungsmethoden' : 'Available Payment Methods'}</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {isGerman ? 'Test-Modus aktiviert' : 'Test Mode Enabled'}
                  </h4>
                  <p className="text-sm text-blue-800">
                    {isGerman 
                      ? 'Verwenden Sie Test-Karten für die Entwicklung: 4242 4242 4242 4242'
                      : 'Use test cards for development: 4242 4242 4242 4242'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="min-w-32"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGerman ? 'Speichern...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isGerman ? 'Einstellungen speichern' : 'Save Settings'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

