'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Plus,
    Search,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Eye,
    MoreHorizontal,
    LayoutGrid,
    List,
    Calendar,
    Package,
    MessageSquare,
    Pencil
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

interface RFQ {
    id: string
    title: string
    status: string
    createdAt: string
    deadline: string
    itemCount: number
    quotationCount: number
    category: string
    budget: string
}

interface HospitalRFQClientProps {
    rfqs: RFQ[]
    stats: {
        total: number
        active: number
        totalQuotations: number
        avgQuotations: number
    }
    statusFilter: string
}

export default function HospitalRFQClient({ rfqs, stats, statusFilter }: HospitalRFQClientProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const handleTabChange = (value: string) => {
        if (value === 'all') {
            router.push('/dashboard/hospital/rfq')
        } else {
            router.push(`/dashboard/hospital/rfq?status=${value}`)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
            case 'draft':
                return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100'
            case 'closed':
                return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'
            case 'awarded':
                return 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">RFQ Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your Request for Quotations
                    </p>
                </div>
                <Link href="/dashboard/hospital/rfq/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New RFQ
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Currently published</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuotations}</div>
                        <p className="text-xs text-muted-foreground">Received from vendors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgQuotations}</div>
                        <p className="text-xs text-muted-foreground">Quotes per RFQ</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs value={statusFilter} onValueChange={handleTabChange} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All RFQs</TabsTrigger>
                        <TabsTrigger value="published">Active</TabsTrigger>
                        <TabsTrigger value="draft">Drafts</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search RFQs..."
                            className="pl-8"
                        />
                    </div>

                    <div className="flex items-center border rounded-md bg-background p-1 h-10">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="px-3 h-8"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="px-3 h-8"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {rfqs.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No RFQs Found</h3>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                        No requests match your current filters. Create a new RFQ or try changing the status filter.
                    </p>
                    <Link href="/dashboard/hospital/rfq/create">
                        <Button>Create RFQ</Button>
                    </Link>
                </Card>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rfqs.map((rfq) => (
                                <Card key={rfq.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-semibold leading-tight line-clamp-1" title={rfq.title}>
                                                    {rfq.title}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground font-mono">ID: {rfq.id.slice(0, 8)}</p>
                                            </div>
                                            <Badge className={`${getStatusColor(rfq.status)} shrink-0`} variant="outline">
                                                {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-3">
                                        <div className="space-y-4">
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-foreground">{rfq.category}</span>
                                                    <span>•</span>
                                                    <span>{rfq.budget}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> Created
                                                    </span>
                                                    <span className="font-medium">{formatDate(rfq.createdAt)}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Deadline
                                                    </span>
                                                    <span className={`font-medium ${rfq.deadline ? 'text-orange-600' : ''}`}>
                                                        {formatDate(rfq.deadline)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{rfq.itemCount}</span>
                                                    <span className="text-muted-foreground">Items</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{rfq.quotationCount}</span>
                                                    <span className="text-muted-foreground">Quotes</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-3 border-t bg-muted/5 flex gap-2">
                                        <Link href={`/dashboard/hospital/rfq/${rfq.id}`} className="flex-1">
                                            <Button variant={rfq.status === 'draft' ? "default" : "outline"} className="w-full">
                                                {rfq.status === 'draft' ? (
                                                    <>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Continue Editing
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </>
                                                )}
                                            </Button>
                                        </Link>

                                        {rfq.status !== 'draft' && (
                                            <Link
                                                href={rfq.quotationCount > 0 ? `/dashboard/hospital/rfq/${rfq.id}/analyze` : '#'}
                                                className={rfq.quotationCount === 0 ? 'pointer-events-none flex-1' : 'flex-1'}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
                                                    disabled={rfq.quotationCount === 0}
                                                >
                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                    Analyse
                                                </Button>
                                            </Link>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">RFQ Details</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Timeline</TableHead>
                                            <TableHead className="text-center">Items</TableHead>
                                            <TableHead className="text-center">Quotations</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rfqs.map((rfq) => (
                                            <TableRow key={rfq.id} className="group">
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-base group-hover:text-primary transition-colors">
                                                            {rfq.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {rfq.id.slice(0, 8)}...
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {rfq.category} • {rfq.budget}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(rfq.status)} variant="outline">
                                                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        <span className="text-muted-foreground">Created: {formatDate(rfq.createdAt)}</span>
                                                        {rfq.deadline && (
                                                            <span className="font-medium text-orange-600">
                                                                Due: {formatDate(rfq.deadline)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="font-mono">
                                                        {rfq.itemCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Badge variant={rfq.quotationCount > 0 ? "default" : "secondary"}>
                                                            {rfq.quotationCount}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2 pr-2">
                                                        <Link href={`/dashboard/hospital/rfq/${rfq.id}`}>
                                                            <Button
                                                                variant={rfq.status === 'draft' ? "default" : "outline"}
                                                                size="sm"
                                                                className="h-auto py-3"
                                                            >
                                                                {rfq.status === 'draft' ? (
                                                                    <>
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Continue Editing
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </Link>

                                                        {rfq.status !== 'draft' && (
                                                            <Link href={rfq.quotationCount > 0 ? `/dashboard/hospital/rfq/${rfq.id}/analyze` : '#'}>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-auto py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 border"
                                                                    disabled={rfq.quotationCount === 0}
                                                                >
                                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                                    Analyse
                                                                </Button>
                                                            </Link>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>Edit RFQ</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}