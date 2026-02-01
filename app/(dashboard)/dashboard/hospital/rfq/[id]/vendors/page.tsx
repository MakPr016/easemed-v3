'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    MapPin,
    Package,
    ArrowLeft,
    Send,
    Loader2,
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Dynamic import for the map component
const EuropeMap = dynamic(
    () => import('@/components/maps/europe-map').then(mod => ({ default: mod.EuropeMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-125 flex items-center justify-center bg-muted rounded-lg border">
                <div className="animate-pulse text-muted-foreground">Loading map...</div>
            </div>
        )
    }
)

interface LineItem {
    id: string
    line_item_id: number
    inn_name: string
    brand_name: string
    dosage: string
    form: string
    quantity: number
    unit_of_issue: string
}

interface RFQInfo {
    id: string
    title: string
    deadline: string
    status: string
}

// Mock vendor data (replace with actual API call)
interface Vendor {
    id: string
    name: string
    location: string
    country: string
    rating: number
    responseRate: number
    pastOrders: number
    certifications: string[]
}

const mockVendors: Vendor[] = [
    {
        id: '1',
        name: 'MedSupply GmbH',
        location: 'Berlin',
        country: 'Germany',
        rating: 4.8,
        responseRate: 95,
        pastOrders: 142,
        certifications: ['ISO 9001', 'WHO-GMP', 'GDP']
    },
    {
        id: '2',
        name: 'PharmaDistrib France',
        location: 'Paris',
        country: 'France',
        rating: 4.6,
        responseRate: 92,
        pastOrders: 98,
        certifications: ['ISO 9001', 'GDP']
    },
    // Add more vendors...
]

export default function VendorSelectionPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [selectedCountries, setSelectedCountries] = useState<string[]>([])
    const [procurementMode, setProcurementMode] = useState<string>('balanced')
    const [rfqInfo, setRfqInfo] = useState<RFQInfo | null>(null)
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRFQData()
    }, [resolvedParams.id])

    const fetchRFQData = async () => {
        try {
            const { data: rfqData, error: rfqError } = await supabase
                .from('rfqs')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (rfqError) throw rfqError

            const { data: itemsData, error: itemsError } = await supabase
                .from('rfq_line_items')
                .select('*')
                .eq('rfq_id', resolvedParams.id)
                .order('line_item_id')

            if (itemsError) throw itemsError

            setRfqInfo({
                id: rfqData.id,
                title: rfqData.title,
                deadline: rfqData.deadline,
                status: rfqData.status,
            })

            setLineItems(itemsData || [])
        } catch (err: any) {
            console.error('Error fetching RFQ:', err)
        } finally {
            setLoading(false)
        }
    }

    const getVendorCountsByCountry = () => {
        const counts: { [key: string]: number } = {}
        mockVendors.forEach(vendor => {
            const country = vendor.country
            counts[country] = (counts[country] || 0) + 1
        })
        return counts
    }

    const handleCountrySelect = (country: string) => {
        setSelectedCountries(prev =>
            prev.includes(country)
                ? prev.filter(c => c !== country)
                : [...prev, country]
        )
    }

    const handleSendRFQ = async () => {
        if (selectedCountries.length === 0) {
            alert('Please select at least one region')
            return
        }

        // TODO: Send RFQ to vendors in selected countries
        console.log('Sending RFQ to vendors in:', selectedCountries)
        console.log('Procurement mode:', procurementMode)

        // Navigate to next step
        router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/awaiting`)
    }

    const vendorCounts = getVendorCountsByCountry()
    const eligibleVendorsCount = mockVendors.filter(v =>
        selectedCountries.length === 0 || selectedCountries.includes(v.country)
    ).length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!rfqInfo) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
                        <Link href="/dashboard/hospital/rfq/upload">
                            <Button>Back to Upload</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/hospital/rfq/${resolvedParams.id}/review`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Select Vendor Regions</h1>
                    <p className="text-muted-foreground">
                        Choose European regions to send your RFQ. Vendors will bid on items they can supply.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{rfqInfo.title}</CardTitle>
                            <CardDescription>
                                {lineItems.length} requirement{lineItems.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        <Badge variant="outline">
                            Deadline: {new Date(rfqInfo.deadline).toLocaleDateString()}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Locations</CardTitle>
                            <CardDescription>Select regions to filter vendors on the map</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="w-full h-125 rounded-lg overflow-hidden border">
                                <EuropeMap
                                    selectedCountries={selectedCountries}
                                    onCountrySelect={handleCountrySelect}
                                    vendorCounts={vendorCounts}
                                />
                            </div>

                            {selectedCountries.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">Selected:</span>
                                    {selectedCountries.map(country => (
                                        <Badge key={country} variant="secondary" className="gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {country}
                                            <button
                                                onClick={() => handleCountrySelect(country)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedCountries([])}
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                RFQ Preview
                            </CardTitle>
                            <CardDescription>What vendors will receive</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-100 overflow-y-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background">
                                            <TableRow>
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead>Generic Name</TableHead>
                                                <TableHead>Brand</TableHead>
                                                <TableHead>Dosage</TableHead>
                                                <TableHead>Form</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lineItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.line_item_id}</TableCell>
                                                    <TableCell className="font-medium">{item.inn_name}</TableCell>
                                                    <TableCell>{item.brand_name}</TableCell>
                                                    <TableCell>{item.dosage}</TableCell>
                                                    <TableCell>{item.form}</TableCell>
                                                    <TableCell className="text-right">
                                                        {item.quantity} {item.unit_of_issue}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    📋 Note to Vendors
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    You can bid on individual items you can supply. We'll review all bids based on cost, delivery time, and quality.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>RFQ Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-sm text-muted-foreground">Selected Items</Label>
                                <p className="text-4xl font-bold text-primary mt-1">{lineItems.length}</p>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Eligible Vendors</Label>
                                <p className="text-4xl font-bold mt-1">{eligibleVendorsCount}</p>
                            </div>

                            <div className="border-t pt-6">
                                <Label className="text-sm font-medium mb-3 block">Procurement Mode</Label>
                                <Select value={procurementMode} onValueChange={setProcurementMode}>
                                    <SelectTrigger className="w-full py-6">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="balanced">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Balanced</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Equal weight to cost, time & quality
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="emergency">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Emergency (Speed Priority)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Fastest delivery preferred
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="cost">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Cost Optimization</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Lowest price preferred
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="quality">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Quality Focus</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Best certifications & ratings
                                                </p>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-3">
                                    This affects how vendor bids will be scored
                                </p>
                            </div>

                            <Button
                                onClick={handleSendRFQ}
                                disabled={selectedCountries.length === 0}
                                className="w-full gap-2"
                                size="lg"
                            >
                                <Send className="h-4 w-4" />
                                Send to {eligibleVendorsCount} Vendor{eligibleVendorsCount !== 1 ? 's' : ''}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Selected vendors will receive this RFQ via email
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
