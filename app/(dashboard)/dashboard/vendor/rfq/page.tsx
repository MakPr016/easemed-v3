"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  AlertCircle,
  Star,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Type definition matching the exact shape of our DB response
type EnrichedRFQ = {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  created_at: string;
  hospital: {
    hospital_name: string;
    city: string;
  };
  // We fetch the first item name to use as a "Tag" since we don't have a category column
  primaryItem: string;
  itemCount: number;
  competitorCount: number;
  urgency: "urgent" | "moderate" | "low";
};

export default function VendorRFQsPage() {
  const supabase = createClient();
  const [rfqs, setRfqs] = useState<EnrichedRFQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  useEffect(() => {
    const fetchRfqs = async () => {
      // 1. Fetch RFQs with deep relations
      // We get the first rfq_item to display as the "Category/Type"
      const { data, error } = await supabase
        .from("rfqs")
        .select(
          `
                    *,
                    hospital:hospitals ( hospital_name, city ),
                    rfq_items ( item_name ),
                    quotations ( count )
                `,
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching RFQs:", error);
        setLoading(false);
        return;
      }

      // 2. Transform DB data into UI-ready format
      const formatted: EnrichedRFQ[] = data.map((item: any) => {
        // Calculate Urgency dynamically based on real deadline
        const daysUntilDeadline = Math.ceil(
          (new Date(item.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );

        let urgency: "urgent" | "moderate" | "low" = "low";
        if (daysUntilDeadline <= 3) urgency = "urgent";
        else if (daysUntilDeadline <= 7) urgency = "moderate";

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          deadline: item.deadline,
          created_at: item.created_at,
          hospital: item.hospitals,
          // Use the real first item name (e.g., "MRI Machine") or fallback
          primaryItem: item.rfq_items?.[0]?.item_name || "General Supply",
          itemCount: item.rfq_items?.length || 0,
          competitorCount: item.quotations?.[0]?.count || 0,
          urgency,
        };
      });

      setRfqs(formatted);
      setLoading(false);
    };

    fetchRfqs();
  }, []);

  // Client-side Filtering Logic
  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearch =
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.hospital?.hospital_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      rfq.primaryItem.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrgency =
      urgencyFilter === "all" || rfq.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  // Dynamic Stats Calculation (Real-time math)
  const totalBids = rfqs.reduce((acc, curr) => acc + curr.competitorCount, 0);
  const stats = {
    total: rfqs.length,
    urgent: rfqs.filter((r) => r.urgency === "urgent").length,
    // Calculate average competitors per RFQ
    avgCompetitors: rfqs.length > 0 ? Math.round(totalBids / rfqs.length) : 0,
    // Calculate market activity based on bid volume
    activityLevel:
      totalBids > rfqs.length * 2 ? "High" : totalBids > 0 ? "Moderate" : "Low",
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available RFQs</h1>
          <p className="text-muted-foreground">
            Browse and bid on procurement opportunities
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> Filters
        </Button>
      </div>

      {/* Live Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total RFQs
                </p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Urgent
                </p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {stats.urgent}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Market Activity
                </p>
                <p className="text-2xl font-bold mt-1">{stats.activityLevel}</p>
              </div>
              <TrendingUp
                className={`h-8 w-8 opacity-70 ${stats.activityLevel === "High" ? "text-green-500" : "text-yellow-500"}`}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Competitors
                </p>
                <p className="text-2xl font-bold mt-1">
                  {stats.avgCompetitors}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, hospital, or item type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* RFQ Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRFQs.map((rfq) => (
          <Card
            key={rfq.id}
            className="hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-primary group"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold flex-1 group-hover:text-primary transition-colors">
                      {rfq.title}
                    </h3>
                    <Badge className={getUrgencyColor(rfq.urgency)}>
                      Due {new Date(rfq.deadline).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {rfq.description || "No detailed description provided."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{rfq.hospital?.city || "Unknown Location"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {/* Display the real Item Count */}
                    <span>{rfq.itemCount} line items</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Posted {new Date(rfq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-4">
                  <div className="flex items-center gap-3">
                    {/* Dynamic Tag based on the actual requested item */}
                    <Badge variant="outline" className="bg-secondary/50">
                      {rfq.primaryItem}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {rfq.competitorCount} bids
                    </span>
                  </div>
                  <Link href={`/dashboard/vendor/rfq/${rfq.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRFQs.length === 0 && (
          <div className="col-span-2 text-center py-12 border rounded-lg bg-muted/20 border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active RFQs found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or urgency filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
