import { useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { useAudioStore } from '@/stores/audio-store';

interface UseAudioRecordingReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
}

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

/**
 * Hook for managing audio recording with expo-av.
 * Handles permission requests and recording lifecycle.
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const setRecordingStatus = useAudioStore((s) => s.setRecordingStatus);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Microphone Permission Required',
        'Coto needs access to your microphone for conversation practice. Please enable it in Settings.',
      );
      return false;
    }
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;
      setRecordingStatus('recording');
    } catch {
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      setRecordingStatus('idle');
    }
  }, [requestPermission, setRecordingStatus]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      setRecordingStatus('processing');
      await recording.stopAndUnloadAsync();

      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = recording.getURI();
      recordingRef.current = null;
      return uri;
    } catch {
      setRecordingStatus('idle');
      recordingRef.current = null;
      return null;
    }
  }, [setRecordingStatus]);

  return { startRecording, stopRecording };
}

/**
 * Build a FormData object from a recording file URI.
 * React Native's FormData accepts an object with uri/type/name for file uploads.
 */
export function buildAudioFormData(uri: string): FormData {
  const formData = new FormData();
  const extension = Platform.OS === 'ios' ? 'm4a' : 'm4a';
  formData.append('audio', {
    uri,
    type: 'audio/m4a',
    name: `audio.${extension}`,
  } as unknown as Blob);
  return formData;
}
