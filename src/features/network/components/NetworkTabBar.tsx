import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabType } from '../types/network.types';

const NetworkTabBar: React.FC<{ activeTab: TabType; setActiveTab: (t: TabType) => void }> = ({ activeTab, setActiveTab }) => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
    <View className="flex-row gap-x-8">
      {(['grow', 'catchup'] as TabType[]).map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
          <Text className={`font-black text-lg text-[#4a3728] pb-3 ${activeTab !== tab ? 'opacity-50' : ''}`}>
            {tab === 'grow' ? 'Grow' : 'Catch Up'}
          </Text>
          {activeTab === tab && (
            <View className="h-1 rounded-full bg-[#4a3728] -mt-1" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default NetworkTabBar;
