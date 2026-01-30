"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  MapPin,
  Package,
  CheckCircle2,
  ArrowLeft,
  Filter,
  Users,
  Send,
  ChevronDown,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createClient } from "@/lib/supabase/client";

// Dynamically import map to avoid SSR issues
const EuropeMap = dynamic(
  () =>
    import("@/components/maps/europe-map").then((mod) => ({
      default: mod.EuropeMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

// Types matching DB + UI needs
interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  pastOrders: number;
  responseRate: number;
  certifications: string[];
  selected: boolean;
  includeOtherRequirements: string[]; // List of IDs of other items to include
}

interface RFQItem {
  id: string;
  item_name: string;
  specification: string;
  quantity: number;
  unit: string;
  brand?: string;
}

export default function RequirementVendorSelectionPage({
  params,
}: {
  params: Promise<{ id: string; requirementId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  // State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [certificationFilter, setCertificationFilter] =
    useState<string>("all_certifications");
  const [procurementMode, setProcurementMode] = useState<string>("balanced");
  const [requirementSelectorOpen, setRequirementSelectorOpen] = useState(false);
  const [previewVendorId, setPreviewVendorId] = useState<string | null>(null);
  const [collapsedVendors, setCollapsedVendors] = useState<Set<string>>(
    new Set(),
  );

  // Data State
  const [currentRequirement, setCurrentRequirement] = useState<RFQItem | null>(
    null,
  );
  const [allItems, setAllItems] = useState<RFQItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchData();
  }, [resolvedParams.id, resolvedParams.requirementId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // A. Fetch Current Requirement
      const { data: currentReq, error: reqError } = await supabase
        .from("rfq_items")
        .select("*")
        .eq("id", resolvedParams.requirementId)
        .single();

      if (reqError) throw reqError;
      setCurrentRequirement(currentReq);

      // B. Fetch All Items for this RFQ (for "Other Requirements" logic)
      const { data: rfqItems } = await supabase
        .from("rfq_items")
        .select("*")
        .eq("rfq_id", resolvedParams.id);

      setAllItems(rfqItems || []);

      // C. Fetch Vendors
      const { data: dbVendors, error: vendorError } = await supabase
        .from("vendors")
        .select("*");

      if (vendorError) throw vendorError;

      // D. Map DB Vendors to UI State
      const mappedVendors: Vendor[] = (dbVendors || []).map((v: any) => ({
        id: v.id,
        name: v.vendor_name,
        location: v.city || "Unknown", // Using City as location for now
        rating: 4.5, // Placeholder or fetch from reviews table
        pastOrders: Math.floor(Math.random() * 50), // Placeholder
        responseRate: 95, // Placeholder
        certifications: ["ISO 9001", "WHO-GMP"], // Placeholder or v.certifications
        selected: false,
        includeOtherRequirements: [],
      }));

      setVendors(mappedVendors);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Logic Helpers ---

  const getVendorCountsByCountry = () => {
    const counts: { [key: string]: number } = {};
    vendors.forEach((vendor) => {
      // Simple mapping logic: Assuming 'location' field is a city, usually mapped to country in a real app
      // For now, we count by the string value
      counts[vendor.location] = (counts[vendor.location] || 0) + 1;
    });
    return counts;
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  const toggleVendor = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, selected: !v.selected } : v,
      ),
    );
  };

  const toggleOtherRequirement = (vendorId: string, reqId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const isIncluded = v.includeOtherRequirements.includes(reqId);
          return {
            ...v,
            includeOtherRequirements: isIncluded
              ? v.includeOtherRequirements.filter((id) => id !== reqId)
              : [...v.includeOtherRequirements, reqId],
          };
        }
        return v;
      }),
    );
  };

  const toggleAllOtherRequirements = (vendorId: string) => {
    const otherItems = allItems.filter((i) => i.id !== currentRequirement?.id);
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const allSelected = otherItems.every((i) =>
            v.includeOtherRequirements.includes(i.id),
          );
          return {
            ...v,
            includeOtherRequirements: allSelected
              ? []
              : otherItems.map((i) => i.id),
          };
        }
        return v;
      }),
    );
  };

  const toggleCollapsed = (vendorId: string) => {
    setCollapsedVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) newSet.delete(vendorId);
      else newSet.add(vendorId);
      return newSet;
    });
  };

  const selectAllVendors = () => {
    const allSelected = filteredVendors.every((v) => v.selected);
    setVendors((prev) =>
      prev.map((v) => {
        if (filteredVendors.find((fv) => fv.id === v.id)) {
          return { ...v, selected: !allSelected };
        }
        return v;
      }),
    );
  };

  // --- 3. Filtering ---
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // Note: Real country filtering would need a City->Country map or a country column in DB
    const matchesCountry =
      selectedCountries.length === 0 ||
      selectedCountries.includes(vendor.location);
    const matchesCertification =
      certificationFilter === "all_certifications" ||
      vendor.certifications.some(
        (c) => c.toLowerCase().replace(/\s/g, "_") === certificationFilter,
      );

    return matchesSearch && matchesCountry && matchesCertification;
  });

  const selectedVendorsCount = vendors.filter((v) => v.selected).length;

  // --- 4. Actions ---
  const handleChangeRequirement = (newReqId: string) => {
    router.push(
      `/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${newReqId}`,
    );
    setRequirementSelectorOpen(false);
  };

  const handleSendRFQ = async () => {
    setSending(true);
    const selected = vendors.filter((v) => v.selected);

    // Simulate API call to invite vendors
    // In a real app: await supabase.from('rfq_invitations').insert(...)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log(
      "Inviting vendors:",
      selected.map((v) => v.name),
    );

    // Determine Next Step
    const currentIndex = allItems.findIndex(
      (i) => i.id === resolvedParams.requirementId,
    );

    if (currentIndex < allItems.length - 1) {
      // Go to next requirement
      const nextId = allItems[currentIndex + 1].id;
      router.push(
        `/dashboard/hospital/rfq/${resolvedParams.id}/vendors/${nextId}`,
      );
    } else {
      // Done -> Go to Awaiting Responses
      router.push(`/dashboard/hospital/rfq/${resolvedParams.id}`);
    }
    setSending(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  if (!currentRequirement)
    return <div className="p-12 text-center">Requirement not found</div>;

  // Filter out current requirement from the list of "Other" requirements
  const otherRequirements = allItems.filter(
    (i) => i.id !== currentRequirement.id,
  );

  const vendorCounts = getVendorCountsByCountry();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Select Vendors</h1>
          <p className="text-muted-foreground">
            Choose vendors for this specific requirement
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Column: Selection Area */}
        <div className="flex-1 space-y-6">
          {/* Requirement Selector */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Current Requirement
              </Label>
              <Popover
                open={requirementSelectorOpen}
                onOpenChange={setRequirementSelectorOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">
                          {currentRequirement.item_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currentRequirement.specification} •{" "}
                          {currentRequirement.quantity}{" "}
                          {currentRequirement.unit}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search requirements..." />
                    <CommandList>
                      <CommandEmpty>No requirement found.</CommandEmpty>
                      <CommandGroup>
                        {allItems.map((req) => (
                          <CommandItem
                            key={req.id}
                            value={req.item_name}
                            onSelect={() => handleChangeRequirement(req.id)}
                            className="py-3"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium">{req.item_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {req.specification}
                                </p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Map Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Locations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EuropeMap
                selectedCountries={selectedCountries}
                onCountrySelect={handleCountrySelect}
                vendorCounts={vendorCounts}
              />
              {selectedCountries.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    Filtered:
                  </span>
                  {selectedCountries.map((country) => (
                    <Badge key={country} variant="secondary" className="gap-1">
                      {country}
                      <button
                        onClick={() => handleCountrySelect(country)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCountries([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters & List */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={selectAllVendors}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              {filteredVendors.every((v) => v.selected) &&
              filteredVendors.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          {/* Vendors List */}
          <div className="space-y-3">
            {filteredVendors.map((vendor) => {
              const isCollapsed = collapsedVendors.has(vendor.id);
              const selectedCount = vendor.includeOtherRequirements.length;

              return (
                <Card
                  key={vendor.id}
                  className={`transition-all ${vendor.selected ? "border-primary bg-blue-50/30" : "hover:border-blue-300"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={vendor.selected}
                        onCheckedChange={() => toggleVendor(vendor.id)}
                        className="mt-1 h-5 w-5"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {vendor.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{" "}
                                {vendor.rating}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {vendor.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />{" "}
                                {vendor.pastOrders} orders
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              vendor.responseRate >= 90
                                ? "default"
                                : "secondary"
                            }
                          >
                            {vendor.responseRate}% response
                          </Badge>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {vendor.certifications.map((cert) => (
                            <Badge
                              key={cert}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />{" "}
                              {cert}
                            </Badge>
                          ))}
                        </div>

                        {/* Other Requirements Collapsible */}
                        {otherRequirements.length > 0 && (
                          <Collapsible
                            open={!isCollapsed}
                            onOpenChange={() => toggleCollapsed(vendor.id)}
                            className="mt-4"
                          >
                            <div className="bg-white border rounded-md">
                              <CollapsibleTrigger asChild>
                                <button className="w-full p-2 px-3 flex items-center justify-between hover:bg-slate-50 rounded-t-md text-xs font-medium text-slate-600">
                                  <span>
                                    Can also fulfill: {otherRequirements.length}{" "}
                                    other items
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {selectedCount > 0 && (
                                      <Badge className="h-5 px-1.5">
                                        {selectedCount} added
                                      </Badge>
                                    )}
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${!isCollapsed ? "rotate-180" : ""}`}
                                    />
                                  </div>
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 pt-0 border-t bg-slate-50/50">
                                  <div className="flex items-center gap-2 py-2 mb-1">
                                    <Checkbox
                                      id={`all-${vendor.id}`}
                                      checked={
                                        otherRequirements.length > 0 &&
                                        vendor.includeOtherRequirements
                                          .length === otherRequirements.length
                                      }
                                      onCheckedChange={() =>
                                        toggleAllOtherRequirements(vendor.id)
                                      }
                                    />
                                    <label
                                      htmlFor={`all-${vendor.id}`}
                                      className="text-xs font-semibold cursor-pointer"
                                    >
                                      Select All Other Items
                                    </label>
                                  </div>
                                  <div className="space-y-2">
                                    {otherRequirements.map((req) => (
                                      <div
                                        key={req.id}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          id={`req-${vendor.id}-${req.id}`}
                                          checked={vendor.includeOtherRequirements.includes(
                                            req.id,
                                          )}
                                          onCheckedChange={() =>
                                            toggleOtherRequirement(
                                              vendor.id,
                                              req.id,
                                            )
                                          }
                                        />
                                        <label
                                          htmlFor={`req-${vendor.id}-${req.id}`}
                                          className="text-xs cursor-pointer truncate flex-1"
                                        >
                                          {req.item_name}{" "}
                                          <span className="text-slate-400">
                                            ({req.quantity} {req.unit})
                                          </span>
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Summary Sticky */}
        <div className="w-80 shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>RFQ Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Current Item
                </Label>
                <p className="font-medium text-slate-900">
                  {currentRequirement.item_name}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Selected Vendors
                </Label>
                <p className="text-4xl font-bold text-primary mt-1">
                  {selectedVendorsCount}
                </p>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2 block">
                  Procurement Strategy
                </Label>
                <Select
                  value={procurementMode}
                  onValueChange={setProcurementMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="emergency">Emergency (Speed)</SelectItem>
                    <SelectItem value="cost">Cost Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendRFQ}
                disabled={selectedVendorsCount === 0 || sending}
                className="w-full gap-2"
                size="lg"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send to {selectedVendorsCount} Vendor
                {selectedVendorsCount !== 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
