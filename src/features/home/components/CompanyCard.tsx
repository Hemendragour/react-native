import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

const CompanyCard: React.FC = () => {
  const stats = [
    { label: 'Page Explore', value: '567' },
    { label: 'Followers', value: '5.3k' },
    { label: 'Rating', value: '4.8★' },
  ];

  return (
    <View className="bg-[#f6ede8]/95 rounded-3xl shadow-xl border border-[#4a3728]/20 overflow-hidden">

      {/* Cover Image */}
      <View className="h-28 overflow-hidden">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=200&fit=crop' }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Gradient overlay */}
        <View className="absolute inset-0 bg-black/40" />
      </View>

      {/* Content */}
      <View className="px-5 pb-5">
        {/* Logo */}
        <View className="items-center -mt-10 mb-3">
          <View className="w-20 h-20 rounded-2xl bg-white shadow-xl p-2 border-4 border-[#f6ede8]">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop' }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Name & Info */}
        <View className="items-center mb-4">
          <Text className="text-xl font-black text-[#4a3728] mb-1">TechCorp Solutions</Text>
          <Text className="text-sm font-semibold text-[#6b5643] mb-1">Innovation & Technology</Text>
          <Text className="text-xs text-[#4a3728]/60">📍 San Francisco, CA • Est. 2015</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-x-2 mb-4">
          {stats.map((stat, idx) => (
            <View
              key={idx}
              className="flex-1 bg-[#e0d8cf]/60 rounded-xl py-2.5 items-center"
            >
              <Text className="text-base font-black text-[#6b5643]">{stat.value}</Text>
              <Text className="text-[10px] text-[#4a3728]/70 mt-0.5 text-center">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            activeOpacity={0.85}
            className="flex-1 bg-[#4a3728] py-3 rounded-xl items-center shadow-md"
          >
            <Text className="text-white font-bold text-sm">Visit Website</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            className="flex-1 py-3 rounded-xl items-center border-2 border-[#4a3728]/30"
          >
            <Text className="text-[#4a3728] font-bold text-sm">Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CompanyCard;