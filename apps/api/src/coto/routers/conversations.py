"""Conversation and turn endpoints."""

import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from coto.dependencies import get_db, get_device_id
from coto.schemas.conversation import (
    ConversationResponse,
    CreateConversationRequest,
)
from coto.schemas.correction import TurnCorrectionResponse

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    body: CreateConversationRequest,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Start a new conversation session.

    Requires X-Device-Id header for user identification.
    """
    # TODO: resolve or create user from device_id
    # TODO: delegate to ConversationService.start_conversation
    raise NotImplementedError


@router.post("/{conversation_id}/turns")
async def submit_turn(
    conversation_id: uuid.UUID,
    audio: UploadFile,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> EventSourceResponse:
    """Submit a user audio turn and receive SSE events.

    Accepts multipart audio file upload. Returns a streaming SSE response
    with events for: user_transcript, ai_reply_chunk, ai_reply_complete,
    correction_result, tts_audio_url, turn_complete.
    """
    # TODO: read audio bytes from upload
    # TODO: delegate to TurnOrchestrator.process_turn
    # TODO: return EventSourceResponse wrapping the async generator
    raise NotImplementedError


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Retrieve a conversation by ID."""
    # TODO: delegate to ConversationService.get_conversation
    raise NotImplementedError


@router.get("/{conversation_id}/feedback", response_model=list[TurnCorrectionResponse])
async def get_feedback(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> list[TurnCorrectionResponse]:
    """Get all corrections/feedback for a completed conversation.

    Returns a list of turn-level corrections with individual items.
    """
    # TODO: fetch all turns with corrections for this conversation
    # TODO: build and return TurnCorrectionResponse list
    raise NotImplementedError


@router.post("/{conversation_id}/end", response_model=ConversationResponse)
async def end_conversation(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """End an active conversation and compute final metrics."""
    # TODO: delegate to ConversationService.end_conversation
    raise NotImplementedError


@router.post("/{conversation_id}/resume", response_model=ConversationResponse)
async def resume_conversation(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Resume a paused conversation."""
    # TODO: delegate to ConversationService.resume_conversation
    raise NotImplementedError
