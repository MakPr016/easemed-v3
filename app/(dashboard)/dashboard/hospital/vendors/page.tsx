"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  Star,
  MapPin,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  AlertCircle,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner"; // Ensure you have a toast library or remove this

// Types
interface Vendor {
  id: string;
  vendor_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  country: string;
  vendor_type: string;
  rating: number;
  status: "verified" | "pending" | "blocked" | "rejected";
  total_orders: number;
  created_at: string;
}

export default function VendorManagementPage() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-select 'pending' tab if there are pending vendors, otherwise 'all'
  const [activeTab, setActiveTab] = useState("all");

  // --- 1. Fetch Vendors ---
  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVendors(data || []);

      // If there are pending vendors, default view to them
      const hasPending = data?.some((v: any) => v.status === "pending");
      if (hasPending) setActiveTab("pending");
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- 2. Approve / Reject Logic ---
  const updateVendorStatus = async (
    vendorId: string,
    newStatus: "verified" | "rejected" | "blocked",
  ) => {
    setProcessing(vendorId);
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ status: newStatus })
        .eq("id", vendorId);

      if (error) throw error;

      // Update local state immediately for snappy UI
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v)),
      );

      // Show success message (console or toast)
      console.log(`Vendor ${newStatus} successfully`);
    } catch (error) {
      console.error(`Error updating vendor to ${newStatus}:`, error);
      alert("Failed to update status");
    } finally {
      setProcessing(null);
    }
  };

  // --- 3. Filtering ---
  const getFilteredVendors = (tab: string) => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (tab === "pending") matchesStatus = v.status === "pending";
      if (tab === "verified") matchesStatus = v.status === "verified";

      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Pending Approval
          </Badge>
        );
      case "blocked":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            Blocked
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-200">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  // Stats
  const pendingCount = vendors.filter((v) => v.status === "pending").length;
  const verifiedCount = vendors.filter((v) => v.status === "verified").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vendor Management
          </h1>
          <p className="text-slate-500">
            Approve new registrations and manage supplier relationships.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" /> Invite New Vendor
        </Button>
      </div>

      {/* Pending Alert Banner (Only if there are pending approvals) */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">Action Required</h4>
              <p className="text-sm text-yellow-700">
                You have {pendingCount} new vendor applications waiting for
                approval.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            onClick={() => setActiveTab("pending")}
          >
            Review Applications
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All Vendors</TabsTrigger>
                <TabsTrigger value="verified">
                  Verified ({verifiedCount})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  {pendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-yellow-200 text-yellow-800 hover:bg-yellow-200"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <div className="col-span-4">Company Details</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <div className="divide-y">
              {getFilteredVendors(activeTab).length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                    <Filter className="h-6 w-6 text-slate-400" />
                  </div>
                  <p>No vendors found in this category.</p>
                </div>
              ) : (
                getFilteredVendors(activeTab).map((vendor) => (
                  <div
                    key={vendor.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Vendor Name & Email */}
                    <div className="col-span-4 flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-blue-100 border border-blue-200">
                        <AvatarFallback className="text-blue-700 font-medium text-xs">
                          {vendor.vendor_name?.substring(0, 2).toUpperCase() ||
                            "VN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-medium text-slate-900 truncate">
                          {vendor.vendor_name}
                        </p>
                        <div className="flex flex-col text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {vendor.contact_email}
                          </span>
                          {vendor.contact_phone && (
                            <span className="flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />{" "}
                              {vendor.contact_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2 text-sm text-slate-600">
                      <Badge
                        variant="secondary"
                        className="font-normal capitalize"
                      >
                        {vendor.vendor_type || "General"}
                      </Badge>
                    </div>

                    {/* Location */}
                    <div className="col-span-2 text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">
                        {vendor.city || "N/A"}, {vendor.country}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      {getStatusBadge(vendor.status)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {vendor.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            onClick={() =>
                              updateVendorStatus(vendor.id, "rejected")
                            }
                            disabled={processing === vendor.id}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 gap-1"
                            onClick={() =>
                              updateVendorStatus(vendor.id, "verified")
                            }
                            disabled={processing === vendor.id}
                          >
                            {processing === vendor.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </Button>
                        </>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Order History</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {vendor.status === "blocked" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateVendorStatus(vendor.id, "verified")
                                }
                              >
                                Unblock Vendor
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  updateVendorStatus(vendor.id, "blocked")
                                }
                              >
                                Block Vendor
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
