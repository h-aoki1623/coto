import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/stores/app-store';

/**
 * Full-screen overlay shown when the device has no network connectivity.
 * Displays a WiFi-off icon, message, and retry button.
 *
 * Integration: Render this as a modal overlay in App.tsx or RootNavigator.tsx
 * when `useNetworkStatus()` returns false.
 */
export function OfflineScreen() {
  const setOnlineStatus = useAppStore((s) => s.setOnlineStatus);

  const handleRetry = useCallback(async () => {
    // Trigger a re-check via NetInfo.
    // The actual continuous monitoring happens via useNetworkStatus subscription.
    // This forces an immediate re-evaluation of connectivity.
    try {
      const state = await NetInfo.fetch();
      setOnlineStatus(state.isConnected ?? false);
    } catch {
      // If NetInfo fails, keep offline state
    }
  }, [setOnlineStatus]);

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        {/* WiFi-off icon */}
        <View style={styles.iconContainer}>
          <WifiOffIcon />
        </View>

        <Text style={styles.title}>オフラインです</Text>
        <Text style={styles.body}>
          このアプリを使用するにはインターネット接続が必要です。接続を確認してからもう一度お試しください。
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry network connection"
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Simple WiFi-off icon built from View shapes.
 */
function WifiOffIcon() {
  return (
    <View style={styles.wifiIcon}>
      {/* WiFi arcs */}
      <View style={styles.wifiArcOuter} />
      <View style={styles.wifiArcMiddle} />
      <View style={styles.wifiDot} />
      {/* Slash line */}
      <View style={styles.slashLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  // WiFi icon
  iconContainer: {
    marginBottom: 24,
  },
  wifiIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiArcOuter: {
    width: 48,
    height: 24,
    borderWidth: 3,
    borderColor: '#9CA3AF',
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    top: 8,
  },
  wifiArcMiddle: {
    width: 32,
    height: 16,
    borderWidth: 3,
    borderColor: '#9CA3AF',
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    top: 20,
  },
  wifiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    position: 'absolute',
    bottom: 14,
  },
  slashLine: {
    width: 3,
    height: 56,
    backgroundColor: '#9CA3AF',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  // Text
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  // Retry button
  retryButton: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
