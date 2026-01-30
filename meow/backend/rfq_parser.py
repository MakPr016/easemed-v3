# """
# RFQ PDF Parser - Extracts structured data from Request for Quotation PDFs
# Handles medicines/requirements tables, eligibility rules, and vendor requirements
# """

# import re
# import json
# from typing import Dict, List, Any, Optional
# from datetime import datetime
# import PyPDF2

# class RFQParser:
#     def __init__(self):
#         self.text = ""
#         self.metadata = {}
#         self.vendor_requirements = {}
#         self.line_items = []
#         self.delivery_requirements = {}
#         self.evaluation_criteria = {}
        
#     def parse_pdf(self, pdf_path: str) -> Dict[str, Any]:
#         """Main parse function - extract all RFQ data"""
#         self.text = self._extract_text_from_pdf(pdf_path)
        
#         self.metadata = self._extract_metadata()
#         self.vendor_requirements = self._extract_vendor_requirements()
#         self.line_items = self._extract_line_items()
#         self.delivery_requirements = self._extract_delivery_requirements()
#         self.evaluation_criteria = self._extract_evaluation_criteria()
        
#         return self.to_json()
    
#     def _extract_text_from_pdf(self, pdf_path: str) -> str:
#         """Extract raw text from PDF"""
#         text = ""
#         try:
#             with open(pdf_path, 'rb') as file:
#                 pdf_reader = PyPDF2.PdfReader(file)
#                 for page in pdf_reader.pages:
#                     text += page.extract_text() + "\n"
#         except Exception as e:
#             print(f"Error reading PDF: {e}")
#         return text
    
#     def _extract_metadata(self) -> Dict[str, Any]:
#         """Extract RFQ metadata: ID, dates, org, currency, etc."""
#         metadata = {}
        
#         # RFQ ID/Reference
#         rfq_match = re.search(r'RFQ[#\s]*(?:Ref[erence]*)?[:\s#]*([A-Z0-9\-\.]+)', self.text, re.IGNORECASE)
#         if rfq_match:
#             metadata['rfq_id'] = rfq_match.group(1).strip()
        
#         # Issue Date
#         date_patterns = [
#             r'(?:Issue|Date)[:\s]+(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})',
#             r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
#             r'(\d{4}[-/]\d{2}[-/]\d{2})'
#         ]
#         for pattern in date_patterns:
#             match = re.search(pattern, self.text, re.IGNORECASE)
#             if match:
#                 metadata['issue_date'] = match.group(1).strip()
#                 break
        
#         # Submission Deadline
#         deadline_match = re.search(
#             r'(?:Deadline|Due Date)[:\s]+([0-9\s\w,:/]+?)(?:Beirut|GMT|UTC|Zone)',
#             self.text, re.IGNORECASE
#         )
#         if deadline_match:
#             metadata['submission_deadline'] = deadline_match.group(1).strip()
        
#         # Issuer Organization
#         issuer_match = re.search(
#             r'(?:Issued by|Organization)[:\s]+([A-Z][A-Za-z\s\(\)]+?)(?:\n|Signature)',
#             self.text
#         )
#         if issuer_match:
#             metadata['issuer_org'] = issuer_match.group(1).strip()
        
#         # Currency
#         currency_match = re.search(r'(?:Currency|Quotation shall be quoted in)\s*:?\s*([A-Z]{3})', self.text)
#         if currency_match:
#             metadata['currency'] = currency_match.group(1).strip()
#         else:
#             metadata['currency'] = 'USD'
        
#         # Contract Type
#         if 'Long Term Agreement' in self.text or 'LTA' in self.text:
#             metadata['contract_type'] = 'long_term_agreement'
#         elif 'Framework' in self.text:
#             metadata['contract_type'] = 'framework_agreement'
#         else:
#             metadata['contract_type'] = 'purchase_order'
        
#         # Quotation Validity Days
#         validity_match = re.search(r'(?:valid|remain.*valid)\s+for\s+(\d+)\s+(?:calendar\s+)?days', self.text, re.IGNORECASE)
#         if validity_match:
#             metadata['quotation_validity_days'] = int(validity_match.group(1))
        
#         # Evaluation Method
#         if 'lowest price' in self.text.lower():
#             metadata['evaluation_method'] = 'lowest_price_per_line_item'
#         elif 'most economical' in self.text.lower():
#             metadata['evaluation_method'] = 'most_economically_advantageous'
#         else:
#             metadata['evaluation_method'] = 'undisclosed'
        
#         # Number of vendors to select
#         select_match = re.search(r'(?:up to|select)\s+(?:two|2|three|3)\s+\((\d)\)', self.text, re.IGNORECASE)
#         if select_match:
#             metadata['vendors_to_select'] = int(select_match.group(1))
        
#         # Local vendors only
#         metadata['local_only'] = bool(re.search(r'local vendors only', self.text, re.IGNORECASE))
        
#         # Delivery country/location
#         location_match = re.search(
#             r'(?:Delivery Location|Address|Country)[:\s]+([A-Za-z\s,]+?)(?:\n|$)',
#             self.text
#         )
#         if location_match:
#             metadata['delivery_location'] = location_match.group(1).strip()
        
#         return metadata
    
#     def _extract_vendor_requirements(self) -> Dict[str, Any]:
#         """Extract vendor eligibility and qualification requirements"""
#         requirements = {
#             'legal_requirements': [],
#             'technical_requirements': [],
#             'financial_requirements': [],
#             'mandatory_documents': []
#         }
        
#         # QMS requirements
#         if re.search(r'(?:cGMP|Current Good Manufacturing Practice)', self.text):
#             requirements['legal_requirements'].append('cGMP_certification')
#         if re.search(r'ISO\s*9001', self.text):
#             requirements['legal_requirements'].append('ISO_9001')
        
#         # Product Registration
#         if re.search(r'(?:registered|registration).*(?:Ministry|MoPH|Health)', self.text, re.IGNORECASE):
#             requirements['legal_requirements'].append('product_registration')
        
#         # Minimum experience
#         exp_match = re.search(r'minimum\s+(\d+)\s+year', self.text, re.IGNORECASE)
#         if exp_match:
#             requirements['technical_requirements'].append({
#                 'type': 'min_years_experience',
#                 'value': int(exp_match.group(1))
#             })
        
#         # References
#         ref_match = re.search(r'(?:list of|provide)\s+(?:three|3|two|2)\s+(?:clients|references)', self.text, re.IGNORECASE)
#         if ref_match:
#             requirements['technical_requirements'].append({
#                 'type': 'required_references',
#                 'count': 3
#             })
        
#         # Mandatory documents
#         if re.search(r'Quotation Submission Form', self.text):
#             requirements['mandatory_documents'].append('quotation_submission_form')
#         if re.search(r'Technical.*Financial.*Offer', self.text, re.IGNORECASE):
#             requirements['mandatory_documents'].append('technical_financial_offer')
#         if re.search(r'QMS.*certificate', self.text, re.IGNORECASE):
#             requirements['mandatory_documents'].append('qms_certificate')
#         if re.search(r'product.*registration', self.text, re.IGNORECASE):
#             requirements['mandatory_documents'].append('product_registration_certificate')
        
#         # VAT/Tax handling
#         if re.search(r'inclusive.*VAT', self.text, re.IGNORECASE):
#             requirements['financial_requirements'].append('prices_inclusive_vat')
#         elif re.search(r'exclusive.*VAT', self.text, re.IGNORECASE):
#             requirements['financial_requirements'].append('prices_exclusive_vat')
        
#         # Payment terms
#         payment_match = re.search(r'(\d+)%\s+within\s+(\d+)\s+days', self.text)
#         if payment_match:
#             requirements['financial_requirements'].append({
#                 'type': 'payment_term',
#                 'percentage': int(payment_match.group(1)),
#                 'days': int(payment_match.group(2))
#             })
        
#         return requirements
    
#     def _extract_line_items(self) -> List[Dict[str, Any]]:
#         """Extract medicines/requirements table (line items) - Enhanced for complex tables"""
#         line_items = []
        
#         # Enhanced multi-line pattern that handles table rows split across lines
#         # Matches: Item# Medicine-Name Dosage/Strength Unit BrandName
        
#         # First, try to find the table section
#         table_markers = [
#             'Technical Specifications',
#             'Schedule of Requirements',
#             'Item No',
#             'International\nnon',
#             'nonproprietary name'
#         ]
        
#         table_start = -1
#         for marker in table_markers:
#             pos = self.text.find(marker)
#             if pos != -1:
#                 table_start = pos
#                 break
        
#         if table_start == -1:
#             # No table found, return empty
#             return line_items
        
#         # Extract large section after table start
#         table_section = self.text[table_start:table_start + 30000]
        
#         # Parse using improved multi-pass approach
#         line_items = self._parse_medicine_table_multipass(table_section)
        
#         return line_items
    
#     def _parse_medicine_table_multipass(self, text: str) -> List[Dict[str, Any]]:
#         """Multi-pass parser for medicine tables with complex formatting"""
#         items = []
        
#         # Strategy: Look for lines starting with digits (item numbers)
#         lines = text.split('\n')
        
#         current_item = None
#         item_buffer = []
        
#         for line in lines:
#             line_stripped = line.strip()
            
#             # Skip empty lines and headers
#             if not line_stripped:
#                 continue
#             if any(header in line_stripped.lower() for header in [
#                 'item no', 'international', 'nonproprietary', 'generic name',
#                 'dosage form', 'unit of issue', 'brand name', 'strength per'
#             ]):
#                 continue
            
#             # Check if line starts with a number (potential item number)
#             item_num_match = re.match(r'^(\d{1,3})\s+(.+)$', line_stripped)
            
#             if item_num_match:
#                 # Save previous item if exists
#                 if current_item and item_buffer:
#                     parsed = self._parse_item_buffer(current_item, item_buffer)
#                     if parsed:
#                         items.append(parsed)
                
#                 # Start new item
#                 item_num = int(item_num_match.group(1))
#                 rest_of_line = item_num_match.group(2).strip()
                
#                 current_item = item_num
#                 item_buffer = [rest_of_line]
            
#             elif current_item is not None:
#                 # Continuation of current item (multi-line entry)
#                 item_buffer.append(line_stripped)
            
#             # Stop if we've moved past the medicine table (detected by finding unrelated content)
#             if len(items) > 150 and any(marker in line_stripped.lower() for marker in [
#                 'payment terms', 'evaluation method', 'annex 2', 'vendor requirements'
#             ]):
#                 break
        
#         # Don't forget the last item
#         if current_item and item_buffer:
#             parsed = self._parse_item_buffer(current_item, item_buffer)
#             if parsed:
#                 items.append(parsed)
        
#         return items
    
#     def _parse_item_buffer(self, item_num: int, buffer: List[str]) -> Optional[Dict[str, Any]]:
#         """Parse accumulated buffer lines for a single item"""
#         if not buffer:
#             return None
        
#         # Combine all buffer lines
#         combined = ' '.join(buffer)
        
#         # Extract components
#         # Pattern: MedicineName DosageInfo UnitType BrandName
        
#         # Try to identify dosage/strength patterns
#         dosage_patterns = [
#             r'(\d+\.?\d*\s*(?:mg|ml|mcg|IU|U|g|%|units?)(?:\s*/\s*\d+\.?\d*\s*(?:mg|ml|mcg|IU|U|g|units?))?)',
#             r'(\d+\.?\d*\s*(?:mg|ml|mcg|IU|U))',
#         ]
        
#         dosage_info = 'N/A'
#         dosage_match = None
#         for pattern in dosage_patterns:
#             matches = list(re.finditer(pattern, combined, re.IGNORECASE))
#             if matches:
#                 # Take the first significant dosage match
#                 dosage_match = matches[0]
#                 dosage_info = dosage_match.group(0).strip()
#                 break
        
#         # Extract unit of issue (Box, Bottle, Vial, Ampule, Tablet, etc.)
#         unit_pattern = r'\b(box|bottle|vial|ampule|tablet|injection|inhaler|pen|tube|patch|sachet|spray|solution)\b'
#         unit_match = re.search(unit_pattern, combined, re.IGNORECASE)
#         unit_of_issue = unit_match.group(1).capitalize() if unit_match else 'Box'
        
#         # Extract medicine name (everything before dosage or first keyword)
#         if dosage_match:
#             name_part = combined[:dosage_match.start()].strip()
#         else:
#             # No dosage found, split by common keywords
#             name_part = re.split(r'\s+(box|bottle|vial|ampule|tablet)\s+', combined, 1, re.IGNORECASE)[0].strip()
        
#         # Clean up name (remove numbers, extra spaces)
#         name_cleaned = re.sub(r'\s+', ' ', name_part).strip()
#         if not name_cleaned or len(name_cleaned) < 3:
#             name_cleaned = combined[:50]  # Fallback
        
#         # Extract brand name (usually after unit or at end, contains "or any other")
#         brand_pattern = r'([A-Z][A-Za-z\-\s]+?)(?:\s+or\s+any\s+other|$)'
#         brand_matches = list(re.finditer(brand_pattern, combined))
#         brand_name = brand_matches[-1].group(1).strip() if brand_matches else 'Generic allowed'
        
#         # Build item
#         item = {
#             'line_item_id': item_num,
#             'inn_name': name_cleaned,
#             'dosage': dosage_info,
#             'form': self._extract_form(combined),
#             'unit_of_issue': unit_of_issue,
#             'brand_name': brand_name,
#             'brand_allowed': True,
#             'generic_allowed': 'alternative' in combined.lower() or 'generic' in combined.lower()
#         }
        
#         return item
    
#     def _extract_form(self, text: str) -> str:
#         """Extract pharmaceutical form from text"""
#         forms = {
#             'tablet': r'\btab(?:let)?\b',
#             'capsule': r'\bcap(?:sule)?\b',
#             'syrup': r'\bsyrup\b',
#             'suspension': r'\bsuspension\b',
#             'injection': r'\binj(?:ection)?\b',
#             'ampule': r'\bamp(?:ule)?\b',
#             'vial': r'\bvial\b',
#             'inhaler': r'\binhaler\b',
#             'solution': r'\bsolution\b',
#             'cream': r'\bcream\b',
#             'gel': r'\bgel\b',
#             'patch': r'\bpatch\b',
#             'suppository': r'\bsuppository\b',
#             'powder': r'\bpowder\b',
#             'spray': r'\bspray\b'
#         }
        
#         for form_name, pattern in forms.items():
#             if re.search(pattern, text, re.IGNORECASE):
#                 return form_name.capitalize()
        
#         return 'Tablet'  # Default
    
#     def _extract_delivery_requirements(self) -> Dict[str, Any]:
#         """Extract delivery terms, location, packaging, etc."""
#         requirements = {}
        
#         # Delivery location
#         location_match = re.search(
#             r'(?:Exact Address|Delivery Location)[:\s]+([A-Za-z\s,\n]+?)(?:\n\n|Customs)',
#             self.text
#         )
#         if location_match:
#             requirements['delivery_location'] = location_match.group(1).strip()
        
#         # Transport mode
#         if re.search(r'(?:Preferred Mode|Transport).*land', self.text, re.IGNORECASE):
#             requirements['transport_mode'] = 'land'
#         elif re.search(r'sea', self.text, re.IGNORECASE):
#             requirements['transport_mode'] = 'sea'
#         elif re.search(r'air', self.text, re.IGNORECASE):
#             requirements['transport_mode'] = 'air'
        
#         # Expiry requirements for medicines
#         expiry_match = re.search(r'minimum of\s+(\d+)\s+month', self.text, re.IGNORECASE)
#         if expiry_match:
#             requirements['min_expiry_months'] = int(expiry_match.group(1))
        
#         # Customs clearance
#         if re.search(r'Not applicable.*Customs', self.text):
#             requirements['customs_by'] = 'not_applicable'
#         elif re.search(r'Supplier.*Customs', self.text, re.IGNORECASE):
#             requirements['customs_by'] = 'supplier'
        
#         # Packaging
#         if re.search(r'Standard packaging', self.text, re.IGNORECASE):
#             requirements['packaging'] = 'standard'
        
#         return requirements
    
#     def _extract_evaluation_criteria(self) -> Dict[str, Any]:
#         """Extract evaluation scoring criteria"""
#         criteria = {}
        
#         # Evaluation method
#         if re.search(r'lowest price.*substantially compliant', self.text, re.IGNORECASE):
#             criteria['primary_criteria'] = 'lowest_price_substantially_compliant'
#         elif re.search(r'most economically advantageous', self.text, re.IGNORECASE):
#             criteria['primary_criteria'] = 'most_economically_advantageous'
        
#         # Compliance factors
#         criteria['compliance_factors'] = [
#             'full_compliance_with_requirements',
#             'acceptance_of_general_conditions',
#             'completeness_of_offer'
#         ]
        
#         # Post-qualification
#         if re.search(r'post-qualification', self.text, re.IGNORECASE):
#             criteria['post_qualification_required'] = True
#             criteria['post_qualification_methods'] = [
#                 'accuracy_verification',
#                 'compliance_validation',
#                 'reference_checking',
#                 'physical_inspection'
#             ]
        
#         return criteria
    
#     def to_json(self) -> Dict[str, Any]:
#         """Convert all extracted data to JSON-serializable format"""
#         return {
#             'metadata': self.metadata,
#             'vendor_requirements': self.vendor_requirements,
#             'line_items': self.line_items,
#             'delivery_requirements': self.delivery_requirements,
#             'evaluation_criteria': self.evaluation_criteria,
#             'extracted_at': datetime.now().isoformat(),
#             'summary': {
#                 'total_line_items': len(self.line_items),
#                 'total_mandatory_documents': len(self.vendor_requirements.get('mandatory_documents', [])),
#                 'vendor_selection_method': self.metadata.get('evaluation_method', 'unknown')
#             }
#         }
    
#     def to_csv_format(self) -> tuple:
#         """Convert line items to CSV-compatible format"""
#         csv_data = []
#         headers = ['Item No', 'INN Name', 'Dosage', 'Form', 'Brand Name', 'Unit of Issue']
        
#         for item in self.line_items:
#             csv_data.append([
#                 item.get('line_item_id'),
#                 item.get('inn_name', ''),
#                 item.get('dosage', ''),
#                 item.get('form', ''),
#                 item.get('brand_allowed', ''),
#                 item.get('unit_of_issue', '')
#             ])
        
#         return headers, csv_data

"""
RFQ PDF Parser - Extracts structured data from Request for Quotation PDFs
Handles medicines/requirements tables, eligibility rules, and vendor requirements
FIXED VERSION: Properly filters out annexes, forms, and non-table content
"""

import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import PyPDF2


class RFQParser:
    def __init__(self):
        self.text = ""
        self.metadata = {}
        self.vendor_requirements = {}
        self.line_items = []
        self.delivery_requirements = {}
        self.evaluation_criteria = {}
        # Heuristics for medicine parsing
        self.DOSAGE_REGEX = re.compile(
            r"\b\d{1,4}(?:[\.,]\d{1,2})?\s*(?:mg|ml|mcg|μg|ug|g|iu|u|%)(?:\s*/\s*\d{1,4}(?:[\.,]\d{1,2})?\s*(?:mg|ml|mcg|μg|ug|g|iu|u))?\b",
            re.IGNORECASE
        )

        self.FORM_KEYWORDS = [
            'tablet', 'tab', 'capsule', 'cap', 'syrup', 'suspension', 'inj', 'injection',
            'ampoule', 'ampule', 'vial', 'inhaler', 'solution', 'cream', 'gel', 'patch',
            'suppository', 'powder', 'spray', 'drops', 'ointment', 'lotion', 'strip'
        ]

        self.BOUNDARY_MARKERS = [
            'annex', 'technical and financial offer', 'quotation submission form',
            'vendor information', 'declaration', 'signature:', 'click or tap here',
            'compliance with requirements', 'yes, we will comply', 'payment terms',
            'other requirements', 'authorized signature', 'functional title', 'iom reserves the right'
        ]

        self.NON_MEDICINE_PHRASES = [
            'vendor information sheet', 'this form is mandatory', 'annex', 'click or tap',
            'on behalf of the supplier', 'code of conduct', 'procurement manual', 'quotation',
            'warranty', 'training price', 'installation price', 'insurance price', 'total final',
            'delivery lead time', 'validity of quotation', 'authorized signature', 'functional title'
        ]
        
    def parse_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Main parse function - extract all RFQ data"""
        self.text = self._extract_text_from_pdf(pdf_path)
        
        self.metadata = self._extract_metadata()
        self.vendor_requirements = self._extract_vendor_requirements()
        self.line_items = self._extract_line_items()
        self.delivery_requirements = self._extract_delivery_requirements()
        self.evaluation_criteria = self._extract_evaluation_criteria()
        
        return self.to_json()
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract raw text from PDF"""
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text
    
    def _extract_metadata(self) -> Dict[str, Any]:
        """Extract RFQ metadata: ID, dates, org, currency, etc."""
        metadata = {}
        
        # RFQ ID/Reference
        rfq_match = re.search(r'RFQ[#\s]*(?:Ref[erence]*)?[:\s#]*([A-Z0-9\-\.]+)', self.text, re.IGNORECASE)
        if rfq_match:
            metadata['rfq_id'] = rfq_match.group(1).strip()
        
        # Issue Date
        date_patterns = [
            r'(?:Issue|Date)[:\s]+(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})',
            r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
            r'(\d{4}[-/]\d{2}[-/]\d{2})'
        ]
        for pattern in date_patterns:
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                metadata['issue_date'] = match.group(1).strip()
                break
        
        # Submission Deadline
        deadline_match = re.search(
            r'(?:Deadline|Due Date)[:\s]+([0-9\s\w,:/]+?)(?:Beirut|GMT|UTC|Zone)',
            self.text, re.IGNORECASE
        )
        if deadline_match:
            metadata['submission_deadline'] = deadline_match.group(1).strip()
        
        # Issuer Organization
        issuer_match = re.search(
            r'(?:Issued by|Organization)[:\s]+([A-Z][A-Za-z\s\(\)]+?)(?:\n|Signature)',
            self.text
        )
        if issuer_match:
            metadata['issuer_org'] = issuer_match.group(1).strip()
        
        # Currency
        currency_match = re.search(r'(?:Currency|Quotation shall be quoted in)\s*:?\s*([A-Z]{3})', self.text)
        if currency_match:
            metadata['currency'] = currency_match.group(1).strip()
        else:
            metadata['currency'] = 'USD'
        
        # Contract Type
        if 'Long Term Agreement' in self.text or 'LTA' in self.text:
            metadata['contract_type'] = 'long_term_agreement'
        elif 'Framework' in self.text:
            metadata['contract_type'] = 'framework_agreement'
        else:
            metadata['contract_type'] = 'purchase_order'
        
        # Quotation Validity Days
        validity_match = re.search(r'(?:valid|remain.*valid)\s+for\s+(\d+)\s+(?:calendar\s+)?days', self.text, re.IGNORECASE)
        if validity_match:
            metadata['quotation_validity_days'] = int(validity_match.group(1))
        
        # Evaluation Method
        if 'lowest price' in self.text.lower():
            metadata['evaluation_method'] = 'lowest_price_per_line_item'
        elif 'most economical' in self.text.lower():
            metadata['evaluation_method'] = 'most_economically_advantageous'
        else:
            metadata['evaluation_method'] = 'undisclosed'
        
        # Number of vendors to select
        select_match = re.search(r'(?:up to|select)\s+(?:two|2|three|3)\s+\((\d)\)', self.text, re.IGNORECASE)
        if select_match:
            metadata['vendors_to_select'] = int(select_match.group(1))
        
        # Local vendors only
        metadata['local_only'] = bool(re.search(r'local vendors only', self.text, re.IGNORECASE))
        
        # Delivery country/location
        location_match = re.search(
            r'(?:Delivery Location|Address|Country)[:\s]+([A-Za-z\s,]+?)(?:\n|$)',
            self.text
        )
        if location_match:
            metadata['delivery_location'] = location_match.group(1).strip()
        
        return metadata
    
    def _extract_vendor_requirements(self) -> Dict[str, Any]:
        """Extract vendor eligibility and qualification requirements"""
        requirements = {
            'legal_requirements': [],
            'technical_requirements': [],
            'financial_requirements': [],
            'mandatory_documents': []
        }
        
        # QMS requirements
        if re.search(r'(?:cGMP|Current Good Manufacturing Practice)', self.text):
            requirements['legal_requirements'].append('cGMP_certification')
        if re.search(r'ISO\s*9001', self.text):
            requirements['legal_requirements'].append('ISO_9001')
        
        # Product Registration
        if re.search(r'(?:registered|registration).*(?:Ministry|MoPH|Health)', self.text, re.IGNORECASE):
            requirements['legal_requirements'].append('product_registration')
        
        # Minimum experience
        exp_match = re.search(r'minimum\s+(\d+)\s+year', self.text, re.IGNORECASE)
        if exp_match:
            requirements['technical_requirements'].append({
                'type': 'min_years_experience',
                'value': int(exp_match.group(1))
            })
        
        # References
        ref_match = re.search(r'(?:list of|provide)\s+(?:three|3|two|2)\s+(?:clients|references)', self.text, re.IGNORECASE)
        if ref_match:
            requirements['technical_requirements'].append({
                'type': 'required_references',
                'count': 3
            })
        
        # Mandatory documents
        if re.search(r'Quotation Submission Form', self.text):
            requirements['mandatory_documents'].append('quotation_submission_form')
        if re.search(r'Technical.*Financial.*Offer', self.text, re.IGNORECASE):
            requirements['mandatory_documents'].append('technical_financial_offer')
        if re.search(r'QMS.*certificate', self.text, re.IGNORECASE):
            requirements['mandatory_documents'].append('qms_certificate')
        if re.search(r'product.*registration', self.text, re.IGNORECASE):
            requirements['mandatory_documents'].append('product_registration_certificate')
        
        # VAT/Tax handling
        if re.search(r'inclusive.*VAT', self.text, re.IGNORECASE):
            requirements['financial_requirements'].append('prices_inclusive_vat')
        elif re.search(r'exclusive.*VAT', self.text, re.IGNORECASE):
            requirements['financial_requirements'].append('prices_exclusive_vat')
        
        # Payment terms
        payment_match = re.search(r'(\d+)%\s+within\s+(\d+)\s+days', self.text)
        if payment_match:
            requirements['financial_requirements'].append({
                'type': 'payment_term',
                'percentage': int(payment_match.group(1)),
                'days': int(payment_match.group(2))
            })
        
        return requirements
    
    def _extract_line_items(self) -> List[Dict[str, Any]]:
<<<<<<< Updated upstream
        """Extract medicines/requirements table (line items) - Enhanced for complex tables"""
        line_items = []
        
        # Find the table section
        table_markers = [
            'Technical Specifications',
            'Schedule of Requirements',
            'Item No',
            'International\nnon',
            'nonproprietary name'
        ]
        
        table_start = -1
        for marker in table_markers:
            pos = self.text.find(marker)
            if pos != -1:
                table_start = pos
                break
        
        if table_start == -1:
=======
        """Extract medicines/requirements table (line items) with strict section detection"""
        line_items: List[Dict[str, Any]] = []

        # Scan for candidate table starts and score them
        candidates = []
        markers = [
            'international non', 'nonproprietary name', 'schedule of requirements',
            'technical specifications', 'item no'
        ]

        text_lower = self.text.lower()
        for marker in markers:
            idx = 0
            while True:
                pos = text_lower.find(marker, idx)
                if pos == -1:
                    break
                # Look ahead a little to see if medicine columns appear nearby
                lookahead = text_lower[pos:pos + 2000]
                has_medicine_columns = any(k in lookahead for k in ['dosage', 'strength', 'form', 'pharmaceutical'])
                # Penalize generic 'item no' unless medicine columns detected
                score = 2 if marker != 'item no' else (1 if has_medicine_columns else 0)
                if has_medicine_columns:
                    score += 3
                candidates.append((score, pos))
                idx = pos + 1

        if not candidates:
>>>>>>> Stashed changes
            return line_items

        # Choose best candidate by highest score; if tie, earliest position
        candidates.sort(key=lambda x: (-x[0], x[1]))
        table_start = candidates[0][1]

        # Determine where the table ends using boundary markers
        end_markers = [
            'annex 2', 'annex 3', 'annex ii', 'annex iii', 'quotation submission form',
            'bidder\'s declaration', 'vendor information sheet', 'procurement manual',
            'this form is mandatory', 'company profile', 'instructions to bidders',
            'general conditions of contract', 'technical and financial offer', 'click or tap here'
        ]

        table_end = len(self.text)
        for em in end_markers:
            pos = text_lower.find(em, table_start)
            if pos != -1 and pos < table_end:
                table_end = pos

        table_section = self.text[table_start:table_end]
        line_items = self._parse_medicine_table_multipass(table_section)
        return line_items
    
    def _parse_medicine_table_multipass(self, text: str) -> List[Dict[str, Any]]:
        """Multi-pass parser for medicine tables with complex formatting"""
        items = []
        
        lines = text.split('\n')
        
        current_item = None
        item_buffer = []
        consecutive_non_item_lines = 0
        max_consecutive_empty = 15  # If we see this many non-item lines, stop
        
        for line in lines:
            line_stripped = line.strip()
            line_lower = line_stripped.lower()
            
<<<<<<< Updated upstream
=======
            # Skip empty lines
>>>>>>> Stashed changes
            if not line_stripped:
                consecutive_non_item_lines += 1
                # If we see too many empty lines after starting items, we've probably left the table
                if len(items) > 5 and consecutive_non_item_lines > max_consecutive_empty:
                    break
                continue
            
            # Skip header rows
            if any(header in line_lower for header in [
                'item no', 'international', 'nonproprietary', 'generic name',
<<<<<<< Updated upstream
                'dosage form', 'unit of issue', 'brand name', 'strength per', 'total qty'
            ]):
                continue
            
            # Enhanced pattern to capture: "1 Albendazole... 30" (item# + description + quantity)
            item_num_match = re.match(r'^(\d{1,3})\s+(.+?)(?:\s+(\d{1,5}))?\s*$', line_stripped)
            
            if item_num_match:
                # Save previous item
=======
                'dosage form', 'unit of issue', 'brand name', 'strength per',
                'schedule of requirements', 'technical specifications',
                'dosage and strength', 'pharmaceutical form'
            ]):
                continue
            
            # Additional safety check: if line contains form-related content, stop parsing
            if any(phrase in line_lower for phrase in [
                'click or tap here', 
                'please attach', 
                'fill in this form',
                'vendor information', 
                'bidder\'s declaration', 
                'rev.3',
                'procurement manual', 
                'effective on',
                'on behalf of the supplier',
                'represent and warrant',
                'consolidated united nations',
                'sanctions list',
                'administrative, management or supervisory'
            ]):
                # This is definitely not table content - stop parsing
                break
            
            # Check if line starts with a number (potential item number)
            # Item numbers should be reasonable (1-999)
            item_num_match = re.match(r'^(\d{1,3})[\.)-]?\s+(.+)$', line_stripped)
            
            if item_num_match:
                item_num = int(item_num_match.group(1))
                
                # Sanity check: item numbers should be sequential or at least reasonable
                # Skip if this looks like a page number or revision number
                if item_num > 500 or re.search(r'(IN/|Rev\.|Page)', line_stripped):
                    continue
                # Require dosage or pharma form cue on the same line to be considered a medicine row
                rest = item_num_match.group(2)
                has_dosage = bool(self.DOSAGE_REGEX.search(rest))
                has_form = any(k in rest.lower() for k in self.FORM_KEYWORDS)
                if not (has_dosage or has_form):
                    # Likely not a medicine row (e.g., annex placeholders). Skip starting a new item.
                    consecutive_non_item_lines += 1
                    continue
                
                # Save previous item if exists
>>>>>>> Stashed changes
                if current_item and item_buffer:
                    parsed = self._parse_item_buffer(current_item, item_buffer)
                    if parsed:
                        items.append(parsed)
                
                # Start new item
<<<<<<< Updated upstream
                item_num = int(item_num_match.group(1))
                rest_of_line = item_num_match.group(2).strip()
                quantity_at_end = item_num_match.group(3)
                
                current_item = item_num
                item_buffer = [rest_of_line]
                
                # If quantity found at end of line, add it to buffer
                if quantity_at_end:
                    item_buffer.append(f"Qty {quantity_at_end}")
            
            elif current_item is not None:
                item_buffer.append(line_stripped)
            
            if len(items) > 150 and any(marker in line_stripped.lower() for marker in [
                'payment terms', 'evaluation method', 'annex 2', 'vendor requirements'
            ]):
                break
=======
                rest_of_line = rest.strip()
                
                current_item = item_num
                item_buffer = [rest_of_line]
                consecutive_non_item_lines = 0
            
            elif current_item is not None:
                # Check if this line is still part of the item or is junk
                # Reject lines that look like page numbers, headers, or form content
                if re.match(r'^(Page|\d+\s*/\s*\d+|Rev\.|IN/\d+)', line_stripped):
                    consecutive_non_item_lines += 1
                    continue
                
                # Also reject if line is very short and doesn't look like medicine data
                if len(line_stripped) < 3:
                    consecutive_non_item_lines += 1
                    continue
                
                # Continuation of current item (multi-line entry)
                item_buffer.append(line_stripped)
                consecutive_non_item_lines = 0
            else:
                consecutive_non_item_lines += 1
                # If we haven't found any items yet and see many non-matching lines, 
                # we might be in the wrong section
                if consecutive_non_item_lines > 30:
                    break
>>>>>>> Stashed changes
        
        # Last item
        if current_item and item_buffer:
            parsed = self._parse_item_buffer(current_item, item_buffer)
            if parsed:
                items.append(parsed)
        
        return items
    
    def _parse_item_buffer(self, item_num: int, buffer: List[str]) -> Optional[Dict[str, Any]]:
        """Parse accumulated buffer lines for a single item"""
        if not buffer:
            return None
        
        # Combine all buffer lines
        combined = ' '.join(buffer)

        cl = combined.lower()
        # Reject obvious non-medicine content
        if any(p in cl for p in self.NON_MEDICINE_PHRASES):
            return None
        
        # Safety check: if combined text looks like form content, reject it
        if any(phrase in cl for phrase in [
            'click or tap', 'vendor information', 'bidder\'s declaration',
            'on behalf of', 'procurement manual', 'sanctions list'
        ]):
            return None
        
        # Extract quantity - look for standalone numbers at the end or after "Qty"
        quantity = 0
        qty_patterns = [
            r'(?:Qty|Quantity)[:\s]+(\d+)',  # Explicit "Qty: 30" or "Quantity: 100"
            r'\s+(\d{1,5})$',  # Number at the end of line (common in tables)
            r'(?:Total|Req)[:\s]+(\d+)',  # "Total: 50" or "Req: 100"
        ]
        
<<<<<<< Updated upstream
        for pattern in qty_patterns:
            qty_match = re.search(pattern, combined, re.IGNORECASE)
            if qty_match:
                quantity = int(qty_match.group(1))
                # Remove quantity from combined text to avoid confusion
                combined = combined[:qty_match.start()] + combined[qty_match.end():]
                break
        
        # Extract dosage/strength patterns
        dosage_patterns = [
            r'(\d+\.?\d*\s*(?:mg|ml|mcg|IU|U|g|%|units?)(?:\s*/\s*\d+\.?\d*\s*(?:mg|ml|mcg|IU|U|g|units?))?)',
            r'(\d+\.?\d*\s*(?:mg|ml|mcg|IU|U))',
        ]
        
        dosage_info = 'N/A'
        dosage_match = None
        for pattern in dosage_patterns:
            matches = list(re.finditer(pattern, combined, re.IGNORECASE))
            if matches:
                dosage_match = matches[0]
                dosage_info = dosage_match.group(0).strip()
                break
        
        # Extract unit of issue (Box, Bottle, Vial, Ampule, Tablet, etc.)
        unit_pattern = r'\b(box|bottle|vial|ampule|tablet|injection|inhaler|pen|tube|patch|sachet|spray|solution|pack)\b'
=======
        # Try to identify dosage/strength patterns
        dosage_match = self.DOSAGE_REGEX.search(combined)
        dosage_info = dosage_match.group(0).strip() if dosage_match else 'N/A'
        # If no dosage and no obvious form keyword, drop this item as noise
        if not dosage_match and not any(k in cl for k in self.FORM_KEYWORDS):
            return None
        
        # Extract unit of issue (Box, Bottle, Vial, Ampule, Tablet, etc.)
        unit_pattern = r'\b(box|bottle|vial|ampule|ampoule|tablet|injection|inhaler|pen|tube|patch|sachet|spray|solution)\b'
>>>>>>> Stashed changes
        unit_match = re.search(unit_pattern, combined, re.IGNORECASE)
        unit_of_issue = unit_match.group(1).capitalize() if unit_match else 'Box'
        
        # Extract medicine name (everything before dosage or first keyword)
        if dosage_match:
            name_part = combined[:dosage_match.start()].strip()
        else:
            name_part = re.split(r'\s+(box|bottle|vial|ampule|tablet)\s+', combined, 1, re.IGNORECASE)[0].strip()
        
        # Clean up name
        name_cleaned = re.sub(r'\s+', ' ', name_part).strip()
        if not name_cleaned or len(name_cleaned) < 3:
<<<<<<< Updated upstream
            name_cleaned = combined[:50]
=======
            name_cleaned = combined[:50]  # Fallback

        # Enforce: item must start with a medicine name (leading letter)
        # Reject buffers that begin with form/legal boilerplate
        if not re.match(r'^[A-Za-zÀ-ÖØ-öø-ÿ]', name_cleaned):
            return None

        # Enforce: item should end with a units/quantity pattern (or contain a nearby quantity)
        # Examples: "Box 30", "Bottle 120 ml", "10 boxes"
        quantity_pattern_end = re.search(r'(\b\d+[\s,-]?(?:ml|mg|g|pcs|pieces|boxes|box|bottles|bottle|vials|vial|tablets|tablet|packs|pack)?\s*$)', combined, re.IGNORECASE)
        quantity_pattern_near_end = re.search(r'(?:\b(unit|qty|quantity|no\.?|pcs|pieces)\b[^\d]{0,6}(\d+))', combined, re.IGNORECASE)
        if not (quantity_pattern_end or quantity_pattern_near_end):
            # As a fallback, look for any number in the last 40 characters
            tail = combined[-40:]
            if not re.search(r'\d+', tail):
                return None
>>>>>>> Stashed changes
        
        # Extract brand name
        brand_pattern = r'([A-Z][A-Za-z\-\s]+?)(?:\s+or\s+any\s+other|$)'
        brand_matches = list(re.finditer(brand_pattern, combined))
        brand_name = brand_matches[-1].group(1).strip() if brand_matches else 'Generic allowed'
        
        # Build item
        item = {
            'line_item_id': item_num,
            'inn_name': name_cleaned,
            'dosage': dosage_info,
            'form': self._extract_form(combined),
            'unit_of_issue': unit_of_issue,
            'quantity': quantity,
            'brand_name': brand_name,
            'brand_allowed': True,
            'generic_allowed': 'alternative' in combined.lower() or 'generic' in combined.lower()
        }
        
        return item
    
    def _extract_form(self, text: str) -> str:
        """Extract pharmaceutical form from text"""
        forms = {
            'tablet': r'\btab(?:let)?\b',
            'capsule': r'\bcap(?:sule)?\b',
            'syrup': r'\bsyrup\b',
            'suspension': r'\bsuspension\b',
            'injection': r'\binj(?:ection)?\b',
            'ampule': r'\bamp(?:ule|oule)?\b',
            'vial': r'\bvial\b',
            'inhaler': r'\binhaler\b',
            'solution': r'\bsolution\b',
            'cream': r'\bcream\b',
            'gel': r'\bgel\b',
            'patch': r'\bpatch\b',
            'suppository': r'\bsuppository\b',
            'powder': r'\bpowder\b',
            'spray': r'\bspray\b'
        }
        
        for form_name, pattern in forms.items():
            if re.search(pattern, text, re.IGNORECASE):
                return form_name.capitalize()
        
        return 'Tablet'
    
    def _extract_delivery_requirements(self) -> Dict[str, Any]:
        """Extract delivery terms, location, packaging, etc."""
        requirements = {}
        
        # Delivery location
        location_match = re.search(
            r'(?:Exact Address|Delivery Location)[:\s]+([A-Za-z\s,\n]+?)(?:\n\n|Customs)',
            self.text
        )
        if location_match:
            requirements['delivery_location'] = location_match.group(1).strip()
        
        # Transport mode
        if re.search(r'(?:Preferred Mode|Transport).*land', self.text, re.IGNORECASE):
            requirements['transport_mode'] = 'land'
        elif re.search(r'sea', self.text, re.IGNORECASE):
            requirements['transport_mode'] = 'sea'
        elif re.search(r'air', self.text, re.IGNORECASE):
            requirements['transport_mode'] = 'air'
        
        # Expiry requirements for medicines
        expiry_match = re.search(r'minimum of\s+(\d+)\s+month', self.text, re.IGNORECASE)
        if expiry_match:
            requirements['min_expiry_months'] = int(expiry_match.group(1))
        
        # Customs clearance
        if re.search(r'Not applicable.*Customs', self.text):
            requirements['customs_by'] = 'not_applicable'
        elif re.search(r'Supplier.*Customs', self.text, re.IGNORECASE):
            requirements['customs_by'] = 'supplier'
        
        # Packaging
        if re.search(r'Standard packaging', self.text, re.IGNORECASE):
            requirements['packaging'] = 'standard'
        
        return requirements
    
    def _extract_evaluation_criteria(self) -> Dict[str, Any]:
        """Extract evaluation scoring criteria"""
        criteria = {}
        
        # Evaluation method
        if re.search(r'lowest price.*substantially compliant', self.text, re.IGNORECASE):
            criteria['primary_criteria'] = 'lowest_price_substantially_compliant'
        elif re.search(r'most economically advantageous', self.text, re.IGNORECASE):
            criteria['primary_criteria'] = 'most_economically_advantageous'
        
        # Compliance factors
        criteria['compliance_factors'] = [
            'full_compliance_with_requirements',
            'acceptance_of_general_conditions',
            'completeness_of_offer'
        ]
        
        # Post-qualification
        if re.search(r'post-qualification', self.text, re.IGNORECASE):
            criteria['post_qualification_required'] = True
            criteria['post_qualification_methods'] = [
                'accuracy_verification',
                'compliance_validation',
                'reference_checking',
                'physical_inspection'
            ]
        
        return criteria
    
    def to_json(self) -> Dict[str, Any]:
        """Convert all extracted data to JSON-serializable format"""
        return {
            'metadata': self.metadata,
            'vendor_requirements': self.vendor_requirements,
            'line_items': self.line_items,
            'delivery_requirements': self.delivery_requirements,
            'evaluation_criteria': self.evaluation_criteria,
            'extracted_at': datetime.now().isoformat(),
            'summary': {
                'total_line_items': len(self.line_items),
                'total_mandatory_documents': len(self.vendor_requirements.get('mandatory_documents', [])),
                'vendor_selection_method': self.metadata.get('evaluation_method', 'unknown')
            }
        }
    
    def to_csv_format(self) -> tuple:
        """Convert line items to CSV-compatible format"""
        csv_data = []
        headers = ['Item No', 'INN Name', 'Dosage', 'Form', 'Quantity', 'Unit of Issue', 'Brand Name']
        
        for item in self.line_items:
            csv_data.append([
                item.get('line_item_id'),
                item.get('inn_name', ''),
                item.get('dosage', ''),
                item.get('form', ''),
                item.get('quantity', 0),
                item.get('unit_of_issue', ''),
                item.get('brand_name', '')
            ])
        
        return headers, csv_data