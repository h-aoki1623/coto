import type { TopicKey } from '@/navigation/types';

interface Topic {
  key: TopicKey;
  label: string;
  emoji: string;
}

export const TOPICS: Topic[] = [
  { key: 'sports', label: 'Sports', emoji: '\u26BD' },
  { key: 'business', label: 'Business', emoji: '\uD83D\uDCBC' },
  { key: 'technology', label: 'Technology', emoji: '\uD83D\uDCBB' },
  { key: 'politics', label: 'Politics', emoji: '\uD83C\uDFDB' },
  { key: 'entertainment', label: 'Entertainment', emoji: '\uD83C\uDFAC' },
];
