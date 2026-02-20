"""Schemas for correction data in API responses."""

import uuid

from pydantic import BaseModel, ConfigDict


class CorrectionItemResponse(BaseModel):
    """Response schema for a single correction item."""

    id: uuid.UUID
    original: str
    corrected: str
    original_sentence: str
    corrected_sentence: str
    type: str
    explanation: str

    model_config = ConfigDict(from_attributes=True)


class TurnCorrectionResponse(BaseModel):
    """Response schema for a turn-level correction with all items."""

    id: uuid.UUID
    turn_id: uuid.UUID
    corrected_text: str
    explanation: str
    items: list[CorrectionItemResponse]

    model_config = ConfigDict(from_attributes=True)
