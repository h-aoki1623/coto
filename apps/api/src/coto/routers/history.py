"""Conversation history endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from coto.dependencies import get_db, get_device_id
from coto.schemas.history import (
    BatchDeleteRequest,
    HistoryDetailResponse,
    HistoryListResponse,
)

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=HistoryListResponse)
async def list_history(
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Page size"),
) -> HistoryListResponse:
    """List conversation history for the current user.

    Supports pagination via offset and limit query parameters.
    """
    # TODO: resolve user from device_id
    # TODO: delegate to HistoryRepository.get_list_by_device_id
    raise NotImplementedError


@router.get("/{conversation_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> HistoryDetailResponse:
    """Get detailed conversation history with turns and corrections."""
    # TODO: resolve user from device_id
    # TODO: delegate to HistoryRepository.get_detail
    raise NotImplementedError


@router.delete("/{conversation_id}", status_code=204)
async def delete_history(
    conversation_id: uuid.UUID,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a single conversation from history."""
    # TODO: resolve user from device_id
    # TODO: delegate to HistoryRepository.delete
    # TODO: raise NotFoundError if nothing was deleted
    raise NotImplementedError


@router.post("/batch-delete", status_code=204)
async def batch_delete_history(
    body: BatchDeleteRequest,
    device_id: str = Depends(get_device_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete multiple conversations from history in a single request."""
    # TODO: resolve user from device_id
    # TODO: delegate to HistoryRepository.batch_delete
    raise NotImplementedError
