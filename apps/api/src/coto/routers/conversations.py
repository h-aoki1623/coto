"""Conversation and turn endpoints."""

import json
import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from coto.dependencies import get_current_user, get_db
from coto.exceptions import ConversationStateError
from coto.models.user import User
from coto.schemas.conversation import (
    ConversationResponse,
    CreateConversationRequest,
)
from coto.schemas.correction import TurnCorrectionResponse
from coto.services.conversation import ConversationService
from coto.services.turn_orchestrator import TurnOrchestrator

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    body: CreateConversationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Start a new conversation session.

    Requires X-Device-Id header for user identification.
    """
    service = ConversationService(db)
    conversation = await service.start_conversation(
        user_id=user.id,
        topic=body.topic,
    )
    return ConversationResponse.model_validate(conversation)


@router.post("/{conversation_id}/turns")
async def submit_turn(
    conversation_id: uuid.UUID,
    audio: UploadFile,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EventSourceResponse:
    """Submit a user audio turn and receive SSE events.

    Accepts multipart audio file upload. Returns a streaming SSE response
    with events for: stt_result, ai_response_chunk, ai_response_done,
    correction_result, tts_audio_url, turn_complete.
    """
    # Verify conversation exists and is active
    service = ConversationService(db)
    conversation = await service.get_conversation(conversation_id)
    if conversation.status != "active":
        raise ConversationStateError(
            f"Cannot submit turn to conversation in '{conversation.status}' status. "
            "Only 'active' conversations accept new turns."
        )

    audio_data = await audio.read()
    orchestrator = TurnOrchestrator(db)

    async def event_generator():
        async for event in orchestrator.process_turn(
            conversation_id=conversation_id,
            user_id=user.id,
            audio_data=audio_data,
        ):
            yield {"event": event["event"], "data": json.dumps(event["data"])}

    return EventSourceResponse(event_generator())


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Retrieve a conversation by ID."""
    service = ConversationService(db)
    conversation = await service.get_conversation(conversation_id)
    return ConversationResponse.model_validate(conversation)


@router.get(
    "/{conversation_id}/feedback",
    response_model=list[TurnCorrectionResponse],
)
async def get_feedback(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TurnCorrectionResponse]:
    """Get all corrections/feedback for a completed conversation.

    Returns a list of turn-level corrections with individual items.
    """
    service = ConversationService(db)
    corrections = await service.get_feedback(conversation_id)
    return [TurnCorrectionResponse.model_validate(c) for c in corrections]


@router.post("/{conversation_id}/end", response_model=ConversationResponse)
async def end_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """End an active conversation and compute final metrics."""
    service = ConversationService(db)
    conversation = await service.end_conversation(conversation_id)
    return ConversationResponse.model_validate(conversation)


@router.post("/{conversation_id}/resume", response_model=ConversationResponse)
async def resume_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    """Resume a paused conversation."""
    service = ConversationService(db)
    conversation = await service.resume_conversation(conversation_id)
    return ConversationResponse.model_validate(conversation)
