import re
from typing import Any, Dict, List


# --------------------------------------------------
# Required land-record fields
# --------------------------------------------------

REQUIRED_FIELDS = [
    "owner_name",
    "father_name",
    "district",
    "mandal",
    "village",
    "survey_number",
    "khata_number",
    "record_number",
    "land_area",
    "land_type",
]


# --------------------------------------------------
# Common helpers
# --------------------------------------------------

def clean_text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def is_missing(value: Any) -> bool:
    return clean_text(value) == ""


# --------------------------------------------------
# Field-specific validators
# --------------------------------------------------

def validate_name(value: Any) -> tuple[bool, str]:
    text = clean_text(value)

    if not text:
        return False, "Name was not extracted."

    if len(text) < 2:
        return False, "Name is too short."

    if len(text) > 100:
        return False, "Name is unusually long."

    if not re.search(r"[A-Za-z]", text):
        return False, (
            "Name does not contain recognizable alphabetic characters."
        )

    return True, "Name appears valid."


def validate_location(
    value: Any,
    field_name: str,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, f"{field_name} was not extracted."

    if len(text) < 2:
        return False, f"{field_name} is too short."

    if len(text) > 150:
        return False, f"{field_name} is unusually long."

    if not re.search(r"[A-Za-z]", text):
        return False, (
            f"{field_name} does not contain recognizable text."
        )

    return True, f"{field_name} appears valid."


def validate_survey_number(
    value: Any,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, (
            "Survey/Khasra number was not extracted."
        )

    # Typical land-record survey numbers can contain
    # numbers, letters, slashes and hyphens.
    #
    # Examples:
    # 123
    # 123/4A
    # 123/40
    # 12-4
    # 12/4/1

    pattern = (
        r"^[A-Za-z0-9]+"
        r"(?:[\/\-][A-Za-z0-9]+)*$"
    )

    if not re.fullmatch(pattern, text):
        return False, (
            "Survey/Khasra number contains "
            "unexpected characters."
        )

    if not re.search(r"\d", text):
        return False, (
            "Survey/Khasra number should contain "
            "a numeric component."
        )

    # OCR ambiguity detection.
    #
    # We do NOT automatically correct the value.
    # A human reviewer should verify ambiguous values
    # against the original document.

    if "/" in text:
        parts = text.split("/")

        if len(parts) == 2:
            base, subdivision = parts

            if (
                subdivision.isdigit()
                and len(subdivision) >= 1
            ):
                return True, (
                    "Survey/Khasra number is structurally "
                    "valid but may require OCR/human "
                    "verification."
                )

    return True, (
        "Survey/Khasra number appears "
        "structurally valid."
    )


def validate_khata_number(
    value: Any,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, (
            "Khata number was not extracted."
        )

    pattern = (
        r"^[A-Za-z0-9]+"
        r"(?:[-\/][A-Za-z0-9]+)*$"
    )

    if not re.fullmatch(pattern, text):
        return False, (
            "Khata number contains unexpected characters."
        )

    if not re.search(r"\d", text):
        return False, (
            "Khata number should contain "
            "a numeric component."
        )

    return True, (
        "Khata number appears structurally valid."
    )


def validate_record_number(
    value: Any,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, (
            "Record number was not extracted."
        )

    pattern = (
        r"^[A-Za-z0-9]+"
        r"(?:[-\/][A-Za-z0-9]+)*$"
    )

    if not re.fullmatch(pattern, text):
        return False, (
            "Record number contains unexpected characters."
        )

    if not re.search(r"\d", text):
        return False, (
            "Record number should contain "
            "a numeric component."
        )

    return True, (
        "Record number appears structurally valid."
    )


def validate_land_area(
    value: Any,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, (
            "Land area was not extracted."
        )

    number_match = re.search(
        r"\d+(?:\.\d+)?",
        text,
    )

    if not number_match:
        return False, (
            "Land area does not contain "
            "a numeric value."
        )

    try:
        area = float(
            number_match.group()
        )
    except ValueError:
        return False, (
            "Land area contains an invalid "
            "numeric value."
        )

    if area <= 0:
        return False, (
            "Land area must be greater than zero."
        )

    if area > 100000:
        return False, (
            "Land area is unusually large "
            "and requires verification."
        )

    return True, (
        "Land area contains a valid "
        "positive numeric value."
    )


def validate_land_type(
    value: Any,
) -> tuple[bool, str]:

    text = clean_text(value)

    if not text:
        return False, (
            "Land type was not extracted."
        )

    if len(text) < 3:
        return False, (
            "Land type is too short."
        )

    common_types = {
        "agricultural",
        "residential",
        "commercial",
        "industrial",
        "forest",
        "government",
        "institutional",
        "mixed",
        "pasture",
        "orchard",
    }

    if text.lower() in common_types:
        return True, (
            "Land type matches a recognized category."
        )

    # Unknown regional terminology is allowed.
    if re.search(r"[A-Za-z]", text):
        return True, (
            "Land type contains usable text but may "
            "require domain-specific verification."
        )

    return False, (
        "Land type does not contain recognizable text."
    )


# --------------------------------------------------
# Field-level validation
# --------------------------------------------------

def validate_fields(
    fields: Dict[str, Any],
) -> Dict:

    """
    Level 1:
    Validate individual extracted fields using
    field-specific rules.
    """

    results = []
    valid_count = 0
    warning_count = 0

    for field_name in REQUIRED_FIELDS:

        value = fields.get(field_name)

        if is_missing(value):
            results.append({
                "field": field_name,
                "status": "missing",
                "message": "Field was not extracted.",
            })
            continue

        if field_name in {
            "owner_name",
            "father_name",
        }:
            is_valid, message = validate_name(
                value
            )

        elif field_name in {
            "district",
            "mandal",
            "village",
        }:
            is_valid, message = validate_location(
                value,
                field_name,
            )

        elif field_name == "survey_number":

            is_valid, message = validate_survey_number(
                value
            )

            if (
                is_valid
                and "may require" in message.lower()
            ):
                warning_count += 1

        elif field_name == "khata_number":

            is_valid, message = validate_khata_number(
                value
            )

        elif field_name == "record_number":

            is_valid, message = validate_record_number(
                value
            )

        elif field_name == "land_area":

            is_valid, message = validate_land_area(
                value
            )

        elif field_name == "land_type":

            is_valid, message = validate_land_type(
                value
            )

        else:
            is_valid = True
            message = (
                "Field contains a usable value."
            )

        if is_valid:

            results.append({
                "field": field_name,
                "status": "valid",
                "message": message,
                "value": clean_text(value),
            })

            valid_count += 1

        else:

            results.append({
                "field": field_name,
                "status": "invalid",
                "message": message,
                "value": clean_text(value),
            })

    total_fields = len(REQUIRED_FIELDS)

    field_score = (
        valid_count / total_fields
        if total_fields
        else 0
    )

    return {
        "level": "field",
        "score": round(
            field_score * 100,
            2,
        ),
        "valid_fields": valid_count,
        "total_fields": total_fields,
        "warning_count": warning_count,
        "results": results,
    }


# --------------------------------------------------
# Record-level validation
# --------------------------------------------------

def validate_record(
    fields: Dict[str, Any],
) -> Dict:

    """
    Level 2:
    Validate relationships and basic consistency
    between fields in the same land record.
    """

    issues: List[str] = []
    warnings: List[str] = []

    # --------------------------------------------------
    # Required fields
    # --------------------------------------------------

    for field_name in REQUIRED_FIELDS:

        if is_missing(
            fields.get(field_name)
        ):
            issues.append(
                f"Required field "
                f"'{field_name}' is missing."
            )

    # --------------------------------------------------
    # Survey number
    # --------------------------------------------------

    survey_number = clean_text(
        fields.get("survey_number")
    )

    if survey_number:

        valid, message = validate_survey_number(
            survey_number
        )

        if not valid:

            issues.append(message)

        elif "may require" in message.lower():

            warnings.append(
                "Survey/Khasra number may contain "
                "an OCR ambiguity."
            )

    # --------------------------------------------------
    # Khata number
    # --------------------------------------------------

    khata_number = clean_text(
        fields.get("khata_number")
    )

    if khata_number:

        valid, message = validate_khata_number(
            khata_number
        )

        if not valid:
            issues.append(message)

    # --------------------------------------------------
    # Record number
    # --------------------------------------------------

    record_number = clean_text(
        fields.get("record_number")
    )

    if record_number:

        valid, message = validate_record_number(
            record_number
        )

        if not valid:
            issues.append(message)

    # --------------------------------------------------
    # Land area
    # --------------------------------------------------

    land_area = clean_text(
        fields.get("land_area")
    )

    if land_area:

        valid, message = validate_land_area(
            land_area
        )

        if not valid:
            issues.append(message)

    # --------------------------------------------------
    # Owner name
    # --------------------------------------------------

    owner_name = clean_text(
        fields.get("owner_name")
    )

    suspicious_values = {
        "ownership details",
        "record information",
        "land record",
        "demo document",
        "owner name",
        "father guardian",
    }

    if owner_name.lower() in suspicious_values:

        issues.append(
            "Owner name appears to be "
            "a document heading."
        )

    # --------------------------------------------------
    # Father/Guardian relationship
    # --------------------------------------------------

    father_name = clean_text(
        fields.get("father_name")
    )

    if owner_name and father_name:

        if owner_name.lower() == father_name.lower():

            warnings.append(
                "Owner name and Father/Guardian "
                "name are identical."
            )

    return {
        "level": "record",
        "status": (
            "valid"
            if not issues
            else "issues_found"
        ),
        "issues": issues,
        "warnings": warnings,
        "issue_count": len(issues),
        "warning_count": len(warnings),
    }


# --------------------------------------------------
# Cross-field consistency validation
# --------------------------------------------------

def validate_cross_system(
    fields: Dict[str, Any],
) -> Dict:

    """
    Level 3:
    Cross-system validation placeholder.

    Until PostgreSQL/PostGIS or an external government
    data source is connected, this layer performs
    cross-field consistency checks.
    """

    issues: List[str] = []

    district = clean_text(
        fields.get("district")
    )

    mandal = clean_text(
        fields.get("mandal")
    )

    village = clean_text(
        fields.get("village")
    )

    owner = clean_text(
        fields.get("owner_name")
    )

    survey = clean_text(
        fields.get("survey_number")
    )

    # --------------------------------------------------
    # Location hierarchy
    # --------------------------------------------------

    if village and not mandal:

        issues.append(
            "Village is present but "
            "Mandal/Taluk is missing."
        )

    if mandal and not district:

        issues.append(
            "Mandal/Taluk is present but "
            "District is missing."
        )

    # --------------------------------------------------
    # Owner ↔ Survey relationship
    # --------------------------------------------------

    if owner and not survey:

        issues.append(
            "Owner is present but "
            "Survey/Khasra number is missing."
        )

    if survey and not owner:

        issues.append(
            "Survey/Khasra number is present "
            "but Owner is missing."
        )

    # --------------------------------------------------
    # Location completeness
    # --------------------------------------------------

    if district and not mandal and village:

        issues.append(
            "Village cannot be reliably mapped "
            "without Mandal/Taluk."
        )

    return {
        "level": "cross_system",
        "status": (
            "consistent"
            if not issues
            else "inconsistent"
        ),
        "issues": issues,
        "issue_count": len(issues),
    }


# --------------------------------------------------
# Overall validation
# --------------------------------------------------

def validate_land_record(
    fields: Dict[str, Any],
) -> Dict:

    """
    Run all validation levels and calculate
    an overall validation score.

    Final statuses:

    approved
    review_required
    rejected
    """

    field_validation = validate_fields(
        fields
    )

    record_validation = validate_record(
        fields
    )

    cross_validation = validate_cross_system(
        fields
    )

    # --------------------------------------------------
    # Individual scores
    # --------------------------------------------------

    field_score = field_validation["score"]

    record_score = (
        100
        if record_validation["status"] == "valid"
        else 50
    )

    cross_score = (
        100
        if cross_validation["status"] == "consistent"
        else 50
    )

    # --------------------------------------------------
    # Weighted overall score
    # --------------------------------------------------

    overall_score = (
        field_score * 0.5
        + record_score * 0.3
        + cross_score * 0.2
    )

    # --------------------------------------------------
    # Warning penalty
    # --------------------------------------------------

    warning_count = (
        field_validation.get(
            "warning_count",
            0,
        )
        + record_validation.get(
            "warning_count",
            0,
        )
    )

    warning_penalty = warning_count * 10

    overall_score = max(
        0,
        overall_score - warning_penalty,
    )

    # --------------------------------------------------
    # Human-review triggers
    # --------------------------------------------------

    has_field_warnings = (
        field_validation.get(
            "warning_count",
            0,
        ) > 0
    )

    has_record_warnings = (
        record_validation.get(
            "warning_count",
            0,
        ) > 0
    )

    requires_human_review = (
        has_field_warnings
        or has_record_warnings
        or record_validation["status"] != "valid"
        or cross_validation["status"] != "consistent"
    )

    # --------------------------------------------------
    # Determine final status
    # --------------------------------------------------

    if overall_score < 60:

        status = "rejected"

    elif requires_human_review:

        status = "review_required"

    elif overall_score >= 85:

        status = "approved"

    else:

        status = "review_required"

    # --------------------------------------------------
    # Final validation response
    # --------------------------------------------------

    return {
        "status": status,
        "overall_score": round(
            overall_score,
            2,
        ),
        "requires_human_review": (
            requires_human_review
        ),
        "field_validation": field_validation,
        "record_validation": record_validation,
        "cross_validation": cross_validation,
    }