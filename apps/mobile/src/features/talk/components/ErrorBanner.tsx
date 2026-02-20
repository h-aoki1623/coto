import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  message: string;
  onRetry: () => void;
}

/**
 * Red error banner displayed below the message list when an error occurs.
 * Shows an error message with a retry button.
 */
export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.retryText}>再試行</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.errorRed,
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.errorRed,
  },
});
