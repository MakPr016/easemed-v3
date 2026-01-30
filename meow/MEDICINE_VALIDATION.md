# Medicine Validation System Documentation

## Overview

The **Medicine Validator** is a critical component that validates medicines extracted from RFQ PDFs against an authorized medicines database (`medicines-output-medicines-report_en.xlsx`). This ensures that only officially recognized and authorized medicines are processed and added to your system.

## Key Features

✅ **Authorized Database Reference**: Validates all extracted medicines against `medicines-output-medicines-report_en.xlsx`
✅ **Fuzzy Matching**: Uses intelligent fuzzy matching to find medicines even with slight name variations
✅ **Automatic Filtering**: Automatically skips medicines not found in the authorized database
✅ **Confidence Scoring**: Provides confidence scores for each validation match
✅ **Batch Validation**: Supports validating multiple medicines at once
✅ **Comprehensive Reporting**: Generates detailed validation reports

## How It Works

### 1. **RFQ Parsing Flow**

```
PDF Upload → Text Extraction → Medicine Name Extraction → Validation → Filtering → Output
```

When you parse an RFQ PDF:
1. Text is extracted from the PDF
2. Medicine names are identified from the document tables
3. Each medicine is **automatically validated** against the authorized database
4. **Medicines not in the database are skipped** (not included in final output)
5. Only authorized medicines are returned

### 2. **Validation Process**

For each extracted medicine:

1. **Exact Match Check**: First tries exact name match against authorized medicines
2. **Normalized Match**: Tries matching normalized versions (lowercase, no extra spaces)
3. **Fuzzy Match**: If no exact match, performs fuzzy string matching (75% confidence threshold)
4. **Confidence Scoring**: Returns a score from 0-1 indicating match quality

### 3. **Database Structure**

The authorized medicines database contains:
- INN Name (International Nonproprietary Name)
- Dosage/Strength
- Pharmaceutical Form
- Brand Information
- Registration Status

## Using the System

### Automatic Validation (Recommended)

When parsing RFQs, validation is **enabled by default**:

```python
from rfq_parser import RFQParser

# Validation is automatically enabled
parser = RFQParser(validate_medicines=True)
extracted_data = parser.parse_pdf('path/to/rfq.pdf')

# Results include:
# - line_items: Only authorized medicines
# - skipped_line_items: Medicines not in database
# - medicine_validation: Validation statistics
```

### Manual Validation

You can also validate medicines manually:

```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()

# Validate single medicine
is_authorized, matched_data, confidence = validator.validate_medicine(
    inn_name="Paracetamol",
    dosage="500mg",
    form="Tablet"
)

# Validate batch
medicines = [
    {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
    {"inn_name": "Ibuprofen", "dosage": "200mg", "form": "Tablet"}
]
authorized, rejected = validator.filter_authorized_medicines(medicines)
```

### Search Authorized Medicines

```python
validator = MedicineValidator()

# Search for medicines
results = validator.search_medicines("Paracetamol")

# Get list of all authorized medicines
all_medicines = validator.get_authorized_medicines_list()

# Get details of specific medicine
details = validator.get_medicine_details("Paracetamol")
```

## API Endpoints

### 1. **Validate Medicines**
```
POST /api/medicines/validate
Content-Type: application/json

{
  "medicines": [
    {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
    {"inn_name": "Unknown Drug", "dosage": "100mg", "form": "Tablet"}
  ]
}

Response:
{
  "status": "validation_complete",
  "total_medicines": 2,
  "authorized_count": 1,
  "rejected_count": 1,
  "authorization_rate": 50.0,
  "authorized_medicines": [...],
  "rejected_medicines": [...]
}
```

### 2. **Search Authorized Medicines**
```
GET /api/medicines/search?q=paracetamol

Response:
{
  "query": "paracetamol",
  "total_results": 3,
  "results": [...]
}
```

### 3. **Get Authorized Medicines List**
```
GET /api/medicines/authorized-list

Response:
{
  "total_authorized": 5000,
  "medicines": ["Paracetamol", "Ibuprofen", ...]
}
```

### 4. **Document Validation Report**
```
GET /api/document/{document_id}/medicines/validation-report

Response:
{
  "document_id": "...",
  "validation_enabled": true,
  "database_size": 5000,
  "total_medicines_extracted": 50,
  "total_authorized": 45,
  "total_skipped": 5,
  "authorization_rate": 90.0,
  "authorized_medicines": [...],
  "skipped_medicines": [...]
}
```

## Output Examples

### Authorized Medicine (Included in Output)
```json
{
  "line_item_id": 1,
  "inn_name": "Paracetamol",
  "dosage": "500mg",
  "form": "Tablet",
  "unit_of_issue": "Box",
  "brand_name": "Panadol",
  "medicine_validated": true,
  "is_authorized": true,
  "validation_confidence": 0.98,
  "matched_authorized_medicine": {
    "inn_name": "Paracetamol",
    "dosage": "500mg",
    "strength": "500mg",
    "form": "Tablet",
    "brand": "Various",
    "authorized": true
  }
}
```

### Skipped Medicine (Not in Database)
```json
{
  "line_item_id": 3,
  "inn_name": "Unknown Compound XYZ",
  "reason": "Not found in authorized medicines database",
  "confidence_score": 0.15
}
```

## Validation Results in Parsed Document

When you parse an RFQ, the output includes:

```json
{
  "metadata": {...},
  "line_items": [...],  // Only authorized medicines
  "skipped_line_items": [...],  // Rejected medicines
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

## Confidence Scores

The validation system returns confidence scores:

- **1.0** (100%): Exact match found
- **0.75 - 0.99**: Fuzzy match with high confidence (e.g., "Paracetamol" vs "Paracetamol BP")
- **Below 0.75**: Medicine not matched and will be skipped

## Configuration

### Changing Minimum Confidence Threshold

```python
validator = MedicineValidator()

# Accept matches with 70% confidence or higher
authorized, rejected = validator.filter_authorized_medicines(
    medicines, 
    min_confidence=0.70
)
```

### Disabling Validation (Not Recommended)

If you need to extract medicines without validation:

```python
parser = RFQParser(validate_medicines=False)
extracted_data = parser.parse_pdf('path/to/rfq.pdf')
# This will include ALL extracted medicines, even unauthorized ones
```

## Database Information

- **Location**: `/medicines-output-medicines-report_en.xlsx`
- **Format**: Excel spreadsheet with medicine details
- **Columns**: INN Name, Dosage, Strength, Form, Brand, Authorization Status
- **Size**: Contains all authorized medicines worldwide

## Benefits

1. **Quality Control**: Ensures only official medicines are processed
2. **Compliance**: Maintains regulatory compliance with authorized formularies
3. **Error Prevention**: Automatically rejects misspelled or unofficial medicine names
4. **Efficiency**: Fuzzy matching handles name variations without manual intervention
5. **Transparency**: Provides detailed reports on what was accepted and rejected

## Troubleshooting

### Medicine Not Being Found

**Problem**: A medicine that should be authorized is being rejected.

**Solution**:
1. Check the exact spelling in the authorized database
2. Search for variations: `validator.search_medicines("Paracetamol")`
3. Verify it's in the Excel file: `validator.get_authorized_medicines_list()`
4. Check confidence score - may need to adjust `min_confidence` threshold

### Database Not Loading

**Problem**: "Warning: Medicines database not found"

**Solution**:
1. Verify the Excel file exists at `/medicines-output-medicines-report_en.xlsx`
2. Check file path: `validator.excel_path`
3. Ensure openpyxl and pandas are installed: `pip install pandas openpyxl`

### Too Many False Rejections

**Problem**: Valid medicines are being rejected (confidence too strict).

**Solution**:
```python
# Lower confidence threshold
authorized, rejected = validator.filter_authorized_medicines(
    medicines,
    min_confidence=0.70  # Default is 0.75
)
```

## Next Steps

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Start Backend**: `python app.py`
3. **Upload RFQ**: Use the upload endpoint
4. **Parse with Validation**: Medicines will be automatically validated
5. **Review Reports**: Check validation reports to see what was accepted/rejected

## Summary

The Medicine Validator system ensures your RFQ data quality by:
- ✅ Automatically validating all extracted medicines
- ✅ Comparing against an official authorized medicines database
- ✅ Skipping unauthorized medicines
- ✅ Providing detailed confidence scores
- ✅ Supporting manual validation and searching

This makes your system more reliable, compliant, and maintainable!
