"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Requirement {
  id: string;
  line_item_id: string;
  inn_name: string;
  brand_name: string;
  dosage: string;
  form: string;
  quantity: number;
  unit_of_issue: string;
  matchedVendorsCount: number;
  selectedVendorsCount: number;
  category: string;
}

interface RFQInfo {
  id: string;
  title: string;
  deadline: string;
  status: string;
  totalRequirements: number;
}

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper to guess category based on item name string
const getCategoryFromText = (text: string): string => {
  const lower = text.toLowerCase();
  if (
    lower.includes("tablet") ||
    lower.includes("capsule") ||
    lower.includes("pill")
  )
    return "Oral Medications";
  if (
    lower.includes("injection") ||
    lower.includes("vial") ||
    lower.includes("syringe")
  )
    return "Injectable";
  if (
    lower.includes("syrup") ||
    lower.includes("suspension") ||
    lower.includes("liquid")
  )
    return "Liquid Medications";
  if (
    lower.includes("cream") ||
    lower.includes("gel") ||
    lower.includes("ointment")
  )
    return "Topical";
  if (
    lower.includes("glove") ||
    lower.includes("mask") ||
    lower.includes("ppe")
  )
    return "Consumables";
  if (
    lower.includes("monitor") ||
    lower.includes("device") ||
    lower.includes("machine")
  )
    return "Medical Equipment";
  return "General Supply";
};

export default function RequirementsListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [rfqInfo, setRfqInfo] = useState<RFQInfo | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRFQData();
  }, [resolvedParams.id]);

  const fetchRFQData = async () => {
    try {
      // 1. Fetch RFQ Info
      const { data: rfqData, error: rfqError } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (rfqError) throw rfqError;

      // 2. Fetch Items (Using correct table: rfq_items)
      const { data: itemsData, error: itemsError } = await supabase
        .from("rfq_items")
        .select("*")
        .eq("rfq_id", resolvedParams.id);
      // .order('created_at', { ascending: true }) // Optional sorting

      if (itemsError) throw itemsError;

      setRfqInfo({
        id: rfqData.id,
        title: rfqData.title,
        deadline: rfqData.deadline,
        status: rfqData.status,
        totalRequirements: itemsData?.length || 0,
      });

      // 3. Map DB items to UI Requirement Interface
      const transformedRequirements: Requirement[] = (itemsData || []).map(
        (item) => ({
          id: item.id,
          line_item_id: item.id, // Using UUID
          inn_name: item.item_name || "Unknown Item",
          brand_name: "Generic", // Placeholder if not in DB
          dosage: item.specification || "N/A",
          form: item.unit || "N/A",
          quantity: item.quantity || 0,
          unit_of_issue: item.unit || "Unit",
          matchedVendorsCount: Math.floor(Math.random() * 15) + 1, // Mock count for demo
          selectedVendorsCount: 0,
          category: getCategoryFromText(item.item_name || ""),
        }),
      );

      setRequirements(transformedRequirements);
    } catch (err: any) {
      console.error("Error fetching RFQ:", err);
      setError(err.message || "Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequirements = requirements.filter(
    (req) =>
      req.inn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredRequirements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredRequirements.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSelectRequirement = (itemId: string) => {
    // Navigate to vendor selection for this specific item
    // Ensure this route exists or change logic if selecting multiple
    router.push(
      `/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${itemId}`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !rfqInfo) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading RFQ</h3>
            <p className="text-muted-foreground mb-4">
              {error || "RFQ not found"}
            </p>
            <Link href="/dashboard/hospital/rfq">
              <Button variant="outline">Back to List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/hospital/rfq/${resolvedParams.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Select Vendors by Requirement
          </h1>
          <p className="text-muted-foreground">
            Find and invite suppliers for each specific line item.
          </p>
        </div>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{rfqInfo.title}</CardTitle>
              <CardDescription className="mt-1">
                RFQ ID: <span className="font-mono text-xs">{rfqInfo.id}</span>{" "}
                • {rfqInfo.totalRequirements} Line Items
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">
                Deadline: {formatDate(rfqInfo.deadline)}
              </Badge>
              <Badge
                variant={
                  rfqInfo.status === "published" ? "default" : "secondary"
                }
              >
                {rfqInfo.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requirements by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {requirements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Requirements Found
            </h3>
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
                className="hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => handleSelectRequirement(requirement.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                              {requirement.inn_name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {requirement.brand_name !== "Generic"
                                ? requirement.brand_name
                                : "Generic/Any Brand"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="font-normal">
                            {requirement.category}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">
                              Spec
                            </span>
                            <span className="font-medium text-slate-700">
                              {requirement.dosage}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">
                              Unit
                            </span>
                            <span className="font-medium text-slate-700">
                              {requirement.form}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">
                              Quantity
                            </span>
                            <span className="font-medium text-slate-700">
                              {requirement.quantity} {requirement.unit_of_issue}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs uppercase font-semibold">
                              Matches
                            </span>
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Users className="h-3.5 w-3.5 text-blue-500" />
                              {requirement.matchedVendorsCount} Vendors
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-slate-400 group-hover:text-blue-600"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredRequirements.length)} of{" "}
                {filteredRequirements.length} items
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
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
            <p className="text-muted-foreground">
              No requirements found matching your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
