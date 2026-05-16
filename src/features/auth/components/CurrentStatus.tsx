import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  onNext: (data: { status: string; userType: string }) => void;
  onBack: () => void;
}

const statuses = [
  {
    id: 'working',
    title: 'Working Professional',
    desc: 'Currently employed or freelancing',
    icon: '💼',
  },
  {
    id: 'student',
    title: 'Student',
    desc: 'Pursuing a degree or certification',
    icon: '📚',
  },
  {
    id: 'fresher',
    title: 'Fresher / Job Seeker',
    desc: 'Looking for first opportunity',
    icon: '⭐',
  },
];

const CurrentStatus: React.FC<Props> = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    onNext({ status: selected, userType: selected });
  };

  return (
    <View className="gap-y-5">
      <Text className="text-3xl font-bold text-center text-[#4a3728]">Your Current Status</Text>

      {/* Status Cards */}
      <View className="gap-y-3">
        {statuses.map((status) => {
          const isSelected = selected === status.id;
          return (
            <TouchableOpacity
              key={status.id}
              onPress={() => setSelected(status.id)}
              activeOpacity={0.8}
              className={`flex-row items-center gap-x-4 p-5 rounded-2xl border-2 ${
                isSelected
                  ? 'border-[#4a3728] bg-[#4a3728]/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-4xl">{status.icon}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-base text-gray-900">{status.title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{status.desc}</Text>
              </View>
              {/* Radio dot */}
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  isSelected ? 'border-[#4a3728] bg-[#4a3728]' : 'border-gray-300'
                }`}
              >
                {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
              </View>
            </TouchableOpacity>
          );
        })}
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
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
          className={`px-8 py-4 rounded-2xl shadow-md ${selected ? 'bg-[#4a3728]' : 'bg-gray-300'}`}
        >
          <Text className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-500'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CurrentStatus;