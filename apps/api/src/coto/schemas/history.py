"""Schemas for conversation history endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from coto.schemas.conversation import ConversationResponse
from coto.schemas.correction import TurnCorrectionResponse
from coto.schemas.turn import TurnResponse


class HistoryListItem(BaseModel):
    """Summary item for the conversation history list."""

    id: uuid.UUID
    topic: str
    status: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    total_corrections: int

    model_config = ConfigDict(from_attributes=True)


class HistoryListResponse(BaseModel):
    """Paginated list of conversation history items."""

    items: list[HistoryListItem]
    total: int


class TurnWithCorrection(TurnResponse):
    """Turn response extended with optional correction data."""

    correction: TurnCorrectionResponse | None = None


class HistoryDetailResponse(ConversationResponse):
    """Detailed conversation history with turns and corrections."""

    turns: list[TurnWithCorrection] = Field(default_factory=list)


class BatchDeleteRequest(BaseModel):
    """Request body for batch-deleting conversations."""

    ids: list[uuid.UUID] = Field(..., min_length=1, max_length=100)
