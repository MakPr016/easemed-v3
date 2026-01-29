'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    FileText,
    Search,
    Filter,
    Clock,
    ShoppingCart,
    Eye,
    MoreVertical,
    Upload,
    Calendar,
    TrendingUp,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface RFQ {
    id: string
    title: string
    createdAt: string
    deadline: string
    status: 'draft' | 'awaiting_bids' | 'under_review' | 'awarded' | 'closed'
    totalItems: number
    quotationsReceived: number
    vendorsSent: number
    estimatedValue: number
}

export default function RFQListPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Mock data
    const [rfqs] = useState<RFQ[]>([
        {
            id: 'rfq-1738166400000',
            title: 'Medical Supplies Q1 2026',
            createdAt: '2026-01-28T10:30:00',
            deadline: '2026-02-15T23:59:00',
            status: 'awaiting_bids',
            totalItems: 15,
            quotationsReceived: 12,
            vendorsSent: 8,
            estimatedValue: 125000,
        },
        {
            id: 'rfq-1738080000000',
            title: 'Emergency Medicine Stock',
            createdAt: '2026-01-27T14:20:00',
            deadline: '2026-02-10T23:59:00',
            status: 'under_review',
            totalItems: 8,
            quotationsReceived: 24,
            vendorsSent: 6,
            estimatedValue: 85000,
        },
        {
            id: 'rfq-1737993600000',
            title: 'Surgical Consumables',
            createdAt: '2026-01-25T09:15:00',
            deadline: '2026-02-20T23:59:00',
            status: 'awaiting_bids',
            totalItems: 22,
            quotationsReceived: 8,
            vendorsSent: 12,
            estimatedValue: 210000,
        },
        {
            id: 'rfq-1737820800000',
            title: 'IV Fluids & Solutions',
            createdAt: '2026-01-23T11:45:00',
            deadline: '2026-02-05T23:59:00',
            status: 'awarded',
            totalItems: 6,
            quotationsReceived: 18,
            vendorsSent: 5,
            estimatedValue: 45000,
        },
        {
            id: 'rfq-1737648000000',
            title: 'Laboratory Reagents',
            createdAt: '2026-01-20T16:00:00',
            deadline: '2026-01-28T23:59:00',
            status: 'closed',
            totalItems: 12,
            quotationsReceived: 15,
            vendorsSent: 7,
            estimatedValue: 95000,
        },
    ])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            case 'awaiting_bids':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            case 'under_review':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            case 'awarded':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            case 'closed':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusLabel = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }

    const filteredRFQs = rfqs.filter(rfq => {
        const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfq.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: rfqs.length,
        active: rfqs.filter(r => r.status === 'awaiting_bids' || r.status === 'under_review').length,
        awarded: rfqs.filter(r => r.status === 'awarded').length,
        totalValue: rfqs.reduce((sum, r) => sum + r.estimatedValue, 0),
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
                    <p className="text-muted-foreground">
                        Manage all your procurement requests
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/hospital/rfq/upload')} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Create New RFQ
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awarded</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.awarded}</div>
                        <p className="text-xs text-muted-foreground">Contracts signed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{(stats.totalValue / 1000).toFixed(0)}K
                        </div>
                        <p className="text-xs text-muted-foreground">Estimated</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All RFQs</CardTitle>
                            <CardDescription>
                                {filteredRFQs.length} request{filteredRFQs.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search RFQs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="awaiting_bids">Awaiting Bids</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="awarded">Awarded</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredRFQs.map((rfq) => (
                            <div
                                key={rfq.id}
                                className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{rfq.title}</h3>
                                            <Badge className={getStatusColor(rfq.status)}>
                                                {getStatusLabel(rfq.status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <span>#{rfq.id}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Created: {new Date(rfq.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Items:</span>{' '}
                                                <span className="font-medium">{rfq.totalItems}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Vendors:</span>{' '}
                                                <span className="font-medium">{rfq.vendorsSent}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Quotations:</span>{' '}
                                                <span className="font-medium">{rfq.quotationsReceived}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Est. Value:</span>{' '}
                                                <span className="font-medium">₹{rfq.estimatedValue.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => router.push(`/dashboard/hospital/rfq/${rfq.id}/quotations`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/hospital/rfq/${rfq.id}/review`)}
                                                >
                                                    Edit RFQ
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/hospital/rfq/${rfq.id}/vendors`)}
                                                >
                                                    Manage Vendors
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/hospital/rfq/${rfq.id}/quotations`)}
                                                >
                                                    View Quotations
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    Cancel RFQ
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
