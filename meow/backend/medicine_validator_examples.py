"""
Example usage of the Medicine Validator system
Shows how to validate medicines against the authorized database
"""

from medicine_validator import MedicineValidator
from rfq_parser import RFQParser

def example_1_basic_validation():
    """Example 1: Basic single medicine validation"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Basic Single Medicine Validation")
    print("="*60)
    
    validator = MedicineValidator()
    
    # Test a medicine
    inn_name = "Paracetamol"
    is_authorized, matched_data, confidence = validator.validate_medicine(
        inn_name=inn_name,
        dosage="500mg",
        form="Tablet"
    )
    
    print(f"\nMedicine: {inn_name}")
    print(f"Is Authorized: {is_authorized}")
    print(f"Confidence Score: {confidence}")
    if matched_data:
        print(f"Matched Details: {matched_data}")


def example_2_batch_validation():
    """Example 2: Batch validation of multiple medicines"""
    print("\n" + "="*60)
    print("EXAMPLE 2: Batch Medicine Validation")
    print("="*60)
    
    validator = MedicineValidator()
    
    # List of medicines to validate (simulating RFQ extraction)
    medicines = [
        {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
        {"inn_name": "Ibuprofen", "dosage": "200mg", "form": "Tablet"},
        {"inn_name": "Unknown Medicine XYZ", "dosage": "100mg", "form": "Capsule"},
        {"inn_name": "Amoxicillin", "dosage": "250mg", "form": "Capsule"},
    ]
    
    # Validate batch
    authorized, rejected = validator.filter_authorized_medicines(medicines)
    
    print(f"\nTotal Medicines: {len(medicines)}")
    print(f"Authorized: {len(authorized)}")
    print(f"Rejected: {len(rejected)}")
    print(f"Authorization Rate: {len(authorized)/len(medicines)*100:.1f}%")
    
    print("\n✓ AUTHORIZED MEDICINES:")
    for med in authorized:
        print(f"  - {med['inn_name']}: {med.get('confidence_score', 'N/A')}")
    
    print("\n✗ REJECTED MEDICINES:")
    for med in rejected:
        print(f"  - {med['inn_name']}: {med.get('rejection_reason', 'No reason')}")


def example_3_search_medicines():
    """Example 3: Search for medicines in database"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Search for Medicines")
    print("="*60)
    
    validator = MedicineValidator()
    
    # Search for medicines
    query = "Paracetamol"
    results = validator.search_medicines(query)
    
    print(f"\nSearch Query: '{query}'")
    print(f"Total Results: {len(results)}")
    
    for result in results[:5]:  # Show first 5
        print(f"  - {result['inn_name']}")


def example_4_database_info():
    """Example 4: Get database information"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Database Information")
    print("="*60)
    
    validator = MedicineValidator()
    
    # Database size
    all_medicines = validator.get_authorized_medicines_list()
    print(f"\nTotal Authorized Medicines: {len(all_medicines)}")
    print(f"Database Path: {validator.excel_path}")
    
    # Show first 10 medicines
    print(f"\nFirst 10 Authorized Medicines:")
    for med in all_medicines[:10]:
        print(f"  - {med}")


def example_5_rfq_parsing_with_validation():
    """Example 5: Parse RFQ with automatic medicine validation"""
    print("\n" + "="*60)
    print("EXAMPLE 5: RFQ Parsing with Validation")
    print("="*60)
    
    # This example shows how validation is integrated into RFQ parsing
    # Assuming you have an RFQ PDF file
    
    print("\nNote: This example requires an actual RFQ PDF file")
    print("\nUsage:")
    print("  parser = RFQParser(validate_medicines=True)")
    print("  result = parser.parse_pdf('path/to/rfq.pdf')")
    print("\nThe result will contain:")
    print("  - line_items: Only authorized medicines")
    print("  - skipped_line_items: Rejected medicines")
    print("  - medicine_validation: Validation statistics")


def example_6_validation_report():
    """Example 6: Generate validation report"""
    print("\n" + "="*60)
    print("EXAMPLE 6: Validation Report")
    print("="*60)
    
    validator = MedicineValidator()
    
    # Sample medicines to validate
    medicines = [
        {"inn_name": "Paracetamol", "dosage": "500mg", "form": "Tablet"},
        {"inn_name": "Ibuprofen", "dosage": "200mg", "form": "Tablet"},
        {"inn_name": "Unknown", "dosage": "100mg", "form": "Tablet"},
    ]
    
    # Generate report
    report = validator.generate_validation_report(medicines)
    
    print(f"\nValidation Report:")
    print(f"  Total Medicines: {report['total_medicines']}")
    print(f"  Authorized: {report['authorized_count']}")
    print(f"  Rejected: {report['rejected_count']}")
    print(f"  Authorization Rate: {report['authorization_rate']}%")
    print(f"  Database Size: {report['database_size']}")
    print(f"  Timestamp: {report['validation_timestamp']}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("MEDICINE VALIDATOR - EXAMPLES")
    print("="*60)
    
    # Run examples
    example_1_basic_validation()
    example_2_batch_validation()
    example_3_search_medicines()
    example_4_database_info()
    example_5_rfq_parsing_with_validation()
    example_6_validation_report()
    
    print("\n" + "="*60)
    print("Examples completed!")
    print("="*60 + "\n")
