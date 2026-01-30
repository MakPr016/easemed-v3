# Testing Checklist - Medicine Validation System

## Pre-Flight Checks

### ✅ 1. Files Created/Updated
- [x] `meow/backend/medicine_validator.py` - Created
- [x] `meow/backend/medicine_validator_examples.py` - Created
- [x] `meow/backend/rfq_parser.py` - Updated
- [x] `meow/backend/app.py` - Updated
- [x] `meow/backend/requirements.txt` - Updated
- [x] `meow/MEDICINE_VALIDATION.md` - Created
- [x] `meow/SETUP_MEDICINE_VALIDATION.md` - Created
- [x] `IMPLEMENTATION_SUMMARY.md` - Created

### ✅ 2. Dependencies Required
- [x] pandas==2.0.3
- [x] openpyxl==3.1.2

### ✅ 3. Database File Location
- [ ] Verify `medicines-output-medicines-report_en.xlsx` exists in project root

## Installation & Setup

### Step 1: Install Dependencies
```bash
cd meow/backend
pip install -r requirements.txt
```

**Expected Output**:
```
Successfully installed pandas-2.0.3 openpyxl-3.1.2
```

### Step 2: Verify Database File
```bash
# Windows PowerShell
Test-Path "..\..\medicines-output-medicines-report_en.xlsx"

# Should return: True
```

### Step 3: Start Backend
```bash
cd meow/backend
python app.py
```

**Expected Output**:
```
✓ Loaded XXXX authorized medicines
 * Running on http://0.0.0.0:5001
 * Debug mode: on
```

## Functional Tests

### Test 1: Medicine Validator Import
```python
cd meow/backend
python -c "from medicine_validator import MedicineValidator; v = MedicineValidator(); print(f'Loaded {len(v.authorized_medicines)} medicines')"
```

**Expected**: `Loaded XXXX medicines`

### Test 2: Run Examples
```bash
cd meow/backend
python medicine_validator_examples.py
```

**Expected**: All 6 examples run without errors

### Test 3: API Health Check
```bash
curl http://localhost:5001/api/health
```

**Expected**:
```json
{
  "status": "ok",
  "service": "EASEMED RFQ Parser"
}
```

### Test 4: Get Authorized Medicines List
```bash
curl http://localhost:5001/api/medicines/authorized-list
```

**Expected**:
```json
{
  "total_authorized": XXXX,
  "medicines": ["Medicine1", "Medicine2", ...]
}
```

### Test 5: Search Medicines
```bash
curl "http://localhost:5001/api/medicines/search?q=paracetamol"
```

**Expected**:
```json
{
  "query": "paracetamol",
  "total_results": X,
  "results": [...]
}
```

### Test 6: Validate Medicine Batch
```bash
curl -X POST http://localhost:5001/api/medicines/validate \
  -H "Content-Type: application/json" \
  -d '{
    "medicines": [
      {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
      {"inn_name": "UnknownDrug123", "dosage": "100mg", "form": "Tablet"}
    ]
  }'
```

**Expected**:
```json
{
  "status": "validation_complete",
  "total_medicines": 2,
  "authorized_count": 1,
  "rejected_count": 1,
  "authorization_rate": 50.0
}
```

### Test 7: RFQ Parsing with Validation
```bash
# 1. Upload PDF
curl -X POST http://localhost:5001/api/upload \
  -F "file=@path/to/rfq.pdf"

# Save the document_id from response

# 2. Parse PDF
curl -X POST http://localhost:5001/api/parse/{document_id}

# 3. Get Validation Report
curl http://localhost:5001/api/document/{document_id}/medicines/validation-report
```

**Expected**: JSON with `authorized_medicines` and `skipped_medicines` sections

## Python Unit Tests

### Test 1: Validator Initialization
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
assert validator is not None
assert len(validator.authorized_medicines) > 0
print("✓ Validator initialized correctly")
```

### Test 2: Single Medicine Validation
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
is_auth, data, conf = validator.validate_medicine("Paracetamol")

assert is_auth in [True, False]
assert 0 <= conf <= 1
print(f"✓ Validation works: Authorized={is_auth}, Confidence={conf}")
```

### Test 3: Batch Validation
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
medicines = [
    {"inn_name": "Test Medicine", "dosage": "100mg"}
]
authorized, rejected = validator.filter_authorized_medicines(medicines)

assert len(authorized) + len(rejected) == len(medicines)
print(f"✓ Batch validation works: {len(authorized)} auth, {len(rejected)} rejected")
```

### Test 4: RFQ Parser Integration
```python
from rfq_parser import RFQParser

# With validation
parser1 = RFQParser(validate_medicines=True)
assert parser1.medicine_validator is not None
print("✓ Parser with validation initialized")

# Without validation
parser2 = RFQParser(validate_medicines=False)
assert parser2.medicine_validator is None
print("✓ Parser without validation initialized")
```

## Edge Case Tests

### Test 1: Empty Medicine Name
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
is_auth, data, conf = validator.validate_medicine("")
assert is_auth == False
assert conf == 0.0
print("✓ Empty name handled correctly")
```

### Test 2: Special Characters
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
is_auth, data, conf = validator.validate_medicine("Test@#$%")
# Should not crash
print("✓ Special characters handled")
```

### Test 3: Very Long Name
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator()
long_name = "A" * 1000
is_auth, data, conf = validator.validate_medicine(long_name)
# Should not crash
print("✓ Long names handled")
```

### Test 4: Database Not Found
```python
from medicine_validator import MedicineValidator

validator = MedicineValidator(excel_path="/nonexistent/path.xlsx")
# Should print warning but not crash
assert len(validator.authorized_medicines) == 0
print("✓ Missing database handled gracefully")
```

## Performance Tests

### Test 1: Large Batch Validation
```python
from medicine_validator import MedicineValidator
import time

validator = MedicineValidator()
medicines = [{"inn_name": f"Medicine{i}"} for i in range(1000)]

start = time.time()
authorized, rejected = validator.filter_authorized_medicines(medicines)
duration = time.time() - start

print(f"✓ Validated 1000 medicines in {duration:.2f}s")
assert duration < 10  # Should be under 10 seconds
```

### Test 2: Search Performance
```python
from medicine_validator import MedicineValidator
import time

validator = MedicineValidator()

start = time.time()
results = validator.search_medicines("test")
duration = time.time() - start

print(f"✓ Search completed in {duration:.2f}s")
assert duration < 1  # Should be under 1 second
```

## Integration Tests

### Test 1: Full RFQ Processing Flow
```
1. Upload RFQ PDF
2. Parse with validation
3. Verify line_items contains only authorized
4. Verify skipped_line_items contains rejected
5. Check validation statistics
```

### Test 2: API Endpoint Chain
```
1. POST /api/medicines/validate
2. GET /api/medicines/search
3. GET /api/medicines/authorized-list
4. Verify all return valid JSON
```

## Error Handling Tests

### Test 1: Invalid Excel File
- Remove or corrupt Excel file
- Validator should print warning
- System should continue without crashing

### Test 2: Invalid API Request
```bash
curl -X POST http://localhost:5001/api/medicines/validate \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```
**Expected**: Error message

### Test 3: Missing Document ID
```bash
curl http://localhost:5001/api/document/nonexistent/medicines/validation-report
```
**Expected**: 404 error

## Regression Tests

### Test 1: Old RFQ Parser Still Works
```python
from rfq_parser import RFQParser

# Old style (should still work)
parser = RFQParser()
# Should default to validate_medicines=True
```

### Test 2: Existing API Endpoints Unaffected
```bash
# These should still work exactly as before
curl http://localhost:5001/api/health
curl http://localhost:5001/api/documents
```

## Sign-Off Checklist

- [ ] All dependencies installed successfully
- [ ] Database file located correctly
- [ ] Backend starts without errors
- [ ] All examples run successfully
- [ ] All API endpoints respond correctly
- [ ] Python unit tests pass
- [ ] Edge cases handled gracefully
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Documentation reviewed

## Troubleshooting Guide

### Issue: "Module not found: medicine_validator"
**Solution**: Ensure you're in the correct directory (`meow/backend`)

### Issue: "Medicines database not found"
**Solution**: 
1. Check if `medicines-output-medicines-report_en.xlsx` exists in project root
2. Verify file name spelling
3. Check file permissions

### Issue: "No module named 'pandas'"
**Solution**: Install dependencies: `pip install -r requirements.txt`

### Issue: "No module named 'openpyxl'"
**Solution**: Install openpyxl: `pip install openpyxl`

### Issue: Backend won't start
**Solution**:
1. Check Python version (3.8+)
2. Verify all dependencies installed
3. Check for port conflicts (port 5001)

### Issue: All medicines being rejected
**Solution**:
1. Verify Excel file has data
2. Check column names in Excel
3. Lower confidence threshold if needed
4. Search database to verify medicine exists

## Success Criteria

✅ System validates medicines against authorized database
✅ Only authorized medicines included in output
✅ Skipped medicines tracked with reasons
✅ Validation reports available via API
✅ Confidence scores provided for all matches
✅ Fuzzy matching works for name variations
✅ System handles errors gracefully
✅ Performance is acceptable
✅ Documentation is comprehensive
✅ Examples work correctly

---

**Testing Date**: _____________
**Tested By**: _____________
**Status**: ⬜ Pass | ⬜ Fail | ⬜ Needs Review
**Notes**: 
```

