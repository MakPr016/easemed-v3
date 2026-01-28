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
