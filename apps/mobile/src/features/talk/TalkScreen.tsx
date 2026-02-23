import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '@/api/client';
import { Colors } from '@/constants/colors';
import { useConversationStore } from '@/stores/conversation-store';
import { useAudioStore } from '@/stores/audio-store';
import type { RootStackParamList } from '@/navigation/types';
import type { Turn } from '@/types/conversation';
import { MessageBubble, TypingBubble } from './components/MessageBubble';
import { RecordButton } from './components/RecordButton';
import { RecordingControls } from './components/RecordingControls';
import { ErrorBanner } from './components/ErrorBanner';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useTurnStreaming } from './hooks/useTurnStreaming';

type Props = NativeStackScreenProps<RootStackParamList, 'Talk'>;

/**
 * Custom header for the Talk screen.
 * Shows CO logo on the left and red "end" button on the right.
 */
function TalkHeader({
  onEnd,
  isEnding,
}: {
  onEnd: () => void;
  isEnding: boolean;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerLogo}>
          <Text style={styles.headerLogoText}>CO</Text>
        </View>
        <Text style={styles.headerTitle}>Coto</Text>
      </View>
      <Pressable
        onPress={onEnd}
        disabled={isEnding}
        style={styles.endButton}
        testID="end-conversation"
        accessibilityRole="button"
        accessibilityLabel="End conversation"
        accessibilityHint="Ends the conversation and shows feedback"
      >
        {isEnding ? (
          <ActivityIndicator size="small" color={Colors.errorRed} />
        ) : (
          <Text style={styles.endButtonText}>終了する</Text>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Completion footer shown when conversation has ended.
 * Displays duration and a button to view feedback.
 */
function CompletionFooter({
  duration,
  onViewFeedback,
}: {
  duration: string;
  onViewFeedback: () => void;
}) {
  return (
    <View style={styles.completionContainer}>
      <Text style={styles.completionText}>トーク終了 · {duration}</Text>
      <View style={styles.completionButtonWrapper}>
        <Pressable
          style={({ pressed }) => [
            styles.feedbackButton,
            pressed && styles.feedbackButtonPressed,
          ]}
          onPress={onViewFeedback}
          testID="view-feedback"
          accessibilityRole="button"
          accessibilityLabel="View feedback"
        >
          <Text style={styles.feedbackButtonText}>フィードバックを見る</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TalkScreen({ navigation, route }: Props) {
  const { topic, conversationId } = route.params;
  const flatListRef = useRef<FlatList<Turn>>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conversationDuration, setConversationDuration] = useState('');
  const conversationStartTime = useRef(Date.now());

  const turns = useConversationStore((s) => s.turns);
  const corrections = useConversationStore((s) => s.corrections);
  const status = useConversationStore((s) => s.status);
  const setStatus = useConversationStore((s) => s.setStatus);
  const recordingStatus = useAudioStore((s) => s.recordingStatus);
  const setRecordingStatus = useAudioStore((s) => s.setRecordingStatus);

  const { startRecording, stopRecording } = useAudioRecording();

  const activeConversationId = conversationId ?? '';
  const { typingText, isStreaming, processTurn } = useTurnStreaming(activeConversationId);

  // Hide the default navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Scroll to bottom when new turns arrive
  useEffect(() => {
    if (turns.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [turns.length, typingText]);

  const formatDuration = useCallback((): string => {
    const elapsed = Math.floor((Date.now() - conversationStartTime.current) / 1000);
    const mins = Math.floor(elapsed / 60);
    if (mins === 0) return '1分未満';
    return `${mins}分間`;
  }, []);

  const handleEndConversation = useCallback(() => {
    if (!activeConversationId) return;

    Alert.alert(
      'End Conversation',
      'Would you like to end this conversation and see your feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'default',
          onPress: async () => {
            setStatus('ending');
            try {
              await apiClient.post(`/api/conversations/${activeConversationId}/end`);
              setConversationDuration(formatDuration());
              setStatus('completed');
            } catch {
              setStatus('active');
              Alert.alert('Error', 'Failed to end conversation. Please try again.');
            }
          },
        },
      ],
    );
  }, [activeConversationId, setStatus, formatDuration]);

  const handleViewFeedback = useCallback(() => {
    navigation.replace('Feedback', { conversationId: activeConversationId });
  }, [navigation, activeConversationId]);

  const handleStartRecording = useCallback(async () => {
    setErrorMessage(null);
    await startRecording();
  }, [startRecording]);

  const handleCancelRecording = useCallback(async () => {
    await stopRecording();
    setRecordingStatus('idle');
  }, [stopRecording, setRecordingStatus]);

  const handleSendRecording = useCallback(async () => {
    const uri = await stopRecording();
    if (uri) {
      await processTurn(uri);
    }
  }, [stopRecording, processTurn]);

  const handleRetryError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const renderTurn = useCallback(
    ({ item }: { item: Turn }) => {
      const correction = corrections[item.id];
      return <MessageBubble turn={item} correction={correction} />;
    },
    [corrections],
  );

  const renderFooter = useCallback(() => {
    if (typingText) {
      return <TypingBubble text={typingText} />;
    }
    if (isStreaming) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>
      );
    }
    return null;
  }, [typingText, isStreaming]);

  const isEnding = status === 'ending';
  const isCompleted = status === 'completed';
  const isRecording = recordingStatus === 'recording';
  const isProcessing = recordingStatus === 'processing';
  const canRecord = !isStreaming && !isEnding && !isCompleted && !isProcessing;

  // Determine which bottom control to show
  const renderBottomControls = () => {
    if (isCompleted) {
      return (
        <CompletionFooter
          duration={conversationDuration}
          onViewFeedback={handleViewFeedback}
        />
      );
    }

    if (isRecording) {
      return (
        <RecordingControls
          onCancel={handleCancelRecording}
          onSend={handleSendRecording}
        />
      );
    }

    if (isProcessing || isStreaming) {
      return (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>
            {isProcessing ? 'Processing your voice...' : 'Waiting for Coto...'}
          </Text>
          <View style={styles.disabledMicContainer}>
            <View style={styles.disabledMic}>
              <View style={styles.disabledMicDot} />
            </View>
          </View>
        </View>
      );
    }

    return <RecordButton onPress={handleStartRecording} disabled={!canRecord} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TalkHeader onEnd={handleEndConversation} isEnding={isEnding} />

      {/* Message area */}
      {turns.length === 0 && !isStreaming ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyLogo}>
            <Text style={styles.emptyLogoText}>CO</Text>
          </View>
          <Text style={styles.emptyTitle}>Ready to Practice!</Text>
          <Text style={styles.emptySubtitle}>
            Tap the microphone button below and start speaking about {topic}.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={turns}
          renderItem={renderTurn}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Error banner */}
      {errorMessage ? (
        <ErrorBanner
          message={errorMessage}
          onRetry={handleRetryError}
        />
      ) : null}

      {/* Bottom controls */}
      {renderBottomControls()}
    </SafeAreaView>
  );
}

const HEADER_LOGO_SIZE = 32;
const EMPTY_LOGO_SIZE = 56;
const DISABLED_MIC_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.cardBackground,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: HEADER_LOGO_SIZE,
    height: HEADER_LOGO_SIZE,
    borderRadius: HEADER_LOGO_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  endButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.errorRed,
  },
  // Messages
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyLogo: {
    width: EMPTY_LOGO_SIZE,
    height: EMPTY_LOGO_SIZE,
    borderRadius: EMPTY_LOGO_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Loading / typing indicator
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 48,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.aiBubbleBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: Colors.textSecondary,
  },
  // Processing state
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
  },
  processingText: {
    fontSize: 14,
    color: Colors.textHint,
  },
  disabledMicContainer: {
    alignItems: 'center',
  },
  disabledMic: {
    width: DISABLED_MIC_SIZE,
    height: DISABLED_MIC_SIZE,
    borderRadius: DISABLED_MIC_SIZE / 2,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledMicDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9CA3AF',
  },
  // Completion state
  completionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  completionButtonWrapper: {
    width: '100%',
  },
  feedbackButton: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  feedbackButtonPressed: {
    opacity: 0.8,
  },
  feedbackButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
