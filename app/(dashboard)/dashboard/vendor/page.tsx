// app/(dashboard)/dashboard/vendor/page.tsx
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
                        <div className="text-3xl font-bold">€184,500</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+24%</span> from last month
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
                        <div className="text-3xl font-bold">23</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            15 pending • 8 shortlisted
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
                        <div className="text-3xl font-bold">68%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+12%</span> vs last quarter
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
                        <div className="text-3xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600">+8</span> added today
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
                            <div className="text-3xl font-bold">€184,500</div>
                            <p className="text-sm text-muted-foreground mt-1">This month</p>
                            <p className="text-sm text-green-600 mt-1">+24% vs last month</p>
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
                                <div className="text-2xl font-bold text-green-600">45</div>
                                <div className="text-xs text-muted-foreground mt-1">Won</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-yellow-50">
                                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-yellow-600">23</div>
                                <div className="text-xs text-muted-foreground mt-1">Pending</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-red-50">
                                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-600">12</div>
                                <div className="text-xs text-muted-foreground mt-1">Lost</div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Win Rate</span>
                                    <span className="font-medium">68%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '68%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Average Bid Value</span>
                                    <span className="font-medium">€12,400</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Response Time</span>
                                    <span className="font-medium">2.3 days</span>
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
                            <TableRow>
                                <TableCell className="font-medium text-xs">RFQ-2847</TableCell>
                                <TableCell className="text-xs">City General Hospital</TableCell>
                                <TableCell className="text-xs">Medical Supplies - PPE Kits</TableCell>
                                <TableCell className="text-right text-xs">€15,000</TableCell>
                                <TableCell className="text-center text-xs">7</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="destructive" className="text-xs">18h</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" className="h-7 text-xs">Place Bid</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-xs">RFQ-2846</TableCell>
                                <TableCell className="text-xs">St. Mary's Hospital</TableCell>
                                <TableCell className="text-xs">Surgical Instruments</TableCell>
                                <TableCell className="text-right text-xs">€28,500</TableCell>
                                <TableCell className="text-center text-xs">4</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">2d</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" className="h-7 text-xs">Place Bid</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-xs">RFQ-2845</TableCell>
                                <TableCell className="text-xs">County Medical Center</TableCell>
                                <TableCell className="text-xs">Laboratory Equipment</TableCell>
                                <TableCell className="text-right text-xs">€52,000</TableCell>
                                <TableCell className="text-center text-xs">11</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">3d</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" className="h-7 text-xs">Place Bid</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium text-xs">RFQ-2844</TableCell>
                                <TableCell className="text-xs">Regional Health Center</TableCell>
                                <TableCell className="text-xs">Disposable Syringes (Bulk)</TableCell>
                                <TableCell className="text-right text-xs">€8,900</TableCell>
                                <TableCell className="text-center text-xs">6</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">5d</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button size="sm" className="h-7 text-xs">Place Bid</Button>
                                </TableCell>
                            </TableRow>
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
                                <TableRow>
                                    <TableCell className="font-medium text-xs">BID-8934</TableCell>
                                    <TableCell className="text-xs">Medical Gloves</TableCell>
                                    <TableCell className="text-right text-xs">€9,800</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-green-100 text-green-700">1st</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Under Review</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">BID-8933</TableCell>
                                    <TableCell className="text-xs">IV Infusion Sets</TableCell>
                                    <TableCell className="text-right text-xs">€14,200</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-blue-100 text-blue-700">2nd</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Pending</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">BID-8932</TableCell>
                                    <TableCell className="text-xs">Surgical Masks</TableCell>
                                    <TableCell className="text-right text-xs">€6,500</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-green-100 text-green-700">1st</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-green-100 text-green-700">Shortlisted</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">BID-8931</TableCell>
                                    <TableCell className="text-xs">ECG Electrodes</TableCell>
                                    <TableCell className="text-right text-xs">€4,800</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-orange-100 text-orange-700">3rd</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Pending</Badge>
                                    </TableCell>
                                </TableRow>
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
                        {[
                            { rank: 1, name: 'City General Hospital', orders: 42, amount: '€85,000', color: 'bg-green-500' },
                            { rank: 2, name: "St. Mary's Medical Center", orders: 38, amount: '€62,500', color: 'bg-green-400' },
                            { rank: 3, name: 'County Health Services', orders: 31, amount: '€48,200', color: 'bg-green-300' },
                            { rank: 4, name: 'Regional Hospital Network', orders: 24, amount: '€38,900', color: 'bg-green-200' },
                            { rank: 5, name: 'Metro Clinical Center', orders: 19, amount: '€25,400', color: 'bg-green-100' },
                        ].map((customer) => (
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
