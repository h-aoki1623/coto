import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Turn, TurnCorrection } from '@/types/conversation';
import { CorrectionAnnotation } from './CorrectionCard';

const AI_AVATAR_SIZE = 24;

interface Props {
  turn: Turn;
  correction?: TurnCorrection;
}

/**
 * Chat message bubble for AI or User messages.
 * AI messages include a small CO avatar on the left.
 * User messages show blue bubbles right-aligned with correction annotations.
 */
export function MessageBubble({ turn, correction }: Props) {
  const isUser = turn.role === 'user';

  if (isUser) {
    return (
      <View>
        <View
          style={[styles.container, styles.userContainer]}
          accessibilityRole="text"
          accessibilityLabel={`You said: ${turn.text}`}
        >
          <View style={[styles.bubble, styles.userBubble]}>
            <Text style={[styles.text, styles.userText]}>{turn.text}</Text>
          </View>
        </View>
        <CorrectionAnnotation
          correctionStatus={turn.correctionStatus}
          correction={correction}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, styles.aiContainer]}
      accessibilityRole="text"
      accessibilityLabel={`Coto said: ${turn.text}`}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>CO</Text>
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        <Text style={[styles.text, styles.aiText]}>{turn.text}</Text>
      </View>
    </View>
  );
}

interface TypingBubbleProps {
  text: string;
}

/**
 * Typing indicator bubble shown while AI is streaming a response.
 */
export function TypingBubble({ text }: TypingBubbleProps) {
  return (
    <View style={[styles.container, styles.aiContainer]}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>CO</Text>
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        <Text style={[styles.text, styles.aiText]}>{text || '...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  // AI avatar
  avatarCircle: {
    width: AI_AVATAR_SIZE,
    height: AI_AVATAR_SIZE,
    borderRadius: AI_AVATAR_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Bubbles
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: Colors.primaryBlue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.aiBubbleBg,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: Colors.textPrimary,
  },
});
