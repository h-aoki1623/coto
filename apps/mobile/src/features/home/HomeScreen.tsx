import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '@/api/client';
import { TOPICS } from '@/constants/topics';
import { Colors } from '@/constants/colors';
import { useConversationStore } from '@/stores/conversation-store';
import { useAppStore } from '@/stores/app-store';
import type { RootStackParamList, TopicKey } from '@/navigation/types';
import type { Topic } from '@/constants/topics';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface CreateConversationResponse {
  id: string;
  topic: string;
  status: string;
}

function CoLogo() {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>CO</Text>
      </View>
    </View>
  );
}

interface PausedBannerProps {
  onResume: () => void;
  isResuming: boolean;
}

function PausedConversationBanner({ onResume, isResuming }: PausedBannerProps) {
  return (
    <View style={styles.pausedBanner}>
      <View style={styles.pausedLeft}>
        <View style={styles.pausedPlayIcon}>
          <Text style={styles.pausedPlayText}>▶</Text>
        </View>
        <View>
          <Text style={styles.pausedTitle}>中断中のトーク</Text>
          <Text style={styles.pausedTimestamp}>tap to resume</Text>
        </View>
      </View>
      <Pressable
        onPress={onResume}
        disabled={isResuming}
        style={styles.resumeButton}
        accessibilityRole="button"
        accessibilityLabel="Resume paused conversation"
      >
        {isResuming ? (
          <ActivityIndicator size="small" color={Colors.primaryBlue} />
        ) : (
          <Text style={styles.resumeText}>再開</Text>
        )}
      </Pressable>
    </View>
  );
}

interface TopicCardProps {
  topic: Topic;
  isLoading: boolean;
  isDisabled: boolean;
  onPress: (key: TopicKey) => void;
}

function TopicCard({ topic, isLoading, isDisabled, onPress }: TopicCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        isDisabled && !isLoading && styles.cardDisabled,
      ]}
      onPress={() => onPress(topic.key)}
      disabled={isDisabled}
      testID={`topic-${topic.key}`}
      accessibilityRole="button"
      accessibilityLabel={`Start conversation about ${topic.label}`}
      accessibilityHint="Creates a new conversation and opens the talk screen"
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconCircle, { backgroundColor: topic.iconBg }]}>
          <Text style={styles.iconEmoji}>{topic.emoji}</Text>
        </View>
        <Text style={styles.topicLabel}>{topic.label}</Text>
      </View>
      <View style={styles.cardRight}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primaryBlue} />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </Pressable>
  );
}

export function HomeScreen({ navigation }: Props) {
  const [loadingTopic, setLoadingTopic] = useState<TopicKey | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const startConversation = useConversationStore((s) => s.startConversation);
  const pausedConversationId = useAppStore((s) => s.pausedConversationId);
  const setPausedConversationId = useAppStore((s) => s.setPausedConversationId);

  const handleTopicPress = useCallback(
    async (topicKey: TopicKey) => {
      if (loadingTopic) return;

      setLoadingTopic(topicKey);
      try {
        const result = await apiClient.post<CreateConversationResponse>(
          '/api/conversations',
          { topic: topicKey },
        );

        if (result.error) {
          Alert.alert('Error', result.error.message);
          return;
        }

        if (result.data) {
          startConversation(topicKey, result.data.id);
          navigation.navigate('Talk', {
            topic: topicKey,
            conversationId: result.data.id,
          });
        }
      } catch {
        Alert.alert(
          'Connection Error',
          'Could not connect to the server. Please check your network and try again.',
        );
      } finally {
        setLoadingTopic(null);
      }
    },
    [loadingTopic, navigation, startConversation],
  );

  const handleResume = useCallback(async () => {
    if (!pausedConversationId || isResuming) return;

    setIsResuming(true);
    try {
      const result = await apiClient.post<CreateConversationResponse>(
        `/api/conversations/${pausedConversationId}/resume`,
      );

      if (result.error) {
        Alert.alert('Error', result.error.message);
        return;
      }

      if (result.data) {
        const topic = (result.data.topic ?? 'sports') as TopicKey;
        startConversation(topic, pausedConversationId);
        setPausedConversationId(null);
        navigation.navigate('Talk', {
          topic,
          conversationId: pausedConversationId,
        });
      }
    } catch {
      Alert.alert(
        'Connection Error',
        'Could not resume the conversation. Please try again.',
      );
    } finally {
      setIsResuming(false);
    }
  }, [pausedConversationId, isResuming, navigation, startConversation, setPausedConversationId]);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate('HistoryList');
  }, [navigation]);

  const renderTopicCard = useCallback(
    ({ item }: { item: Topic }) => (
      <TopicCard
        topic={item}
        isLoading={loadingTopic === item.key}
        isDisabled={loadingTopic !== null}
        onPress={handleTopicPress}
      />
    ),
    [loadingTopic, handleTopicPress],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header area */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <CoLogo />
          <Pressable
            onPress={handleHistoryPress}
            style={styles.historyButton}
            testID="history-button"
            accessibilityRole="button"
            accessibilityLabel="View conversation history"
            accessibilityHint="Opens the list of past conversations"
          >
            <Text style={styles.historyIcon}>🕐</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>こんにちは</Text>
        <Text style={styles.subtitle}>今日は何について話す？</Text>
      </View>

      {/* Paused conversation banner */}
      {pausedConversationId ? (
        <View style={styles.pausedWrapper}>
          <PausedConversationBanner
            onResume={handleResume}
            isResuming={isResuming}
          />
        </View>
      ) : null}

      {/* Topics section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>TOPICS</Text>
      </View>

      <FlatList
        data={TOPICS}
        renderItem={renderTopicCard}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const LOGO_SIZE = 48;
const ICON_CIRCLE_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  historyButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  // Paused conversation banner
  pausedWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pausedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pausedPlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedPlayText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  pausedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pausedTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resumeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },
  // Section
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Topic cards
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
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
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  topicLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardRight: {
    width: 32,
    alignItems: 'center',
  },
  chevron: {
    fontSize: 24,
    color: '#C4C4C4',
    fontWeight: '300',
  },
});
