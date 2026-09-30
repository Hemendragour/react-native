import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchMyGroups } from '../../study/store/groupsSlice';

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

const MyGroups: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(s => s.groups.items);

  useEffect(() => {
    dispatch(fetchMyGroups());
  }, [dispatch]);

  const displayGroups = groups.slice(0, 5);

  return (
    <View className="mx-3 mt-3">
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        <Text className="text-[#2c1d11] text-base font-black tracking-tight">My Groups</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Study', { screen: 'MyGroups' })}
          activeOpacity={0.7}
        >
          <Text className="text-xs font-bold" style={{ color: '#6b5643' }}>See all →</Text>
        </TouchableOpacity>
      </View>

      {/* Group rows */}
      {displayGroups.length === 0 ? (
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white/70 rounded-2xl px-3 py-4 mb-2 border border-[#4a3728]/10"
          onPress={() => navigation.navigate('Study', { screen: 'MyGroups' })}
          activeOpacity={0.75}
        >
          <Text className="text-[#6b5643] text-xs font-semibold">No groups joined yet — Tap to browse</Text>
        </TouchableOpacity>
      ) : (
        displayGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            className="flex-row items-center justify-between bg-white/80 rounded-2xl px-3 py-3 mb-2 border border-[#4a3728]/10 active:bg-white"
            onPress={() => navigation.navigate('Study', { screen: 'GroupRoom', params: { groupId: group.id, groupName: group.title } })}
            activeOpacity={0.75}
          >
            <View className="flex-row items-center gap-3 flex-1 mr-2">
              <View className="w-10 h-10 rounded-xl bg-[#4a3728]/10 items-center justify-center border border-[#4a3728]/10">
                <GroupIcon />
              </View>
              <View className="flex-1">
                <Text className="text-[#2c1d11] text-sm font-bold" numberOfLines={1}>{group.title}</Text>
                <Text className="text-[#6b5643] text-xs font-medium">{group.members} members</Text>
              </View>
            </View>
            <ChevronIcon />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default MyGroups;
