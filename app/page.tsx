'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Building2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Zap,
  DollarSign,
  Shield,
  Loader2,
} from "lucide-react"
import { WorldMap } from "@/components/ui/map"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getDashboardUrl = () => {
    console.log('=== DEBUG getDashboardUrl ===')
    console.log('Profile:', profile)
    console.log('Profile role:', profile?.role)
    
    if (!profile?.role) {
      console.log('❌ No role, returning /dashboard')
      return '/dashboard'
    }
    
    const hospitalRoles = ['hospital', 'cpo', 'cfo', 'admin']
    console.log('Hospital roles:', hospitalRoles)
    console.log('Checking if role is in hospital roles:', hospitalRoles.includes(profile.role))
    
    if (hospitalRoles.includes(profile.role)) {
      console.log('✅ Hospital role detected, returning /dashboard/hospital')
      return '/dashboard/hospital'
    }
    
    console.log('✅ Vendor role detected, returning /dashboard/vendor')
    return '/dashboard/vendor'
  }

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (redirecting) return
    
    setRedirecting(true)
    
    const url = getDashboardUrl()
    console.log('🚀 Navigating to:', url)
    
    router.push(url)
    
    setTimeout(() => setRedirecting(false), 2000)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                E
              </span>
            </div>
            <span className="text-xl font-bold">EaseMed</span>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? (
              <Button disabled variant="ghost">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : user && profile ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {profile?.full_name || user.email}
                </span>
                <Link href={getDashboardUrl()}>
                  <Button>Go to Dashboard</Button>
                </Link>
              </>
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button onClick={handleDashboardClick} disabled={redirecting}>
                  {redirecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Go to Dashboard'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Modern Procurement Platform for Healthcare
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline your medical procurement process with AI-powered RFQs,
            real-time bidding, and compliance verification.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            {user && profile ? (
              <Link href={getDashboardUrl()}>
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : user ? (
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={handleDashboardClick}
                disabled={redirecting}
              >
                {redirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {!user && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground">
              Select the option that best describes you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Hospitals</CardTitle>
                <CardDescription className="text-base">
                  Optimize your procurement, reduce costs, and ensure compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Create and manage RFQs effortlessly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      AI-powered bid evaluation and scoring
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      EMA compliance verification built-in
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Real-time inventory management
                    </span>
                  </li>
                </ul>
                <Link href="/signup?type=hospital" className="block">
                  <Button className="w-full" size="lg">
                    Sign Up as Hospital
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Vendors</CardTitle>
                <CardDescription className="text-base">
                  Access opportunities, submit bids, and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Access verified hospital RFQs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Submit competitive bids instantly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Track performance and analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">Manage orders and deliveries</span>
                  </li>
                </ul>
                <Link href="/signup?type=vendor" className="block">
                  <Button className="w-full" size="lg">
                    Sign Up as Vendor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose EaseMed?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>10x Faster Procurement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Reduce procurement cycle from weeks to days with automation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>30% Cost Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered bid comparison ensures best prices
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>100% Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated EMA verification and audit trails
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Global Medical Supply Chain
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hover over the map to view our extensive European distribution
            network. We connect top-tier manufacturers across the globe.
          </p>
        </div>

        <div className="max-w-6xl mx-auto bg-card border rounded-xl shadow-sm overflow-hidden">
          <WorldMap
            dots={[
              {
                start: { lat: 64.2008, lng: -149.4937, label: "Fairbanks" },
                end: { lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
              },
              {
                start: { lat: 64.2008, lng: -149.4937, label: "Fairbanks" },
                end: { lat: -15.7975, lng: -47.8919, label: "Brasília" },
              },
              {
                start: { lat: -15.7975, lng: -47.8919, label: "Brasília" },
                end: { lat: 38.7223, lng: -9.1393, label: "Lisbon" },
              },
              {
                start: { lat: 51.5074, lng: -0.1278, label: "London" },
                end: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
              },
              {
                start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                end: { lat: 43.1332, lng: 131.9113, label: "Vladivostok" },
              },
              {
                start: { lat: 28.6139, lng: 77.209, label: "New Delhi" },
                end: { lat: -1.2921, lng: 36.8219, label: "Nairobi" },
              },
            ]}
            regionDots={[
              {
                start: { lat: 51.5074, lng: -0.1278, label: "London" },
                end: { lat: 48.8566, lng: 2.3522, label: "Paris" },
              },
              {
                start: { lat: 48.8566, lng: 2.3522, label: "Paris" },
                end: { lat: 52.52, lng: 13.405, label: "Berlin" },
              },
              {
                start: { lat: 52.52, lng: 13.405, label: "Berlin" },
                end: { lat: 40.4168, lng: -3.7038, label: "Madrid" },
              },
              {
                start: { lat: 40.4168, lng: -3.7038, label: "Madrid" },
                end: { lat: 41.9028, lng: 12.4964, label: "Rome" },
              },
              {
                start: { lat: 41.9028, lng: 12.4964, label: "Rome" },
                end: { lat: 52.2297, lng: 21.0122, label: "Warsaw" },
              },
              {
                start: { lat: 52.2297, lng: 21.0122, label: "Warsaw" },
                end: { lat: 47.4979, lng: 19.0402, label: "Budapest" },
              },
              {
                start: { lat: 47.4979, lng: 19.0402, label: "Budapest" },
                end: { lat: 37.9838, lng: 23.7275, label: "Athens" },
              },
            ]}
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your procurement?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of hospitals and vendors already using EaseMed
            </p>
            {user && profile ? (
              <Link href={getDashboardUrl()}>
                <Button size="lg" variant="secondary" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : user ? (
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
                onClick={handleDashboardClick}
                disabled={redirecting}
              >
                {redirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Started Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  E
                </span>
              </div>
              <span className="font-bold">EaseMed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 EaseMed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
