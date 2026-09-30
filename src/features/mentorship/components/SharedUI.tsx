import React from 'react';
import { View, Text } from 'react-native';

const C = { dark: '#4a3728', mid: '#7a5c3e', light: '#8b7355', bg: '#f6ede8', surface: '#fbf7f3', border: '#e0d8cf' };

export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <View className="flex-row items-center gap-x-3 mb-6">
    <View className="w-11 h-11 rounded-xl items-center justify-center shadow-md" style={{ backgroundColor: C.dark }}>{icon}</View>
    <View>
      <Text className="text-2xl font-bold text-[#4a3728]">{title}</Text>
      <Text className="text-sm text-[#8a7a6a]">{subtitle}</Text>
    </View>
  </View>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <View className={`bg-white rounded-2xl p-5 shadow-md border-2 border-[#e0d8cf] ${className}`}>{children}</View>
);
