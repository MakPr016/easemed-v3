# ⚡ EASEMED RFQ Parser - Quick Start Guide

## 🚀 30-Second Setup

### Windows
```bash
cd meow
START.bat
```

### macOS/Linux
```bash
cd meow
chmod +x START.sh
./START.sh
```

---

## ✅ What Happens

1. **Backend starts** on `http://localhost:5001` (Flask API)
2. **Frontend loads** on `http://localhost:3000` (React UI)
3. Open browser → **Drop your RFQ PDF** → Get JSON instantly

---

## 🎯 What You Can Do

| Action | Steps | Output |
|--------|-------|--------|
| **Extract RFQ** | Upload PDF → Parse | JSON with all data |
| **View Requirements** | Click "Requirements" tab | Vendor qualifications (filterable) |
| **See Medicines** | Click "Medicines" tab | 159+ items (sortable, searchable) |
| **Export JSON** | Click "Export JSON" | Download complete extraction |
| **Export CSV** | Click "Export CSV" | Medicines table as spreadsheet |
| **View Dashboard** | Click "Overview" | RFQ metadata & statistics |

---

## 📁 Key Files

```
meow/
├── backend/
│   ├── app.py              ← Flask API server
│   ├── rfq_parser.py       ← PDF extraction logic
│   └── requirements.txt    ← Python packages
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         ← Main React app
│   │   └── components/     ← UI components
│   └── package.json        ← Node packages
│
└── README.md               ← Full documentation
```

---

## 🔗 API Endpoints (for developers)

```
POST   /api/upload                           → Upload PDF
POST   /api/parse/<id>                       → Parse document
GET    /api/document/<id>                    → Get all data
GET    /api/document/<id>/requirements       → Get requirements table
GET    /api/document/<id>/medicines          → Get medicines table
GET    /api/document/<id>/export/json        → Export as JSON
GET    /api/document/<id>/export/csv         → Export as CSV
GET    /api/documents                        → List all documents
```

---

## 🎨 Frontend Tabs

| Tab | Purpose | Shows |
|-----|---------|-------|
| 📋 Overview | Dashboard view | RFQ metadata, contract terms, delivery |
| ✅ Requirements | Vendor eligibility | QMS, licenses, documents needed |
| 💊 Medicines | Supply items | 159 medicines with specs |
| `{ }` JSON | Raw data | Complete extraction for backend |
| 📋 Documents | History | All uploaded RFQs |

---

## 💾 Extracted Data Includes

✅ **RFQ Metadata**
- Reference ID, organization, dates, currency, validity

✅ **Vendor Requirements**
- Legal (QMS, ISO, registration)
- Technical (experience, references)
- Financial (payment terms, VAT)
- Documents needed

✅ **Line Items (Medicines)**
- INN name, dosage, form
- Brand/generic allowed
- Unit of issue

✅ **Delivery Requirements**
- Location, transport mode, expiry
- Customs, packaging

✅ **Evaluation Criteria**
- Scoring method
- Post-qualification rules

---

## 🐛 If Something Goes Wrong

**Backend won't start:**
```bash
cd meow/backend
pip install -r requirements.txt
python app.py
```

**Frontend won't start:**
```bash
cd meow/frontend
npm install
npm run dev
```

**Port already in use:**
```bash
# Kill process on port 5001 (backend)
Windows: netstat -ano | findstr :5001 → taskkill /PID <PID>
macOS:   lsof -i :5001 → kill -9 <PID>
Linux:   lsof -i :5001 → kill -9 <PID>
```

---

## 🎓 Example Workflow

### 1. Have your RFQ PDF ready
(The IOM RFQ you shared is perfect for testing)

### 2. Start the system
```bash
cd meow
START.bat  # or ./START.sh
```

### 3. Open http://localhost:3000

### 4. Upload RFQ
- Drag PDF into upload box
- Click "🚀 Parse RFQ"
- Wait 2-5 seconds

### 5. Explore Data
- **📋 Overview** → See RFQ at a glance
- **✅ Requirements** → Search vendor requirements
- **💊 Medicines** → Sort/filter 159 items
- **📄 JSON** → Copy raw data
- **💾 Export** → Download as JSON or CSV

### 6. Integrate
Send JSON to your EASEMED backend for:
- Vendor scoring
- Supply chain risk analysis
- RFQ tracking

---

## 🚀 Next Steps

1. **Test with your RFQ PDF** → Verify extraction accuracy
2. **Check the JSON output** → Review extracted data structure
3. **Connect to EASEMED backend** → See Integration Guide in README.md
4. **Customize parser** → Modify rfq_parser.py for your PDF format

---

## 📞 Need Help?

- **Full docs:** Read `meow/README.md`
- **API errors:** Check `http://localhost:5001/api/health`
- **Browser console:** Press F12 → Console tab
- **Backend logs:** Watch terminal where `python app.py` runs

---

**Ready? Let's extract some RFQs! 🎉**
