import { View, Text, Alert,
  TouchableOpacity,
  Linking, } from 'react-native';
import React, { useState } from 'react';

const SocialButtons: React.FC = () => {
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const handleGoogleLogin = () => {
    // TODO: Integrate Google Sign-In with @react-native-google-signin/google-signin
    Alert.alert('Google Sign In', 'Google OAuth setup pending');
  };

  const handleGithubLogin = async () => {
    try {
      setIsGithubLoading(true);
      // TODO: Replace with your actual API base URL from env/config
      const apiUrl = 'http://localhost:4000';
      const githubUrl = `${apiUrl}/auth/github`;

      const canOpen = await Linking.canOpenURL(githubUrl);
      if (canOpen) {
        await Linking.openURL(githubUrl);
      } else {
        Alert.alert('Error', 'Cannot open GitHub login URL');
      }
    } catch (error) {
      console.error('❌ [GITHUB] OAuth initiation failed:', error);
      Alert.alert(
        'Error',
        'Failed to initiate GitHub login. Please try again.',
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
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center gap-x-2.5 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm"
        >
          {/* G icon placeholder — swap with <GoogleIcon /> from vector-icons */}
          <Text className="text-lg">🇬</Text>
          <Text className="text-[#4a3728] font-semibold text-sm">Google</Text>
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
          {/* GitHub icon placeholder */}
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
