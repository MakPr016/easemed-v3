'use client'

import { use, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    MapPin,
    Clock,
    Package,
    Calendar,
    FileText,
    CreditCard,
    ArrowLeft,
    AlertCircle,
    Upload,
    X,
    CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { vendorRFQDetails } from '@/lib/constants'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { RFQMap } from '@/components/maps/RFQMap'

export default function VendorRFQDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const rfq = vendorRFQDetails[id]

    const [bidDialogOpen, setBidDialogOpen] = useState(false)
    const [quotationFile, setQuotationFile] = useState<File | null>(null)
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setQuotationFile(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setQuotationFile(null)
    }

    const handleSubmitBid = async () => {
        if (!quotationFile) {
            alert('Please upload a quotation document')
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('rfqId', id)
            formData.append('quotationDocument', quotationFile)
            formData.append('notes', notes)
            formData.append('submittedAt', new Date().toISOString())

            await new Promise(resolve => setTimeout(resolve, 2000))

            console.log('Bid submitted:', {
                rfqId: id,
                fileName: quotationFile.name,
                fileSize: quotationFile.size,
                notes,
                submittedAt: new Date().toISOString()
            })

            setSubmitSuccess(true)
            setTimeout(() => {
                window.location.href = '/dashboard/vendor/quotations'
            }, 2000)


        } catch (error) {
            console.error('Error submitting bid:', error)
            alert('Failed to submit bid. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!rfq) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This RFQ may have been closed or is not available to you.
                        </p>
                        <Link href="/dashboard/vendor/rfq">
                            <Button>Back to RFQs</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getUrgencyColor = (urgency: string) => {
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
            <div className="flex items-center gap-4">
                <Link href="/dashboard/vendor/rfq">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
                        <Badge className={getUrgencyColor(rfq.urgency)}>
                            {rfq.deadline}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{rfq.id}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items Required</CardTitle>
                            <CardDescription>{rfq.items.length} items in this RFQ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Specification</TableHead>
                                        <TableHead className="text-right">Est. Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfq.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.specification}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.estimatedPrice || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Location</CardTitle>
                            <CardDescription>Region for this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-semibold">{rfq.location}</p>
                                </div>
                            </div>

                            <RFQMap
                                lat={rfq.coordinates.lat}
                                lng={rfq.coordinates.lng}
                                location={rfq.location}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{rfq.specifications}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Required Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {rfq.requiredDocuments.map((doc, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span className="text-sm">{doc}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Delivery Deadline</p>
                                        <p className="font-medium">{rfq.deliveryDeadline}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Payment Terms</p>
                                        <p className="font-medium">{rfq.paymentTerms}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <Badge variant="outline">{rfq.category}</Badge>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bid Deadline</p>
                                        <p className="font-medium">{rfq.deadline}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => setBidDialogOpen(true)}
                        >
                            Place Your Bid
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                <DialogContent className="sm:max-w-125">
                    {submitSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Bid Submitted Successfully!</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Your quotation has been received and is being processed.
                            </p>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Submit Your Bid</DialogTitle>
                                <DialogDescription>
                                    Upload your quotation document for {rfq.title}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quotation">Quotation Document *</Label>
                                    {!quotationFile ? (
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                                            <input
                                                id="quotation"
                                                type="file"
                                                accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="quotation" className="cursor-pointer">
                                                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm font-medium">Click to upload quotation</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PDF, Excel, CSV or Word (max 10MB)
                                                </p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{quotationFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(quotationFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRemoveFile}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional information or terms..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> Your quotation will be parsed automatically.
                                        Ensure it includes item names, quantities, and unit prices for accurate processing.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setBidDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitBid}
                                    disabled={!quotationFile || isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
