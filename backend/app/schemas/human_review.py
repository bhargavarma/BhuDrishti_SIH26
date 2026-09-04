from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class HumanReviewRequest(BaseModel):
    status: str = Field(
        ...,
        description="Review status: pending, approved, or rejected.",
    )

    fields: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Edited land-record fields.",
    )

    reviewer: Optional[str] = Field(
        default=None,
        description="Name or identifier of the reviewer.",
    )

    comment: Optional[str] = Field(
        default=None,
        description="Optional reviewer comment.",
    )