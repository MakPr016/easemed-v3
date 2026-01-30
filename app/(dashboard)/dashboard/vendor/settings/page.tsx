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
  CheckCircle2,
  Bell,
  Truck,
  FileBadge,
  Leaf,
  Users,
  Plus,
  Loader2,
  Trash2,
  X,
  Building,
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

  // --- 1. Robust Data Fetching ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Main Vendor Profile
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

        // 2. Fetch Relations (Safely separated)
        const { data: warehouses } = await supabase
          .from("vendor_warehouses")
          .select("*")
          .eq("vendor_id", vendor.id);

        const { data: team } = await supabase
          .from("vendor_team_members")
          .select("*")
          .eq("vendor_id", vendor.id);

        // 3. Map Data to State
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
          addressZip: vendor.postal_code || "", // Assuming you added postal_code column
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

          // Relations (Default to empty array if fetch failed)
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

  // --- 3. Interest Logic ---
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

  // --- 4. Logistics Logic ---
  const saveWarehouse = async () => {
    if (!newWarehouse.label || !newWarehouse.address) return;

    // Optimistic Update
    const tempId = Math.random().toString();
    const optimisticList = [
      ...formData.warehouses,
      { ...newWarehouse, id: tempId },
    ];
    setFormData((prev) => ({ ...prev, warehouses: optimisticList }));
    setIsAddingWarehouse(false);

    // DB Insert
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
        // Replace temp item with real DB item
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
    if (!error) {
      setHasChanges(false);
      // Ensure UI reflects saved state
    } else {
      console.error("Save error:", error);
    }
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      VAT ID
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-700 font-mono">
                      <Lock size={14} className="text-slate-400" />{" "}
                      {formData.vatId}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Primary Contact
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        handleChange("contactPhone", e.target.value)
                      }
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin size={20} className="text-slate-400" /> Registered
                  Address
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.addressStreet}
                    onChange={(e) =>
                      handleChange("addressStreet", e.target.value)
                    }
                    className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.addressCity}
                      onChange={(e) =>
                        handleChange("addressCity", e.target.value)
                      }
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State/Region"
                      value={formData.addressState}
                      onChange={(e) =>
                        handleChange("addressState", e.target.value)
                      }
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Zip"
                      value={formData.addressZip}
                      onChange={(e) =>
                        handleChange("addressZip", e.target.value)
                      }
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: COMPLIANCE --- */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Economic Role
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Registered Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full rounded-lg border-slate-300 p-2.5 text-sm bg-white"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="importer">Importer</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={20} /> Safety Officer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Name"
                    value={formData.safetyOfficerName}
                    onChange={(e) =>
                      handleChange("safetyOfficerName", e.target.value)
                    }
                    className="w-full rounded border-amber-200 p-2 text-sm bg-white"
                  />
                  <input
                    placeholder="Phone"
                    value={formData.safetyOfficerPhone}
                    onChange={(e) =>
                      handleChange("safetyOfficerPhone", e.target.value)
                    }
                    className="w-full rounded border-amber-200 p-2 text-sm bg-white"
                  />
                  <input
                    placeholder="Email"
                    value={formData.safetyOfficerEmail}
                    onChange={(e) =>
                      handleChange("safetyOfficerEmail", e.target.value)
                    }
                    className="w-full rounded border-amber-200 p-2 text-sm md:col-span-2 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: INTERESTS --- */}
          {activeTab === "interests" && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* --- TAB 4: LOGISTICS --- */}
          {activeTab === "logistics" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Truck size={20} className="text-slate-400" /> Warehouses
                  </h2>
                  <button
                    onClick={() => setIsAddingWarehouse(!isAddingWarehouse)}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    {isAddingWarehouse ? "Cancel" : "+ Add New"}
                  </button>
                </div>

                {isAddingWarehouse && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Label (e.g. Berlin Hub)"
                        value={newWarehouse.label}
                        onChange={(e) =>
                          setNewWarehouse({
                            ...newWarehouse,
                            label: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-slate-300 p-2 text-sm"
                      />
                      <input
                        placeholder="Address"
                        value={newWarehouse.address}
                        onChange={(e) =>
                          setNewWarehouse({
                            ...newWarehouse,
                            address: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-slate-300 p-2 text-sm"
                      />
                      <input
                        placeholder="City"
                        value={newWarehouse.city}
                        onChange={(e) =>
                          setNewWarehouse({
                            ...newWarehouse,
                            city: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-slate-300 p-2 text-sm"
                      />
                      <input
                        placeholder="Country"
                        value={newWarehouse.country}
                        onChange={(e) =>
                          setNewWarehouse({
                            ...newWarehouse,
                            country: e.target.value,
                          })
                        }
                        className="w-full rounded-md border-slate-300 p-2 text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={saveWarehouse}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
                      >
                        Save Warehouse
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.warehouses.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-500">
                        No warehouses configured.
                      </p>
                    </div>
                  ) : (
                    formData.warehouses.map((w, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-slate-100 p-2 rounded-md">
                            <Building size={20} className="text-slate-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {w.label}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {w.address}, {w.city}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => w.id && deleteWarehouse(w.id)}
                          className="text-slate-400 hover:text-red-600 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 5: TEAM --- */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold">Team Members</h2>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={newTeamEmail}
                    onChange={(e) => setNewTeamEmail(e.target.value)}
                    className="flex-1 rounded-lg border-slate-300 p-2.5 text-sm"
                  />
                  <button
                    onClick={inviteTeamMember}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={16} /> Invite
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.teamMembers.map((member, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          {member.name ? member.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {member.email}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {member.role} • {member.status}
                          </p>
                        </div>
                      </div>
                      {member.status === "invited" && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 6: BILLING --- */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold">Payout Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                    className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => handleChange("iban", e.target.value)}
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      SWIFT/BIC
                    </label>
                    <input
                      type="text"
                      value={formData.swift}
                      onChange={(e) => handleChange("swift", e.target.value)}
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
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
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <ShieldCheck size={14} /> VAT Validated
                  </span>
                  <span
                    className={`font-medium ${formData.vatId ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {formData.vatId ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <FileBadge size={14} /> Role
                  </span>
                  <span className="text-slate-700 capitalize">
                    {formData.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
