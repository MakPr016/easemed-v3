// app/(auth)/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, ShoppingBag, ArrowLeft } from 'lucide-react'
import type { UserType } from '@/lib/types/auth'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<UserType>('hospital')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'hospital' || type === 'vendor') {
      setUserType(type)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement Supabase login
      console.log('Login data:', { ...formData, userType })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Invalid email or password' })
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
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your EaseMed account
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link href={`/signup?type=${userType}`} className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
