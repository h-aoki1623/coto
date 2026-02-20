"""Service layer for conversation lifecycle management."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from coto.models.conversation import Conversation
from coto.repositories.conversation import ConversationRepository


class ConversationService:
    """Manages conversation lifecycle: start, end, resume, and retrieval."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ConversationRepository(session)

    async def start_conversation(
        self,
        *,
        user_id: uuid.UUID,
        topic: str,
        time_limit_seconds: int = 1800,
    ) -> Conversation:
        """Start a new conversation session.

        Validates the topic, creates the conversation record,
        and returns the newly created conversation.
        """
        # TODO: validate topic against allowed values
        # TODO: check if user already has an active conversation
        conversation = await self._repo.create(
            user_id=user_id,
            topic=topic,
            time_limit_seconds=time_limit_seconds,
        )
        await self._session.commit()
        return conversation

    async def end_conversation(
        self,
        conversation_id: uuid.UUID,
    ) -> Conversation:
        """End an active conversation and compute final metrics.

        Transitions status to 'completed', calculates duration,
        tallies corrections, and optionally computes a score.
        """
        # TODO: fetch conversation, validate it is active/paused
        # TODO: calculate duration_seconds from started_at to now
        # TODO: count total corrections across all turns
        # TODO: compute score (optional, LLM-based)
        # TODO: call repo.update_on_end(...)
        raise NotImplementedError

    async def get_conversation(
        self,
        conversation_id: uuid.UUID,
    ) -> Conversation:
        """Retrieve a conversation by ID.

        Raises NotFoundError if the conversation does not exist.
        """
        # TODO: fetch and return, raise NotFoundError on None
        raise NotImplementedError

    async def resume_conversation(
        self,
        conversation_id: uuid.UUID,
    ) -> Conversation:
        """Resume a paused conversation.

        Transitions status from 'paused' back to 'active'.
        Raises ConversationStateError if not in 'paused' status.
        """
        # TODO: fetch conversation, validate status == 'paused'
        # TODO: update status to 'active'
        raise NotImplementedError
