'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
    Clock,
    FileText,
    Package,
    BarChart3,
    Eye,
    RefreshCw,
    MapPin,
    Calendar
} from 'lucide-react'

interface AwaitingRFQ {
    id: string
    title: string
    created_at: string
    deadline: string
    status: string
    metadata: any
}

interface Stats {
    total: number
    totalQuotations: number
}

interface Props {
    rfqs: AwaitingRFQ[]
    stats: Stats
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
}

export default function AwaitingRFQsClient({ rfqs, stats }: Props) {
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Awaiting Quotations</h1>
                    <p className="text-muted-foreground">
                        Track your published RFQs and incoming vendor bids
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Link href="/dashboard/hospital/rfq/upload">
                        <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            New RFQ
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Published RFQs</p>
                                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">{stats.totalQuotations}</p>
                            </div>
                            <Package className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Bids per RFQ</p>
                                <p className="text-2xl font-bold mt-1">
                                    {stats.total > 0 ? Math.round(stats.totalQuotations / stats.total) : 0}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RFQs List - 2 Column Layout */}
            <Card>
                <CardContent className="p-6">
                    {rfqs.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No RFQs Awaiting Bids</h3>
                            <p className="text-muted-foreground mb-6">
                                Publish your first RFQ to start receiving vendor quotations
                            </p>
                            <Link href="/dashboard/hospital/rfq/upload">
                                <Button size="lg">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create RFQ
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {rfqs.map((rfq) => (
                                <Card key={rfq.id} className="hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {/* Header with title and bids */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-semibold line-clamp-2 mb-2">
                                                        {rfq.title}
                                                    </h3>
                                                    <Badge 
                                                        variant="default" 
                                                        className="bg-green-100 text-green-800 text-sm mb-3"
                                                    >
                                                        <Package className="h-3 w-3 mr-1" />
                                                        {rfq.metadata?.quotation_count || 0} bids
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Metadata row */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatRelativeTime(rfq.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Due {formatDate(rfq.deadline)}</span>
                                                </div>
                                                {rfq.metadata?.vendor_countries && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="max-w-32 truncate">
                                                            {rfq.metadata.vendor_countries.slice(0, 2).join(', ')}
                                                            {rfq.metadata.vendor_countries.length > 2 && '...'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Procurement mode */}
                                            {rfq.metadata?.procurement_mode && (
                                                <Badge variant="outline" className="capitalize w-fit">
                                                    {rfq.metadata.procurement_mode.replace('_', ' ')}
                                                </Badge>
                                            )}

                                            {/* Action buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Link href={`/dashboard/hospital/rfq/${rfq.id}`} className="flex-1">
                                                    <Button variant="default" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </Link>
                                                {rfq.metadata?.quotation_count && rfq.metadata.quotation_count > 0 && (
                                                    <Link href={`/dashboard/hospital/rfq/${rfq.id}/analyze`} className="flex-1">
                                                        <Button size="sm" className="w-full">
                                                            <BarChart3 className="h-4 w-4 mr-2" />
                                                            Analyze
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
