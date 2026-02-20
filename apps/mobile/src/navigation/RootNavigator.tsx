import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Placeholder screens (will be replaced by feature modules)
function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text>Home</Text>
    </View>
  );
}

function TalkScreen() {
  return (
    <View style={styles.center}>
      <Text>Talk</Text>
    </View>
  );
}

function FeedbackScreen() {
  return (
    <View style={styles.center}>
      <Text>Feedback</Text>
    </View>
  );
}

function HistoryListScreen() {
  return (
    <View style={styles.center}>
      <Text>History</Text>
    </View>
  );
}

function HistoryDetailScreen() {
  return (
    <View style={styles.center}>
      <Text>History Detail</Text>
    </View>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Coto' }} />
      <Stack.Screen name="Talk" component={TalkScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="HistoryList" component={HistoryListScreen} options={{ title: 'History' }} />
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: 'Detail' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
