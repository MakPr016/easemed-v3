import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    FileText,
    ShoppingCart,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    DollarSign,
    Target,
    Award,
    Building2,
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
import {
    vendorStats,
    bidPerformance,
    rfqOpportunities,
    activeBids,
    topCustomers,
} from '@/lib/constants'


export default function VendorDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <span>Welcome Back</span>
                        <Sparkles className="h-6 w-6 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">Here's your business overview</p>
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


            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{vendorStats.totalRevenue.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className={vendorStats.totalRevenue.isPositive ? "text-green-600" : "text-red-600"}>
                                {vendorStats.totalRevenue.change}
                            </span> from last month
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Bids
                        </CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{vendorStats.activeBids.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {vendorStats.activeBids.pending} pending • {vendorStats.activeBids.shortlisted} shortlisted
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Win Rate
                        </CardTitle>
                        <Target className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{vendorStats.winRate.percentage}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className={vendorStats.winRate.isPositive ? "text-green-600" : "text-red-600"}>
                                {vendorStats.winRate.change}
                            </span> vs last quarter
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            New Opportunities
                        </CardTitle>
                        <Award className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{vendorStats.newOpportunities.count}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+{vendorStats.newOpportunities.addedToday}</span> added today
                        </p>
                    </CardContent>
                </Card>
            </div>


            {/* Revenue and Bid Performance */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue trend</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-3xl font-bold">{vendorStats.totalRevenue.value}</div>
                            <p className="text-sm text-muted-foreground mt-1">This month</p>
                            <p className="text-sm text-green-600 mt-1">{vendorStats.totalRevenue.change} vs last month</p>
                        </div>


                        <div className="h-48 bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4 relative overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                                <path
                                    d="M 0,120 L 40,115 L 80,110 L 120,105 L 160,95 L 200,85 L 240,75 L 280,60 L 320,50 L 360,45 L 400,40"
                                    fill="none"
                                    stroke="#16a34a"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M 0,120 L 40,115 L 80,110 L 120,105 L 160,95 L 200,85 L 240,75 L 280,60 L 320,50 L 360,45 L 400,40 L 400,150 L 0,150 Z"
                                    fill="url(#revenueGradient)"
                                    opacity="0.4"
                                />
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">Jan</div>
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">Dec</div>
                            <div className="absolute top-2 left-2 text-xs font-medium">€200k</div>
                            <div className="absolute bottom-12 left-2 text-xs font-medium">€100k</div>
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Bid Performance</CardTitle>
                        <CardDescription>Success rate breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg bg-green-50">
                                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-600">{bidPerformance.won}</div>
                                <div className="text-xs text-muted-foreground mt-1">Won</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-yellow-50">
                                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-yellow-600">{bidPerformance.pending}</div>
                                <div className="text-xs text-muted-foreground mt-1">Pending</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-red-50">
                                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-600">{bidPerformance.lost}</div>
                                <div className="text-xs text-muted-foreground mt-1">Lost</div>
                            </div>
                        </div>


                        <div className="space-y-3 mt-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Win Rate</span>
                                    <span className="font-medium">{bidPerformance.winRate}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${bidPerformance.winRate}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Average Bid Value</span>
                                    <span className="font-medium">{bidPerformance.averageBidValue}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Response Time</span>
                                    <span className="font-medium">{bidPerformance.responseTime}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: '92%' }} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* New RFQ Opportunities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>New RFQ Opportunities</CardTitle>
                        <Button variant="link" className="text-blue-600">View all</Button>
                    </div>
                    <CardDescription>Latest procurement requests matching your catalog</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">RFQ ID</TableHead>
                                <TableHead className="text-xs">HOSPITAL</TableHead>
                                <TableHead className="text-xs">TITLE</TableHead>
                                <TableHead className="text-xs text-right">BUDGET</TableHead>
                                <TableHead className="text-xs text-center">COMPETITORS</TableHead>
                                <TableHead className="text-xs text-center">DEADLINE</TableHead>
                                <TableHead className="text-xs text-center">ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfqOpportunities.map((rfq) => (
                                <TableRow key={rfq.id}>
                                    <TableCell className="font-medium text-xs">{rfq.id}</TableCell>
                                    <TableCell className="text-xs">{rfq.hospital}</TableCell>
                                    <TableCell className="text-xs">{rfq.title}</TableCell>
                                    <TableCell className="text-right text-xs">{rfq.budget}</TableCell>
                                    <TableCell className="text-center text-xs">{rfq.competitors}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={rfq.deadlineVariant}
                                            className={`text-xs ${rfq.deadlineVariant === 'secondary' ? 'bg-yellow-100 text-yellow-700' : ''
                                                }`}
                                        >
                                            {rfq.deadline}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button size="sm" className="h-7 text-xs">Place Bid</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            {/* My Active Bids and Top Customers */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>My Active Bids</CardTitle>
                            <Button variant="link" className="text-blue-600">View all</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">BID ID</TableHead>
                                    <TableHead className="text-xs">RFQ TITLE</TableHead>
                                    <TableHead className="text-xs text-right">YOUR BID</TableHead>
                                    <TableHead className="text-xs text-center">RANK</TableHead>
                                    <TableHead className="text-xs text-center">STATUS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeBids.map((bid) => (
                                    <TableRow key={bid.bidId}>
                                        <TableCell className="font-medium text-xs">{bid.bidId}</TableCell>
                                        <TableCell className="text-xs">{bid.rfqTitle}</TableCell>
                                        <TableCell className="text-right text-xs">{bid.yourBid}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`text-xs bg-${bid.rankVariant}-100 text-${bid.rankVariant}-700`}>
                                                {bid.rank}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`text-xs bg-${bid.statusVariant}-100 text-${bid.statusVariant}-700`}>
                                                {bid.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>Your best performing relationships</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topCustomers.map((customer) => (
                            <div key={customer.rank} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium">
                                    #{customer.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-sm">{customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${customer.color}`}
                                                style={{ width: `${Math.min(customer.orders * 2, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{customer.orders} orders</span>
                                    </div>
                                </div>
                                <div className="font-bold text-sm">{customer.amount}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
