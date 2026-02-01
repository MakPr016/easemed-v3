'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowUpRight,
    FileText,
    ShoppingCart,
    Package,
    AlertCircle,
    TrendingDown,
    Clock,
    Pill,
    Laptop,
    Box,
    FlaskConical,
    Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from 'next/link'

interface DashboardData {
    user: {
        name: string
        organization: string
        role: string
    }
    stats: {
        completed: number
        active: number
        bidding: number
        pending: number
    }
    latestBidding: any[]
    activeOrders: any[]
}

export default function DashboardContent({ data }: { data: DashboardData }) {
    const getTimeLeft = (deadline: string) => {
        const now = new Date()
        const end = new Date(deadline)
        const diff = end.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        
        if (days > 0) return `${days}d`
        if (hours > 0) return `${hours}h`
        return 'Expired'
    }

    const getTimeLeftVariant = (deadline: string) => {
        const now = new Date()
        const end = new Date(deadline)
        const diff = end.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        
        if (hours < 24) return 'destructive'
        if (hours < 72) return 'secondary'
        return 'secondary'
    }

    const getStatusBadgeClass = (status: string) => {
        const statusMap: Record<string, string> = {
            'shipped': 'bg-orange-100 text-orange-700',
            'in_transit': 'bg-blue-100 text-blue-700',
            'processing': 'bg-yellow-100 text-yellow-700',
            'approved': 'bg-green-100 text-green-700',
            'completed': 'bg-purple-100 text-purple-700',
        }
        return statusMap[status] || 'bg-gray-100 text-gray-700'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <span>Welcome {data.user.name}</span>
                        <Sparkles className="h-6 w-6 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">Your procurement overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        Last 30 days
                    </Button>
                    <Button>
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed Purchases
                        </CardTitle>
                        <Package className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.stats.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total completed orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Orders
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.stats.active}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In progress
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ongoing Biddings
                        </CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.stats.bidding}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting your review
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Reviews
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {data.stats.pending > 0 && (
                                <>
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    <span className="text-red-600">Needs attention</span>
                                </>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingDown className="h-4 w-4 text-green-600" />
                            </div>
                            <CardTitle>Cost Savings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-4xl font-bold">€251,000</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Total saved this quarter
                            </p>
                            <p className="text-sm text-green-600 mt-1">18% under budget</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Best bid selection</span>
                                <span className="font-medium">€180,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Bulk discounts</span>
                                <span className="font-medium">€51,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Negotiated rates</span>
                                <span className="font-medium">€20,000</span>
                            </div>
                        </div>

                        <div className="h-32 bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4 relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                <path
                                    d="M 0,80 L 50,75 L 100,70 L 150,65 L 200,55 L 250,45 L 300,35 L 350,25 L 400,20"
                                    fill="none"
                                    stroke="#16a34a"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M 0,80 L 50,75 L 100,70 L 150,65 L 200,55 L 250,45 L 300,35 L 350,25 L 400,20 L 400,100 L 0,100 Z"
                                    fill="url(#gradient)"
                                    opacity="0.3"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">Week 1</div>
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Week 8</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle>Time Savings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-4xl font-bold">47 days</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Procurement cycle time reduced
                            </p>
                            <p className="text-sm text-blue-600 mt-1">35% faster processing</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Faster bid evaluation</span>
                                <span className="font-medium">28 days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Automated workflows</span>
                                <span className="font-medium">12 days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Digital approvals</span>
                                <span className="font-medium">7 days</span>
                            </div>
                        </div>

                        <div className="h-32 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                <path
                                    d="M 0,85 L 50,80 L 100,76 L 150,72 L 200,65 L 250,58 L 300,50 L 350,42 L 400,35"
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M 0,85 L 50,80 L 100,76 L 150,72 L 200,65 L 250,58 L 300,50 L 350,42 L 400,35 L 400,100 L 0,100 Z"
                                    fill="url(#gradientBlue)"
                                    opacity="0.3"
                                />
                                <defs>
                                    <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">Week 1</div>
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Week 8</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Purchase Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm font-medium mb-4">Purchase Amount Trend</p>
                            <div className="h-40 bg-linear-to-r from-orange-50 to-orange-100 rounded-lg p-4 relative overflow-hidden">
                                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                                    <path
                                        d="M 0,90 L 50,85 L 100,88 L 150,82 L 200,75 L 250,70 L 300,55 L 350,45 L 400,50"
                                        fill="none"
                                        stroke="#ea580c"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M 0,90 L 50,85 L 100,88 L 150,82 L 200,75 L 250,70 L 300,55 L 350,45 L 400,50 L 400,120 L 0,120 Z"
                                        fill="url(#gradientOrange)"
                                        opacity="0.3"
                                    />
                                    <defs>
                                        <linearGradient id="gradientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">Jan</div>
                                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Aug</div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-4">Purchase Status Distribution</p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="h-32 bg-purple-500 rounded-lg flex items-end justify-center p-2">
                                        <div className="text-white text-sm">40</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Purchased</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-24 bg-orange-500 rounded-lg flex items-end justify-center p-2">
                                        <div className="text-white text-sm">25</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Shipped</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-28 bg-green-500 rounded-lg flex items-end justify-center p-2">
                                        <div className="text-white text-sm">35</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Delivered</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Latest Bidding Activity</CardTitle>
                            <Link href="/dashboard/hospital/rfq">
                                <Button variant="link" className="text-blue-600">View all</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.latestBidding.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">RFQ ID</TableHead>
                                        <TableHead className="text-xs">TITLE</TableHead>
                                        <TableHead className="text-xs text-center">BIDS</TableHead>
                                        <TableHead className="text-xs text-center">TIME LEFT</TableHead>
                                        <TableHead className="text-xs text-center">ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.latestBidding.map((rfq) => (
                                        <TableRow key={rfq.id}>
                                            <TableCell className="font-medium text-xs font-mono">
                                                {rfq.id.substring(0, 8)}
                                            </TableCell>
                                            <TableCell className="text-xs">{rfq.title}</TableCell>
                                            <TableCell className="text-center text-xs">
                                                {rfq.metadata?.bid_count || 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant={getTimeLeftVariant(rfq.deadline)}
                                                    className="text-xs"
                                                >
                                                    {getTimeLeft(rfq.deadline)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link href={`/dashboard/hospital/rfq/${rfq.id}/analyze`}>
                                                    <Button size="sm" className="h-7 text-xs">Review</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No active biddings
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Active Orders</CardTitle>
                            <Link href="/dashboard/hospital/orders">
                                <Button variant="link" className="text-blue-600">View all</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.activeOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">ORDER ID</TableHead>
                                        <TableHead className="text-xs">TITLE</TableHead>
                                        <TableHead className="text-xs">ITEMS</TableHead>
                                        <TableHead className="text-xs text-center">STATUS</TableHead>
                                        <TableHead className="text-xs">DEADLINE</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.activeOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium text-xs font-mono">
                                                {order.id.substring(0, 8)}
                                            </TableCell>
                                            <TableCell className="text-xs">{order.title}</TableCell>
                                            <TableCell className="text-xs">
                                                {order.metadata?.item_count || 0} items
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={`text-xs ${getStatusBadgeClass(order.status)}`}>
                                                    {order.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(order.deadline).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No active orders
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { rank: 1, category: 'Medicines', icon: Pill, amount: '€85,000', percentage: 42, color: 'bg-purple-500' },
                            { rank: 2, category: 'IT Equipment', icon: Laptop, amount: '€62,500', percentage: 31, color: 'bg-purple-400' },
                            { rank: 3, category: 'Office Supplies', icon: Box, amount: '€38,200', percentage: 19, color: 'bg-purple-300' },
                            { rank: 4, category: 'Lab Equipment', icon: FlaskConical, amount: '€28,900', percentage: 14, color: 'bg-purple-200' },
                            { rank: 5, category: 'Cleaning Services', icon: Sparkles, amount: '€15,400', percentage: 8, color: 'bg-purple-100' },
                        ].map((item) => (
                            <div key={item.rank} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium">
                                    #{item.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <item.icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-sm">{item.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color}`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{item.percentage}% of total</span>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">{item.amount}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
