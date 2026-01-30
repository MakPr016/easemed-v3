// "use client";

// import { use, useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   MapPin,
//   Clock,
//   Package,
//   Calendar,
//   FileText,
//   CreditCard,
//   ArrowLeft,
//   AlertCircle,
//   Loader2,
//   Download,
//   User,
//   CheckCircle2,
//   XCircle,
//   Eye,
// } from "lucide-react";
// import Link from "next/link";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";

// const formatDate = (dateString: string | null) => {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// export default function HospitalRFQDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const supabase = createClient();
//   const router = useRouter();

//   const [rfq, setRfq] = useState<any>(null);
//   const [items, setItems] = useState<any[]>([]);
//   const [quotations, setQuotations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Dialog State
//   const [selectedQuote, setSelectedQuote] = useState<any>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   async function fetchData() {
//     try {
//       // 1. Fetch RFQ & Items
//       const { data: rfqData, error: rfqError } = await supabase
//         .from("rfqs")
//         .select("*, rfq_items(*)")
//         .eq("id", id)
//         .single();

//       if (rfqError) throw rfqError;
//       setRfq(rfqData);

//       if (rfqData.rfq_items && rfqData.rfq_items.length > 0) {
//         setItems(rfqData.rfq_items);
//       } else if (rfqData.metadata?.line_items) {
//         setItems(rfqData.metadata.line_items);
//       }

//       // 2. Fetch Received Quotations
//       const { data: quotesData, error: quotesError } = await supabase
//         .from("quotations")
//         .select(
//           `
//                     *,
//                     vendors ( vendor_name, contact_email, rating )
//                 `,
//         )
//         .eq("rfq_id", id)
//         .order("created_at", { ascending: false });

//       if (!quotesError) setQuotations(quotesData || []);
//     } catch (err) {
//       console.error("Error loading data:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // --- Action Handlers ---
//   const handleViewQuote = (quote: any) => {
//     setSelectedQuote(quote);
//     setDialogOpen(true);
//   };

//   const handleUpdateQuoteStatus = async (status: "accepted" | "rejected") => {
//     if (!selectedQuote) return;
//     setProcessing(true);
//     try {
//       // Update Quotation Status
//       const { error } = await supabase
//         .from("quotations")
//         .update({ status: status })
//         .eq("id", selectedQuote.id);

//       if (error) throw error;

//       // If accepted, update RFQ status to 'awarded'
//       if (status === "accepted") {
//         await supabase.from("rfqs").update({ status: "awarded" }).eq("id", id);

//         // Reject all other pending quotes
//         await supabase
//           .from("quotations")
//           .update({ status: "rejected" })
//           .eq("rfq_id", id)
//           .neq("id", selectedQuote.id)
//           .eq("status", "pending");
//       }

//       // Refresh Data
//       await fetchData();
//       setDialogOpen(false);
//     } catch (error) {
//       console.error("Error updating status:", error);
//       alert("Failed to update status");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   if (!rfq) return <div className="p-8">RFQ Not Found</div>;

//   const isDraft = rfq.status === "draft";

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 pb-12">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Link href="/dashboard/hospital/rfq">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <div>
//             <div className="flex items-center gap-3 mb-1">
//               <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//                 {rfq.title}
//               </h1>
//               <Badge
//                 className={
//                   isDraft
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-green-100 text-green-800"
//                 }
//               >
//                 {rfq.status.toUpperCase()}
//               </Badge>
//             </div>
//             <p className="text-slate-500 text-sm">ID: {rfq.id.slice(0, 8)}</p>
//           </div>
//         </div>
//         {isDraft && (
//           <Link href={`/dashboard/hospital/rfq/${rfq.id}/review`}>
//             <Button
//               size="lg"
//               className="bg-yellow-500 hover:bg-yellow-600 text-white"
//             >
//               Review & Publish
//             </Button>
//           </Link>
//         )}
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-8">
//           {/* --- QUOTATIONS TABLE --- */}
//           {!isDraft && (
//             <Card className="border-blue-100 shadow-sm overflow-hidden">
//               <CardHeader className="bg-blue-50/50 border-b border-blue-100">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <CardTitle className="text-blue-900">
//                       Received Bids
//                     </CardTitle>
//                     <CardDescription>
//                       {quotations.length} vendors responded
//                     </CardDescription>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-0">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="pl-6">Vendor</TableHead>
//                       <TableHead>Date</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead className="text-right">Total Bid</TableHead>
//                       <TableHead className="text-right pr-6">Action</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {quotations.length === 0 ? (
//                       <TableRow>
//                         <TableCell
//                           colSpan={5}
//                           className="text-center py-8 text-slate-500"
//                         >
//                           No bids received yet.
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       quotations.map((quote) => (
//                         <TableRow
//                           key={quote.id}
//                           className="hover:bg-slate-50/50"
//                         >
//                           <TableCell className="pl-6 font-medium">
//                             <div className="flex items-center gap-3">
//                               <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
//                                 {quote.vendors?.vendor_name
//                                   ?.substring(0, 2)
//                                   .toUpperCase()}
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium">
//                                   {quote.vendors?.vendor_name}
//                                 </p>
//                                 <p className="text-xs text-slate-500">
//                                   {quote.vendors?.contact_email}
//                                 </p>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>{formatDate(quote.created_at)}</TableCell>
//                           <TableCell>
//                             <Badge
//                               variant={
//                                 quote.status === "accepted"
//                                   ? "default"
//                                   : quote.status === "rejected"
//                                     ? "destructive"
//                                     : "secondary"
//                               }
//                               className="capitalize"
//                             >
//                               {quote.status}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-right font-mono font-medium">
//                             {quote.total_amount > 0
//                               ? `€${quote.total_amount.toLocaleString()}`
//                               : "-"}
//                           </TableCell>
//                           <TableCell className="text-right pr-6">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleViewQuote(quote)}
//                               className="gap-2"
//                             >
//                               <Eye className="h-3.5 w-3.5" /> View
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           )}

//           {/* Requested Items List */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Requested Items</CardTitle>
//               <CardDescription>{items.length} items listed</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Item Name</TableHead>
//                     <TableHead>Spec</TableHead>
//                     <TableHead className="text-right">Qty</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {items.map((item, i) => (
//                     <TableRow key={i}>
//                       <TableCell className="font-medium">
//                         {item.item_name || item.inn_name}
//                       </TableCell>
//                       <TableCell className="text-sm text-slate-500">
//                         {item.specification || item.dosage || "-"}
//                       </TableCell>
//                       <TableCell className="text-right font-mono">
//                         {item.quantity} {item.unit || item.unit_of_issue}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right: Sidebar Info */}
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex justify-between py-2 border-b">
//                 <span className="text-sm text-slate-500">Deadline</span>
//                 <span className="font-medium">{formatDate(rfq.deadline)}</span>
//               </div>
//               <div className="flex justify-between py-2 border-b">
//                 <span className="text-sm text-slate-500">Contract</span>
//                 <span className="font-medium">
//                   {rfq.metadata?.contract_type?.replace(/_/g, " ") ||
//                     "Standard"}
//                 </span>
//               </div>
//               <div className="flex justify-between py-2 border-b">
//                 <span className="text-sm text-slate-500">Location</span>
//                 <span className="font-medium">
//                   {rfq.location || "Main Campus"}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- BID DETAILS DIALOG --- */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="sm:max-w-[600px]">
//           {selectedQuote && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>Bid Details</DialogTitle>
//                 <DialogDescription>
//                   Reviewing quotation from{" "}
//                   <strong>{selectedQuote.vendors?.vendor_name}</strong>
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="space-y-6 py-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-slate-50 p-3 rounded-lg border">
//                     <p className="text-xs text-slate-500 uppercase">
//                       Total Amount
//                     </p>
//                     <p className="text-xl font-bold text-slate-900">
//                       {selectedQuote.total_amount > 0
//                         ? `€${selectedQuote.total_amount.toLocaleString()}`
//                         : "Review Doc"}
//                     </p>
//                   </div>
//                   <div className="bg-slate-50 p-3 rounded-lg border">
//                     <p className="text-xs text-slate-500 uppercase">
//                       Delivery Time
//                     </p>
//                     <p className="text-xl font-bold text-slate-900">
//                       {selectedQuote.delivery_time_days} Days
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Vendor Notes:</p>
//                   <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-600 border min-h-[80px]">
//                     {selectedQuote.notes || "No additional notes provided."}
//                   </div>
//                 </div>

//                 {selectedQuote.document_url && (
//                   <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50/50 border-blue-100">
//                     <div className="flex items-center gap-2">
//                       <FileText className="h-5 w-5 text-blue-600" />
//                       <div>
//                         <p className="text-sm font-medium text-blue-900">
//                           Quotation Document
//                         </p>
//                         <p className="text-xs text-blue-600">
//                           PDF / Excel File
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="border-blue-200 text-blue-700 hover:bg-blue-100"
//                     >
//                       <Download className="h-4 w-4 mr-2" /> Download
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               <DialogFooter className="gap-2 sm:justify-between">
//                 <Button variant="ghost" onClick={() => setDialogOpen(false)}>
//                   Close
//                 </Button>
//                 <div className="flex gap-2">
//                   {selectedQuote.status === "pending" && (
//                     <>
//                       <Button
//                         variant="destructive"
//                         onClick={() => handleUpdateQuoteStatus("rejected")}
//                         disabled={processing}
//                       >
//                         Reject Bid
//                       </Button>
//                       <Button
//                         className="bg-green-600 hover:bg-green-700 text-white"
//                         onClick={() => handleUpdateQuoteStatus("accepted")}
//                         disabled={processing}
//                       >
//                         {processing ? (
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                           <CheckCircle2 className="h-4 w-4 mr-2" />
//                         )}
//                         Accept Bid
//                       </Button>
//                     </>
//                   )}
//                   {selectedQuote.status === "accepted" && (
//                     <Badge className="bg-green-100 text-green-700 h-10 px-4 text-base">
//                       <CheckCircle2 className="h-4 w-4 mr-2" /> Awarded
//                     </Badge>
//                   )}
//                 </div>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { use, useState, useEffect } from "react";
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
  MapPin,
  Clock,
  Package,
  Calendar,
  FileText,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Download,
  User,
  CheckCircle2,
  Eye,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function HospitalRFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      // 1. Fetch RFQ & Items
      const { data: rfqData, error: rfqError } = await supabase
        .from("rfqs")
        .select("*, rfq_items(*)")
        .eq("id", id)
        .single();

      if (rfqError) throw rfqError;
      setRfq(rfqData);

      if (rfqData.rfq_items && rfqData.rfq_items.length > 0) {
        setItems(rfqData.rfq_items);
      } else if (rfqData.metadata?.line_items) {
        setItems(rfqData.metadata.line_items);
      }

      // 2. Fetch Received Quotations
      const { data: quotesData, error: quotesError } = await supabase
        .from("quotations")
        .select(
          `
                    *,
                    vendors ( vendor_name, contact_email, rating )
                `,
        )
        .eq("rfq_id", id)
        .order("created_at", { ascending: false });

      if (!quotesError) setQuotations(quotesData || []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Action Handlers ---
  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setDialogOpen(true);
  };

  const handleUpdateQuoteStatus = async (action: "accept" | "reject") => {
    if (!selectedQuote) return;
    setProcessing(true);
    try {
      // FIX: Use 'awarded' instead of 'accepted' to match DB Enum
      const newStatus = action === "accept" ? "awarded" : "rejected";

      // 1. Update the selected quotation
      const { error } = await supabase
        .from("quotations")
        .update({ status: newStatus })
        .eq("id", selectedQuote.id);

      if (error) throw error;

      // 2. If awarded, update parent RFQ status and reject others
      if (newStatus === "awarded") {
        // Set RFQ to 'awarded'
        await supabase.from("rfqs").update({ status: "awarded" }).eq("id", id);

        // Reject all other pending quotes for this RFQ
        await supabase
          .from("quotations")
          .update({ status: "rejected" })
          .eq("rfq_id", id)
          .neq("id", selectedQuote.id)
          .eq("status", "pending");
      }

      // Refresh Data & Close Dialog
      await fetchData();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  if (!rfq) return <div className="p-8">RFQ Not Found</div>;

  const isDraft = rfq.status === "draft";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hospital/rfq">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {rfq.title}
              </h1>
              <Badge
                className={
                  isDraft
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {rfq.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">ID: {rfq.id.slice(0, 8)}</p>
          </div>
        </div>
        {isDraft && (
          <Link href={`/dashboard/hospital/rfq/${rfq.id}/review`}>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Review & Publish
            </Button>
          </Link>
        )}
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* --- QUOTATIONS TABLE --- */}
          {!isDraft && (
            <Card className="border-blue-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900">
                      Received Bids
                    </CardTitle>
                    <CardDescription>
                      {quotations.length} vendors responded
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Vendor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total Bid</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-slate-500"
                        >
                          No bids received yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      quotations.map((quote) => (
                        <TableRow
                          key={quote.id}
                          className="hover:bg-slate-50/50"
                        >
                          <TableCell className="pl-6 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                {quote.vendors?.vendor_name
                                  ?.substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {quote.vendors?.vendor_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {quote.vendors?.contact_email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(quote.created_at)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                quote.status === "awarded"
                                  ? "default"
                                  : quote.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="capitalize"
                            >
                              {quote.status === "awarded"
                                ? "Awarded"
                                : quote.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {quote.total_amount > 0
                              ? `€${quote.total_amount.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewQuote(quote)}
                              className="gap-2"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Requested Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Requested Items</CardTitle>
              <CardDescription>{items.length} items listed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Spec</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {item.item_name || item.inn_name}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {item.specification || item.dosage || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity} {item.unit || item.unit_of_issue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-slate-500">Deadline</span>
                <span className="font-medium">{formatDate(rfq.deadline)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-slate-500">Contract</span>
                <span className="font-medium">
                  {rfq.metadata?.contract_type?.replace(/_/g, " ") ||
                    "Standard"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-slate-500">Location</span>
                <span className="font-medium">
                  {rfq.location || "Main Campus"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BID DETAILS DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle>Bid Details</DialogTitle>
                <DialogDescription>
                  Reviewing quotation from{" "}
                  <strong>{selectedQuote.vendors?.vendor_name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-xs text-slate-500 uppercase">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {selectedQuote.total_amount > 0
                        ? `€${selectedQuote.total_amount.toLocaleString()}`
                        : "Review Doc"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-xs text-slate-500 uppercase">
                      Delivery Time
                    </p>
                    <p className="text-xl font-bold text-slate-900">
                      {selectedQuote.delivery_time_days || 14} Days
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Vendor Notes:</p>
                  <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-600 border min-h-[80px]">
                    {selectedQuote.notes || "No additional notes provided."}
                  </div>
                </div>

                {selectedQuote.document_url && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50/50 border-blue-100">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Quotation Document
                        </p>
                        <p className="text-xs text-blue-600">
                          PDF / Excel File
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  {selectedQuote.status === "pending" && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleUpdateQuoteStatus("reject")}
                        disabled={processing}
                      >
                        Reject Bid
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleUpdateQuoteStatus("accept")}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Accept Bid
                      </Button>
                    </>
                  )}
                  {selectedQuote.status === "awarded" && (
                    <Badge className="bg-green-100 text-green-700 h-10 px-4 text-base">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Awarded
                    </Badge>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
