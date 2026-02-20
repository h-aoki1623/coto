export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export type TurnEvent =
  | { type: 'stt_result'; data: { text: string } }
  | { type: 'ai_response_chunk'; data: { text: string } }
  | { type: 'ai_response_done'; data: { text: string } }
  | { type: 'tts_audio_url'; data: { url: string } }
  | { type: 'correction_result'; data: TurnCorrectionEventData }
  | { type: 'turn_complete'; data: Record<string, never> }
  | { type: 'error'; data: { code: string; message: string } };

export interface TurnCorrectionEventData {
  turnId: string;
  correctedText: string;
  explanation: string;
  items: Array<{
    original: string;
    corrected: string;
    originalSentence: string;
    correctedSentence: string;
    type: 'grammar' | 'expression' | 'vocabulary';
    explanation: string;
  }>;
}
