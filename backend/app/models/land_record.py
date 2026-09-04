from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class LandRecord(Base):
    __tablename__ = "land_records"

    # --------------------------------------------------
    # Primary identification
    # --------------------------------------------------

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    document_id: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        nullable=False,
        index=True,
    )

    # --------------------------------------------------
    # Owner information
    # --------------------------------------------------

    owner_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    father_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # --------------------------------------------------
    # Location information
    # --------------------------------------------------

    district: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    mandal: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    village: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # --------------------------------------------------
    # Land information
    # --------------------------------------------------

    survey_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    khata_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    record_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    land_area: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    land_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    parcel_geojson: Mapped[str | None] = mapped_column(Text, nullable=True)

    # --------------------------------------------------
    # Validation information
    # --------------------------------------------------

    validation_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    validation_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # --------------------------------------------------
    # Human verification
    # --------------------------------------------------

    review_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    reviewer: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    reviewer_comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # --------------------------------------------------
    # Audit timestamps
    # --------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )