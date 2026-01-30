'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search,
    Filter,
    Download,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

interface Order {
    id: string
    rfqId: string
    rfqTitle: string
    vendorName: string
    orderDate: string
    deliveryDate: string
    totalAmount: string
    status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
    itemCount: number
    paymentStatus: 'pending' | 'paid' | 'partial'
}

const mockOrders: Order[] = [
    {
        id: 'PO-2024-001',
        rfqId: 'RFQ-2847',
        rfqTitle: 'Medical Supplies Q1 2024',
        vendorName: 'MedSupply Pro',
        orderDate: '2024-01-15',
        deliveryDate: '2024-01-25',
        totalAmount: '€12,450',
        status: 'delivered',
        itemCount: 5,
        paymentStatus: 'paid'
    },
    {
        id: 'PO-2024-002',
        rfqId: 'RFQ-2848',
        rfqTitle: 'Surgical Equipment Request',
        vendorName: 'HealthCare Distributors Ltd.',
        orderDate: '2024-01-18',
        deliveryDate: '2024-01-28',
        totalAmount: '€8,900',
        status: 'in_transit',
        itemCount: 3,
        paymentStatus: 'paid'
    },
    {
        id: 'PO-2024-003',
        rfqId: 'RFQ-2849',
        rfqTitle: 'Emergency Medical Supplies',
        vendorName: 'QuickMed Solutions',
        orderDate: '2024-01-20',
        deliveryDate: '2024-01-30',
        totalAmount: '€15,200',
        status: 'confirmed',
        itemCount: 8,
        paymentStatus: 'pending'
    },
    {
        id: 'PO-2024-004',
        rfqId: 'RFQ-2850',
        rfqTitle: 'Laboratory Equipment',
        vendorName: 'LabTech International',
        orderDate: '2024-01-22',
        deliveryDate: '2024-02-05',
        totalAmount: '€22,800',
        status: 'pending',
        itemCount: 12,
        paymentStatus: 'pending'
    },
]

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export default function HospitalOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    const getStatusConfig = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending',
                    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    icon: Clock
                }
            case 'confirmed':
                return {
                    label: 'Confirmed',
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: CheckCircle2
                }
            case 'in_transit':
                return {
                    label: 'In Transit',
                    color: 'bg-purple-100 text-purple-700 border-purple-200',
                    icon: Truck
                }
            case 'delivered':
                return {
                    label: 'Delivered',
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: Package
                }
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    color: 'bg-red-100 text-red-700 border-red-200',
                    icon: AlertCircle
                }
        }
    }

    const getPaymentStatusColor = (status: Order['paymentStatus']) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700'
            case 'partial':
                return 'bg-yellow-100 text-yellow-700'
            case 'pending':
                return 'bg-orange-100 text-orange-700'
        }
    }

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
    })

    const stats = {
        total: mockOrders.length,
        pending: mockOrders.filter(o => o.status === 'pending').length,
        inTransit: mockOrders.filter(o => o.status === 'in_transit').length,
        delivered: mockOrders.filter(o => o.status === 'delivered').length,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground">
                        Manage and track all your purchase orders
                    </p>
                </div>
                <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Orders
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.inTransit}</p>
                            </div>
                            <Truck className="h-8 w-8 text-purple-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                                <p className="text-3xl font-bold mt-1 text-green-600">{stats.delivered}</p>
                            </div>
                            <Package className="h-8 w-8 text-green-500 opacity-70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <CardTitle>All Orders</CardTitle>
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>RFQ Details</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status)
                                    const StatusIcon = statusConfig.icon

                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/dashboard/hospital/orders/${order.id}`} className="hover:underline">
                                                    {order.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.rfqTitle}</p>
                                                    <p className="text-sm text-muted-foreground">{order.rfqId}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{order.vendorName}</TableCell>
                                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                                            <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                                            <TableCell className="font-semibold">{order.totalAmount}</TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/hospital/orders/${order.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
