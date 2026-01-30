"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the Order interface
interface Order {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorName: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

// Helpers
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Main Page Component
export default function HospitalOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    async function fetchOrders() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Awarded Quotations
        // NOTE: 'status' must match the database value exactly ('awarded')
        const { data, error } = await supabase
          .from("quotations")
          .select(
            `
                        id,
                        created_at,
                        total_amount,
                        delivery_time_days,
                        status,
                        rfqs!inner ( id, title, created_by ),
                        vendors ( vendor_name )
                    `,
          )
          .eq("rfqs.created_by", user.id)
          .eq("status", "awarded")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // 2. Map Data
        const mappedOrders: Order[] = (data || []).map((quote: any) => {
          const orderDate = new Date(quote.created_at);
          const deliveryDate = new Date(orderDate);
          deliveryDate.setDate(
            orderDate.getDate() + (quote.delivery_time_days || 14),
          );

          return {
            id: quote.id,
            rfqId: quote.rfqs?.id || "Unknown",
            rfqTitle: quote.rfqs?.title || "Unknown RFQ",
            vendorName: quote.vendors?.vendor_name || "Vendor Profile Hidden",
            orderDate: quote.created_at,
            deliveryDate: deliveryDate.toISOString(),
            totalAmount: quote.total_amount,
            status: quote.status,
            paymentStatus: "pending",
          };
        });

        setOrders(mappedOrders);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // UI Config Helper
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "awarded": // Map 'awarded' to Confirmed UI
      case "confirmed":
        return {
          label: "Confirmed",
          color: "bg-blue-100 text-blue-800",
          icon: CheckCircle2,
        };
      case "in_transit":
        return {
          label: "In Transit",
          color: "bg-purple-100 text-purple-800",
          icon: Truck,
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "bg-green-100 text-green-800",
          icon: Package,
        };
      default:
        return { label: status, color: "bg-slate-100", icon: FileText };
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your awarded contracts
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
              <p className="text-3xl font-bold mt-1">{orders.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500 opacity-50" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Confirmed
              </p>
              <p className="text-3xl font-bold mt-1 text-green-600">
                {orders.filter((o) => o.status === "awarded").length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Order List</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="awarded">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>RFQ</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No awarded orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const { color, icon: Icon } = getStatusConfig(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        PO-{order.id.slice(0, 6)}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {order.rfqTitle}
                      </TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${color} gap-1`}>
                          <Icon className="h-3 w-3" />{" "}
                          {order.status === "awarded"
                            ? "Confirmed"
                            : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/hospital/rfq/${order.rfqId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
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
  );
}
