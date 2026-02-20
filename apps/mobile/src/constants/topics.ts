import type { TopicKey } from '@/navigation/types';

export interface Topic {
  key: TopicKey;
  label: string;
  emoji: string;
  iconBg: string;
  iconColor: string;
}

export const TOPICS: Topic[] = [
  { key: 'sports', label: 'スポーツ', emoji: '🌐', iconBg: '#DBEAFE', iconColor: '#3B82F6' },
  { key: 'business', label: 'ビジネス', emoji: '💼', iconBg: '#DCFCE7', iconColor: '#22C55E' },
  { key: 'politics', label: '政治', emoji: '🏛', iconBg: '#FEF3C7', iconColor: '#F59E0B' },
  { key: 'technology', label: 'テクノロジー', emoji: '💻', iconBg: '#FEE2E2', iconColor: '#EF4444' },
  { key: 'entertainment', label: 'エンタメ', emoji: '🎬', iconBg: '#FEF9C3', iconColor: '#EAB308' },
];

/**
 * Find a topic by its key. Returns undefined if not found.
 */
export function findTopic(key: string): Topic | undefined {
  return TOPICS.find((t) => t.key === key);
}
