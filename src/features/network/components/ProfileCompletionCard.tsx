import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileCompletionCard: React.FC<{
  completionPercentage?: number;
  missingFields?: string[];
}> = ({ completionPercentage = 0, missingFields = [] }) => {
  const navigation = useNavigation<any>();

  const getMessage = () => {
    if (completionPercentage >= 100) return 'Your profile is complete!';
    if (missingFields.length === 0) return 'Unlock more networking opportunities';
    if (missingFields.length === 1) return `Add your ${missingFields[0]} to boost your profile`;
    return `Add ${missingFields.slice(0, 2).join(' and ')} to boost your profile`;
  };

  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-6 mb-4 overflow-hidden">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-x-3 mb-4">
            <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
              <Text className="text-xl">{completionPercentage >= 100 ? '✅' : '🎯'}</Text>
            </View>
            <View>
              <Text className="text-lg font-black text-[#4a3728]">
                {completionPercentage >= 100 ? 'Profile Complete!' : 'Complete Your Profile!'}
              </Text>
              <Text className="text-xs text-[#4a3728]/70">{getMessage()}</Text>
            </View>
          </View>
          {/* Progress bar */}
          <View className="w-full h-3 rounded-full bg-[#f6ede8] mb-5 overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: completionPercentage >= 80 ? '#22c55e' : completionPercentage >= 50 ? '#eab308' : '#ef4444',
              }}
            />
          </View>
          {completionPercentage < 100 && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="self-start bg-[#4a3728] px-6 py-3 rounded-2xl shadow-md"
              onPress={() => navigation.navigate('Profile')}
            >
              <Text className="text-white font-black text-sm">🎯 Boost My Profile</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="items-center ml-4">
          <View className="w-16 h-16 rounded-full bg-[#f6ede8] items-center justify-center shadow-md">
            <Text className="text-xl font-black text-[#4a3728]">{completionPercentage}%</Text>
          </View>
          <Text className="text-[10px] font-bold text-[#4a3728]/60 mt-1">Profile Score</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileCompletionCard;
