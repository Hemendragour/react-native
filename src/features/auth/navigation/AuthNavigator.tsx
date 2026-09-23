import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/Types';
import LoginScreen from '../screens/login/loginPage';
import SignupScreen from '../screens/signup/signupPage';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// old code: AuthNavigator accepted setIsLoggedIn prop
// type AuthNavigatorProps = {
//   setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
// };
// export default function AuthNavigator({ setIsLoggedIn }: AuthNavigatorProps) {

// ✅ new code: no props needed — screens use Redux useAuth() hook internally
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* old code: {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />} */}
      {/* ✅ new code: LoginScreen uses Redux internally, no prop needed */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* old code: {props=><SignupScreen {...props} setIsLoggedIn={setIsLoggedIn}/>} */}
      {/* ✅ new code: SignupScreen uses Redux internally, no prop needed */}
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}