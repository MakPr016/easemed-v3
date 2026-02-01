"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Save,
  Lock,
  MapPin,
  Truck,
  FileBadge,
  Bell,
  Users,
  Plus,
  Loader2,
  Trash2,
  X,
  Building,
  UploadCloud, // New
  FileSpreadsheet, // New
  FileJson, // New
  Download, // New
  Eye, // New
  Check, // New
} from "lucide-react";

// --- Types ---

interface Warehouse {
  id?: string;
  label: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "invited";
}

interface VendorProfile {
  id: string;
  companyName: string;
  vatId: string;
  dunsNumber: string;
  complianceStatus: "verified" | "pending" | "rejected";

  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  addressStreet: string;
  addressCity: string;
  addressZip: string;
  addressState: string;

  role: string;
  industry: string;
  targetMarkets: string[];
  interestedCategories: string[];

  shippingIncoterms: string[];
  minOrderValue: number;
  expressDeliveryAvailable: boolean;

  bankName: string;
  iban: string;
  swift: string;

  smeStatus: boolean;
  esgScore: string;
  safetyOfficerName: string;
  safetyOfficerEmail: string;
  safetyOfficerPhone: string;

  notifyNewRfq: boolean;
  notifyBidUpdates: boolean;
  notifyWeeklyDigest: boolean;

  // Relational Data
  warehouses: Warehouse[];
  teamMembers: TeamMember[];
}

const DEFAULT_STATE: VendorProfile = {
  id: "",
  companyName: "",
  vatId: "",
  dunsNumber: "",
  complianceStatus: "pending",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  addressStreet: "",
  addressCity: "",
  addressZip: "",
  addressState: "",
  role: "distributor",
  industry: "",
  targetMarkets: [],
  interestedCategories: [],
  shippingIncoterms: [],
  minOrderValue: 0,
  expressDeliveryAvailable: false,
  bankName: "",
  iban: "",
  swift: "",
  smeStatus: false,
  esgScore: "",
  safetyOfficerName: "",
  safetyOfficerEmail: "",
  safetyOfficerPhone: "",
  notifyNewRfq: true,
  notifyBidUpdates: true,
  notifyWeeklyDigest: false,
  warehouses: [],
  teamMembers: [],
};

export default function VendorSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<VendorProfile>(DEFAULT_STATE);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for "Adding" items
  const [newInterest, setNewInterest] = useState("");
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState<Warehouse>({
    label: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [newTeamEmail, setNewTeamEmail] = useState("");

  // --- NEW: Interest File Upload State ---
  const [interestFile, setInterestFile] = useState<File | null>(null);
  const [previewInterests, setPreviewInterests] = useState<string[]>([]);
  const [isProcessingInterests, setIsProcessingInterests] = useState(false);

  // --- 1. Robust Data Fetching ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: vendor, error: vendorError } = await supabase
          .from("vendors")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (vendorError) {
          console.error("Error fetching vendor profile:", vendorError);
          setLoading(false);
          return;
        }

        const { data: warehouses } = await supabase
          .from("vendor_warehouses")
          .select("*")
          .eq("vendor_id", vendor.id);

        const { data: team } = await supabase
          .from("vendor_team_members")
          .select("*")
          .eq("vendor_id", vendor.id);

        setFormData({
          id: vendor.id,
          companyName: vendor.vendor_name || "",
          vatId: vendor.vat_id || "",
          dunsNumber: vendor.duns_number || "",
          complianceStatus: vendor.compliance_status || "pending",
          contactPerson: vendor.contact_person || "",
          contactEmail: vendor.contact_email || "",
          contactPhone: vendor.contact_phone || "",
          website: vendor.website || "",
          addressStreet: vendor.address || "",
          addressCity: vendor.city || "",
          addressZip: vendor.postal_code || "",
          addressState: vendor.state || "",
          role: vendor.economic_role || "distributor",
          industry: vendor.vendor_type || "",
          targetMarkets: vendor.target_markets || [],
          interestedCategories: vendor.interested_categories || [],
          shippingIncoterms: vendor.shipping_incoterms || [],
          minOrderValue: vendor.min_order_value || 0,
          expressDeliveryAvailable: vendor.express_delivery || false,
          bankName: vendor.bank_name || "",
          iban: vendor.bank_account || "",
          swift: vendor.bank_ifsc || "",
          smeStatus: vendor.sme_status || false,
          esgScore: vendor.esg_score || "",
          safetyOfficerName: vendor.safety_officer_name || "",
          safetyOfficerEmail: vendor.safety_officer_email || "",
          safetyOfficerPhone: vendor.safety_officer_phone || "",
          notifyNewRfq: vendor.notification_preferences?.new_rfq ?? true,
          notifyBidUpdates:
            vendor.notification_preferences?.bid_updates ?? true,
          notifyWeeklyDigest:
            vendor.notification_preferences?.weekly_digest ?? false,
          warehouses: warehouses || [],
          teamMembers: team || [],
        });
      } catch (err) {
        console.error("Unexpected error loading settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- 2. General Handlers ---
  const handleChange = (field: keyof VendorProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // --- 3. Interest Logic (Manual) ---
  const addInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interestedCategories.includes(newInterest.trim())
    ) {
      const updated = [...formData.interestedCategories, newInterest.trim()];
      handleChange("interestedCategories", updated);
      setNewInterest("");
    }
  };

  const removeInterest = (item: string) => {
    const updated = formData.interestedCategories.filter((i) => i !== item);
    handleChange("interestedCategories", updated);
  };

  // --- 3b. Interest Logic (Bulk Upload) ---
  const downloadInterestTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Category\nMRI Machines\nSurgical Gloves\nX-Ray Equipment";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "interests_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInterestFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInterestFile(e.target.files[0]);
      setPreviewInterests([]); // Reset preview
    }
  };

  const processInterestFile = () => {
    if (!interestFile) return;
    setIsProcessingInterests(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Simple parsing logic (Split by newline, remove quotes, filter empty)
      // Works for simple CSVs or lists
      const rawLines = text.split(/\r\n|\n/);
      const extractedTags: string[] = [];

      rawLines.forEach((line) => {
        // Remove basic CSV formatting if present
        const cleanLine = line.replace(/["']/g, "").trim();
        // Skip header if it says "Category"
        if (cleanLine && cleanLine.toLowerCase() !== "category") {
          // Split by comma if multiple on one line
          const items = cleanLine.split(",");
          items.forEach((item) => {
            const tag = item.trim();
            if (tag) extractedTags.push(tag);
          });
        }
      });

      // Remove duplicates from the extraction itself
      const uniqueNew = Array.from(new Set(extractedTags));

      setPreviewInterests(uniqueNew);
      setIsProcessingInterests(false);
    };

    reader.readAsText(interestFile);
  };

  const mergeInterests = () => {
    // Combine existing with new, remove duplicates
    const combined = Array.from(
      new Set([...formData.interestedCategories, ...previewInterests]),
    );
    handleChange("interestedCategories", combined);
    setInterestFile(null);
    setPreviewInterests([]);
  };

  // --- 4. Logistics Logic ---
  const saveWarehouse = async () => {
    if (!newWarehouse.label || !newWarehouse.address) return;
    const tempId = Math.random().toString();
    const optimisticList = [
      ...formData.warehouses,
      { ...newWarehouse, id: tempId },
    ];
    setFormData((prev) => ({ ...prev, warehouses: optimisticList }));
    setIsAddingWarehouse(false);
    try {
      const { data, error } = await supabase
        .from("vendor_warehouses")
        .insert({
          vendor_id: formData.id,
          label: newWarehouse.label,
          address: newWarehouse.address,
          city: newWarehouse.city,
          postal_code: newWarehouse.postal_code,
          country: newWarehouse.country,
        })
        .select()
        .single();
      if (!error && data) {
        setFormData((prev) => ({
          ...prev,
          warehouses: prev.warehouses.map((w) => (w.id === tempId ? data : w)),
        }));
        setNewWarehouse({
          label: "",
          address: "",
          city: "",
          postal_code: "",
          country: "",
        });
      }
    } catch (err) {
      console.error("Failed to save warehouse", err);
    }
  };

  const deleteWarehouse = async (id: string) => {
    setFormData((prev) => ({
      ...prev,
      warehouses: prev.warehouses.filter((w) => w.id !== id),
    }));
    await supabase.from("vendor_warehouses").delete().eq("id", id);
  };

  // --- 5. Team Logic ---
  const inviteTeamMember = async () => {
    if (!newTeamEmail) return;
    const { data, error } = await supabase
      .from("vendor_team_members")
      .insert({
        vendor_id: formData.id,
        email: newTeamEmail,
        role: "member",
        status: "invited",
        name: newTeamEmail.split("@")[0],
      })
      .select()
      .single();
    if (!error && data) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, data],
      }));
      setNewTeamEmail("");
    }
  };

  // --- 6. Main Save ---
  const handleSave = async () => {
    setIsSaving(true);
    const updates = {
      vendor_name: formData.companyName,
      contact_person: formData.contactPerson,
      contact_phone: formData.contactPhone,
      website: formData.website,
      address: formData.addressStreet,
      city: formData.addressCity,
      state: formData.addressState,
      economic_role: formData.role,
      interested_categories: formData.interestedCategories,
      sme_status: formData.smeStatus,
      esg_score: formData.esgScore,
      safety_officer_name: formData.safetyOfficerName,
      safety_officer_email: formData.safetyOfficerEmail,
      safety_officer_phone: formData.safetyOfficerPhone,
      bank_name: formData.bankName,
      bank_account: formData.iban,
      bank_ifsc: formData.swift,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("vendors")
      .update(updates)
      .eq("id", formData.id);
    if (!error) setHasChanges(false);
    else console.error("Save error:", error);
    setIsSaving(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans text-slate-900 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Enterprise Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage compliance, team access, and operational preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${formData.complianceStatus === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
          >
            {formData.complianceStatus === "verified" ? (
              <ShieldCheck size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {formData.complianceStatus === "verified"
              ? "Verified Partner"
              : "Verification Pending"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white px-2 pt-2 rounded-t-xl border-b border-slate-200 overflow-x-auto shadow-sm">
        <nav className="flex space-x-6 min-w-max">
          {[
            { id: "general", label: "Profile", icon: User },
            {
              id: "compliance",
              label: "Quality & Regulatory",
              icon: FileBadge,
            },
            { id: "interests", label: "Interests", icon: Bell },
            { id: "logistics", label: "Logistics", icon: Truck },
            { id: "team", label: "Team", icon: Users },
            { id: "billing", label: "Finance", icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* --- TAB 1: GENERAL --- */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Contact Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Company Name
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-700">
                      <Lock size={14} className="text-slate-400" />{" "}
                      {formData.companyName}
                    </div>
                  </div>
                  {/* ... (Other fields kept same) ... */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        handleChange("contactPerson", e.target.value)
                      }
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: INTERESTS (UPDATED) --- */}
          {activeTab === "interests" && (
            <div className="space-y-6">
              {/* Manual Entry Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold">Expansion Interests</h2>
                <p className="text-sm text-slate-500">
                  Add keywords for products you want to supply. We will alert
                  you when matching RFQs appear.
                </p>

                <div className="flex gap-2">
                  <input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    className="flex-1 rounded-lg border-slate-300 p-2.5 text-sm"
                    placeholder="e.g. MRI Machines, Surgical Gloves..."
                  />
                  <button
                    onClick={addInterest}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.interestedCategories.length > 0 ? (
                    formData.interestedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-100"
                      >
                        {cat}
                        <button
                          onClick={() => removeInterest(cat)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No interests added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Bulk Upload Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <UploadCloud size={20} className="text-slate-400" /> Bulk
                      Upload Interests
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Import categories from a file to add them quickly.
                    </p>
                  </div>
                  <button
                    onClick={downloadInterestTemplate}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Download size={14} /> Download Template
                  </button>
                </div>

                {!interestFile ? (
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv, .json, .txt"
                      onChange={handleInterestFileChange}
                    />
                    <div className="bg-blue-50 p-3 rounded-full mb-3 text-blue-600">
                      <FileSpreadsheet size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Click to upload or drag CSV/JSON
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports simple lists separated by newlines or commas
                    </p>
                  </label>
                ) : (
                  <div className="space-y-4">
                    {/* File Card */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {interestFile.name.endsWith("json") ? (
                          <FileJson className="text-orange-500" />
                        ) : (
                          <FileSpreadsheet className="text-emerald-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {interestFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(interestFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setInterestFile(null);
                          setPreviewInterests([]);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Analysis & Preview Actions */}
                    {previewInterests.length === 0 ? (
                      <button
                        onClick={processInterestFile}
                        disabled={isProcessingInterests}
                        className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessingInterests ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} />
                        )}
                        Analyze & Preview File
                      </button>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                            <Check size={16} /> found {previewInterests.length}{" "}
                            new categories
                          </h4>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {previewInterests.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={mergeInterests}
                          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                          Merge into Profile
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 2: COMPLIANCE --- */}
          {activeTab === "compliance" && (
            <div className="text-slate-500 p-4">
              Compliance Settings Placeholder
            </div>
          )}
          {/* --- TAB 4: LOGISTICS --- */}
          {activeTab === "logistics" && (
            <div className="text-slate-500 p-4">
              Logistics Settings Placeholder
            </div>
          )}
          {/* --- TAB 5: TEAM --- */}
          {activeTab === "team" && (
            <div className="text-slate-500 p-4">Team Settings Placeholder</div>
          )}
          {/* --- TAB 6: BILLING --- */}
          {activeTab === "billing" && (
            <div className="text-slate-500 p-4">
              Billing Settings Placeholder
            </div>
          )}

          {/* Action Bar */}
          <div className="sticky bottom-6 flex justify-end z-10">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`shadow-xl flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all transform ${!hasChanges || isSaving ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"}`}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
              Enterprise Readiness
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Profile Strength</span>
                <span className="font-medium text-slate-900">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
