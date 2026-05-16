// features/home/components/sidebar/MyGroups.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

// ─── Icon ─────────────────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GroupIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 0a3 3 0 100-6 3 3 0 000 6zm4 10v-2a3 3 0 00-2.2-2.9" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Dummy data ───────────────────────────────────────────────────────────────

export const GROUPS_DATA = [
  { id: '1', name: 'The Squad',  members: '5K', description: 'A group for the core team', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'The A-team', members: '8K', description: 'High performance professionals', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Tech 2k25',  members: '7K', description: 'Latest in tech for 2025', avatar: 'https://i.pravatar.cc/150?img=3' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const MyGroups: React.FC = () => {
  // const navigation = useNavigation<any>();

  return (
    <View className="mx-3 mt-3">

      {/* Section header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-[#4a3728] text-base font-black">My Groups</Text>
        <TouchableOpacity
          // onPress={() => navigation.navigate('MyGroupsScreen')}
          activeOpacity={0.7}
        >
          <Text className="text-xs font-semibold" style={{ color: '#6b5643' }}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Group rows */}
      {GROUPS_DATA.map((group) => (
        <TouchableOpacity
          key={group.id}
          className="flex-row items-center justify-between bg-white/40 rounded-xl px-3 py-3 mb-2 border-2 border-dashed border-[#d4c4b5]"
          // onPress={() => navigation.navigate('MyGroupsScreen', { groupId: group.id })}
          activeOpacity={0.75}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-brand-dark/10 items-center justify-center">
              <GroupIcon />
            </View>
            <View>
              <Text className="text-[#6b5038] text-sm font-bold">{group.name}</Text>
              <Text className="text-[#6b5038] text-xs">{group.members} members</Text>
            </View>
          </View>
          <ChevronIcon />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MyGroups;