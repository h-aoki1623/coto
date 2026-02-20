"""Service for analyzing user text and generating corrections."""

import uuid

from coto.schemas.correction import TurnCorrectionResponse


class CorrectionService:
    """Analyzes user turns for grammar, expression, and vocabulary errors.

    Uses the LLM with structured output to identify corrections
    and generate explanations in the user's preferred language.
    """

    async def analyze_turn(
        self,
        *,
        turn_id: uuid.UUID,
        user_id: uuid.UUID,
        user_text: str,
        correction_language: str = "ja",
    ) -> TurnCorrectionResponse | None:
        """Analyze a user turn for corrections.

        Returns a TurnCorrectionResponse if corrections are found,
        or None if the text is grammatically correct.
        """
        # TODO: Build prompt with user text and correction language
        # TODO: Call LLM with structured output (response_model)
        # TODO: If no corrections, mark turn as 'clean' and return None
        # TODO: Save TurnCorrection + CorrectionItems to DB
        # TODO: Update turn correction_status to 'has_corrections'
        # TODO: Return TurnCorrectionResponse
        raise NotImplementedError
