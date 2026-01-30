// lib/types/auth.ts
export type UserType = 'hospital' | 'vendor'

export type HospitalRole = 'cpo' | 'cfo' | 'analyst' | 'pharmacy'
export type VendorRole = 'vendor_admin' | 'vendor_sales' | 'vendor_manager'

export interface SignupFormData {
  email: string
  password: string
  userType: UserType
}

export interface OTPVerificationData {
  email: string
  otp: string
}

export interface HospitalOnboardingData {
  name: string
  role: HospitalRole
  organizationName: string
  phone?: string
  city?: string
  state?: string
  country: string
  hospitalType?: string
  bedCount?: number
  registrationNumber?: string
}

export interface VendorOnboardingData {
  name: string
  role: VendorRole
  organizationName: string
  phone?: string
  city?: string
  state?: string
  country: string
  businessRegistrationNumber?: string
  taxId?: string
  companySize?: string
  industry?: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  role: 'hospital' | 'vendor' | 'admin' | 'cpo' | 'cfo'
  organization_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
