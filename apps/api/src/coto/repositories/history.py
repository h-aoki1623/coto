"""Repository for conversation history queries."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from coto.models.conversation import Conversation


class HistoryRepository:
    """Encapsulates read-heavy queries for conversation history."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_list_by_device_id(
        self,
        user_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Conversation], int]:
        """Return a paginated list of conversations for a user.

        Returns:
            A tuple of (conversations, total_count).
        """
        raise NotImplementedError

    async def get_detail(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Conversation | None:
        """Fetch a conversation with eagerly loaded turns and corrections.

        Uses selectinload to prevent N+1 queries on turns and corrections.
        """
        raise NotImplementedError

    async def delete(
        self,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        """Delete a single conversation. Returns True if a row was deleted."""
        raise NotImplementedError

    async def batch_delete(
        self,
        conversation_ids: list[uuid.UUID],
        user_id: uuid.UUID,
    ) -> int:
        """Delete multiple conversations. Returns the count of deleted rows."""
        raise NotImplementedError
