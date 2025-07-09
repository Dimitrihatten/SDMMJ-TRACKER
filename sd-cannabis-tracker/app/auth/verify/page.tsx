'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Leaf, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { isValidCardFormat } from '@/lib/medical-verify'

export default function VerifyPage() {
  const router = useRouter()
  const [cardNumber, setCardNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate card format
    if (!isValidCardFormat(cardNumber)) {
      setError('Invalid card format. Please check your medical card number.')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        medicalCardNumber: cardNumber,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid medical card number. Please verify and try again.')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cannabis-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Leaf className="h-10 w-10 text-cannabis-600" />
            <span className="text-3xl font-bold text-gray-900">SD Cannabis Tracker</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Your Medical Card</CardTitle>
            <CardDescription>
              Enter your South Dakota medical cannabis card number to access your patient portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Medical Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="e.g., 4YBPK2GJ2"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                  className="font-mono text-lg"
                  maxLength={12}
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Your card number can be found on your South Dakota medical cannabis card
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-cannabis text-white"
                disabled={isLoading || !cardNumber}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Card'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Security</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-cannabis-600" />
              <span>HIPAA-compliant with AES-256 encryption</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have a medical card?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/cards/resident">
                  <Button variant="outline" size="sm">
                    SD Residents
                  </Button>
                </Link>
                <Link href="/cards/nonresident">
                  <Button variant="outline" size="sm">
                    Non-Residents
                  </Button>
                </Link>
                <Link href="/cards/caregiver">
                  <Button variant="outline" size="sm">
                    Caregivers
                  </Button>
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By verifying your card, you agree to our{' '}
          <Link href="/legal/terms" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}