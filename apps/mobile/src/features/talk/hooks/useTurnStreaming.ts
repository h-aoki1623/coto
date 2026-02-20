import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { streamTurnEvents } from '@/api/sse-client';
import { useConversationStore } from '@/stores/conversation-store';
import { useAudioStore } from '@/stores/audio-store';
import type { Turn, TurnCorrection, CorrectionItem } from '@/types/conversation';
import type { TurnEvent, TurnCorrectionEventData } from '@/types/api';
import { buildAudioFormData } from './useAudioRecording';

interface UseTurnStreamingReturn {
  typingText: string;
  isStreaming: boolean;
  processTurn: (audioUri: string) => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function mapCorrectionData(
  turnId: string,
  data: TurnCorrectionEventData,
): TurnCorrection {
  const items: CorrectionItem[] = data.items.map((item) => ({
    id: generateId(),
    original: item.original,
    corrected: item.corrected,
    originalSentence: item.originalSentence,
    correctedSentence: item.correctedSentence,
    type: item.type,
    explanation: item.explanation,
  }));

  return {
    id: generateId(),
    turnId,
    correctedText: data.correctedText,
    explanation: data.explanation,
    items,
  };
}

/**
 * Hook for processing a conversation turn via SSE streaming.
 * Sends audio, processes streamed events, and updates stores.
 */
export function useTurnStreaming(conversationId: string): UseTurnStreamingReturn {
  const [typingText, setTypingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const addTurn = useConversationStore((s) => s.addTurn);
  const updateCorrection = useConversationStore((s) => s.updateCorrection);
  const setRecordingStatus = useAudioStore((s) => s.setRecordingStatus);
  const setPlaybackStatus = useAudioStore((s) => s.setPlaybackStatus);

  const playAudio = useCallback(
    async (url: string) => {
      try {
        // Unload previous sound if any
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        setPlaybackStatus('loading');
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        setPlaybackStatus('playing');

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaybackStatus('idle');
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      } catch {
        setPlaybackStatus('idle');
      }
    },
    [setPlaybackStatus],
  );

  const processEvent = useCallback(
    (event: TurnEvent, turnIdRef: { current: string | null }) => {
      switch (event.type) {
        case 'stt_result': {
          const userTurn: Turn = {
            id: generateId(),
            conversationId,
            role: 'user',
            text: event.data.text,
            audioUrl: null,
            sequence: Date.now(),
            correctionStatus: 'pending',
            createdAt: new Date().toISOString(),
          };
          turnIdRef.current = userTurn.id;
          addTurn(userTurn);
          break;
        }
        case 'ai_response_chunk': {
          setTypingText((prev) => prev + event.data.text);
          break;
        }
        case 'ai_response_done': {
          const aiTurn: Turn = {
            id: generateId(),
            conversationId,
            role: 'ai',
            text: event.data.text,
            audioUrl: null,
            sequence: Date.now(),
            correctionStatus: 'none',
            createdAt: new Date().toISOString(),
          };
          addTurn(aiTurn);
          setTypingText('');
          break;
        }
        case 'tts_audio_url': {
          playAudio(event.data.url);
          break;
        }
        case 'correction_result': {
          if (turnIdRef.current) {
            const correction = mapCorrectionData(turnIdRef.current, event.data);
            updateCorrection(turnIdRef.current, correction);
          }
          break;
        }
        case 'turn_complete': {
          setRecordingStatus('idle');
          break;
        }
        case 'error': {
          Alert.alert('Error', event.data.message);
          setRecordingStatus('idle');
          break;
        }
      }
    },
    [conversationId, addTurn, updateCorrection, setRecordingStatus, playAudio],
  );

  const processTurn = useCallback(
    async (audioUri: string) => {
      setIsStreaming(true);
      setTypingText('');

      const turnIdRef = { current: null as string | null };
      const formData = buildAudioFormData(audioUri);

      try {
        for await (const event of streamTurnEvents(conversationId, formData as unknown as Blob)) {
          processEvent(event, turnIdRef);
        }
      } catch {
        Alert.alert(
          'Streaming Error',
          'Lost connection during the conversation. Please try speaking again.',
        );
        setRecordingStatus('idle');
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, processEvent, setRecordingStatus],
  );

  return { typingText, isStreaming, processTurn };
}
