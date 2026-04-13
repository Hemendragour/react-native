// features/profile/components/AddEducationModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EducationData {
  schoolCollegeName: string;
  degree: string;
  degreeType: 'High School' | 'Diploma' | "Bachelor's" | "Master's" | 'Doctorate' | 'Certificate' | 'Other';
  specialization?: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
  educationType?: 'full-time' | 'part-time' | 'distance' | 'online';
  gradeType?: 'percentage' | 'cgpa' | 'gpa' | 'grade';
  gradeValue?: string;
  location?: string;
}

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: EducationData) => void;
  prefillData?: {
    collegeName?: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  };
}

// ─── Close Icon ───────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Degree types ─────────────────────────────────────────────────────────────

const DEGREE_TYPES = ["High School", "Diploma", "Bachelor's", "Master's", "Doctorate", "Certificate", "Other"];
const EDU_TYPES    = ["full-time", "part-time", "distance", "online"];
const GRADE_TYPES  = ["percentage", "cgpa", "gpa", "grade"];

// ─── Input Field ──────────────────────────────────────────────────────────────

const Field = ({
  label, value, onChangeText, placeholder, error, multiline = false, required = false,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; error?: string; multiline?: boolean; required?: boolean;
}) => (
  <View className="mb-4">
    <Text className="text-brand-dark text-sm font-medium mb-1.5">
      {label}{required && <Text className="text-red-500"> *</Text>}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(74,55,40,0.4)"
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 text-brand-dark text-sm ${error ? 'border-red-400' : 'border-t border-[#d4c4b5]'}`}
      style={multiline ? { height: 100, textAlignVertical: 'top' } : {}}
    />
    {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
  </View>
);

// ─── Selector Pills ───────────────────────────────────────────────────────────

const SelectorRow = ({
  label, options, value, onSelect,
}: {
  label: string; options: string[]; value: string; onSelect: (v: string) => void;
}) => (
  <View className="mb-4">
    <Text className="text-brand-dark text-sm font-medium mb-2">{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            className={`px-3 py-2 rounded-full border ${value === opt ? 'bg-brand-dark border-brand-dark' : 'bg-[#4a3728] border-t border-[#d4c4b5]'}`}
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-medium ${value === opt ? 'text-brand-dark' : 'text-[#f6ede8]'}`}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const AddEducationModal: React.FC<AddEducationModalProps> = ({
  isOpen, onClose, onSubmit, prefillData,
}) => {
  const [formData, setFormData] = useState<EducationData>({
    schoolCollegeName: prefillData?.collegeName || '',
    degree:            prefillData?.degree || '',
    degreeType:        "Bachelor's",
    specialization:    prefillData?.fieldOfStudy || '',
    startDate:         '',
    endDate:           prefillData?.graduationYear ? `${prefillData.graduationYear}-12-31` : '',
    description:       '',
    educationType:     'full-time',
    gradeType:         undefined,
    gradeValue:        '',
    location:          '',
  });

  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && prefillData) {
      setFormData(prev => ({
        ...prev,
        schoolCollegeName: prefillData.collegeName  || prev.schoolCollegeName,
        degree:            prefillData.degree       || prev.degree,
        specialization:    prefillData.fieldOfStudy || prev.specialization,
        endDate:           prefillData.graduationYear ? `${prefillData.graduationYear}-12-31` : prev.endDate,
      }));
    }
  }, [isOpen]);

  const set = (key: keyof EducationData) => (val: string) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.schoolCollegeName.trim()) errs.schoolCollegeName = 'College name is required';
    if (!formData.degree.trim())            errs.degree = 'Degree is required';
    if (!formData.startDate)                errs.startDate = 'Start date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      // await addEducation(formData).unwrap();  ← uncomment when API ready
      onSubmit?.(formData);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add education');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-[#f6ede8] rounded-2xl shadow-2xl border border-[#e0d8cf] max-h-[92%]">

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-[#f6ede8] border-b border-[#e0d8cf]">
            <View>
              <Text className="text-xl font-bold text-[#4a3728">Add Education</Text>
              <Text className="text-xs text-[#8b6f47] mt-0.5">Fill in your education details</Text>
            </View>
            <TouchableOpacity
              className="p-2 rounded-full bg-white/20"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-5 pt-5" showsVerticalScrollIndicator={false}>

            <Field
              label="School / College Name" required
              value={formData.schoolCollegeName}
              onChangeText={set('schoolCollegeName')}
              placeholder="e.g., Oriental College of Technology"
              error={errors.schoolCollegeName}
            />

            <Field
              label="Degree" required
              value={formData.degree}
              onChangeText={set('degree')}
              placeholder="e.g., B.Tech in Computer Science"
              error={errors.degree}
            />

            <SelectorRow
              label="Degree Type"
              options={DEGREE_TYPES}
              value={formData.degreeType}
              onSelect={(v) => setFormData(prev => ({ ...prev, degreeType: v as any }))}
            />

            <Field
              label="Start Date" required
              value={formData.startDate}
              onChangeText={set('startDate')}
              placeholder="YYYY-MM-DD"
              error={errors.startDate}
            />

            <Field
              label="End Date (leave empty if ongoing)"
              value={formData.endDate || ''}
              onChangeText={set('endDate')}
              placeholder="YYYY-MM-DD"
            />

            <SelectorRow
              label="Education Type"
              options={EDU_TYPES}
              value={formData.educationType || ''}
              onSelect={(v) => setFormData(prev => ({ ...prev, educationType: v as any }))}
            />

            <SelectorRow
              label="Grade Type"
              options={GRADE_TYPES}
              value={formData.gradeType || ''}
              onSelect={(v) => setFormData(prev => ({ ...prev, gradeType: v as any }))}
            />

            <Field
              label="Grade Value"
              value={formData.gradeValue || ''}
              onChangeText={set('gradeValue')}
              placeholder="e.g., 8.75, 85%, A+"
              error={errors.gradeValue}
            />

            <Field
              label="Location"
              value={formData.location || ''}
              onChangeText={set('location')}
              placeholder="e.g., Bhopal, Madhya Pradesh"
            />

            <Field
              label="Specialization"
              value={formData.specialization || ''}
              onChangeText={set('specialization')}
              placeholder="e.g., AI and Software Engineering..."
              multiline
            />

            <Field
              label="Description"
              value={formData.description || ''}
              onChangeText={set('description')}
              placeholder="Relevant coursework, projects, achievements..."
              multiline
            />

            <View className="h-6" />
          </ScrollView>

          {/* Footer buttons */}
          <View className="flex-row gap-x-3 px-5 py-4 bg-[#f6ede8] border-t border-[#e0d8cf]">
            <TouchableOpacity
              className="flex-1 py-3 bg-[#e0d8cf] rounded-xl items-center justify-center"
              onPress={onClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-[#4a3728] rounded-xl flex-row items-center justify-center gap-x-2"
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting
                ? <ActivityIndicator color="#f6ede8" />
                : <Text className="text-[#f6ede8] font-semibold text-sm">Add Education</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default AddEducationModal;