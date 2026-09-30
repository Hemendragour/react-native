import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ConnectionRequest } from '../types/network.types';

const ConnectionRequestCard: React.FC<{
  user: ConnectionRequest;
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
  onProfilePress?: (userId: string) => void;
  showActions?: boolean;
}> = ({ user, onAccept, onIgnore, onProfilePress, showActions = true }) => (
  <View className="flex-row items-center justify-between p-4 rounded-2xl shadow-md bg-[#f6ede8] mb-3">
    <TouchableOpacity 
      className="flex-row items-center gap-x-3 flex-1"
      onPress={() => onProfilePress && onProfilePress((user as any).userId || user.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: user.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }} className="w-12 h-12 rounded-full bg-[#e0d8cf]" resizeMode="cover" />
      <View className="flex-1">
        <Text className="font-bold text-sm text-[#4a3728]" numberOfLines={1}>{user.name}</Text>
        <Text className="text-xs text-[#4a3728]/70 font-medium" numberOfLines={1}>{user.title}</Text>
        <Text className="text-[10px] text-[#4a3728]/50" numberOfLines={1}>{user.mutuals}</Text>
      </View>
    </TouchableOpacity>
    {showActions && (
      <View className="flex-row gap-x-2 ml-2">
        <TouchableOpacity onPress={() => onIgnore(user.id)} activeOpacity={0.8}
          className="px-3 py-1.5 rounded-xl border border-[#4a3728]">
          <Text className="text-xs font-bold text-[#4a3728]">Ignore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAccept(user.id)} activeOpacity={0.85}
          className="px-3 py-1.5 rounded-xl bg-[#4a3728]">
          <Text className="text-xs font-bold text-white">Accept</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

export default ConnectionRequestCard;
