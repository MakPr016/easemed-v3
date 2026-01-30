"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DollarSign,
  Target,
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export default function VendorDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState(""); // State for dynamic name

  // State for all dashboard metrics
  const [stats, setStats] = useState({
    revenue: 0,
    activeBidsCount: 0,
    winRate: 0,
    newOpportunities: 0,
  });

  // State for lists
  const [activeBidsList, setActiveBidsList] = useState<any[]>([]);
  const [opportunitiesList, setOpportunitiesList] = useState<any[]>([]);
  const [bidPerformance, setBidPerformance] = useState({
    won: 0,
    pending: 0,
    lost: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Get Current User
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Get Vendor Profile (Updated to fetch vendor_name)
        const { data: vendor } = await supabase
          .from("vendors")
          .select("id, vendor_name")
          .eq("user_id", user.id)
          .single();

        if (!vendor) return;

        // Set the name for the UI
        setVendorName(vendor.vendor_name || "Vendor");

        // 3. Fetch Financials (Revenue)
        const { data: orders } = await supabase
          .from("purchase_orders")
          .select("total_amount")
          .eq("vendor_id", vendor.id);

        const revenue =
          orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) ||
          0;

        // 4. Fetch Quotations (Bids)
        const { data: quotes } = await supabase
          .from("quotations")
          .select(
            `
            id,
            total_amount,
            status,
            rfqs ( title )
          `,
          )
          .eq("vendor_id", vendor.id);

        // Calculate Bid Stats
        const won = quotes?.filter((q) => q.status === "awarded").length || 0;
        const pending =
          quotes?.filter((q) => q.status === "pending").length || 0;
        const lost = quotes?.filter((q) => q.status === "rejected").length || 0;
        const totalBids = quotes?.length || 0;
        const winRate = totalBids > 0 ? Math.round((won / totalBids) * 100) : 0;

        setBidPerformance({ won, pending, lost });
        setActiveBidsList(quotes?.filter((q) => q.status === "pending") || []);

        // 5. Fetch New Opportunities (RFQs)
        const { data: rfqs, count: rfqCount } = await supabase
          .from("rfqs")
          .select(
            "id, title, status, deadline, hospital:hospitals(hospital_name)",
          )
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5);

        setOpportunitiesList(rfqs || []);

        // Update Main Stats
        setStats({
          revenue,
          activeBidsCount: pending,
          winRate,
          newOpportunities: rfqCount || 0,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Dynamic Vendor Name */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>Welcome, {vendorName}</span>
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">Here's your business overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Last 30 days</Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bids
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeBidsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeBidsCount} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on{" "}
              {bidPerformance.won +
                bidPerformance.lost +
                bidPerformance.pending}{" "}
              total bids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Opportunities
            </CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">Available now</span> in
              marketplace
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bid Performance & Revenue Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Simple Bid Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Performance</CardTitle>
            <CardDescription>Success rate breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {bidPerformance.won}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Won</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-yellow-50">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {bidPerformance.pending}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pending
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-red-50">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {bidPerformance.lost}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Lost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Active Bids Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Bids</CardTitle>
            <CardDescription>Bids currently under review</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ Title</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeBidsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No active bids
                    </TableCell>
                  </TableRow>
                ) : (
                  activeBidsList.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium text-xs">
                        {bid.rfqs?.title}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(bid.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          {bid.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* New RFQ Opportunities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New RFQ Opportunities</CardTitle>
            <Button variant="link" className="text-blue-600">
              View all
            </Button>
          </div>
          <CardDescription>
            Latest procurement requests from hospitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">HOSPITAL</TableHead>
                <TableHead className="text-xs">TITLE</TableHead>
                <TableHead className="text-xs text-center">DEADLINE</TableHead>
                <TableHead className="text-xs text-center">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunitiesList.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="font-medium text-xs">
                    {rfq.hospital?.hospital_name}
                  </TableCell>
                  <TableCell className="text-xs">{rfq.title}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/dashboard/vendor/rfq/${rfq.id}`}>
                      <Button size="sm" className="h-7 text-xs">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
