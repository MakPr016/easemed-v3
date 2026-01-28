// components/auth/VendorOnboarding.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle2, Upload, FileText } from 'lucide-react'

interface VendorOnboardingProps {
  email: string
}

export default function VendorOnboarding({ email }: VendorOnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [catalogMethod, setCatalogMethod] = useState('upload')

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    organizationName: '',
    tradingName: '',
    businessRegistrationNumber: '',
    taxId: '',
    yearEstablished: '',
    companySize: '',
    industry: '',
    description: '',
    website: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    complianceISO: false,
    complianceISO13485: false,
    complianceGMP: false,
    complianceFDA: false,
    complianceCE: false,
    complianceMOSAO: false,
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

  const totalSteps = 3
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
      console.log('Vendor onboarding data:', formData)
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
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">E</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
            </div>
            <span className={step === 1 ? 'font-medium' : 'text-muted-foreground'}>Sign Up</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
            </div>
            <span className={step === 2 ? 'font-medium' : 'text-muted-foreground'}>Company Profile</span>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              3
            </div>
            <span className={step === 3 ? 'font-medium' : 'text-muted-foreground'}>Product Catalog</span>
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
            <CardTitle className="text-2xl">Build Your Company Profile</CardTitle>
            <CardDescription>
              Complete all sections to start connecting with hospitals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Company Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="organizationName">Legal Company Name *</Label>
                <Input
                  id="organizationName"
                  placeholder="Enter legal company name"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradingName">Trading Name/DBA <span className="text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="tradingName"
                  placeholder="Enter trading name"
                  value={formData.tradingName}
                  onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
                  <Input
                    id="businessRegistrationNumber"
                    placeholder="e.g., 1234567890"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID/VAT Number *</Label>
                  <Input
                    id="taxId"
                    placeholder="e.g., GB123456789"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established *</Label>
                  <Select value={formData.yearEstablished} onValueChange={(value) => setFormData({ ...formData, yearEstablished: value })}>
                    <SelectTrigger id="yearEstablished">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size *</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                    <SelectTrigger id="companySize">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Business Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry/Sector *</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmaceutical">Pharmaceutical Manufacturing</SelectItem>
                    <SelectItem value="medical_devices">Medical Devices</SelectItem>
                    <SelectItem value="distributor">Medical Distributor</SelectItem>
                    <SelectItem value="equipment">Medical Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your company, products, and services... (200-500 characters)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL <span className="text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Max 2MB, JPG or PNG</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Primary Contact Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Position/Title *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="e.g., Procurement Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor_admin">Business Administrator</SelectItem>
                      <SelectItem value="vendor_sales">Sales Manager</SelectItem>
                      <SelectItem value="vendor_manager">Operations Manager</SelectItem>
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
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Certifications & Compliance <span className="text-muted-foreground">(Optional)</span></h3>
              <p className="text-sm text-muted-foreground">Upload relevant certifications and select compliance standards your company meets.</p>
              
              <div className="space-y-2">
                <Label>Upload Certifications</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Upload ISO, FDA, CE, or other certifications</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB per file)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compliance Standards Met</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceISO}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceISO: checked as boolean })}
                    />
                    <span className="text-sm">ISO 9001</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceISO13485}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceISO13485: checked as boolean })}
                    />
                    <span className="text-sm">ISO 13485</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceGMP}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceGMP: checked as boolean })}
                    />
                    <span className="text-sm">GMP (Good Manufacturing Practice)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceFDA}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceFDA: checked as boolean })}
                    />
                    <span className="text-sm">FDA Registered</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceCE}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceCE: checked as boolean })}
                    />
                    <span className="text-sm">CE Marking</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.complianceMOSAO}
                      onCheckedChange={(checked) => setFormData({ ...formData, complianceMOSAO: checked as boolean })}
                    />
                    <span className="text-sm">MDSAP</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleBack} disabled>
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set Up Your Product Catalog</CardTitle>
            <CardDescription>
              Choose how you'd like to build your product catalog. You can always add or modify items later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={catalogMethod} onValueChange={setCatalogMethod}>
              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${catalogMethod === 'upload' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <RadioGroupItem value="upload" id="upload" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <div className="font-semibold">Upload Existing Catalog</div>
                  </div>
                  <p className="text-sm text-muted-foreground">Import your product list from a CSV or Excel file</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${catalogMethod === 'select' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <RadioGroupItem value="select" id="select" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div className="font-semibold">Select from Standard Categories</div>
                  </div>
                  <p className="text-sm text-muted-foreground">Choose from pre-defined product categories and add typical items</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${catalogMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <RadioGroupItem value="manual" id="manual" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="font-semibold">Build Catalog Manually Later</div>
                  </div>
                  <p className="text-sm text-muted-foreground">Skip this step and add products one by one from your dashboard</p>
                </div>
              </label>
            </RadioGroup>

            {catalogMethod === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Drag & drop your catalog file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supported: .csv, .xlsx (max 10MB)</p>
                </div>
                <Button variant="link" className="w-full text-primary">
                  Download CSV Template
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleNext}>
                  Skip for Now
                </Button>
                <Button onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Customize Your Experience</CardTitle>
            <CardDescription>
              Set your preferences to get the most relevant opportunities and insights for your medical business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">RFQ Notifications</h3>
              <p className="text-sm text-muted-foreground">Choose how you want to be notified about new opportunities</p>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationEmail}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationEmail: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">Instant email for new RFQs matching my catalog</div>
                    <div className="text-xs text-muted-foreground">Daily RFQ digest</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationSMS}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationSMS: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">SMS alerts for high-value opportunities (&gt;$10,000)</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={formData.notificationBid}
                    onCheckedChange={(checked) => setFormData({ ...formData, notificationBid: checked as boolean })}
                  />
                  <div>
                    <div className="font-medium text-sm">Push notifications (web/mobile)</div>
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
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? 'Completing Setup...' : 'Complete Setup & Go to Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
