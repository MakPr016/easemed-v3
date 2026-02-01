'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Edit2,
  Save,
  Trash2,
  Plus,
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LineItem {
  id: string
  line_item_id: number
  inn_name: string
  brand_name: string
  dosage: string
  form: string
  unit_of_issue: string
  quantity: number
}

const ITEMS_PER_PAGE = 10

export default function RFQReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const rfqId = resolvedParams.id
  const router = useRouter()
  const supabase = createClient()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rfqInfo, setRfqInfo] = useState<any>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchRFQData()
  }, [rfqId])

  const fetchRFQData = async () => {
    try {
      setLoading(true)

      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .select('*')
        .eq('id', rfqId)
        .single()

      if (rfqError) throw rfqError

      const { data: itemsData, error: itemsError } = await supabase
        .from('rfq_line_items')
        .select('*')
        .eq('rfq_id', rfqId)
        .order('line_item_id')

      if (itemsError) throw itemsError

      setRfqInfo(rfqData)
      setLineItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching RFQ:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = async (id: string) => {
    const item = lineItems.find(i => i.id === id)
    if (!item) return

    // Add logging here ⬇️
    console.log('=== SAVE DEBUG ===')
    console.log('Updating item with ID:', id)
    console.log('Item data:', item)
    console.log('Payload:', {
      inn_name: item.inn_name,
      brand_name: item.brand_name,
      dosage: item.dosage,
      form: item.form,
      unit_of_issue: item.unit_of_issue,
      quantity: item.quantity,
    })

    try {
      setSaving(true)

      const response = await fetch(`/api/rfq/line-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inn_name: item.inn_name,
          brand_name: item.brand_name,
          dosage: item.dosage,
          form: item.form,
          unit_of_issue: item.unit_of_issue,
          quantity: item.quantity,
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('Response error:', error)
        throw new Error(error.error || 'Failed to save')
      }

      const result = await response.json()
      console.log('Success response:', result)

      setEditingId(null)
    } catch (error: any) {
      console.error('Error saving item:', error)
      alert(error.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setSaving(true)

      const response = await fetch(`/api/rfq/line-items/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      const updatedItems = lineItems.filter(item => item.id !== id)
      setLineItems(updatedItems)

      const newTotalPages = Math.ceil(updatedItems.length / ITEMS_PER_PAGE)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error: any) {
      console.error('Error deleting item:', error)
      alert(error.message || 'Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = async () => {
    const newLineItemId = Math.max(...lineItems.map(i => i.line_item_id), 0) + 1

    try {
      setSaving(true)

      const response = await fetch('/api/rfq/line-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfq_id: rfqId,
          line_item_id: newLineItemId,
          inn_name: '',
          brand_name: '',
          dosage: '',
          form: '',
          unit_of_issue: '',
          quantity: 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add item')
      }

      const { data } = await response.json()

      setLineItems([...lineItems, data])
      setEditingId(data.id)

      const totalPages = Math.ceil((lineItems.length + 1) / ITEMS_PER_PAGE)
      setCurrentPage(totalPages)
    } catch (error: any) {
      console.error('Error adding item:', error)
      alert(error.message || 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const handleProceed = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('rfqs')
        .update({ status: 'published' })
        .eq('id', rfqId)

      if (error) throw error

      router.push(`/dashboard/hospital/rfq/${rfqId}/vendors`)
    } catch (error) {
      console.error('Error publishing RFQ:', error)
      alert('Failed to publish RFQ')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(lineItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = lineItems.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!rfqInfo) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
            <Link href="/dashboard/hospital/rfq/upload">
              <Button>Back to Upload</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const parsingStats = rfqInfo.metadata?.parsing_stats

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hospital/rfq/upload">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review RFQ</h1>
          <p className="text-muted-foreground">
            Review and edit the extracted requirements before sending to vendors
          </p>
        </div>
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
              <p className="font-medium">{rfqInfo.metadata?.rfq_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-medium">
                {rfqInfo.deadline ? new Date(rfqInfo.deadline).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">{rfqInfo.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {parsingStats && (
        <Card className="bg-linear-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Parsing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Extracted</p>
                <p className="text-3xl font-bold text-blue-600">{parsingStats.total || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valid Items</p>
                <p className="text-3xl font-bold text-green-600">
                  {parsingStats.valid || lineItems.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Filtered Out</p>
                <p className="text-3xl font-bold text-orange-600">
                  {parsingStats.rejected || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items ({lineItems.length})</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-{Math.min(endIndex, lineItems.length)} of {lineItems.length} items
              </CardDescription>
            </div>
            <Button
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead className="min-w-50">Generic Name</TableHead>
                  <TableHead className="min-w-30">Brand Name</TableHead>
                  <TableHead className="min-w-25">Dosage</TableHead>
                  <TableHead className="min-w-25">Form</TableHead>
                  <TableHead className="min-w-25">Unit</TableHead>
                  <TableHead className="min-w-25">Quantity</TableHead>
                  <TableHead className="w-32 sticky right-0 bg-background">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No line items found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.line_item_id}</TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            value={item.inn_name}
                            onChange={e => handleChange(item.id, 'inn_name', e.target.value)}
                            className="h-8 min-w-45"
                          />
                        ) : (
                          <div className="max-w-50 truncate" title={item.inn_name}>
                            {item.inn_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            value={item.brand_name}
                            onChange={e => handleChange(item.id, 'brand_name', e.target.value)}
                            className="h-8 min-w-32.5"
                          />
                        ) : (
                          <div className="max-w-37.5 truncate" title={item.brand_name}>
                            {item.brand_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            value={item.dosage}
                            onChange={e => handleChange(item.id, 'dosage', e.target.value)}
                            className="h-8 min-w-25"
                          />
                        ) : (
                          item.dosage
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            value={item.form}
                            onChange={e => handleChange(item.id, 'form', e.target.value)}
                            className="h-8 min-w-20"
                          />
                        ) : (
                          item.form
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            value={item.unit_of_issue}
                            onChange={e =>
                              handleChange(item.id, 'unit_of_issue', e.target.value)
                            }
                            className="h-8 min-w-20"
                          />
                        ) : (
                          item.unit_of_issue
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={item.quantity || 0}
                            onChange={e =>
                              handleChange(
                                item.id,
                                'quantity',
                                Number.isNaN(parseInt(e.target.value))
                                  ? 0
                                  : parseInt(e.target.value)
                              )
                            }
                            className="h-8 w-20"
                          />
                        ) : (
                          item.quantity || 0
                        )}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-background">
                        <div className="flex items-center gap-1">
                          {editingId === item.id ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleSave(item.id)}
                              disabled={saving}
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item.id)}
                              disabled={saving}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                ))}
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
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/dashboard/hospital/rfq/upload">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleProceed}
          className="gap-2"
          disabled={saving || lineItems.length === 0}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              Proceed to Select Vendors
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
