/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@env';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import axios from 'axios';
import './global.css';
// import ProfileScreen from './features/profile/screens/ProfileScreen';
// import DashboardScreen from './features/home/screens/DashBoard';
// import LoginScreen from './features/auth/screens/login/loginPage';
// import SignupScreen from './features/auth/screens/signup/signupPage';
// import { NavigationContainer } from '@react-navigation/native';
// import AuthNavigator from './features/auth/navigation/AuthNavigator';
import RootNavigator from './features/auth/navigation/rootNavigation';

// ── Redux ────────────────────────────────────────────────────────────────────
import { Provider } from 'react-redux';
import { store } from './store/store';
import TokenStorage from './store/token.storage';
import { setLoggedIn } from './store/slices/authSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// old code: function App() without Redux Provider
// function App() {
//   return (
//     <RootNavigator/>
//   );
// }

// ✅ new code: App wrapped in Redux Provider
function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await TokenStorage.init();

        if (TokenStorage.isAuthenticated()) {
          // Refresh token exists + user data exists → user is "logged in"

          // If access token is expired, silently refresh it now
          // (Instagram/LinkedIn approach: refresh at app cold start)
          if (TokenStorage.isTokenExpired()) {
            console.log('🔄 [App] Access token expired on startup, refreshing silently...');
            try {
              const refreshToken = TokenStorage.getRefreshToken();
              const { data } = await axios.post(
                `${API_BASE_URL}/api/v1/auth/refresh-token`,
                { refreshToken },
              );

              const newAccessToken = data.data.tokens.accessToken;
              const newRefreshToken = data.data.tokens.refreshToken;
              const expiresIn = data.data.tokens.expiresIn;

              await TokenStorage.setAuthData(
                { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn },
                data.data.user || TokenStorage.getUserData(),
              );
              console.log('✅ [App] Silent refresh successful — user stays logged in');
            } catch (refreshError) {
              console.warn('⚠️ [App] Silent refresh failed — clearing session', refreshError);
              await TokenStorage.clearAuthData();
              // Don't set logged in — user will see login screen
              return;
            }
          }

          store.dispatch(setLoggedIn(true));
          console.log('✅ [App] User authenticated on startup');
        }
      } catch (err) {
        console.error('App bootstrap error:', err);
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  // ── AppState listener: refresh token when app returns from background ──
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App came back to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 [App] Returned to foreground');
        // If access token expired while in background, silently refresh
        if (TokenStorage.isTokenExpired() && TokenStorage.getRefreshToken()) {
          console.log('🔄 [App] Refreshing expired token after background...');
          try {
            const refreshToken = TokenStorage.getRefreshToken();
            const { data } = await axios.post(
              `${API_BASE_URL}/api/v1/auth/refresh-token`,
              { refreshToken },
            );

            await TokenStorage.setAuthData(
              {
                accessToken: data.data.tokens.accessToken,
                refreshToken: data.data.tokens.refreshToken,
                expiresIn: data.data.tokens.expiresIn,
              },
              data.data.user || TokenStorage.getUserData(),
            );
            console.log('✅ [App] Background refresh successful');
          } catch (err) {
            console.warn('⚠️ [App] Background refresh failed — will retry on next API call');
            // Don't logout here — let the interceptor handle it on the next API call
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
