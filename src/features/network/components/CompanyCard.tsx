import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Company } from '../types/network.types';

const CompanyCard: React.FC<{
  company: Company;
  isFollowing: boolean;
  onFollow: (id: string) => void;
}> = ({ company, isFollowing, onFollow }) => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 items-center">
    <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md mb-3 bg-white">
      <Image source={{ uri: company.image }} className="w-full h-full" resizeMode="contain"
        defaultSource={{ uri: 'https://via.placeholder.com/56' }} />
    </View>
    <Text className="font-bold text-sm text-[#4a3728] text-center mb-0.5" numberOfLines={1}>{company.name}</Text>
    <Text className="text-[10px] text-[#4a3728]/75 font-medium text-center mb-1 leading-3" numberOfLines={2}>{company.industry}</Text>
    <View className="flex-row items-center gap-x-1 mb-1">
      <View className="w-1.5 h-1.5 rounded-full bg-[#4a3728]" />
      <Text className="text-[9px] text-[#4a3728]/60 font-medium" numberOfLines={1}>{company.location}</Text>
    </View>
    <Text className="text-[9px] text-[#4a3728]/50 font-medium mb-1">{company.employees}</Text>
    {company.followersCount !== undefined && (
      <Text className="text-[9px] text-[#4a3728]/50 font-medium mb-3">
        {(company.followersCount / 1000000).toFixed(1)}M followers
      </Text>
    )}
    <TouchableOpacity onPress={() => !isFollowing && onFollow(company.id)}
      disabled={isFollowing} activeOpacity={0.85}
      className={`w-full py-2 rounded-xl items-center ${isFollowing ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'}`}>
      <Text className={`text-xs font-bold ${isFollowing ? 'text-white' : 'text-[#4a3728]'}`}>
        {isFollowing ? '✓ Following' : '⭐ Follow'}
      </Text>
    </TouchableOpacity>
  </View>
);

export default CompanyCard;
