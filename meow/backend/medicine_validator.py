"""
Medicine Validator - Validates medicines against authorized database
Loads authorized medicines from medicines-output-medicines-report_en.xlsx
and provides fuzzy matching to validate RFQ medicines
"""

import openpyxl
import pandas as pd
from typing import Dict, List, Optional, Tuple
from difflib import SequenceMatcher
import os

class MedicineValidator:
    def __init__(self, excel_path: str = None, csv_path: str = None):
        """
        Initialize medicine validator with authorized medicines database
        
        Args:
            excel_path: Path to medicines-output-medicines-report_en.xlsx
            csv_path: Path to CSV dataset (e.g., meow/dataaa.csv)
        """
        self.authorized_medicines = {}  # {inn_name: {dosage, form, strength, brand, etc.}}
        self.medicine_index = {}  # Normalized names -> original entry for faster lookup
        # Discover a data source
        discovered_path = self._find_medicines_file()
        # Prefer explicit args, else discovered path
        self.excel_path = excel_path if excel_path else (discovered_path if discovered_path and discovered_path.lower().endswith('.xlsx') else None)
        self.csv_path = csv_path if csv_path else (discovered_path if discovered_path and discovered_path.lower().endswith('.csv') else None)
        
        if self.excel_path and os.path.exists(self.excel_path):
            self._load_authorized_medicines()
        elif self.csv_path and os.path.exists(self.csv_path):
            self._load_authorized_medicines_csv()
        else:
            print(f"Warning: Medicines database not found. Checked Excel: {self.excel_path} and CSV: {self.csv_path}")
    
    def _find_medicines_file(self) -> str:
        """Search for the medicines database file (Excel or CSV)"""
        possible_paths = [
            # Excel options
            '../medicines-output-medicines-report_en.xlsx',
            '../../medicines-output-medicines-report_en.xlsx',
            'medicines-output-medicines-report_en.xlsx',
            # CSV options (relative to backend folder)
            '../dataaa.csv',
            '../../dataaa.csv',
            'dataaa.csv',
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        return None
    
    def _load_authorized_medicines(self):
        """Load and index authorized medicines from Excel file"""
        try:
            # Try reading with pandas first (more flexible)
            df = pd.read_excel(self.excel_path, sheet_name=0)
            
            # Standardize column names to lowercase
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Create index from the dataframe
            for idx, row in df.iterrows():
                # Get medicine name (try different column names)
                medicine_name = None
                for col in ['inn name', 'inn_name', 'name', 'medicine name', 'drug name']:
                    if col in df.columns and pd.notna(row.get(col)):
                        medicine_name = str(row[col]).strip()
                        break
                
                if not medicine_name:
                    continue
                
                # Get other relevant fields
                entry = {
                    'inn_name': medicine_name,
                    'dosage': str(row.get('dosage', 'N/A')).strip() if 'dosage' in df.columns else 'N/A',
                    'strength': str(row.get('strength', 'N/A')).strip() if 'strength' in df.columns else 'N/A',
                    'form': str(row.get('form', 'N/A')).strip() if 'form' in df.columns else 'N/A',
                    'brand': str(row.get('brand', 'N/A')).strip() if 'brand' in df.columns else 'N/A',
                    'authorized': True,
                    'raw_row': dict(row)
                }
                
                self.authorized_medicines[medicine_name] = entry
                
                # Create normalized index for fuzzy matching
                normalized = self._normalize_name(medicine_name)
                self.medicine_index[normalized] = medicine_name
            
            print(f"✓ Loaded {len(self.authorized_medicines)} authorized medicines")
            
        except Exception as e:
            print(f"Error loading medicines database: {e}")
            self.authorized_medicines = {}
            self.medicine_index = {}

    def _load_authorized_medicines_csv(self):
        """Load and index authorized medicines from a CSV file (EMA listing)"""
        try:
            df = pd.read_csv(self.csv_path)
            # Standardize column names
            df.columns = [str(col).strip().lower() for col in df.columns]

            # Expected columns in EMA CSV
            name_cols = [
                'international non-proprietary name (inn) / common name',
                'international non-proprietary name (inn)/ common name',
                'inn',
                'common name',
            ]
            brand_cols = ['name of medicine', 'medicine name', 'name']
            status_col = 'medicine status'

            # Filter to Authorised only if the column exists
            if status_col in df.columns:
                df = df[df[status_col].str.strip().str.lower() == 'authorised']

            for _, row in df.iterrows():
                # Find INN/common name
                inn_name = None
                for col in name_cols:
                    if col in df.columns and pd.notna(row.get(col)):
                        inn_name = str(row[col]).strip()
                        break
                # Fallback to brand if INN missing
                if not inn_name:
                    for col in brand_cols:
                        if col in df.columns and pd.notna(row.get(col)):
                            inn_name = str(row[col]).strip()
                            break
                if not inn_name:
                    continue

                entry = {
                    'inn_name': inn_name,
                    'dosage': 'N/A',
                    'strength': 'N/A',
                    'form': 'N/A',
                    'brand': None,
                    'authorized': True,
                    'raw_row': dict(row)
                }

                # Save
                self.authorized_medicines[inn_name] = entry
                normalized = self._normalize_name(inn_name)
                self.medicine_index[normalized] = inn_name

            print(f"✓ Loaded {len(self.authorized_medicines)} authorized medicines from CSV")
        except Exception as e:
            print(f"Error loading medicines CSV database: {e}")
            self.authorized_medicines = {}
            self.medicine_index = {}
    
    def _normalize_name(self, name: str) -> str:
        """Normalize medicine name for comparison"""
        return name.lower().strip().replace('-', ' ').replace('  ', ' ')
    
    def validate_medicine(self, inn_name: str, dosage: str = None, form: str = None) -> Tuple[bool, Optional[Dict], float]:
        """
        Validate if a medicine exists in the authorized database
        
        Args:
            inn_name: Medicine name to validate
            dosage: Optional dosage/strength
            form: Optional pharmaceutical form
        
        Returns:
            (is_valid, matched_medicine_details, confidence_score)
            - is_valid: Boolean indicating if medicine is authorized
            - matched_medicine_details: The matched medicine entry if found
            - confidence_score: Fuzzy match confidence (0-1)
        """
        if not inn_name:
            return False, None, 0.0
        
        # Try exact match first
        if inn_name in self.authorized_medicines:
            return True, self.authorized_medicines[inn_name], 1.0
        
        # Try normalized exact match
        normalized = self._normalize_name(inn_name)
        if normalized in self.medicine_index:
            original_name = self.medicine_index[normalized]
            return True, self.authorized_medicines[original_name], 1.0
        
        # Try fuzzy matching
        best_match = None
        best_score = 0.0
        threshold = 0.75  # Confidence threshold for fuzzy match
        
        for auth_med_name, auth_med_data in self.authorized_medicines.items():
            # Compare with both original and normalized names
            score1 = self._similarity_score(inn_name, auth_med_name)
            score2 = self._similarity_score(normalized, self._normalize_name(auth_med_name))
            
            score = max(score1, score2)
            
            if score > best_score:
                best_score = score
                best_match = (auth_med_data, score)
        
        # Return fuzzy match if above threshold
        if best_match and best_score >= threshold:
            return True, best_match[0], best_score
        
        # Medicine not found in database
        return False, None, best_score if best_match else 0.0
    
    def _similarity_score(self, str1: str, str2: str) -> float:
        """Calculate similarity score between two strings (0-1)"""
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()
    
    def validate_medicine_batch(self, medicines: List[Dict]) -> List[Dict]:
        """
        Validate a batch of medicines and enrich with validation results
        
        Args:
            medicines: List of medicine dictionaries with 'inn_name', 'dosage', 'form'
        
        Returns:
            List of medicines with added 'validated', 'confidence', and 'authorized' fields
        """
        validated_batch = []
        
        for med in medicines:
            inn_name = med.get('inn_name', '')
            dosage = med.get('dosage', '')
            form = med.get('form', '')
            
            is_valid, matched_data, confidence = self.validate_medicine(inn_name, dosage, form)
            
            # Create validated entry
            validated_entry = med.copy()
            validated_entry['validated'] = True
            validated_entry['is_authorized'] = is_valid
            validated_entry['confidence_score'] = round(confidence, 2)
            
            if is_valid and matched_data:
                validated_entry['matched_medicine'] = matched_data
            
            validated_batch.append(validated_entry)
        
        return validated_batch
    
    def filter_authorized_medicines(self, medicines: List[Dict], min_confidence: float = 0.75) -> Tuple[List[Dict], List[Dict]]:
        """
        Filter medicines, returning only authorized ones and rejecting others
        
        Args:
            medicines: List of medicine dictionaries
            min_confidence: Minimum confidence score to accept a fuzzy match
        
        Returns:
            (authorized_medicines, rejected_medicines)
        """
        authorized = []
        rejected = []
        
        for med in medicines:
            inn_name = med.get('inn_name', '')
            dosage = med.get('dosage', '')
            form = med.get('form', '')
            
            is_valid, matched_data, confidence = self.validate_medicine(inn_name, dosage, form)
            
            if is_valid and confidence >= min_confidence:
                # Add matched data to the medicine entry
                med_copy = med.copy()
                if matched_data:
                    med_copy['matched_medicine'] = matched_data
                med_copy['confidence_score'] = confidence
                authorized.append(med_copy)
            else:
                reject_entry = med.copy()
                reject_entry['rejection_reason'] = 'Not found in authorized medicines database'
                reject_entry['confidence_score'] = confidence
                rejected.append(reject_entry)
        
        return authorized, rejected
    
    def get_authorized_medicines_list(self) -> List[str]:
        """Get list of all authorized medicine names"""
        return list(self.authorized_medicines.keys())
    
    def get_medicine_details(self, inn_name: str) -> Optional[Dict]:
        """Get full details of an authorized medicine"""
        # Try exact match
        if inn_name in self.authorized_medicines:
            return self.authorized_medicines[inn_name]
        
        # Try normalized match
        normalized = self._normalize_name(inn_name)
        if normalized in self.medicine_index:
            original_name = self.medicine_index[normalized]
            return self.authorized_medicines[original_name]
        
        return None
    
    def search_medicines(self, query: str) -> List[Dict]:
        """Search for medicines matching a query"""
        query_normalized = self._normalize_name(query)
        results = []
        
        for med_name, med_data in self.authorized_medicines.items():
            if query_normalized in self._normalize_name(med_name) or \
               self._normalize_name(med_name) in query_normalized or \
               self._similarity_score(query_normalized, self._normalize_name(med_name)) > 0.6:
                results.append(med_data)
        
        # Sort by relevance
        results.sort(key=lambda x: self._similarity_score(query_normalized, self._normalize_name(x['inn_name'])), reverse=True)
        
        return results
    
    def generate_validation_report(self, medicines: List[Dict]) -> Dict:
        """Generate a validation report for a batch of medicines"""
        authorized, rejected = self.filter_authorized_medicines(medicines)
        
        report = {
            'total_medicines': len(medicines),
            'authorized_count': len(authorized),
            'rejected_count': len(rejected),
            'authorization_rate': round(len(authorized) / len(medicines) * 100, 2) if medicines else 0,
            'authorized_medicines': authorized,
            'rejected_medicines': rejected,
            'database_size': len(self.authorized_medicines),
            'validation_timestamp': pd.Timestamp.now().isoformat()
        }
        
        return report
