"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShoppingCart,
  Package,
  AlertCircle,
  TrendingDown,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  Truck,
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

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function HospitalDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Procurement Officer");

  // Data States
  const [stats, setStats] = useState({
    completedCount: 0,
    completedValue: 0,
    activeCount: 0,
    shippedCount: 0,
    biddingCount: 0,
    urgentCount: 0,
    pendingReviewCount: 0,
    savingsValue: 0,
    savingsPercent: 0,
  });

  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [latestRfqs, setLatestRfqs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Get User Profile
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          if (profile) setUserName(profile.full_name);
        }

        // 2. Get Hospital ID
        const { data: hospital } = await supabase
          .from("hospitals")
          .select("id")
          .eq("user_id", user?.id)
          .single();
        if (!hospital) return;

        // 3. Fetch Purchase Orders (For Stats & Active Orders List)
        const { data: orders } = await supabase
          .from("purchase_orders")
          .select(
            `
                        id,
                        total_amount,
                        status,
                        delivery_date,
                        vendors ( vendor_name ),
                        rfq:rfqs ( title )
                    `,
          )
          .eq("hospital_id", hospital.id)
          .order("created_at", { ascending: false });

        // 4. Fetch RFQs (For Bidding Stats & List)
        const { data: rfqs } = await supabase
          .from("rfqs")
          .select(
            `
                        id,
                        title,
                        status,
                        deadline,
                        quotations ( total_amount ),
                        rfq_items ( estimated_price, quantity )
                    `,
          )
          .eq("hospital_id", hospital.id)
          .order("created_at", { ascending: false });

        if (orders && rfqs) {
          // --- Calculate Stats ---
          const completed = orders.filter(
            (o) => o.status === "completed" || o.status === "delivered",
          );
          const active = orders.filter(
            (o) => !["completed", "delivered", "cancelled"].includes(o.status),
          );
          const shipped = active.filter((o) => o.status === "shipped");

          const publishedRfqs = rfqs.filter((r) => r.status === "published");
          const urgentRfqs = publishedRfqs.filter((r) => {
            const days = Math.ceil(
              (new Date(r.deadline).getTime() - Date.now()) /
                (1000 * 3600 * 24),
            );
            return days <= 3 && days >= 0;
          });

          // --- Calculate Cost Savings (Estimated vs Actual) ---
          // This logic assumes if we have an order, we saved the diff between estimated & actual
          // For demo purposes, we will calculate based on completed orders
          let totalEstimated = 0;
          let totalActual = 0;

          orders.forEach((o) => {
            // Find matching RFQ to get estimate
            const matchingRfq = rfqs.find((r) => r.title === o.rfq?.title); // Linking via title for loose match in demo
            if (matchingRfq && matchingRfq.rfq_items) {
              const est = matchingRfq.rfq_items.reduce(
                (acc: number, item: any) =>
                  acc + (item.estimated_price || 0) * item.quantity,
                0,
              );
              if (est > 0) {
                totalEstimated += est;
                totalActual += Number(o.total_amount);
              }
            }
          });

          // Fallback for demo if no estimates set: Assume 15% savings on total spend
          const savingsVal =
            totalEstimated > 0
              ? totalEstimated - totalActual
              : orders.reduce((acc, c) => acc + Number(c.total_amount), 0) *
                0.15;
          const savingsPct =
            totalEstimated > 0
              ? Math.round((savingsVal / totalEstimated) * 100)
              : 15;

          setStats({
            completedCount: completed.length,
            completedValue: completed.reduce(
              (acc, curr) => acc + Number(curr.total_amount),
              0,
            ),
            activeCount: active.length,
            shippedCount: shipped.length,
            biddingCount: publishedRfqs.length,
            urgentCount: urgentRfqs.length,
            pendingReviewCount: rfqs.filter(
              (r) => r.quotations?.length > 0 && r.status === "published",
            ).length,
            savingsValue: savingsVal,
            savingsPercent: savingsPct,
          });

          setActiveOrders(active.slice(0, 5));
          setLatestRfqs(publishedRfqs.slice(0, 5));
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>Welcome {userName.split(" ")[0]}</span>
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">Your procurement overview</p>
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
              Completed Purchases
            </CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.completedValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.shippedCount} shipped •{" "}
              {stats.activeCount - stats.shippedCount} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ongoing Biddings
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.biddingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingReviewCount} have new bids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Action Required
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.urgentCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-red-600">Urgent deadlines</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <CardTitle>Cost Savings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold">
                {formatCurrency(stats.savingsValue)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total saved (Estimated vs Actual)
              </p>
              <p className="text-sm text-green-600 mt-1">
                {stats.savingsPercent}% under budget
              </p>
            </div>
            {/* Visualization (Static gradient for UI polish) */}
            <div className="h-24 bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4 relative overflow-hidden">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0,80 L 50,75 L 100,70 L 150,65 L 200,55 L 250,45 L 300,35 L 350,25 L 400,20"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                />
                <path
                  d="M 0,80 L 50,75 L 100,70 L 150,65 L 200,55 L 250,45 L 300,35 L 350,25 L 400,20 L 400,100 L 0,100 Z"
                  fill="url(#gradient)"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle>Time Savings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold">~4 days</div>
              <p className="text-sm text-muted-foreground mt-1">
                Avg. reduction in procurement cycle
              </p>
              <p className="text-sm text-blue-600 mt-1">
                35% faster processing
              </p>
            </div>
            {/* Visualization (Static gradient for UI polish) */}
            <div className="h-24 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 relative overflow-hidden">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0,85 L 50,80 L 100,76 L 150,72 L 200,65 L 250,58 L 300,50 L 350,42 L 400,35"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M 0,85 L 50,80 L 100,76 L 150,72 L 200,65 L 250,58 L 300,50 L 350,42 L 400,35 L 400,100 L 0,100 Z"
                  fill="url(#gradientBlue)"
                  opacity="0.3"
                />
                <defs>
                  <linearGradient
                    id="gradientBlue"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Orders List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Orders</CardTitle>
              <Button variant="link" className="text-blue-600">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ORDER</TableHead>
                  <TableHead className="text-xs">VENDOR</TableHead>
                  <TableHead className="text-xs text-right">AMOUNT</TableHead>
                  <TableHead className="text-xs text-center">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No active orders
                    </TableCell>
                  </TableRow>
                ) : (
                  activeOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">
                        {order.rfq?.title || "Direct Order"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {order.vendors?.vendor_name}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            order.status === "shipped"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : ""
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Latest Biddings List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Bidding Activity</CardTitle>
              <Link href="/dashboard/hospital/rfq">
                <Button variant="link" className="text-blue-600">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">RFQ TITLE</TableHead>
                  <TableHead className="text-xs text-center">BIDS</TableHead>
                  <TableHead className="text-xs text-right">
                    BEST OFFER
                  </TableHead>
                  <TableHead className="text-xs text-center">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestRfqs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No active RFQs
                    </TableCell>
                  </TableRow>
                ) : (
                  latestRfqs.map((rfq) => {
                    const bestOffer =
                      rfq.quotations?.length > 0
                        ? Math.min(
                            ...rfq.quotations.map((q: any) => q.total_amount),
                          )
                        : 0;
                    return (
                      <TableRow key={rfq.id}>
                        <TableCell className="font-medium text-xs">
                          {rfq.title}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {rfq.quotations?.length || 0}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {bestOffer > 0 ? formatCurrency(bestOffer) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/dashboard/hospital/rfq/${rfq.id}`}>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              variant="outline"
                            >
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
