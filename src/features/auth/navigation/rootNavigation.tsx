import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigation';
// old code: import { useState } from 'react';
// ✅ new code: use Redux hook instead of local state
import { useAuth } from '../../../store/hooks/useAuth';

export default function RootNavigator() {
  // old code: change this later with real auth
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ new code: Redux manages auth state globally
  const { isLoggedIn } = useAuth();

  React.useEffect(() => {
    if (isLoggedIn) {
      const TokenStorage = require('../../../store/token.storage').default;
      const { ConnectionService } = require('../../../services/connection.service');
      const userData = TokenStorage.getUserData();
      if (userData?.userId) {
        console.log('🔄 [RootNavigator] Initializing ConnectionService cache for userId:', userData.userId);
        ConnectionService.initCache(userData.userId);
      }
    }
  }, [isLoggedIn]);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppNavigator />
      ) : (
        // old code: <AuthNavigator setIsLoggedIn={setIsLoggedIn} />
        // ✅ new code: no more prop drilling — AuthNavigator uses Redux internally
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}