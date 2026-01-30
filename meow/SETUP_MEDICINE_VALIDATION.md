# Medicine Validation System - Quick Setup

## What Changed

We've integrated an **authorized medicines database validator** into your RFQ parsing system. Now when you parse RFQs, medicines are automatically validated against `medicines-output-medicines-report_en.xlsx`, and only authorized medicines are included in the output.

## Installation

### 1. Install New Dependencies
```bash
cd meow/backend
pip install -r requirements.txt
```

This installs:
- `pandas==2.0.3` - For reading Excel files
- `openpyxl==3.1.2` - For Excel support

### 2. Verify Files

Ensure these files exist:
- ✅ `meow/backend/medicine_validator.py` - NEW
- ✅ `meow/backend/rfq_parser.py` - UPDATED
- ✅ `meow/backend/app.py` - UPDATED
- ✅ `meow/backend/requirements.txt` - UPDATED
- ✅ `medicines-output-medicines-report_en.xlsx` - Must be in project root

## Quick Start

### 1. Start the Backend
```bash
cd meow/backend
python app.py
```

### 2. Test the System

#### Option A: Using Python Directly
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()

# Test validation
is_auth, data, conf = validator.validate_medicine("Paracetamol")
print(f"Authorized: {is_auth}, Confidence: {conf}")
```

#### Option B: Using API
```bash
# Validate medicines via API
curl -X POST http://localhost:5001/api/medicines/validate \
  -H "Content-Type: application/json" \
  -d '{
    "medicines": [
      {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
      {"inn_name": "UnknownDrug", "dosage": "100mg", "form": "Tablet"}
    ]
  }'

# Search for medicines
curl http://localhost:5001/api/medicines/search?q=paracetamol

# Get list of all authorized medicines
curl http://localhost:5001/api/medicines/authorized-list
```

## How It Works

### Before (Old Flow)
```
PDF → Extract Text → Find Medicines → Return ALL medicines (including invalid ones)
```

### After (New Flow with Validation)
```
PDF → Extract Text → Find Medicines → ✓ Validate Against Database → Return ONLY authorized medicines
```

## Key Files

### `medicine_validator.py`
Main validation engine:
- Loads authorized medicines from Excel
- Matches extracted medicines against database
- Provides fuzzy matching with confidence scores
- Supports batch validation and searching

### `rfq_parser.py` (Updated)
RFQ parsing with integrated validation:
- Now accepts `validate_medicines=True` parameter
- Automatically filters out unauthorized medicines
- Includes validation results in output
- Tracks skipped medicines with reasons

### `app.py` (Updated)
New API endpoints:
- `POST /api/medicines/validate` - Validate medicine list
- `GET /api/medicines/search` - Search authorized medicines
- `GET /api/medicines/authorized-list` - Get all authorized medicines
- `GET /api/document/{id}/medicines/validation-report` - Validation report

## Usage Examples

### Python Usage
```python
from medicine_validator import MedicineValidator
from rfq_parser import RFQParser

# Validate medicines
validator = MedicineValidator()
authorized, rejected = validator.filter_authorized_medicines([
    {"inn_name": "Paracetamol", "dosage": "500mg"},
    {"inn_name": "Unknown", "dosage": "100mg"}
])

print(f"Authorized: {len(authorized)}, Rejected: {len(rejected)}")

# Parse RFQ with validation (enabled by default)
parser = RFQParser(validate_medicines=True)
result = parser.parse_pdf('rfq.pdf')

print(f"Authorized medicines: {len(result['line_items'])}")
print(f"Skipped medicines: {len(result['skipped_line_items'])}")
```

### API Usage
```bash
# Validate batch
curl -X POST http://localhost:5001/api/medicines/validate \
  -H "Content-Type: application/json" \
  -d '{"medicines": [{"inn_name": "Paracetamol"}]}'

# Search
curl http://localhost:5001/api/medicines/search?q=paracetamol

# Get validation report for parsed document
curl http://localhost:5001/api/document/{document_id}/medicines/validation-report
```

## Output Structure

When parsing RFQ, output now includes:

```json
{
  "line_items": [...],           // Only authorized medicines
  "skipped_line_items": [        // Unauthorized medicines
    {
      "line_item_id": 3,
      "inn_name": "Unknown Drug",
      "reason": "Not found in authorized medicines database",
      "confidence_score": 0.15
    }
  ],
  "medicine_validation": {
    "enabled": true,
    "validator_active": true,
    "database_size": 5000,
    "skipped_count": 5
  },
  "summary": {
    "total_line_items_extracted": 50,
    "total_line_items_authorized": 45,
    "total_line_items_skipped": 5
  }
}
```

## Configuration

### Validation Enabled by Default
```python
parser = RFQParser()  # validate_medicines=True by default
```

### Disable Validation (Not Recommended)
```python
parser = RFQParser(validate_medicines=False)
```

### Adjust Confidence Threshold
```python
validator = MedicineValidator()
authorized, rejected = validator.filter_authorized_medicines(
    medicines,
    min_confidence=0.70  # Default is 0.75
)
```

## Database

- **File**: `medicines-output-medicines-report_en.xlsx`
- **Location**: Project root directory
- **Contains**: All authorized medicines worldwide
- **Loaded on**: Validator initialization

## Testing

Run the example script:
```bash
cd meow/backend
python medicine_validator_examples.py
```

This runs 6 examples showing all validation features.

## Troubleshooting

### "Medicines database not found"
- Verify Excel file exists at project root
- Check file name: `medicines-output-medicines-report_en.xlsx`
- Ensure openpyxl is installed: `pip install openpyxl`

### "Module not found: medicine_validator"
- Ensure you're in the right directory
- Add to Python path if needed

### Too many medicines being rejected
- Check confidence scores
- Verify medicine names in Excel
- Consider lowering `min_confidence` threshold

## Documentation

For detailed information, see:
- `MEDICINE_VALIDATION.md` - Complete system documentation
- `medicine_validator_examples.py` - Working examples

## Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Verify Excel file location
3. ✅ Start backend: `python app.py`
4. ✅ Test with API or Python
5. ✅ Review validation reports

## Summary

Your RFQ parsing system now:
- ✅ Automatically validates all extracted medicines
- ✅ Only includes authorized medicines in output
- ✅ Provides detailed validation reports
- ✅ Supports fuzzy matching for name variations
- ✅ Tracks rejected medicines with reasons

This ensures better data quality and regulatory compliance!
