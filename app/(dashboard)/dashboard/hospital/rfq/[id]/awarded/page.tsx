'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
    Search,
    CheckCircle2,
    Eye,
    Package,
    Calendar,
    DollarSign,
    User,
    Award,
    Truck,
    FileText,
    Download,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useRFQStore } from '@/lib/rfq-store'

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

const formatDeadline = (dateString: string) => {
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

export default function AwardedPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { getRFQ } = useRFQStore()
    const [mounted, setMounted] = useState(false)
    const [rfqData, setRfqData] = useState<any>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAward, setSelectedAward] = useState<any>(null)

    const [awards] = useState([
        {
            id: 'a1',
            vendorId: 'v1',
            vendorName: 'PharmaCorp Ltd',
            requirements: [
                { line_item_id: 1, inn_name: 'Acetylsalicylic acid', brand_name: 'Aspirin', quantity: 1000, unit_of_issue: 'Tablet', unit_price: 2.5, total: 2500 },
                { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', quantity: 500, unit_of_issue: 'Bottle', unit_price: 45, total: 22500 },
            ],
            totalAmount: 25000,
            awardedAt: '2026-01-29T09:00:00',
            expectedDelivery: '2026-02-05T00:00:00',
            poNumber: 'PO-2026-001',
            status: 'po_issued',
        },
        {
            id: 'a2',
            vendorId: 'v2',
            vendorName: 'MediSupply International',
            requirements: [
                { line_item_id: 3, inn_name: 'Adrenalin', brand_name: 'Ampule Adre', quantity: 200, unit_of_issue: 'Ampule', unit_price: 120, total: 24000 },
            ],
            totalAmount: 24000,
            awardedAt: '2026-01-29T10:30:00',
            expectedDelivery: '2026-02-03T00:00:00',
            poNumber: 'PO-2026-002',
            status: 'po_issued',
        },
    ])

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
                        <h1 className="text-3xl font-bold tracking-tight">Awarded</h1>
                        <p className="text-muted-foreground">Purchase orders issued to vendors</p>
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
                        onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Awarded</h1>
                        <p className="text-muted-foreground">Purchase orders issued to vendors</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Awards Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            No purchase orders have been issued yet.
                        </p>
                        <Button onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/under-review`)}>
                            Review Quotes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const filteredAwards = awards.filter(award =>
        award.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalAwarded = awards.reduce((sum, award) => sum + award.totalAmount, 0)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'po_issued':
                return <Badge variant="default" className="gap-1 bg-blue-600"><FileText className="h-3 w-3" /> PO Issued</Badge>
            case 'in_transit':
                return <Badge variant="default" className="gap-1 bg-orange-600"><Truck className="h-3 w-3" /> In Transit</Badge>
            case 'delivered':
                return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Delivered</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Awarded</h1>
                    <p className="text-muted-foreground">Purchase orders issued to vendors</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Awarded</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{awards.length}</div>
                        <p className="text-xs text-muted-foreground">vendors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAwarded)}</div>
                        <p className="text-xs text-muted-foreground">total contract value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{awards.length}</div>
                        <p className="text-xs text-muted-foreground">POs issued</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{rfqData.rfqTitle}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Deadline: {formatDeadline(rfqData.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    {awards.length} awarded
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Expected Delivery</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAwards.map((award, index) => (
                                    <TableRow key={`${award.id}-${index}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {award.vendorName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{award.poNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{award.requirements.length} items</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{formatCurrency(award.totalAmount)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{formatDeadline(award.expectedDelivery)}</span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(award.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog open={selectedAward?.id === award.id} onOpenChange={(open) => setSelectedAward(open ? award : null)}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="gap-2">
                                                            <Eye className="h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-6xl min-w-4xl max-h-[85vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Purchase Order - {award.poNumber}</DialogTitle>
                                                            <DialogDescription>
                                                                {award.vendorName}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 mt-4">
                                                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Awarded At</p>
                                                                    <p className="font-medium">{formatDate(award.awardedAt)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                                                                    <p className="font-medium">{formatDeadline(award.expectedDelivery)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">Status</p>
                                                                    <div className="mt-1">{getStatusBadge(award.status)}</div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="font-semibold mb-3">Order Items</h4>
                                                                <div className="border rounded-lg overflow-hidden">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Item</TableHead>
                                                                                <TableHead>Brand</TableHead>
                                                                                <TableHead>Quantity</TableHead>
                                                                                <TableHead>Unit Price</TableHead>
                                                                                <TableHead>Total</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {award.requirements.map((req) => (
                                                                                <TableRow key={req.line_item_id}>
                                                                                    <TableCell className="font-medium">{req.inn_name}</TableCell>
                                                                                    <TableCell>{req.brand_name}</TableCell>
                                                                                    <TableCell>{req.quantity} {req.unit_of_issue}s</TableCell>
                                                                                    <TableCell>{formatCurrency(req.unit_price)}</TableCell>
                                                                                    <TableCell className="font-semibold">{formatCurrency(req.total)}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} className="text-right font-semibold">Total Amount:</TableCell>
                                                                                <TableCell className="font-bold text-lg">{formatCurrency(award.totalAmount)}</TableCell>
                                                                            </TableRow>
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <Button className="flex-1 gap-2" variant="outline">
                                                                    <Download className="h-4 w-4" />
                                                                    Download PO
                                                                </Button>
                                                                <Button className="flex-1 gap-2" variant="outline">
                                                                    <Truck className="h-4 w-4" />
                                                                    Track Delivery
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredAwards.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-muted-foreground">No awards found matching your search.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
