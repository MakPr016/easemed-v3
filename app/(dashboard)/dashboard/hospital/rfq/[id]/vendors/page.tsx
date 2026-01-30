'use client'

import { useState, use, useEffect } from 'react'
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
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Requirement {
    id: string
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

interface RFQInfo {
    id: string
    title: string
    deadline: string
    status: string
    totalRequirements: number
}

const ITEMS_PER_PAGE = 10

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const getCategoryFromForm = (form: string): string => {
    const formLower = form.toLowerCase()
    if (formLower.includes('tablet') || formLower.includes('capsule')) return 'Oral Medications'
    if (formLower.includes('injection') || formLower.includes('ampule') || formLower.includes('vial')) return 'Injectable'
    if (formLower.includes('syrup') || formLower.includes('suspension')) return 'Liquid Medications'
    if (formLower.includes('cream') || formLower.includes('gel') || formLower.includes('ointment')) return 'Topical'
    if (formLower.includes('inhaler') || formLower.includes('spray')) return 'Respiratory'
    return 'Other'
}

export default function RequirementsListPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const supabase = createClient()
    
    const [searchTerm, setSearchTerm] = useState('')
    const [rfqInfo, setRfqInfo] = useState<RFQInfo | null>(null)
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchRFQData()
    }, [resolvedParams.id])

    const fetchRFQData = async () => {
        try {
            const { data: rfqData, error: rfqError } = await supabase
                .from('rfqs')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (rfqError) throw rfqError

            const { data: itemsData, error: itemsError } = await supabase
                .from('rfq_line_items')
                .select('*')
                .eq('rfq_id', resolvedParams.id)
                .order('line_item_id')

            if (itemsError) throw itemsError

            setRfqInfo({
                id: rfqData.id,
                title: rfqData.title,
                deadline: rfqData.deadline,
                status: rfqData.status,
                totalRequirements: itemsData?.length || 0,
            })

            const transformedRequirements: Requirement[] = itemsData.map((item) => ({
                id: item.id,
                line_item_id: item.line_item_id,
                inn_name: item.inn_name || 'N/A',
                brand_name: item.brand_name || 'Generic',
                dosage: item.dosage || 'N/A',
                form: item.form || 'N/A',
                quantity: item.quantity || 0,
                unit_of_issue: item.unit_of_issue || 'Unit',
                matchedVendorsCount: 0,
                selectedVendorsCount: 0,
                category: getCategoryFromForm(item.form || ''),
            }))

            setRequirements(transformedRequirements)

        } catch (err: any) {
            console.error('Error fetching RFQ:', err)
            setError(err.message || 'Failed to load RFQ')
        } finally {
            setLoading(false)
        }
    }

    const filteredRequirements = requirements.filter(req =>
        req.inn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filteredRequirements.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentItems = filteredRequirements.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handleSelectRequirement = (lineItemId: number) => {
        router.push(`/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${lineItemId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error || !rfqInfo) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading RFQ</h3>
                        <p className="text-muted-foreground mb-4">{error || 'RFQ not found'}</p>
                        <Link href="/dashboard/hospital/rfq/upload">
                            <Button>Back to Upload</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
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
                                RFQ #{rfqInfo.id.slice(0, 8)} • {rfqInfo.totalRequirements} requirements
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline">
                                Deadline: {formatDate(rfqInfo.deadline)}
                            </Badge>
                            <Badge 
                                variant={rfqInfo.status === 'published' ? 'default' : 'secondary'}
                            >
                                {rfqInfo.status}
                            </Badge>
                        </div>
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

            {requirements.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Requirements Found</h3>
                        <p className="text-muted-foreground mb-4">
                            This RFQ doesn't have any line items yet.
                        </p>
                        <Link href={`/dashboard/hospital/rfq/${resolvedParams.id}/review`}>
                            <Button>Go to Review Page</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="space-y-3">
                        {currentItems.map((requirement) => (
                            <Card
                                key={requirement.id}
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
                                                            {requirement.quantity} {requirement.unit_of_issue}
                                                            {requirement.quantity > 1 ? 's' : ''}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredRequirements.length)} of {filteredRequirements.length} requirements
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum: number
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = currentPage - 2 + i
                                        }
                                        
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="w-8 h-8"
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {filteredRequirements.length === 0 && requirements.length > 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No requirements found matching your search.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
