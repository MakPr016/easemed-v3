'use client'

import { useState } from 'react'
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
    Search,
    Filter,
    Clock,
    MapPin,
    Package,
    TrendingUp,
    AlertCircle,
    Star,
    Building2,
} from 'lucide-react'
import Link from 'next/link'
import {
    vendorRFQList,
    vendorRFQStats,
    vendorRFQCategories,
    type VendorRFQ,
} from '@/lib/constants'

export default function VendorRFQsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [urgencyFilter, setUrgencyFilter] = useState('all')

    const filteredRFQs = vendorRFQList.filter((rfq) => {
        const matchesSearch =
            rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rfq.hospital.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || rfq.category === categoryFilter
        const matchesUrgency = urgencyFilter === 'all' || rfq.urgency === urgencyFilter
        return matchesSearch && matchesCategory && matchesUrgency
    })

    const getUrgencyColor = (urgency: VendorRFQ['urgency']) => {
        switch (urgency) {
            case 'urgent':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'moderate':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'low':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Available RFQs</h1>
                    <p className="text-muted-foreground">
                        Browse and bid on procurement opportunities
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total RFQs</p>
                                <p className="text-2xl font-bold mt-1">{vendorRFQStats.totalRFQs}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                                <p className="text-2xl font-bold mt-1 text-red-600">
                                    {vendorRFQStats.urgentRFQs}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold mt-1">{vendorRFQStats.totalValue}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Competitors</p>
                                <p className="text-2xl font-bold mt-1">{vendorRFQStats.avgCompetitors}</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search RFQs or hospitals..."
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
                                {vendorRFQCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                            <SelectTrigger className="w-full md:w-52">
                                <SelectValue placeholder="Urgency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Urgency</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* RFQ Grid - 2 Columns */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredRFQs.map((rfq) => (
                    <Card key={rfq.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-semibold flex-1">{rfq.title}</h3>
                                        <Badge className={getUrgencyColor(rfq.urgency)}>
                                            {rfq.deadline}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {rfq.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{rfq.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        <span>{rfq.itemCount} items</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{rfq.pastOrders} past orders</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{rfq.category}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {rfq.competitors} competitors
                                        </span>
                                    </div>
                                    <Link href={`/dashboard/vendor/rfq/${rfq.id}`}>
                                        <Button size="sm">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredRFQs.length === 0 && (
                    <Card className="md:col-span-2">
                        <CardContent className="p-12 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No RFQs found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your filters or search terms
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
