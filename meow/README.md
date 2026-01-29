# 🏥 EASEMED RFQ Parser - Comprehensive Setup & Usage Guide

> **Drop a PDF. Get structured JSON. Analyze like a pro.**

---

## 📋 What This System Does

The EASEMED RFQ Parser is a **complete PDF-to-JSON intelligence extraction system** that:

- 📄 Parses RFQ PDFs intelligently (UN-grade, enterprise-level)
- 🔍 Extracts all structured data (metadata, vendors, medicines, requirements, delivery)
- 📊 Displays data in beautiful, searchable tables
- 💾 Exports to JSON & CSV for backend integration
- 🎯 Seamless React frontend for navigation

**Real-world use case:** IOM RFQ for 159 medicines with vendor requirements, eligibility rules, and delivery terms → All extracted automatically.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git (optional)

### Step 1: Install Backend Dependencies

```bash
cd meow/backend
pip install -r requirements.txt
```

### Step 2: Start the Flask Backend

```bash
python app.py
```

Output:
```
 * Running on http://127.0.0.1:5001
```

### Step 3: Install Frontend Dependencies

In a **new terminal**:
```bash
cd meow/frontend
npm install
npm run dev
```

Output:
```
  ➜  Local:   http://localhost:3000/
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

---

## 📁 Project Structure

```
meow/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── rfq_parser.py          # PDF extraction engine
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React app
│   │   ├── index.css         # Global styles
│   │   └── components/       # React components
│   │       ├── PDFUploader.jsx
│   │       ├── DocumentDashboard.jsx
│   │       ├── RequirementsTable.jsx
│   │       ├── MedicinesTable.jsx
│   │       ├── MetadataPanel.jsx
│   │       ├── JSONViewer.jsx
│   │       └── DocumentList.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── uploads/                   # Uploaded PDFs (auto-created)
├── extracted_data/            # JSON exports (auto-created)
└── README.md
```

---

## 🎯 Usage Workflow

### **Phase 1: Upload**
1. Open http://localhost:3000
2. Click "📤 Upload" tab
3. Drag & drop your RFQ PDF OR click to select
4. Click "🚀 Parse RFQ"
5. System automatically:
   - Uploads PDF to backend
   - Parses using intelligent PDF extraction
   - Saves JSON to `extracted_data/`

### **Phase 2: Explore**
System extracts into 5 sections:

| Tab | What's Inside | Example Data |
|-----|---------------|--------------|
| **Overview** | RFQ metadata, contract terms, delivery | RFQ ID, deadline, currency, vendor count |
| **Requirements** | Vendor eligibility, QMS, documents needed | ISO 9001, licenses, 3 references required |
| **Medicines** | All 159 line items (searchable, sortable, paginated) | Item #1: Acetylsalicylic acid 81mg tablet |
| **JSON** | Raw exported data (copy to clipboard) | Complete structured JSON |
| **Documents** | All parsed RFQs (history) | Previous uploads |

### **Phase 3: Export**
Click buttons in dashboard:
- **💾 Export JSON** → Save as `.json` for backend
- **📊 Export CSV** → Medicines table as `.csv`
- **📤 New Upload** → Start fresh

---

## 🔧 Backend API Endpoints

All endpoints return JSON. Base URL: `http://localhost:5001/api`

### Upload & Parse

**POST** `/upload`
```json
{
  "file": "multipart form data (PDF)"
}
```
Response:
```json
{
  "status": "uploaded",
  "document_id": "uuid-here",
  "filename": "original_name.pdf"
}
```

**POST** `/parse/<document_id>`
```
No body needed
```
Response: Complete extracted JSON (see Schema below)

### Retrieve Data

**GET** `/document/<document_id>`
→ Full document with all data

**GET** `/document/<document_id>/requirements`
→ Vendor requirements table format

**GET** `/document/<document_id>/medicines`
→ Medicines/line items table format

**GET** `/document/<document_id>/metadata`
→ RFQ metadata, delivery, evaluation criteria

**GET** `/documents`
→ List all parsed documents

### Export

**GET** `/document/<document_id>/export/json`
→ JSON export (download-ready)

**GET** `/document/<document_id>/export/csv`
→ CSV export (medicines table)

---

## 📊 Extracted Data Schema

### Complete JSON Structure
```json
{
  "metadata": {
    "rfq_id": "RFQPROC-2023-0397",
    "issuer_org": "IOM Lebanon",
    "issue_date": "02 May 2023",
    "submission_deadline": "17 May 2023 4:00PM Beirut Time",
    "currency": "USD",
    "quotation_validity_days": 90,
    "contract_type": "long_term_agreement",
    "evaluation_method": "lowest_price_per_line_item",
    "vendors_to_select": 2,
    "local_only": true,
    "delivery_location": "IOM Lebanon, Beirut"
  },
  
  "vendor_requirements": {
    "legal_requirements": [
      "cGMP_certification",
      "ISO_9001",
      "product_registration"
    ],
    "technical_requirements": [
      {
        "type": "min_years_experience",
        "value": 1
      },
      {
        "type": "required_references",
        "count": 3
      }
    ],
    "financial_requirements": [
      "prices_inclusive_vat",
      {
        "type": "payment_term",
        "percentage": 100,
        "days": 30
      }
    ],
    "mandatory_documents": [
      "quotation_submission_form",
      "technical_financial_offer",
      "qms_certificate",
      "product_registration_certificate"
    ]
  },
  
  "line_items": [
    {
      "line_item_id": 1,
      "inn_name": "Acetylsalicylic acid",
      "dosage": "81 mg",
      "form": "tablet",
      "brand_allowed": true,
      "generic_allowed": true,
      "unit_of_issue": "box"
    },
    ...
    { "line_item_id": 159, ... }
  ],
  
  "delivery_requirements": {
    "delivery_location": "IOM Lebanon, Ramlet El Bayda",
    "transport_mode": "land",
    "min_expiry_months": 12,
    "customs_by": "not_applicable",
    "packaging": "standard"
  },
  
  "evaluation_criteria": {
    "primary_criteria": "lowest_price_substantially_compliant",
    "post_qualification_required": true,
    "post_qualification_methods": [
      "accuracy_verification",
      "compliance_validation",
      "reference_checking",
      "physical_inspection"
    ],
    "compliance_factors": [
      "full_compliance_with_requirements",
      "acceptance_of_general_conditions",
      "completeness_of_offer"
    ]
  },
  
  "summary": {
    "total_line_items": 159,
    "total_mandatory_documents": 4,
    "vendor_selection_method": "lowest_price_per_line_item"
  },
  
  "extracted_at": "2023-05-10T12:34:56.789Z"
}
```

---

## 🎨 UI Features

### 📤 Uploader Component
- Drag & drop support
- File type validation
- Real-time progress
- Error handling

### 📊 Dashboard Navigation
- Tabbed interface (Overview, Requirements, Medicines, JSON, Documents)
- Export buttons (JSON, CSV, New Upload)
- Document ID tracking

### ✅ Requirements Table
- Category filtering (Legal, Technical, Financial, Document)
- Search functionality
- Card-based layout with badges
- Summary statistics

### 💊 Medicines Table
- Sortable columns (click headers)
- Searchable (INN name, dosage, form)
- Pagination (10/25/50/100 items per page)
- Form distribution footer
- Responsive grid

### 📋 Metadata Panel
- RFQ info cards
- Contract terms
- Delivery requirements
- Evaluation criteria
- Summary statistics

### 📄 JSON Viewer
- Syntax-highlighted JSON
- Copy-to-clipboard button
- Dark theme
- Max-height scrollable

---

## 🔌 Integration with EASEMED Backend

### How to Connect to Your Main System

**Step 1: In your EASEMED backend, create an endpoint:**

```python
# In your Flask app or equivalent
from requests import post

def ingest_rfq_json(json_data):
    """
    Receives parsed RFQ from meow/backend/app.py
    
    json_data contains:
    - vendor_requirements → Populates vendor eligibility rules
    - line_items → Creates supply items
    - metadata → Updates RFQ record
    """
    
    # Example: Store vendor requirements
    for req in json_data['vendor_requirements']['legal_requirements']:
        store_vendor_requirement(req)
    
    # Example: Create medicines catalog
    for item in json_data['line_items']:
        create_supply_item(
            item['inn_name'],
            item['dosage'],
            item['form']
        )
    
    return {"status": "ingested"}
```

**Step 2: Call from RFQ Parser:**

```python
# In meow/backend/app.py, after parsing:
import requests

@app.route('/api/parse/<document_id>', methods=['POST'])
def parse_document(document_id):
    # ... existing code ...
    extracted_data = parser.parse_pdf(pdf_path)
    
    # Forward to EASEMED backend
    requests.post(
        'http://localhost:5000/api/ingest-rfq',
        json=extracted_data
    )
    
    return jsonify(extracted_data), 200
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check if port 5001 is free
lsof -i :5001  # macOS/Linux
netstat -ano | findstr :5001  # Windows
```

### Frontend won't build
```bash
cd meow/frontend
rm -rf node_modules
npm install
npm run dev
```

### PDF not parsing correctly
- Ensure PDF is text-based (not scanned image)
- Check file size (max 50MB)
- Verify RFQ structure matches expected format

### CORS errors
Backend CORS is enabled. Check:
```python
# In app.py (should exist)
from flask_cors import CORS
CORS(app)
```

---

## 📈 Performance Notes

| Metric | Expected |
|--------|----------|
| PDF upload | < 2 seconds |
| Parsing | 1-5 seconds (depends on PDF complexity) |
| JSON export | < 100ms |
| Table render (159 items) | < 500ms |
| Search/filter | < 200ms |

---

## 🔐 Security Considerations

- PDFs stored in `uploads/` (temporary)
- No data persisted to database by default
- CORS enabled for localhost development
- For production: Enable authentication, HTTPS, database storage

---

## 🎓 Advanced Usage

### Custom PDF Parsing Logic

Edit `meow/backend/rfq_parser.py`:

```python
class RFQParser:
    def _extract_custom_field(self):
        """Add your own extraction logic"""
        pattern = r'your_regex_here'
        match = re.search(pattern, self.text)
        return match.group(1) if match else None
```

### Extend Line Item Fields

```python
# In _extract_line_items():
line_items.append({
    'line_item_id': item_no,
    'inn_name': inn_name,
    'custom_field': extract_custom_field()  # Add your logic
})
```

---

## 📞 Support

For issues or questions:
1. Check logs: `meow/backend/*.log`
2. Verify API response: `http://localhost:5001/api/health`
3. Test with sample PDF (provided in examples/)
4. Check browser console (F12 → Console tab)

---

## 📝 License

Part of EASEMED Trade Risk Platform.

---

**Happy Parsing! 🚀**

*Made with ❤️ for procurement intelligence*
