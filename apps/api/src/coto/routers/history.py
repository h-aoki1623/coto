"""Conversation history endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from coto.dependencies import get_current_user, get_db
from coto.exceptions import NotFoundError
from coto.models.user import User
from coto.repositories.history import HistoryRepository
from coto.schemas.history import (
    BatchDeleteRequest,
    HistoryDetailResponse,
    HistoryListItem,
    HistoryListResponse,
)

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=HistoryListResponse)
async def list_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Page size"),
) -> HistoryListResponse:
    """List conversation history for the current user.

    Supports pagination via offset and limit query parameters.
    """
    repo = HistoryRepository(db)
    items, total = await repo.get_list_by_device_id(user.id, offset=offset, limit=limit)
    return HistoryListResponse(
        items=[HistoryListItem.model_validate(c) for c in items],
        total=total,
    )


@router.get("/{conversation_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HistoryDetailResponse:
    """Get detailed conversation history with turns and corrections."""
    repo = HistoryRepository(db)
    conversation = await repo.get_detail(conversation_id, user.id)
    if conversation is None:
        raise NotFoundError("Conversation", str(conversation_id))
    return HistoryDetailResponse.model_validate(conversation)


@router.delete("/{conversation_id}", status_code=204)
async def delete_history(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a single conversation from history."""
    repo = HistoryRepository(db)
    deleted = await repo.delete(conversation_id, user.id)
    if not deleted:
        raise NotFoundError("Conversation", str(conversation_id))
    await db.commit()


@router.post("/batch-delete", status_code=204)
async def batch_delete_history(
    body: BatchDeleteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete multiple conversations from history in a single request."""
    repo = HistoryRepository(db)
    await repo.batch_delete(body.ids, user.id)
    await db.commit()
