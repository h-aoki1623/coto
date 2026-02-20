"""Speech-to-text service using OpenAI Whisper API."""

import structlog
from openai import AsyncOpenAI

from coto.config import get_settings
from coto.exceptions import ExternalServiceError, STTRecognitionError

logger = structlog.get_logger()


class STTService:
    """Transcribes audio to text using OpenAI Whisper.

    Accepts raw audio bytes and returns the transcribed text.
    Raises STTRecognitionError if no speech is detected,
    or ExternalServiceError on API failures.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def transcribe(
        self,
        audio_data: bytes,
        filename: str = "audio.webm",
    ) -> str:
        """Transcribe audio bytes using OpenAI Whisper.

        Args:
            audio_data: Raw audio bytes from the client.
            filename: Filename hint for the audio format.

        Returns:
            The transcribed text, stripped of leading/trailing whitespace.

        Raises:
            STTRecognitionError: If the transcription result is empty.
            ExternalServiceError: If the Whisper API call fails.
        """
        logger.info("stt_transcribe_start", audio_bytes=len(audio_data))

        try:
            transcription = await self._client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, audio_data, "audio/webm"),
            )
        except Exception as exc:
            logger.error("stt_transcribe_failed", error=str(exc))
            raise ExternalServiceError("STT", str(exc)) from exc

        text = transcription.text.strip()
        if not text:
            logger.warning("stt_empty_result")
            raise STTRecognitionError()

        logger.info("stt_transcribe_done", text_length=len(text))
        return text
