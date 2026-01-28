// app/(auth)/onboarding/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HospitalOnboarding from '@/components/auth/HospitalOnboarding'
import VendorOnboarding from '@/components/auth/VendorOnboarding'
import type { UserType } from '@/lib/types/auth'

function OnboardingContent() {
  const searchParams = useSearchParams()
  const userType = (searchParams.get('type') || 'hospital') as UserType
  const email = searchParams.get('email') || ''

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      {userType === 'hospital' ? (
        <HospitalOnboarding email={email} />
      ) : (
        <VendorOnboarding email={email} />
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
