import os
import json
import uuid
import math
import re
import shutil
import asyncio
import pdfplumber
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'uploaded')
MASTER_INDEX_PATH = os.path.join(BASE_DIR, 'data', 'master_index.json')

os.makedirs(DATA_DIR, exist_ok=True)

_MASTER_INDEX_CACHE = {}

def load_master_index():
    global _MASTER_INDEX_CACHE
    if _MASTER_INDEX_CACHE: return _MASTER_INDEX_CACHE
    if os.path.exists(MASTER_INDEX_PATH):
        with open(MASTER_INDEX_PATH, 'r', encoding='utf-8') as f:
            _MASTER_INDEX_CACHE = json.load(f)
    return _MASTER_INDEX_CACHE

def clean_text(text: Optional[str]) -> str:
    return text.replace('\n', ' ').strip() if text else ""

def is_garbage_row(row_text: str) -> bool:
    blacklist = [
        "click or tap",
        "enter text",
        "rfq reference",
        "signature",
        "date:",
        "authorized by",
        "page ",
        "payment terms"
    ]
    t = row_text.lower()
    return any(bad in t for bad in blacklist)

async def delete_file_safety_net(file_path: str, delay: int = 600):
    await asyncio.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass

def parse_pdf_file(file_path: str) -> List[Dict[str, Any]]:
    extracted_items = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    cleaned_row = [clean_text(cell) for cell in row if cell is not None and clean_text(cell) != ""]
                    if not cleaned_row: continue
                    
                    row_text = " ".join(cleaned_row)
                    if is_garbage_row(row_text): continue
                    if "description" in row_text.lower() and "qty" in row_text.lower(): continue
                    
                    try:
                        qty = 1
                        qty_idx = -1
                        for i in range(len(cleaned_row) - 1, -1, -1):
                            val = cleaned_row[i].replace(',', '').replace('.', '')
                            if val.isdigit() and int(val) < 1000000:
                                qty = int(val)
                                qty_idx = i
                                break
                        
                        if qty_idx == -1: continue

                        desc_idx = 0
                        if re.match(r'^\d+\.?$', cleaned_row[0]) and len(cleaned_row) > 1:
                            desc_idx = 1
                        
                        description = cleaned_row[desc_idx]
                        if re.match(r'^\d+$', description): continue
                        if is_garbage_row(description): continue

                        unit = "Unit"
                        if qty_idx > 0 and qty_idx > desc_idx:
                            potential_unit = cleaned_row[qty_idx - 1]
                            if len(potential_unit) < 20 and potential_unit != description:
                                unit = potential_unit

                        extracted_items.append({
                            "inn_name": description,
                            "quantity": qty,
                            "form": unit,
                            "dosage": ""
                        })
                    except Exception:
                        continue
    return extracted_items

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    load_master_index()

@app.post("/api/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    filename = f"{doc_id}.pdf"
    file_path = os.path.join(DATA_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    background_tasks.add_task(delete_file_safety_net, file_path, 600)
        
    return {"document_id": doc_id, "message": "Upload successful"}

@app.post("/api/parse/{document_id}")
async def parse_document(document_id: str):
    file_path = os.path.join(DATA_DIR, f"{document_id}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        items = parse_pdf_file(file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
        return {
            "document_id": document_id,
            "data": { "line_items": items }
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Parsing failed")

class MatchRequest(BaseModel):
    items: List[Dict[str, Any]]
    preferences: List[str] = []

@app.post("/api/match-all")
async def match_all(req: MatchRequest):
    index = load_master_index()
    vendors = index.get('vendors', [])
    results = []
    
    for item in req.items:
        name = item.get('inn_name') or 'Unknown'
        qty = int(item.get('quantity', 1))
        
        matches = []
        for v in vendors:
            cats = [c.lower() for c in v.get('primary_categories', [])]
            if 'pharmaceuticals' in cats or 'medical devices' in cats:
                 matches.append({
                    'vendor_id': v.get('vendor_id'),
                    'name': v.get('legal_name'),
                    'country': (v.get('countries_served') or ['Unknown'])[0],
                    'landedCost': v.get('landedCost', 10),
                    'deliveryDays': v.get('deliveryDays', 5),
                    'availableQty': v.get('availableQty', 1000),
                    'qualityScore': v.get('confidence_score', 80) / 10.0,
                    'reliabilityScore': 5,
                    'score': 9.5
                })

        results.append({
            "medicine": name,
            "quantity": qty,
            "top_vendor": matches[0] if matches else None,
            "other_vendors": matches[1:5] if len(matches) > 1 else []
        })

    return {"matches": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)