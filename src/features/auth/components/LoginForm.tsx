import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/Types'; // adjust path
const BLOCKED_DOMAINS = ['example.com', 'test.com', 'demo.com'];

type Props = {
  navigation: NativeStackNavigationProp<any>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

interface ValidationErrors {
  email?: string;
  password?: string;
}

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  if (email.length > 255) return 'Email is too long (max 255 characters)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please enter a valid email address';
  const domain = email.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain))
    return 'Test or demo emails are not allowed';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 128) return 'Password is too long (max 128 characters)';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter (A-Z)';
  if (!/[a-z]/.test(password))
    return 'Password must contain at least one lowercase letter (a-z)';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number (0-9)';
  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>]/.test(password))
    return 'Password must contain at least one special character';
  if (/\s/.test(password)) return 'Password cannot contain spaces';
  if (password.toLowerCase().includes('password'))
    return 'Password cannot contain the word "password"';
  if (password.includes('123')) return 'Avoid common sequences like "123"';
  return undefined;
};

const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <Text className="text-red-500 text-xs mt-1.5 ml-1">{message}</Text>;
};

const LoginForm: React.FC<Props> = ({ navigation, setIsLoggedIn }) => {
  // const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validate all fields
    const emailErr = validateEmail(email.toLowerCase().trim());
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});
    setApiError(null);
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1200));

      // Mark the user as logged in and switch to the app stack
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error('❌ [FORM] Login failed:', error);
      const msg = error?.message?.toLowerCase() ?? '';
      if (msg.includes('invalid') || msg.includes('credentials')) {
        setApiError(
          '❌ Invalid email or password. Please check your credentials.',
        );
      } else if (msg.includes('locked')) {
        setApiError(
          '🔒 Account locked due to multiple failed attempts. Try again in 15 minutes.',
        );
      } else if (msg.includes('disabled') || msg.includes('suspended')) {
        setApiError('⛔ Your account has been disabled. Contact support.');
      } else if (msg.includes('network') || msg.includes('connection')) {
        setApiError('🌐 No internet connection. Please check your network.');
      } else {
        setApiError('⚠️ Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-y-5">
      {/* ── API Error Banner ── */}
      {!!apiError && (
        <View className="flex-row items-start gap-x-2.5 bg-red-50 border border-red-200 px-4 py-3 rounded-2xl">
          <AlertCircle size={16} color="#dc2626" style={{ marginTop: 1 }} />
          <Text className="text-red-700 text-sm font-medium flex-1 leading-5">
            {apiError}
          </Text>
        </View>
      )}

      {/* ── Email ── */}
      <View>
        <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
        <TextInput
          value={email}
          onChangeText={handleEmailChange}
          onBlur={() =>
            setErrors(prev => ({ ...prev, email: validateEmail(email) }))
          }
          placeholder="your@email.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          className={`w-full px-5 py-4 rounded-2xl border bg-white text-black text-sm ${
            errors.email ? 'border-red-400' : 'border-[#4a3728]/30'
          }`}
        />
        <FieldError message={errors.email} />
      </View>

      <View>
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Password
        </Text>
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                password: validatePassword(password),
              }))
            }
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            className={`w-full px-5 py-4 pr-14 rounded-2xl border bg-white text-black text-sm ${
              errors.password ? 'border-red-400' : 'border-[#4a3728]/30'
            }`}
          />
          {/* Eye toggle */}
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            activeOpacity={0.7}
            className="absolute right-4 top-4"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>
        <FieldError message={errors.password} />
      </View>
      {/* ── Remember Me + Forgot Password ── */}
      <View className="flex-row items-center justify-between">
        {/* Remember Me */}
        <TouchableOpacity
          onPress={() => setRememberMe(v => !v)}
          activeOpacity={0.7}
          className="flex-row items-center gap-x-2"
        >
          <View
            className={`w-5 h-5 rounded border-2 items-center justify-center ${
              rememberMe
                ? 'bg-[#4a3728] border-[#4a3728]'
                : 'bg-white border-gray-300'
            }`}
          >
            {rememberMe && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="text-gray-600 text-sm">Remember me</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          activeOpacity={0.7}
        >
          <Text className="text-[#4a3728] text-sm font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Submit Button ── */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !rememberMe}
        activeOpacity={0.85}
        className={`w-full py-4 rounded-2xl items-center justify-center flex-row gap-x-2 shadow-md ${
          rememberMe && !loading ? 'bg-[#4a3728]' : 'bg-gray-300'
        }`}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Signing In...
            </Text>
          </>
        ) : (
          <Text
            className={`font-semibold text-base ${
              rememberMe ? 'text-white' : 'text-gray-500'
            }`}
          >
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      {/* Helper hint when remember me is off */}
      {!rememberMe && (
        <Text className="text-center text-xs text-gray-400">
          Please check "Remember me" to enable sign in
        </Text>
      )}
    </View>
  );
};

export default LoginForm;
