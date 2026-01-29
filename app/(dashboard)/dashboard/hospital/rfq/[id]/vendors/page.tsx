'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search,
    ArrowRight,
    Package,
    Users,
    CheckCircle2,
} from 'lucide-react'

interface Requirement {
    line_item_id: number
    inn_name: string
    brand_name: string
    dosage: string
    form: string
    quantity: number
    unit_of_issue: string
    matchedVendorsCount: number
    selectedVendorsCount: number
    category: string
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export default function RequirementsListPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')

    const [rfqInfo] = useState({
        id: resolvedParams.id,
        title: 'Medical Supplies Q1 2026',
        totalRequirements: 15,
        deadline: '2026-02-15T23:59:00',
    })

    const [requirements] = useState<Requirement[]>([
        {
            line_item_id: 1,
            inn_name: 'Acetylsalicylic acid',
            brand_name: 'Aspirin',
            dosage: '81 mg',
            form: 'Tablet',
            quantity: 1000,
            unit_of_issue: 'Tablet',
            matchedVendorsCount: 8,
            selectedVendorsCount: 0,
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
            matchedVendorsCount: 6,
            selectedVendorsCount: 0,
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
            matchedVendorsCount: 5,
            selectedVendorsCount: 0,
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
            matchedVendorsCount: 10,
            selectedVendorsCount: 0,
            category: 'Antibiotics',
        },
        {
            line_item_id: 5,
            inn_name: 'Metformin',
            brand_name: 'Glucophage',
            dosage: '850 mg',
            form: 'Tablet',
            quantity: 1500,
            unit_of_issue: 'Tablet',
            matchedVendorsCount: 7,
            selectedVendorsCount: 0,
            category: 'Diabetes Management',
        },
    ])

    const filteredRequirements = requirements.filter(req =>
        req.inn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectRequirement = (lineItemId: number) => {
        router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${lineItemId}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Select Vendors by Requirement</h1>
                <p className="text-muted-foreground">
                    Choose vendors for each requirement individually
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{rfqInfo.title}</CardTitle>
                            <CardDescription>
                                RFQ #{rfqInfo.id} • {rfqInfo.totalRequirements} requirements
                            </CardDescription>
                        </div>
                        <Badge variant="outline">
                            Deadline: {formatDate(rfqInfo.deadline)}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search requirements by name, brand, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="space-y-3">
                {filteredRequirements.map((requirement) => (
                    <Card
                        key={requirement.line_item_id}
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleSelectRequirement(requirement.line_item_id)}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{requirement.inn_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {requirement.brand_name}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{requirement.category}</Badge>
                                        </div>
                                        <div className="flex items-center gap-6 mt-3">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Dosage:</span>{' '}
                                                <span className="font-medium">{requirement.dosage}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Form:</span>{' '}
                                                <span className="font-medium">{requirement.form}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Quantity:</span>{' '}
                                                <span className="font-medium">
                                                    {requirement.quantity} {requirement.unit_of_issue}s
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{requirement.matchedVendorsCount}</span>
                                                <span className="text-muted-foreground">vendors matched</span>
                                            </div>
                                            {requirement.selectedVendorsCount > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="font-medium">{requirement.selectedVendorsCount} selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredRequirements.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No requirements found matching your search.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
