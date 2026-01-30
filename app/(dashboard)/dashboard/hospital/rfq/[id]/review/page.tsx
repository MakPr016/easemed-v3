// 'use client'

// import { useState, useEffect, use } from 'react'
// import { useRouter } from 'next/navigation'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import {
//   Edit2,
//   Save,
//   Trash2,
//   Plus,
//   ArrowRight,
//   Loader2,
//   ArrowLeft,
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { createClient } from '@/lib/supabase/client'
// import Link from 'next/link'

// interface LineItem {
//   id: string
//   line_item_id: number
//   inn_name: string
//   brand_name: string
//   dosage: string
//   form: string
//   unit_of_issue: string
//   quantity: number
// }

// const ITEMS_PER_PAGE = 10

// export default function RFQReviewPage({ params }: { params: Promise<{ id: string }> }) {
//   const resolvedParams = use(params)
//   const rfqId = resolvedParams.id
//   const router = useRouter()
//   const supabase = createClient()

//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [rfqInfo, setRfqInfo] = useState<any>(null)
//   const [lineItems, setLineItems] = useState<LineItem[]>([])
//   const [currentPage, setCurrentPage] = useState(1)

//   useEffect(() => {
//     fetchRFQData()
//   }, [rfqId])

//   const fetchRFQData = async () => {
//     try {
//       setLoading(true)

//       const { data: rfqData, error: rfqError } = await supabase
//         .from('rfqs')
//         .select('*')
//         .eq('id', rfqId)
//         .single()

//       if (rfqError) throw rfqError

//       const { data: itemsData, error: itemsError } = await supabase
//         .from('rfq_line_items')
//         .select('*')
//         .eq('rfq_id', rfqId)
//         .order('line_item_id')

//       if (itemsError) throw itemsError

//       setRfqInfo(rfqData)
//       setLineItems(itemsData || [])
//     } catch (error) {
//       console.error('Error fetching RFQ:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEdit = (id: string) => {
//     setEditingId(id)
//   }

//   const handleSave = async (id: string) => {
//     const item = lineItems.find(i => i.id === id)
//     if (!item) return

//     try {
//       setSaving(true)

//       const response = await fetch(`/api/rfq/line-items/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           inn_name: item.inn_name,
//           brand_name: item.brand_name,
//           dosage: item.dosage,
//           form: item.form,
//           unit_of_issue: item.unit_of_issue,
//           quantity: item.quantity,
//         }),
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.error || 'Failed to save')
//       }

//       setEditingId(null)
//     } catch (error: any) {
//       console.error('Error saving item:', error)
//       alert(error.message || 'Failed to save changes')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this item?')) return

//     try {
//       setSaving(true)

//       const response = await fetch(`/api/rfq/line-items/${id}`, {
//         method: 'DELETE',
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.error || 'Failed to delete')
//       }

//       const updatedItems = lineItems.filter(item => item.id !== id)
//       setLineItems(updatedItems)

//       const newTotalPages = Math.ceil(updatedItems.length / ITEMS_PER_PAGE)
//       if (currentPage > newTotalPages && newTotalPages > 0) {
//         setCurrentPage(newTotalPages)
//       }
//     } catch (error: any) {
//       console.error('Error deleting item:', error)
//       alert(error.message || 'Failed to delete item')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleChange = (id: string, field: keyof LineItem, value: any) => {
//     setLineItems(lineItems.map(item => (item.id === id ? { ...item, [field]: value } : item)))
//   }

//   const handleAddItem = async () => {
//     const newLineItemId = Math.max(...lineItems.map(i => i.line_item_id), 0) + 1

//     try {
//       setSaving(true)

//       const response = await fetch('/api/rfq/line-items', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           rfq_id: rfqId,
//           line_item_id: newLineItemId,
//           inn_name: '',
//           brand_name: '',
//           dosage: '',
//           form: '',
//           unit_of_issue: '',
//           quantity: 0,
//         }),
//       })

//       if (!response.ok) {
//         const error = await response.json()
//         throw new Error(error.error || 'Failed to add item')
//       }

//       const { data } = await response.json()

//       setLineItems([...lineItems, data])
//       setEditingId(data.id)

//       const totalPages = Math.ceil((lineItems.length + 1) / ITEMS_PER_PAGE)
//       setCurrentPage(totalPages)
//     } catch (error: any) {
//       console.error('Error adding item:', error)
//       alert(error.message || 'Failed to add item')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleProceed = async () => {
//     setSaving(true)
//     try {
//       const { error } = await supabase
//         .from('rfqs')
//         .update({ status: 'published' })
//         .eq('id', rfqId)

//       if (error) throw error

//       router.push(`/dashboard/hospital/rfq/${rfqId}/vendors`)
//     } catch (error) {
//       console.error('Error publishing RFQ:', error)
//       alert('Failed to publish RFQ')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const totalPages = Math.ceil(lineItems.length / ITEMS_PER_PAGE)
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
//   const endIndex = startIndex + ITEMS_PER_PAGE
//   const currentItems = lineItems.slice(startIndex, endIndex)

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

//   if (!rfqInfo) {
//     return (
//       <div className="space-y-6">
//         <Card>
//           <CardContent className="p-12 text-center">
//             <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
//             <Link href="/dashboard/hospital/rfq/upload">
//               <Button>Back to Upload</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const parsingStats = rfqInfo.metadata?.parsing_stats

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Link href="/dashboard/hospital/rfq/upload">
//           <Button variant="ghost" size="icon">
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Review RFQ</h1>
//           <p className="text-muted-foreground">
//             Review and edit the extracted requirements before sending to vendors
//           </p>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>RFQ Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm text-muted-foreground">Title</p>
//               <p className="font-medium">{rfqInfo.title}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">RFQ ID</p>
//               <p className="font-medium">{rfqInfo.metadata?.rfq_id || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Deadline</p>
//               <p className="font-medium">
//                 {rfqInfo.deadline ? new Date(rfqInfo.deadline).toLocaleString() : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Status</p>
//               <Badge variant="secondary">{rfqInfo.status}</Badge>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {parsingStats && (
//         <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <CheckCircle2 className="h-5 w-5 text-green-600" />
//               Parsing Summary
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-3 gap-4">
//               <div className="text-center">
//                 <p className="text-sm text-muted-foreground mb-1">Total Extracted</p>
//                 <p className="text-3xl font-bold text-blue-600">{parsingStats.total || 0}</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-sm text-muted-foreground mb-1">Valid Items</p>
//                 <p className="text-3xl font-bold text-green-600">
//                   {parsingStats.valid || lineItems.length}
//                 </p>
//               </div>
//               <div className="text-center">
//                 <p className="text-sm text-muted-foreground mb-1">Filtered Out</p>
//                 <p className="text-3xl font-bold text-orange-600">
//                   {parsingStats.rejected || 0}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Line Items ({lineItems.length})</CardTitle>
//               <CardDescription>
//                 Showing {startIndex + 1}-{Math.min(endIndex, lineItems.length)} of {lineItems.length} items
//               </CardDescription>
//             </div>
//             <Button
//               onClick={handleAddItem}
//               variant="outline"
//               size="sm"
//               className="gap-2"
//               disabled={saving}
//             >
//               <Plus className="h-4 w-4" />
//               Add Item
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="border rounded-lg overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-16">#</TableHead>
//                   <TableHead className="min-w-[200px]">Generic Name</TableHead>
//                   <TableHead className="min-w-[150px]">Brand Name</TableHead>
//                   <TableHead className="min-w-[120px]">Dosage</TableHead>
//                   <TableHead className="min-w-[100px]">Form</TableHead>
//                   <TableHead className="min-w-[100px]">Unit</TableHead>
//                   <TableHead className="min-w-[100px]">Quantity</TableHead>
//                   <TableHead className="w-32 sticky right-0 bg-background">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {currentItems.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                       No line items found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   currentItems.map(item => (
//                     <TableRow key={item.id}>
//                       <TableCell className="font-medium">{item.line_item_id}</TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             value={item.inn_name}
//                             onChange={e => handleChange(item.id, 'inn_name', e.target.value)}
//                             className="h-8 min-w-[180px]"
//                           />
//                         ) : (
//                           <div className="max-w-[200px] truncate" title={item.inn_name}>
//                             {item.inn_name}
//                           </div>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             value={item.brand_name}
//                             onChange={e => handleChange(item.id, 'brand_name', e.target.value)}
//                             className="h-8 min-w-[130px]"
//                           />
//                         ) : (
//                           <div className="max-w-[150px] truncate" title={item.brand_name}>
//                             {item.brand_name}
//                           </div>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             value={item.dosage}
//                             onChange={e => handleChange(item.id, 'dosage', e.target.value)}
//                             className="h-8 min-w-[100px]"
//                           />
//                         ) : (
//                           item.dosage
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             value={item.form}
//                             onChange={e => handleChange(item.id, 'form', e.target.value)}
//                             className="h-8 min-w-[80px]"
//                           />
//                         ) : (
//                           item.form
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             value={item.unit_of_issue}
//                             onChange={e =>
//                               handleChange(item.id, 'unit_of_issue', e.target.value)
//                             }
//                             className="h-8 min-w-[80px]"
//                           />
//                         ) : (
//                           item.unit_of_issue
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {editingId === item.id ? (
//                           <Input
//                             type="number"
//                             value={item.quantity || 0}
//                             onChange={e =>
//                               handleChange(
//                                 item.id,
//                                 'quantity',
//                                 Number.isNaN(parseInt(e.target.value))
//                                   ? 0
//                                   : parseInt(e.target.value)
//                               )
//                             }
//                             className="h-8 w-20"
//                           />
//                         ) : (
//                           item.quantity || 0
//                         )}
//                       </TableCell>
//                       <TableCell className="sticky right-0 bg-background">
//                         <div className="flex items-center gap-1">
//                           {editingId === item.id ? (
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="h-8 w-8"
//                               onClick={() => handleSave(item.id)}
//                               disabled={saving}
//                             >
//                               {saving ? (
//                                 <Loader2 className="h-4 w-4 animate-spin" />
//                               ) : (
//                                 <Save className="h-4 w-4" />
//                               )}
//                             </Button>
//                           ) : (
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="h-8 w-8"
//                               onClick={() => handleEdit(item.id)}
//                               disabled={saving}
//                             >
//                               <Edit2 className="h-4 w-4" />
//                             </Button>
//                           )}
//                           <Button
//                             size="icon"
//                             variant="ghost"
//                             className="h-8 w-8 text-destructive"
//                             onClick={() => handleDelete(item.id)}
//                             disabled={saving}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {totalPages > 1 && (
//             <div className="flex items-center justify-center gap-2 mt-4">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="h-4 w-4 mr-1" />
//                 Previous
//               </Button>

//               <div className="flex items-center gap-1">
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                   <Button
//                     key={page}
//                     variant={currentPage === page ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => handlePageChange(page)}
//                     className="w-8 h-8"
//                   >
//                     {page}
//                   </Button>
//                 ))}
//               </div>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <div className="flex justify-end gap-3">
//         <Link href="/dashboard/hospital/rfq/upload">
//           <Button variant="outline">Cancel</Button>
//         </Link>
//         <Button
//           onClick={handleProceed}
//           className="gap-2"
//           disabled={saving || lineItems.length === 0}
//         >
//           {saving ? (
//             <>
//               <Loader2 className="h-4 w-4 animate-spin" />
//               Publishing...
//             </>
//           ) : (
//             <>
//               Proceed to Select Vendors
//               <ArrowRight className="h-4 w-4" />
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   )
// }

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Package,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner"; // Optional: if you have a toast library installed

export default function RFQReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 1. Fetch Data (Dual Logic) ---
  useEffect(() => {
    async function fetchRFQ() {
      try {
        // Fetch RFQ + existing DB items
        const { data, error } = await supabase
          .from("rfqs")
          .select("*, rfq_items(*)")
          .eq("id", id)
          .single();

        if (error) throw error;
        setRfq(data);

        // LOGIC: If SQL table is empty, fall back to JSON metadata
        if (data.rfq_items && data.rfq_items.length > 0) {
          setItems(data.rfq_items);
        } else if (data.metadata?.line_items) {
          // Map JSON structure to match DB structure
          const mappedItems = data.metadata.line_items.map((i: any) => ({
            item_name: i.inn_name || i.item_name,
            description: i.description || `${i.form} - ${i.dosage}`,
            quantity: i.quantity,
            unit: i.unit_of_issue || i.unit || "unit",
            specification: i.dosage || i.specification,
            estimated_price: 0, // Default to 0 if not extracted
          }));
          setItems(mappedItems);
        }
      } catch (err: any) {
        console.error("Error:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRFQ();
  }, [id]);

  // --- 2. Publish Logic (The Critical Step) ---
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // A. If items are only in Metadata, move them to SQL Table
      // Check if we need to insert items (if rfq_items was empty initially)
      const { count } = await supabase
        .from("rfq_items")
        .select("*", { count: "exact", head: true })
        .eq("rfq_id", id);

      if (count === 0 && items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          rfq_id: id,
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          specification: item.specification,
          description: item.description,
          estimated_price: 0,
        }));

        const { error: insertError } = await supabase
          .from("rfq_items")
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      // B. Update RFQ Status to 'published'
      const { error: updateError } = await supabase
        .from("rfqs")
        .update({
          status: "published",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Success!
      router.push(`/dashboard/hospital/rfq?tab=active`);
    } catch (err: any) {
      console.error("Publish Error:", err);
      setErrorMsg("Failed to publish: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  if (!rfq) return <div className="p-8">RFQ not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/hospital/rfq`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Review & Publish
            </h1>
          </div>
          <p className="text-slate-500 pl-14">
            Verify the extracted data before making this RFQ visible to vendors.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={publishing}>
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {publishing ? "Publishing..." : "Publish Live"}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>RFQ Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Title
              </label>
              <p className="font-medium text-lg">{rfq.title}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Deadline
              </label>
              <p className="font-medium text-lg">
                {new Date(rfq.deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                ID
              </label>
              <p className="font-mono text-sm">{rfq.id}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Status
              </label>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                {rfq.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Total Items</span>
              <span className="font-bold text-xl">{items.length}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex gap-2">
              <Package className="h-5 w-5 shrink-0" />
              <p>
                Items will be moved to the live bidding database upon
                publishing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>
            Review the items extracted from your PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-slate-500">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {item.specification || item.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm">{item.unit}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
