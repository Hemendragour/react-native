import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

// ─── Validation (mirrors Zod schema) ─────────────────────────────────────────
const BLOCKED_DOMAINS = ['example.com', 'test.com', 'demo.com'];

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email is required';
  if (email.length > 255) return 'Email is too long (max 255 characters)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  const domain = email.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) return 'Test or demo emails are not allowed';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 128) return 'Password is too long (max 128 characters)';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z)';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z)';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9)';
  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>]/.test(password))
    return 'Password must contain at least one special character';
  if (/\s/.test(password)) return 'Password cannot contain spaces';
  if (password.toLowerCase().includes('password')) return 'Password cannot contain the word "password"';
  if (password.includes('123')) return 'Avoid common sequences like "123"';
  return undefined;
};

const validateConfirmPassword = (password: string, confirm: string): string | undefined => {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return "Passwords don't match";
  return undefined;
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text className="text-sm font-medium text-gray-700 mb-2">{text}</Text>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <Text className="text-red-500 text-xs mt-1.5">• {message}</Text> : null;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface Step1Props {
  onNext: (data: FormData) => void;
}

const CreateAccount: React.FC<Step1Props> = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const getErrors = () => ({
    email: validateEmail(email.toLowerCase().trim()),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  });

  const isFormValid =
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirmPassword(password, confirmPassword) &&
    !!email && !!password && !!confirmPassword;

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const allErrors = getErrors();
    setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
  };

  const handleSubmit = () => {
    const allErrors = getErrors();
    setErrors(allErrors);
    setTouched({ email: true, password: true, confirmPassword: true });
    if (!allErrors.email && !allErrors.password && !allErrors.confirmPassword) {
      onNext({ email: email.toLowerCase().trim(), password, confirmPassword });
    }
  };

  return (
    <View className="gap-y-5">
      <Text className="text-3xl font-bold text-center text-[#4a3728]">Create Account</Text>

      {/* Email */}
      <View>
        <FieldLabel text="Email" />
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(v.toLowerCase().trim()) }));
          }}
          onBlur={() => handleBlur('email')}
          placeholder="your@email.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          className={`w-full px-5 py-4 rounded-2xl border bg-white text-black text-sm ${
            errors.email && touched.email ? 'border-red-400' : 'border-[#4a3728]/40'
          }`}
        />
        {touched.email && <FieldError message={errors.email} />}
      </View>

      {/* Password */}
      <View>
        <FieldLabel text="Password" />
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (touched.password) setErrors((p) => ({ ...p, password: validatePassword(v) }));
            }}
            onBlur={() => handleBlur('password')}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPass}
            autoCapitalize="none"
            autoCorrect={false}
            className={`w-full px-5 py-4 pr-14 rounded-2xl border bg-white text-black text-sm ${
              errors.password && touched.password ? 'border-red-400' : 'border-[#4a3728]/40'
            }`}
          />
          <TouchableOpacity
            onPress={() => setShowPass((v) => !v)}
            activeOpacity={0.7}
            className="absolute right-4 top-4"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPass ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>
        {touched.password && <FieldError message={errors.password} />}
        {!errors.password && (
          <Text className="text-gray-400 text-xs mt-1.5">
            Must contain: uppercase, lowercase, number, special character
          </Text>
        )}
      </View>

      {/* Confirm Password */}
      <View>
        <FieldLabel text="Confirm Password" />
        <View className="relative">
          <TextInput
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (touched.confirmPassword)
                setErrors((p) => ({ ...p, confirmPassword: validateConfirmPassword(password, v) }));
            }}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoCorrect={false}
            className={`w-full px-5 py-4 pr-14 rounded-2xl border bg-white text-black text-sm ${
              errors.confirmPassword && touched.confirmPassword ? 'border-red-400' : 'border-[#4a3728]/40'
            }`}
          />
          <TouchableOpacity
            onPress={() => setShowConfirm((v) => !v)}
            activeOpacity={0.7}
            className="absolute right-4 top-4"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showConfirm ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>
        {touched.confirmPassword && <FieldError message={errors.confirmPassword} />}
      </View>

      {/* Next Button */}
      <View className="items-end mt-2">
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          className={`px-10 py-4 rounded-2xl shadow-md ${
            isFormValid ? 'bg-[#4a3728]' : 'bg-gray-300'
          }`}
        >
          <Text className={`font-semibold text-sm ${isFormValid ? 'text-white' : 'text-gray-500'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateAccount;