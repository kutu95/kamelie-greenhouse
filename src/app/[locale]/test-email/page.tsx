'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestEmail = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send test email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Test Email Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>

          {result && (
            <Alert variant={result.error ? 'destructive' : 'default'}>
              <AlertDescription>
                {result.error ? (
                  <div>
                    <strong>Error:</strong> {result.error}
                    <br />
                    <small>Check your RESEND_API_KEY environment variable</small>
                  </div>
                ) : (
                  <div>
                    <strong>Success!</strong> {result.message}
                    <br />
                    <small>Check your email and Resend dashboard</small>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Add your Resend API key to environment variables</li>
              <li>Enter your email address</li>
              <li>Click "Send Test Email"</li>
              <li>Check your email and Resend dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

