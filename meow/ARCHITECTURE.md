# EASEMED RFQ Parser - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                      http://localhost:3000                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     React Frontend (Vite)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │   Upload UI  │  │  Dashboard   │  │   Tables     │         │ │
│  │  │   - Drag/Drop│  │  - Tabs      │  │  - Search    │         │ │
│  │  │   - Progress │  │  - Export    │  │  - Sort      │         │ │
│  │  │   - Errors   │  │  - Copy      │  │  - Filter    │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────────┘
                           │ HTTP/JSON
                           │ (CORS enabled)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                              │
│                  http://localhost:5001/api                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      Flask API (Python)                        │ │
│  │  ┌─────────────────────────────────────────────────────────┐  │ │
│  │  │                   API Endpoints                         │  │ │
│  │  │  POST /upload                                          │  │ │
│  │  │  POST /parse/{doc_id}                                  │  │ │
│  │  │  GET  /document/{doc_id}                               │  │ │
│  │  │  GET  /document/{doc_id}/requirements                  │  │ │
│  │  │  GET  /document/{doc_id}/medicines                     │  │ │
│  │  │  GET  /document/{doc_id}/export/json                   │  │ │
│  │  │  GET  /document/{doc_id}/export/csv                    │  │ │
│  │  │  GET  /documents                                       │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  │                            ▲                                    │ │
│  │                            │ Uses                               │ │
│  │  ┌─────────────────────────┴──────────────────────────────┐   │ │
│  │  │            RFQParser Class (rfq_parser.py)             │   │ │
│  │  │                                                        │   │ │
│  │  │  ▪ parse_pdf(filepath)                               │   │ │
│  │  │    └─ _extract_text_from_pdf()                       │   │ │
│  │  │    └─ _extract_metadata()                            │   │ │
│  │  │    └─ _extract_vendor_requirements()                 │   │ │
│  │  │    └─ _extract_line_items()                          │   │ │
│  │  │    └─ _extract_delivery_requirements()               │   │ │
│  │  │    └─ _extract_evaluation_criteria()                 │   │ │
│  │  │    └─ to_json()                                      │   │ │
│  │  │                                                        │   │ │
│  │  │  Regex-based extraction from PDF text                │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                            ▲                                    │ │
│  │                            │ Uses PyPDF2                        │ │
│  │  ┌─────────────────────────┴──────────────────────────────┐   │ │
│  │  │         PDF Processing (PyPDF2 library)               │   │ │
│  │  │                                                        │   │ │
│  │  │  ▪ Read PDF file                                      │   │ │
│  │  │  ▪ Extract raw text from each page                    │   │ │
│  │  │  ▪ Clean and normalize text                           │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┬──────────────┐
                ▼                     ▼              ▼
         ┌────────────────┐  ┌──────────────┐  ┌──────────────┐
         │  uploads/      │  │ extracted_   │  │  In-Memory   │
         │  *.pdf         │  │  data/*.json │  │  Cache       │
         │                │  │              │  │              │
         │  Temp storage  │  │  Persistent  │  │  Fast access │
         │  (50MB limit)  │  │  JSON output │  │  during      │
         │                │  │              │  │  session     │
         └────────────────┘  └──────────────┘  └──────────────┘
```

---

## 📊 Data Flow Sequence

```
1. USER UPLOADS PDF
   ├─ Browser (React)
   │  └─ File dropped/selected
   │     └─ POST /api/upload
   │
2. BACKEND RECEIVES FILE
   ├─ Flask app.py
   │  └─ Save to: uploads/
   │  └─ Generate UUID (document_id)
   │  └─ Return document_id to frontend
   │
3. FRONTEND INITIATES PARSE
   ├─ POST /api/parse/{document_id}
   │
4. BACKEND PARSES PDF
   ├─ RFQParser.parse_pdf(filepath)
   │  ├─ Extract raw text (PyPDF2)
   │  ├─ Extract metadata (regex)
   │  │  ├─ RFQ ID, dates, currency, etc.
   │  ├─ Extract vendor requirements (regex)
   │  │  ├─ QMS, documents, min experience
   │  ├─ Extract line items (regex + heuristics)
   │  │  ├─ 159 medicines with specs
   │  ├─ Extract delivery requirements (regex)
   │  │  ├─ Location, transport, expiry
   │  ├─ Extract evaluation criteria (regex)
   │  │  ├─ Scoring method, post-qual
   │  └─ Return complete JSON
   │
5. BACKEND STORES RESULTS
   ├─ Cache in-memory (parsed_documents dict)
   ├─ Save to: extracted_data/{doc_id}_extracted.json
   ├─ Return JSON to frontend
   │
6. FRONTEND DISPLAYS DASHBOARD
   ├─ Fetch & cache all sections:
   │  ├─ GET /api/document/{doc_id}
   │  ├─ GET /api/document/{doc_id}/requirements
   │  ├─ GET /api/document/{doc_id}/medicines
   │  ├─ GET /api/document/{doc_id}/metadata
   │
7. FRONTEND DISPLAYS TABS
   ├─ Overview (metadata)
   ├─ Requirements (table with filter)
   ├─ Medicines (table with search/sort/pagination)
   ├─ JSON (raw data with syntax highlight)
   ├─ Documents (list all parsed)
   │
8. USER EXPORTS
   ├─ Click "Export JSON"
   │  └─ GET /api/document/{doc_id}/export/json
   │  └─ Browser downloads file
   │
   ├─ Click "Export CSV"
   │  └─ GET /api/document/{doc_id}/export/csv
   │  └─ Browser downloads CSV
```

---

## 🔧 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  React App (App.jsx)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State: documentId, currentView, documents            │   │
│  │ Routes: upload → dashboard → list                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         ▲                     ▲                     ▲         │
│         │ children            │ children           │ children│
│         │ props               │ props              │ props   │
│         ▼                     ▼                     ▼         │
│  ┌─────────────────┐ ┌──────────────────┐ ┌────────────┐   │
│  │ PDFUploader     │ │ DocumentDashboard│ │ DocumentList
│  │                 │ │                  │ │            │   │
│  │ • File input    │ │ • Tabs           │ │ • Cards    │   │
│  │ • Drag/drop     │ │ • Sub-components │ │ • Refresh  │   │
│  │ • Upload logic  │ │                  │ │            │   │
│  └─────────────────┘ │ ┌──────────────┐ │ └────────────┘   │
│                      │ │RequirementsT.│ │                  │
│                      │ ├──────────────┤ │                  │
│                      │ │MedicinesTable│ │                  │
│                      │ ├──────────────┤ │                  │
│                      │ │MetadataPanel │ │                  │
│                      │ ├──────────────┤ │                  │
│                      │ │JSONViewer    │ │                  │
│                      │ └──────────────┘ │                  │
│                      └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
        ▲                                          ▲
        │ HTTP/JSON (Axios/Fetch)                │
        │ CORS enabled                            │
        ▼                                          ▼
    [Backend API] ◄──────────────────► [Uploaded Files]
    http://5001/api                   http://5001/files
```

---

## 📦 Data Structure (JSON Schema)

```
RFQ Document
│
├─ metadata
│  ├─ rfq_id: string
│  ├─ issuer_org: string
│  ├─ issue_date: string
│  ├─ submission_deadline: string
│  ├─ currency: string
│  ├─ quotation_validity_days: number
│  ├─ contract_type: enum
│  ├─ evaluation_method: enum
│  ├─ vendors_to_select: number
│  ├─ local_only: boolean
│  └─ delivery_location: string
│
├─ vendor_requirements
│  ├─ legal_requirements: string[]
│  ├─ technical_requirements: object[]
│  ├─ financial_requirements: (string|object)[]
│  └─ mandatory_documents: string[]
│
├─ line_items: array
│  └─ [0..159]
│     ├─ line_item_id: number
│     ├─ inn_name: string
│     ├─ dosage: string
│     ├─ form: string
│     ├─ brand_allowed: boolean
│     ├─ generic_allowed: boolean
│     └─ unit_of_issue: string
│
├─ delivery_requirements
│  ├─ delivery_location: string
│  ├─ transport_mode: string
│  ├─ min_expiry_months: number
│  ├─ customs_by: enum
│  └─ packaging: enum
│
├─ evaluation_criteria
│  ├─ primary_criteria: enum
│  ├─ post_qualification_required: boolean
│  ├─ post_qualification_methods: string[]
│  └─ compliance_factors: string[]
│
└─ summary
   ├─ total_line_items: number
   ├─ total_mandatory_documents: number
   └─ vendor_selection_method: string
```

---

## 🔐 Security Layers

```
Layer 1: File Validation
├─ File type check (PDF only)
├─ File size limit (50MB max)
└─ Virus scan (optional)

Layer 2: Data Processing
├─ Text extraction (no code execution)
├─ Regex-based parsing (no eval)
└─ JSON serialization (safe)

Layer 3: API Security
├─ CORS origin whitelist
├─ Rate limiting (optional)
└─ No database injection risk

Layer 4: Storage
├─ Temporary file cleanup
├─ No sensitive data in logs
└─ File permissions restricted
```

---

## 🚀 Performance Profile

```
Phase           Time      Notes
─────────────────────────────────────────────────
Upload          < 1s      File transfer to server
Parsing         1-5s      Depends on PDF size/complexity
Caching         < 100ms   Store in memory
API Response    < 200ms   JSON serialization
Frontend Render < 500ms   Table with 159 items
Search/Filter   < 200ms   Client-side filtering
```

---

## 🔄 Extensibility Points

```
To add new extraction:
┌─────────────────────────────────────────────┐
│ rfq_parser.py                               │
│                                             │
│ RFQParser class:                            │
│   ├─ _extract_metadata() ◄─── EXTEND       │
│   ├─ _extract_vendor_requirements()         │
│   ├─ _extract_line_items()                  │
│   ├─ _extract_delivery_requirements()       │
│   ├─ _extract_evaluation_criteria()         │
│   │                                         │
│   └─ ADD NEW METHOD:                        │
│      _extract_custom_field()                │
│                                             │
│ Then add to to_json():                      │
│   "custom_field": self._extract_custom()    │
└─────────────────────────────────────────────┘
```

---

## 📊 Load Testing Results (Expected)

```
Concurrent Users    Response Time    Success Rate
─────────────────────────────────────────────────
1                   < 200ms          100%
5                   < 300ms          100%
10                  < 500ms          99.9%
25                  < 1s             99%
50+                 Degrade          (Single-threaded)

Note: Use Gunicorn/uWSGI for production multi-threading
```

---

## 🎓 Testing Strategy

```
Unit Tests (Python)
├─ RFQParser regex functions
├─ JSON serialization
└─ Error handling

Integration Tests
├─ Upload → Parse → Export flow
├─ API endpoint responses
└─ File I/O operations

E2E Tests (React)
├─ Upload workflow
├─ Tab navigation
├─ Table search/sort/filter
├─ Export functionality
└─ Document list
```

---

## 🔮 Future Enhancements

```
v1.1 (Priority)
├─ User authentication
├─ Document history/versioning
├─ Batch processing
└─ Scheduled PDF scanning

v1.2 (Nice-to-have)
├─ AI-powered table detection
├─ Multi-language support
├─ Advanced filtering/analytics
└─ Webhook notifications

v2.0 (Long-term)
├─ Machine learning improvements
├─ Real-time collaboration
├─ Advanced vendor matching
└─ Integration marketplace
```

---

**Last Updated:** January 28, 2026  
**System Version:** 1.0.0  
**Status:** Production Ready ✅
