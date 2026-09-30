import React from 'react';
import { View } from 'react-native';

const PersonCardLoader: React.FC = () => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 items-center ">
    <View className="w-14 h-14 rounded-full bg-[#e0d8cf] mb-3" />
    <View className="w-20 h-4 bg-[#e0d8cf] rounded mb-2" />
    <View className="w-full h-3 bg-[#e0d8cf] rounded mb-1" />
    <View className="w-4/5 h-3 bg-[#e0d8cf] rounded mb-3" />
    <View className="w-full h-8 bg-[#e0d8cf] rounded-xl" />
  </View>
);

export default PersonCardLoader;
