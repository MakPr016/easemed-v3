'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft,
    CheckCircle2,
    Package,
    Calendar,
    DollarSign,
    User,
    Award,
    TrendingUp,
    Clock,
    FileText,
    Download,
} from 'lucide-react'
import { useRFQStore } from '@/lib/rfq-store'

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function ClosedPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { getRFQ } = useRFQStore()
    const [mounted, setMounted] = useState(false)
    const [rfqData, setRfqData] = useState<any>(null)

    const [summary] = useState({
        totalVendorsContacted: 5,
        quotesReceived: 3,
        totalAwarded: 2,
        totalValue: 49000,
        completionDate: '2026-01-29T18:00:00',
        awards: [
            {
                vendorName: 'PharmaCorp Ltd',
                items: 2,
                amount: 25000,
                poNumber: 'PO-2026-001',
            },
            {
                vendorName: 'MediSupply International',
                items: 1,
                amount: 24000,
                poNumber: 'PO-2026-002',
            },
        ],
    })

    useEffect(() => {
        setMounted(true)
        setRfqData(getRFQ(resolvedParams.id))
    }, [resolvedParams.id, getRFQ])

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" disabled>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">RFQ Closed</h1>
                        <p className="text-muted-foreground">Summary and final report</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="animate-pulse">
                            <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4" />
                            <div className="h-4 w-48 bg-muted rounded mx-auto mb-2" />
                            <div className="h-3 w-64 bg-muted rounded mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!rfqData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/hospital/rfq`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">RFQ Closed</h1>
                        <p className="text-muted-foreground">Summary and final report</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                        <p className="text-muted-foreground mb-4">
                            Unable to load RFQ data.
                        </p>
                        <Button onClick={() => router.push(`/dashboard/hospital/rfq`)}>
                            Back to RFQs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/hospital/rfq`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">RFQ Closed</h1>
                        <Badge variant="default" className="gap-1 bg-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">Summary and final report</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                </Button>
            </div>

            <Card className="bg-linear-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-900">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{rfqData.rfqTitle}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Completed on {formatDate(summary.completionDate)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Contract Value</p>
                            <p className="text-3xl font-bold">{formatCurrency(summary.totalValue)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendors Contacted</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalVendorsContacted}</div>
                        <p className="text-xs text-muted-foreground">RFQs sent</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quotes Received</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.quotesReceived}</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round((summary.quotesReceived / summary.totalVendorsContacted) * 100)}% response rate
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awards</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalAwarded}</div>
                        <p className="text-xs text-muted-foreground">vendors awarded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
                        <p className="text-xs text-muted-foreground">contract value</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Awarded Contracts</CardTitle>
                    <CardDescription>Final purchase orders issued</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.awards.map((award, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {award.vendorName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-sm">{award.poNumber}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{award.items} items</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{formatCurrency(award.amount)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <Download className="h-3 w-3" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-semibold">
                                        Total Contract Value:
                                    </TableCell>
                                    <TableCell className="font-bold text-lg">
                                        {formatCurrency(summary.totalValue)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>RFQ Timeline</CardTitle>
                    <CardDescription>Key milestones and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">RFQ Created</p>
                                <p className="text-sm text-muted-foreground">01/25/2026</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Vendors Contacted</p>
                                <p className="text-sm text-muted-foreground">01/26/2026 - {summary.totalVendorsContacted} vendors</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Quotes Received</p>
                                <p className="text-sm text-muted-foreground">01/28/2026 - {summary.quotesReceived} quotes</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Contracts Awarded</p>
                                <p className="text-sm text-muted-foreground">01/29/2026 - {summary.totalAwarded} vendors</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">RFQ Closed</p>
                                <p className="text-sm text-muted-foreground">{formatDate(summary.completionDate)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
