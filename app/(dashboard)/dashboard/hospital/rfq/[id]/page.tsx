'use client'

import { use, useState, useEffect } from 'react'
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
    BarChart3,
    Loader2,
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

// Dynamically import the map component with no SSR
const EuropeMap = dynamic(
    () => import('@/components/maps/europe-map').then(mod => ({ default: mod.EuropeMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-lg border">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading Europe Map...</p>
                </div>
            </div>
        )
    }
)

const ITEMS_PER_PAGE = 10

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const calculateValidity = (deadline: string | null) => {
    if (!deadline) return 'N/A'
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
}

export default function HospitalRFQDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [rfq, setRfq] = useState<any>(null)
    const [lineItems, setLineItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const supabase = createClient()

    useEffect(() => {
        fetchRFQData()
    }, [id])

    const fetchRFQData = async () => {
        try {
            const { data: rfqData, error: rfqError } = await supabase
                .from('rfqs')
                .select('*')
                .eq('id', id)
                .single()

            if (rfqError) throw rfqError

            const { data: itemsData, error: itemsError } = await supabase
                .from('rfq_line_items')
                .select('*')
                .eq('rfq_id', id)
                .order('line_item_id')

            if (itemsError) throw itemsError

            setRfq(rfqData)
            setLineItems(itemsData || [])
        } catch (error) {
            console.error('Error fetching RFQ:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(lineItems.length / ITEMS_PER_PAGE)
    const paginatedItems = lineItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
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
            case 'published':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'draft':
                return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'closed':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'awarded':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const vendorCountries = rfq.metadata?.vendor_countries || []

    return (
        <div className="space-y-6 pb-8 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/hospital/rfq">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight truncate">{rfq.title}</h1>
                        <Badge className={`shrink-0 ${getStatusColor(rfq.status)}`}>
                            {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm truncate">{rfq.id}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Line Items</p>
                                <p className="text-2xl font-bold mt-1">{lineItems.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                                <p className="text-2xl font-bold mt-1">
                                    {rfq.metadata?.currency || 'USD'}
                                </p>
                            </div>
                            <CreditCard className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Quotations</p>
                                <p className="text-2xl font-bold mt-1">
                                    {rfq.metadata?.quotation_count || 0}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Validity</p>
                                <p className="text-2xl font-bold mt-1">
                                    {calculateValidity(rfq.deadline)} days
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Section: Map (Left) and Details (Right) */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Map Section */}
                <div className="lg:col-span-2">
                    {vendorCountries.length > 0 ? (
                        <Card className="h-full border-muted/60">
                            <CardHeader>
                                <CardTitle>Target Regions</CardTitle>
                                <CardDescription>
                                    RFQ published to vendors in these European regions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-[500px] rounded-lg overflow-hidden border bg-slate-50/50">
                                    <EuropeMap
                                        selectedCountries={vendorCountries}
                                        onCountrySelect={() => { }}
                                        vendorCounts={{}}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {vendorCountries.map((country: string) => (
                                        <Badge key={country} variant="secondary" className="gap-1 pl-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {country}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex flex-col items-center justify-center min-h-[500px] border-dashed">
                            <div className="p-8 text-center">
                                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                                <h3 className="text-lg font-medium text-muted-foreground">No Regions Selected</h3>
                                <p className="text-sm text-muted-foreground mt-1">No specific target countries defined for this RFQ.</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar: RFQ Details */}
                <div className="space-y-6">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>RFQ Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">Submission Deadline</p>
                                    <p className="font-medium truncate">{formatDate(rfq.deadline)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm text-muted-foreground">RFQ ID</p>
                                    <p className="font-medium truncate text-xs" title={rfq.id}>{rfq.id}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Currency</p>
                                    <p className="font-medium">{rfq.metadata?.currency || 'USD'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant="outline" className="mt-1">
                                        {rfq.status?.replace(/_/g, ' ') || 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluation Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium">Mode</p>
                                    <p className="text-sm text-muted-foreground">
                                        {rfq.metadata?.procurement_mode?.replace(/_/g, ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified'}
                                    </p>
                                </div>
                                {rfq.metadata?.vendors_to_select && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium">Selection Cap</p>
                                        <p className="text-sm text-muted-foreground">
                                            Max {rfq.metadata.vendors_to_select} vendors
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {rfq.metadata?.local_only && (
                        <Card className="bg-blue-50/50 border-blue-100">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Local suppliers only</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Bottom Section: Line Items List (Full Width) */}
            <Card className="mt-6 w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Line Items</CardTitle>
                            <CardDescription>
                                {lineItems.length} total items requested
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">
                            Page {currentPage} of {totalPages}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Added overflow-x-auto to contain the table within the card */}
                    <div className="border rounded-lg overflow-x-auto w-full">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead className="w-[30%]">INN Name</TableHead>
                                    <TableHead className="w-[20%]">Brand</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Form</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            No line items found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedItems.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/5">
                                            <TableCell className="font-medium text-muted-foreground">
                                                {item.line_item_id}
                                            </TableCell>

                                            <TableCell
                                                className="font-medium max-w-[200px] truncate"
                                                title={item.inn_name}
                                            >
                                                {item.inn_name}
                                            </TableCell>

                                            <TableCell
                                                className="text-sm max-w-[150px] truncate"
                                                title={item.brand_name || 'Generic'}
                                            >
                                                {item.brand_name || 'Generic'}
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.dosage || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {item.form || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.quantity} <span className="text-xs text-muted-foreground font-normal">{item.unit_of_issue}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}