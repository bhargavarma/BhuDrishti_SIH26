from pathlib import Path
from uuid import uuid4
import logging
import json

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .core.database import RUNTIME_ROOT, SessionLocal
from .models.land_record import LandRecord

from .services.preprocessing.processor import preprocess_document
from .services.ocr.ocr_engine import extract_text_from_pages
from .services.extraction.field_extractor import (
    extract_land_record_fields,
)
from .services.validation.validator import validate_land_record

from .services.validation.human_review import (
    create_review_record,
    load_review_record,
    update_review_record,
)

from .schemas.human_review import HumanReviewRequest


# ==================================================
# FastAPI Application
# ==================================================

app = FastAPI(
    title="IntelliLand AI",
    description="AI-powered land record digitization and validation system",
    version="1.0.0",
)

logger = logging.getLogger("intelliland")
# ==================================================
# CORS Configuration
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# Paths
# ==================================================

UPLOAD_DIR = RUNTIME_ROOT / "uploads"
PROCESSED_DIR = RUNTIME_ROOT / "processed"


def demo_gis_data(document_id: str, latitude: float | None = None, longitude: float | None = None, parcel_geojson: str | None = None) -> dict:
    if latitude is None or longitude is None:
        numeric_seed = sum((index + 1) * ord(character) for index, character in enumerate(document_id))
        latitude = 17.35 + (numeric_seed % 500) / 10000
        longitude = 78.42 + ((numeric_seed // 7) % 500) / 10000
        demo = True
    else:
        demo = False
    if parcel_geojson:
        geometry = json.loads(parcel_geojson)
    else:
        offset = 0.0012
        geometry = {"type": "Polygon", "coordinates": [[[longitude - offset, latitude - offset], [longitude + offset, latitude - offset], [longitude + offset, latitude + offset], [longitude - offset, latitude + offset], [longitude - offset, latitude - offset]]]}
    return {"latitude": latitude, "longitude": longitude, "parcel_geojson": geometry, "is_demo_location": demo}


# ==================================================
# Allowed document formats
# ==================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".tiff",
    ".tif",
}


# ==================================================
# Basic Routes
# ==================================================


@app.get("/")
def root():
    return {
        "message": "IntelliLand AI backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "IntelliLand AI API",
    }


# ==================================================
# Document Upload API
# ==================================================


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
):
    """
    Upload a land record document.

    Supported formats:
    PDF, JPG, JPEG, PNG, TIFF, TIF
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    original_filename = file.filename

    file_extension = Path(
        original_filename
    ).suffix.lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file format: {file_extension}. "
                f"Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    document_id = str(uuid4())

    saved_filename = (
        f"{document_id}{file_extension}"
    )

    upload_path = (
        UPLOAD_DIR / saved_filename
    )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    logger.info(
        "[UPLOAD] document_id=%s input_path=%s",
        document_id,
        upload_path,
    )

    try:
        file_content = await file.read()

        upload_path.write_bytes(
            file_content
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {str(error)}",
        )

    return {
        "success": True,
        "message": "Document uploaded successfully.",
        "document_id": document_id,
        "filename": original_filename,
        "file_path": str(upload_path),
    }


# ==================================================
# Document Preprocessing API
# ==================================================


@app.post("/api/documents/{document_id}/preprocess")
def preprocess_document_api(
    document_id: str,
):
    """
    Preprocess an uploaded land record document.

    Performs:
    - PDF to image conversion
    - grayscale conversion
    - denoising
    - adaptive thresholding
    - deskewing
    """

    matching_files = list(
        UPLOAD_DIR.glob(
            f"{document_id}.*"
        )
    )

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail="Uploaded document not found.",
        )

    input_path = matching_files[0]
    output_dir = PROCESSED_DIR / document_id

    logger.info(
        "[PREPROCESS] document_id=%s input_path=%s input_exists=%s output_dir=%s",
        document_id,
        input_path,
        input_path.is_file(),
        output_dir,
    )

    existing_pages = sorted(output_dir.glob("processed_page_*.png"))
    if existing_pages:
        logger.info(
            "[PREPROCESS] document_id=%s reused processed_files=%s",
            document_id,
            existing_pages,
        )
        return {
            "success": True,
            "message": "Document preprocessing was already completed.",
            "document_id": document_id,
            "processed_pages": [str(page) for page in existing_pages],
        }

    try:
        processed_pages = preprocess_document(
            file_path=input_path,
            output_dir=output_dir,
        )

        processed_pages = [
            page for page in processed_pages if page.is_file()
        ]
        logger.info(
            "[PREPROCESS] document_id=%s output_exists=%s processed_files=%s",
            document_id,
            output_dir.is_dir(),
            processed_pages,
        )
        if not processed_pages:
            raise RuntimeError("Preprocessing produced no page files.")

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Document preprocessing failed: {str(error)}"
            ),
        )

    return {
        "success": True,
        "message": "Document preprocessing completed successfully.",
        "document_id": document_id,
        "processed_pages": [
            str(page)
            for page in processed_pages
        ],
    }


# ==================================================
# OCR API
# ==================================================


@app.post("/api/documents/{document_id}/ocr")
def run_document_ocr(
    document_id: str,
):
    """
    Run OCR on processed document pages.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    processed_files = sorted(
        document_output_dir.glob(
            "processed_page_*.png"
        )
    )

    logger.info(
        "[OCR] document_id=%s processed_dir=%s output_exists=%s processed_files=%s count=%d",
        document_id,
        document_output_dir,
        document_output_dir.is_dir(),
        processed_files,
        len(processed_files),
    )

    if not processed_files:
        raise HTTPException(
            status_code=404,
            detail="No processed pages found.",
        )

    try:
        ocr_results = extract_text_from_pages(
            image_paths=processed_files,
            language="eng",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {str(error)}",
        )

    return {
        "success": True,
        "message": "OCR completed successfully.",
        "document_id": document_id,
        "pages": ocr_results,
    }


# ==================================================
# AI Extraction + Validation API
# ==================================================


@app.post("/api/documents/{document_id}/extract")
def extract_document_fields(
    document_id: str,
):
    """
    Run OCR and extract structured land-record fields.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    processed_files = sorted(
        document_output_dir.glob(
            "processed_page_*.png"
        )
    )

    if not processed_files:
        raise HTTPException(
            status_code=404,
            detail="No processed pages found.",
        )

    # ----------------------------------------------
    # OCR
    # ----------------------------------------------

    try:
        ocr_results = extract_text_from_pages(
            image_paths=processed_files,
            language="eng",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {str(error)}",
        )

    # ----------------------------------------------
    # Combine OCR text
    # ----------------------------------------------

    combined_text = "\n".join(
        result["text"]
        for result in ocr_results
    )

    # ----------------------------------------------
    # AI / Rule-based field extraction
    # ----------------------------------------------

    fields = extract_land_record_fields(
        combined_text
    )

    # ----------------------------------------------
    # Multi-tier validation
    # ----------------------------------------------

    validation = validate_land_record(
        fields
    )

    # ----------------------------------------------
    # Response
    # ----------------------------------------------

    return {
        "success": True,
        "message": (
            "Land record extraction completed successfully."
        ),
        "document_id": document_id,
        "fields": fields,
        "validation": validation,
        "ocr_confidence": [
            {
                "page_number": result["page_number"],
                "confidence": result["confidence"],
            }
            for result in ocr_results
        ],
    }


# ==================================================
# Validation API
# ==================================================


@app.post("/api/documents/{document_id}/validate")
def validate_document(
    document_id: str,
):
    """
    Run multi-tier validation on extracted land-record fields.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    processed_files = sorted(
        document_output_dir.glob(
            "processed_page_*.png"
        )
    )

    if not processed_files:
        raise HTTPException(
            status_code=404,
            detail="No processed pages found.",
        )

    # ----------------------------------------------
    # OCR
    # ----------------------------------------------

    try:
        ocr_results = extract_text_from_pages(
            image_paths=processed_files,
            language="eng",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR failed during validation: {str(error)}",
        )

    # ----------------------------------------------
    # Combine OCR text
    # ----------------------------------------------

    combined_text = "\n".join(
        result["text"]
        for result in ocr_results
    )

    # ----------------------------------------------
    # AI / Rule-based field extraction
    # ----------------------------------------------

    fields = extract_land_record_fields(
        combined_text
    )

    # ----------------------------------------------
    # Multi-tier validation
    # ----------------------------------------------

    validation = validate_land_record(
        fields
    )

    # ----------------------------------------------
    # Response
    # ----------------------------------------------

    return {
        "success": True,
        "message": (
            "Land record validation completed successfully."
        ),
        "document_id": document_id,
        "language": "eng",
        "fields": fields,
        "validation": validation,
        "ocr_confidence": [
            {
                "page_number": result["page_number"],
                "confidence": result["confidence"],
            }
            for result in ocr_results
        ],
    }


# ==================================================
# Human Verification API
# ==================================================


@app.get("/api/documents/{document_id}/review")
def get_document_review(
    document_id: str,
):
    """
    Retrieve the human verification record for a document.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    review = load_review_record(
        document_output_dir
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Human review record not found. "
                "Create the review first."
            ),
        )

    return {
        "success": True,
        "message": (
            "Human review record retrieved successfully."
        ),
        "review": review,
    }


@app.post("/api/documents/{document_id}/review")
def create_document_review(
    document_id: str,
):
    """
    Create a human verification record from the latest
    OCR, extraction, and validation results.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    processed_files = sorted(
        document_output_dir.glob(
            "processed_page_*.png"
        )
    )

    if not processed_files:
        raise HTTPException(
            status_code=404,
            detail="No processed pages found.",
        )

    # ----------------------------------------------
    # OCR
    # ----------------------------------------------

    try:
        ocr_results = extract_text_from_pages(
            image_paths=processed_files,
            language="eng",
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"OCR failed during review creation: {str(error)}"
            ),
        )

    # ----------------------------------------------
    # Combine OCR text
    # ----------------------------------------------

    combined_text = "\n".join(
        result["text"]
        for result in ocr_results
    )

    # ----------------------------------------------
    # Extract fields
    # ----------------------------------------------

    fields = extract_land_record_fields(
        combined_text
    )

    # ----------------------------------------------
    # Validate fields
    # ----------------------------------------------

    validation = validate_land_record(
        fields
    )

    # ----------------------------------------------
    # Create human review record
    # ----------------------------------------------

    review = create_review_record(
        document_output_dir=document_output_dir,
        document_id=document_id,
        fields=fields,
        validation=validation,
    )

    return {
        "success": True,
        "message": (
            "Human review record created successfully."
        ),
        "review": review,
    }


@app.put("/api/documents/{document_id}/review")
def update_document_review(
    document_id: str,
    request: HumanReviewRequest,
):
    """
    Update a human verification decision.

    Supported statuses:
    - pending
    - approved
    - rejected

    The reviewer can also edit extracted fields.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    try:
        review = update_review_record(
            document_output_dir=document_output_dir,
            status=request.status,
            fields=request.fields,
            reviewer=request.reviewer,
            comment=request.comment,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Human review record not found. "
                "Create the review first."
            ),
        )

    # ==================================================
    # Persist approved record to database
    # ==================================================

    if review.get("status") == "approved":

        fields = review.get(
            "fields",
            {},
        )

        validation = review.get(
            "validation",
            {},
        )

        db: Session = SessionLocal()

        try:

            # ------------------------------------------
            # Find existing record
            # ------------------------------------------

            existing_record = (
                db.query(LandRecord)
                .filter(
                    LandRecord.document_id == document_id
                )
                .first()
            )

            # ------------------------------------------
            # Create record if it does not exist
            # ------------------------------------------

            if existing_record is None:

                existing_record = LandRecord(
                    document_id=document_id,
                )

                db.add(existing_record)

            # ------------------------------------------
            # Owner information
            # ------------------------------------------

            existing_record.owner_name = fields.get(
                "owner_name"
            )

            existing_record.father_name = fields.get(
                "father_name"
            )

            # ------------------------------------------
            # Location information
            # ------------------------------------------

            existing_record.district = fields.get(
                "district"
            )

            existing_record.mandal = fields.get(
                "mandal"
            )

            existing_record.village = fields.get(
                "village"
            )

            # ------------------------------------------
            # Land information
            # ------------------------------------------

            existing_record.survey_number = fields.get(
                "survey_number"
            )

            existing_record.khata_number = fields.get(
                "khata_number"
            )

            existing_record.record_number = fields.get(
                "record_number"
            )

            existing_record.land_area = fields.get(
                "land_area"
            )

            existing_record.land_type = fields.get(
                "land_type"
            )

            # ------------------------------------------
            # Validation information
            # ------------------------------------------

            existing_record.validation_score = (
                validation.get("overall_score")
            )

            existing_record.validation_status = (
                validation.get("status")
            )

            # ------------------------------------------
            # Human verification information
            # ------------------------------------------

            existing_record.review_status = (
                review.get("status")
            )

            existing_record.reviewer = (
                review.get("reviewer")
            )

            existing_record.reviewer_comment = (
                review.get("reviewer_comment")
            )

            gis = demo_gis_data(
                document_id,
                existing_record.latitude,
                existing_record.longitude,
                existing_record.parcel_geojson,
            )
            existing_record.latitude = gis["latitude"]
            existing_record.longitude = gis["longitude"]
            existing_record.parcel_geojson = json.dumps(gis["parcel_geojson"])

            # ------------------------------------------
            # Save to database
            # ------------------------------------------

            db.commit()

            db.refresh(
                existing_record
            )

        except Exception as error:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to save approved record "
                    f"to database: {str(error)}"
                ),
            )

        finally:

            db.close()

    return {
        "success": True,
        "message": (
            "Human review decision updated successfully."
        ),
        "review": review,
    }


# ==================================================
# Approved Digital Record API
# ==================================================


@app.get("/api/documents/{document_id}/record")
def get_approved_digital_record(
    document_id: str,
):
    """
    Return the final approved digital land record.

    The record can only be returned after human verification
    has been completed and the review status is approved.
    """

    document_output_dir = (
        PROCESSED_DIR / document_id
    )

    if not document_output_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed document not found.",
        )

    # ----------------------------------------------
    # Load human review
    # ----------------------------------------------

    review = load_review_record(
        document_output_dir
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Human review record not found. "
                "Create and complete human verification first."
            ),
        )

    # ----------------------------------------------
    # Check approval
    # ----------------------------------------------

    if review.get("status") != "approved":
        raise HTTPException(
            status_code=409,
            detail=(
                "Digital record is not approved yet. "
                "Complete human verification before "
                "retrieving the approved record."
            ),
        )

    # ----------------------------------------------
    # Get verified fields
    # ----------------------------------------------

    fields = review.get(
        "fields",
        {},
    )

    validation = review.get(
        "validation",
        {},
    )

    # ----------------------------------------------
    # Build standardized digital record
    # ----------------------------------------------

    digital_record = {
        "owner": {
            "name": fields.get(
                "owner_name"
            ),
            "father_name": fields.get(
                "father_name"
            ),
        },
        "location": {
            "district": fields.get(
                "district"
            ),
            "mandal": fields.get(
                "mandal"
            ),
            "village": fields.get(
                "village"
            ),
        },
        "land": {
            "survey_number": fields.get(
                "survey_number"
            ),
            "khata_number": fields.get(
                "khata_number"
            ),
            "record_number": fields.get(
                "record_number"
            ),
            "area": fields.get(
                "land_area"
            ),
            "type": fields.get(
                "land_type"
            ),
        },
    }

    # ----------------------------------------------
    # Return approved record
    # ----------------------------------------------

    return {
        "success": True,
        "message": (
            "Approved digital land record retrieved successfully."
        ),
        "document_id": document_id,
        "record_status": "approved",
        "record": digital_record,
        "verification": {
            "status": review.get(
                "status"
            ),
            "score": validation.get(
                "overall_score"
            ),
            "reviewer": review.get(
                "reviewer"
            ),
            "reviewer_comment": review.get(
                "reviewer_comment"
            ),
            "verified_at": review.get(
                "updated_at"
            ),
        },
    }
# ==================================================
# Database Records API
# ==================================================


@app.get("/api/gis/records")
def get_gis_records():
    db: Session = SessionLocal()
    try:
        records = db.query(LandRecord).filter(LandRecord.review_status == "approved").all()
        return {
            "success": True,
            "count": len(records),
            "records": [
                {
                    "record_id": record.id,
                    "document_id": record.document_id,
                    "owner": record.owner_name,
                    "father_name": record.father_name,
                    "survey_number": record.survey_number,
                    "khata_number": record.khata_number,
                    "record_number": record.record_number,
                    "village": record.village,
                    "mandal": record.mandal,
                    "district": record.district,
                    "land_area": record.land_area,
                    "land_type": record.land_type,
                    "latitude": (gis := demo_gis_data(record.document_id, record.latitude, record.longitude, record.parcel_geojson))["latitude"],
                    "longitude": gis["longitude"],
                    "parcel_geojson": gis["parcel_geojson"],
                    "is_demo_location": gis["is_demo_location"],
                    "status": record.review_status,
                    "validation_score": record.validation_score,
                }
                for record in records
            ],
        }
    finally:
        db.close()


@app.get("/api/records")
def get_all_records():
    """
    Retrieve all approved land records from the database.
    """

    db: Session = SessionLocal()

    try:
        records = (
            db.query(LandRecord)
            .filter(
                LandRecord.review_status == "approved"
            )
            .order_by(
                LandRecord.created_at.desc()
            )
            .all()
        )

        return {
            "success": True,
            "count": len(records),
            "records": [
                {
                    "id": record.id,
                    "document_id": record.document_id,
                    "owner": {
                        "name": record.owner_name,
                        "father_name": record.father_name,
                    },
                    "location": {
                        "district": record.district,
                        "mandal": record.mandal,
                        "village": record.village,
                    },
                    "land": {
                        "survey_number": record.survey_number,
                        "khata_number": record.khata_number,
                        "record_number": record.record_number,
                        "area": record.land_area,
                        "type": record.land_type,
                    },
                    "verification": {
                        "status": record.review_status,
                        "score": record.validation_score,
                        "validation_status": record.validation_status,
                        "reviewer": record.reviewer,
                    },
                    "created_at": record.created_at,
                    "updated_at": record.updated_at,
                }
                for record in records
            ],
        }

    finally:
        db.close()


@app.get("/api/records/{record_id}")
def get_record_by_id(record_id: str):
    """
    Retrieve one approved land record by database ID.
    """

    db: Session = SessionLocal()

    try:
        record = (
            db.query(LandRecord)
            .filter(
                LandRecord.id == record_id,
                LandRecord.review_status == "approved",
            )
            .first()
        )

        if record is None:
            raise HTTPException(
                status_code=404,
                detail="Approved land record not found.",
            )

        return {
            "success": True,
            "record": {
                "id": record.id,
                "document_id": record.document_id,
                "owner": {
                    "name": record.owner_name,
                    "father_name": record.father_name,
                },
                "location": {
                    "district": record.district,
                    "mandal": record.mandal,
                    "village": record.village,
                },
                "land": {
                    "survey_number": record.survey_number,
                    "khata_number": record.khata_number,
                    "record_number": record.record_number,
                    "area": record.land_area,
                    "type": record.land_type,
                },
                "verification": {
                    "status": record.review_status,
                    "score": record.validation_score,
                    "validation_status": record.validation_status,
                    "reviewer": record.reviewer,
                    "reviewer_comment": record.reviewer_comment,
                },
                "created_at": record.created_at,
                "updated_at": record.updated_at,
            },
        }

    finally:
        db.close()
        # ==================================================
# Integration Export API
# ==================================================


@app.get("/api/documents/{document_id}/export")
def export_approved_record(
    document_id: str,
):
    """
    Export an approved land record in a standardized,
    integration-ready JSON format.

    This endpoint only exports records that have been
    approved through human verification.
    """

    db: Session = SessionLocal()

    try:
        # ----------------------------------------------
        # Find approved record
        # ----------------------------------------------

        record = (
            db.query(LandRecord)
            .filter(
                LandRecord.document_id == document_id,
                LandRecord.review_status == "approved",
            )
            .first()
        )

        # ----------------------------------------------
        # Record not found
        # ----------------------------------------------

        if record is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Approved land record not found "
                    "for this document."
                ),
            )

        # ----------------------------------------------
        # Integration-ready record
        # ----------------------------------------------

        return {
            "success": True,
            "schema_version": "1.0",
            "source": "IntelliLand AI",
            "record_status": "approved",

            "record": {
                "record_id": record.id,
                "document_id": record.document_id,

                "owner": {
                    "name": record.owner_name,
                    "father_name": record.father_name,
                },

                "location": {
                    "district": record.district,
                    "mandal": record.mandal,
                    "village": record.village,
                },

                "land": {
                    "survey_number": record.survey_number,
                    "khata_number": record.khata_number,
                    "record_number": record.record_number,
                    "area": record.land_area,
                    "type": record.land_type,
                },
            },

            "validation": {
                "status": record.validation_status,
                "score": record.validation_score,
            },

            "human_verification": {
                "status": record.review_status,
                "reviewer": record.reviewer,
                "comment": record.reviewer_comment,
            },

            "audit": {
                "created_at": record.created_at,
                "updated_at": record.updated_at,
            },
        }

    finally:
        db.close()