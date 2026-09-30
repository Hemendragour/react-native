import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { PremiumUser } from '../types/network.types';
import PremiumProfileCard from './PremiumProfileCard';

const C = { dark: '#4a3728' };

const PremiumSpotlight: React.FC<{ profiles: PremiumUser[] }> = ({ profiles }) => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
    <View className="flex-row items-center gap-x-3 mb-5">
      <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
        <Star size={22} color={C.dark} />
      </View>
      <Text className="text-2xl font-black text-[#4a3728]">Premium Spotlight</Text>
    </View>
    <View className="flex-row flex-wrap justify-between gap-3">
      {profiles.map((u, i) => (
        <View key={i} className="w-[48%] mb-3">
          <PremiumProfileCard user={u} />
        </View>
      ))}
    </View>
  </View>
);

export default PremiumSpotlight;
