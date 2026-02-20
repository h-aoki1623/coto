import { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  onCancel: () => void;
  onSend: () => void;
}

const BAR_COUNT = 20;

/**
 * Recording controls shown while the user is actively recording audio.
 * Displays "Speak now..." text, animated waveform bars, and cancel/send buttons.
 */
export function RecordingControls({ onCancel, onSend }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.speakNowText}>Speak now...</Text>
      <WaveformVisualizer />
      <View style={styles.controlsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel recording"
        >
          <Text style={styles.cancelIcon}>✕</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onSend}
          accessibilityRole="button"
          accessibilityLabel="Send recording"
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Animated waveform bars that simulate audio visualization.
 * Each bar oscillates at a slightly different speed/phase for a natural look.
 */
function WaveformVisualizer() {
  const animatedValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 300 + (index % 5) * 80,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300 + (index % 5) * 80,
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    // Stagger the start of each bar animation
    animations.forEach((anim, index) => {
      setTimeout(() => anim.start(), index * 40);
    });

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [animatedValues]);

  return (
    <View style={styles.waveformContainer}>
      {animatedValues.map((value, index) => {
        const height = value.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 24 + (index % 3) * 8],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.waveformBar,
              { height },
            ]}
          />
        );
      })}
    </View>
  );
}

const CANCEL_SIZE = 44;
const SEND_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
  },
  speakNowText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryBlue,
  },
  // Waveform
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 3,
    paddingHorizontal: 32,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primaryBlue,
  },
  // Control buttons
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  cancelButton: {
    width: CANCEL_SIZE,
    height: CANCEL_SIZE,
    borderRadius: CANCEL_SIZE / 2,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sendButton: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
