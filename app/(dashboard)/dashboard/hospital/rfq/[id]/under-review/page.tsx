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
    Clock,
    CheckCircle2,
    Eye,
    Package,
    Calendar,
    DollarSign,
    User,
    Filter,
    Star,
    TrendingDown,
    TrendingUp,
    Award,
} from 'lucide-react'
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

export default function UnderReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { getRFQ } = useRFQStore()
    const [mounted, setMounted] = useState(false)
    const [rfqData, setRfqData] = useState<any>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedQuote, setSelectedQuote] = useState<any>(null)

    const [quotes] = useState([
        {
            id: 'q1',
            vendorId: 'v1',
            vendorName: 'PharmaCorp Ltd',
            rating: 4.8,
            requirements: [
                { line_item_id: 1, inn_name: 'Acetylsalicylic acid', brand_name: 'Aspirin', quantity: 1000, unit_of_issue: 'Tablet', unit_price: 2.5, total: 2500 },
                { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', quantity: 500, unit_of_issue: 'Bottle', unit_price: 45, total: 22500 },
            ],
            totalAmount: 25000,
            deliveryTime: '7 days',
            submittedAt: '2026-01-28T10:30:00',
            status: 'pending',
            score: 92,
            rank: 1,
        },
        {
            id: 'q2',
            vendorId: 'v2',
            vendorName: 'MediSupply International',
            rating: 4.5,
            requirements: [
                { line_item_id: 1, inn_name: 'Acetylsalicylic acid', brand_name: 'Aspirin', quantity: 1000, unit_of_issue: 'Tablet', unit_price: 2.8, total: 2800 },
            ],
            totalAmount: 2800,
            deliveryTime: '5 days',
            submittedAt: '2026-01-28T14:20:00',
            status: 'pending',
            score: 88,
            rank: 2,
        },
        {
            id: 'q3',
            vendorId: 'v4',
            vendorName: 'Global Pharma Solutions',
            rating: 4.7,
            requirements: [
                { line_item_id: 1, inn_name: 'Acetylsalicylic acid', brand_name: 'Aspirin', quantity: 1000, unit_of_issue: 'Tablet', unit_price: 3.0, total: 3000 },
                { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', quantity: 500, unit_of_issue: 'Bottle', unit_price: 42, total: 21000 },
            ],
            totalAmount: 24000,
            deliveryTime: '10 days',
            submittedAt: '2026-01-28T16:45:00',
            status: 'shortlisted',
            score: 85,
            rank: 3,
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
                        <h1 className="text-3xl font-bold tracking-tight">Under Review</h1>
                        <p className="text-muted-foreground">Review and compare vendor quotes</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Under Review</h1>
                        <p className="text-muted-foreground">Review and compare vendor quotes</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Quotes to Review</h3>
                        <p className="text-muted-foreground mb-4">
                            No vendor quotes have been received yet.
                        </p>
                        <Button onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/awaiting`)}>
                            View Awaiting Responses
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = quote.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const statusCounts = {
        all: quotes.length,
        pending: quotes.filter(q => q.status === 'pending').length,
        shortlisted: quotes.filter(q => q.status === 'shortlisted').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>
            case 'shortlisted':
                return <Badge variant="default" className="gap-1 bg-blue-600"><Star className="h-3 w-3" /> Shortlisted</Badge>
            case 'rejected':
                return <Badge variant="destructive" className="gap-1">Rejected</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getLowestPrice = () => {
        return Math.min(...quotes.map(q => q.totalAmount))
    }

    const getPriceComparison = (amount: number) => {
        const lowest = getLowestPrice()
        if (amount === lowest) {
            return <Badge variant="default" className="gap-1 bg-green-600"><TrendingDown className="h-3 w-3" /> Lowest</Badge>
        }
        const diff = ((amount - lowest) / lowest * 100).toFixed(1)
        return <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" /> +{diff}%</Badge>
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
                    <h1 className="text-3xl font-bold tracking-tight">Under Review</h1>
                    <p className="text-muted-foreground">Review and compare vendor quotes</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.all}</div>
                        <p className="text-xs text-muted-foreground">received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.pending}</div>
                        <p className="text-xs text-muted-foreground">awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.shortlisted}</div>
                        <p className="text-xs text-muted-foreground">selected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Quote</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(getLowestPrice())}</div>
                        <p className="text-xs text-muted-foreground">lowest total</p>
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
                                    <Package className="h-3 w-3" />
                                    {quotes.length} quotes
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vendors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted ({statusCounts.shortlisted})</SelectItem>
                                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Delivery</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuotes.map((quote, index) => (
                                    <TableRow key={`${quote.id}-${index}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {quote.rank === 1 && <Award className="h-4 w-4 text-yellow-500" />}
                                                <span className="font-semibold">#{quote.rank}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p>{quote.vendorName}</p>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        {quote.rating}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{quote.requirements.length} items</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-semibold">{formatCurrency(quote.totalAmount)}</p>
                                                {getPriceComparison(quote.totalAmount)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{quote.deliveryTime}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1">
                                                {quote.score}/100
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                                        <TableCell>
                                            <Dialog open={selectedQuote?.id === quote.id} onOpenChange={(open) => setSelectedQuote(open ? quote : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-6xl min-w-4xl max-h-[85vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Quote Details - {quote.vendorName}</DialogTitle>
                                                        <DialogDescription>
                                                            Review the complete quotation from this vendor
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-6 mt-4">
                                                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Submitted</p>
                                                                <p className="font-medium">{formatDate(quote.submittedAt)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Delivery Time</p>
                                                                <p className="font-medium">{quote.deliveryTime}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Score</p>
                                                                <p className="font-medium">{quote.score}/100</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Status</p>
                                                                <div className="mt-1">{getStatusBadge(quote.status)}</div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold mb-3">Quoted Items</h4>
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
                                                                        {quote.requirements.map((req) => (
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
                                                                            <TableCell className="font-bold text-lg">{formatCurrency(quote.totalAmount)}</TableCell>
                                                                        </TableRow>
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Shortlist Quote
                                                            </Button>
                                                            <Button variant="outline" className="flex-1">
                                                                Request Clarification
                                                            </Button>
                                                            <Button variant="destructive" className="flex-1">
                                                                Reject Quote
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredQuotes.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-muted-foreground">No quotes found matching your filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
