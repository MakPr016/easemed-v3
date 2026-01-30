'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    Clock,
    Package,
    Eye,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    Building2,
    MapPin,
    Trophy,
} from 'lucide-react'
import Link from 'next/link'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { QuotationDetailDialog } from '@/components/vendor/QuotationDetailDialog'

interface VendorQuotation {
    id: string
    rfqId: string
    rfqTitle: string
    hospital: string
    location: string
    category: string
    itemCount: number
    status: 'pending' | 'under_review' | 'awarded' | 'rejected'
    submittedAt: string
    quotationAmount: string
    deadline: string
}

const mockVendorQuotations: VendorQuotation[] = [
    {
        id: 'QUO-001',
        rfqId: 'RFQ-2847',
        rfqTitle: 'Medical Supplies - PPE Kits',
        hospital: 'City General Hospital',
        location: 'Berlin, Germany',
        category: 'Medical Supplies',
        itemCount: 5,
        status: 'pending',
        submittedAt: '2026-01-28',
        quotationAmount: '€23,500',
        deadline: '2026-02-15'
    },
    {
        id: 'QUO-002',
        rfqId: 'RFQ-2846',
        rfqTitle: 'Laboratory Equipment',
        hospital: 'Metro Health Center',
        location: 'Munich, Germany',
        category: 'Equipment',
        itemCount: 3,
        status: 'under_review',
        submittedAt: '2026-01-25',
        quotationAmount: '€48,000',
        deadline: '2026-02-10'
    },
    {
        id: 'QUO-003',
        rfqId: 'RFQ-2845',
        rfqTitle: 'Surgical Instruments',
        hospital: 'Regional Medical Center',
        location: 'Hamburg, Germany',
        category: 'Instruments',
        itemCount: 7,
        status: 'awarded',
        submittedAt: '2026-01-20',
        quotationAmount: '€32,000',
        deadline: '2026-02-05'
    },
    {
        id: 'QUO-004',
        rfqId: 'RFQ-2844',
        rfqTitle: 'Diagnostic Supplies',
        hospital: 'University Hospital',
        location: 'Frankfurt, Germany',
        category: 'Diagnostics',
        itemCount: 4,
        status: 'rejected',
        submittedAt: '2026-01-22',
        quotationAmount: '€18,500',
        deadline: '2026-02-08'
    },
]

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export default function VendorQuotationsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [activeTab, setActiveTab] = useState('all')
    const [selectedQuotation, setSelectedQuotation] = useState<VendorQuotation | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    const handleViewDetails = (quotation: VendorQuotation) => {
        setSelectedQuotation(quotation)
        setDetailDialogOpen(true)
    }

    const filteredQuotations = mockVendorQuotations.filter((quotation) => {
        const matchesSearch =
            quotation.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quotation.hospital.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || quotation.category === categoryFilter
        const matchesTab = activeTab === 'all' || quotation.status === activeTab
        return matchesSearch && matchesCategory && matchesTab
    })

    const getStatusConfig = (status: VendorQuotation['status']) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    icon: Clock,
                    label: 'Pending'
                }
            case 'under_review':
                return {
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: AlertCircle,
                    label: 'Under Review'
                }
            case 'awarded':
                return {
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: CheckCircle2,
                    label: 'Accepted'
                }
            case 'rejected':
                return {
                    color: 'bg-red-100 text-red-700 border-red-200',
                    icon: XCircle,
                    label: 'Rejected'
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: Clock,
                    label: 'Unknown'
                }
        }
    }

    const pendingCount = mockVendorQuotations.filter(q => q.status === 'pending').length
    const reviewCount = mockVendorQuotations.filter(q => q.status === 'under_review').length
    const awardedCount = mockVendorQuotations.filter(q => q.status === 'awarded').length
    const rejectedCount = mockVendorQuotations.filter(q => q.status === 'rejected').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Quotations</h1>
                    <p className="text-muted-foreground">
                        Track all your submitted quotations and their status
                    </p>
                </div>
                <Link href="/dashboard/vendor/rfq">
                    <Button>
                        <Package className="h-4 w-4 mr-2" />
                        Browse RFQs
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                                <p className="text-2xl font-bold mt-1 text-blue-600">{reviewCount}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">{awardedCount}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                <p className="text-2xl font-bold mt-1">{rejectedCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search quotations or hospitals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-52">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                                <SelectItem value="Equipment">Equipment</SelectItem>
                                <SelectItem value="Instruments">Instruments</SelectItem>
                                <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="under_review">Under Review</TabsTrigger>
                    <TabsTrigger value="awarded">Accepted</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredQuotations.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No quotations found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Try adjusting your filters or browse available RFQs
                                </p>
                                <Link href="/dashboard/vendor/rfq">
                                    <Button>Browse RFQs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredQuotations.map((quotation) => {
                                const statusConfig = getStatusConfig(quotation.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-lg font-semibold flex-1">{quotation.rfqTitle}</h3>
                                                    <Badge className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span className="font-medium">{quotation.hospital}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{quotation.location}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        <span>{quotation.itemCount} items</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Submitted: {formatDate(quotation.submittedAt)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="space-y-1">
                                                        <Badge variant="outline">{quotation.category}</Badge>
                                                        <p className="text-sm">
                                                            <span className="font-semibold">Amount:</span> {quotation.quotationAmount}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            RFQ ID: {quotation.rfqId}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(quotation)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                        {quotation.status === 'awarded' && (
                                                            <Badge className="bg-green-100 text-green-700 justify-center py-1.5">
                                                                <Trophy className="h-3 w-3 mr-1" />
                                                                Winner
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

            </Tabs>

            {selectedQuotation && (
                <QuotationDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    quotation={selectedQuotation}
                />
            )}
        </div>
    )
}
