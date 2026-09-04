import re
from typing import Dict, Optional


# ==================================================
# TEXT CLEANING
# ==================================================

def clean_value(value: Optional[str]) -> Optional[str]:
    """
    Clean OCR-extracted text.
    """

    if not value:
        return None

    value = value.strip()

    # Remove separator characters from the edges.
    value = value.strip(" :|-[](){}")

    # Normalize whitespace.
    value = re.sub(r"\s+", " ", value)

    if not value:
        return None

    return value


# ==================================================
# VALUE VALIDATION
# ==================================================

def is_usable_value(value: Optional[str]) -> bool:
    """
    Determine whether an extracted value is meaningful.
    """

    if not value:
        return False

    value = clean_value(value)

    if not value:
        return False

    lowered = value.lower()

    invalid_values = {
        "",
        "details",
        "information",
        "record information",
        "ownership details",
        "ownership",
        "owner",
        "owner name",
        "father",
        "father name",
        "guardian",
        "father / guardian",
        "father/guardian",
        "district",
        "mandal",
        "taluk",
        "mandal / taluk",
        "mandal/taluk",
        "village",
        "survey",
        "survey no.",
        "survey / khasra no.",
        "survey/khasra no.",
        "khasra",
        "khasra no.",
        "khata",
        "khata no.",
        "record",
        "record no.",
        "land area",
        "area",
        "land type",
        "no",
        "no.",
        "?",
        "-",
        "--",
        "demo document",
        "document",
    }

    if lowered in invalid_values:
        return False

    return True


# ==================================================
# EXACT LABEL MATCHING
# ==================================================

def line_matches_label(
    line: str,
    label: str,
) -> bool:
    """
    Check whether an OCR line is exactly a label.

    Example:

        Owner Name
        Father / Guardian
        Mandal / Taluk
    """

    return bool(
        re.fullmatch(
            re.escape(label),
            line.strip(),
            flags=re.IGNORECASE,
        )
    )


# ==================================================
# NEXT-LINE EXTRACTION
# ==================================================

def extract_from_next_line(
    text: str,
    labels: list[str],
) -> Optional[str]:
    """
    Extract a value from the line immediately after
    an exact field label.

    Example:

        Owner Name
        Ravi Kumar

    returns:

        Ravi Kumar
    """

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # Longest labels first.
    sorted_labels = sorted(
        labels,
        key=len,
        reverse=True,
    )

    for index, line in enumerate(lines):

        for label in sorted_labels:

            if not line_matches_label(
                line,
                label,
            ):
                continue

            if index + 1 >= len(lines):
                continue

            value = clean_value(
                lines[index + 1]
            )

            if is_usable_value(value):
                return value

    return None


# ==================================================
# SAME-LINE EXTRACTION
# ==================================================

def extract_from_same_line(
    text: str,
    labels: list[str],
) -> Optional[str]:
    """
    Extract a value when the label and value are on
    the same line.

    Supported:

        District: Demo District
        District | Demo District
        District - Demo District

    We intentionally require a separator for
    same-line extraction.

    This prevents:

        Owner Name
        Ravi Kumar

    from becoming:

        Owner -> Name
    """

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    sorted_labels = sorted(
        labels,
        key=len,
        reverse=True,
    )

    for line in lines:

        for label in sorted_labels:

            escaped_label = re.escape(label)

            pattern = (
                rf"^\s*"
                rf"{escaped_label}"
                rf"\s*"
                rf"(?:[:|]|-)"
                rf"\s*"
                rf"(.+?)"
                rf"\s*$"
            )

            match = re.match(
                pattern,
                line,
                flags=re.IGNORECASE,
            )

            if not match:
                continue

            value = clean_value(
                match.group(1)
            )

            if is_usable_value(value):
                return value

    return None


# ==================================================
# GENERIC LABEL EXTRACTION
# ==================================================

def extract_label_value(
    text: str,
    labels: list[str],
) -> Optional[str]:
    """
    Extract a field using a safe two-stage strategy:

    1. Exact label -> next line
    2. Explicit separator -> same line

    We deliberately avoid matching partial labels.
    """

    # ------------------------------------------------
    # Strategy 1: exact label followed by next line
    # ------------------------------------------------

    value = extract_from_next_line(
        text,
        labels,
    )

    if value:
        return value

    # ------------------------------------------------
    # Strategy 2: label + separator + value
    # ------------------------------------------------

    value = extract_from_same_line(
        text,
        labels,
    )

    if value:
        return value

    return None


# ==================================================
# SURVEY NUMBER
# ==================================================

def extract_survey_number(
    text: str,
) -> Optional[str]:
    """
    Extract Survey/Khasra number.

    Supports:

        Survey / Khasra No.
        123/4A

    and OCR layouts where the value appears before
    the label:

        123/40
        Survey / Khasra No.
    """

    survey_labels = [
        "Survey / Khasra No.",
        "Survey/Khasra No.",
        "Survey No.",
        "Survery No.",
        "Khasra No.",
        "Survey",
        "Survery",
        "Khasra",
    ]

    # ------------------------------------------------
    # Strategy 1: label -> next line
    # ------------------------------------------------

    value = extract_label_value(
        text,
        survey_labels,
    )

    if value:

        value = value.strip(
            " .,:;"
        )

        if (
            value not in {
                "?",
                "-",
                "--",
            }
            and re.search(
                r"\d",
                value,
            )
        ):
            return value

    # ------------------------------------------------
    # Strategy 2: value before label
    # ------------------------------------------------

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    sorted_labels = sorted(
        survey_labels,
        key=len,
        reverse=True,
    )

    for index, line in enumerate(lines):

        for label in sorted_labels:

            if not line_matches_label(
                line,
                label,
            ):
                continue

            if index == 0:
                continue

            previous_line = clean_value(
                lines[index - 1]
            )

            if not previous_line:
                continue

            # Survey number should contain a digit.
            if not re.search(
                r"\d",
                previous_line,
            ):
                continue

            # Reject obvious text headings.
            if previous_line.lower() in {
                "details",
                "information",
                "record information",
            }:
                continue

            return previous_line

    return None


# ==================================================
# KHATA NUMBER
# ==================================================

def extract_khata_number(
    text: str,
) -> Optional[str]:
    """
    Extract Khata number.

    Examples:

        KH-2026-00421
        KH 2026 00421
        421
    """

    value = extract_label_value(
        text,
        [
            "Khata No.",
            "Khata Number",
            "Khata",
        ],
    )

    if not value:
        return None

    if value.lower() in {
        "no",
        "no.",
    }:
        return None

    # Prefer KH-style identifiers.
    khata_match = re.search(
        r"\bKH[\s-]*\d{2,4}[\s-]*\d+\b",
        value,
        flags=re.IGNORECASE,
    )

    if khata_match:
        return clean_value(
            khata_match.group(0)
        )

    # Generic numeric fallback.
    if re.search(
        r"\d",
        value,
    ):
        return value

    return None


# ==================================================
# RECORD NUMBER
# ==================================================

def extract_record_number(
    text: str,
) -> Optional[str]:
    """
    Extract Record number.

    Examples:

        LR-DEMO-00017
        LR-2026-001
    """

    value = extract_label_value(
        text,
        [
            "Record No.",
            "Record Number",
            "Record",
        ],
    )

    if value:

        lr_match = re.search(
            r"\bLR[-\s][A-Z0-9-]+\b",
            value,
            flags=re.IGNORECASE,
        )

        if lr_match:
            return clean_value(
                lr_match.group(0)
            )

    # Search the complete OCR text as fallback.
    match = re.search(
        r"\bLR[-\s][A-Z0-9-]+\b",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        return clean_value(
            match.group(0)
        )

    return None


# ==================================================
# LAND AREA
# ==================================================

def extract_land_area(
    text: str,
) -> Optional[str]:
    """
    Extract land area.

    Examples:

        2.50 Acres
        1.25 Acre
        5 Hectares
        500 Sq Ft
    """

    value = extract_label_value(
        text,
        [
            "Land Area",
            "Area",
        ],
    )

    if not value:
        return None

    area_match = re.search(
        r"\d+(?:\.\d+)?\s*"
        r"(?:"
        r"acres?"
        r"|hectares?"
        r"|ha"
        r"|sq\.?\s*ft"
        r"|sqft"
        r")",
        value,
        flags=re.IGNORECASE,
    )

    if area_match:
        return clean_value(
            area_match.group(0)
        )

    if re.search(
        r"\d",
        value,
    ):
        return value

    return None


# ==================================================
# OWNER NAME
# ==================================================

def extract_owner_name(
    text: str,
) -> Optional[str]:
    """
    Extract owner name.

    We intentionally use only the complete label
    'Owner Name' first, avoiding the ambiguous
    standalone 'Owner' label.
    """

    value = extract_label_value(
        text,
        [
            "Owner Name",
        ],
    )

    if value:
        return value

    # Fallback for documents that only contain Owner.
    value = extract_label_value(
        text,
        [
            "Owner",
        ],
    )

    return value


# ==================================================
# FATHER / GUARDIAN
# ==================================================

def extract_father_name(
    text: str,
) -> Optional[str]:
    """
    Extract Father/Guardian name.

    The complete 'Father / Guardian' label is checked
    before shorter alternatives.
    """

    value = extract_label_value(
        text,
        [
            "Father / Guardian",
            "Father/Guardian",
            "Father Name",
        ],
    )

    if value:
        return value

    # Fallback for documents containing only Father
    # or Guardian as the label.
    value = extract_label_value(
        text,
        [
            "Father",
            "Guardian",
        ],
    )

    return value


# ==================================================
# MANDAL / TALUK
# ==================================================

def extract_mandal(
    text: str,
) -> Optional[str]:
    """
    Extract Mandal/Taluk.

    The complete combined label is checked first.
    """

    value = extract_label_value(
        text,
        [
            "Mandal / Taluk",
            "Mandal/Taluk",
        ],
    )

    if value:
        return value

    value = extract_label_value(
        text,
        [
            "Mandal",
            "Taluk",
        ],
    )

    return value


# ==================================================
# MAIN LAND RECORD EXTRACTION
# ==================================================

def extract_land_record_fields(
    text: str,
) -> Dict:
    """
    Extract structured land-record fields.

    This is the deterministic baseline extraction
    layer for IntelliLand AI.
    """

    # Normalize line endings.
    text = text.replace(
        "\r\n",
        "\n",
    )

    text = text.replace(
        "\r",
        "\n",
    )

    fields = {

        # --------------------------------------------
        # Owner
        # --------------------------------------------

        "owner_name": extract_owner_name(
            text
        ),

        # --------------------------------------------
        # Father / Guardian
        # --------------------------------------------

        "father_name": extract_father_name(
            text
        ),

        # --------------------------------------------
        # Location
        # --------------------------------------------

        "district": extract_label_value(
            text,
            [
                "District",
            ],
        ),

        "mandal": extract_mandal(
            text
        ),

        "village": extract_label_value(
            text,
            [
                "Village",
            ],
        ),

        # --------------------------------------------
        # Survey
        # --------------------------------------------

        "survey_number": extract_survey_number(
            text
        ),

        # --------------------------------------------
        # Khata
        # --------------------------------------------

        "khata_number": extract_khata_number(
            text
        ),

        # --------------------------------------------
        # Record
        # --------------------------------------------

        "record_number": extract_record_number(
            text
        ),

        # --------------------------------------------
        # Land Area
        # --------------------------------------------

        "land_area": extract_land_area(
            text
        ),

        # --------------------------------------------
        # Land Type
        # --------------------------------------------

        "land_type": extract_label_value(
            text,
            [
                "Land Type",
            ],
        ),
    }

    return fields