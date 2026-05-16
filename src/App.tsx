/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';
import './global.css';
// import ProfileScreen from './features/profile/screens/ProfileScreen';
// import DashboardScreen from './features/home/screens/DashBoard';
// import LoginScreen from './features/auth/screens/login/loginPage';
// import SignupScreen from './features/auth/screens/signup/signupPage';
// import { NavigationContainer } from '@react-navigation/native';
// import AuthNavigator from './features/auth/navigation/AuthNavigator';
import RootNavigator from './features/auth/navigation/rootNavigation';

function App() {

  return (
    <RootNavigator/>
  );
}





export default App;

