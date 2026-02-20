import { apiClient } from './client';
import type { TurnEvent } from '@/types/api';

// Parse a single SSE line into its field type and value
function parseSSELine(line: string): { event?: string; data?: string } {
  if (line.startsWith('event: ')) return { event: line.slice(7) };
  if (line.startsWith('data: ')) return { data: line.slice(6) };
  return {};
}

/**
 * Stream turn events from the backend SSE endpoint.
 * Sends user audio as FormData and yields parsed TurnEvent objects
 * as they arrive over the SSE stream.
 */
export async function* streamTurnEvents(
  conversationId: string,
  audioData: Blob,
): AsyncGenerator<TurnEvent> {
  const formData = new FormData();
  formData.append('audio', audioData);

  const response = await apiClient.postStream(
    `/api/conversations/${conversationId}/turns`,
    formData,
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    yield {
      type: 'error',
      data: body?.error ?? { code: 'STREAM_ERROR', message: 'Failed to start stream' },
    };
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last incomplete line in the buffer
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        // Empty line signals end of an SSE event block
        currentEvent = '';
        continue;
      }

      const parsed = parseSSELine(trimmed);
      if (parsed.event) {
        currentEvent = parsed.event;
      }
      if (parsed.data && currentEvent) {
        try {
          const data = JSON.parse(parsed.data);
          yield { type: currentEvent, data } as TurnEvent;
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }
}
