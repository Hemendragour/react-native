import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import * as React from 'react';
import { useState } from 'react';

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialValues?: any;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validators = {
  firstName: (v: string) => {
    if (!v.trim()) return 'First name cannot be empty';
    if (v.trim().length < 2) return 'First name must be at least 2 characters';
    if (v.trim().length > 50) return 'First name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(v))
      return 'First name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  },
  lastName: (v: string) => {
    if (!v.trim()) return 'Last name cannot be empty';
    if (v.trim().length < 2) return 'Last name must be at least 2 characters';
    if (v.trim().length > 50) return 'Last name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s\-']+$/.test(v))
      return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  },
  phone: (v: string) => {
    if (!v.trim()) return 'Phone number is required';
    if (v.length < 10) return 'Phone number must be at least 10 digits';
    if (!/^\+?[1-9]\d{1,14}$/.test(v))
      return 'Invalid phone number format (e.g., +919876543210)';
    return undefined;
  },
  location: (v: string) => {
    if (!v.trim()) return 'Location cannot be empty';
    if (v.trim().length < 2) return 'Location must be at least 2 characters';
    if (v.trim().length > 100) return 'Location cannot exceed 100 characters';
    if (!/^[A-Z][a-zA-Z\s-]+$/.test(v))
      return 'Location must start with a capital letter';
    return undefined;
  },
};

type Fields = 'firstName' | 'lastName' | 'phone' | 'location';

const FieldLabel = ({ text }: { text: string }) => (
  <Text className="text-sm font-medium text-gray-700 mb-2">{text}</Text>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <Text className="text-red-500 text-xs mt-1.5">• {message}</Text>
  ) : null;

const PersonalDetails = ({ onNext, onBack, initialValues }: Props) => {
  const [values, setValues] = useState({
    firstName: initialValues?.firstName || '',
    lastName: initialValues?.lastName || '',
    phone: initialValues?.phone || initialValues?.phoneNumber || '',
    location: initialValues?.location || '',
  });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});

  const sanitizePhone = (value: string) => value.replace(/[^0-9+]/g, '');

const setValue = (field: Fields, val: string) => {
    const nextValue = field === 'phone' ? sanitizePhone(val) : val;
    setValues(p => ({ ...p, [field]: nextValue }));
    if (touched[field]) {
      setErrors(p => ({ ...p, [field]: validators[field](nextValue) }));
    }
  };

  const handleBlur = (field: Fields) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(p => ({ ...p, [field]: validators[field](values[field]) }));
  };
  const isFormValid = (Object.keys(validators) as Fields[]).every(
    f => !validators[f](values[f]),
  );

  const handleSubmit = () => {
    const allErrors: Partial<Record<Fields, string>> = {};
    const allTouched: Partial<Record<Fields, boolean>> = {};
    (Object.keys(validators) as Fields[]).forEach(f => {
      allErrors[f] = validators[f](values[f]);
      allTouched[f] = true;
    });
    setErrors(allErrors);
    setTouched(allTouched);
    if (isFormValid) {
      onNext({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone,
        phoneNumber: values.phone,
        location: values.location.trim(),
      });
    }
  };
  const inputClass = (field: Fields) =>
    `w-full px-5 py-4 rounded-2xl border bg-white text-black text-sm ${
      errors[field] && touched[field] ? 'border-red-400' : 'border-[#4a3728]/40'
    }`;

  return (
    <View className="gap-y-5">
      <Text className="text-3xl font-bold text-center text-[#4a3728]">
        Personal Details
      </Text>

      {/* First Name */}
      <View>
        <FieldLabel text="First Name" />
        <TextInput
          value={values.firstName}
          onChangeText={v => setValue('firstName', v)}
          onBlur={() => handleBlur('firstName')}
          placeholder="First Name"
          placeholderTextColor="#9ca3af"
          className={inputClass('firstName')}
        />
        {touched.firstName && <FieldError message={errors.firstName} />}
      </View>

      {/* Last Name */}
      <View>
        <FieldLabel text="Last Name" />
        <TextInput
          value={values.lastName}
          onChangeText={v => setValue('lastName', v)}
          onBlur={() => handleBlur('lastName')}
          placeholder="Last Name"
          placeholderTextColor="#9ca3af"
          className={inputClass('lastName')}
        />
        {touched.lastName && <FieldError message={errors.lastName} />}
      </View>

      {/* Phone + Location row */}
      <View className="flex-row gap-x-3">
        <View className="flex-1">
          <FieldLabel text="Phone" />
          <TextInput
            value={values.phone}
            onChangeText={v => setValue('phone', v)}
            onBlur={() => handleBlur('phone')}
            placeholder="+919876543210"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            className={inputClass('phone')}
          />
          {touched.phone ? (
            <FieldError message={errors.phone} />
          ) : (
            <Text className="text-gray-400 text-xs mt-1">E.164 format</Text>
          )}
        </View>

        <View className="flex-1">
          <FieldLabel text="Location" />
          <TextInput
            value={values.location}
            onChangeText={v => setValue('location', v)}
            onBlur={() => handleBlur('location')}
            placeholder="Mumbai"
            placeholderTextColor="#9ca3af"
            className={inputClass('location')}
          />
          {touched.location && <FieldError message={errors.location} />}
        </View>
      </View>

      {/* Nav Buttons */}
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.85}
          className="px-8 py-4 rounded-2xl bg-[#4a3728]"
        >
          <Text className="text-white font-semibold text-sm">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          className={`px-8 py-4 rounded-2xl shadow-md ${
            isFormValid ? 'bg-[#4a3728]' : 'bg-gray-300'
          }`}
        >
          <Text
            className={`font-semibold text-sm ${
              isFormValid ? 'text-white' : 'text-gray-500'
            }`}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PersonalDetails;
