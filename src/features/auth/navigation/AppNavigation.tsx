import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamlist } from '../types/Types';
import DashboardScreen from '../../home/screens/DashBoard';
import ProfileScreen from '../../profile/screens/ProfileScreen';
import JobPage from '../../jobs/screens/JobPage';
import Notifications from '../../notifications/screens/Notifications';
import { StudyNavigator } from '../../study/app/navigation/RootNavigator';
import MentorLandingScreen from '../../mentorship/screens/mentorLandingScreen';
import MentorDashboardScreen from '../../mentorship/screens/MentorDashboardScreen';
import UserDashboardScreen from '../../mentorship/screens/UserDashboardScreen';
import MentorProfileScreen from '../../mentorship/screens/mentorCard';
import SeniorMentorApplicationScreen from '../../mentorship/screens/SeniorMentorApplicationScreen';
import NetworkScreen from '../../network/screens/Network';
import SearchScreen from '../../search/screens/SearchScreen';
import MessagesListScreen from '../../messages/screens/MessagesListScreen';
import ChatScreen from '../../messages/screens/ChatScreen';
import PostDetailScreen from '../../home/screens/PostDetailScreen';
import ProfileAnalyticsScreen from '../../profile/screens/ProfileAnalyticsScreen';

const Stack = createNativeStackNavigator<AppStackParamlist>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DashboardScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Network" component={NetworkScreen} />
      <Stack.Screen name="Notifs" component={Notifications} />
      <Stack.Screen name="Study" component={StudyNavigator} />
      <Stack.Screen name="Mentorship" component={MentorLandingScreen} />
      <Stack.Screen name="MentorDashboard" component={MentorDashboardScreen}/>
      <Stack.Screen name="UserDashboard" component={UserDashboardScreen}/>
      <Stack.Screen name="MentorProfile" component={MentorProfileScreen}/>
      <Stack.Screen name="SeniorMentorApplication" component={SeniorMentorApplicationScreen}/>
      <Stack.Screen name="Jobs" component={JobPage} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MessagesList" component={MessagesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="ProfileAnalytics" component={ProfileAnalyticsScreen} />
    </Stack.Navigator>
  );
}
