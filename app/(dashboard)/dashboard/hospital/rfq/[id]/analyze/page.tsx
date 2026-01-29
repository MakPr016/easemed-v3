'use client'

import { use, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Download,
    Clock,
    DollarSign,
    Package,
    Building2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockHospitalRFQs, mockReceivedQuotations } from '@/lib/constants'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const WEIGHTS = {
    emergency: { cost: 0.1, delivery: 0.3, quality: 0.15, reliability: 0.45 },
    cost: { cost: 0.5, delivery: 0.1, quality: 0.2, reliability: 0.2 },
    quality: { cost: 0.1, delivery: 0.1, quality: 0.5, reliability: 0.3 },
    balanced: { cost: 0.3, delivery: 0.2, quality: 0.25, reliability: 0.25 }
}

interface VendorScore {
    vendorId: string
    vendorName: string
    vendorRating: number
    completedOrders: number
    finalScore: number
    totalPrice: number
    deliveryDays: number
    matchPercentage: number
}

const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash)
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

export default function AnalyzeQuotationsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const { id } = use(params)
    const rfq = mockHospitalRFQs[id as keyof typeof mockHospitalRFQs]
    const quotations = mockReceivedQuotations[id] || []
    
    const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null)
    const [showAwardDialog, setShowAwardDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [viewDetailsVendor, setViewDetailsVendor] = useState<VendorScore | null>(null)
    const [scoringMode, setScoringMode] = useState<keyof typeof WEIGHTS>('balanced')
    const [awardedVendor, setAwardedVendor] = useState<string | null>(null)
    const [isAwarding, setIsAwarding] = useState(false)

    if (!rfq || quotations.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h3 className="text-lg font-semibold mb-2">No Quotations to Analyze</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            There are no quotations available for analysis yet.
                        </p>
                        <Link href={`/dashboard/hospital/rfq/${id}`}>
                            <Button>Back to RFQ</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const scoreVendors = (): VendorScore[] => {
        const w = WEIGHTS[scoringMode]

        const costs = quotations.map(q => parseFloat(q.totalAmount.replace(/[€,]/g, '')))
        const maxCost = Math.max(...costs)
        const minCost = Math.min(...costs)
        const costRange = maxCost - minCost || 1

        const deliveries = quotations.map(q => parseInt(q.deliveryTime.split('-')[0]))
        const maxDelivery = Math.max(...deliveries)

        return quotations.map(quotation => {
            const price = parseFloat(quotation.totalAmount.replace(/[€,]/g, ''))
            const deliveryDays = parseInt(quotation.deliveryTime.split('-')[0])

            const S_cost = (maxCost - price) / costRange
            const S_delivery = 1 - deliveryDays / maxDelivery
            const S_quality = quotation.vendorRating / 5
            const S_reliability = quotation.vendorRating / 5

            const finalScore =
                w.cost * S_cost +
                w.delivery * S_delivery +
                w.quality * S_quality +
                w.reliability * S_reliability

            const matchPercentage = Math.round(finalScore * 100)
            const completedOrders = 20 + (hashCode(quotation.id) % 100)

            return {
                vendorId: quotation.id,
                vendorName: quotation.vendorName,
                vendorRating: quotation.vendorRating,
                completedOrders,
                finalScore: finalScore * 10,
                totalPrice: price,
                deliveryDays,
                matchPercentage
            }
        }).sort((a, b) => b.finalScore - a.finalScore).slice(0, 10)
    }

    const scoredVendors = scoreVendors()
    const lowestPrice = Math.min(...scoredVendors.map(v => v.totalPrice))
    const totalVendors = quotations.length
    const showingVendors = scoredVendors.length

    const handleAwardContract = async () => {
        setIsAwarding(true)
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const awardedVendorData = scoredVendors.find(v => v.vendorId === selectedQuotation)
            
            toast.success('Contract Awarded Successfully!', {
                description: `Purchase order has been created for ${awardedVendorData?.vendorName}. Both parties have been notified.`,
                duration: 5000,
            })
            
            setTimeout(() => {
                toast.info('Vendor Notified', {
                    description: `${awardedVendorData?.vendorName} has been notified about the contract award.`,
                    duration: 4000,
                })
            }, 1000)
            
            setAwardedVendor(selectedQuotation)
            setShowAwardDialog(false)
            setSelectedQuotation(null)
            
            setTimeout(() => {
                router.push('/dashboard/hospital/orders')
            }, 2500)
            
        } catch (error) {
            toast.error('Failed to award contract', {
                description: 'Please try again or contact support.',
            })
        } finally {
            setIsAwarding(false)
        }
    }

    const handleViewDetails = (vendor: VendorScore) => {
        setViewDetailsVendor(vendor)
        setShowDetailsDialog(true)
    }

    const handleViewPDF = (vendorId: string) => {
        const pdfUrl = `/api/quotations/${vendorId}/pdf`
        window.open(pdfUrl, '_blank')
        toast.success('Opening quotation PDF...')
    }

    const getQualityLabel = (score: number) => {
        if (score >= 9) return 'Excellent'
        if (score >= 8) return 'Very good'
        if (score >= 7) return 'Good'
        return 'Acceptable'
    }

    const quotationDetails = viewDetailsVendor ? quotations.find(q => q.id === viewDetailsVendor.vendorId) : null

    return (
        <div className="pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/dashboard/hospital/rfq/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Bid Evaluation</h1>
                    <p className="text-muted-foreground">
                        {rfq.title} - {rfq.id} 
                        {totalVendors > 10 && (
                            <span className="ml-2 text-sm">
                                (Showing top {showingVendors} of {totalVendors} vendors)
                            </span>
                        )}
                    </p>
                </div>
                <Select value={scoringMode} onValueChange={(v) => setScoringMode(v as keyof typeof WEIGHTS)}>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="Scoring Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="balanced">Balanced Scoring</SelectItem>
                        <SelectItem value="cost">Cost Optimized</SelectItem>
                        <SelectItem value="emergency">Emergency Priority</SelectItem>
                        <SelectItem value="quality">Quality Focused</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {scoredVendors.map((vendor, idx) => {
                    const priceDiff = vendor.totalPrice - lowestPrice
                    const deliveryDiff = vendor.deliveryDays - Math.min(...scoredVendors.map(v => v.deliveryDays))
                    const isAwarded = awardedVendor === vendor.vendorId
                    
                    return (
                        <Card key={vendor.vendorId} className={`${isAwarded ? 'bg-green-50 border-green-500' : 'bg-gray-50'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-bold text-gray-400">#{idx + 1}</div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-semibold">{vendor.vendorName}</h3>
                                                <Badge variant="outline" className="text-sm">
                                                    {vendor.matchPercentage}% match
                                                </Badge>
                                                {isAwarded && (
                                                    <Badge className="bg-green-600 text-white">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Awarded
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    {vendor.vendorRating}/5
                                                </span>
                                                <span>•</span>
                                                <span>{vendor.completedOrders} completed orders</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                                        <p className="text-3xl font-bold mb-1">€{vendor.totalPrice.toLocaleString()}</p>
                                        {priceDiff > 0 ? (
                                            <p className="text-sm text-orange-600">+€{priceDiff.toLocaleString()} vs top bid</p>
                                        ) : (
                                            <p className="text-sm text-green-600">Best price</p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Delivery Time</p>
                                        <p className="text-3xl font-bold mb-1">{vendor.deliveryDays} days</p>
                                        {deliveryDiff > 0 ? (
                                            <p className="text-sm text-orange-600">+{deliveryDiff} day{deliveryDiff > 1 ? 's' : ''}</p>
                                        ) : (
                                            <p className="text-sm text-green-600">Fastest</p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
                                        <p className="text-3xl font-bold mb-1">{vendor.finalScore.toFixed(1)}/10</p>
                                        <p className="text-sm text-muted-foreground">{getQualityLabel(vendor.finalScore)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t">
                                    <Button variant="outline" onClick={() => handleViewDetails(vendor)}>
                                        View Details
                                    </Button>
                                    {!isAwarded && !awardedVendor && (
                                        <Button 
                                            onClick={() => {
                                                setSelectedQuotation(vendor.vendorId)
                                                setShowAwardDialog(true)
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            Award
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <Button variant="ghost" size="lg">
                        Save & Review Later
                    </Button>
                    <Button variant="ghost" size="lg" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Reject All Bids
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="lg">
                        Request More Information
                    </Button>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white" 
                        size="lg"
                        disabled={!!awardedVendor}
                        onClick={() => {
                            if (!awardedVendor) {
                                setSelectedQuotation(scoredVendors[0].vendorId)
                                setShowAwardDialog(true)
                            }
                        }}
                    >
                        Award to Selected Vendor
                    </Button>
                </div>
            </div>

            <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Contract Award</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to award the contract to {scoredVendors.find(v => v.vendorId === selectedQuotation)?.vendorName}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Vendor:</span>
                                <span className="font-semibold">
                                    {scoredVendors.find(v => v.vendorId === selectedQuotation)?.vendorName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Amount:</span>
                                <span className="font-semibold">
                                    €{scoredVendors.find(v => v.vendorId === selectedQuotation)?.totalPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Delivery Time:</span>
                                <span className="font-semibold">
                                    {scoredVendors.find(v => v.vendorId === selectedQuotation)?.deliveryDays} days
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Quality Score:</span>
                                <span className="font-semibold">
                                    {scoredVendors.find(v => v.vendorId === selectedQuotation)?.finalScore.toFixed(1)}/10
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>Note:</strong> Both you and the vendor will be notified. A purchase order will be created automatically.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAwardDialog(false)} disabled={isAwarding}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAwardContract} 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isAwarding}
                        >
                            {isAwarding ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm Award
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl">{viewDetailsVendor?.vendorName}</DialogTitle>
                                <DialogDescription>
                                    Quotation ID: {viewDetailsVendor?.vendorId}
                                </DialogDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                {viewDetailsVendor?.matchPercentage}% match
                            </Badge>
                        </div>
                    </DialogHeader>

                    {quotationDetails && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Building2 className="h-4 w-4" />
                                            <p className="text-sm">Vendor</p>
                                        </div>
                                        <p className="font-semibold">{viewDetailsVendor?.vendorName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {viewDetailsVendor?.completedOrders} orders
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <DollarSign className="h-4 w-4" />
                                            <p className="text-sm">Total Cost</p>
                                        </div>
                                        <p className="font-semibold text-lg">€{viewDetailsVendor?.totalPrice.toLocaleString()}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Clock className="h-4 w-4" />
                                            <p className="text-sm">Delivery</p>
                                        </div>
                                        <p className="font-semibold">{viewDetailsVendor?.deliveryDays} days</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Package className="h-4 w-4" />
                                            <p className="text-sm">Quality</p>
                                        </div>
                                        <p className="font-semibold">{viewDetailsVendor?.finalScore.toFixed(1)}/10</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Quotation Items</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quotationDetails.items.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.quantity} {item.unit}</TableCell>
                                                <TableCell className="text-right">{item.unitPrice}</TableCell>
                                                <TableCell className="text-right font-medium">{item.totalPrice}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Quotation Amount</p>
                                    <p className="text-3xl font-bold text-primary">{quotationDetails.totalAmount}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Valid until: {formatDate(quotationDetails.validUntil)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline"
                                        onClick={() => handleViewPDF(viewDetailsVendor?.vendorId || '')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View PDF
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => toast.success('Download started...')}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            {quotationDetails.status === 'pending' && !awardedVendor && (
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => {
                                            setShowDetailsDialog(false)
                                            toast.info('Quotation rejected')
                                        }}
                                    >
                                        Reject
                                    </Button>
                                    <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            setShowDetailsDialog(false)
                                            setSelectedQuotation(viewDetailsVendor?.vendorId || null)
                                            setShowAwardDialog(true)
                                        }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Award Contract
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
