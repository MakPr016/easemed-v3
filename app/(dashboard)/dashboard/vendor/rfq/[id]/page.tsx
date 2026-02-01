// "use client";

// import { use, useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   MapPin,
//   Clock,
//   Package,
//   Calendar,
//   FileText,
//   ArrowLeft,
//   Upload,
//   X,
//   CheckCircle2,
//   Loader2,
//   FileSpreadsheet,
//   Settings2,
//   Building2,
//   Truck,
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
// import { createClient } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";

// // --- Helper Functions ---
// const formatDate = (dateString: string | null) => {
//   if (!dateString) return "N/A";
//   return new Date(dateString).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// export default function VendorRFQDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const supabase = createClient();

//   // --- Data States ---
//   const [rfq, setRfq] = useState<any>(null);
//   const [items, setItems] = useState<any[]>([]);
//   const [vendorProfile, setVendorProfile] = useState<any>(null);

//   // --- UI States ---
//   const [loading, setLoading] = useState(true);
//   const [bidDialogOpen, setBidDialogOpen] = useState(false);
//   const [excelBuilderOpen, setExcelBuilderOpen] = useState(false);

//   // --- Form States ---
//   const [quotationFile, setQuotationFile] = useState<File | null>(null);
//   const [notes, setNotes] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   // --- NEW: Extended Excel Builder States ---
//   const [quoteDraft, setQuoteDraft] = useState<any[]>([]);

//   // Expanded Settings to match your JSON structure
//   const [quoteSettings, setQuoteSettings] = useState({
//     // Vendor Profile
//     companyName: "",
//     contactPerson: "",
//     email: "",
//     phone: "",
//     address: "",
//     vendorType: "Distributor",

//     // Header / Terms
//     currency: "USD",
//     paymentTerms: "100% within 30 days",
//     deliveryTerms: "DAP",
//     validityDays: 60,

//     // Logistics
//     leadTime: "14 Days",
//     estimatedWeight: 0, // kg
//     estimatedVolume: 0, // m3
//     countryOfOrigin: "Mixed",

//     // Financials
//     shippingCost: 0,
//     insuranceCost: 0,
//     otherCharges: 0,
//     taxStatus: "Exclusive of VAT",
//   });

//   // --- 1. Fetch Real Data ---
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();
//         if (!user) return;

//         const { data: vendor } = await supabase
//           .from("vendors")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (vendor) {
//           setVendorProfile(vendor);
//           setQuoteSettings((prev) => ({
//             ...prev,
//             companyName: vendor.vendor_name || "",
//             contactPerson: vendor.contact_person || "",
//             email: vendor.contact_email || user.email || "",
//             phone: vendor.phone || "",
//             address: vendor.address || "",
//           }));
//         }

//         const { data: rfqData, error } = await supabase
//           .from("rfqs")
//           .select(
//             `*, hospitals ( hospital_name, city, address ), rfq_items (*)`,
//           )
//           .eq("id", id)
//           .single();

//         if (error) throw error;
//         setRfq(rfqData);
//         setItems(rfqData.rfq_items || []);

//         if (rfqData.rfq_items) {
//           const initialDraft = rfqData.rfq_items.map((item: any) => ({
//             id: item.id,
//             item_name: item.item_name,
//             requested_qty: item.quantity,
//             unit: item.unit,
//             specification: item.specification || "",
//             type: "MEDICAL_SUPPLY", // Default type
//             isSelected: true,
//             offered_price: 0,
//             brand_remark: "",
//             manufacturer: "",
//             country_origin: "",
//             // Placeholders for complex data
//             batch_number: "",
//             expiry_date: "",
//           }));
//           setQuoteDraft(initialDraft);
//         }
//       } catch (err) {
//         console.error("Error loading RFQ:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, [id]);

//   // --- 2. Input Handlers ---
//   const handleDraftChange = (index: number, field: string, value: any) => {
//     const updatedDraft = [...quoteDraft];
//     updatedDraft[index] = { ...updatedDraft[index], [field]: value };
//     setQuoteDraft(updatedDraft);
//   };

//   const handleSettingsChange = (field: string, value: any) => {
//     setQuoteSettings((prev) => ({ ...prev, [field]: value }));
//   };

//   const toggleSelection = (index: number) => {
//     const updatedDraft = [...quoteDraft];
//     updatedDraft[index].isSelected = !updatedDraft[index].isSelected;
//     setQuoteDraft(updatedDraft);
//   };

//   const toggleAll = (checked: boolean) => {
//     const updatedDraft = quoteDraft.map((item) => ({
//       ...item,
//       isSelected: checked,
//     }));
//     setQuoteDraft(updatedDraft);
//   };

//   // --- Calculations ---
//   const subTotal = quoteDraft.reduce((acc, curr) => {
//     if (!curr.isSelected) return acc;
//     return acc + curr.offered_price * curr.requested_qty;
//   }, 0);

//   const grandTotal =
//     subTotal +
//     Number(quoteSettings.shippingCost) +
//     Number(quoteSettings.insuranceCost) +
//     Number(quoteSettings.otherCharges);

//   // --- 3. Generate Complex Excel ---
//   const handleDownloadExcel = () => {
//     if (!rfq) return;
//     const activeItems = quoteDraft.filter((item) => item.isSelected);

//     if (activeItems.length === 0) {
//       alert("Please select items.");
//       return;
//     }

//     // --- SECTION 1: HEADER & PROFILES ---
//     const topSection = [
//       ["QUOTE HEADER INFORMATION"],
//       ["RFQ Reference", rfq.id],
//       [
//         "Quote Reference",
//         `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
//       ],
//       ["Submission Date", new Date().toISOString()],
//       ["Validity Period (Days)", quoteSettings.validityDays],
//       ["Currency", quoteSettings.currency],
//       ["Payment Terms", quoteSettings.paymentTerms],
//       ["Delivery Terms", quoteSettings.deliveryTerms],
//       ["Delivery Location", rfq.hospitals?.city || "Multiple"],
//       [], // Spacer
//       ["VENDOR PROFILE"],
//       ["Company Name", quoteSettings.companyName],
//       ["Contact Person", quoteSettings.contactPerson],
//       ["Email", quoteSettings.email],
//       ["Phone", quoteSettings.phone],
//       ["Address", quoteSettings.address],
//       ["Vendor Type", quoteSettings.vendorType],
//       [], // Spacer
//       ["LOGISTICS ESTIMATE"],
//       ["Lead Time (Days)", quoteSettings.leadTime],
//       ["Est. Total Weight (kg)", quoteSettings.estimatedWeight],
//       ["Est. Total Volume (m3)", quoteSettings.estimatedVolume],
//       ["Country of Origin", quoteSettings.countryOfOrigin],
//       [], // Spacer
//     ];

//     // --- SECTION 2: LINE ITEMS TABLE ---
//     // We add specific columns for Pharma/Devices to match your JSON
//     const tableHeaders = [
//       "Item No",
//       "Type",
//       "Description",
//       "Requested Qty",
//       "Unit",
//       "Offered Product",
//       "Brand Name",
//       "Manufacturer",
//       "Country of Origin",
//       "Unit Price",
//       "Total Price",
//       // Compliance Fields (mapped from JSON structure)
//       "Dosage/Specs",
//       "Batch Number",
//       "Expiry Date",
//       "Storage Conditions",
//       "Regulatory Class",
//       "CE Certificate ID",
//     ];

//     const tableRows = activeItems.map((item, index) => [
//       index + 1,
//       item.type,
//       item.item_name,
//       item.requested_qty,
//       item.unit,
//       item.brand_remark, // Offered Product
//       item.brand_remark, // Brand Name
//       item.manufacturer,
//       item.country_origin,
//       item.offered_price,
//       item.offered_price * item.requested_qty,
//       item.specification, // Dosage/Specs
//       item.batch_number, // Placeholder for user to fill in Excel
//       item.expiry_date, // Placeholder for user to fill in Excel
//       "Store below 25°C", // Default placeholder
//       "N/A", // Regulatory Class
//       "N/A", // CE Cert
//     ]);

//     // --- SECTION 3: FINANCIALS & COMPLIANCE ---
//     const footerSection = [
//       [],
//       ["FINANCIAL SUMMARY"],
//       ["Subtotal Goods", subTotal],
//       ["Transportation Cost", Number(quoteSettings.shippingCost)],
//       ["Insurance Cost", Number(quoteSettings.insuranceCost)],
//       ["Other Charges", Number(quoteSettings.otherCharges)],
//       ["TOTAL FINAL PRICE", grandTotal],
//       ["Tax Status", quoteSettings.taxStatus],
//       [],
//       ["COMPLIANCE DECLARATIONS"],
//       ["Accept General Terms", "TRUE"],
//       ["Accept Code of Conduct", "TRUE"],
//       ["Conflict of Interest", "FALSE"],
//       ["Bankruptcy/Insolvency", "FALSE"],
//       ["UN Sanctions Clear", "TRUE"],
//     ];

//     const allRows = [
//       ...topSection,
//       tableHeaders,
//       ...tableRows,
//       ...footerSection,
//     ];

//     // Create Sheet
//     const ws = XLSX.utils.aoa_to_sheet(allRows);

//     // Style Columns (Set Widths)
//     ws["!cols"] = [
//       { wch: 8 }, // Item No
//       { wch: 15 }, // Type
//       { wch: 30 }, // Description
//       { wch: 10 }, // Qty
//       { wch: 10 }, // Unit
//       { wch: 20 }, // Offered
//       { wch: 15 }, // Brand
//       { wch: 15 }, // Manuf
//       { wch: 15 }, // Origin
//       { wch: 12 }, // Price
//       { wch: 12 }, // Total
//       { wch: 20 }, // Specs
//       { wch: 15 }, // Batch
//       { wch: 15 }, // Expiry
//       { wch: 20 }, // Storage
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, ws, "DetailedQuote");
//     XLSX.writeFile(workbook, `Quote_FullData_${rfq.id}.xlsx`);
//     setExcelBuilderOpen(false);
//   };

//   // --- Submission Logic (Unchanged) ---
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0])
//       setQuotationFile(e.target.files[0]);
//   };
//   const handleRemoveFile = () => setQuotationFile(null);
//   const handleSubmitBid = async () => {
//     /* ... Keep existing logic ... */
//   };

//   if (loading)
//     return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;
//   if (!rfq) return <div>RFQ Not Found</div>;

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto pb-20">
//       {/* HEADER (Unchanged) */}
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <Link href="/dashboard/vendor">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
//             <p className="text-muted-foreground text-sm">ID: {rfq.id}</p>
//           </div>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             onClick={() => setExcelBuilderOpen(true)}
//             className="gap-2 text-green-700 border-green-200 hover:bg-green-50"
//           >
//             <FileSpreadsheet className="h-4 w-4" /> Edit & Export Excel
//           </Button>
//           <Button
//             onClick={() => setBidDialogOpen(true)}
//             className="bg-blue-600"
//           >
//             Submit Quotation
//           </Button>
//         </div>
//       </div>

//       {/* Main Grid (Unchanged) */}
//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* ... (Existing Read-only Cards) ... */}
//       </div>

//       {/* ========================================================= */}
//       {/* EXPANDED EXCEL BUILDER POPUP                              */}
//       {/* ========================================================= */}
//       <Dialog open={excelBuilderOpen} onOpenChange={setExcelBuilderOpen}>
//         <DialogContent className="sm:max-w-[1100px] max-h-[95vh] flex flex-col p-0 gap-0">
//           <div className="p-6 pb-2 border-b bg-slate-50">
//             <DialogTitle>Quote Editor</DialogTitle>
//             <DialogDescription>
//               Edit header details and line items to generate the full data
//               sheet.
//             </DialogDescription>
//           </div>

//           <div className="flex-1 overflow-y-auto p-6 space-y-6">
//             {/* 1. HEADER & TERMS SETTINGS */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Left: Vendor & Terms */}
//               <div className="space-y-4 border p-4 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <Settings2 className="h-4 w-4 text-blue-600" />
//                   <h4 className="font-semibold text-sm">Terms & Profile</h4>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label className="text-xs">Payment Terms</Label>
//                     <Input
//                       className="h-8"
//                       value={quoteSettings.paymentTerms}
//                       onChange={(e) =>
//                         handleSettingsChange("paymentTerms", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Delivery Terms</Label>
//                     <Input
//                       className="h-8"
//                       value={quoteSettings.deliveryTerms}
//                       onChange={(e) =>
//                         handleSettingsChange("deliveryTerms", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Contact Person</Label>
//                     <Input
//                       className="h-8"
//                       value={quoteSettings.contactPerson}
//                       onChange={(e) =>
//                         handleSettingsChange("contactPerson", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Phone</Label>
//                     <Input
//                       className="h-8"
//                       value={quoteSettings.phone}
//                       onChange={(e) =>
//                         handleSettingsChange("phone", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Right: Logistics & Finance */}
//               <div className="space-y-4 border p-4 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <Truck className="h-4 w-4 text-orange-600" />
//                   <h4 className="font-semibold text-sm">Logistics & Finance</h4>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <Label className="text-xs">Lead Time (Days)</Label>
//                     <Input
//                       type="number"
//                       className="h-8"
//                       value={quoteSettings.leadTime}
//                       onChange={(e) =>
//                         handleSettingsChange("leadTime", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Est. Weight (kg)</Label>
//                     <Input
//                       type="number"
//                       className="h-8"
//                       value={quoteSettings.estimatedWeight}
//                       onChange={(e) =>
//                         handleSettingsChange("estimatedWeight", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Transport Cost ($)</Label>
//                     <Input
//                       type="number"
//                       className="h-8"
//                       value={quoteSettings.shippingCost}
//                       onChange={(e) =>
//                         handleSettingsChange("shippingCost", e.target.value)
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label className="text-xs">Insurance ($)</Label>
//                     <Input
//                       type="number"
//                       className="h-8"
//                       value={quoteSettings.insuranceCost}
//                       onChange={(e) =>
//                         handleSettingsChange("insuranceCost", e.target.value)
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* 2. ITEMS TABLE */}
//             <div className="border rounded-lg overflow-hidden">
//               <Table>
//                 <TableHeader className="bg-slate-100">
//                   <TableRow>
//                     <TableHead className="w-[40px]">
//                       <input
//                         type="checkbox"
//                         checked={quoteDraft.every((i) => i.isSelected)}
//                         onChange={(e) => toggleAll(e.target.checked)}
//                       />
//                     </TableHead>
//                     <TableHead className="w-[200px]">Item</TableHead>
//                     <TableHead>Qty</TableHead>
//                     <TableHead className="w-[120px]">Unit Price</TableHead>
//                     <TableHead className="w-[150px]">Brand/Product</TableHead>
//                     <TableHead className="w-[150px]">Manufacturer</TableHead>
//                     <TableHead className="w-[120px]">Origin</TableHead>
//                     <TableHead className="text-right">Total</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {quoteDraft.map((item, index) => (
//                     <TableRow
//                       key={item.id}
//                       className={!item.isSelected ? "opacity-50" : ""}
//                     >
//                       <TableCell>
//                         <input
//                           type="checkbox"
//                           checked={item.isSelected}
//                           onChange={() => toggleSelection(index)}
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <span className="font-medium text-sm">
//                           {item.item_name}
//                         </span>
//                         <p className="text-xs text-muted-foreground">
//                           {item.specification}
//                         </p>
//                       </TableCell>
//                       <TableCell>{item.requested_qty}</TableCell>
//                       <TableCell>
//                         <Input
//                           type="number"
//                           className="h-8"
//                           value={item.offered_price}
//                           onChange={(e) =>
//                             handleDraftChange(
//                               index,
//                               "offered_price",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Input
//                           className="h-8"
//                           placeholder="Brand Name"
//                           value={item.brand_remark}
//                           onChange={(e) =>
//                             handleDraftChange(
//                               index,
//                               "brand_remark",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Input
//                           className="h-8"
//                           placeholder="Manuf."
//                           value={item.manufacturer}
//                           onChange={(e) =>
//                             handleDraftChange(
//                               index,
//                               "manufacturer",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Input
//                           className="h-8"
//                           placeholder="Country"
//                           value={item.country_origin}
//                           onChange={(e) =>
//                             handleDraftChange(
//                               index,
//                               "country_origin",
//                               e.target.value,
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell className="text-right font-medium">
//                         {(item.offered_price * item.requested_qty).toFixed(2)}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
//             <div>
//               <p className="text-xs text-muted-foreground">
//                 Total Goods: {subTotal.toFixed(2)}
//               </p>
//               <p className="text-lg font-bold">
//                 Grand Total: {grandTotal.toFixed(2)} {quoteSettings.currency}
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setExcelBuilderOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleDownloadExcel}
//                 className="bg-green-600 hover:bg-green-700 gap-2"
//               >
//                 <FileSpreadsheet className="h-4 w-4" /> Download Full Data Excel
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Submit Dialog (Existing) */}
//       <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
//         {/* ... Keep existing upload dialog ... */}
//         <DialogContent>
//           <DialogTitle>Submit</DialogTitle>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { use, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Package,
  Calendar,
  FileText,
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  Settings2,
  Building2,
  Truck,
  Pencil, // New icon for editing details
  FileJson, // New icon for JSON import
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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// --- Types for your Inventory Data ---
type InventoryItem = {
  id: string; // Matches RFQ Item ID
  active_substance: string;
  form: string;
  concentration: string;
  unit: string;
  quantity_3y: number;
  total_sum: number;
  unit_price: number;
  brand_name: string;
  manufacturer: string;
  manufacturer_secondary: string;
  // Internal State
  isSelected: boolean;
  rfq_item_name: string; // To keep track of original request
  rfq_requested_qty: number;
};

// --- Helper Functions ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VendorRFQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  // --- Data States ---
  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [excelBuilderOpen, setExcelBuilderOpen] = useState(false);

  // NEW: State for the specific "Item Detail Editor" modal
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // --- Form States ---
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --- Excel Builder States (Expanded) ---
  const [quoteDraft, setQuoteDraft] = useState<InventoryItem[]>([]);

  const [quoteSettings, setQuoteSettings] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "100% within 30 days",
    deliveryTerms: "DAP",
    validityDays: 60,
    currency: "USD",
    leadTime: "14 Days",
    shippingCost: 0,
  });

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vendor } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (vendor) {
          setVendorProfile(vendor);
          setQuoteSettings((prev) => ({
            ...prev,
            companyName: vendor.vendor_name || "",
            contactPerson: vendor.contact_person || "",
            email: vendor.contact_email || user.email || "",
            phone: vendor.phone || "",
            address: vendor.address || "",
          }));
        }

        const { data: rfqData, error } = await supabase
          .from("rfqs")
          .select(
            `*, hospitals ( hospital_name, city, address ), rfq_items (*)`,
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setRfq(rfqData);
        setItems(rfqData.rfq_items || []);

        if (rfqData.rfq_items) {
          // Initialize Draft with combined fields
          const initialDraft: InventoryItem[] = rfqData.rfq_items.map(
            (item: any) => ({
              id: item.id, // RFQ Item ID
              rfq_item_name: item.item_name,
              rfq_requested_qty: item.quantity,

              // Your Inventory Fields (Initialized empty)
              active_substance: "",
              form: "",
              concentration: "",
              unit: item.unit || "", // Use RFQ unit as default
              quantity_3y: 0,
              total_sum: 0,
              unit_price: 0,
              brand_name: "",
              manufacturer: "",
              manufacturer_secondary: "",

              isSelected: true,
            }),
          );
          setQuoteDraft(initialDraft);
        }
      } catch (err) {
        console.error("Error loading RFQ:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- 2. Inventory Import Logic ---
  const handleInventoryImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          alert("Invalid JSON: Expected an array of items.");
          return;
        }

        // Merge logic: Match JSON 'id' with Draft 'id'
        const updatedDraft = quoteDraft.map((draftItem) => {
          const match = json.find(
            (importedItem: any) => importedItem.id === draftItem.id,
          );
          if (match) {
            return {
              ...draftItem,
              active_substance:
                match.active_substance || draftItem.active_substance,
              form: match.form || draftItem.form,
              concentration: match.concentration || draftItem.concentration,
              unit: match.unit || draftItem.unit,
              quantity_3y: match.quantity_3y || draftItem.quantity_3y,
              unit_price: match.unit_price || draftItem.unit_price,
              total_sum: (match.unit_price || 0) * draftItem.rfq_requested_qty, // Recalculate sum
              brand_name: match.brand_name || draftItem.brand_name,
              manufacturer: match.manufacturer || draftItem.manufacturer,
              manufacturer_secondary:
                match.manufacturer_secondary ||
                draftItem.manufacturer_secondary,
            };
          }
          return draftItem;
        });

        setQuoteDraft(updatedDraft);
        alert(`Successfully updated ${json.length} items from inventory.`);
      } catch (error) {
        console.error("Import error", error);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // --- 3. Input Handlers ---
  const handleDraftChange = (
    index: number,
    field: keyof InventoryItem,
    value: any,
  ) => {
    const updatedDraft = [...quoteDraft];
    updatedDraft[index] = { ...updatedDraft[index], [field]: value };

    // Auto-calc total_sum if price changes
    if (field === "unit_price") {
      updatedDraft[index].total_sum =
        Number(value) * updatedDraft[index].rfq_requested_qty;
    }

    setQuoteDraft(updatedDraft);
  };

  const handleSettingsChange = (field: string, value: any) => {
    setQuoteSettings((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (index: number) => {
    const updatedDraft = [...quoteDraft];
    updatedDraft[index].isSelected = !updatedDraft[index].isSelected;
    setQuoteDraft(updatedDraft);
  };

  // --- 4. Generate Comprehensive Excel ---
  const handleDownloadExcel = () => {
    if (!rfq) return;
    const activeItems = quoteDraft.filter((item) => item.isSelected);

    if (activeItems.length === 0) {
      alert("Please select items.");
      return;
    }

    const topSection = [
      ["QUOTATION EXPORT"],
      ["RFQ ID", rfq.id],
      ["Date", new Date().toISOString()],
      ["Currency", quoteSettings.currency],
      ["Delivery Location", rfq.hospitals?.city],
      [],
      ["VENDOR", quoteSettings.companyName],
      ["Contact", quoteSettings.contactPerson],
      ["Email", quoteSettings.email],
      [],
    ];

    // Combined Headers (RFQ + Inventory)
    const tableHeaders = [
      "ID",
      "RFQ Item Name",
      "Requested Qty",
      "Active Substance",
      "Form",
      "Concentration",
      "Unit",
      "Brand Name",
      "Manufacturer",
      "Manufacturer (Secondary)",
      "Quantity 3Y",
      "Unit Price",
      "Total Sum",
    ];

    const tableRows = activeItems.map((item) => [
      item.id,
      item.rfq_item_name,
      item.rfq_requested_qty,
      item.active_substance,
      item.form,
      item.concentration,
      item.unit,
      item.brand_name,
      item.manufacturer,
      item.manufacturer_secondary,
      item.quantity_3y,
      item.unit_price,
      item.total_sum,
    ]);

    const grandTotal =
      activeItems.reduce((acc, curr) => acc + curr.total_sum, 0) +
      Number(quoteSettings.shippingCost);

    const footerSection = [
      [],
      ["Shipping Cost", quoteSettings.shippingCost],
      ["GRAND TOTAL", grandTotal],
      ["Lead Time", quoteSettings.leadTime],
      ["Payment Terms", quoteSettings.paymentTerms],
    ];

    const allRows = [
      ...topSection,
      tableHeaders,
      ...tableRows,
      ...footerSection,
    ];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Adjust widths
    ws["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Quotation");
    XLSX.writeFile(workbook, `Quote_${rfq.id}_Combined.xlsx`);
    setExcelBuilderOpen(false);
  };

  // --- Submission Logic (Unchanged) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setQuotationFile(e.target.files[0]);
  };
  const handleRemoveFile = () => setQuotationFile(null);
  const handleSubmitBid = async () => {
    /* ... reuse existing logic ... */
  };

  if (loading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;
  if (!rfq) return <div>RFQ Not Found</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
            <p className="text-muted-foreground text-sm">ID: {rfq.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setExcelBuilderOpen(true)}
            className="gap-2 text-green-700 border-green-200 hover:bg-green-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> Quote Builder
          </Button>
          <Button
            onClick={() => setBidDialogOpen(true)}
            className="bg-blue-600"
          >
            Submit Quotation
          </Button>
        </div>
      </div>

      {/* Main Page Content (Read Only) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Specs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">
                        {i.item_name}
                      </TableCell>
                      <TableCell>
                        {i.quantity} {i.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {i.specification || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Delivery To
                  </p>
                  <p className="font-medium">{rfq.hospitals?.hospital_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rfq.hospitals?.address}, {rfq.hospitals?.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POPUP 1: EXCEL BUILDER (MAIN LIST)                        */}
      {/* ========================================================= */}
      <Dialog open={excelBuilderOpen} onOpenChange={setExcelBuilderOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[95vh] flex flex-col p-0 gap-0">
          <div className="p-6 pb-2 border-b bg-slate-50 flex justify-between items-center">
            <div>
              <DialogTitle>Inventory Quote Builder</DialogTitle>
              <DialogDescription>
                Match your inventory to the requested items.
              </DialogDescription>
            </div>
            {/* Import Button */}
            <div className="relative">
              <input
                type="file"
                id="inventory-import"
                accept=".json"
                className="hidden"
                onChange={handleInventoryImport}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white"
                onClick={() =>
                  document.getElementById("inventory-import")?.click()
                }
              >
                <FileJson className="h-4 w-4 text-orange-600" />
                Import Inventory JSON
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header Settings (Collapsed View) */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded bg-slate-50 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">
                  Company
                </span>
                {quoteSettings.companyName}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  Payment
                </span>
                {quoteSettings.paymentTerms}
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">
                  Currency
                </span>
                {quoteSettings.currency}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">
                  Shipping ($)
                </Label>
                <Input
                  className="h-7 bg-white"
                  type="number"
                  value={quoteSettings.shippingCost}
                  onChange={(e) =>
                    handleSettingsChange("shippingCost", e.target.value)
                  }
                />
              </div>
            </div>

            {/* MAIN ITEMS TABLE */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-[40px] text-center">Sel.</TableHead>
                    <TableHead className="w-[200px]">RFQ Item</TableHead>
                    <TableHead>Req. Qty</TableHead>
                    <TableHead className="w-[120px]">Unit Price</TableHead>
                    <TableHead className="w-[150px]">Brand</TableHead>
                    <TableHead className="w-[150px]">Manufacturer</TableHead>
                    <TableHead className="w-[120px]">Act. Subst.</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Total
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>{" "}
                    {/* Edit Action */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteDraft.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={!item.isSelected ? "opacity-50" : ""}
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={() => toggleSelection(index)}
                          className="accent-blue-600 h-4 w-4"
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-medium text-sm block truncate max-w-[180px]"
                          title={item.rfq_item_name}
                        >
                          {item.rfq_item_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.id.slice(0, 6)}...
                        </span>
                      </TableCell>
                      <TableCell>{item.rfq_requested_qty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleDraftChange(
                              index,
                              "unit_price",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={item.brand_name}
                          onChange={(e) =>
                            handleDraftChange(
                              index,
                              "brand_name",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={item.manufacturer}
                          onChange={(e) =>
                            handleDraftChange(
                              index,
                              "manufacturer",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={item.active_substance}
                          onChange={(e) =>
                            handleDraftChange(
                              index,
                              "active_substance",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.total_sum.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItemIndex(index)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setExcelBuilderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" /> Download Combined Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* POPUP 2: ITEM DETAIL EDITOR (NESTED)                      */}
      {/* ========================================================= */}
      <Dialog
        open={editingItemIndex !== null}
        onOpenChange={(open) => !open && setEditingItemIndex(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Details</DialogTitle>
            <DialogDescription>
              {editingItemIndex !== null &&
                quoteDraft[editingItemIndex]?.rfq_item_name}
            </DialogDescription>
          </DialogHeader>

          {editingItemIndex !== null && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label>Active Substance</Label>
                <Input
                  value={quoteDraft[editingItemIndex].active_substance}
                  onChange={(e) =>
                    handleDraftChange(
                      editingItemIndex,
                      "active_substance",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <Label>Form</Label>
                <Input
                  value={quoteDraft[editingItemIndex].form}
                  onChange={(e) =>
                    handleDraftChange(editingItemIndex, "form", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Concentration</Label>
                <Input
                  value={quoteDraft[editingItemIndex].concentration}
                  onChange={(e) =>
                    handleDraftChange(
                      editingItemIndex,
                      "concentration",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={quoteDraft[editingItemIndex].unit}
                  onChange={(e) =>
                    handleDraftChange(editingItemIndex, "unit", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Quantity 3Y</Label>
                <Input
                  type="number"
                  value={quoteDraft[editingItemIndex].quantity_3y}
                  onChange={(e) =>
                    handleDraftChange(
                      editingItemIndex,
                      "quantity_3y",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div>
                <Label>Manufacturer (Secondary)</Label>
                <Input
                  value={quoteDraft[editingItemIndex].manufacturer_secondary}
                  onChange={(e) =>
                    handleDraftChange(
                      editingItemIndex,
                      "manufacturer_secondary",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditingItemIndex(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog (Existing) */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        {/* ... Keep existing upload dialog ... */}
        <DialogContent>
          <DialogTitle>Submit</DialogTitle>
          {/* Placeholders for brevity */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
