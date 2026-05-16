import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/Types';
import LoginScreen from '../screens/login/loginPage';
import SignupScreen from '../screens/signup/signupPage';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthNavigator({ setIsLoggedIn }: AuthNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {props=><SignupScreen {...props} setIsLoggedIn={setIsLoggedIn}/> }</Stack.Screen> 
    </Stack.Navigator>
  );
}