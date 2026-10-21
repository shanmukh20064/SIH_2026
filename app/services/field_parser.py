import re
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

MONTH_NAMES = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12
}

def normalize_date(date_str: str) -> Optional[str]:
    """
    Normalizes a variety of human and machine date formats into standard ISO 8601 (YYYY-MM-DD).
    Handles:
      - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
      - YYYY-MM-DD, YYYY/MM/DD
      - 15th August 2024, August 15, 2024, 15-Aug-2024
    """
    if not date_str:
        return None
    
    cleaned = date_str.strip().rstrip(".,;")
    # Remove ordinal suffixes: 1st, 2nd, 3rd, 4th -> 1, 2, 3, 4
    cleaned = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', cleaned, flags=re.IGNORECASE)

    # 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
    match = re.match(r'^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$', cleaned)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            return None

    # 2. DD/MM/YYYY or DD-MM-YYYY
    match = re.match(r'^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$', cleaned)
    if match:
        day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            return None

    # 3. DD-Mon-YYYY or DD Mon YYYY e.g. "15 Aug 2025" or "15-August-2025"
    match = re.match(r'^(\d{1,2})[\s\-]+([A-Za-z]+)[\s\-]+(\d{4})$', cleaned)
    if match:
        day = int(match.group(1))
        mon_str = match.group(2).lower()
        year = int(match.group(3))
        month = MONTH_NAMES.get(mon_str)
        if month:
            try:
                return datetime(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                return None

    # 4. Mon DD, YYYY e.g. "August 15, 2024"
    match = re.match(r'^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$', cleaned)
    if match:
        mon_str = match.group(1).lower()
        day = int(match.group(2))
        year = int(match.group(3))
        month = MONTH_NAMES.get(mon_str)
        if month:
            try:
                return datetime(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                return None

    return None

def normalize_institution_id(pid_str: str) -> Optional[str]:
    """Standardizes Institution ID (uppercases and cleans whitespace)."""
    if not pid_str:
        return None
    cleaned = re.sub(r'[^A-Za-z0-9\-]', '', pid_str.strip().upper())
    return cleaned if len(cleaned) >= 3 else None

def parse_fields_from_pages(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Scans extracted page text to identify and extract key structured fields.
    Returns list of dicts suitable for ExtractedField model persistence.
    """
    extracted_fields = []
    
    # Track which fields have been extracted to avoid duplicate over-writing
    found_fields = set()

    for p in pages:
        page_num = p.get("page_number", 1)
        text = p.get("text", "")
        if not text:
            continue

        lines = [line.strip() for line in text.splitlines() if line.strip()]

        # 1. Institution ID / Permanent Institute ID
        if "institution_id" not in found_fields:
            pid_regexes = [
                r'(?:Permanent\s+Institute\s+Id|Permanent\s+Institute\s+ID|PID|Institute\s+ID|AICTE\s+ID)\s*[:.\-]?\s*([A-Za-z0-9][A-Za-z0-9\-_]{3,25})',
                r'(?:Application\s+ID|Institution\s+Code)\s*[:.\-]?\s*([A-Za-z0-9\-_]{4,25})'
            ]
            for regex in pid_regexes:
                m = re.search(regex, text, re.IGNORECASE)
                if m:
                    raw_val = m.group(1).strip()
                    norm_val = normalize_institution_id(raw_val)
                    start = max(0, m.start() - 20)
                    end = min(len(text), m.end() + 20)
                    snippet = text[start:end].replace("\n", " ")
                    extracted_fields.append({
                        "field_name": "institution_id",
                        "extracted_value": raw_val,
                        "normalized_value": norm_val,
                        "confidence": 0.95,
                        "source_page": page_num,
                        "raw_text_snippet": snippet,
                        "is_inferred": False
                    })
                    found_fields.add("institution_id")
                    break

        # 2. Certificate / NOC / Letter Number
        if "certificate_number" not in found_fields:
            cert_regexes = [
                r'(?:Certificate\s+No|Certificate\s+Number|Cert\s+No|NOC\s+No|Ref\s+No|Reference\s+No|Letter\s+No|Order\s+No|File\s+No)\s*[:.\-]?\s*([A-Za-z0-9\/\-_]{4,35})',
                r'(?:No\.|Ref\.)\s*[:.\-]?\s*([A-Za-z0-9\/\-_]{5,35})'
            ]
            for regex in cert_regexes:
                m = re.search(regex, text, re.IGNORECASE)
                if m:
                    raw_val = m.group(1).strip()
                    start = max(0, m.start() - 15)
                    end = min(len(text), m.end() + 15)
                    extracted_fields.append({
                        "field_name": "certificate_number",
                        "extracted_value": raw_val,
                        "normalized_value": raw_val.upper(),
                        "confidence": 0.90,
                        "source_page": page_num,
                        "raw_text_snippet": text[start:end].replace("\n", " "),
                        "is_inferred": False
                    })
                    found_fields.add("certificate_number")
                    break

        # 3. Issue Date
        if "issue_date" not in found_fields:
            issue_regexes = [
                r'(?:Date\s+of\s+Issue|Issued\s+on|Issue\s+Date|Dated|Date)\s*[:.\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4}|[A-Za-z]+\s+[0-9]{1,2},\s*[0-9]{4})',
            ]
            for regex in issue_regexes:
                m = re.search(regex, text, re.IGNORECASE)
                if m:
                    raw_date = m.group(1).strip()
                    norm_date = normalize_date(raw_date)
                    if norm_date:
                        start = max(0, m.start() - 15)
                        end = min(len(text), m.end() + 15)
                        extracted_fields.append({
                            "field_name": "issue_date",
                            "extracted_value": raw_date,
                            "normalized_value": norm_date,
                            "confidence": 0.92,
                            "source_page": page_num,
                            "raw_text_snippet": text[start:end].replace("\n", " "),
                            "is_inferred": False
                        })
                        found_fields.add("issue_date")
                        break

        # 4. Expiry Date / Validity Date
        if "expiry_date" not in found_fields:
            expiry_regexes = [
                r'(?:Date\s+of\s+Expiry|Expiry\s+Date|Valid\s+till|Valid\s+up\s+to|Valid\s+upto|Validity\s+Period\s+upto|Valid\s+through)\s*[:.\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2}|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4}|[A-Za-z]+\s+[0-9]{1,2},\s*[0-9]{4})',
            ]
            for regex in expiry_regexes:
                m = re.search(regex, text, re.IGNORECASE)
                if m:
                    raw_date = m.group(1).strip()
                    norm_date = normalize_date(raw_date)
                    if norm_date:
                        start = max(0, m.start() - 15)
                        end = min(len(text), m.end() + 15)
                        extracted_fields.append({
                            "field_name": "expiry_date",
                            "extracted_value": raw_date,
                            "normalized_value": norm_date,
                            "confidence": 0.92,
                            "source_page": page_num,
                            "raw_text_snippet": text[start:end].replace("\n", " "),
                            "is_inferred": False
                        })
                        found_fields.add("expiry_date")
                        break

        # 5. Institution Name
        if "institution_name" not in found_fields:
            name_regexes = [
                r'(?:Name\s+of\s+(?:the\s+)?Institution|Institute\s+Name|Name\s+of\s+College|Institution\s+Name|College\s+Name)\s*[:.\-]?\s*([A-Za-z0-9\s.,&\-\(\)]+?)(?=\n|\r|Address|State|District|PID|Date|$)',
            ]
            for regex in name_regexes:
                m = re.search(regex, text, re.IGNORECASE)
                if m:
                    raw_name = m.group(1).strip()
                    if len(raw_name) >= 5:
                        start = max(0, m.start() - 15)
                        end = min(len(text), m.end() + 15)
                        extracted_fields.append({
                            "field_name": "institution_name",
                            "extracted_value": raw_name,
                            "normalized_value": " ".join(raw_name.upper().split()),
                            "confidence": 0.88,
                            "source_page": page_num,
                            "raw_text_snippet": text[start:end].replace("\n", " "),
                            "is_inferred": False
                        })
                        found_fields.add("institution_name")
                        break

        # 6. Issuing Authority
        if "issuing_authority" not in found_fields:
            authorities = [
                ("All India Council for Technical Education", "AICTE"),
                ("Fire and Emergency Services", "State Fire & Emergency Services Department"),
                ("Directorate of Town and Country Planning", "DTCP / Town Planning Authority"),
                ("Public Works Department", "PWD"),
                ("Affiliating University", "State Technical University / Affiliating Body"),
                ("Municipal Corporation", "City Municipal Corporation")
            ]
            for auth_phrase, auth_label in authorities:
                if re.search(r'\b' + re.escape(auth_phrase) + r'\b', text, re.IGNORECASE):
                    extracted_fields.append({
                        "field_name": "issuing_authority",
                        "extracted_value": auth_phrase,
                        "normalized_value": auth_label,
                        "confidence": 0.85,
                        "source_page": page_num,
                        "raw_text_snippet": f"Identified authority keyword: '{auth_phrase}' in document text.",
                        "is_inferred": True
                    })
                    found_fields.add("issuing_authority")
                    break

    return extracted_fields
