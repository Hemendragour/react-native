import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamlist } from '../types/Types';
import DashboardScreen from '../../home/screens/DashBoard';
import ProfileScreen from '../../profile/screens/ProfileScreen';
import JobPage from '../../jobs/screens/JobPage';
import Notifications from '../../notifications/screens/Notifications';
import Study from '../../study/screens/Study';
import MentorLandingScreen from '../../mentorship/screens/mentorLandingScreen';
import MentorDashboardScreen from '../../mentorship/screens/MentorDashboardScreen';
import MentorProfileScreen from '../../mentorship/screens/mentorCard';
import NetworkScreen from '../../network/screens/Network';

const Stack = createNativeStackNavigator<AppStackParamlist>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Network" component={NetworkScreen} />
      <Stack.Screen name="Notifs" component={Notifications} />
      <Stack.Screen name="Study" component={Study} />
      <Stack.Screen name="Mentorship" component={MentorLandingScreen} />
      <Stack.Screen name="MentorDashboard" component={MentorDashboardScreen}/>
      <Stack.Screen name="MentorProfile" component={MentorProfileScreen}/>
      <Stack.Screen name="Jobs" component={JobPage} />
    </Stack.Navigator>
  );
}
