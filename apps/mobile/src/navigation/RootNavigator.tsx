import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '@/constants/colors';
import { HomeScreen } from '@/features/home/HomeScreen';
import { TalkScreen } from '@/features/talk/TalkScreen';
import { FeedbackScreen } from '@/features/feedback/FeedbackScreen';
import { HistoryListScreen } from '@/features/history/HistoryListScreen';
import { HistoryDetailScreen } from '@/features/history/HistoryDetailScreen';
import { OfflineScreen } from '@/features/offline/OfflineScreen';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isOnline = useNetworkStatus();

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: Colors.textPrimary,
          headerStyle: { backgroundColor: Colors.cardBackground },
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Talk"
          component={TalkScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{
            title: 'フィードバック',
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HistoryList"
          component={HistoryListScreen}
          options={{ title: 'トーク履歴' }}
        />
        <Stack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{ title: '' }}
        />
      </Stack.Navigator>

      {/* Offline overlay - shown on top of everything when network is disconnected */}
      {!isOnline ? <OfflineScreen /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
