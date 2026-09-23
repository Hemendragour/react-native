import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import PickerSheet from './PickerSheet';

const VALID_DEGREES = [
  'B.Tech', 'B.E', 'B.Sc', 'BCA', 'B.Com', 'B.A', 'M.Tech', 'M.E', 'M.Sc', 'MCA', 'M.Com', 'M.A', 'MBA', 'PhD', 'Diploma', 'Other'
].map(d => ({ label: d, value: d }));

const VALID_FIELDS = [
  'Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Aerospace', 'Automobile', 'Data Science', 'Artificial Intelligence', 'Machine Learning', 'Cyber Security', 'Business Administration', 'Finance', 'Marketing', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Other'
].map(f => ({ label: f, value: f }));

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validators = {
  collegeName: (v: string) => {
    if (!v.trim()) return 'College name cannot be empty';
    if (v.trim().length < 3) return 'College name must be at least 3 characters';
    if (v.trim().length > 200) return 'College name cannot exceed 200 characters';
    return undefined;
  },
  degree: (v: string) => {
    if (!v.trim()) return 'Degree is required (e.g., B.Tech, B.Sc)';
    if (v.trim().length > 50) return 'Degree name too long';
    return undefined;
  },
  fieldOfStudy: (v: string) => {
    if (!v.trim()) return 'Field of study is required';
    if (v.trim().length < 2) return 'Field of study must be at least 2 characters';
    if (v.trim().length > 100) return 'Field of study too long';
    return undefined;
  },
  graduationYear: (v: string) => {
    if (!v.trim()) return 'Graduation year is required';
    if (!/^\d{4}$/.test(v)) return 'Must be a 4-digit year (e.g., 2025)';
    const y = parseInt(v, 10);
    if (y < 1950 || y > 2035) return 'Year must be between 1950 and 2035';
    return undefined;
  },
};

const sanitizeYear = (value: string) => value.replace(/\D/g, '').slice(0, 4);

type Fields = keyof typeof validators;

const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text className="text-sm font-medium text-gray-700 mb-2">{text}</Text>
);
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <Text className="text-red-500 text-xs mt-1.5">• {message}</Text> : null;

const StudentEducation: React.FC<Props> = ({ onNext, onBack }) => {
  const [values, setValues] = useState({ collegeName: '', degree: '', fieldOfStudy: '', graduationYear: '' });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [showDegreePicker, setShowDegreePicker] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

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
      <Text className="text-3xl font-bold text-center text-[#4a3728]">Education</Text>

      {/* College Name */}
      <View>
        <FieldLabel text="College/School Name" />
        <TextInput
          value={values.collegeName}
          onChangeText={(v) => setValue('collegeName', v)}
          onBlur={() => handleBlur('collegeName')}
          placeholder="College/School Name"
          placeholderTextColor="#9ca3af"
          className={inputClass('collegeName')}
        />
        {touched.collegeName && <FieldError message={errors.collegeName} />}
      </View>

      {/* Degree */}
      <View>
        <FieldLabel text="Degree (e.g. B.Tech)" />
        {/*
        <TextInput
          value={values.degree}
          onChangeText={(v) => setValue('degree', v)}
          onBlur={() => handleBlur('degree')}
          placeholder="B.Tech, B.Sc, B.Com"
          placeholderTextColor="#9ca3af"
          className={inputClass('degree')}
        />
        */}
        <TouchableOpacity
          onPress={() => setShowDegreePicker(true)}
          activeOpacity={0.8}
          className={`flex-row items-center justify-between w-full px-5 py-4 rounded-2xl border bg-white ${
            errors.degree && touched.degree ? 'border-red-400' : 'border-[#4a3728]/40'
          }`}
        >
          <Text className={`text-sm ${values.degree ? 'text-black' : 'text-[#9ca3af]'}`}>
            {values.degree || "Select Degree"}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <PickerSheet
          visible={showDegreePicker}
          title="Select Degree"
          options={VALID_DEGREES}
          selected={values.degree}
          onSelect={(val) => {
            setTouched((p) => ({ ...p, degree: true }));
            setValues((p) => ({ ...p, degree: val }));
            setErrors((p) => ({ ...p, degree: validators.degree(val) }));
          }}
          onClose={() => setShowDegreePicker(false)}
        />
        {touched.degree && <FieldError message={errors.degree} />}
      </View>

      {/* Field of Study */}
      <View>
        <FieldLabel text="Field of Study" />
        {/*
        <TextInput
          value={values.fieldOfStudy}
          onChangeText={(v) => setValue('fieldOfStudy', v)}
          onBlur={() => handleBlur('fieldOfStudy')}
          placeholder="Computer Science, Commerce"
          placeholderTextColor="#9ca3af"
          className={inputClass('fieldOfStudy')}
        />
        */}
        <TouchableOpacity
          onPress={() => setShowFieldPicker(true)}
          activeOpacity={0.8}
          className={`flex-row items-center justify-between w-full px-5 py-4 rounded-2xl border bg-white ${
            errors.fieldOfStudy && touched.fieldOfStudy ? 'border-red-400' : 'border-[#4a3728]/40'
          }`}
        >
          <Text className={`text-sm ${values.fieldOfStudy ? 'text-black' : 'text-[#9ca3af]'}`}>
            {values.fieldOfStudy || "Select Field of Study"}
          </Text>
          <ChevronDown size={20} color="#9ca3af" />
        </TouchableOpacity>
        <PickerSheet
          visible={showFieldPicker}
          title="Select Field of Study"
          options={VALID_FIELDS}
          selected={values.fieldOfStudy}
          onSelect={(val) => {
            setTouched((p) => ({ ...p, fieldOfStudy: true }));
            setValues((p) => ({ ...p, fieldOfStudy: val }));
            setErrors((p) => ({ ...p, fieldOfStudy: validators.fieldOfStudy(val) }));
          }}
          onClose={() => setShowFieldPicker(false)}
        />
        {touched.fieldOfStudy && <FieldError message={errors.fieldOfStudy} />}
      </View>

      {/* Graduation Year */}
      <View>
        <FieldLabel text="Graduation Year" />
        <TextInput
          value={values.graduationYear}
          onChangeText={(v) => setValue('graduationYear', sanitizeYear(v))}
          onBlur={() => handleBlur('graduationYear')}
          placeholder="2025"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={4}
          className={inputClass('graduationYear')}
        />
        {touched.graduationYear && <FieldError message={errors.graduationYear} />}
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

export default StudentEducation;