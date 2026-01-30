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
    MapPin,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    CreditCard,
    User,
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
        rfqId: string
        rfqTitle: string
        hospital: string
        location: string
        category: string
        itemCount: number
        status: 'pending' | 'under_review' | 'awarded' | 'rejected'
        submittedAt: string
        quotationAmount: string
        deadline: string
    }
}

const mockQuotationItems: QuotationItem[] = [
    {
        id: '1',
        name: 'N95 Respirator Masks',
        quantity: 1000,
        unit: 'pieces',
        unitPrice: '€2.50',
        totalPrice: '€2,500'
    },
    {
        id: '2',
        name: 'Surgical Gloves',
        quantity: 5000,
        unit: 'pairs',
        unitPrice: '€0.80',
        totalPrice: '€4,000'
    },
    {
        id: '3',
        name: 'Face Shields',
        quantity: 500,
        unit: 'pieces',
        unitPrice: '€5.00',
        totalPrice: '€2,500'
    },
    {
        id: '4',
        name: 'Protective Gowns',
        quantity: 800,
        unit: 'pieces',
        unitPrice: '€12.00',
        totalPrice: '€9,600'
    },
    {
        id: '5',
        name: 'Hand Sanitizer',
        quantity: 200,
        unit: 'liters',
        unitPrice: '€18.00',
        totalPrice: '€3,600'
    },
]

export function QuotationDetailDialog({ open, onOpenChange, quotation }: QuotationDetailDialogProps) {
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
                    label: 'Accepted'
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
                            <DialogTitle className="text-2xl">{quotation.rfqTitle}</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Hospital</p>
                                    <p className="font-medium">{quotation.hospital}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{quotation.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <Badge variant="outline">{quotation.category}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Submitted Date</p>
                                    <p className="font-medium">
                                        {new Date(quotation.submittedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">RFQ Deadline</p>
                                    <p className="font-medium">
                                        {new Date(quotation.deadline).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">RFQ Reference</p>
                                    <p className="font-medium">{quotation.rfqId}</p>
                                </div>
                            </div>
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
                                {mockQuotationItems.map((item) => (
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
                            <p className="text-3xl font-bold text-primary">{quotation.quotationAmount}</p>
                        </div>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>

                    {quotation.status === 'awarded' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-green-900">Congratulations!</p>
                                    <p className="text-sm text-green-800 mt-1">
                                        Your quotation has been accepted. The hospital will contact you shortly to proceed with the order.
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
                                    <p className="font-semibold text-red-900">Quotation Not Selected</p>
                                    <p className="text-sm text-red-800 mt-1">
                                        Unfortunately, your quotation was not selected for this RFQ. Thank you for your submission.
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
