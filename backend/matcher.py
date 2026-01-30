import json
import os
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'extracted')
MASTER_INDEX_PATH = os.path.join(BASE_DIR, 'data', 'master_index.json')

# Global cache variable
_MASTER_INDEX_CACHE = []

def init_master_index():
    """Loads the index into the global cache variable."""
    global _MASTER_INDEX_CACHE
    if os.path.exists(MASTER_INDEX_PATH):
        with open(MASTER_INDEX_PATH, 'r') as f:
            _MASTER_INDEX_CACHE = json.load(f)
        print(f"Loaded {len(_MASTER_INDEX_CACHE)} vendors into memory.")
    else:
        print("Warning: master_index.json not found.")
        _MASTER_INDEX_CACHE = []

def get_master_index():
    """Returns the cached index."""
    return _MASTER_INDEX_CACHE

PRESET_WEIGHTS = {
    'resource-saving': {'quantity': 0.1, 'cost': 0.5, 'delivery': 0.1, 'quality': 0.1, 'reliability': 0.2},
    'time': {'quantity': 0.1, 'cost': 0.1, 'delivery': 0.5, 'quality': 0.1, 'reliability': 0.2},
    'quality': {'quantity': 0.1, 'cost': 0.1, 'delivery': 0.1, 'quality': 0.5, 'reliability': 0.2},
    'quantity': {'quantity': 0.5, 'cost': 0.1, 'delivery': 0.1, 'quality': 0.1, 'reliability': 0.2},
    'default': {'quantity': 0.2, 'cost': 0.2, 'delivery': 0.2, 'quality': 0.2, 'reliability': 0.2}
}

def score_vendors(vendors: List[Dict], target_qty: int, preferences: List[str]):
    w = PRESET_WEIGHTS['default'].copy()
    
    # Improved preference merging (average all selected)
    if preferences:
        active_weights = [PRESET_WEIGHTS.get(p, PRESET_WEIGHTS['default']) for p in preferences]
        if active_weights:
            for key in w:
                w[key] = sum(aw[key] for aw in active_weights) / len(active_weights)

    scored = []
    for v in vendors:
        # Protect against ZeroDivisionError
        s_qty = min(1.0, v.get('availableQty', 0) / target_qty) if target_qty > 0 else 0
        s_cost = 1.0 / (1.0 + (v.get('landedCost', 0) / 100)) 
        s_delivery = 1.0 / (1.0 + (v.get('deliveryDays', 0) / 7))
        s_quality = v.get('qualityScore', 0) / 10.0
        s_reliability = v.get('reliabilityScore', 0) / 10.0

        final_score = (
            w['quantity'] * s_qty +
            w['cost'] * s_cost +
            w['delivery'] * s_delivery +
            w['quality'] * s_quality +
            w['reliability'] * s_reliability
        )
        
        v_copy = v.copy()
        v_copy['score'] = round(final_score * 10, 2)
        scored.append(v_copy)

    return sorted(scored, key=lambda x: x['score'], reverse=True)