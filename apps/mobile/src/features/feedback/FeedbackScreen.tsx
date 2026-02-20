import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '@/api/client';
import { Colors } from '@/constants/colors';
import { useConversationStore } from '@/stores/conversation-store';
import type { RootStackParamList } from '@/navigation/types';
import type { TurnCorrection, CorrectionItem } from '@/types/conversation';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

interface FeedbackResponse {
  totalTurns: number;
  totalCorrections: number;
  totalClean: number;
  corrections: TurnCorrection[];
}

type LoadingState = 'loading' | 'loaded' | 'error';

// -- Summary Stats Component --

interface SummaryStatsProps {
  totalTurns: number;
  totalCorrections: number;
  totalClean: number;
}

function SummaryStats({ totalTurns, totalCorrections, totalClean }: SummaryStatsProps) {
  return (
    <View style={styles.statsRow}>
      <StatCircle value={totalTurns} label="やりとり" color={Colors.primaryBlue} />
      <StatCircle value={totalCorrections} label="添削" color={Colors.correctionOrange} />
      <StatCircle value={totalClean} label="訂正なし" color={Colors.correctionGreen} />
    </View>
  );
}

function StatCircle({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View
      style={styles.statItem}
      accessibilityLabel={`${value} ${label}`}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// -- Correction Card Component --

function FeedbackCorrectionCard({ correction }: { correction: TurnCorrection }) {
  return (
    <View style={styles.correctionCard}>
      {correction.items.map((item) => (
        <FeedbackCorrectionItem key={item.id} item={item} />
      ))}
    </View>
  );
}

function FeedbackCorrectionItem({ item }: { item: CorrectionItem }) {
  return (
    <View style={styles.correctionItemContainer}>
      {/* Original sentence with error word in red/strikethrough */}
      <Text style={styles.sentenceText}>
        {renderHighlightedOriginal(item.originalSentence, item.original)}
      </Text>

      {/* Corrected sentence with corrected word in green */}
      <Text style={styles.sentenceText}>
        {renderHighlightedCorrected(item.correctedSentence, item.corrected)}
      </Text>

      {/* Explanation */}
      <View style={styles.explanationRow}>
        <Text style={styles.explanationDiamond}>◇</Text>
        <Text style={styles.explanationText}>{item.explanation}</Text>
      </View>
    </View>
  );
}

function renderHighlightedOriginal(sentence: string, target: string): React.ReactNode[] {
  const index = sentence.indexOf(target);
  if (index === -1) {
    return [<Text key="plain" style={styles.plainText}>{sentence}</Text>];
  }

  const before = sentence.slice(0, index);
  const after = sentence.slice(index + target.length);

  return [
    before ? <Text key="before" style={styles.plainText}>{before}</Text> : null,
    <Text key="highlight" style={styles.originalErrorText}>{target}</Text>,
    after ? <Text key="after" style={styles.plainText}>{after}</Text> : null,
  ].filter(Boolean);
}

function renderHighlightedCorrected(sentence: string, target: string): React.ReactNode[] {
  const index = sentence.indexOf(target);
  if (index === -1) {
    return [<Text key="plain" style={styles.plainText}>{sentence}</Text>];
  }

  const before = sentence.slice(0, index);
  const after = sentence.slice(index + target.length);

  return [
    before ? <Text key="before" style={styles.plainText}>{before}</Text> : null,
    <Text key="highlight" style={styles.correctedGreenText}>{target}</Text>,
    after ? <Text key="after" style={styles.plainText}>{after}</Text> : null,
  ].filter(Boolean);
}

// -- Main Screen --

export function FeedbackScreen({ navigation, route }: Props) {
  const { conversationId } = route.params;
  const [corrections, setCorrections] = useState<TurnCorrection[]>([]);
  const [stats, setStats] = useState({ totalTurns: 0, totalCorrections: 0, totalClean: 0 });
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const reset = useConversationStore((s) => s.reset);

  const fetchFeedback = useCallback(async () => {
    setLoadingState('loading');
    try {
      const result = await apiClient.get<FeedbackResponse>(
        `/api/conversations/${conversationId}/feedback`,
      );

      if (result.error) {
        setLoadingState('error');
        return;
      }

      if (result.data) {
        setCorrections(result.data.corrections ?? []);
        setStats({
          totalTurns: result.data.totalTurns ?? 0,
          totalCorrections: result.data.totalCorrections ?? 0,
          totalClean: result.data.totalClean ?? 0,
        });
      }
      setLoadingState('loaded');
    } catch {
      setLoadingState('error');
    }
  }, [conversationId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Disable back gesture and customize header
  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      gestureEnabled: false,
      title: 'フィードバック',
      headerTitleStyle: styles.screenTitle,
    });
  }, [navigation]);

  const handleBackToHome = useCallback(() => {
    reset();
    navigation.popToTop();
  }, [reset, navigation]);

  if (loadingState === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  if (loadingState === 'error') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>Could not load feedback</Text>
        <Pressable
          style={styles.retryButton}
          onPress={fetchFeedback}
          accessibilityRole="button"
          accessibilityLabel="Retry loading feedback"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={corrections}
        renderItem={({ item }) => <FeedbackCorrectionCard correction={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SummaryStats
              totalTurns={stats.totalTurns}
              totalCorrections={stats.totalCorrections}
              totalClean={stats.totalClean}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyCheckIcon}>✓</Text>
            <Text style={styles.emptyTitle}>Perfect!</Text>
            <Text style={styles.emptySubtitle}>No corrections needed. Great job!</Text>
          </View>
        }
      />
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.homeButton,
            pressed && styles.homeButtonPressed,
          ]}
          onPress={handleBackToHome}
          accessibilityRole="button"
          accessibilityLabel="Go back to home screen"
        >
          <Text style={styles.homeButtonText}>ホームに戻る</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  // Error state
  errorIcon: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.errorRed,
    marginBottom: 12,
    textAlign: 'center',
    width: 56,
    height: 56,
    lineHeight: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    overflow: 'hidden',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 180,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  // List
  list: {
    padding: 20,
    paddingBottom: 8,
  },
  listHeader: {
    marginBottom: 12,
  },
  // Correction cards
  correctionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  correctionItemContainer: {
    gap: 8,
  },
  sentenceText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  plainText: {
    color: Colors.textPrimary,
  },
  originalErrorText: {
    color: Colors.errorRed,
    textDecorationLine: 'line-through',
  },
  correctedGreenText: {
    color: Colors.correctionGreen,
    fontWeight: '600',
    backgroundColor: '#DCFCE7',
  },
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
  // Empty state (no corrections)
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCheckIcon: {
    fontSize: 40,
    color: Colors.correctionGreen,
    fontWeight: '700',
    marginBottom: 12,
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
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.cardBackground,
  },
  homeButton: {
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  homeButtonPressed: {
    backgroundColor: '#EFF6FF',
  },
  homeButtonText: {
    color: Colors.primaryBlue,
    fontSize: 17,
    fontWeight: '600',
  },
});
