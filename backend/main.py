import os
import json
import math
import re
import io
import pdfplumber
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# We only need the Master Index path now. No "extracted" folder.
MASTER_INDEX_PATH = os.path.join(BASE_DIR, 'data', 'master_index.json')

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
# PARSING LOGIC (In-Memory)
# ==========================================

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return text.replace('\n', ' ').strip()

def is_noise(row_text: str) -> bool:
    noise_keywords = [
        "click or tap", "rfq reference", "date:", "signature", 
        "authorized by", "approved by", "section:", "annex", 
        "page ", "total price", "unit price", "currency", 
        "delivery term", "lead time", "validity", "payment terms",
        "country of origin"
    ]
    t = row_text.lower()
    return any(k in t for k in noise_keywords)

def parse_pdf_stream(file_stream: bytes) -> List[Dict[str, Any]]:
    """
    Parses PDF bytes directly from memory without saving to disk.
    """
    extracted_items = []
    
    # Open the byte stream as a PDF
    with pdfplumber.open(io.BytesIO(file_stream)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    cleaned_row = [clean_text(cell) for cell in row if cell is not None and clean_text(cell) != ""]
                    
                    if not cleaned_row: continue
                    row_text = " ".join(cleaned_row)
                    
                    if is_noise(row_text): continue
                    if "description" in row_text.lower() and "qty" in row_text.lower(): continue

                    try:
                        # Find Quantity (last valid number < 1,000,000)
                        qty = 1
                        qty_index = -1
                        for i in range(len(cleaned_row) - 1, -1, -1):
                            val = cleaned_row[i].replace(',', '').replace('.', '')
                            if val.isdigit():
                                num = int(val)
                                if num < 1000000: 
                                    qty = num
                                    qty_index = i
                                    break
                        
                        if qty_index == -1: continue

                        # Determine Description
                        desc_index = 0
                        first_col = cleaned_row[0]
                        if re.match(r'^\d+\.?$', first_col) and len(cleaned_row) > 1:
                            desc_index = 1
                            
                        description = cleaned_row[desc_index]
                        if re.match(r'^\d+$', description): continue
                            
                        # Extract Unit
                        unit = "Unit"
                        if qty_index > 0 and qty_index > desc_index:
                            potential_unit = cleaned_row[qty_index - 1]
                            if len(potential_unit) < 25 and potential_unit != description:
                                unit = potential_unit
                        
                        description = description.strip('.').strip()

                        extracted_items.append({
                            "inn_name": description,
                            "quantity": qty,
                            "form": unit,
                            "dosage": "" 
                        })
                    except Exception as e:
                        continue
                        
    return extracted_items

# ==========================================
# MATCHING LOGIC (Using Cached Index)
# ==========================================

def load_master_index() -> Dict[str, Any]:
    global _MASTER_INDEX_CACHE
    if _MASTER_INDEX_CACHE:
        return _MASTER_INDEX_CACHE
    
    if not os.path.exists(MASTER_INDEX_PATH):
        print("WARNING: Master index not found.")
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
        
        # In a real scenario, use ElasticSearch/Vector DB here.
        if 'pharmaceuticals' in cats or 'generic drugs' in tags or 'biologics' in tags:
            vid = v.get('vendor_id', '')
            matches.append({
                'vendor_id': vid,
                'name': v.get('legal_name') or v.get('trade_name_dba'),
                'country': (v.get('countries_served') or ['Unknown'])[0],
                'availableQty': v.get('availableQty', quantity * 2), # Simulated data
                'landedCost': v.get('landedCost', 10 + hash(vid) % 90), # Simulated data
                'deliveryDays': v.get('deliveryDays', 3 + hash(vid[:8]) % 14), # Simulated data
                'qualityScore': v.get('confidence_score', 80) / 10.0,
                'reliabilityScore': 5 + hash(vid[:6]) % 5,
            })
    return matches

def average_weights(preferences: List[str]) -> Dict[str, float]:
    if not preferences: return PRESETS['balanced']
    active = [PRESETS.get(p, PRESETS['balanced']) for p in preferences]
    avg = {}
    for k in PRESETS['balanced'].keys():
        avg[k] = sum(p.get(k, 0) for p in active) / len(active)
    return avg

def score_vendors(vendors: List[Dict], target_qty: int, preferences: List[str]):
    if not vendors: return []
    w = average_weights(preferences)
    
    # Normalize Cost
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
        scored.append({**v, 'score': round(final_score * 10, 2)})

    return sorted(scored, key=lambda x: x['score'], reverse=True)

# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(title="EaseMed Stateless API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# New Request Model for Matching
class StatelessMatchRequest(BaseModel):
    items: List[Dict[str, Any]]  # List of items directly from frontend
    preferences: Optional[List[str]] = []
    top_per_medicine: Optional[int] = 5

@app.on_event("startup")
def startup_event():
    load_master_index()

# 1. EXTRACT (Stateless)
@app.post("/api/extract")
async def extract_pdf_stateless(file: UploadFile = File(...)):
    """
    Reads PDF in memory, extracts data, returns JSON.
    DOES NOT SAVE FILE.
    """
    try:
        content = await file.read()
        line_items = parse_pdf_stream(content)
        
        return {
            "status": "success",
            "filename": file.filename,
            "total_items": len(line_items),
            "line_items": line_items # Frontend stores this
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. MATCH (Stateless)
@app.post("/api/match-all")
async def match_items_stateless(req: StatelessMatchRequest):
    """
    Receives list of items + preferences.
    Returns matched vendors.
    """
    results = []
    
    for item in req.items:
        name = item.get('inn_name', 'Unknown')
        qty = item.get('quantity', 1)
        if isinstance(qty, str): qty = 1
        
        matches = find_vendors_for_medicine(name, int(qty))
        scored = score_vendors(matches, int(qty), req.preferences)
        
        results.append({
            "medicine": name,
            "quantity": qty,
            "top_vendor": scored[0] if scored else None,
            "other_vendors": scored[1:req.top_per_medicine] if len(scored) > 1 else []
        })
        
    return {"matches": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5002)