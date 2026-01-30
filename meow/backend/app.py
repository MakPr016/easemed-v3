"""
EASEMED RFQ Parser API - Flask backend
Provides endpoints for PDF upload, parsing, and data extraction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename
from rfq_parser import RFQParser
from medicine_validator import MedicineValidator
import requests
import re

app = Flask(__name__)
CORS(app)

# Load environment variables from .env in this folder (if present)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Configuration
UPLOAD_FOLDER = '../uploads'
EXTRACTED_FOLDER = '../extracted_data'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(EXTRACTED_FOLDER):
    os.makedirs(EXTRACTED_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# In-memory store of parsed documents
parsed_documents = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'EASEMED RFQ Parser'}), 200

@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    """
    Upload RFQ PDF for parsing
    Returns: document_id for tracking
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files allowed'}), 400
        
        # Generate unique document ID
        doc_id = str(uuid.uuid4())
        filename = secure_filename(f"{doc_id}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save file
        file.save(filepath)
        
        return jsonify({
            'status': 'uploaded',
            'document_id': doc_id,
            'filename': file.filename,
            'filepath': filepath,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/parse/<document_id>', methods=['POST'])
def parse_document(document_id):
    """
    Parse uploaded PDF and extract RFQ data
    Returns: JSON with all extracted data
    """
    try:
        # Find the uploaded file
        files = os.listdir(app.config['UPLOAD_FOLDER'])
        pdf_path = None
        
        for f in files:
            if f.startswith(document_id):
                pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f)
                break
        
        if not pdf_path:
            return jsonify({'error': 'Document not found'}), 404
        
        # Parse PDF
        parser = RFQParser()
        extracted_data = parser.parse_pdf(pdf_path)
        
        # Store parsed data
        parsed_documents[document_id] = extracted_data
        
        # Save to file
        output_path = os.path.join(EXTRACTED_FOLDER, f"{document_id}_extracted.json")
        with open(output_path, 'w') as f:
            json.dump(extracted_data, f, indent=2)
        
        return jsonify({
            'status': 'parsed',
            'document_id': document_id,
            'data': extracted_data,
            'extracted_at': datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>', methods=['GET'])
def get_document(document_id):
    """Retrieve parsed document data"""
    try:
        if document_id not in parsed_documents:
            # Try to load from file
            json_path = os.path.join(EXTRACTED_FOLDER, f"{document_id}_extracted.json")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    parsed_documents[document_id] = json.load(f)
            else:
                return jsonify({'error': 'Document not found'}), 404
        
        return jsonify(parsed_documents[document_id]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/requirements', methods=['GET'])
def get_vendor_requirements(document_id):
    """Get vendor requirements in table format"""
    try:
        if document_id not in parsed_documents:
            return jsonify({'error': 'Document not found'}), 404
        
        doc = parsed_documents[document_id]
        vendor_reqs = doc['vendor_requirements']
        
        # Convert to table format
        requirements_table = []
        
        # Legal requirements
        for req in vendor_reqs.get('legal_requirements', []):
            requirements_table.append({
                'category': 'Legal',
                'requirement': req.replace('_', ' ').title(),
                'mandatory': True
            })
        
        # Technical requirements
        for req in vendor_reqs.get('technical_requirements', []):
            if isinstance(req, dict):
                requirements_table.append({
                    'category': 'Technical',
                    'requirement': req.get('type', '').replace('_', ' ').title(),
                    'value': req.get('value') or req.get('count'),
                    'mandatory': True
                })
            else:
                requirements_table.append({
                    'category': 'Technical',
                    'requirement': req.replace('_', ' ').title(),
                    'mandatory': True
                })
        
        # Financial requirements
        for req in vendor_reqs.get('financial_requirements', []):
            if isinstance(req, dict):
                requirements_table.append({
                    'category': 'Financial',
                    'requirement': f"{req.get('percentage')}% within {req.get('days')} days",
                    'mandatory': True
                })
            else:
                requirements_table.append({
                    'category': 'Financial',
                    'requirement': req.replace('_', ' ').title(),
                    'mandatory': True
                })
        
        # Mandatory documents
        for doc_req in vendor_reqs.get('mandatory_documents', []):
            requirements_table.append({
                'category': 'Document',
                'requirement': doc_req.replace('_', ' ').title(),
                'mandatory': True
            })
        
        return jsonify({
            'document_id': document_id,
            'requirements': requirements_table,
            'total': len(requirements_table)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/medicines', methods=['GET'])
def get_medicines_table(document_id):
    """Get medicines/line items in table format"""
    try:
        if document_id not in parsed_documents:
            return jsonify({'error': 'Document not found'}), 404
        
        doc = parsed_documents[document_id]
        line_items = doc['line_items']
        
        return jsonify({
            'document_id': document_id,
            'medicines': line_items,
            'total': len(line_items),
            'headers': [
                'Item No',
                'INN Name',
                'Dosage',
                'Form',
                'Quantity',
                'Unit of Issue',
                'Brand Allowed',
                'Generic Allowed'
            ]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/metadata', methods=['GET'])
def get_metadata(document_id):
    """Get RFQ metadata"""
    try:
        if document_id not in parsed_documents:
            return jsonify({'error': 'Document not found'}), 404
        
        doc = parsed_documents[document_id]
        
        return jsonify({
            'document_id': document_id,
            'metadata': doc['metadata'],
            'delivery_requirements': doc['delivery_requirements'],
            'evaluation_criteria': doc['evaluation_criteria'],
            'summary': doc['summary']
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/export/json', methods=['GET'])
def export_json(document_id):
    """Export complete parsed data as JSON file"""
    try:
        if document_id not in parsed_documents:
            return jsonify({'error': 'Document not found'}), 404
        
        doc = parsed_documents[document_id]
        
        # Add export timestamp
        export_data = {
            **doc,
            'export_timestamp': datetime.now().isoformat()
        }
        
        # Create response with JSON data
        response = app.response_class(
            response=json.dumps(export_data, indent=2),
            status=200,
            mimetype='application/json',
            headers={
                'Content-Disposition': f'attachment; filename=rfq-{document_id[:8]}.json',
                'Content-Type': 'application/json'
            }
        )
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/export/csv', methods=['GET'])
def export_csv(document_id):
    """Export medicines as CSV format"""
    try:
        if document_id not in parsed_documents:
            return jsonify({'error': 'Document not found'}), 404
        
        doc = parsed_documents[document_id]
        line_items = doc['line_items']
        
        # Build CSV content
        csv_content = []
        headers = ['Item No', 'INN Name', 'Dosage', 'Form', 'Quantity', 'Brand Name', 'Brand Allowed', 'Generic Allowed', 'Unit of Issue']
        csv_content.append(','.join([f'"{h}"' for h in headers]))
        
        for item in line_items:
            row = [
                str(item.get('line_item_id', '')),
                item.get('inn_name', '').replace('"', '""'),
                item.get('dosage', '').replace('"', '""'),
                item.get('form', ''),
                str(item.get('quantity', 0)),
                item.get('brand_name', '').replace('"', '""'),
                str(item.get('brand_allowed', 'True')),
                str(item.get('generic_allowed', 'True')),
                item.get('unit_of_issue', '')
            ]
            csv_content.append(','.join([f'"{field}"' for field in row]))
        
        csv_text = '\n'.join(csv_content)
        
        # Create response with CSV data
        response = app.response_class(
            response=csv_text,
            status=200,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=medicines-{document_id[:8]}.csv',
                'Content-Type': 'text/csv'
            }
        )
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents', methods=['GET'])
def list_documents():
    """List all parsed documents"""
    try:
        doc_list = []
        
        for doc_id, doc_data in parsed_documents.items():
            doc_list.append({
                'document_id': doc_id,
                'rfq_id': doc_data.get('metadata', {}).get('rfq_id'),
                'issuer_org': doc_data.get('metadata', {}).get('issuer_org'),
                'total_line_items': doc_data.get('summary', {}).get('total_line_items'),
                'extracted_at': doc_data.get('extracted_at')
            })
        
        return jsonify({
            'total_documents': len(doc_list),
            'documents': doc_list
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/document/<document_id>/validate', methods=['GET'])
def validate_medicines(document_id):
    """Validate document medicines against EU authorized dataset and return summary/points"""
    try:
        if document_id not in parsed_documents:
            # Try to load from file
            json_path = os.path.join(EXTRACTED_FOLDER, f"{document_id}_extracted.json")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    parsed_documents[document_id] = json.load(f)
            else:
                return jsonify({'error': 'Document not found'}), 404

        doc = parsed_documents[document_id]
        line_items = doc.get('line_items', [])

        # Normalize items to expected validator schema
        medicines = []
        for item in line_items:
            medicines.append({
                'inn_name': item.get('inn_name', ''),
                'dosage': item.get('dosage', ''),
                'form': item.get('form', ''),
                'line_item_id': item.get('line_item_id')
            })

        validator = MedicineValidator()
        authorized, rejected = validator.filter_authorized_medicines(medicines, min_confidence=0.7)

        # Build human-friendly "points" for quick clustering/removal use
        authorized_points = [
            f"• {m.get('inn_name', '')} — {m.get('dosage', 'N/A')} [{m.get('form', 'N/A')}]"
            for m in authorized
        ]

        return jsonify({
            'document_id': document_id,
            'total': len(medicines),
            'authorized_count': len(authorized),
            'rejected_count': len(rejected),
            'authorization_rate': round(len(authorized) / len(medicines) * 100, 2) if medicines else 0,
            'authorized': authorized,
            'rejected': rejected,
            'authorized_points': authorized_points,
            'database_size': len(validator.get_authorized_medicines_list())
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _normalize_text(s: str) -> str:
    if s is None:
        return ''
    s = str(s).lower()
    s = s.replace('\u00a0', ' ')
    # keep alphanumeric, spaces, slash and percent
    s = ''.join(ch for ch in s if ch.isalnum() or ch.isspace() or ch in ['/', '%'])
    s = ' '.join(s.split())
    # unit normalizations
    s = s.replace('millilitre', 'ml').replace('milliliter', 'ml')
    s = s.replace('milligram', 'mg').replace('microgram', 'mcg')
    s = s.replace('tablets', 'tab').replace('tablet', 'tab')
    s = s.replace('boxes', 'box')
    return s


def _normalize_item_for_compare(item: dict) -> str:
    parts = [
        item.get('inn_name', ''),
        item.get('dosage', ''),
        item.get('form', ''),
        item.get('unit_of_issue', '')
    ]
    joined = ' | '.join([str(p) for p in parts if p])
    return _normalize_text(joined)


@app.route('/api/document/<document_id>/confirm', methods=['POST'])
def confirm_document(document_id):
    """Strictly confirm total medicines and line-by-line normalized equality.

    Body JSON options:
      - expected_count: int
      - expected_lines: [string]
      - expected_parsed: [ {inn_name,dosage,form,unit_of_issue} ]
    """
    try:
        body = request.get_json(force=True, silent=True) or {}

        if document_id not in parsed_documents:
            json_path = os.path.join(EXTRACTED_FOLDER, f"{document_id}_extracted.json")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    parsed_documents[document_id] = json.load(f)
            else:
                return jsonify({'error': 'Document not found'}), 404

        doc = parsed_documents[document_id]
        found_items = doc.get('line_items', [])
        found_count = len(found_items)

        expected_count = body.get('expected_count')
        expected_lines = body.get('expected_lines')
        expected_parsed = body.get('expected_parsed')

        mismatches = []

        found_norm = []
        for it in found_items:
            found_norm.append({'line_item_id': it.get('line_item_id'), 'text': _normalize_item_for_compare(it)})

        if expected_parsed:
            exp_norm = []
            for e in expected_parsed:
                exp_norm.append(_normalize_item_for_compare(e))
        elif expected_lines:
            exp_norm = [_normalize_text(s) for s in expected_lines]
        else:
            exp_norm = None

        confirmed = True

        if expected_count is not None:
            if int(expected_count) != found_count:
                confirmed = False

        if exp_norm is not None:
            if len(exp_norm) != found_count:
                confirmed = False
                mismatches.append({'reason': 'count_mismatch', 'expected_count': len(exp_norm), 'found_count': found_count})

            for idx, f in enumerate(found_norm):
                expected_text = exp_norm[idx] if idx < len(exp_norm) else ''
                found_text = f['text']
                if expected_text != found_text:
                    confirmed = False
                    mismatches.append({
                        'line_item_id': f.get('line_item_id'),
                        'index': idx,
                        'expected': expected_text,
                        'found': found_text
                    })

        result = {
            'document_id': document_id,
            'confirmed': confirmed,
            'expected_count': expected_count,
            'found_count': found_count,
            'mismatches': mismatches
        }

        status = 200 if confirmed else 400
        return jsonify(result), status

    except Exception as e:
        return jsonify({'error': str(e)}), 500


STRICT_GEMINI_PROMPT = '''
You are a strict, deterministic validator. Input: a parsed RFQ JSON with 'line_items' (each item has line_item_id, inn_name, dosage, form, unit_of_issue), and 'vendor_requirements'.

Task:
- Confirm the total number of medicines strictly (integer equality).
- For each line item, compare the normalized string "INN | DOSAGE | FORM | UNIT" against the parsed line. Return whether it matches exactly (after normalization: lowercase, collapse spaces, remove punctuation except / and %; normalize units: millilitre->ml, milligram->mg, tablet->tab).
- Classify vendor requirements into categories: legal, technical, financial, documents. Return succinct labels only.

Output: Return ONLY a JSON object (no explanation) with this exact schema:
{
  "total": int,
  "confirmed": bool,
  "validated_lines": [
    {"line_item_id": int, "match": bool, "normalized_found": string, "notes": string}
  ],
  "classifications": {"legal": [string], "technical": [string], "financial": [string], "documents": [string]}
}

Be strict: any deviation in normalized text is a non-match. Do not add extra fields.
'''


@app.route('/api/document/<document_id>/classify', methods=['POST'])
def classify_document(document_id):
    """Use an external LLM (Gemini) to semantically validate and classify the parsed JSON.

    Expects env var GEMINI_API_KEY and optional GEMINI_API_URL. If missing, returns 400.
    Body may include: { 'call_model': true } to enforce calling external model.
    """
    try:
        body = request.get_json(force=True, silent=True) or {}
        call_model = bool(body.get('call_model', True))

        if document_id not in parsed_documents:
            json_path = os.path.join(EXTRACTED_FOLDER, f"{document_id}_extracted.json")
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    parsed_documents[document_id] = json.load(f)
            else:
                return jsonify({'error': 'Document not found'}), 404

        doc = parsed_documents[document_id]

        if not call_model:
            validator = MedicineValidator()
            authorized, rejected = validator.filter_authorized_medicines(doc.get('line_items', []), min_confidence=0.7)
            return jsonify({'total': len(doc.get('line_items', [])), 'authorized_count': len(authorized), 'rejected_count': len(rejected), 'classifications': {}}), 200

        # Delegate to bhau.classifier.call_gemini which knows how to handle
        # Generative Language vs Vertex endpoints and API-key vs Bearer auth.
        try:
            # Ensure project root is on sys.path so sibling package `bhau` can be imported
            import sys
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            if project_root not in sys.path:
                sys.path.insert(0, project_root)
            from bhau.classifier import call_gemini
        except Exception as imp_err:
            return jsonify({'error': 'Classifier module not available (bhau.classifier).', 'details': str(imp_err), 'sys_path': sys.path[:6]}), 500

        api_key = os.environ.get('GEMINI_API_KEY')
        api_url = os.environ.get('GEMINI_API_URL')
        if not api_key or not api_url:
            return jsonify({'error': 'GEMINI_API_KEY or GEMINI_API_URL not set in environment. Do not send keys in requests.'}), 400

        try:
            model_json = call_gemini(doc, api_key=api_key, api_url=api_url, timeout=60)
            return jsonify({'model_response': model_json}), 200
        except Exception as e:
            # call_gemini raises RuntimeError with details; forward useful info to client
            return jsonify({'error': 'Model call failed', 'details': str(e)}), 502

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
