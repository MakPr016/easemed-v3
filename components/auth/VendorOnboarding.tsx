'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Building2,
  Target,
  Shield,
  Banknote,
  Upload,
  MapPin,
  Package,
  Bell,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react'
import { EUROPEAN_COUNTRIES, getEuropeanCitiesByCountry } from '@/lib/constants'

const ABSTRACT_API_KEY = process.env.NEXT_PUBLIC_ABSTRACT_VAT_API_KEY || ''

interface VendorOnboardingProps {
  email: string
}

export default function VendorOnboarding({ email }: VendorOnboardingProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [score, setScore] = useState(20)
  const [expansionInput, setExpansionInput] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    vatId: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    country: 'France',
    email: email,
    phone: '',
    regionsEU: false,
    regionsDACH: false,
    regionsWestern: false,
    regionsEastern: false,
    industry: '',
    otherIndustry: '',
    logisticsCourier: false,
    logisticsCold: false,
    logisticsFreight: false,
    logisticsHazmat: false,
    notificationInstant: true,
    notificationDaily: true,
    notificationWeekly: false,
    expansionInterests: [] as string[],
    bankName: '',
    iban: '',
    bic: '',
    currency: 'EUR',
    certISO: false,
    certGDP: false,
    certCE: false,
    termsAccepted: false
  })

  const [files, setFiles] = useState({
    catalog: null as File | null,
    license: null as File | null,
    iso: null as File | null,
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, country, city: '' })
    setAvailableCities(getEuropeanCitiesByCountry(country))
  }

  const updateScore = (points: number) => {
    setScore((prev) => {
      const newScore = Math.min(prev + points, 100)
      return newScore
    })
  }

  const handleVatVerification = async () => {
    if (!formData.vatId) return

    setIsVerifying(true)

    try {
      const url = `https://vat.abstractapi.com/v1/validate/?api_key=${ABSTRACT_API_KEY}&vat_number=${formData.vatId}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.valid) {
        setIsVerified(true)
        setFormData({
          ...formData,
          businessName: data.company?.name || 'Valid EU Business',
          address: data.company?.address || '123 Innovation Drive',
        })
        updateScore(20)
      } else {
        alert('Invalid VAT Number')
      }
    } catch (error) {
      console.error('VAT verification error:', error)
      alert('Error verifying VAT number')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'catalog' | 'license' | 'iso') => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] })
      updateScore(10)
    }
  }

  const addExpansionInterest = () => {
    if (expansionInput.trim()) {
      setFormData({
        ...formData,
        expansionInterests: [...formData.expansionInterests, expansionInput.trim()]
      })
      setExpansionInput('')
      updateScore(5)
    }
  }

  const removeExpansionInterest = (index: number) => {
    setFormData({
      ...formData,
      expansionInterests: formData.expansionInterests.filter((_, i) => i !== index)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addExpansionInterest()
    }
  }

  const changeStep = (direction: number) => {
    if (currentStep + direction > totalSteps) {
      handleComplete()
      return
    }
    setCurrentStep((prev) => prev + direction)
  }

  const handleComplete = async () => {
    setLoading(true)
    setErrors({})

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: formData.businessName,
          role: 'vendor',
          organization_name: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country
        })

      if (profileError) throw profileError

      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: user.id,
          vendor_name: formData.businessName,
          company_registration: formData.vatId,
          gst_number: formData.vatId,
          vendor_type: formData.industry === 'other' ? formData.otherIndustry : formData.industry,
          contact_person: formData.businessName,
          contact_email: user.email,
          contact_phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          bank_name: formData.bankName,
          bank_account: formData.iban,
          bank_ifsc: formData.bic
        })

      if (vendorError) throw vendorError

      router.push('/dashboard/vendor')
      router.refresh()
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setErrors({ general: error.message || 'Failed to complete onboarding' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-[2fr_1fr]">
        <div className="p-10 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Vendor Registration</h1>
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={currentStep === 1 ? 'text-primary font-semibold' : ''}>Identity</span>
              <span className={currentStep === 2 ? 'text-primary font-semibold' : ''}>Smart Profile</span>
              <span className={currentStep === 3 ? 'text-primary font-semibold' : ''}>Preferences</span>
              <span className={currentStep === 4 ? 'text-primary font-semibold' : ''}>Bank & Docs</span>
            </div>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="flex-1">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-400">
                <div className="space-y-2">
                  <Label htmlFor="vatId">EU VAT Identification Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="vatId"
                      placeholder="e.g., FR123456789"
                      value={formData.vatId}
                      onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                    />
                    <Button
                      type="button"
                      onClick={handleVatVerification}
                      disabled={isVerifying || isVerified}
                      className={isVerified ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : isVerified ? (
                        'Verified'
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                  {isVerified && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Entity Confirmed
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Company Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Auto-filled after verification"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className={isVerified ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Company Address</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Headquarters Country *</Label>
                  <Select value={formData.country} onValueChange={handleCountryChange}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {EUROPEAN_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {availableCities.length > 0 ? (
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Region</Label>
                    <Input
                      id="state"
                      placeholder="State/Region"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Corporate Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Generic domains (gmail, yahoo) are not accepted.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-400">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-full bg-white border-4 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: score > 70 ? '#10b981' : '#e5e7eb',
                          borderTopColor: score > 70 ? '#10b981' : '#586CD6',
                        }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: score > 70 ? '#10b981' : '#586CD6' }}
                        >
                          {score}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900">Profile Strength</h4>
                        <p className="text-xs text-blue-700">Complete profile = Higher ranking in search</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Serviceable Regions (Where do you ship?)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'regionsEU', label: 'All EU-27' },
                      { key: 'regionsDACH', label: 'DACH Region' },
                      { key: 'regionsWestern', label: 'Western Europe' },
                      { key: 'regionsEastern', label: 'Eastern Europe' },
                    ].map((region) => (
                      <label
                        key={region.key}
                        className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData[region.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, [region.key]: checked })
                            if (checked) updateScore(5)
                          }}
                        />
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{region.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Primary Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => {
                      setFormData({ ...formData, industry: value })
                      updateScore(5)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharma">Pharmaceuticals</SelectItem>
                      <SelectItem value="devices">Medical Devices</SelectItem>
                      <SelectItem value="ppe">Consumables & PPE</SelectItem>
                      <SelectItem value="other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.industry === 'other' && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label htmlFor="otherIndustry">Specify Industry</Label>
                    <Input
                      id="otherIndustry"
                      placeholder="e.g. Nuclear Medicine, Hospital Furniture..."
                      value={formData.otherIndustry}
                      onChange={(e) => setFormData({ ...formData, otherIndustry: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Logistics Capabilities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'logisticsCourier', label: 'Standard Courier', icon: Package },
                      { key: 'logisticsCold', label: 'Cold Chain (Vaccine)', icon: Package },
                      { key: 'logisticsFreight', label: 'Heavy Freight', icon: Package },
                      { key: 'logisticsHazmat', label: 'Hazmat Certified', icon: Shield },
                    ].map((capability) => (
                      <label
                        key={capability.key}
                        className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData[capability.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, [capability.key]: checked })
                            if (checked) updateScore(5)
                          }}
                        />
                        <capability.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{capability.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expansion Interests (Future Growth)</Label>
                  <p className="text-xs text-muted-foreground">We'll alert you about RFQs in these areas even if you don't stock them yet.</p>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-12.5">
                    {formData.expansionInterests.map((interest, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeExpansionInterest(index)}
                          className="hover:bg-primary/20 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <Input
                      value={expansionInput}
                      onChange={(e) => setExpansionInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type & Enter"
                      className="border-0 flex-1 min-w-30 focus-visible:ring-0 shadow-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-400">
                <h3 className="text-lg font-semibold">Alert Configuration</h3>

                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'notificationInstant', label: 'Instant (Code Red/Urgent)', checked: true },
                      { key: 'notificationDaily', label: 'Daily Digest', checked: true },
                      { key: 'notificationWeekly', label: 'Weekly Analytics', checked: false },
                    ].map((notification) => (
                      <label
                        key={notification.key}
                        className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData[notification.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => setFormData({ ...formData, [notification.key]: checked })}
                        />
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{notification.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-8">
                  <Label>Bulk Catalog Upload</Label>
                  <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="font-semibold text-sm">Upload Product List</span>
                    <span className="text-xs text-muted-foreground">CSV, Excel, PDF, or DOC</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'catalog')}
                    />
                  </label>
                  {files.catalog && (
                    <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Selected: {files.catalog.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">We will highlight RFQs matching your catalog.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-400">
                <h3 className="text-lg font-semibold">Financials & Compliance</h3>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. BNP Paribas"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      placeholder="FR76..."
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bic">BIC/SWIFT</Label>
                    <Input
                      id="bic"
                      placeholder="BNPAFRPP"
                      value={formData.bic}
                      onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-8">
                  <Label>Certifications (Optional but increases trust)</Label>
                  <div className="space-y-3">
                    {[
                      { key: 'certISO', label: 'ISO 9001 / 13485', desc: 'Quality Management' },
                      { key: 'certGDP', label: 'GDP Certification', desc: 'Good Distribution Practice' },
                      { key: 'certCE', label: 'CE Marking', desc: 'European Conformity' },
                    ].map((cert) => (
                      <label
                        key={cert.key}
                        className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          checked={formData[cert.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, [cert.key]: checked })
                            if (checked) updateScore(10)
                          }}
                        />
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{cert.label}</div>
                          <div className="text-xs text-muted-foreground">{cert.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                    />
                    <span className="text-sm">
                      I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={() => changeStep(-1)}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={() => changeStep(1)}
              disabled={currentStep === 4 && (!formData.termsAccepted || loading)}
            >
              {currentStep === 4 ? (loading ? 'Setting up...' : 'Complete') : 'Continue'}
            </Button>
          </div>
        </div>

        <div className="bg-linear-to-br from-primary/10 to-primary/5 p-10 hidden lg:flex flex-col justify-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Why Join EaseMed?</h2>
              <p className="text-muted-foreground">Access Europe's fastest-growing healthcare procurement network</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Targeted Leads</h4>
                  <p className="text-sm text-muted-foreground">AI-matched RFQs based on your catalog and capabilities</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Verified Partners</h4>
                  <p className="text-sm text-muted-foreground">All hospitals are pre-screened for credibility</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Fast Payments</h4>
                  <p className="text-sm text-muted-foreground">Secure escrow + Net-30 terms standard</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-primary/20">
              <p className="text-sm text-muted-foreground italic">"We've increased our hospital accounts by 300% in just 6 months through EaseMed's platform."</p>
              <p className="text-sm font-semibold mt-2">— MedTech Solutions GmbH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
