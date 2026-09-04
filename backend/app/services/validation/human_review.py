import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from backend.app.services.validation.validator import (
    validate_land_record,
)


REVIEW_STATUSES = {"pending", "approved", "rejected"}


def get_review_file(document_output_dir: Path) -> Path:
    return document_output_dir / "human_review.json"


def create_review_record(
    document_output_dir: Path,
    document_id: str,
    fields: Dict[str, Any],
    validation: Dict[str, Any],
) -> Dict[str, Any]:

    review_file = get_review_file(document_output_dir)

    existing_review: Optional[Dict[str, Any]] = None

    if review_file.exists():
        try:
            existing_review = json.loads(
                review_file.read_text(
                    encoding="utf-8"
                )
            )
        except (json.JSONDecodeError, OSError):
            existing_review = None

    if existing_review:
        return existing_review

    now = datetime.now(
        timezone.utc
    ).isoformat()

    review_record = {
        "document_id": document_id,
        "status": "pending",
        "fields": fields,
        "validation": validation,
        "original_fields": dict(fields),
        "edited_fields": {},
        "reviewer": None,
        "reviewer_comment": None,
        "created_at": now,
        "updated_at": now,
    }

    review_file.write_text(
        json.dumps(
            review_record,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    return review_record


def load_review_record(
    document_output_dir: Path,
) -> Optional[Dict[str, Any]]:

    review_file = get_review_file(
        document_output_dir
    )

    if not review_file.exists():
        return None

    try:
        return json.loads(
            review_file.read_text(
                encoding="utf-8"
            )
        )
    except (json.JSONDecodeError, OSError):
        return None


def update_review_record(
    document_output_dir: Path,
    status: str,
    fields: Optional[Dict[str, Any]] = None,
    reviewer: Optional[str] = None,
    comment: Optional[str] = None,
) -> Optional[Dict[str, Any]]:

    if status not in REVIEW_STATUSES:
        raise ValueError(
            "Invalid review status. "
            "Use pending, approved, or rejected."
        )

    review = load_review_record(
        document_output_dir
    )

    if review is None:
        return None

    # --------------------------------------------------
    # Human-edited fields
    # --------------------------------------------------

    if fields is not None:

        original_fields = review.get(
            "original_fields",
            {}
        )

        edited_fields = {}

        for field_name, new_value in fields.items():

            original_value = (
                original_fields.get(
                    field_name
                )
            )

            if new_value != original_value:

                edited_fields[field_name] = {
                    "old_value": original_value,
                    "new_value": new_value,
                }

        # Save corrected fields
        review["fields"] = fields

        # Save audit trail
        review["edited_fields"] = (
            edited_fields
        )

        # --------------------------------------------------
        # IMPORTANT:
        # Re-run validation using the corrected fields.
        # --------------------------------------------------

        updated_validation = (
            validate_land_record(fields)
        )

        review["validation"] = (
            updated_validation
        )

    # --------------------------------------------------
    # Update review decision
    # --------------------------------------------------

    review["status"] = status

    if reviewer is not None:

        review["reviewer"] = reviewer

    if comment is not None:

        review["reviewer_comment"] = (
            comment
        )

    review["updated_at"] = datetime.now(
        timezone.utc
    ).isoformat()

    review_file = get_review_file(
        document_output_dir
    )

    review_file.write_text(
        json.dumps(
            review,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    return review