// app/(auth)/verify-otp/page.tsx
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = searchParams.get('email') || ''
  const userType = searchParams.get('type') || 'hospital'

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1).toUpperCase()
    setOtp(newOtp)

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 8).toUpperCase()
    if (!/^[a-zA-Z0-9]+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(8 - pastedData.length).fill(''))
    setOtp(newOtp)

    const nextEmptyIndex = newOtp.findIndex(val => !val)
    if (nextEmptyIndex === -1) {
      inputRefs.current[7]?.focus()
    } else {
      inputRefs.current[nextEmptyIndex]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 8) {
      setError('Please enter all 8 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Verifying OTP:', otpString, 'for email:', email)

      await new Promise(resolve => setTimeout(resolve, 1000))

      router.push(`/onboarding?email=${encodeURIComponent(email)}&type=${userType}`)
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    try {
      console.log('Resending OTP to:', email)

      await new Promise(resolve => setTimeout(resolve, 500))

      setResendCooldown(60)
      setOtp(['', '', '', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      console.error('Resend error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-secondary/20">
      <div className="w-full max-w-md space-y-6">
        <Link href="/signup">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Verify your email</CardTitle>
              <CardDescription className="mt-2">
                We sent an 8-character code to
                <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-semibold border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                  />
                ))}
              </div>
              {error && (
                <p className="text-sm text-destructive text-center mt-4">{error}</p>
              )}
            </div>

            <Button 
              onClick={handleVerify} 
              className="w-full" 
              size="lg" 
              disabled={loading || otp.join('').length !== 8}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center text-sm">
              <p className="text-muted-foreground mb-2">Didn't receive the code?</p>
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-primary"
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend code'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  )
}
