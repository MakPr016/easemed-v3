"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileJson, Download, FileText, Truck, UserCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface JsonTemplateEditorProps {
  initialTemplate: any;
  fileName: string;
}

export function JsonTemplateEditor({
  initialTemplate,
  fileName,
}: JsonTemplateEditorProps) {
  const [template, setTemplate] = useState(initialTemplate);
  const [open, setOpen] = useState(false);

  // Sync state if props change (e.g., data finishes loading)
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  // Generic handler for top-level sections (header, vendor, logistics)
  const handleSectionChange = (
    section: string,
    field: string,
    value: string,
  ) => {
    setTemplate((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Toggle inclusion of a specific line item
  const toggleLineItem = (index: number, checked: boolean) => {
    setTemplate((prev: any) => {
      const newItems = [...prev.line_items];
      // We use a temporary property '_selected' to track UI state
      newItems[index] = { ...newItems[index], _selected: checked };
      return { ...prev, line_items: newItems };
    });
  };

  // Handle changes for specific line item fields (including nested offer_details)
  const handleLineItemChange = (
    index: number,
    fieldPath: string,
    value: any,
  ) => {
    setTemplate((prev: any) => {
      const newItems = [...prev.line_items];
      const item = { ...newItems[index] };

      if (fieldPath.includes(".")) {
        const [parent, child] = fieldPath.split(".");
        item[parent] = {
          ...item[parent],
          [child]: value,
        };
      } else {
        item[fieldPath] = value;
      }

      newItems[index] = item;
      return { ...prev, line_items: newItems };
    });
  };

  const handleDownload = () => {
    // 1. Filter out items that were unchecked
    // 2. Remove the temporary '_selected' property from the final JSON
    const cleanLineItems = template.line_items
      .filter((item: any) => item._selected !== false) // Default to true if undefined
      .map((item: any) => {
        const { _selected, ...rest } = item;
        return rest;
      });

    const finalJson = {
      ...template,
      line_items: cleanLineItems,
    };

    // Generate and trigger download
    const blob = new Blob([JSON.stringify(finalJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setOpen(false);
  };

  if (!template) return null;

  const selectedCount =
    template.line_items?.filter((i: any) => i._selected !== false).length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileJson className="h-4 w-4 text-blue-600" />
          Edit & Download JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50/50">
        <DialogHeader className="p-6 pb-4 bg-white border-b">
          <DialogTitle>Prepare Quotation JSON</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* Section 1: Header Details */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-slate-500 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Quote Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="space-y-2">
                  <Label>Quote Reference ID</Label>
                  <Input
                    value={template.quote_header?.quote_reference || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "quote_header",
                        "quote_reference",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Q-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validity (Days)</Label>
                  <Input
                    type="number"
                    value={template.quote_header?.validity_period_days || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "quote_header",
                        "validity_period_days",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input
                    value={template.quote_header?.payment_terms || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "quote_header",
                        "payment_terms",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={template.quote_header?.currency || "USD"}
                    onChange={(e) =>
                      handleSectionChange(
                        "quote_header",
                        "currency",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Vendor Profile */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-slate-500 flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Vendor Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={template.vendor_profile?.company_name || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "vendor_profile",
                        "company_name",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={template.vendor_profile?.contact_person || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "vendor_profile",
                        "contact_person",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={template.vendor_profile?.email || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "vendor_profile",
                        "email",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={template.vendor_profile?.phone || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "vendor_profile",
                        "phone",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Logistics */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-slate-500 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Logistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="space-y-2">
                  <Label>Lead Time (Days)</Label>
                  <Input
                    type="number"
                    value={template.logistics_estimate?.lead_time_days || ""}
                    onChange={(e) =>
                      handleSectionChange(
                        "logistics_estimate",
                        "lead_time_days",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Weight (kg)</Label>
                  <Input
                    type="number"
                    value={
                      template.logistics_estimate?.total_estimated_weight_kg ||
                      ""
                    }
                    onChange={(e) =>
                      handleSectionChange(
                        "logistics_estimate",
                        "total_estimated_weight_kg",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Volume (m³)</Label>
                  <Input
                    type="number"
                    value={
                      template.logistics_estimate?.total_estimated_volume_m3 ||
                      ""
                    }
                    onChange={(e) =>
                      handleSectionChange(
                        "logistics_estimate",
                        "total_estimated_volume_m3",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Line Items */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-slate-500 flex items-center gap-2">
                  <FileJson className="h-4 w-4" /> Line Items
                </h3>
                <Badge variant="secondary" className="font-normal">
                  {selectedCount} Items Selected
                </Badge>
              </div>

              <Accordion type="multiple" className="w-full space-y-2">
                {template.line_items?.map((item: any, index: number) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg bg-white px-2 data-[state=open]:ring-1 data-[state=open]:ring-blue-500/20"
                  >
                    <div className="flex items-center gap-3 py-3 pr-2">
                      <Checkbox
                        checked={item._selected !== false}
                        onCheckedChange={(checked) =>
                          toggleLineItem(index, checked as boolean)
                        }
                        className="ml-2"
                      />
                      <AccordionTrigger className="hover:no-underline py-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full pr-4 gap-2 text-left">
                          <span className="font-medium text-sm">
                            {index + 1}. {item.rfq_description}
                          </span>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Req: {item.requested_qty} {item.unit_of_measure}
                            </span>
                            {item.offer_details?.unit_price > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                {template.quote_header?.currency}{" "}
                                {item.offer_details.unit_price}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent className="pt-2 pb-4 pl-10 pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Offered Product Name
                          </Label>
                          <Input
                            className="h-8"
                            value={item.offer_details?.offered_product || ""}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "offer_details.offered_product",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Paracetamol 500mg (Generic)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Brand Name
                          </Label>
                          <Input
                            className="h-8"
                            value={item.offer_details?.brand_name || ""}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "offer_details.brand_name",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Panadol"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Unit Price (
                            {template.quote_header?.currency || "USD"})
                          </Label>
                          <Input
                            type="number"
                            className="h-8"
                            value={item.offer_details?.unit_price || ""}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "offer_details.unit_price",
                                parseFloat(e.target.value),
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Country of Origin
                          </Label>
                          <Input
                            className="h-8"
                            value={item.offer_details?.country_of_origin || ""}
                            onChange={(e) =>
                              handleLineItemChange(
                                index,
                                "offer_details.country_of_origin",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Germany"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-white border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" /> Download JSON File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
