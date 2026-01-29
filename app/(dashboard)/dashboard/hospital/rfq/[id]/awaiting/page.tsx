'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft,
    Search,
    Clock,
    CheckCircle2,
    Eye,
    Package,
    Calendar,
    Send,
    User,
    Filter,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useRFQStore } from '@/lib/rfq-store'

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export default function AwaitingRFQPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { getRFQ } = useRFQStore()
    const [mounted, setMounted] = useState(false)
    const [rfqData, setRfqData] = useState<any>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedVendor, setSelectedVendor] = useState<any>(null)

    useEffect(() => {
        setMounted(true)
        setRfqData(getRFQ(resolvedParams.id))
    }, [resolvedParams.id, getRFQ])

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" disabled>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Awaiting Responses</h1>
                        <p className="text-muted-foreground">Track vendor responses to your RFQ</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="animate-pulse">
                            <div className="h-12 w-12 bg-muted rounded-full mx-auto mb-4" />
                            <div className="h-4 w-48 bg-muted rounded mx-auto mb-2" />
                            <div className="h-3 w-64 bg-muted rounded mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!rfqData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Awaiting Responses</h1>
                        <p className="text-muted-foreground">Track vendor responses to your RFQ</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No RFQs Sent Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven't sent any RFQs yet. Start by selecting vendors for your requirements.
                        </p>
                        <Button onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors`)}>
                            <Send className="h-4 w-4 mr-2" />
                            Select Vendors
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const filteredVendors = rfqData.vendors.filter((vendor: any) => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const statusCounts = {
        all: rfqData.vendors.length,
        sent: rfqData.vendors.filter((v: any) => v.status === 'sent').length,
        viewed: rfqData.vendors.filter((v: any) => v.status === 'viewed').length,
        responded: rfqData.vendors.filter((v: any) => v.status === 'responded').length,
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Sent</Badge>
            case 'viewed':
                return <Badge variant="default" className="gap-1"><Eye className="h-3 w-3" /> Viewed</Badge>
            case 'responded':
                return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Responded</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getProcurementModeLabel = (mode: string) => {
        switch (mode) {
            case 'balanced':
                return 'Balanced'
            case 'emergency':
                return 'Emergency (Speed Priority)'
            case 'cost':
                return 'Cost Optimization'
            case 'quality':
                return 'Quality Focus'
            default:
                return mode
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Awaiting Responses</h1>
                    <p className="text-muted-foreground">Track vendor responses to your RFQ</p>
                </div>
                <Button onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors`)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send More RFQs
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.all}</div>
                        <p className="text-xs text-muted-foreground">vendors contacted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.sent}</div>
                        <p className="text-xs text-muted-foreground">awaiting response</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Viewed</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.viewed}</div>
                        <p className="text-xs text-muted-foreground">RFQ opened</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Responded</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.responded}</div>
                        <p className="text-xs text-muted-foreground">quotes received</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{rfqData.rfqTitle}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Deadline: {formatDeadline(rfqData.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {rfqData.vendors.length} vendors
                                </span>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vendors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                                <SelectItem value="sent">Sent ({statusCounts.sent})</SelectItem>
                                <SelectItem value="viewed">Viewed ({statusCounts.viewed})</SelectItem>
                                <SelectItem value="responded">Responded ({statusCounts.responded})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Requirements</TableHead>
                                    <TableHead>Procurement Mode</TableHead>
                                    <TableHead>Sent At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVendors.map((vendor: any, index: number) => (
                                    <TableRow key={`${vendor.vendorId}-${index}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {vendor.vendorName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.requirements.slice(0, 2).map((req: any) => (
                                                    <Badge key={req.line_item_id} variant="outline" className="text-xs">
                                                        {req.inn_name}
                                                    </Badge>
                                                ))}
                                                {vendor.requirements.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{vendor.requirements.length - 2} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{getProcurementModeLabel(vendor.procurementMode)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(vendor.sentAt)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                                        <TableCell>
                                            <Dialog open={selectedVendor?.vendorId === vendor.vendorId && selectedVendor?.sentAt === vendor.sentAt} onOpenChange={(open) => setSelectedVendor(open ? vendor : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="gap-2">
                                                        <Eye className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-6xl min-w-4xl max-h-[85vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>RFQ Details - {vendor.vendorName}</DialogTitle>
                                                        <DialogDescription>
                                                            View the RFQ sent to this vendor
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-6 mt-4">
                                                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Sent At</p>
                                                                <p className="font-medium">{formatDate(vendor.sentAt)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Status</p>
                                                                <div className="mt-1">{getStatusBadge(vendor.status)}</div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Mode</p>
                                                                <p className="font-medium">{getProcurementModeLabel(vendor.procurementMode)}</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold mb-3">Requirements</h4>
                                                            <div className="border rounded-lg overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Item</TableHead>
                                                                            <TableHead>Brand</TableHead>
                                                                            <TableHead>Dosage</TableHead>
                                                                            <TableHead>Form</TableHead>
                                                                            <TableHead>Quantity</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {vendor.requirements.map((req: any) => (
                                                                            <TableRow key={req.line_item_id}>
                                                                                <TableCell className="font-medium">{req.inn_name}</TableCell>
                                                                                <TableCell>{req.brand_name}</TableCell>
                                                                                <TableCell>{req.dosage}</TableCell>
                                                                                <TableCell>{req.form}</TableCell>
                                                                                <TableCell>{req.quantity} {req.unit_of_issue}s</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredVendors.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-muted-foreground">No vendors found matching your filters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
