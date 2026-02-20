import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import type { TurnCorrection } from '@/types/conversation';

interface CorrectionAnnotationProps {
  correctionStatus: 'none' | 'pending' | 'clean' | 'has_corrections';
  correction?: TurnCorrection;
}

/**
 * Inline correction annotation shown below user message bubbles.
 * Shows checking status, clean status, or expandable correction card.
 */
export function CorrectionAnnotation({
  correctionStatus,
  correction,
}: CorrectionAnnotationProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (correctionStatus === 'none') return null;

  if (correctionStatus === 'pending') {
    return (
      <View style={styles.annotationRow}>
        <Text style={styles.checkingText}>Checking...</Text>
      </View>
    );
  }

  if (correctionStatus === 'clean') {
    return (
      <View style={styles.annotationRow}>
        <Text style={styles.cleanIcon}>✓</Text>
        <Text style={styles.cleanText}>No corrections</Text>
      </View>
    );
  }

  // has_corrections
  const itemCount = correction?.items.length ?? 0;

  return (
    <View>
      <Pressable
        style={styles.annotationRow}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`${itemCount} corrections. Tap to ${expanded ? 'collapse' : 'expand'}`}
      >
        <Text style={styles.warningIcon}>⚠</Text>
        <Text style={styles.correctionCountText}>
          {itemCount} correction{itemCount !== 1 ? 's' : ''} {expanded ? '▼' : '›'}
        </Text>
      </Pressable>

      {expanded && correction ? (
        <ExpandedCorrectionCard correction={correction} />
      ) : null}
    </View>
  );
}

interface ExpandedCorrectionCardProps {
  correction: TurnCorrection;
}

function ExpandedCorrectionCard({ correction }: ExpandedCorrectionCardProps) {
  return (
    <View style={styles.expandedCard}>
      {correction.items.map((item) => (
        <View key={item.id} style={styles.correctionItem}>
          {/* Original sentence with error highlighted */}
          <Text style={styles.originalSentence}>
            {renderHighlightedText(item.originalSentence, item.original, 'original')}
          </Text>

          {/* Corrected sentence with correction highlighted */}
          <Text style={styles.correctedSentence}>
            {renderHighlightedText(item.correctedSentence, item.corrected, 'corrected')}
          </Text>

          {/* Explanation */}
          <View style={styles.explanationRow}>
            <Text style={styles.explanationDiamond}>◇</Text>
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Render text with a specific word/phrase highlighted.
 * Splits the sentence by the target and wraps it in a styled span.
 */
function renderHighlightedText(
  sentence: string,
  target: string,
  type: 'original' | 'corrected',
): React.ReactNode[] {
  const index = sentence.indexOf(target);
  if (index === -1) {
    // Target not found in sentence, render plain
    return [
      <Text key="plain" style={type === 'original' ? styles.originalPlain : styles.correctedPlain}>
        {sentence}
      </Text>,
    ];
  }

  const before = sentence.slice(0, index);
  const after = sentence.slice(index + target.length);

  return [
    before ? (
      <Text key="before" style={type === 'original' ? styles.originalPlain : styles.correctedPlain}>
        {before}
      </Text>
    ) : null,
    <Text
      key="highlight"
      style={type === 'original' ? styles.originalHighlight : styles.correctedHighlight}
    >
      {target}
    </Text>,
    after ? (
      <Text key="after" style={type === 'original' ? styles.originalPlain : styles.correctedPlain}>
        {after}
      </Text>
    ) : null,
  ].filter(Boolean);
}

const styles = StyleSheet.create({
  // Annotation row (inline under bubble)
  annotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    paddingRight: 16,
    justifyContent: 'flex-end',
  },
  checkingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cleanIcon: {
    fontSize: 12,
    color: Colors.correctionGreen,
    fontWeight: '700',
  },
  cleanText: {
    fontSize: 12,
    color: Colors.correctionGreen,
    fontWeight: '500',
  },
  warningIcon: {
    fontSize: 12,
    color: Colors.correctionOrange,
  },
  correctionCountText: {
    fontSize: 12,
    color: Colors.correctionOrange,
    fontWeight: '600',
  },

  // Expanded correction card
  expandedCard: {
    marginTop: 6,
    marginRight: 16,
    marginLeft: 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  correctionItem: {
    gap: 6,
  },
  // Original sentence
  originalSentence: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  originalPlain: {
    color: Colors.textPrimary,
  },
  originalHighlight: {
    color: Colors.correctionOrange,
    textDecorationLine: 'line-through',
  },
  // Corrected sentence
  correctedSentence: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  correctedPlain: {
    color: Colors.textPrimary,
  },
  correctedHighlight: {
    color: Colors.correctionGreen,
    fontWeight: '600',
    backgroundColor: '#DCFCE7',
  },
  // Explanation
  explanationRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  explanationDiamond: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
});
