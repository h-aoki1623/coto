"""Repository for Conversation data access."""

import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from coto.models.conversation import Conversation


class ConversationRepository:
    """Encapsulates database operations for the Conversation model."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        topic: str,
        time_limit_seconds: int,
    ) -> Conversation:
        """Create a new conversation and flush to obtain its ID."""
        conversation = Conversation(
            user_id=user_id,
            topic=topic,
            time_limit_seconds=time_limit_seconds,
        )
        self._session.add(conversation)
        await self._session.flush()
        return conversation

    async def get_by_id(self, conversation_id: uuid.UUID) -> Conversation | None:
        """Fetch a conversation by its primary key."""
        raise NotImplementedError

    async def update_status(
        self,
        conversation_id: uuid.UUID,
        status: str,
    ) -> Conversation | None:
        """Transition a conversation to a new status."""
        raise NotImplementedError

    async def update_on_end(
        self,
        conversation_id: uuid.UUID,
        *,
        status: str,
        ended_at: datetime,
        duration_seconds: int,
        total_corrections: int,
        score: float | None,
    ) -> Conversation | None:
        """Finalize a conversation with end-of-session metrics."""
        raise NotImplementedError
