'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Building2, Target, Shield, Banknote, Upload } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface VendorOnboardingProps {
  email: string
}

export default function VendorOnboarding({ email }: VendorOnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    businessName: '',
    vatId: '',
    country: 'Germany',
    email: email,
    regionsEU: false,
    regionsDACH: false,
    regionsWestern: false,
    regionsEastern: false,
    logisticsCourier: false,
    logisticsCold: false,
    logisticsFreight: false,
    logisticsHazmat: false,
    expansionInterests: [] as string[],
    certISO: false,
    certGDP: false,
    certCE: false,
    bankName: '',
    iban: '',
    currency: 'EUR',
    termsAccepted: false
  })

  const [expansionInput, setExpansionInput] = useState('')

  const totalSteps = 4
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

  const addExpansionInterest = () => {
    if (expansionInput.trim()) {
      setFormData({
        ...formData,
        expansionInterests: [...formData.expansionInterests, expansionInput.trim()]
      })
      setExpansionInput('')
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold">EaseMed</span>
          <span className="text-muted-foreground">| Vendor Portal</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
            </div>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
            </div>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {step > 3 ? <CheckCircle2 className="h-5 w-5" /> : '3'}
            </div>
          </div>
          <div className="h-px w-12 bg-border" />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              4
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mb-2">
          Step {step} of {totalSteps}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Corporate Identity</h2>
            <p className="text-muted-foreground">Establish your legal entity on the platform.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Business Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Bayer AG"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatId">VAT / Tax ID *</Label>
                  <Input
                    id="vatId"
                    placeholder="e.g. DE123456789"
                    value={formData.vatId}
                    onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Headquarters Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Belgium">Belgium</SelectItem>
                      <SelectItem value="Austria">Austria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Generic domains (gmail, yahoo) are not accepted.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Smart Profile</h2>
            <p className="text-muted-foreground">This data powers your personalized Opportunity Feed.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Serviceable Regions</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.regionsEU}
                    onCheckedChange={(checked) => setFormData({ ...formData, regionsEU: checked as boolean })}
                  />
                  <span className="font-medium">All EU-27</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.regionsDACH}
                    onCheckedChange={(checked) => setFormData({ ...formData, regionsDACH: checked as boolean })}
                  />
                  <span className="font-medium">DACH Region</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.regionsWestern}
                    onCheckedChange={(checked) => setFormData({ ...formData, regionsWestern: checked as boolean })}
                  />
                  <span className="font-medium">Western Europe</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.regionsEastern}
                    onCheckedChange={(checked) => setFormData({ ...formData, regionsEastern: checked as boolean })}
                  />
                  <span className="font-medium">Eastern Europe</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-6">Logistics Capabilities</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.logisticsCourier}
                    onCheckedChange={(checked) => setFormData({ ...formData, logisticsCourier: checked as boolean })}
                  />
                  <span className="font-medium">Standard Courier</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.logisticsCold}
                    onCheckedChange={(checked) => setFormData({ ...formData, logisticsCold: checked as boolean })}
                  />
                  <span className="font-medium">Cold Chain</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.logisticsFreight}
                    onCheckedChange={(checked) => setFormData({ ...formData, logisticsFreight: checked as boolean })}
                  />
                  <span className="font-medium">Heavy Freight</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.logisticsHazmat}
                    onCheckedChange={(checked) => setFormData({ ...formData, logisticsHazmat: checked as boolean })}
                  />
                  <span className="font-medium">Hazmat</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Expansion Interests (Future Growth)</h3>
              <p className="text-sm text-muted-foreground mb-4">We'll alert you about RFQs in these areas even if you don't stock them yet.</p>
              
              <div className="space-y-2">
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
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Compliance Vault</h2>
            <p className="text-muted-foreground">Upload documents for Super Admin verification.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Required Documents</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Business License / Trade Extract *</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload PDF or JPG</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product Liability Insurance *</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload PDF or JPG</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Optional Certifications (Boosts Score)</h3>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.certISO}
                    onCheckedChange={(checked) => setFormData({ ...formData, certISO: checked as boolean })}
                  />
                  <span className="font-medium">ISO 13485</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.certGDP}
                    onCheckedChange={(checked) => setFormData({ ...formData, certGDP: checked as boolean })}
                  />
                  <span className="font-medium">GDP Certificate</span>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Checkbox
                    checked={formData.certCE}
                    onCheckedChange={(checked) => setFormData({ ...formData, certCE: checked as boolean })}
                  />
                  <span className="font-medium">CE Declaration</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Financials & Review</h2>
            <p className="text-muted-foreground">Setup payouts and accept legal terms.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-6">
                <Banknote className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Banking Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. Deutsche Bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input
                      id="iban"
                      placeholder="DE89..."
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                />
                <span className="text-sm">I agree to the Terms of Service and Vendor Code of Conduct.</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button 
              onClick={handleComplete} 
              disabled={loading || !formData.termsAccepted}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
