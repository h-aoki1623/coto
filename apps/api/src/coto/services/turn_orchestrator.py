"""Orchestrates the SSE turn pipeline: STT -> LLM -> Correction -> TTS.

The turn orchestrator is the core of the real-time conversation flow.
When the user submits audio, this service coordinates the following steps
as a streaming SSE response:

1. **STT** - Transcribe user audio via OpenAI Whisper
   -> SSE event: user_transcript

2. **LLM Reply (streaming)** - Generate AI conversational reply
   -> SSE events: ai_reply_chunk (streamed tokens), ai_reply_complete

3. **Correction (async)** - Analyze user text for grammar/expression errors
   -> SSE event: correction_result

4. **TTS** - Generate speech for the AI reply, upload to GCS
   -> SSE event: tts_audio_url

5. **Done**
   -> SSE event: turn_complete

Each step emits SSE events so the mobile client can update the UI
progressively without waiting for the entire pipeline to finish.
"""

import uuid
from collections.abc import AsyncIterator


class TurnOrchestrator:
    """Coordinates the multi-step turn processing pipeline."""

    async def process_turn(
        self,
        *,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        audio_data: bytes,
    ) -> AsyncIterator[str]:
        """Process a user turn and yield SSE events.

        Args:
            conversation_id: The conversation this turn belongs to.
            user_id: The user who submitted the turn.
            audio_data: Raw audio bytes from the client.

        Yields:
            SSE-formatted event strings.
        """
        # TODO: Step 1 - STT transcription
        # TODO: Step 2 - Save user turn to DB
        # TODO: Step 3 - Stream LLM reply (yield ai_reply_chunk events)
        # TODO: Step 4 - Save AI turn to DB
        # TODO: Step 5 - Run correction analysis (yield correction_result)
        # TODO: Step 6 - Generate TTS audio (yield tts_audio_url)
        # TODO: Step 7 - Yield turn_complete event
        raise NotImplementedError
        yield  # Make this an async generator  # noqa: E501
