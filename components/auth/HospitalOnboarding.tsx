// components/auth/HospitalOnboarding.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'

interface HospitalOnboardingProps {
  email: string
}

export default function HospitalOnboarding({ email }: HospitalOnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    phone: '',
    city: '',
    state: '',
    country: 'Germany',
    notificationEmail: true,
    notificationBid: true,
    notificationSMS: false,
    notificationWeekly: true,
    categoriesMedicines: true,
    categoriesEquipment: true,
    categoriesSurgical: false,
    categoriesConsumables: true,
    categoriesDiagnostic: false,
    categoriesOther: false,
    otherCategories: ''
  })

  const totalSteps = 2
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      console.log('Hospital onboarding data:', formData)
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold">EaseMed</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
            </div>
            <span className={step === 1 ? 'font-medium' : 'text-muted-foreground'}>Account Setup</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              2
            </div>
            <span className={step === 2 ? 'font-medium' : 'text-muted-foreground'}>Preferences</span>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mb-2">
          Step {step} of {totalSteps}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set Up Your Organization</CardTitle>
            <CardDescription>
              Please provide your organization details to complete your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold">Organization Details</h3>

              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
                  <SelectTrigger id="organizationType">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public Hospital</SelectItem>
                    <SelectItem value="private">Private Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="specialty">Specialty Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number/License *</Label>
                <Input
                  id="registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Primary Contact</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Administrator Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Position/Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="e.g., Procurement Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpo">Chief Procurement Officer</SelectItem>
                      <SelectItem value="cfo">Chief Financial Officer</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy Manager</SelectItem>
                      <SelectItem value="analyst">Procurement Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Business Address</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="Belgium">Belgium</SelectItem>
                    <SelectItem value="Austria">Austria</SelectItem>
                    <SelectItem value="Switzerland">Switzerland</SelectItem>
                    <SelectItem value="Poland">Poland</SelectItem>
                    <SelectItem value="Sweden">Sweden</SelectItem>
                    <SelectItem value="Denmark">Denmark</SelectItem>
                    <SelectItem value="Norway">Norway</SelectItem>
                    <SelectItem value="Finland">Finland</SelectItem>
                    <SelectItem value="Portugal">Portugal</SelectItem>
                    <SelectItem value="Greece">Greece</SelectItem>
                    <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                    <SelectItem value="Ireland">Ireland</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next: Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Customize Your Experience</CardTitle>
            <CardDescription>
              Set your preferences to optimize your procurement workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Notification Preferences</h3>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationEmail}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationEmail: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">Email notifications for RFQ updates</div>
                    <div className="text-xs text-muted-foreground">Get notified when quotes are received</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationBid}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationBid: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">Email notifications for bid approvals</div>
                    <div className="text-xs text-muted-foreground">Stay informed about approval status</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationSMS}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationSMS: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">SMS alerts for urgent deliveries</div>
                    <div className="text-xs text-muted-foreground">Real-time mobile updates for critical items</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationWeekly}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationWeekly: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">Weekly procurement summary</div>
                    <div className="text-xs text-muted-foreground">Digest of your organization's activity</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Categories of Interest</h3>
              <p className="text-sm text-muted-foreground">Select the categories you procure most frequently</p>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesMedicines}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesMedicines: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Medicines & Pharmaceuticals</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesEquipment}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesEquipment: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Medical Equipment</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesSurgical}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesSurgical: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Surgical Supplies</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesConsumables}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesConsumables: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Consumables</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesDiagnostic}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesDiagnostic: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Diagnostic Tools</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.categoriesOther}
                    onCheckedChange={(checked) => setFormData({ ...formData, categoriesOther: checked as boolean })}
                  />
                  <span className="font-medium text-sm">Other</span>
                </label>
              </div>

              {formData.categoriesOther && (
                <Input
                  placeholder="Specify other categories..."
                  value={formData.otherCategories}
                  onChange={(e) => setFormData({ ...formData, otherCategories: e.target.value })}
                  className="italic"
                />
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? 'Completing Setup...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
