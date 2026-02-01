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
