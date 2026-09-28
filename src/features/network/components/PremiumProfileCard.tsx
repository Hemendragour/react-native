import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PremiumUser } from '../types/network.types';

const PremiumProfileCard: React.FC<{ user: PremiumUser }> = ({ user }) => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 w-full">
    <View className="flex-row items-center justify-between mb-3">
      <Image source={{ uri: user.img }} className="w-12 h-12 rounded-full border-2 border-amber-300" resizeMode="cover" />
      <View className="bg-amber-100 px-2 py-0.5 rounded-full">
        <Text className="text-[9px] font-bold text-amber-800">⭐ {user.badge}</Text>
      </View>
    </View>
    <Text className="font-bold text-sm text-[#4a3728] mb-0.5" numberOfLines={1}>{user.name}</Text>
    <Text className="text-[10px] text-[#4a3728]/80 font-medium mb-1" numberOfLines={2}>{user.title}</Text>
    <Text className="text-[9px] text-[#4a3728]/60 mb-2">{user.stats}</Text>
    <View className="flex-row flex-wrap gap-1 mb-3">
      {user.achievements.slice(0, 2).map((a, i) => (
        <View key={i} className="bg-[#e0d8cf] px-2 py-0.5 rounded-full">
          <Text className="text-[9px] font-medium text-[#4a3728]">{a}</Text>
        </View>
      ))}
    </View>
    <TouchableOpacity activeOpacity={0.85} className="w-full py-2 rounded-xl bg-[#4a3728] items-center">
      <Text className="text-white text-[10px] font-bold">⭐ View Profile</Text>
    </TouchableOpacity>
  </View>
);

export default PremiumProfileCard;
