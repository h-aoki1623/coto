import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Large blue microphone button shown in idle state.
 * Centered at the bottom of the talk screen with hint text above.
 */
export function RecordButton({ onPress, disabled = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.hintText}>Press Record to start speaking</Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && !disabled && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Record"
        accessibilityHint="Starts recording your voice for the conversation"
        accessibilityState={{ disabled }}
      >
        <MicIcon />
      </Pressable>
    </View>
  );
}

/**
 * Simple microphone icon using View shapes.
 */
function MicIcon() {
  return (
    <View style={styles.micIconContainer}>
      {/* Mic body */}
      <View style={styles.micBody} />
      {/* Mic base arc */}
      <View style={styles.micArc} />
      {/* Mic stand */}
      <View style={styles.micStand} />
    </View>
  );
}

const BUTTON_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    gap: 12,
  },
  hintText: {
    fontSize: 14,
    color: Colors.textHint,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  // Mic icon shapes
  micIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 10,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  micArc: {
    width: 18,
    height: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopWidth: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    marginTop: -2,
  },
  micStand: {
    width: 2,
    height: 4,
    backgroundColor: '#FFFFFF',
  },
});
