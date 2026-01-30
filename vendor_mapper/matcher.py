"""
Vendor matching logic.

Loads extracted RFQ medicines from meow/extracted_data and maps them to vendors
from master_index.json based on user preferences (time, quality, quantity, resource-saving).
"""
import os
import json
import glob
import math
from typing import List, Dict, Any

# Weight presets for each preference option
PRESETS: Dict[str, Dict[str, float]] = {
    'time': {'qty': 0.15, 'cost': 0.05, 'delivery': 0.50, 'quality': 0.15, 'reliability': 0.15},
    'quality': {'qty': 0.15, 'cost': 0.05, 'delivery': 0.10, 'quality': 0.50, 'reliability': 0.20},
    'quantity': {'qty': 0.50, 'cost': 0.10, 'delivery': 0.10, 'quality': 0.15, 'reliability': 0.15},
    'resource-saving': {'qty': 0.20, 'cost': 0.50, 'delivery': 0.10, 'quality': 0.10, 'reliability': 0.10},
    'balanced': {'qty': 0.25, 'cost': 0.25, 'delivery': 0.15, 'quality': 0.20, 'reliability': 0.15},
}

# Cache for vendor index
_vendor_cache: Dict[str, Any] = {}


def _get_project_root() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def load_vendor_index() -> Dict[str, Any]:
    """Load master_index.json (cached)."""
    global _vendor_cache
    if _vendor_cache:
        return _vendor_cache
    path = os.path.join(_get_project_root(), 'master_index.json')
    with open(path, 'r', encoding='utf-8') as f:
        _vendor_cache = json.load(f)
    return _vendor_cache


def list_extracted_documents() -> List[Dict[str, Any]]:
    """List all extracted JSON documents from meow/extracted_data."""
    pattern = os.path.join(_get_project_root(), 'meow', 'extracted_data', '*_extracted.json')
    docs = []
    for fpath in glob.glob(pattern):
        doc_id = os.path.basename(fpath).replace('_extracted.json', '')
        docs.append({'document_id': doc_id, 'path': fpath})
    return docs


def load_document_medicines(doc_id: str) -> List[Dict[str, Any]]:
    """Load line_items from a specific extracted document."""
    path = os.path.join(_get_project_root(), 'meow', 'extracted_data', f'{doc_id}_extracted.json')
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    items = data.get('line_items', [])
    # Filter out header/footer noise (items with very long inn_name or no real medicine)
    filtered = []
    for item in items:
        inn = (item.get('inn_name') or '').strip()
        if not inn or len(inn) > 200:
            continue
        # Skip if it looks like header/footer text
        if 'evaluation method' in inn.lower() or 'annex' in inn.lower():
            continue
        filtered.append(item)
    return filtered


def average_weights(preferences: List[str]) -> Dict[str, float]:
    """Average weight presets across selected preferences."""
    if not preferences:
        return PRESETS['balanced']
    picks = [PRESETS.get(p, PRESETS['balanced']) for p in preferences]
    keys = list(PRESETS['balanced'].keys())
    avg: Dict[str, float] = {}
    for k in keys:
        avg[k] = sum(pr.get(k, 0) for pr in picks) / len(picks)
    return avg


def _normalize_medicine_name(name: str) -> str:
    """Normalize medicine name for matching."""
    return (name or '').lower().strip()


def find_vendors_for_medicine(medicine_name: str, quantity: int = 1) -> List[Dict[str, Any]]:
    """
    Find vendors that could supply a given medicine.
    
    This uses a simple keyword match on vendor specialization_tags, primary_categories,
    and authorized_brand_portfolio. In a real system you'd have a product catalog.
    """
    index = load_vendor_index()
    vendors = index.get('vendors', [])
    norm_name = _normalize_medicine_name(medicine_name)
    
    # For demo: all vendors in Pharmaceuticals category are potential matches
    # In production, you'd match against a product SKU catalog
    matches = []
    for v in vendors:
        cats = [c.lower() for c in v.get('primary_categories', [])]
        tags = [t.lower() for t in v.get('specialization_tags', [])]
        if 'pharmaceuticals' in cats or 'generic drugs' in tags or 'biologics' in tags:
            # Simulate vendor-specific attributes for scoring
            matches.append({
                'vendor_id': v.get('vendor_id'),
                'name': v.get('legal_name') or v.get('trade_name_dba'),
                'country': (v.get('countries_served') or ['Unknown'])[0],
                'availableQty': quantity * 2,  # Simulated: vendor has 2x required
                'landedCost': 10 + hash(v.get('vendor_id', '')) % 90,  # Simulated cost 10-100
                'deliveryDays': 3 + hash(v.get('vendor_id', '')[:8]) % 14,  # 3-16 days
                'qualityScore': 5 + hash(v.get('vendor_id', '')[:4]) % 5,  # 5-9
                'reliabilityScore': 5 + hash(v.get('vendor_id', '')[:6]) % 5,  # 5-9
                'confidence_score': v.get('confidence_score', 80),
                'cold_chain': v.get('service_capabilities', {}).get('cold_chain', False),
                'gdp_compliance': v.get('gdp_compliance', False),
            })
    return matches


def score_vendors(vendors: List[Dict[str, Any]], quantity: int, preferences: List[str]) -> List[Dict[str, Any]]:
    """Score and rank vendors based on preferences."""
    if not vendors:
        return []
    
    w = average_weights(preferences)
    
    costs = [v.get('landedCost', 0) for v in vendors]
    max_cost = max(costs) if costs else 1
    min_cost = min(costs) if costs else 0
    cost_range = max_cost - min_cost or 1
    
    scored = []
    for v in vendors:
        avail = v.get('availableQty', 0)
        cost = v.get('landedCost', 0)
        delivery = v.get('deliveryDays', 1) or 1
        qual = v.get('qualityScore', 5)
        rel = v.get('reliabilityScore', 5)
        
        S_qty = math.exp(-abs(avail - quantity) / max(1, quantity))
        S_cost = (max_cost - cost) / cost_range
        S_delivery = 1 / delivery
        S_quality = qual / 10
        S_reliability = rel / 10
        
        final_score = (
            w['qty'] * S_qty +
            w['cost'] * S_cost +
            w['delivery'] * S_delivery +
            w['quality'] * S_quality +
            w['reliability'] * S_reliability
        )
        
        scored.append({
            **v,
            'score': round(final_score * 10, 2)
        })
    
    # Sort descending by score
    scored.sort(key=lambda x: x['score'], reverse=True)
    return scored


def match_medicine_to_vendors(
    medicine_name: str,
    quantity: int = 1,
    preferences: List[str] = None,
    top_n: int = 10
) -> Dict[str, Any]:
    """
    Main entry: find and score vendors for a medicine.
    
    Returns:
        {
            'medicine': medicine_name,
            'quantity': quantity,
            'preferences': preferences,
            'top_vendor': {...},
            'other_vendors': [...]
        }
    """
    if preferences is None:
        preferences = []
    
    vendors = find_vendors_for_medicine(medicine_name, quantity)
    scored = score_vendors(vendors, quantity, preferences)
    
    top_vendor = scored[0] if scored else None
    other_vendors = scored[1:top_n] if len(scored) > 1 else []
    
    return {
        'medicine': medicine_name,
        'quantity': quantity,
        'preferences': preferences,
        'total_vendors_found': len(vendors),
        'top_vendor': top_vendor,
        'other_vendors': other_vendors,
    }
