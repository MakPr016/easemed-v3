'use client'

import { use, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
    Loader2,
    ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'

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
    const router = useRouter()
    const [rfq, setRfq] = useState<any>(null)
    const [lineItems, setLineItems] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
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

    const toggleItemSelection = (itemId: string) => {
        const newSelection = new Set(selectedItems)
        if (newSelection.has(itemId)) {
            newSelection.delete(itemId)
        } else {
            newSelection.add(itemId)
        }
        setSelectedItems(newSelection)
    }

    const toggleSelectAll = () => {
        if (selectedItems.size === lineItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(lineItems.map(item => item.id)))
        }
    }

    const handleProceedToVendorSelection = () => {
        if (selectedItems.size === 0) {
            alert('Please select at least one item')
            return
        }
        
        const selectedItemsArray = lineItems.filter(item => selectedItems.has(item.id))
        
        localStorage.setItem('selectedRFQItems', JSON.stringify({
            rfqId: id,
            items: selectedItemsArray
        }))
        
        router.push(`/dashboard/hospital/rfq/${id}/vendors`)
    }

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
                                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                                <p className="text-2xl font-bold mt-1">{selectedItems.size}</p>
                            </div>
                            <Checkbox className="h-8 w-8" checked={selectedItems.size > 0} />
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Line Items</CardTitle>
                                    <CardDescription>
                                        Select items to send to vendors ({selectedItems.size} selected)
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleSelectAll}
                                >
                                    {selectedItems.size === lineItems.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"></TableHead>
                                            <TableHead className="w-16">No.</TableHead>
                                            <TableHead>INN Name</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Dosage</TableHead>
                                            <TableHead>Form</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lineItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No line items found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            lineItems.map((item) => (
                                                <TableRow 
                                                    key={item.id}
                                                    className={selectedItems.has(item.id) ? 'bg-blue-50' : ''}
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedItems.has(item.id)}
                                                            onCheckedChange={() => toggleItemSelection(item.id)}
                                                        />
                                                    </TableCell>
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
                            
                            {lineItems.length > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        size="lg"
                                        onClick={handleProceedToVendorSelection}
                                        disabled={selectedItems.size === 0}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Select Vendors ({selectedItems.size} items)
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
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
