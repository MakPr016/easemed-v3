"""
Vendor Mapper API

Flask backend that:
1. Lists extracted documents from meow/extracted_data
2. Returns medicines (line_items) per document
3. Matches medicines to vendors from master_index.json
4. Scores vendors based on user preferences (time, quality, quantity, resource-saving)
"""
import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

# Ensure project root is in path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from vendor_mapper.matcher import (
    list_extracted_documents,
    load_document_medicines,
    match_medicine_to_vendors,
    find_vendors_for_medicine,
    score_vendors,
)

app = Flask(__name__)
CORS(app)


@app.route('/api/documents', methods=['GET'])
def get_documents():
    """List all extracted documents."""
    docs = list_extracted_documents()
    return jsonify({'documents': docs})


@app.route('/api/documents/<doc_id>/medicines', methods=['GET'])
def get_document_medicines(doc_id: str):
    """Get medicines (line_items) for a document."""
    medicines = load_document_medicines(doc_id)
    return jsonify({
        'document_id': doc_id,
        'count': len(medicines),
        'medicines': medicines
    })


@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    """
    Find and score vendors for a medicine.
    
    Query params:
        - sku or medicine: medicine name (INN)
        - quantity: required quantity (default 1)
        - prefs: comma-separated preferences (time,quality,quantity,resource-saving)
        - top: max vendors to return (default 10)
    """
    medicine = request.args.get('sku') or request.args.get('medicine') or ''
    quantity = int(request.args.get('quantity', 1))
    prefs_str = request.args.get('prefs', '')
    prefs = [p.strip() for p in prefs_str.split(',') if p.strip()]
    top_n = int(request.args.get('top', 10))
    
    if not medicine:
        return jsonify({'error': 'Provide sku or medicine query param'}), 400
    
    result = match_medicine_to_vendors(medicine, quantity, prefs, top_n)
    return jsonify(result)


@app.route('/api/match-all', methods=['POST'])
def match_all_medicines():
    """
    Match all medicines in a document to vendors.
    
    Body JSON:
        {
            "document_id": "...",
            "preferences": ["time", "quality"],
            "top_per_medicine": 5
        }
    
    Returns:
        {
            "document_id": "...",
            "matches": [
                {
                    "medicine": "...",
                    "quantity": ...,
                    "top_vendor": {...},
                    "other_vendors": [...]
                },
                ...
            ]
        }
    """
    data = request.get_json() or {}
    doc_id = data.get('document_id', '')
    preferences = data.get('preferences', [])
    top_n = int(data.get('top_per_medicine', 5))
    
    if not doc_id:
        return jsonify({'error': 'Provide document_id in body'}), 400
    
    medicines = load_document_medicines(doc_id)
    matches = []
    for med in medicines:
        inn = med.get('inn_name', '')
        qty = 1
        # Try to parse quantity from unit_of_issue or a quantity field if present
        if isinstance(med.get('quantity'), (int, float)):
            qty = int(med['quantity'])
        
        result = match_medicine_to_vendors(inn, qty, preferences, top_n)
        result['line_item_id'] = med.get('line_item_id')
        result['dosage'] = med.get('dosage')
        result['form'] = med.get('form')
        matches.append(result)
    
    return jsonify({
        'document_id': doc_id,
        'total_medicines': len(medicines),
        'matches': matches
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    import threading
    port = int(os.environ.get('PORT', 5002))
    print(f'Vendor Mapper API running on http://127.0.0.1:{port}')
    
    def run_server():
        app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False, threaded=True)
    
    thread = threading.Thread(target=run_server, daemon=True)
    thread.start()
    
    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        print('Shutting down...')
