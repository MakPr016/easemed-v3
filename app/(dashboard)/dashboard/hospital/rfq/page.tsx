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
    Filter,
    Clock,
    Package,
    FileText,
    Eye,
    BarChart3,
    Plus,
    Calendar,
} from 'lucide-react'
import Link from 'next/link'

interface HospitalRFQ {
    id: string
    title: string
    category: string
    itemCount: number
    status: 'draft' | 'active' | 'closed' | 'awarded'
    quotationCount: number
    deadline: string
    createdAt: string
    budget: string
}

const mockHospitalRFQs: HospitalRFQ[] = [
    {
        id: 'RFQ-2847',
        title: 'Medical Supplies - PPE Kits',
        category: 'Medical Supplies',
        itemCount: 5,
        status: 'active',
        quotationCount: 4,
        deadline: '2026-02-15',
        createdAt: '2026-01-20',
        budget: '€25,000'
    },
    {
        id: 'RFQ-2846',
        title: 'Laboratory Equipment',
        category: 'Equipment',
        itemCount: 3,
        status: 'closed',
        quotationCount: 8,
        deadline: '2026-01-25',
        createdAt: '2026-01-15',
        budget: '€50,000'
    },
    {
        id: 'RFQ-2845',
        title: 'Surgical Instruments',
        category: 'Instruments',
        itemCount: 7,
        status: 'active',
        quotationCount: 15,
        deadline: '2026-02-20',
        createdAt: '2026-01-18',
        budget: '€35,000'
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

export default function HospitalRFQPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredRFQs = mockHospitalRFQs.filter((rfq) => {
        const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: HospitalRFQ['status']) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700'
            case 'active':
                return 'bg-green-100 text-green-700'
            case 'closed':
                return 'bg-blue-100 text-blue-700'
            case 'awarded':
                return 'bg-purple-100 text-purple-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My RFQs</h1>
                    <p className="text-muted-foreground">
                        Manage and track your procurement requests
                    </p>
                </div>
                <Link href="/dashboard/hospital/rfq/upload">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create RFQ
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total RFQs</p>
                                <p className="text-2xl font-bold mt-1">24</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">8</p>
                            </div>
                            <Clock className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Quotations</p>
                                <p className="text-2xl font-bold mt-1">156</p>
                            </div>
                            <Package className="h-8 w-8 text-orange-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Quotations</p>
                                <p className="text-2xl font-bold mt-1">6.5</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
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
                                placeholder="Search RFQs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-52">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="awarded">Awarded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {filteredRFQs.map((rfq) => (
                    <Card key={rfq.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-semibold">{rfq.title}</h3>
                                            <Badge className={getStatusColor(rfq.status)}>
                                                {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>#{rfq.id}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Created: {formatDate(rfq.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">{rfq.category}</Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {rfq.itemCount} items
                                            </span>
                                            <span className="text-sm">
                                                <span className="font-semibold">{rfq.quotationCount}</span> quotations
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Deadline: {formatDate(rfq.deadline)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Budget: {rfq.budget}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Link href={`/dashboard/hospital/rfq/${rfq.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                    {rfq.status === 'closed' && rfq.quotationCount > 0 && (
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
        </div>
    )
}
