// src/navigation/RootNavigator.tsx

import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigation';
import { useState } from 'react';

export default function RootNavigator() {
   // change this later with real auth
const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
{isLoggedIn ? (
      <AppNavigator />
    ) : (
      <AuthNavigator setIsLoggedIn={setIsLoggedIn} />
    )}    </NavigationContainer>
  );
}