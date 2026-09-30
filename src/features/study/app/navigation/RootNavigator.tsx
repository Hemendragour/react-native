import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { RootStackParamList } from './types';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { TimerScreen } from '../../features/timer/screens/TimerScreen';
import { TodoScreen } from '../../features/todo/screens/TodoScreen';
import { GoalsScreen } from '../../features/goals/screens/GoalsScreen';
import { LeaderboardScreen } from '../../features/leaderboard/screens/LeaderboardScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import MainProfileScreen from '../../../profile/screens/ProfileScreen';
import { MyGroupsScreen } from '../../features/my-groups/screens/MyGroupsScreen';
import { GroupLobbyScreen } from '../../features/my-groups/screens/GroupLobbyScreen';
import { GroupRoomScreen } from '../../features/my-groups/screens/GroupRoomScreen';
import { GroupChatScreen } from '../../features/my-groups/screens/GroupChatScreen';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { StudySearchScreen } from '../../features/search/screens/StudySearchScreen';

enableScreens();
const Stack = createNativeStackNavigator<RootStackParamList>();

export function StudyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyHome" component={HomeScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="Todo" component={TodoScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserProfile" component={MainProfileScreen} />
      <Stack.Screen name="MyGroups" component={MyGroupsScreen} />
      <Stack.Screen name="GroupLobby" component={GroupLobbyScreen} />
      <Stack.Screen name="GroupRoom" component={GroupRoomScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="StudySearch" component={StudySearchScreen} />
    </Stack.Navigator>
  );
}