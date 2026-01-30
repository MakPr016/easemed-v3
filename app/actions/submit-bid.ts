"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitBid(formData: FormData) {
  const supabase = await createClient();

  // 1. Get Current User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Identify the Vendor associated with this user
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) throw new Error("Vendor profile not found");

  // 3. Extract Form Data
  const rfqId = formData.get("rfqId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const days = parseInt(formData.get("days") as string);
  const notes = formData.get("notes") as string;

  // 4. Insert Quotation
  const { error } = await supabase.from("quotations").insert({
    rfq_id: rfqId,
    vendor_id: vendor.id,
    total_amount: amount,
    delivery_time_days: days,
    status: "pending",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 30 days
    notes: notes,
  });

  if (error) {
    console.error("Bid Error:", error);
    return { error: "Failed to submit bid" };
  }

  // 5. Refresh Data & Redirect
  revalidatePath(`/dashboard/vendor/rfq/${rfqId}`);
  revalidatePath("/dashboard/vendor");
  return { success: true };
}
