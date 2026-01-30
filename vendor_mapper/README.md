# Vendor Mapper

Scans medicines from `meow/extracted_data/*.json` and maps them to vendors from `master_index.json` using weighted scoring based on user preferences.

## Quick Start

```bash
cd vendor_mapper
pip install -r requirements.txt
python app.py
```

Server runs on http://127.0.0.1:5002

## API Endpoints

### List Documents
```
GET /api/documents
```
Returns all extracted documents from `meow/extracted_data/`.

### Get Medicines for a Document
```
GET /api/documents/<doc_id>/medicines
```
Returns all line_items (medicines) from a specific extracted document.

### Find Vendors for a Medicine
```
GET /api/vendors?sku=Paracetamol&quantity=100&prefs=time,quality&top=10
```
Query params:
- `sku` or `medicine`: Medicine name (INN)
- `quantity`: Required quantity (default 1)
- `prefs`: Comma-separated preferences: `time`, `quality`, `quantity`, `resource-saving`
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
Returns top vendors for each medicine in the document.

## Scoring Logic

Weights are averaged across selected preferences:

| Preference       | qty   | cost  | delivery | quality | reliability |
|------------------|-------|-------|----------|---------|-------------|
| time             | 0.15  | 0.05  | 0.50     | 0.15    | 0.15        |
| quality          | 0.15  | 0.05  | 0.10     | 0.50    | 0.20        |
| quantity         | 0.50  | 0.10  | 0.10     | 0.15    | 0.15        |
| resource-saving  | 0.20  | 0.50  | 0.10     | 0.10    | 0.10        |
| balanced (default)| 0.25 | 0.25  | 0.15     | 0.20    | 0.15        |

Score formula:
```
score = w_qty * S_qty + w_cost * S_cost + w_delivery * S_delivery + w_quality * S_quality + w_reliability * S_reliability
```
Where:
- `S_qty = exp(-|available - required| / required)`
- `S_cost = (max_cost - cost) / (max_cost - min_cost)`
- `S_delivery = 1 / delivery_days`
- `S_quality = quality_score / 10`
- `S_reliability = reliability_score / 10`

## Frontend Integration

Use the React components in `components/vendor/`:
- `VendorMatcher.tsx`: Lists medicines, preference checkboxes, vendor selection per med
- `VendorSearch.tsx`: Scores and displays vendors for a single medicine

```tsx
import VendorMatcher from '@/components/vendor/VendorMatcher'

// Fetch medicines from API
const meds = await fetch('/api/documents/<doc_id>/medicines').then(r => r.json())
<VendorMatcher demands={meds.medicines} />
```
