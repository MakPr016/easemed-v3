// "use client";

// import { useEffect, useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Search,
//   Clock,
//   Package,
//   FileText,
//   Eye,
//   BarChart3,
//   Plus,
//   Calendar,
//   Loader2,
//   Coins,
//   ChevronRight,
//   AlertTriangle,
// } from "lucide-react";
// import Link from "next/link";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// // Types
// interface HospitalRFQ {
//   id: string;
//   title: string;
//   category: string;
//   itemCount: number;
//   status: string;
//   quotationCount: number;
//   deadline: string;
//   createdAt: string;
//   budget: string;
// }

// // Helpers
// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("en-EU", {
//     style: "currency",
//     currency: "EUR",
//     maximumFractionDigits: 0,
//   }).format(amount);

// const formatDate = (dateString: string) =>
//   new Date(dateString).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

// export default function HospitalRFQPage() {
//   const supabase = createClient();
//   const [loading, setLoading] = useState(true);
//   const [rfqs, setRfqs] = useState<HospitalRFQ[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   // --- 1. Fetch Real Data ---
//   useEffect(() => {
//     async function fetchRFQs() {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();
//         if (!user) return;

//         // Fetch RFQs with Metadata (for drafts) and Relations (for active)
//         const { data, error } = await supabase
//           .from("rfqs")
//           .select(
//             `
//                         id, title, status, deadline, created_at, metadata,
//                         quotations ( count ),
//                         rfq_items ( item_name, quantity, estimated_price )
//                     `,
//           )
//           .eq("created_by", user.id)
//           .order("created_at", { ascending: false });

//         if (error) {
//           console.error("Supabase Error:", error);
//           setErrorMsg(error.message); // Show error on screen
//           return;
//         }

//         // Map Data with Fallbacks
//         const formatted: HospitalRFQ[] = (data || []).map((item: any) => {
//           // FALLBACK: Use metadata (PDF extract) if rfq_items table is empty
//           const lineItems =
//             item.rfq_items?.length > 0
//               ? item.rfq_items
//               : item.metadata?.line_items || [];

//           const itemCount = lineItems.length;

//           // Get Category: From first item name
//           const firstItemName =
//             lineItems[0]?.item_name ||
//             lineItems[0]?.inn_name ||
//             "General Supply";

//           // Calculate Budget
//           const totalBudget = lineItems.reduce(
//             (acc: number, curr: any) =>
//               acc + (curr.estimated_price || 0) * (curr.quantity || 0),
//             0,
//           );

//           return {
//             id: item.id,
//             title: item.title,
//             category: firstItemName,
//             itemCount: itemCount,
//             status: item.status,
//             quotationCount: item.quotations?.[0]?.count || 0,
//             deadline: item.deadline,
//             createdAt: item.created_at,
//             budget: totalBudget > 0 ? formatCurrency(totalBudget) : "TBD",
//           };
//         });

//         setRfqs(formatted);
//       } catch (err: any) {
//         setErrorMsg(err.message || "Failed to load RFQs");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchRFQs();
//   }, []);

//   // --- Stats Calculation ---
//   const totalRFQs = rfqs.length;
//   const activeCount = rfqs.filter(
//     (r) => r.status === "published" || r.status === "active",
//   ).length;
//   const draftCount = rfqs.filter((r) => r.status === "draft").length;
//   const totalQuotes = rfqs.reduce((acc, r) => acc + r.quotationCount, 0);

//   // --- Filtering ---
//   const getFiltered = (statusTab: string) => {
//     return rfqs.filter((r) => {
//       const matchesSearch = r.title
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       if (statusTab === "drafts") return matchesSearch && r.status === "draft";
//       if (statusTab === "active")
//         return (
//           matchesSearch && (r.status === "published" || r.status === "active")
//         );
//       if (statusTab === "history")
//         return (
//           matchesSearch && (r.status === "closed" || r.status === "awarded")
//         );
//       return false;
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "draft":
//         return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "published":
//         return "bg-green-100 text-green-700 border-green-200";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">My RFQs</h1>
//           <p className="text-muted-foreground">
//             Manage and track your procurement requests
//           </p>
//         </div>
//         <Link href="/dashboard/hospital/rfq/upload">
//           <Button>
//             <Plus className="h-4 w-4 mr-2" /> Create RFQ
//           </Button>
//         </Link>
//       </div>

//       {/* Error Alert (Only shows if there is a permission error) */}
//       {errorMsg && (
//         <Alert variant="destructive">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertTitle>Access Error</AlertTitle>
//           <AlertDescription>
//             Could not load your RFQs. {errorMsg}. <br />
//             <b>Solution:</b> Please enable Row Level Security (RLS) policies in
//             your Supabase SQL Editor.
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6 flex justify-between items-center">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">
//                 Total RFQs
//               </p>
//               <p className="text-2xl font-bold mt-1">{totalRFQs}</p>
//             </div>
//             <FileText className="h-8 w-8 text-blue-500 opacity-70" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6 flex justify-between items-center">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">
//                 Active
//               </p>
//               <p className="text-2xl font-bold mt-1 text-green-600">
//                 {activeCount}
//               </p>
//             </div>
//             <Clock className="h-8 w-8 text-green-500 opacity-70" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6 flex justify-between items-center">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">
//                 Pending Drafts
//               </p>
//               <p className="text-2xl font-bold mt-1 text-yellow-600">
//                 {draftCount}
//               </p>
//             </div>
//             <FileText className="h-8 w-8 text-yellow-500 opacity-70" />
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6 flex justify-between items-center">
//             <div>
//               <p className="text-sm font-medium text-muted-foreground">
//                 Total Quotes
//               </p>
//               <p className="text-2xl font-bold mt-1">{totalQuotes}</p>
//             </div>
//             <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
//           </CardContent>
//         </Card>
//       </div>

//       {/* Tabs & Search */}
//       <Tabs defaultValue="drafts" className="space-y-6">
//         <div className="flex flex-col md:flex-row justify-between gap-4">
//           <TabsList className="bg-muted p-1 rounded-lg">
//             <TabsTrigger value="drafts" className="gap-2 px-4">
//               Drafts{" "}
//               {draftCount > 0 && (
//                 <Badge
//                   variant="secondary"
//                   className="px-1.5 py-0.5 h-5 text-[10px]"
//                 >
//                   {draftCount}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="active" className="gap-2 px-4">
//               Active{" "}
//               {activeCount > 0 && (
//                 <Badge
//                   variant="secondary"
//                   className="px-1.5 py-0.5 h-5 text-[10px]"
//                 >
//                   {activeCount}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="history" className="px-4">
//               History
//             </TabsTrigger>
//           </TabsList>

//           <div className="relative w-full md:w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search by title..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-9"
//             />
//           </div>
//         </div>

//         {/* --- RFQ GRID RENDERER --- */}
//         {["drafts", "active", "history"].map((tabValue) => (
//           <TabsContent key={tabValue} value={tabValue}>
//             <div className="grid gap-4 md:grid-cols-2">
//               {getFiltered(tabValue).length === 0 ? (
//                 <div className="md:col-span-2 text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
//                   <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
//                   <p className="text-muted-foreground">
//                     No {tabValue} found matching your criteria.
//                   </p>
//                 </div>
//               ) : (
//                 getFiltered(tabValue).map((rfq) => (
//                   <Card
//                     key={rfq.id}
//                     className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary group"
//                   >
//                     <CardContent className="p-6">
//                       <div className="space-y-4">
//                         <div className="flex justify-between items-start">
//                           <div className="space-y-1">
//                             <div className="flex items-center gap-2">
//                               <h3 className="text-lg font-semibold line-clamp-1">
//                                 {rfq.title}
//                               </h3>
//                               <Badge
//                                 className={getStatusColor(rfq.status)}
//                                 variant="outline"
//                               >
//                                 {rfq.status.charAt(0).toUpperCase() +
//                                   rfq.status.slice(1)}
//                               </Badge>
//                             </div>
//                             <p className="text-sm text-muted-foreground flex items-center gap-2">
//                               <Calendar className="h-3.5 w-3.5" /> Created:{" "}
//                               {formatDate(rfq.createdAt)}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4 py-2">
//                           <div className="space-y-1">
//                             <p className="text-xs text-muted-foreground uppercase font-semibold">
//                               Category
//                             </p>
//                             <div className="flex items-center gap-2">
//                               <Package className="h-4 w-4 text-slate-500" />
//                               <span
//                                 className="text-sm truncate max-w-[120px]"
//                                 title={rfq.category}
//                               >
//                                 {rfq.category}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="space-y-1">
//                             <p className="text-xs text-muted-foreground uppercase font-semibold">
//                               Scale
//                             </p>
//                             <div className="flex items-center gap-2">
//                               <Coins className="h-4 w-4 text-slate-500" />
//                               <span className="text-sm">
//                                 {rfq.itemCount} Items
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex gap-2 pt-2 border-t mt-2">
//                           <Link
//                             href={`/dashboard/hospital/rfq/${rfq.id}`}
//                             className="flex-1"
//                           >
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="w-full"
//                             >
//                               <Eye className="h-4 w-4 mr-2" /> View
//                             </Button>
//                           </Link>

//                           {/* Show 'Review & Publish' for Drafts */}
//                           {rfq.status === "draft" ? (
//                             <Link
//                               href={`/dashboard/hospital/rfq/${rfq.id}/review`}
//                               className="flex-1"
//                             >
//                               <Button
//                                 size="sm"
//                                 className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
//                               >
//                                 Review & Publish{" "}
//                                 <ChevronRight className="h-4 w-4 ml-1" />
//                               </Button>
//                             </Link>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="secondary"
//                               className="flex-1"
//                             >
//                               {rfq.quotationCount} Quotes Received
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))
//               )}
//             </div>
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Clock,
  Package,
  FileText,
  Eye,
  BarChart3,
  Plus,
  Calendar,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface HospitalRFQ {
  id: string;
  title: string;
  category: string;
  itemCount: number;
  status: string;
  quotationCount: number;
  deadline: string;
  createdAt: string;
  budget: string;
}

// Helpers
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function HospitalRFQPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<HospitalRFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    async function fetchRFQs() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("rfqs")
          .select(
            `
                        id, title, status, deadline, created_at, metadata,
                        quotations ( count ),
                        rfq_items ( item_name, quantity, estimated_price )
                    `,
          )
          .eq("created_by", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase Error:", error);
          setErrorMsg(error.message);
          return;
        }

        // Map Data with Fallbacks
        const formatted: HospitalRFQ[] = (data || []).map((item: any) => {
          // Check DB items first, then fallback to PDF Metadata
          const lineItems =
            item.rfq_items?.length > 0
              ? item.rfq_items
              : item.metadata?.line_items || [];

          const itemCount = lineItems.length;

          // Get Category
          const firstItemName =
            lineItems[0]?.item_name ||
            lineItems[0]?.inn_name ||
            "General Supply";

          // Calculate Budget (Handle missing prices gracefully)
          const totalBudget = lineItems.reduce(
            (acc: number, curr: any) =>
              acc + (curr.estimated_price || 0) * (curr.quantity || 0),
            0,
          );

          return {
            id: item.id,
            title: item.title,
            category: firstItemName,
            itemCount: itemCount,
            status: item.status,
            quotationCount: item.quotations?.[0]?.count || 0,
            deadline: item.deadline,
            createdAt: item.created_at,
            budget: totalBudget > 0 ? formatCurrency(totalBudget) : "TBD",
          };
        });

        setRfqs(formatted);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load RFQs");
      } finally {
        setLoading(false);
      }
    }
    fetchRFQs();
  }, []);

  // --- Stats Calculation ---
  const totalRFQs = rfqs.length;
  const activeCount = rfqs.filter(
    (r) => r.status === "published" || r.status === "active",
  ).length;
  const draftCount = rfqs.filter((r) => r.status === "draft").length;
  const totalQuotes = rfqs.reduce((acc, r) => acc + r.quotationCount, 0);

  // Average Quotations Calculation
  const avgQuotes = totalRFQs > 0 ? (totalQuotes / totalRFQs).toFixed(1) : "0";

  // --- Filtering ---
  const getFiltered = (statusTab: string) => {
    return rfqs.filter((r) => {
      const matchesSearch = r.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (statusTab === "drafts") return matchesSearch && r.status === "draft";
      if (statusTab === "active")
        return (
          matchesSearch && (r.status === "published" || r.status === "active")
        );
      if (statusTab === "history")
        return (
          matchesSearch && (r.status === "closed" || r.status === "awarded")
        );

      return false;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "published":
        return "bg-green-100 text-green-700 border-green-200";
      case "closed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "awarded":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My RFQs</h1>
          <p className="text-muted-foreground">
            Manage and track your procurement requests
          </p>
        </div>
        <Link href="/dashboard/hospital/rfq/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total RFQs
                </p>
                <p className="text-2xl font-bold mt-1">{totalRFQs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {activeCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Drafts
                </p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">
                  {draftCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Quotes
                </p>
                <p className="text-2xl font-bold mt-1">{avgQuotes}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & RFQ List */}
      <Tabs
        defaultValue={draftCount > 0 ? "drafts" : "active"}
        className="space-y-6"
      >
        {/* Tab Navigation & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="drafts" className="gap-2 px-4">
              Drafts{" "}
              {draftCount > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 h-5 text-[10px]"
                >
                  {draftCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2 px-4">
              Active{" "}
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 h-5 text-[10px]"
                >
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="px-4">
              History
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* --- RFQ GRID RENDERER --- */}
        {["drafts", "active", "history"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            <div className="grid gap-4 md:grid-cols-2">
              {getFiltered(tabValue).length === 0 ? (
                <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-lg bg-slate-50/50">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No {tabValue} found matching your criteria.
                  </p>
                </div>
              ) : (
                getFiltered(tabValue).map((rfq) => (
                  <Card
                    key={rfq.id}
                    className={`hover:shadow-lg transition-all border-l-4 ${rfq.status === "draft" ? "border-l-yellow-400" : "border-l-transparent hover:border-l-primary"}`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold line-clamp-1">
                                {rfq.title}
                              </h3>
                              <Badge
                                className={getStatusColor(rfq.status)}
                                variant="outline"
                              >
                                {rfq.status.charAt(0).toUpperCase() +
                                  rfq.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono text-xs text-slate-400">
                                ID: {rfq.id.slice(0, 8)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created: {formatDate(rfq.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <Badge
                                variant="outline"
                                className="font-normal text-slate-600 max-w-[150px] truncate"
                                title={rfq.category}
                              >
                                {rfq.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {rfq.itemCount} items
                              </span>
                              <span className="text-sm">
                                <span className="font-semibold text-primary">
                                  {rfq.quotationCount}
                                </span>{" "}
                                quotes
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm pt-2">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Deadline: {formatDate(rfq.deadline)}
                              </span>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Coins className="h-3.5 w-3.5" />
                                Est. Budget: {rfq.budget}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t mt-2">
                          <Link
                            href={`/dashboard/hospital/rfq/${rfq.id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>

                          {/* Action Button Logic */}
                          {rfq.status === "draft" ? (
                            <Link
                              href={`/dashboard/hospital/rfq/${rfq.id}/review`}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                              >
                                Review & Publish{" "}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              disabled={rfq.quotationCount === 0}
                            >
                              {rfq.quotationCount > 0
                                ? "Analyze Bids"
                                : "Awaiting Quotes"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
