'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useRFQStore } from '@/lib/rfq-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search,
    Star,
    MapPin,
    Package,
    CheckCircle2,
    ArrowLeft,
    Filter,
    Users,
    Send,
    ChevronDown,
    Eye,
    Plus,
} from 'lucide-react'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Vendor {
    id: string
    name: string
    rating: number
    location: string
    certifications: string[]
    pastOrders: number
    responseRate: number
    canFulfillOtherRequirements: {
        line_item_id: number
        inn_name: string
        brand_name: string
        dosage: string
    }[]
    selected: boolean
    includeOtherRequirements: number[]
}

interface Requirement {
    line_item_id: number
    inn_name: string
    brand_name: string
    dosage: string
    form: string
    quantity: number
    unit_of_issue: string
    category: string
}

export default function RequirementVendorSelectionPage({
    params
}: {
    params: Promise<{ id: string; requirementId: string }>
}) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [locationFilter, setLocationFilter] = useState<string>('all_locations')
    const [certificationFilter, setCertificationFilter] = useState<string>('all_certifications')
    const [procurementMode, setProcurementMode] = useState<string>('balanced')
    const [requirementSelectorOpen, setRequirementSelectorOpen] = useState(false)
    const [previewVendorId, setPreviewVendorId] = useState<string | null>(null)
    const [collapsedVendors, setCollapsedVendors] = useState<Set<string>>(new Set())
    const { addRFQ, addVendorsToRFQ, getRFQ } = useRFQStore()

    const [allRequirements] = useState<Requirement[]>([
        {
            line_item_id: 1,
            inn_name: 'Acetylsalicylic acid',
            brand_name: 'Aspirin',
            dosage: '81 mg',
            form: 'Tablet',
            quantity: 1000,
            unit_of_issue: 'Tablet',
            category: 'Analgesics',
        },
        {
            line_item_id: 2,
            inn_name: 'Acetaminophen',
            brand_name: 'Panadol Syrup',
            dosage: '100 ml',
            form: 'Syrup',
            quantity: 500,
            unit_of_issue: 'Bottle',
            category: 'Analgesics',
        },
        {
            line_item_id: 3,
            inn_name: 'Adrenalin',
            brand_name: 'Ampule Adre',
            dosage: '1mg/1ml',
            form: 'Injection',
            quantity: 200,
            unit_of_issue: 'Ampule',
            category: 'Emergency Medicine',
        },
        {
            line_item_id: 4,
            inn_name: 'Amoxicillin + Clavulanate',
            brand_name: 'Augmentin',
            dosage: '1g',
            form: 'Tablet',
            quantity: 800,
            unit_of_issue: 'Tablet',
            category: 'Antibiotics',
        },
    ])

    const currentRequirement = allRequirements.find(
        r => r.line_item_id === parseInt(resolvedParams.requirementId)
    ) || allRequirements[0]

    const [vendors, setVendors] = useState<Vendor[]>([
        {
            id: 'v1',
            name: 'PharmaCorp Ltd',
            rating: 4.8,
            location: 'Mumbai',
            certifications: ['ISO 9001', 'WHO-GMP', 'FDA'],
            pastOrders: 45,
            responseRate: 95,
            canFulfillOtherRequirements: [
                { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', dosage: '100 ml' },
                { line_item_id: 4, inn_name: 'Amoxicillin + Clavulanate', brand_name: 'Augmentin', dosage: '1g' },
            ],
            selected: false,
            includeOtherRequirements: [],
        },
        {
            id: 'v2',
            name: 'MediSupply International',
            rating: 4.5,
            location: 'Delhi',
            certifications: ['ISO 9001', 'FDA'],
            pastOrders: 32,
            responseRate: 88,
            canFulfillOtherRequirements: [
                { line_item_id: 3, inn_name: 'Adrenalin', brand_name: 'Ampule Adre', dosage: '1mg/1ml' },
            ],
            selected: false,
            includeOtherRequirements: [],
        },
        {
            id: 'v3',
            name: 'HealthCare Distributors',
            rating: 4.2,
            location: 'Bangalore',
            certifications: ['WHO-GMP'],
            pastOrders: 18,
            responseRate: 82,
            canFulfillOtherRequirements: [],
            selected: false,
            includeOtherRequirements: [],
        },
        {
            id: 'v4',
            name: 'Global Pharma Solutions',
            rating: 4.7,
            location: 'Mumbai',
            certifications: ['ISO 9001', 'WHO-GMP', 'EMA'],
            pastOrders: 38,
            responseRate: 91,
            canFulfillOtherRequirements: [
                { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', dosage: '100 ml' },
            ],
            selected: false,
            includeOtherRequirements: [],
        },
        {
            id: 'v5',
            name: 'MedLife Supplies',
            rating: 4.3,
            location: 'Chennai',
            certifications: ['ISO 9001'],
            pastOrders: 22,
            responseRate: 85,
            canFulfillOtherRequirements: [
                { line_item_id: 3, inn_name: 'Adrenalin', brand_name: 'Ampule Adre', dosage: '1mg/1ml' },
            ],
            selected: false,
            includeOtherRequirements: [],
        },
    ])

    const toggleVendor = (vendorId: string) => {
        setVendors(vendors.map(v =>
            v.id === vendorId ? { ...v, selected: !v.selected } : v
        ))
    }

    const toggleOtherRequirement = (vendorId: string, requirementId: number) => {
        setVendors(vendors.map(v => {
            if (v.id === vendorId) {
                const isIncluded = v.includeOtherRequirements.includes(requirementId)
                return {
                    ...v,
                    includeOtherRequirements: isIncluded
                        ? v.includeOtherRequirements.filter(id => id !== requirementId)
                        : [...v.includeOtherRequirements, requirementId]
                }
            }
            return v
        }))
    }

    const toggleAllOtherRequirements = (vendorId: string) => {
        setVendors(vendors.map(v => {
            if (v.id === vendorId) {
                const otherReqIds = v.canFulfillOtherRequirements
                    .filter(req => req.line_item_id !== currentRequirement.line_item_id)
                    .map(req => req.line_item_id)
                const allSelected = otherReqIds.every(id => v.includeOtherRequirements.includes(id))
                return {
                    ...v,
                    includeOtherRequirements: allSelected ? [] : otherReqIds
                }
            }
            return v
        }))
    }

    const toggleCollapsed = (vendorId: string) => {
        setCollapsedVendors(prev => {
            const newSet = new Set(prev)
            if (newSet.has(vendorId)) {
                newSet.delete(vendorId)
            } else {
                newSet.add(vendorId)
            }
            return newSet
        })
    }

    const selectAllVendors = () => {
        const allSelected = vendors.every(v => v.selected)
        setVendors(vendors.map(v => ({ ...v, selected: !allSelected })))
    }

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLocation = locationFilter === 'all_locations' || vendor.location.toLowerCase() === locationFilter
        const matchesCertification = certificationFilter === 'all_certifications' ||
            vendor.certifications.some(cert => cert.toLowerCase().replace(/[\s-]/g, '_') === certificationFilter)
        return matchesSearch && matchesLocation && matchesCertification
    })

    const selectedVendorsCount = vendors.filter(v => v.selected).length

    const handleChangeRequirement = (lineItemId: number) => {
        router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${lineItemId}`)
        setRequirementSelectorOpen(false)
    }

    const handleSendRFQ = () => {
        const selectedVendors = vendors.filter(v => v.selected)

        const vendorRFQs = selectedVendors.map(vendor => ({
            vendorId: vendor.id,
            vendorName: vendor.name,
            requirements: getVendorRFQRequirements(vendor.id),
            procurementMode: procurementMode,
            sentAt: new Date().toISOString(),
            status: 'sent' as const
        }))

        const existingRFQ = getRFQ(resolvedParams.id)

        if (!existingRFQ) {
            addRFQ(resolvedParams.id, {
                rfqTitle: 'Medical Supplies Q1 2026',
                deadline: '2026-02-15T23:59:00',
                vendors: vendorRFQs,
                createdAt: new Date().toISOString()
            })
        } else {
            addVendorsToRFQ(resolvedParams.id, vendorRFQs)
        }

        const currentIndex = allRequirements.findIndex(
            r => r.line_item_id === currentRequirement.line_item_id
        )
        if (currentIndex < allRequirements.length - 1) {
            const nextRequirement = allRequirements[currentIndex + 1]
            router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${nextRequirement.line_item_id}`)
        } else {
            router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/awaiting`)
        }
    }


    const getVendorRFQRequirements = (vendorId: string) => {
        const vendor = vendors.find(v => v.id === vendorId)
        if (!vendor) return []

        const requirements = [currentRequirement]
        vendor.includeOtherRequirements.forEach(reqId => {
            const req = allRequirements.find(r => r.line_item_id === reqId)
            if (req) requirements.push(req)
        })

        return requirements
    }

    const getFilteredOtherRequirements = (vendor: Vendor) => {
        return vendor.canFulfillOtherRequirements.filter(
            req => req.line_item_id !== currentRequirement.line_item_id
        )
    }

    const previewVendor = vendors.find(v => v.id === previewVendorId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Select Vendors</h1>
                    <p className="text-muted-foreground">
                        Choose vendors for this specific requirement
                    </p>
                </div>
            </div>

            <div className="flex gap-6">
                <div className="flex-1 space-y-6">
                    <Card>
                        <CardContent className="p-4">
                            <Label className="text-sm text-muted-foreground mb-2 block">
                                Current Requirement
                            </Label>
                            <Popover open={requirementSelectorOpen} onOpenChange={setRequirementSelectorOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={requirementSelectorOpen}
                                        className="w-full justify-between h-auto py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-primary" />
                                            <div className="text-left">
                                                <p className="font-semibold">{currentRequirement.inn_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {currentRequirement.brand_name} • {currentRequirement.dosage}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-150 p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search requirements..." />
                                        <CommandList>
                                            <CommandEmpty>No requirement found.</CommandEmpty>
                                            <CommandGroup>
                                                {allRequirements.map((req) => (
                                                    <CommandItem
                                                        key={req.line_item_id}
                                                        value={req.inn_name}
                                                        onSelect={() => handleChangeRequirement(req.line_item_id)}
                                                        className="py-3"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{req.inn_name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {req.brand_name} • {req.dosage} • {req.quantity} {req.unit_of_issue}s
                                                                </p>
                                                            </div>
                                                            <Badge variant="secondary">{req.category}</Badge>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>

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
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-48">
                                <MapPin className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_locations">All Locations</SelectItem>
                                <SelectItem value="mumbai">Mumbai</SelectItem>
                                <SelectItem value="delhi">Delhi</SelectItem>
                                <SelectItem value="bangalore">Bangalore</SelectItem>
                                <SelectItem value="chennai">Chennai</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={certificationFilter} onValueChange={setCertificationFilter}>
                            <SelectTrigger className="w-52">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_certifications">All Certifications</SelectItem>
                                <SelectItem value="iso_9001">ISO 9001</SelectItem>
                                <SelectItem value="who_gmp">WHO-GMP</SelectItem>
                                <SelectItem value="fda">FDA</SelectItem>
                                <SelectItem value="ema">EMA</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={selectAllVendors}
                            className="gap-2"
                        >
                            <Users className="h-4 w-4" />
                            {vendors.every(v => v.selected) ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {filteredVendors.map((vendor) => {
                            const filteredOtherReqs = getFilteredOtherRequirements(vendor)
                            const isCollapsed = collapsedVendors.has(vendor.id)
                            const allOtherReqsSelected = filteredOtherReqs.length > 0 &&
                                filteredOtherReqs.every(req => vendor.includeOtherRequirements.includes(req.line_item_id))

                            return (
                                <Card
                                    key={vendor.id}
                                    className={`transition-all ${vendor.selected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={vendor.selected}
                                                onCheckedChange={() => toggleVendor(vendor.id)}
                                                className="mt-1 h-5 w-5"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{vendor.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-medium">{vendor.rating}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <MapPin className="h-3 w-3" />
                                                                <span className="text-sm">{vendor.location}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Package className="h-3 w-3" />
                                                                <span className="text-sm">{vendor.pastOrders} orders</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={vendor.responseRate >= 90 ? 'default' : 'secondary'}
                                                    >
                                                        {vendor.responseRate}% response
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {vendor.certifications.map((cert) => (
                                                        <Badge key={cert} variant="outline" className="text-xs">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {filteredOtherReqs.length > 0 && (
                                                    <Collapsible
                                                        open={!isCollapsed}
                                                        onOpenChange={() => toggleCollapsed(vendor.id)}
                                                        className="mt-3"
                                                    >
                                                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
                                                            <CollapsibleTrigger asChild>
                                                                <button
                                                                    className="w-full p-3 flex items-center justify-between text-left hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors rounded-t-md"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                                                            Can also fulfill: {filteredOtherReqs.length} requirement(s)
                                                                        </p>
                                                                        {vendor.includeOtherRequirements.length > 0 && (
                                                                            <Badge variant="default" className="text-xs">
                                                                                {vendor.includeOtherRequirements.length} selected
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <ChevronDown className={`h-4 w-4 text-blue-700 dark:text-blue-300 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <div className="p-3 pt-0 space-y-3">
                                                                    <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-900">
                                                                        <Checkbox
                                                                            id={`vendor-${vendor.id}-select-all`}
                                                                            checked={allOtherReqsSelected}
                                                                            onCheckedChange={() => toggleAllOtherRequirements(vendor.id)}
                                                                            className="h-4 w-4"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <label
                                                                            htmlFor={`vendor-${vendor.id}-select-all`}
                                                                            className="text-xs font-medium text-blue-900 dark:text-blue-100 cursor-pointer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            Select All
                                                                        </label>
                                                                    </div>
                                                                    {filteredOtherReqs.map((req) => (
                                                                        <div key={req.line_item_id} className="flex items-center gap-2">
                                                                            <Checkbox
                                                                                id={`vendor-${vendor.id}-req-${req.line_item_id}`}
                                                                                checked={vendor.includeOtherRequirements.includes(req.line_item_id)}
                                                                                onCheckedChange={() => toggleOtherRequirement(vendor.id, req.line_item_id)}
                                                                                className="h-4 w-4"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <label
                                                                                htmlFor={`vendor-${vendor.id}-req-${req.line_item_id}`}
                                                                                className="text-xs cursor-pointer flex-1"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <span className="font-medium">{req.inn_name}</span>
                                                                                <span className="text-muted-foreground"> • {req.brand_name} • {req.dosage}</span>
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </CollapsibleContent>
                                                        </div>
                                                    </Collapsible>
                                                )}

                                                <div className="flex items-center gap-2 mt-3">
                                                    <Dialog open={previewVendorId === vendor.id} onOpenChange={(open) => setPreviewVendorId(open ? vendor.id : null)}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                Preview RFQ
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-6xl min-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>RFQ Preview - {vendor.name}</DialogTitle>
                                                                <DialogDescription>
                                                                    Review what this vendor will receive
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-6 mt-4">
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
                                                                                {getVendorRFQRequirements(vendor.id).map((req) => (
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

                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Delivery Requirements</h4>
                                                                    <div className="bg-secondary/50 p-4 rounded-lg space-y-2 text-sm">
                                                                        <p><span className="font-medium">Minimum Expiry:</span> 12 months</p>
                                                                        <p><span className="font-medium">Packaging:</span> Standard</p>
                                                                        <p><span className="font-medium">Transport Mode:</span> Land</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                                        Additional Note
                                                                    </p>
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        If you can supply items from other categories (Antibiotics, Cardiovascular, Diabetes Management),
                                                                        please mention them in your response.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {filteredVendors.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">
                                    No vendors found matching your filters.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="w-80 shrink-0">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>RFQ Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-sm text-muted-foreground">Selected Items</Label>
                                <p className="text-4xl font-bold text-primary mt-1">1</p>
                            </div>

                            <div>
                                <Label className="text-sm text-muted-foreground">Eligible Vendors</Label>
                                <p className="text-4xl font-bold mt-1">{selectedVendorsCount}</p>
                            </div>

                            <div className="border-t pt-6">
                                <Label className="text-sm font-medium mb-3 block">Procurement Mode</Label>
                                <Select value={procurementMode} onValueChange={setProcurementMode}>
                                    <SelectTrigger className="w-full h-auto py-6">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="balanced">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Balanced</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Equal weight to cost, time & quality
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="emergency">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Emergency (Speed Priority)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Fastest delivery preferred
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="cost">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Cost Optimization</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Lowest price preferred
                                                </p>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="quality">
                                            <div className="text-left py-1">
                                                <p className="font-medium">Quality Focus</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Best certifications & ratings
                                                </p>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-3">
                                    This affects how vendor bids will be scored
                                </p>
                            </div>

                            <Button
                                onClick={handleSendRFQ}
                                disabled={selectedVendorsCount === 0}
                                className="w-full gap-2"
                                size="lg"
                            >
                                <Send className="h-4 w-4" />
                                Send to {selectedVendorsCount} Vendor{selectedVendorsCount !== 1 ? 's' : ''}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Selected vendors will receive this RFQ via email
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
