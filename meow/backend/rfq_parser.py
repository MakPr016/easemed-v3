"""
RFQ PDF Parser - Extracts structured data from Request for Quotation PDFs
Handles medicines/requirements tables, eligibility rules, and vendor requirements
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
            return line_items
        
        # Extract large section after table start
        table_section = self.text[table_start:table_start + 30000]
        
        # Parse using improved multi-pass approach
        line_items = self._parse_medicine_table_multipass(table_section)
        
        return line_items
    
    def _parse_medicine_table_multipass(self, text: str) -> List[Dict[str, Any]]:
        """Multi-pass parser for medicine tables with complex formatting"""
        items = []
        
        lines = text.split('\n')
        
        current_item = None
        item_buffer = []
        
        for line in lines:
            line_stripped = line.strip()
            
            if not line_stripped:
                continue
            if any(header in line_stripped.lower() for header in [
                'item no', 'international', 'nonproprietary', 'generic name',
                'dosage form', 'unit of issue', 'brand name', 'strength per', 'total qty'
            ]):
                continue
            
            # Enhanced pattern to capture: "1 Albendazole... 30" (item# + description + quantity)
            item_num_match = re.match(r'^(\d{1,3})\s+(.+?)(?:\s+(\d{1,5}))?\s*$', line_stripped)
            
            if item_num_match:
                # Save previous item
                if current_item and item_buffer:
                    parsed = self._parse_item_buffer(current_item, item_buffer)
                    if parsed:
                        items.append(parsed)
                
                # Start new item
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
        
        # Extract quantity - look for standalone numbers at the end or after "Qty"
        quantity = 0
        qty_patterns = [
            r'(?:Qty|Quantity)[:\s]+(\d+)',  # Explicit "Qty: 30" or "Quantity: 100"
            r'\s+(\d{1,5})$',  # Number at the end of line (common in tables)
            r'(?:Total|Req)[:\s]+(\d+)',  # "Total: 50" or "Req: 100"
        ]
        
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
            name_cleaned = combined[:50]
        
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
            'ampule': r'\bamp(?:ule)?\b',
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
