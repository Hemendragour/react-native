import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import PickerSheet from './PickerSheet';

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

// ─── Options ──────────────────────────────────────────────────────────────────
const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX/UI Designer',
  'DevOps Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'Mobile Developer', 'QA Engineer', 'Other',
];

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Startup', 'Freelance', 'Other',
];

// ─── Validation ───────────────────────────────────────────────────────────────
const getMonthsDiff = (start: string, end: string) => {
  const s = new Date(start), e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
};

const validate = (
  jobTitle: string,
  companyName: string,
  startDate: string,
  endDate: string,
  isCurrentlyWorking: boolean
) => {
  const errs: Record<string, string> = {};
  if (!jobTitle) errs.jobTitle = 'Please select a job title';
  if (!companyName) errs.companyName = 'Please select a company';
  if (!startDate) errs.startDate = 'Start date is required';
  else if (isNaN(new Date(startDate).getTime())) errs.startDate = 'Invalid start date format (YYYY-MM-DD)';
  else if (new Date(startDate) > new Date()) errs.startDate = 'Start date cannot be in the future';
  if (!isCurrentlyWorking) {
    if (!endDate) errs.endDate = 'End date is required';
    else if (isNaN(new Date(endDate).getTime())) errs.endDate = 'Invalid end date format (YYYY-MM-DD)';
    else if (new Date(endDate) > new Date()) errs.endDate = 'End date cannot be in the future';
    else if (new Date(endDate) < new Date(startDate)) errs.endDate = 'End date must be after start date';
    else if (getMonthsDiff(startDate, endDate) < 1) errs.endDate = 'Minimum 1 month job duration required';
  }
  return errs;
};

const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text className="text-sm font-medium text-gray-700 mb-2">{text}</Text>
);
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <Text className="text-red-500 text-xs mt-1.5">• {message}</Text> : null;

const WorkingJobDetails: React.FC<Props> = ({ onNext, onBack }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);

  const handleSubmit = () => {
    const errs = validate(jobTitle, companyName, startDate, endDate, isCurrentlyWorking);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onNext({
        jobTitle,
        companyName,
        startDate,
        endDate: isCurrentlyWorking ? null : endDate,
        isCurrentlyWorking,
      });
    }
  };

  const isFormValid =
    Object.keys(validate(jobTitle, companyName, startDate, endDate, isCurrentlyWorking)).length === 0;

  return (
    <>
      <View className="gap-y-4">
        <Text className="text-3xl font-bold text-center text-[#4a3728]">Current Job</Text>

        {/* Job Title */}
        <View>
          <FieldLabel text="Job Title *" />
          <TouchableOpacity
            onPress={() => setShowJobPicker(true)}
            activeOpacity={0.8}
            className={`flex-row items-center justify-between px-5 py-4 rounded-2xl border bg-white ${
              errors.jobTitle ? 'border-red-400' : 'border-[#4a3728]/40'
            }`}
          >
            <Text className={`text-sm ${jobTitle ? 'text-black' : 'text-gray-400'}`}>
              {jobTitle || 'Select Job Title'}
            </Text>
            <ChevronDown size={16} color="#4a3728" />
          </TouchableOpacity>
          <FieldError message={errors.jobTitle} />
        </View>

        {/* Company Name */}
        <View>
          <FieldLabel text="Company Name *" />
          <TouchableOpacity
            onPress={() => setShowCompanyPicker(true)}
            activeOpacity={0.8}
            className={`flex-row items-center justify-between px-5 py-4 rounded-2xl border bg-white ${
              errors.companyName ? 'border-red-400' : 'border-[#4a3728]/40'
            }`}
          >
            <Text className={`text-sm ${companyName ? 'text-black' : 'text-gray-400'}`}>
              {companyName || 'Select Company'}
            </Text>
            <ChevronDown size={16} color="#4a3728" />
          </TouchableOpacity>
          <FieldError message={errors.companyName} />
        </View>

        {/* Employment Status */}
        <View>
          <FieldLabel text="Employment Status *" />
          <View className="flex-row gap-x-6">
            {[
              { label: 'Currently Working', value: true },
              { label: 'Completed', value: false },
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                onPress={() => {
                  setIsCurrentlyWorking(value);
                  if (value) setEndDate('');
                }}
                activeOpacity={0.7}
                className="flex-row items-center gap-x-2"
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isCurrentlyWorking === value ? 'border-[#4a3728] bg-[#4a3728]' : 'border-gray-300'
                  }`}
                >
                  {isCurrentlyWorking === value && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>
                <Text className="text-sm text-gray-700">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dates Row */}
        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <FieldLabel text="Start Date *" />
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              className={`px-4 py-4 rounded-2xl border bg-white text-black text-sm ${
                errors.startDate ? 'border-red-400' : 'border-[#4a3728]/40'
              }`}
            />
            <FieldError message={errors.startDate} />
          </View>
          <View className="flex-1">
            <FieldLabel text={`End Date${!isCurrentlyWorking ? ' *' : ''}`} />
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              editable={!isCurrentlyWorking}
              className={`px-4 py-4 rounded-2xl border bg-white text-black text-sm ${
                errors.endDate ? 'border-red-400' : 'border-[#4a3728]/40'
              } ${isCurrentlyWorking ? 'opacity-40' : ''}`}
            />
            {!isCurrentlyWorking
              ? <FieldError message={errors.endDate} />
              : <Text className="text-gray-400 text-xs mt-1">Disabled (currently working)</Text>
            }
          </View>
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

      {/* Pickers */}
      <PickerSheet
        visible={showJobPicker}
        title="Select Job Title"
        options={JOB_TITLES.map((j) => ({ label: j, value: j }))}
        selected={jobTitle}
        onSelect={setJobTitle}
        onClose={() => setShowJobPicker(false)}
      />
      <PickerSheet
        visible={showCompanyPicker}
        title="Select Company"
        options={COMPANIES.map((c) => ({ label: c, value: c }))}
        selected={companyName}
        onSelect={setCompanyName}
        onClose={() => setShowCompanyPicker(false)}
      />
    </>
  );
};

export default WorkingJobDetails;