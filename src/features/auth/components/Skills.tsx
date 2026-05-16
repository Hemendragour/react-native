import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { X } from 'lucide-react-native';

interface Props {
  onNext: (data: { skills: string[] }) => void;
  onBack: () => void;
}

const AVAILABLE_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Python', 'Java', 'C++', 'HTML/CSS', 'Tailwind CSS',
  'Git', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS',
  'Docker', 'GraphQL', 'Redux', 'Figma', 'UI/UX Design',
  'Machine Learning', 'Data Analysis', 'Flutter', 'Kotlin', 'Swift',
];

const Skills: React.FC<Props> = ({ onNext, onBack }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredSkills = AVAILABLE_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedSkills.includes(s)
  );

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => [...prev, skill]);
    }
    setInputValue('');
    setIsFocused(false);
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const showDropdown = isFocused && inputValue.length > 0 && filteredSkills.length > 0;

  return (
    <View className="gap-y-5">
      {/* Header */}
      <View className="items-center">
        <Text className="text-3xl font-bold text-[#4a3728]">Your Skills</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">
          Add relevant skills to strengthen your profile{' '}
          <Text className="text-gray-400">(optional)</Text>
        </Text>
      </View>

      {/* Search Input */}
      <View className="relative">
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Type to search or add skills..."
          placeholderTextColor="#9ca3af"
          className={`w-full px-5 py-4 rounded-2xl border-2 bg-white text-black text-base ${
            isFocused || inputValue
              ? 'border-[#4a3728]'
              : 'border-gray-200'
          }`}
        />

        {/* Dropdown */}
        {showDropdown && (
          <View className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#4a3728] rounded-2xl shadow-2xl overflow-hidden z-30 max-h-52">
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {filteredSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  onPress={() => addSkill(skill)}
                  activeOpacity={0.8}
                  className="px-5 py-3.5 border-b border-gray-50"
                >
                  <Text className="text-gray-800 font-medium text-sm">{skill}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Selected Skill Tags */}
      {selectedSkills.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <View
              key={skill}
              className="flex-row items-center gap-x-2 bg-[#4a3728] px-4 py-2 rounded-full shadow-sm"
            >
              <Text className="text-white text-sm font-medium">{skill}</Text>
              <TouchableOpacity
                onPress={() => removeSkill(skill)}
                activeOpacity={0.7}
                className="w-5 h-5 rounded-full bg-white/25 items-center justify-center"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={11} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Nav Buttons */}
      <View className="flex-row items-center justify-between mt-4">
        <TouchableOpacity onPress={onBack} activeOpacity={0.85} className="px-8 py-4 rounded-2xl border-2 border-gray-200">
          <Text className="text-gray-700 font-semibold text-sm">Back</Text>
        </TouchableOpacity>

        <View className="flex-row gap-x-3">
          {/* Skip */}
          <TouchableOpacity
            onPress={() => onNext({ skills: [] })}
            activeOpacity={0.7}
            className="px-6 py-4 rounded-2xl"
          >
            <Text className="text-[#4a3728] font-medium text-sm">Skip</Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <TouchableOpacity
            onPress={() => onNext({ skills: selectedSkills })}
            activeOpacity={0.85}
            className="px-8 py-4 bg-[#4a3728] rounded-2xl shadow-xl"
          >
            <Text className="text-white font-bold text-sm">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Skills;