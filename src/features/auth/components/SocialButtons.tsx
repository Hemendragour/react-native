import {
  View, Text, Alert,
  TouchableOpacity,
  Linking
} from 'react-native';
import * as React from 'react';
import { useState } from 'react';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../../../store/slices/authSlice';
import { API_BASE_URL } from '@env';
import AuthService from '../../../services/auth.service';
import { AuthStackParamList } from '../types/Types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// Initialize Google Sign-In with Web Client ID (from Google Cloud Console)
GoogleSignin.configure({
  webClientId: '707035991312-1b9cebhvfojdp04p0f8vogmiuai42m84.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  offlineAccess: false,
});

const SocialButtons: React.FC = () => {
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign out first to ALWAYS force account selection chooser UI
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if user wasn't signed in before
      }

      const response = await GoogleSignin.signIn();
      console.log('📱 [GOOGLE] Raw SignIn response:', response);

      if ((response as any)?.type === 'cancelled') {
        console.log('ℹ️ [GOOGLE] Sign-in cancelled by user');
        return;
      }

      let idToken: string | null = null;
      let googleUser: any = null;

      if (isSuccessResponse(response)) {
        idToken = response.data.idToken;
        googleUser = response.data.user;
      } else if ((response as any)?.data?.idToken) {
        idToken = (response as any).data.idToken;
        googleUser = (response as any).data.user;
      } else if ((response as any)?.idToken) {
        idToken = (response as any).idToken;
        googleUser = (response as any).user;
      }

      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens.idToken;
        } catch (tokErr) {
          console.warn('⚠️ [GOOGLE] getTokens fallback error:', tokErr);
        }
      }

      if (!idToken) {
        throw new Error('No Google ID token received from sign-in.');
      }

      console.log('🔐 [GOOGLE] Verifying idToken with backend...');
      const loginRes = await AuthService.googleNativeLogin(idToken);

      if (loginRes?.data?.isNewUser) {
        navigation.navigate('Signup', {
          isGoogleOnboarding: true,
          idToken,
          initialData: {
            email: googleUser?.email || (loginRes.data as any)?.googleData?.email || '',
            firstName: googleUser?.givenName || (loginRes.data as any)?.googleData?.firstName || '',
            lastName: googleUser?.familyName || (loginRes.data as any)?.googleData?.lastName || '',
          },
        });
      } else {
        dispatch(setLoggedIn(true));
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('ℹ️ [GOOGLE] Sign-in cancelled by user');
            return;
          case statusCodes.IN_PROGRESS:
            console.log('ℹ️ [GOOGLE] Sign-in already in progress');
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Play Services Error',
              'Google Play Services is not available or outdated on your device.'
            );
            return;
          case '10':
          case statusCodes.SIGN_IN_REQUIRED:
            console.error('❌ [GOOGLE] Developer configuration error (10):', error.message);
            Alert.alert(
              'Google Sign-In Error (Code 10)',
              'Google Developer Error (10). Please ensure:\n1. Debug SHA-1 (5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25) is added to Google Cloud Console with package name com.throne8.\n2. webClientId is a Web Application client ID.'
            );
            return;
          default:
            console.error('❌ [GOOGLE] Sign-in error code:', error.code, error.message);
            break;
        }
      }

      if (error?.message?.includes('DEVELOPER_ERROR') || error?.code === 10) {
        Alert.alert(
          'Google Sign-In Error (Code 10)',
          'Google Developer Error (10). Please ensure:\n1. Debug SHA-1 (5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25) is added to Google Cloud Console with package name com.throne8.\n2. webClientId is a Web Application client ID.'
        );
        return;
      }

      console.error('❌ [GOOGLE] Native OAuth failed:', error);
      Alert.alert(
        'Authentication Error',
        error?.message || 'Failed to authenticate with Google.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true);
      const githubUrl = `${API_BASE_URL || 'http://localhost:4000'}/api/v1/auth/github`;
      await Linking.openURL(githubUrl);
    } catch (error) {
      console.error('❌ [GITHUB] OAuth initiation failed:', error);
      Alert.alert(
        'Error',
        'Failed to initiate GitHub login. Please try again.'
      );
    } finally {
      setIsGithubLoading(false);
    }
  };

  return (
    <View>
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-gray-400 text-xs font-medium">or continue with</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Buttons Row */}
      <View className="flex-row gap-x-3">
        {/* Google */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
          activeOpacity={0.8}
          className={`flex-1 flex-row items-center justify-center gap-x-2.5 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm ${
            isGoogleLoading ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-lg">🇬</Text>
          <Text className="text-[#4a3728] font-semibold text-sm">
            {isGoogleLoading ? 'Signing in...' : 'Google'}
          </Text>
        </TouchableOpacity>

        {/* GitHub */}
        <TouchableOpacity
          onPress={handleGithubLogin}
          disabled={isGithubLoading}
          activeOpacity={0.8}
          className={`flex-1 flex-row items-center justify-center gap-x-2.5 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm ${
            isGithubLoading ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-lg">🐙</Text>
          <Text className="text-[#4a3728] font-semibold text-sm">
            {isGithubLoading ? 'Opening...' : 'GitHub'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SocialButtons;
