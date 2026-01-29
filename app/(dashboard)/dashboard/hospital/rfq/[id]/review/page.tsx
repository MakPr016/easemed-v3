'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle2,
    XCircle,
    Edit2,
    Save,
    Trash2,
    Plus,
    ArrowRight,
    AlertCircle
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface LineItem {
    line_item_id: number
    inn_name: string
    brand_name: string
    dosage: string
    form: string
    unit_of_issue: string
    quantity?: number
    generic_allowed: boolean
    brand_allowed: boolean
}

export default function RFQReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    // Mock parsed data - in real app, fetch based on resolvedParams.id
    const [rfqInfo] = useState({
        id: resolvedParams.id,
        title: 'Medical Supplies Q1 2026',
        description: 'Quarterly medical supplies procurement',
        deadline: '2026-02-15T23:59',
        status: 'draft',
        uploaded_at: new Date().toISOString(),
    })

    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            line_item_id: 1,
            inn_name: 'Acetylsalicylic acid',
            brand_name: 'Aspirin',
            dosage: '81 mg',
            form: 'Tablet',
            unit_of_issue: 'Tablet',
            quantity: 1000,
            generic_allowed: true,
            brand_allowed: true,
        },
        {
            line_item_id: 2,
            inn_name: 'Acetaminophen',
            brand_name: 'Panadol Syrup',
            dosage: '100 ml',
            form: 'Syrup',
            unit_of_issue: 'Bottle',
            quantity: 500,
            generic_allowed: true,
            brand_allowed: true,
        },
        {
            line_item_id: 3,
            inn_name: 'Adrenalin inj',
            brand_name: 'Ampule Adre',
            dosage: '1mg/ 1ml',
            form: 'Injection',
            unit_of_issue: 'Injection',
            quantity: 200,
            generic_allowed: true,
            brand_allowed: true,
        },
    ])

    const [deliveryRequirements] = useState({
        min_expiry_months: 12,
        packaging: 'standard',
        transport_mode: 'land',
    })

    const handleEdit = (id: number) => {
        setEditingId(id)
    }

    const handleSave = (id: number) => {
        setEditingId(null)
        // TODO: Save changes
    }

    const handleDelete = (id: number) => {
        setLineItems(lineItems.filter(item => item.line_item_id !== id))
    }

    const handleChange = (id: number, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item =>
            item.line_item_id === id ? { ...item, [field]: value } : item
        ))
    }

    const handleAddItem = () => {
        const newId = Math.max(...lineItems.map(i => i.line_item_id), 0) + 1
        setLineItems([...lineItems, {
            line_item_id: newId,
            inn_name: '',
            brand_name: '',
            dosage: '',
            form: '',
            unit_of_issue: '',
            quantity: 0,
            generic_allowed: true,
            brand_allowed: true,
        }])
        setEditingId(newId)
    }

    const handleProceed = async () => {
        setLoading(true)
        try {
            // TODO: Save confirmed data and proceed to vendor matching
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors`)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review RFQ</h1>
                <p className="text-muted-foreground">
                    Review and edit the extracted requirements before sending to vendors
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>RFQ Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Title</p>
                            <p className="font-medium">{rfqInfo.title}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">RFQ ID</p>
                            <p className="font-medium">#{rfqInfo.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Deadline</p>
                            <p className="font-medium">
                                {new Date(rfqInfo.deadline).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="secondary">{rfqInfo.status}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Line Items ({lineItems.length})</CardTitle>
                            <CardDescription>
                                Review each item and make corrections if needed
                            </CardDescription>
                        </div>
                        <Button onClick={handleAddItem} variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Generic Name</TableHead>
                                    <TableHead>Brand Name</TableHead>
                                    <TableHead>Dosage</TableHead>
                                    <TableHead>Form</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Options</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lineItems.map((item) => (
                                    <TableRow key={item.line_item_id}>
                                        <TableCell className="font-medium">
                                            {item.line_item_id}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    value={item.inn_name}
                                                    onChange={(e) => handleChange(item.line_item_id, 'inn_name', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.inn_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    value={item.brand_name}
                                                    onChange={(e) => handleChange(item.line_item_id, 'brand_name', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.brand_name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    value={item.dosage}
                                                    onChange={(e) => handleChange(item.line_item_id, 'dosage', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.dosage
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    value={item.form}
                                                    onChange={(e) => handleChange(item.line_item_id, 'form', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.form
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    value={item.unit_of_issue}
                                                    onChange={(e) => handleChange(item.line_item_id, 'unit_of_issue', e.target.value)}
                                                    className="h-8"
                                                />
                                            ) : (
                                                item.unit_of_issue
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === item.line_item_id ? (
                                                <Input
                                                    type="number"
                                                    value={item.quantity || ''}
                                                    onChange={(e) => handleChange(item.line_item_id, 'quantity', parseInt(e.target.value))}
                                                    className="h-8 w-24"
                                                />
                                            ) : (
                                                item.quantity
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {item.generic_allowed && (
                                                    <Badge variant="secondary" className="text-xs">Generic</Badge>
                                                )}
                                                {item.brand_allowed && (
                                                    <Badge variant="secondary" className="text-xs">Brand</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {editingId === item.line_item_id ? (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => handleSave(item.line_item_id)}
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(item.line_item_id)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDelete(item.line_item_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Minimum Expiry</p>
                            <p className="font-medium">{deliveryRequirements.min_expiry_months} months</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Packaging</p>
                            <p className="font-medium capitalize">{deliveryRequirements.packaging}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Transport Mode</p>
                            <p className="font-medium capitalize">{deliveryRequirements.transport_mode}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                            Ready to proceed?
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Once you proceed, we'll match suitable vendors for each requirement and send them the RFQ.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Back to Upload
                </Button>
                <Button
                    onClick={handleProceed}
                    disabled={loading || lineItems.length === 0}
                    className="gap-2"
                >
                    {loading ? 'Processing...' : 'Find Vendors'}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
