"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitBid } from '@/app/actions/submit-bid'
import { Loader2 } from "lucide-react";

export function BidDialog({
  rfqId,
  rfqTitle,
}: {
  rfqId: string;
  rfqTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await submitBid(formData);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto">
          Place Bid Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Quotation</DialogTitle>
          <DialogDescription>
            Bidding for:{" "}
            <span className="font-medium text-foreground">{rfqTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="rfqId" value={rfqId} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount (€)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="5000.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Delivery (Days)</Label>
              <Input
                id="days"
                name="days"
                type="number"
                required
                placeholder="7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Terms</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Includes shipping to Berlin..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Quote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
