import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import AuthHeader from '../../components/AuthHeader';
import LoginForm from '../../components/LoginForm';
import SocialButtons from '../../components/SocialButtons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/Types';

// old code: LoginScreen accepted setIsLoggedIn prop
// type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
//   setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
// };

// ✅ new code: no setIsLoggedIn prop — Redux handles auth state
type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * LoginScreen
 *
 * Replaces the web combination of:
 *   AuthLayout + AuthRightContainer + page.tsx
 *
 * The web had a left decorative panel (brown gradient curve) + right form card.
 * On mobile we translate this to:
 *   - Full-screen warm background
 *   - Top decorative arc (the brown curve, simplified)
 *   - Floating white card with all form content
 */
// old code: const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, setIsLoggedIn }) => {
// ✅ new code: no setIsLoggedIn prop
const LoginScreen = ({ navigation }: LoginScreenProps) => {

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <StatusBar barStyle="light-content" backgroundColor="#4a3728" />

      {/* ── Decorative top diagonal cover ── */}
      <View className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
        <View
          className="absolute bg-[#4a3728]"
          style={{
            width: Dimensions.get('window').width * 2,
            height: Dimensions.get('window').height * 0.75,
            top: -Dimensions.get('window').height * 0.4,
            left: -Dimensions.get('window').width * 0.5,
            transform: [{ rotate: '-18deg' }],
          }}
        />

        {/* THRONE8 brand on the arc */}
        <View className="absolute inset-x-0 top-0 items-center justify-center mt-10"></View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: 32,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── White card that floats over the arc ── */}
          <View className="mx-4 my-4 bg-white rounded-3xl shadow-2xl px-6 py-16">
            {/* Header */}
            <AuthHeader />

            {/* Divider */}
            <View className="h-px bg-[#e0d8cf] my-6" />

            {/* Login Form */}
            {/* old code: <LoginForm navigation={navigation} setIsLoggedIn={setIsLoggedIn} /> */}
            {/* ✅ new code: LoginForm uses Redux useAuth() internally */}
            <LoginForm navigation={navigation} />

            {/* Social Buttons */}
            <SocialButtons />

            {/* Sign up link */}
            <View className="flex-row items-center justify-center mt-6 gap-x-1">
              <Text className="text-gray-500 text-sm">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.7}
              >
                <Text className="text-[#4a3728] font-semibold text-sm">
                  {' '}
                  Create a New Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

