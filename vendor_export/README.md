# Vendor Matcher Export

Self-contained vendor matching system that maps medicines from extracted RFQ documents to vendors from a master index, scoring based on user preferences.

## Folder Structure

```
vendor_export/
├── backend/
│   ├── app.py           # Flask API server
│   ├── matcher.py       # Core matching logic
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── VendorMatcher.tsx  # Main React component
│   └── VendorSearch.tsx   # Vendor search/scoring component
├── data/
│   ├── master_index.json  # Vendor database (15,000 vendors)
│   └── extracted/         # Extracted RFQ JSON files
│       └── *_extracted.json
└── README.md
```

## Setup

### 1. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Add your data

- Copy `master_index.json` to `data/master_index.json`
- Copy extracted RFQ JSONs to `data/extracted/`

### 3. Run the backend

```bash
cd backend
python app.py
```

Server runs on http://127.0.0.1:5002

## API Endpoints

### List Documents
```
GET /api/documents
```

### Get Medicines for a Document
```
GET /api/documents/<doc_id>/medicines
```

### Find Vendors for a Medicine
```
GET /api/vendors?sku=Paracetamol&quantity=100&prefs=time,quality&top=10
```

Query params:
- `sku` or `medicine`: Medicine name (INN)
- `quantity`: Required quantity (default 1)
- `prefs`: Comma-separated: `time`, `quality`, `quantity`, `resource-saving`
- `top`: Max vendors to return (default 10)

### Match All Medicines in a Document
```
POST /api/match-all
Content-Type: application/json

{
  "document_id": "65768537-3415-4543-a415-eb4017cbe7c7",
  "preferences": ["time", "quality"],
  "top_per_medicine": 5
}
```

## Scoring Logic

| Preference       | qty   | cost  | delivery | quality | reliability |
|------------------|-------|-------|----------|---------|-------------|
| time             | 0.15  | 0.05  | 0.50     | 0.15    | 0.15        |
| quality          | 0.15  | 0.05  | 0.10     | 0.50    | 0.20        |
| quantity         | 0.50  | 0.10  | 0.10     | 0.15    | 0.15        |
| resource-saving  | 0.20  | 0.50  | 0.10     | 0.10    | 0.10        |
| balanced         | 0.25  | 0.25  | 0.15     | 0.20    | 0.15        |

When multiple preferences are selected, weights are averaged.

## Frontend Usage (React)

```tsx
import VendorMatcher from './frontend/VendorMatcher'

// Fetch medicines from API
const res = await fetch('http://127.0.0.1:5002/api/documents/<doc_id>/medicines')
const { medicines } = await res.json()

// Render
<VendorMatcher demands={medicines} apiBase="http://127.0.0.1:5002" />
```

## Features

- **4 preference options**: Time, Quality, Quantity, Resource-saving (multi-select)
- **Weighted scoring**: Preferences are averaged when multiple selected
- **Click-to-expand**: Click a medicine to see vendor recommendations
- **Top vendor highlighted**: Best match shown prominently
- **Selection tracking**: Selected vendors shown in summary
