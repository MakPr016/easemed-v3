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
