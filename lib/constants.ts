// lib/constants.ts
import {
    Building2,
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Users,
    BarChart3,
    Upload,
    Clock,
    CheckCircle2,
    Eye,
    Award,
} from 'lucide-react'


export const cityToCountryMap: { [key: string]: string } = {
    'London': 'United Kingdom',
    'Manchester': 'United Kingdom',
    'Paris': 'France',
    'Lyon': 'France',
    'Berlin': 'Germany',
    'Munich': 'Germany',
    'Rome': 'Italy',
    'Milan': 'Italy',
    'Madrid': 'Spain',
    'Barcelona': 'Spain',
    'Amsterdam': 'Netherlands',
    'Rotterdam': 'Netherlands',
    'Brussels': 'Belgium',
    'Antwerp': 'Belgium',
    'Vienna': 'Austria',
    'Warsaw': 'Poland',
    'Krakow': 'Poland',
    'Prague': 'Czechia',
    'Budapest': 'Hungary',
    'Bucharest': 'Romania',
    'Athens': 'Greece',
    'Lisbon': 'Portugal',
    'Porto': 'Portugal',
    'Stockholm': 'Sweden',
    'Oslo': 'Norway',
    'Copenhagen': 'Denmark',
    'Helsinki': 'Finland',
    'Dublin': 'Ireland',
    'Zurich': 'Switzerland',
    'Geneva': 'Switzerland',
}


// Hospital RFQ Requirements
export interface Requirement {
    line_item_id: number
    inn_name: string
    brand_name: string
    dosage: string
    form: string
    quantity: number
    unit_of_issue: string
    category: string
}


export interface Vendor {
    id: string
    name: string
    rating: number
    location: string
    certifications: string[]
    pastOrders: number
    responseRate: number
    canFulfillOtherRequirements: {
        line_item_id: number
        inn_name: string
        brand_name: string
        dosage: string
    }[]
    selected: boolean
    includeOtherRequirements: number[]
}


export const mockRequirements: Requirement[] = [
    {
        line_item_id: 1,
        inn_name: 'Acetylsalicylic acid',
        brand_name: 'Aspirin',
        dosage: '81 mg',
        form: 'Tablet',
        quantity: 1000,
        unit_of_issue: 'Tablet',
        category: 'Analgesics',
    },
    {
        line_item_id: 2,
        inn_name: 'Acetaminophen',
        brand_name: 'Panadol Syrup',
        dosage: '100 ml',
        form: 'Syrup',
        quantity: 500,
        unit_of_issue: 'Bottle',
        category: 'Analgesics',
    },
    {
        line_item_id: 3,
        inn_name: 'Adrenalin',
        brand_name: 'Ampule Adre',
        dosage: '1mg/1ml',
        form: 'Injection',
        quantity: 200,
        unit_of_issue: 'Ampule',
        category: 'Emergency Medicine',
    },
    {
        line_item_id: 4,
        inn_name: 'Amoxicillin + Clavulanate',
        brand_name: 'Augmentin',
        dosage: '1g',
        form: 'Tablet',
        quantity: 800,
        unit_of_issue: 'Tablet',
        category: 'Antibiotics',
    },
]


export const mockVendors: Vendor[] = [
    {
        id: 'v1',
        name: 'PharmaCorp Ltd',
        rating: 4.8,
        location: 'London',
        certifications: ['ISO 9001', 'WHO-GMP', 'FDA'],
        pastOrders: 45,
        responseRate: 95,
        canFulfillOtherRequirements: [
            { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', dosage: '100 ml' },
            { line_item_id: 4, inn_name: 'Amoxicillin + Clavulanate', brand_name: 'Augmentin', dosage: '1g' },
        ],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v2',
        name: 'MediSupply International',
        rating: 4.5,
        location: 'Paris',
        certifications: ['ISO 9001', 'FDA'],
        pastOrders: 32,
        responseRate: 88,
        canFulfillOtherRequirements: [
            { line_item_id: 3, inn_name: 'Adrenalin', brand_name: 'Ampule Adre', dosage: '1mg/1ml' },
        ],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v3',
        name: 'HealthCare Distributors',
        rating: 4.2,
        location: 'Berlin',
        certifications: ['WHO-GMP'],
        pastOrders: 18,
        responseRate: 82,
        canFulfillOtherRequirements: [],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v4',
        name: 'Global Pharma Solutions',
        rating: 4.7,
        location: 'Rome',
        certifications: ['ISO 9001', 'WHO-GMP', 'EMA'],
        pastOrders: 38,
        responseRate: 91,
        canFulfillOtherRequirements: [
            { line_item_id: 2, inn_name: 'Acetaminophen', brand_name: 'Panadol Syrup', dosage: '100 ml' },
        ],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v5',
        name: 'MedLife Supplies',
        rating: 4.3,
        location: 'Madrid',
        certifications: ['ISO 9001'],
        pastOrders: 22,
        responseRate: 85,
        canFulfillOtherRequirements: [
            { line_item_id: 3, inn_name: 'Adrenalin', brand_name: 'Ampule Adre', dosage: '1mg/1ml' },
        ],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v6',
        name: 'EuroPharma AG',
        rating: 4.6,
        location: 'Zurich',
        certifications: ['ISO 9001', 'WHO-GMP'],
        pastOrders: 28,
        responseRate: 90,
        canFulfillOtherRequirements: [
            { line_item_id: 4, inn_name: 'Amoxicillin + Clavulanate', brand_name: 'Augmentin', dosage: '1g' },
        ],
        selected: false,
        includeOtherRequirements: [],
    },
    {
        id: 'v7',
        name: 'Nordic Medical Supplies',
        rating: 4.4,
        location: 'Stockholm',
        certifications: ['ISO 9001', 'FDA'],
        pastOrders: 25,
        responseRate: 87,
        canFulfillOtherRequirements: [],
        selected: false,
        includeOtherRequirements: [],
    },
]


// Menu Items
export interface MenuItem {
    title: string
    url: string
    icon?: any
    items?: MenuItem[]
}


export const hospitalMenuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard/hospital',
    },
    {
        title: 'RFQs',
        icon: FileText,
        url: '/dashboard/hospital/rfq',
        items: [
            { title: 'All RFQs', url: '/dashboard/hospital/rfq', icon: FileText },
            { title: 'Create RFQ', url: '/dashboard/hospital/rfq/upload', icon: Upload },
            { title: 'Awaiting Responses', url: '/dashboard/hospital/rfq/awaiting', icon: Clock },
            { title: 'Under Review', url: '/dashboard/hospital/rfq/under-review', icon: Eye },
            { title: 'Awarded', url: '/dashboard/hospital/rfq/awarded', icon: Award },
            { title: 'Closed', url: '/dashboard/hospital/rfq/closed', icon: CheckCircle2 },
        ],
    },
    {
        title: 'Orders',
        icon: Package,
        url: '/dashboard/hospital/orders',
        items: [
            { title: 'All Orders', url: '/dashboard/hospital/orders' },
            { title: 'Pending', url: '/dashboard/hospital/orders?status=pending' },
            { title: 'In Transit', url: '/dashboard/hospital/orders?status=in_transit' },
            { title: 'Delivered', url: '/dashboard/hospital/orders?status=delivered' },
        ],
    },
    {
        title: 'Vendors',
        icon: Users,
        url: '/dashboard/hospital/vendors',
        items: [
            { title: 'All Vendors', url: '/dashboard/hospital/vendors' },
            { title: 'Verified', url: '/dashboard/hospital/vendors?status=verified' },
            { title: 'Pending Approval', url: '/dashboard/hospital/vendors?status=pending' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/dashboard/hospital/settings',
    },
]


export const vendorMenuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/dashboard/vendor',
    },
    {
        title: 'Available RFQs',
        icon: FileText,
        url: '/dashboard/vendor/rfq',
        items: [
            { title: 'All RFQs', url: '/dashboard/vendor/rfq' },
            { title: 'New', url: '/dashboard/vendor/rfq?status=new' },
            { title: 'Expiring Soon', url: '/dashboard/vendor/rfq?expiring=true' },
        ],
    },
    {
        title: 'My Quotations',
        icon: ShoppingCart,
        url: '/dashboard/vendor/quotations',
        items: [
            { title: 'All Quotations', url: '/dashboard/vendor/quotations' },
        ],
    },
    {
        title: 'Orders',
        icon: Package,
        url: '/dashboard/vendor/orders',
        items: [
            { title: 'Active Orders', url: '/dashboard/vendor/orders' },
            { title: 'Pending Delivery', url: '/dashboard/vendor/orders?status=pending' },
            { title: 'Completed', url: '/dashboard/vendor/orders?status=completed' },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        url: '/dashboard/vendor/settings',
    },
]

// Vendor Dashboard Data
export interface VendorStats {
    totalRevenue: {
        value: string
        change: string
        isPositive: boolean
    }
    activeBids: {
        total: number
        pending: number
        shortlisted: number
    }
    winRate: {
        percentage: number
        change: string
        isPositive: boolean
    }
    newOpportunities: {
        count: number
        addedToday: number
    }
}


export interface BidPerformance {
    won: number
    pending: number
    lost: number
    winRate: number
    averageBidValue: string
    responseTime: string
}


export interface RFQOpportunity {
    id: string
    hospital: string
    title: string
    budget: string
    competitors: number
    deadline: string
    deadlineVariant: 'destructive' | 'secondary'
}


export interface ActiveBid {
    bidId: string
    rfqTitle: string
    yourBid: string
    rank: string
    rankVariant: 'green' | 'blue' | 'orange'
    status: string
    statusVariant: 'yellow' | 'green'
}


export interface TopCustomer {
    rank: number
    name: string
    orders: number
    amount: string
    color: string
}


export const vendorStats: VendorStats = {
    totalRevenue: {
        value: '€184,500',
        change: '+24%',
        isPositive: true,
    },
    activeBids: {
        total: 23,
        pending: 15,
        shortlisted: 8,
    },
    winRate: {
        percentage: 68,
        change: '+12%',
        isPositive: true,
    },
    newOpportunities: {
        count: 42,
        addedToday: 8,
    },
}


export const bidPerformance: BidPerformance = {
    won: 45,
    pending: 23,
    lost: 12,
    winRate: 68,
    averageBidValue: '€12,400',
    responseTime: '2.3 days',
}


export const rfqOpportunities: RFQOpportunity[] = [
    {
        id: 'RFQ-2847',
        hospital: 'City General Hospital',
        title: 'Medical Supplies - PPE Kits',
        budget: '€15,000',
        competitors: 7,
        deadline: '18h',
        deadlineVariant: 'destructive',
    },
    {
        id: 'RFQ-2846',
        hospital: "St. Mary's Hospital",
        title: 'Surgical Instruments',
        budget: '€28,500',
        competitors: 4,
        deadline: '2d',
        deadlineVariant: 'secondary',
    },
    {
        id: 'RFQ-2845',
        hospital: 'County Medical Center',
        title: 'Laboratory Equipment',
        budget: '€52,000',
        competitors: 11,
        deadline: '3d',
        deadlineVariant: 'secondary',
    },
    {
        id: 'RFQ-2844',
        hospital: 'Regional Health Center',
        title: 'Disposable Syringes (Bulk)',
        budget: '€8,900',
        competitors: 6,
        deadline: '5d',
        deadlineVariant: 'secondary',
    },
]


export const activeBids: ActiveBid[] = [
    {
        bidId: 'BID-8934',
        rfqTitle: 'Medical Gloves',
        yourBid: '€9,800',
        rank: '1st',
        rankVariant: 'green',
        status: 'Under Review',
        statusVariant: 'yellow',
    },
    {
        bidId: 'BID-8933',
        rfqTitle: 'IV Infusion Sets',
        yourBid: '€14,200',
        rank: '2nd',
        rankVariant: 'blue',
        status: 'Pending',
        statusVariant: 'yellow',
    },
    {
        bidId: 'BID-8932',
        rfqTitle: 'Surgical Masks',
        yourBid: '€6,500',
        rank: '1st',
        rankVariant: 'green',
        status: 'Shortlisted',
        statusVariant: 'green',
    },
    {
        bidId: 'BID-8931',
        rfqTitle: 'ECG Electrodes',
        yourBid: '€4,800',
        rank: '3rd',
        rankVariant: 'orange',
        status: 'Pending',
        statusVariant: 'yellow',
    },
]


export const topCustomers: TopCustomer[] = [
    {
        rank: 1,
        name: 'City General Hospital',
        orders: 42,
        amount: '€85,000',
        color: 'bg-green-500',
    },
    {
        rank: 2,
        name: "St. Mary's Medical Center",
        orders: 38,
        amount: '€62,500',
        color: 'bg-green-400',
    },
    {
        rank: 3,
        name: 'County Health Services',
        orders: 31,
        amount: '€48,200',
        color: 'bg-green-300',
    },
    {
        rank: 4,
        name: 'Regional Hospital Network',
        orders: 24,
        amount: '€38,900',
        color: 'bg-green-200',
    },
    {
        rank: 5,
        name: 'Metro Clinical Center',
        orders: 19,
        amount: '€25,400',
        color: 'bg-green-100',
    },
]


// Vendor RFQ Opportunities Data
export interface VendorRFQ {
    id: string
    title: string
    hospital: string
    location: string
    category: string
    budget: string
    deadline: string
    urgency: 'urgent' | 'moderate' | 'low'
    itemCount: number  // Changed from 'items' to 'itemCount'
    description: string
    competitors: number
    rating: number
    pastOrders: number
}


export interface VendorRFQStats {
    totalRFQs: number
    urgentRFQs: number
    totalValue: string
    avgCompetitors: string
}


export const vendorRFQCategories = [
    'Medical Supplies',
    'Surgical Equipment',
    'Lab Equipment',
    'Diagnostic Equipment',
    'Pharmaceuticals',
    'Medical Devices',
] as const


export const vendorRFQList: VendorRFQ[] = [
    {
        id: 'RFQ-2847',
        title: 'Medical Supplies - PPE Kits',
        hospital: 'City General Hospital',
        location: 'Berlin, Germany',
        category: 'Medical Supplies',
        budget: '€15,000',
        deadline: '18h',
        urgency: 'urgent',
        itemCount: 4,
        description: 'Bulk order of PPE kits including masks, gloves, and sanitizers',
        competitors: 7,
        rating: 4.8,
        pastOrders: 45,
    },
    {
        id: 'RFQ-2846',
        title: 'Surgical Instruments Set',
        hospital: "St. Mary's Hospital",
        location: 'Munich, Germany',
        category: 'Surgical Equipment',
        budget: '€28,500',
        deadline: '2d',
        urgency: 'moderate',
        itemCount: 4,
        description: 'Complete set of surgical instruments for cardiology department',
        competitors: 4,
        rating: 4.9,
        pastOrders: 62,
    },
    {
        id: 'RFQ-2845',
        title: 'Laboratory Equipment',
        hospital: 'County Medical Center',
        location: 'Frankfurt, Germany',
        category: 'Lab Equipment',
        budget: '€52,000',
        deadline: '3d',
        urgency: 'moderate',
        itemCount: 6,
        description: 'Various laboratory testing equipment and supplies',
        competitors: 11,
        rating: 4.6,
        pastOrders: 38,
    },
    {
        id: 'RFQ-2844',
        title: 'Disposable Syringes (Bulk)',
        hospital: 'Regional Health Center',
        location: 'Hamburg, Germany',
        category: 'Medical Supplies',
        budget: '€8,900',
        deadline: '5d',
        urgency: 'low',
        itemCount: 3,
        description: 'Bulk order of disposable syringes in various sizes',
        competitors: 6,
        rating: 4.5,
        pastOrders: 29,
    },
    {
        id: 'RFQ-2843',
        title: 'Diagnostic Imaging Supplies',
        hospital: 'University Medical Center',
        location: 'Cologne, Germany',
        category: 'Diagnostic Equipment',
        budget: '€42,300',
        deadline: '6d',
        urgency: 'low',
        itemCount: 8,
        description: 'X-ray films, contrast agents, and related supplies',
        competitors: 9,
        rating: 4.7,
        pastOrders: 51,
    },
    {
        id: 'RFQ-2842',
        title: 'Pharmaceuticals - Antibiotics',
        hospital: 'Central City Hospital',
        location: 'Stuttgart, Germany',
        category: 'Pharmaceuticals',
        budget: '€31,200',
        deadline: '1d',
        urgency: 'urgent',
        itemCount: 12,
        description: 'Wide range of antibiotic medications for pharmacy stock',
        competitors: 8,
        rating: 4.6,
        pastOrders: 72,
    },
    {
        id: 'RFQ-2841',
        title: 'Patient Monitoring Devices',
        hospital: 'Metropolitan Hospital',
        location: 'Düsseldorf, Germany',
        category: 'Medical Devices',
        budget: '€67,800',
        deadline: '7d',
        urgency: 'low',
        itemCount: 5,
        description: 'Advanced patient monitoring systems for ICU',
        competitors: 5,
        rating: 4.9,
        pastOrders: 34,
    },
]


export const vendorRFQStats: VendorRFQStats = {
    totalRFQs: vendorRFQList.length,
    urgentRFQs: vendorRFQList.filter((r) => r.urgency === 'urgent').length,
    totalValue: '€243.7K',
    avgCompetitors: '7.0',
}


// RFQ Item Details
export interface RFQItem {
    id: number
    name: string
    quantity: number
    unit: string
    specification: string
    estimatedPrice?: string
}


// Extended Vendor RFQ with detailed information
export interface VendorRFQDetail extends Omit<VendorRFQ, 'itemCount'> {
    hospitalAddress: string
    coordinates: {
        lat: number
        lng: number
    }
    contactPerson: string
    contactEmail: string
    contactPhone: string
    requiredDocuments: string[]
    deliveryDeadline: string
    paymentTerms: string
    specifications: string
    items: RFQItem[]  // Array of items with details
}


// Sample detailed RFQ data
export const vendorRFQDetails: Record<string, VendorRFQDetail> = {
    'RFQ-2847': {
        id: 'RFQ-2847',
        title: 'Medical Supplies - PPE Kits',
        hospital: 'City General Hospital',
        location: 'Berlin, Germany',
        hospitalAddress: 'Charitéplatz 1, 10117 Berlin, Germany',
        coordinates: {
            lat: 52.5200,
            lng: 13.4050,
        },
        category: 'Medical Supplies',
        budget: '€15,000',
        deadline: '18h',
        urgency: 'urgent',
        description: 'Bulk order of PPE kits including masks, gloves, and sanitizers for immediate use',
        competitors: 7,
        rating: 4.8,
        pastOrders: 45,
        contactPerson: 'Dr. Anna Schmidt',
        contactEmail: 'procurement@citygeneral.de',
        contactPhone: '+49 30 450 50',
        requiredDocuments: [
            'Company registration certificate',
            'ISO 9001 certification',
            'Product compliance certificates',
            'Price breakdown sheet',
        ],
        deliveryDeadline: 'February 5, 2026',
        paymentTerms: '30 days net',
        specifications: 'All items must comply with EU medical device regulations. PPE kits should include N95 masks, nitrile gloves, face shields, and hand sanitizers.',
        items: [
            {
                id: 1,
                name: 'N95 Respirator Masks',
                quantity: 5000,
                unit: 'pieces',
                specification: 'FDA approved, individually wrapped',
                estimatedPrice: '€2.50',
            },
            {
                id: 2,
                name: 'Nitrile Gloves (Large)',
                quantity: 10000,
                unit: 'pairs',
                specification: 'Powder-free, latex-free, box of 100',
                estimatedPrice: '€0.15',
            },
            {
                id: 3,
                name: 'Face Shields',
                quantity: 2000,
                unit: 'pieces',
                specification: 'Anti-fog, adjustable headband',
                estimatedPrice: '€1.20',
            },
            {
                id: 4,
                name: 'Hand Sanitizer (500ml)',
                quantity: 1000,
                unit: 'bottles',
                specification: '70% alcohol content, pump dispenser',
                estimatedPrice: '€3.50',
            },
        ],
    },
    'RFQ-2846': {
        id: 'RFQ-2846',
        title: 'Surgical Instruments Set',
        hospital: "St. Mary's Hospital",
        location: 'Munich, Germany',
        hospitalAddress: 'Nußbaumstraße 20, 80336 München, Germany',
        coordinates: {
            lat: 48.1351,
            lng: 11.5820,
        },
        category: 'Surgical Equipment',
        budget: '€28,500',
        deadline: '2d',
        urgency: 'moderate',
        description: 'Complete set of surgical instruments for cardiology department',
        competitors: 4,
        rating: 4.9,
        pastOrders: 62,
        contactPerson: 'Prof. Michael Weber',
        contactEmail: 'procurement@stmarys-muc.de',
        contactPhone: '+49 89 4400 52',
        requiredDocuments: [
            'CE marking certificates',
            'Sterilization certificates',
            'Material composition reports',
            'Warranty documentation',
        ],
        deliveryDeadline: 'February 10, 2026',
        paymentTerms: '45 days net',
        specifications: 'Surgical instruments must be made of medical-grade stainless steel, autoclavable, and come with comprehensive warranty.',
        items: [
            {
                id: 1,
                name: 'Scalpel Handle Set',
                quantity: 20,
                unit: 'sets',
                specification: 'Sizes 3, 4, 7 - Stainless steel',
            },
            {
                id: 2,
                name: 'Surgical Scissors',
                quantity: 50,
                unit: 'pieces',
                specification: 'Mayo and Metzenbaum varieties',
            },
            {
                id: 3,
                name: 'Forceps Set',
                quantity: 100,
                unit: 'pieces',
                specification: 'Various types for cardiac surgery',
            },
            {
                id: 4,
                name: 'Needle Holders',
                quantity: 30,
                unit: 'pieces',
                specification: 'Mayo-Hegar, different sizes',
            },
        ],
    },
}
