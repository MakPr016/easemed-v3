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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/client'

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
                    <p className="text-muted-foreground text-sm">{rfq.id}</p>
                </div>
            </div>

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
                                    {rfq.metadata?.quotation_validity_days || 'N/A'} days
                                </p>
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
                            <CardTitle>Line Items</CardTitle>
                            <CardDescription>
                                {lineItems.length} total items | Page {currentPage} of {totalPages}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">No.</TableHead>
                                            <TableHead>INN Name</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Dosage</TableHead>
                                            <TableHead>Form</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No line items found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.line_item_id}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {item.inn_name}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {item.brand_name || 'Generic'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {item.dosage || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {item.form || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.quantity} {item.unit_of_issue}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage} of {totalPages}
                                    </div>
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
                                        <p className="text-sm text-muted-foreground">Submission Deadline</p>
                                        <p className="font-medium">{formatDate(rfq.deadline)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">RFQ ID</p>
                                        <p className="font-medium">{rfq.metadata?.rfq_id || 'N/A'}</p>
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
                                        <p className="text-sm text-muted-foreground">Contract Type</p>
                                        <Badge variant="outline">
                                            {rfq.metadata?.contract_type?.replace(/_/g, ' ') || 'N/A'}
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
                                <p className="text-sm">
                                    {rfq.metadata?.evaluation_method?.replace(/_/g, ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not specified'}
                                </p>
                                {rfq.metadata?.vendors_to_select && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Up to {rfq.metadata.vendors_to_select} vendors will be selected
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {rfq.metadata?.local_only && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Requirements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span className="text-sm">Local suppliers only</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
