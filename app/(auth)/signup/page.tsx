'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, ShoppingBag, ArrowLeft } from 'lucide-react'
import type { UserType } from '@/lib/types/auth'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [userType, setUserType] = useState<UserType>('hospital')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'hospital' || type === 'vendor') {
      setUserType(type)
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: userType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=${userType}`)
    } catch (error: any) {
      console.error('Signup error:', error)
      setErrors({ 
        general: error.message || 'Failed to create account. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-secondary/20">
      <div className="w-full max-w-md space-y-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">E</span>
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Join EaseMed to streamline your procurement
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hospital" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Hospital
                </TabsTrigger>
                <TabsTrigger value="vendor" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Vendor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {errors.general && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link href={`/login?type=${userType}`} className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
