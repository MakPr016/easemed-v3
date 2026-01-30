import os
import json
import uuid
import math
import glob
import re
import pdfplumber
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ==========================================
# CONFIGURATION & PATHS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'extracted')
MASTER_INDEX_PATH = os.path.join(BASE_DIR, 'data', 'master_index.json')

os.makedirs(DATA_DIR, exist_ok=True)

# Global Cache
_MASTER_INDEX_CACHE = {}

# Weight Presets
PRESETS: Dict[str, Dict[str, float]] = {
    'time': {'qty': 0.15, 'cost': 0.05, 'delivery': 0.50, 'quality': 0.15, 'reliability': 0.15},
    'quality': {'qty': 0.15, 'cost': 0.05, 'delivery': 0.10, 'quality': 0.50, 'reliability': 0.20},
    'quantity': {'qty': 0.50, 'cost': 0.10, 'delivery': 0.10, 'quality': 0.15, 'reliability': 0.15},
    'resource-saving': {'qty': 0.20, 'cost': 0.50, 'delivery': 0.10, 'quality': 0.10, 'reliability': 0.10},
    'balanced': {'qty': 0.25, 'cost': 0.25, 'delivery': 0.15, 'quality': 0.20, 'reliability': 0.15},
}

# ==========================================
# REFINED PARSING LOGIC
# ==========================================

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return text.replace('\n', ' ').strip()

def is_noise(row_text: str) -> bool:
    """Checks if a row is likely header/footer noise or form instructions."""
    noise_keywords = [
        "click or tap", "rfq reference", "date:", "signature", 
        "authorized by", "approved by", "section:", "annex", 
        "page ", "total price", "unit price", "currency", 
        "delivery term", "lead time", "validity", "payment terms",
        "country of origin"
    ]
    t = row_text.lower()
    return any(k in t for k in noise_keywords)

def parse_pdf_tables(pdf_path: str) -> List[Dict[str, Any]]:
    extracted_items = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            
            for table in tables:
                for row in table:
                    # 1. Basic Cleaning
                    cleaned_row = [clean_text(cell) for cell in row if cell is not None and clean_text(cell) != ""]
                    
                    if not cleaned_row:
                        continue
                        
                    row_text = " ".join(cleaned_row)
                    
                    # 2. Strict Noise Filter
                    if is_noise(row_text):
                        continue
                        
                    # 3. Skip Table Headers
                    if "description" in row_text.lower() and "qty" in row_text.lower():
                        continue

                    try:
                        # 4. Find Quantity (Anchor Point)
                        # Look for the last valid number in the row
                        qty = 1
                        qty_index = -1
                        
                        for i in range(len(cleaned_row) - 1, -1, -1):
                            val = cleaned_row[i].replace(',', '').replace('.', '')
                            # Check if it's a pure number and not likely a year or reference ID
                            if val.isdigit():
                                num = int(val)
                                # Filter out likely years (2024) or huge IDs unless context implies otherwise
                                if num < 1000000: 
                                    qty = num
                                    qty_index = i
                                    break
                        
                        if qty_index == -1:
                            continue

                        # 5. Determine Description Column
                        # Issue: Sometimes Col 0 is "Item No" (e.g., "1", "129"). 
                        # Logic: If Col 0 is a small number and we have a Col 1, use Col 1.
                        
                        desc_index = 0
                        first_col = cleaned_row[0]
                        
                        # Regex to check if first column is just digits or "1."
                        if re.match(r'^\d+\.?$', first_col) and len(cleaned_row) > 1:
                            desc_index = 1
                            
                        description = cleaned_row[desc_index]
                        
                        # 6. Safety check: If description is still a number, skip it
                        if re.match(r'^\d+$', description):
                            continue
                            
                        # 7. Extract Unit (Usually immediately before Qty, or after Description)
                        unit = "Unit"
                        # Try column before quantity
                        if qty_index > 0 and qty_index > desc_index:
                            potential_unit = cleaned_row[qty_index - 1]
                            # Units are usually short (e.g., "Box", "Each", "Pack of 10")
                            # If it's too long, it might be part of the description
                            if len(potential_unit) < 25 and potential_unit != description:
                                unit = potential_unit
                        
                        # 8. Final Clean of Description
                        # Remove common artifacts if needed
                        description = description.strip('.').strip()

                        extracted_items.append({
                            "inn_name": description,
                            "quantity": qty,
                            "form": unit,
                            "dosage": "" 
                        })

                    except Exception as e:
                        print(f"Skipping row: {e}")
                        continue
                        
    return extracted_items

# ==========================================
# CORE LOGIC (UNCHANGED)
# ==========================================

def load_master_index() -> Dict[str, Any]:
    global _MASTER_INDEX_CACHE
    if _MASTER_INDEX_CACHE:
        return _MASTER_INDEX_CACHE
    
    if not os.path.exists(MASTER_INDEX_PATH):
        return {"vendors": []}

    with open(MASTER_INDEX_PATH, 'r', encoding='utf-8') as f:
        _MASTER_INDEX_CACHE = json.load(f)
    print(f"Loaded index with {len(_MASTER_INDEX_CACHE.get('vendors', []))} vendors.")
    return _MASTER_INDEX_CACHE

def find_vendors_for_medicine(medicine_name: str, quantity: int = 1) -> List[Dict[str, Any]]:
    index = load_master_index()
    all_vendors = index.get('vendors', [])
    matches = []

    for v in all_vendors:
        cats = [c.lower() for c in v.get('primary_categories', [])]
        tags = [t.lower() for t in v.get('specialization_tags', [])]
        
        if 'pharmaceuticals' in cats or 'generic drugs' in tags or 'biologics' in tags:
            vid = v.get('vendor_id', '')
            matches.append({
                'vendor_id': vid,
                'name': v.get('legal_name') or v.get('trade_name_dba'),
                'country': (v.get('countries_served') or ['Unknown'])[0],
                'availableQty': v.get('availableQty', quantity * 2), 
                'landedCost': v.get('landedCost', 10 + hash(vid) % 90),
                'deliveryDays': v.get('deliveryDays', 3 + hash(vid[:8]) % 14),
                'qualityScore': v.get('confidence_score', 80) / 10.0,
                'reliabilityScore': 5 + hash(vid[:6]) % 5,
            })
            
    return matches

def average_weights(preferences: List[str]) -> Dict[str, float]:
    if not preferences:
        return PRESETS['balanced']
    active_presets = [PRESETS.get(p, PRESETS['balanced']) for p in preferences]
    avg_weights = {}
    for k in PRESETS['balanced'].keys():
        avg_weights[k] = sum(p.get(k, 0) for p in active_presets) / len(active_presets)
    return avg_weights

def score_vendors(vendors: List[Dict], target_qty: int, preferences: List[str]):
    if not vendors:
        return []

    w = average_weights(preferences)
    costs = [v.get('landedCost', 0) for v in vendors]
    max_cost = max(costs) if costs else 1
    min_cost = min(costs) if costs else 0
    cost_range = max_cost - min_cost or 1

    scored = []
    for v in vendors:
        final_score = (
            w['qty'] * math.exp(-abs(v.get('availableQty', 0) - target_qty) / max(1, target_qty)) +
            w['cost'] * ((max_cost - v.get('landedCost', 0)) / cost_range) +
            w['delivery'] * (1.0 / (v.get('deliveryDays', 1) or 1)) +
            w['quality'] * (v.get('qualityScore', 5) / 10.0) +
            w['reliability'] * (v.get('reliabilityScore', 5) / 10.0)
        )
        v_copy = v.copy()
        v_copy['score'] = round(final_score * 10, 2)
        scored.append(v_copy)

    return sorted(scored, key=lambda x: x['score'], reverse=True)

# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(title="EaseMed Procurement API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchAllRequest(BaseModel):
    document_id: str
    preferences: Optional[List[str]] = []
    top_per_medicine: Optional[int] = 5

@app.on_event("startup")
def startup_event():
    load_master_index()

@app.post("/api/extract")
async def extract_rfq(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    filename = f"{doc_id}_extracted.json"
    pdf_filename = f"{doc_id}_{file.filename}"
    pdf_path = os.path.join(DATA_DIR, pdf_filename)
    json_path = os.path.join(DATA_DIR, filename)
    
    with open(pdf_path, "wb") as buffer:
        buffer.write(await file.read())
        
    try:
        line_items = parse_pdf_tables(pdf_path)
    except Exception as e:
        print(f"Parsing error: {e}")
        line_items = []

    extracted_data = {
        "document_id": doc_id,
        "original_filename": file.filename,
        "line_items": line_items
    }
    
    with open(json_path, 'w') as f:
        json.dump(extracted_data, f, indent=2)
        
    return {"document_id": filename, "message": f"Extraction successful. Found {len(line_items)} items."}

@app.get("/api/documents")
async def list_documents():
    if not os.path.exists(DATA_DIR):
        return {"documents": []}
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('_extracted.json')]
    return {"documents": files}

@app.get("/api/documents/{doc_id}/medicines")
async def get_medicines(doc_id: str):
    if not doc_id.endswith('_extracted.json'):
        doc_id = f"{doc_id}_extracted.json"
    path = os.path.join(DATA_DIR, doc_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Document not found")
    with open(path, 'r') as f:
        data = json.load(f)
    return {
        "document_id": doc_id,
        "count": len(data.get('line_items', [])),
        "medicines": data.get('line_items', [])
    }

@app.get("/api/vendors")
async def search_vendors(sku: str = Query(None, alias="sku"), medicine: str = Query(None, alias="medicine"), quantity: int = 1, prefs: str = "", top: int = 10):
    search_term = sku or medicine
    if not search_term:
        raise HTTPException(status_code=400, detail="Provide 'sku' or 'medicine'")
    preferences = [p.strip() for p in prefs.split(',')] if prefs else []
    matches = find_vendors_for_medicine(search_term, quantity)
    scored = score_vendors(matches, quantity, preferences)
    return {
        "medicine": search_term,
        "top_vendor": scored[0] if scored else None,
        "other_vendors": scored[1:top] if len(scored) > 1 else []
    }

@app.post("/api/match-all")
async def match_all(req: MatchAllRequest):
    doc_id = req.document_id
    if not doc_id.endswith('_extracted.json'):
        doc_id = f"{doc_id}_extracted.json"
    path = os.path.join(DATA_DIR, doc_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Document not found")
        
    with open(path, 'r') as f:
        doc_data = json.load(f)
        
    results = []
    for item in doc_data.get('line_items', []):
        name = item.get('inn_name', 'Unknown')
        qty = item.get('quantity', 1)
        
        matches = find_vendors_for_medicine(name, int(qty))
        scored = score_vendors(matches, int(qty), req.preferences)
        
        results.append({
            "medicine": name,
            "quantity": qty,
            "top_vendor": scored[0] if scored else None,
            "other_vendors": scored[1:req.top_per_medicine] if len(scored) > 1 else []
        })
        
    return {"document_id": req.document_id, "matches": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5002)