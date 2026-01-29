'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Clock,
    Package,
    FileText,
    Calendar,
    Building2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Award,
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

interface QuotationItem {
    id: string
    name: string
    quantity: number
    unit: string
    unitPrice: string
    totalPrice: string
}

interface QuotationDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    quotation: {
        id: string
        vendorName: string
        totalAmount: string
        submittedAt: string
        status: string
        deliveryTime: string
        validUntil: string
        items: QuotationItem[]
    }
    onAward?: () => void
    onReject?: () => void
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

export function QuotationDetailDialog({
    open,
    onOpenChange,
    quotation,
    onAward,
    onReject
}: QuotationDetailDialogProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    icon: Clock,
                    label: 'Pending'
                }
            case 'under_review':
                return {
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: AlertCircle,
                    label: 'Under Review'
                }
            case 'awarded':
                return {
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: CheckCircle2,
                    label: 'Awarded'
                }
            case 'rejected':
                return {
                    color: 'bg-red-100 text-red-700 border-red-200',
                    icon: XCircle,
                    label: 'Rejected'
                }
            default:
                return {
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: Clock,
                    label: 'Unknown'
                }
        }
    }

    const statusConfig = getStatusConfig(quotation.status)
    const StatusIcon = statusConfig.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl min-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl">{quotation.vendorName}</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Quotation ID: {quotation.id}
                            </p>
                        </div>
                        <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <p className="text-sm">Submitted Date</p>
                            </div>
                            <p className="font-medium">{formatDate(quotation.submittedAt)}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <p className="text-sm">Delivery Time</p>
                            </div>
                            <p className="font-medium">{quotation.deliveryTime}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <p className="text-sm">Valid Until</p>
                            </div>
                            <p className="font-medium">{formatDate(quotation.validUntil)}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quotation Items</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotation.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            {item.quantity} {item.unit}
                                        </TableCell>
                                        <TableCell className="text-right">{item.unitPrice}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.totalPrice}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Quotation Amount</p>
                            <p className="text-3xl font-bold text-primary">{quotation.totalAmount}</p>
                        </div>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>

                    {quotation.status === 'pending' && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={onReject}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={onAward}
                            >
                                <Award className="h-4 w-4 mr-2" />
                                Award Contract
                            </Button>
                        </div>
                    )}

                    {quotation.status === 'awarded' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-green-900">Contract Awarded</p>
                                    <p className="text-sm text-green-800 mt-1">
                                        This vendor has been awarded the contract. The order has been created.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {quotation.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-900">Quotation Rejected</p>
                                    <p className="text-sm text-red-800 mt-1">
                                        This quotation has been rejected and the vendor has been notified.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
