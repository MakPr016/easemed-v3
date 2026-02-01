'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit2,
  Save,
  Trash2,
  Plus,
  ArrowRight,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileCheck,
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
  item_type: string
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
  const [savingDraft, setSavingDraft] = useState(false)
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
          item_type: item.item_type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

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
          item_type: 'Medical Supplies',
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

  const handleSaveAsDraft = async () => {
    setSavingDraft(true)
    try {
      const { error } = await supabase
        .from('rfqs')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', rfqId)

      if (error) throw error

      router.push('/dashboard/hospital/rfq')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save as draft')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleProceed = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('rfqs')
        .update({
          status: 'published',
          updated_at: new Date().toISOString()
        })
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Pharmaceuticals': return 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
      case 'Medical Equipment': return 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
      case 'Medical Supplies': return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
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
              <p className="font-mono font-medium">{rfqId}</p>
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
                  <TableHead className="w-[180px]">Type</TableHead>
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
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No line items found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.line_item_id}</TableCell>
                      <TableCell>
                        {editingId === item.id ? (
                          <Select
                            value={item.item_type}
                            onValueChange={(val) => handleChange(item.id, 'item_type', val)}
                          >
                            <SelectTrigger className="h-8 w-[170px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pharmaceuticals">Pharmaceuticals</SelectItem>
                              <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                              <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={getTypeColor(item.item_type)}>
                            {item.item_type || 'Medical Supplies'}
                          </Badge>
                        )}
                      </TableCell>
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
                            onChange={e => handleChange(item.id, 'unit_of_issue', e.target.value)}
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
                            onChange={e => handleChange(item.id, 'quantity', Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
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

      <div className="flex justify-between gap-3">
        <Link href="/dashboard/hospital/rfq/upload">
          <Button variant="outline">Cancel</Button>
        </Link>
        <div className="flex gap-3">
          <Button
            onClick={handleSaveAsDraft}
            variant="outline"
            className="gap-2"
            disabled={savingDraft || saving || lineItems.length === 0}
          >
            {savingDraft ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Draft...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" />
                Save as Draft
              </>
            )}
          </Button>
          <Button
            onClick={handleProceed}
            className="gap-2"
            disabled={saving || savingDraft || lineItems.length === 0}
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
    </div>
  )
}