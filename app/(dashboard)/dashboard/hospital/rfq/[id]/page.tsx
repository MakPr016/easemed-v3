'use client'

import { use, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    MapPin,
    Clock,
    Package,
    Calendar,
    FileText,
    CreditCard,
    ArrowLeft,
    Users,
    BarChart3,
    Eye,
} from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { RFQMap } from '@/components/maps/RFQMap'
import { mockHospitalRFQs, mockReceivedQuotations } from '@/lib/constants'
import { QuotationDetailDialog } from '@/components/hospital/QuotationDetailDialog'

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export default function HospitalRFQDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const rfq = mockHospitalRFQs[id as keyof typeof mockHospitalRFQs]
    const quotations = mockReceivedQuotations[id] || []

    const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    const handleViewQuotation = (quotation: any) => {
        setSelectedQuotation(quotation)
        setDetailDialogOpen(true)
    }

    const handleAward = () => {
        console.log('Award contract to:', selectedQuotation.vendorName)
        setDetailDialogOpen(false)
    }

    const handleReject = () => {
        console.log('Reject quotation from:', selectedQuotation.vendorName)
        setDetailDialogOpen(false)
    }

    if (!rfq) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
                        <Link href="/dashboard/hospital/rfq">
                            <Button>Back to RFQs</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'closed':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'awarded':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getQuotationStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'under_review':
                return 'bg-blue-100 text-blue-700'
            case 'awarded':
                return 'bg-green-100 text-green-700'
            case 'rejected':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const lowestPrice = quotations.length > 0
        ? Math.min(...quotations.map(q => parseFloat(q.totalAmount.replace(/[€,]/g, ''))))
        : 0

    const avgRating = quotations.length > 0
        ? (quotations.reduce((sum, q) => sum + q.vendorRating, 0) / quotations.length).toFixed(1)
        : '0'

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/hospital/rfq">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
                        <Badge className={getStatusColor(rfq.status)}>
                            {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{rfq.id}</p>
                </div>
                {quotations.length > 0 && (
                    <Link href={`/dashboard/hospital/rfq/${id}/analyze`}>
                        <Button size="lg">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analyze Quotations
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Quotations</p>
                                <p className="text-2xl font-bold mt-1">{quotations.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lowest Bid</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">
                                    {lowestPrice > 0 ? `€${lowestPrice.toLocaleString()}` : 'N/A'}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                                <p className="text-2xl font-bold mt-1">{avgRating}</p>
                            </div>
                            <Users className="h-8 w-8 text-orange-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Days Left</p>
                                <p className="text-2xl font-bold mt-1 text-orange-600">16</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Received Quotations</CardTitle>
                            <CardDescription>
                                {quotations.length === 0
                                    ? 'No quotations received yet'
                                    : `${quotations.length} vendors have submitted their quotations`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {quotations.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Waiting for vendor submissions</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Delivery Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quotations.map((quotation) => {
                                            const isLowest = parseFloat(quotation.totalAmount.replace(/[€,]/g, '')) === lowestPrice
                                            return (
                                                <TableRow key={quotation.id}>
                                                    <TableCell className="font-medium">
                                                        {quotation.vendorName}
                                                        {isLowest && (
                                                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                                                Lowest
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className={isLowest ? 'font-bold text-green-600' : ''}>
                                                        {quotation.totalAmount}
                                                    </TableCell>
                                                    <TableCell>{quotation.deliveryTime}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getQuotationStatusColor(quotation.status)}>
                                                            {quotation.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewQuotation(quotation)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items Required</CardTitle>
                            <CardDescription>{rfq.items.length} items in this RFQ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Specification</TableHead>
                                        <TableHead className="text-right">Est. Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfq.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.specification}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.estimatedPrice}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Location</CardTitle>
                            <CardDescription>Region for this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">{rfq.location}</p>
                                </div>
                            </div>

                            <RFQMap
                                lat={rfq.coordinates.lat}
                                lng={rfq.coordinates.lng}
                                location={rfq.location}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>RFQ Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bid Deadline</p>
                                        <p className="font-medium">{formatDate(rfq.deadline)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Delivery Deadline</p>
                                        <p className="font-medium">{formatDate(rfq.deliveryDeadline)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Terms</p>
                                        <p className="font-medium">{rfq.paymentTerms}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <Badge variant="outline">{rfq.category}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{rfq.specifications}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Required Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {rfq.requiredDocuments.map((doc, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="text-sm">{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {selectedQuotation && (
                <QuotationDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    quotation={selectedQuotation}
                    onAward={handleAward}
                    onReject={handleReject}
                />
            )}
        </div>
    )
}
