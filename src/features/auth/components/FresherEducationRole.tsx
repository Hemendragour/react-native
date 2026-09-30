import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import PickerSheet from './PickerSheet';

const VALID_EDUCATION_LEVELS = [
  '10th Pass', '12th Pass', 'Diploma', 'B.Tech', 'B.E', 'B.Sc', 'BCA', 'B.Com', 'B.A', 'M.Tech', 'M.Sc', 'MCA', 'MBA', 'Other'
].map(l => ({ label: l, value: l }));

const VALID_JOB_ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer', 'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer', 'Quality Assurance Engineer', 'UI/UX Designer', 'Product Manager', 'Business Analyst', 'Digital Marketing', 'Content Writer', 'Sales Executive', 'Customer Support', 'HR Recruiter', 'Other'
].map(r => ({ label: r, value: r }));

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validators = {
  highestEducation: (v: string) => {
    if (!v.trim()) return 'Highest education cannot be empty';
    if (v.trim().length < 2) return 'Highest education must be at least 2 characters';
    if (v.trim().length > 100) return 'Highest education too long';
    return undefined;
  },
  preferredRole: (v: string) => {
    if (!v.trim()) return 'Preferred role is required';
    if (v.trim().length < 2) return 'Preferred role must be at least 2 characters';
    if (v.trim().length > 100) return 'Preferred role too long';
    return undefined;
  },
  cgpa: (v: string) => {
    if (!v.trim()) return 'CGPA is required';
    if (!/^(?:10(?:\.0{1,2})?|[0-9](?:\.[0-9]{1,2})?)$/.test(v))
      return 'CGPA must be a valid number between 0 and 10';
    const num = parseFloat(v);
    if (isNaN(num)) return 'CGPA must be a valid number';
    if (num < 0 || num > 10) return 'CGPA must be between 0 and 10';
    return undefined;
  },
};

const sanitizeCgpa = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 2) {
    const integer = parts[0] || '0';
    const decimal = parts[1] ?? '';
    return decimal.length > 0 ? `${integer}.${decimal}` : integer;
  }
  return `${parts[0]}.${parts[1].slice(0, 2)}`;
};

type Fields = keyof typeof validators;

const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text className="text-sm font-medium text-gray-700 mb-2">{text}</Text>
);
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <Text className="text-red-500 text-xs mt-1.5">• {message}</Text> : null;

const FresherEducationRole: React.FC<Props> = ({ onNext, onBack }) => {
  const [values, setValues] = useState({ highestEducation: '', preferredRole: '', cgpa: '' });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const setValue = (field: Fields, val: string) => {
    setValues((p) => ({ ...p, [field]: val }));
    if (touched[field]) setErrors((p) => ({ ...p, [field]: validators[field](val) }));
  };

  const handleBlur = (field: Fields) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validators[field](values[field]) }));
  };

  const isFormValid = (Object.keys(validators) as Fields[]).every((f) => !validators[f](values[f]));

  const handleSubmit = () => {
    const allErrors: Partial<Record<Fields, string>> = {};
    const allTouched: Partial<Record<Fields, boolean>> = {};
    (Object.keys(validators) as Fields[]).forEach((f) => {
      allErrors[f] = validators[f](values[f]);
      allTouched[f] = true;
    });
    setErrors(allErrors);
    setTouched(allTouched);
    if (isFormValid) onNext(values);
  };

  const inputClass = (field: Fields) =>
    `w-full px-5 py-4 rounded-2xl border bg-white text-black text-sm ${
      errors[field] && touched[field] ? 'border-red-400' : 'border-[#4a3728]/40'
    }`;

  return (
    <View className="gap-y-4">
      <Text className="text-3xl font-bold text-center text-[#4a3728]">Education & Role</Text>

      {/* Highest Education */}
      <View>
        <FieldLabel text="Highest Education" />
        {/*
        <TextInput
          value={values.highestEducation}
          onChangeText={(v) => setValue('highestEducation', v)}
          onBlur={() => handleBlur('highestEducation')}
          placeholder="e.g., B.Tech, B.Sc"
          placeholderTextColor="#9ca3af"
          className={inputClass('highestEducation')}
        />
        */}
        <TouchableOpacity
          onPress={() => setShowEducationPicker(true)}
          activeOpacity={0.8}
          className={`flex-row items-center justify-between w-full px-5 py-4 rounded-2xl border bg-white ${
            errors.highestEducation && touched.highestEducation ? 'border-red-400' : 'border-[#4a3728]/40'
          }`}
        >
          <Text className={`text-sm ${values.highestEducation ? 'text-black' : 'text-[#9ca3af]'}`}>
            {values.highestEducation || "Select Education Level"}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <PickerSheet
          visible={showEducationPicker}
          title="Select Education Level"
          options={VALID_EDUCATION_LEVELS}
          selected={values.highestEducation}
          onSelect={(val) => {
            setTouched((p) => ({ ...p, highestEducation: true }));
            setValues((p) => ({ ...p, highestEducation: val }));
            setErrors((p) => ({ ...p, highestEducation: validators.highestEducation(val) }));
          }}
          onClose={() => setShowEducationPicker(false)}
        />
        {touched.highestEducation && <FieldError message={errors.highestEducation} />}
      </View>

      {/* Preferred Role */}
      <View>
        <FieldLabel text="Preferred Role" />
        {/*
        <TextInput
          value={values.preferredRole}
          onChangeText={(v) => setValue('preferredRole', v)}
          onBlur={() => handleBlur('preferredRole')}
          placeholder="e.g., Software Engineer"
          placeholderTextColor="#9ca3af"
          className={inputClass('preferredRole')}
        />
        */}
        <TouchableOpacity
          onPress={() => setShowRolePicker(true)}
          activeOpacity={0.8}
          className={`flex-row items-center justify-between w-full px-5 py-4 rounded-2xl border bg-white ${
            errors.preferredRole && touched.preferredRole ? 'border-red-400' : 'border-[#4a3728]/40'
          }`}
        >
          <Text className={`text-sm ${values.preferredRole ? 'text-black' : 'text-[#9ca3af]'}`}>
            {values.preferredRole || "Select Preferred Role"}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <PickerSheet
          visible={showRolePicker}
          title="Select Preferred Role"
          options={VALID_JOB_ROLES}
          selected={values.preferredRole}
          onSelect={(val) => {
            setTouched((p) => ({ ...p, preferredRole: true }));
            setValues((p) => ({ ...p, preferredRole: val }));
            setErrors((p) => ({ ...p, preferredRole: validators.preferredRole(val) }));
          }}
          onClose={() => setShowRolePicker(false)}
        />
        {touched.preferredRole && <FieldError message={errors.preferredRole} />}
      </View>

      {/* CGPA */}
      <View>
        <FieldLabel text="CGPA" />
        <TextInput
          value={values.cgpa}
          onChangeText={(v) => setValue('cgpa', sanitizeCgpa(v))}
          onBlur={() => handleBlur('cgpa')}
          placeholder="e.g., 8.5"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          maxLength={4}
          className={inputClass('cgpa')}
        />
        {touched.cgpa && <FieldError message={errors.cgpa} />}
      </View>

      {/* Nav Buttons */}
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity onPress={onBack} activeOpacity={0.85} className="px-8 py-4 rounded-2xl bg-[#4a3728]">
          <Text className="text-white font-semibold text-sm">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          className={`px-8 py-4 rounded-2xl shadow-md ${isFormValid ? 'bg-[#4a3728]' : 'bg-gray-300'}`}
        >
          <Text className={`font-semibold text-sm ${isFormValid ? 'text-white' : 'text-gray-500'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FresherEducationRole;