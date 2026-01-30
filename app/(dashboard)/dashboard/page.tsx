'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    console.log('=== Dashboard Redirect Logic ===')
    console.log('User:', user)
    console.log('Profile:', profile)
    console.log('Loading:', loading)

    if (loading) {
      console.log('⏳ Still loading, waiting...')
      return
    }

    if (!user) {
      console.log('❌ No user, redirecting to login')
      router.push('/login')
      return
    }

    if (!profile) {
      console.log('⚠️ User exists but no profile yet')
      return
    }

    // Redirect based on role
    const hospitalRoles = ['hospital', 'cpo', 'cfo', 'admin']
    
    if (hospitalRoles.includes(profile.role)) {
      console.log('✅ Redirecting to hospital dashboard')
      router.replace('/dashboard/hospital')
    } else {
      console.log('✅ Redirecting to vendor dashboard')
      router.replace('/dashboard/vendor')
    }
  }, [user, profile, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}
