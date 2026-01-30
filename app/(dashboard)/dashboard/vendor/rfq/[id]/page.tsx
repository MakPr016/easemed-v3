"use client";

import { use, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Download,
  FileJson,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper
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

  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get Vendor Profile
        const { data: vendor } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (vendor) setVendorProfile(vendor);

        // Fetch RFQ Details & Items
        const { data: rfqData, error } = await supabase
          .from("rfqs")
          .select(
            `
                        *,
                        hospitals ( hospital_name, city, address ),
                        rfq_items (*)
                    `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setRfq(rfqData);
        setItems(rfqData.rfq_items || []);
      } catch (err) {
        console.error("Error loading RFQ:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- 2. Template Generation Logic ---
  const handleDownloadTemplate = () => {
    if (!rfq || !items) return;

    const template = {
      quote_header: {
        rfq_reference: rfq.id,
        quote_reference: `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        submission_date: new Date().toISOString(),
        validity_period_days: 60,
        currency: rfq.metadata?.currency || "USD",
        payment_terms: "100% within 30 days after receipt",
        delivery_terms: "DAP",
        delivery_locations: [rfq.hospitals?.city || "Primary Location"],
      },
      vendor_profile: {
        company_name: vendorProfile?.vendor_name || "Your Company Name",
        contact_person: vendorProfile?.contact_person || "",
        email: vendorProfile?.contact_email || "",
        phone: vendorProfile?.contact_phone || "",
        address: vendorProfile?.address || "",
        vendor_type: vendorProfile?.vendor_type || "Distributor",
      },
      logistics_estimate: {
        lead_time_days: 14,
        total_estimated_weight_kg: 0,
        total_estimated_volume_m3: 0,
        country_of_origin_general: "Mixed",
      },
      line_items: items.map((item, index) => ({
        item_no: index + 1,
        rfq_item_id: item.id,
        type: "PHARMACEUTICAL",
        rfq_description: item.item_name,
        requested_qty: item.quantity,
        unit_of_measure: item.unit,
        offer_details: {
          offered_product: "",
          brand_name: "",
          manufacturer: "",
          country_of_origin: "",
          unit_price: 0.0,
          total_line_price: 0.0,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QUOTE_DRAFT_${rfq.title.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuotationFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setQuotationFile(null);
  };

  // --- 3. Submit Bid Logic (FIXED) ---
  const handleSubmitBid = async () => {
    if (!quotationFile) {
      alert("Please upload a quotation document");
      return;
    }

    if (!vendorProfile?.id) {
      alert(
        "Vendor profile not found. Please ensure you are logged in as a vendor.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // A. Generate a Custom ID (Since your DB schema requires text ID, not UUID default)
      const quoteId = `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Placeholder for File URL (You can implement Storage upload later)
      const fakeUrl = `https://storage.example.com/${quotationFile.name}`;

      // B. Insert Quotation Record
      // IMPORTANT: We explicitly provide 'id' because your schema demands it
      const { error: quoteError } = await supabase.from("quotations").insert({
        id: quoteId, // <--- FIXED: Explicit ID generation
        rfq_id: id,
        vendor_id: vendorProfile.id,
        total_amount: 0, // Will be parsed from file by backend/admin later
        status: "pending",
        notes: notes,
        document_url: fakeUrl,
        valid_until: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        delivery_time_days: 14,
      });

      if (quoteError) {
        console.error("Supabase Insert Error:", quoteError);
        throw quoteError;
      }

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/vendor");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      alert(`Failed to submit bid: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  if (!rfq) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto mt-10">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">RFQ Not Found</h3>
            <Link href="/dashboard/vendor">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDeadlineColor = (dateString: string) => {
    const days = Math.ceil(
      (new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days < 3) return "bg-red-100 text-red-700 border-red-200";
    if (days < 7) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{rfq.title}</h1>
              <Badge className={getDeadlineColor(rfq.deadline)}>
                Due: {formatDate(rfq.deadline)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex gap-2 items-center">
              <FileText className="h-3.5 w-3.5" /> ID: {rfq.id.slice(0, 8)}...
              <span className="text-slate-300">|</span>
              <MapPin className="h-3.5 w-3.5" />{" "}
              {rfq.hospitals?.city || "Location N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="gap-2"
          >
            <FileJson className="h-4 w-4 text-blue-600" />
            Download JSON Template
          </Button>
          <Button
            onClick={() => setBidDialogOpen(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Quotation
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Required</CardTitle>
              <CardDescription>
                {items.length} items listed in this request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Specification</TableHead>
                      <TableHead className="text-right">Est. Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.specification || item.description || "-"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.estimated_price
                            ? `€${item.estimated_price}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No items found for this RFQ.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Posted
                  </p>
                  <p className="font-medium">{formatDate(rfq.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Deadline
                  </p>
                  <p className="font-medium">{formatDate(rfq.deadline)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Contract
                  </p>
                  <Badge variant="outline">
                    {rfq.metadata?.contract_type?.replace(/_/g, " ") ||
                      "One-time"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bid Submitted!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to the dashboard...
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Submit Your Quotation</DialogTitle>
                <DialogDescription>
                  Upload your official quotation (PDF or JSON).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quotation">Upload Document *</Label>
                  {!quotationFile ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <input
                        id="quotation"
                        type="file"
                        accept=".pdf,.json,.xlsx,.csv,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="quotation"
                        className="cursor-pointer block"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
                        <p className="text-sm font-medium text-slate-700">
                          Click to upload quotation
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JSON (Recommended), PDF, or Excel
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 flex items-center justify-between bg-blue-50/50 border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded shadow-sm">
                          {quotationFile.name.endsWith(".json") ? (
                            <FileJson className="h-6 w-6 text-orange-600" />
                          ) : (
                            <FileText className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {quotationFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(quotationFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add delivery estimates or comments..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Bid"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
