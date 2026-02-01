"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  User,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Save,
  Lock,
  MapPin,
  CheckCircle2,
  Info,
  Bell,
  Truck,
  FileBadge,
  Leaf,
  Users,
  Trash2,
  Plus,
  AlertCircle,
  Thermometer,
  Loader2,
} from "lucide-react";

// --- Types & Interfaces ---

type EconomicRole =
  | "manufacturer_eu"
  | "manufacturer_non_eu"
  | "importer"
  | "distributor"
  | "auth_rep";
type TeamRole = "admin" | "sales" | "compliance" | "finance" | "logistics";

// European Medical Device Nomenclature (EMDN) Categories
const EMDN_CATEGORIES = [
  {
    id: "A",
    label: "Consumables",
    desc: "Single-use devices, needles, syringes",
  },
  { id: "B", label: "Haematology", desc: "Blood bags, transfusion sets" },
  { id: "C", label: "Cardiopulmonary", desc: "Catheters, stents, balloons" },
  { id: "D", label: "Dental", desc: "Implants, fillings, tools" },
  { id: "G", label: "Gastrointestinal", desc: "Endoscopes, ostomy bags" },
  { id: "J", label: "Active Implantable", desc: "Pacemakers, defibrillators" },
  { id: "L", label: "Electromechanical", desc: "MRI, CT, Ultrasound, Lasers" },
  {
    id: "M",
    label: "Reusable Instruments",
    desc: "Scalpels, forceps, scissors",
  },
  { id: "P", label: "Prosthetics", desc: "Artificial limbs, orthopedic aids" },
  { id: "R", label: "Respiratory", desc: "Ventilators, oxygen masks, CPAP" },
  { id: "S", label: "Sterilization", desc: "Autoclaves, disinfectants" },
  { id: "W", label: "IVD", desc: "In Vitro Diagnostics" },
  {
    id: "Z",
    label: "Minimally Invasive",
    desc: "Robotic surgery, microsurgery",
  },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited";
}

interface Warehouse {
  id: string;
  label: string;
  address: string;
  tempRanges: string[];
  fleet: string[];
}

interface Certification {
  id: string;
  type: string;
  number: string;
  expiryDate: string;
  status: "valid" | "expired" | "pending";
}

interface VendorProfile {
  // Identity
  companyName: string;
  vatId: string;
  dunsNumber: string;
  country: string;
  complianceStatus: "verified" | "pending" | "rejected";

  // Contact & GPSR
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  addressStreet: string;
  addressCity: string;
  addressZip: string;
  addressState: string;

  // ESG
  smeStatus: boolean;
  esgScore: string;

  // Security
  mfaEnabled: boolean;
  teamMembers: TeamMember[];

  // Logistics
  warehouses: Warehouse[];
  shippingIncoterms: string[];
  minOrderValue: number;
  expressDeliveryAvailable: boolean;

  // Regulatory
  role: EconomicRole;
  srnNumber: string;
  certifications: Certification[];
  liabilityInsuranceAmount: string;
  euRepName: string;
  euRepEmail: string;
  euRepAddress: string;
  targetMarkets: string[];
  dmidsCode: string;
  rdmNumber: string;
  hasFrenchSupport: boolean;

  // Vigilance
  safetyOfficerName: string;
  safetyOfficerEmail: string;
  safetyOfficerPhone: string;

  // Interests
  interestedCategories: string[];
  notifyNewRfq: boolean;
  notifyBidUpdates: boolean;
  notifyWeeklyDigest: boolean;

  // Finance
  iban: string;
  swift: string;
  bankName: string;
}

// EMPTY DEFAULT STATE (No Static Data)
const DEFAULT_STATE: VendorProfile = {
  companyName: "",
  vatId: "",
  dunsNumber: "",
  country: "",
  complianceStatus: "pending",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  addressStreet: "",
  addressCity: "",
  addressZip: "",
  addressState: "",
  smeStatus: false,
  esgScore: "",
  mfaEnabled: false,
  teamMembers: [],
  warehouses: [],
  shippingIncoterms: [],
  minOrderValue: 0,
  expressDeliveryAvailable: false,
  role: "distributor",
  srnNumber: "",
  certifications: [],
  liabilityInsuranceAmount: "",
  euRepName: "",
  euRepEmail: "",
  euRepAddress: "",
  targetMarkets: [],
  dmidsCode: "",
  rdmNumber: "",
  hasFrenchSupport: false,
  safetyOfficerName: "",
  safetyOfficerEmail: "",
  safetyOfficerPhone: "",
  interestedCategories: [],
  notifyNewRfq: true,
  notifyBidUpdates: true,
  notifyWeeklyDigest: false,
  iban: "",
  swift: "",
  bankName: "",
};

export default function VendorSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<VendorProfile>(DEFAULT_STATE);
  const [hasChanges, setHasChanges] = useState(false);

  // --- 1. Fetch Real Data on Mount ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // Redirect to login in middleware

      // Fetch Vendor Data
      const { data: vendor, error } = await supabase
        .from("vendors")
        .select(
          `
          *,
          vendor_warehouses(*),
          vendor_certifications(*),
          vendor_team_members(*)
        `,
        )
        .eq("user_id", user.id)
        .single();

      if (vendor && !error) {
        // Map DB Snake_Case to UI CamelCase
        setFormData({
          companyName: vendor.vendor_name || "",
          vatId: vendor.vat_id || "",
          dunsNumber: vendor.duns_number || "",
          country: vendor.state || "", // Assuming state field is used for country in simple schema, or adjust
          complianceStatus: vendor.compliance_status || "pending",

          contactPerson: vendor.contact_person || "",
          contactEmail: vendor.contact_email || "",
          contactPhone: vendor.contact_phone || "",
          website: vendor.website || "",
          addressStreet: vendor.address_street || "",
          addressCity: vendor.city || "",
          addressZip: vendor.postal_code || "",
          addressState: vendor.state || "",

          smeStatus: vendor.sme_status || false,
          esgScore: vendor.esg_score || "",

          mfaEnabled: false, // In separate auth table usually
          teamMembers: vendor.vendor_team_members || [],

          warehouses: vendor.vendor_warehouses || [],
          shippingIncoterms: vendor.shipping_incoterms || [],
          minOrderValue: vendor.min_order_value || 0,
          expressDeliveryAvailable: vendor.express_delivery || false,

          role: vendor.economic_role || "distributor",
          srnNumber: vendor.srn_number || "",
          certifications: vendor.vendor_certifications || [],
          liabilityInsuranceAmount: "", // Needs field in DB

          euRepName: vendor.eu_rep_name || "",
          euRepEmail: vendor.eu_rep_email || "",
          euRepAddress: vendor.eu_rep_address || "",
          targetMarkets: vendor.target_markets || [],
          dmidsCode: vendor.dmids_code || "",
          rdmNumber: vendor.rdm_number || "",
          hasFrenchSupport: vendor.has_french_support || false,

          safetyOfficerName: vendor.safety_officer_name || "",
          safetyOfficerEmail: vendor.safety_officer_email || "",
          safetyOfficerPhone: vendor.safety_officer_phone || "",

          interestedCategories: vendor.interested_categories || [],
          notifyNewRfq: vendor.notification_preferences?.new_rfq ?? true,
          notifyBidUpdates:
            vendor.notification_preferences?.bid_updates ?? true,
          notifyWeeklyDigest:
            vendor.notification_preferences?.weekly_digest ?? false,

          iban: vendor.bank_account || "", // Mapping bank_account to IBAN
          swift: vendor.bank_ifsc || "", // Mapping IFSC to SWIFT for EU context
          bankName: vendor.bank_name || "",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  // --- 2. Change Handlers ---
  const handleChange = (field: keyof VendorProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleArrayItem = (field: keyof VendorProfile, item: string) => {
    const current = formData[field] as string[];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    handleChange(field, updated);
  };

  // --- 3. Save to Supabase ---
  const handleSave = async () => {
    setIsSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Map UI CamelCase back to DB Snake_Case
      const updates = {
        vendor_name: formData.companyName,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        website: formData.website,
        address_street: formData.addressStreet,
        city: formData.addressCity,
        postal_code: formData.addressZip,
        state: formData.addressState,
        sme_status: formData.smeStatus,
        esg_score: formData.esgScore,
        economic_role: formData.role,
        srn_number: formData.srnNumber,
        eu_rep_name: formData.euRepName,
        eu_rep_email: formData.euRepEmail,
        eu_rep_address: formData.euRepAddress,
        target_markets: formData.targetMarkets,
        dmids_code: formData.dmidsCode,
        rdm_number: formData.rdmNumber,
        has_french_support: formData.hasFrenchSupport,
        safety_officer_name: formData.safetyOfficerName,
        safety_officer_email: formData.safetyOfficerEmail,
        safety_officer_phone: formData.safetyOfficerPhone,
        interested_categories: formData.interestedCategories,
        shipping_incoterms: formData.shippingIncoterms,
        min_order_value: formData.minOrderValue,
        express_delivery: formData.expressDeliveryAvailable,
        bank_account: formData.iban,
        bank_ifsc: formData.swift,
        bank_name: formData.bankName,
        notification_preferences: {
          new_rfq: formData.notifyNewRfq,
          bid_updates: formData.notifyBidUpdates,
          weekly_digest: formData.notifyWeeklyDigest,
        },
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("vendors")
        .update(updates)
        .eq("user_id", user.id);

      if (!error) {
        setHasChanges(false);
        // toast.success('Profile updated');
      }
    }
    setIsSaving(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-500 font-medium">
          Loading Vendor Profile...
        </span>
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
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
              formData.complianceStatus === "verified"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {formData.complianceStatus === "verified" ? (
              <ShieldCheck size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {formData.complianceStatus === "verified"
              ? "MDR Compliant"
              : "Verification Needed"}
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
            { id: "interests", label: "Interests (EMDN)", icon: Bell },
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
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN FORM AREA */}
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
                  Address (GPSR)
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
                      placeholder="Zip"
                      value={formData.addressZip}
                      onChange={(e) =>
                        handleChange("addressZip", e.target.value)
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
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Leaf size={20} className="text-emerald-500" /> ESG &
                  Sustainability
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      ESG Rating
                    </label>
                    <input
                      type="text"
                      value={formData.esgScore}
                      onChange={(e) => handleChange("esgScore", e.target.value)}
                      className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                      placeholder="e.g. EcoVadis Gold"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.smeStatus}
                      onChange={(e) =>
                        handleChange("smeStatus", e.target.checked)
                      }
                      className="h-5 w-5 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      We qualify as an EU SME
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: QUALITY & REGULATORY --- */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Legal Entity & Role
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Legal Name
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-md text-sm text-slate-700">
                      <Lock size={14} />{" "}
                      {formData.companyName || "MedSupply Europe BV"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      DUNS Number
                    </label>
                    <input
                      value={formData.dunsNumber}
                      onChange={(e) =>
                        handleChange("dunsNumber", e.target.value)
                      }
                      className="w-full rounded-md border-slate-300 p-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">
                      Economic Operator Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="w-full rounded-md border-slate-300 p-2 text-sm bg-white"
                    >
                      <option value="manufacturer_eu">Manufacturer (EU)</option>
                      <option value="distributor">
                        Distributor / Wholesaler
                      </option>
                      <option value="importer">Importer (Non-EU Goods)</option>
                      <option value="auth_rep">
                        Authorized Representative
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle size={20} /> Vigilance & Safety (MDR Art. 15)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-800">
                      Safety Officer Name
                    </label>
                    <input
                      className="w-full rounded border-amber-200 p-2 text-sm"
                      value={formData.safetyOfficerName}
                      onChange={(e) =>
                        handleChange("safetyOfficerName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-800">
                      Emergency Phone
                    </label>
                    <input
                      className="w-full rounded border-amber-200 p-2 text-sm"
                      value={formData.safetyOfficerPhone}
                      onChange={(e) =>
                        handleChange("safetyOfficerPhone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-amber-800">
                      Direct Email
                    </label>
                    <input
                      className="w-full rounded border-amber-200 p-2 text-sm"
                      value={formData.safetyOfficerEmail}
                      onChange={(e) =>
                        handleChange("safetyOfficerEmail", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: INTERESTS (EMDN) --- */}
          {activeTab === "interests" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Product Portfolio (EMDN)
                  </h2>
                  <p className="text-sm text-slate-500">
                    Select categories to match with relevant Hospital RFQs.
                    Based on EU Regulation 2017/745.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EMDN_CATEGORIES.map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.interestedCategories.includes(cat.id) ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" : "bg-white hover:border-slate-300"}`}
                    >
                      <div
                        className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${formData.interestedCategories.includes(cat.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"}`}
                      >
                        {formData.interestedCategories.includes(cat.id) && (
                          <CheckCircle2 size={14} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 rounded">
                            {cat.id}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {cat.label}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">
                          {cat.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 4: LOGISTICS --- */}
          {activeTab === "logistics" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Warehouse Capabilities (GDP)
                </h2>
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <Truck className="mx-auto h-8 w-8 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    No warehouses configured
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Add your distribution centers to calculate shipping times.
                  </p>
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Warehouse
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 5: TEAM --- */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-sm text-slate-500">
                    Mandatory for Admin and Finance roles.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.mfaEnabled}
                    onChange={(e) =>
                      handleChange("mfaEnabled", e.target.checked)
                    }
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
              {/* Team List would go here (mapped from formData.teamMembers) */}
            </div>
          )}

          {/* --- TAB 6: BILLING --- */}
          {activeTab === "billing" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Payout Coordinates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
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
          )}

          {/* Action Bar */}
          <div className="sticky bottom-6 flex justify-end z-10">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`shadow-xl flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all transform ${
                !hasChanges || isSaving
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
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

        {/* SIDEBAR: STATUS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
              Enterprise Readiness
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Profile Strength</span>
                <span className="font-medium text-slate-900">95%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <ShieldCheck size={14} /> VIES Validated
                  </span>
                  <span
                    className={`font-medium ${formData.vatId ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {formData.vatId ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <FileBadge size={14} /> Quality Certs
                  </span>
                  <span className="text-slate-400">
                    {formData.certifications.length} Active
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
