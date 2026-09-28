import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { X, Users, MessageSquarePlus } from 'lucide-react-native';
import { Person } from '../types/network.types';

const C = { dark: '#4a3728', mid: '#7a5c3e' };

const PersonCard: React.FC<{
  person: Person;
  isConnected: boolean;
  onConnect: (id: string) => void;
  onConnectWithNote?: (person: Person) => void;
  onDismiss?: (id: string) => void;
  onMutualPress?: (person: Person) => void;
  onProfilePress?: (id: string) => void;
}> = ({
  person,
  isConnected,
  onConnect,
  onConnectWithNote,
  onDismiss,
  onMutualPress,
  onProfilePress,
}) => {
  const targetId = person.userId || person.id;

  return (
    <View className="bg-[#f6ede8] rounded-2xl shadow-sm p-4 items-center w-full relative border border-[#4a3728]/10">
      {/* Dismiss Button */}
      {onDismiss && !isConnected && (
        <TouchableOpacity
          onPress={() => onDismiss(targetId)}
          activeOpacity={0.7}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#e0d8cf]/80 items-center justify-center"
        >
          <X size={12} color={C.dark} />
        </TouchableOpacity>
      )}

      {/* Profile Press Area */}
      <TouchableOpacity
        className="items-center w-full"
        onPress={() => onProfilePress && onProfilePress(targetId)}
        activeOpacity={0.8}
      >
        <View className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm mb-2.5 bg-[#e0d8cf]">
          <Image
            source={{
              uri:
                person.image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  person.name || 'User'
                )}&background=e0d8cf&color=4a3728&size=128`,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text className="font-bold text-sm text-[#4a3728] text-center mb-0.5" numberOfLines={1}>
          {person.name}
        </Text>
        <Text
          className="text-[10px] text-[#4a3728]/75 font-medium text-center mb-1 leading-3 min-h-[24px]"
          numberOfLines={2}
        >
          {person.title}
        </Text>
        {person.location ? (
          <View className="flex-row items-center gap-x-1 mb-1">
            <View className="w-1.5 h-1.5 rounded-full bg-[#4a3728]" />
            <Text className="text-[9px] text-[#4a3728]/60 font-medium" numberOfLines={1}>
              {person.location}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Mutual Connections Button */}
      {person.mutuals ? (
        <TouchableOpacity
          onPress={() => onMutualPress && onMutualPress(person)}
          activeOpacity={0.7}
          className="flex-row items-center gap-x-1 mb-2.5 px-2 py-0.5 rounded-full bg-[#e0d8cf]/50"
        >
          <Users size={10} color={C.mid} />
          <Text className="text-[9px] text-[#7a5c3e] font-bold" numberOfLines={1}>
            {person.mutuals}
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="h-5" />
      )}

      {/* Connect Buttons */}
      <View className="flex-row items-center gap-x-1.5 w-full">
        <TouchableOpacity
          onPress={() => !isConnected && onConnect(targetId)}
          disabled={isConnected}
          activeOpacity={0.85}
          className={`flex-1 py-2 rounded-xl items-center ${
            isConnected ? 'bg-[#4a3728]' : 'bg-[#e0d8cf] border border-[#4a3728]/30'
          }`}
        >
          <Text className={`text-xs font-bold ${isConnected ? 'text-white' : 'text-[#4a3728]'}`}>
            {isConnected ? '✓ Sent' : '✨ Connect'}
          </Text>
        </TouchableOpacity>

        {onConnectWithNote && !isConnected && (
          <TouchableOpacity
            onPress={() => onConnectWithNote(person)}
            activeOpacity={0.7}
            className="p-2 rounded-xl bg-[#e0d8cf] border border-[#4a3728]/30 items-center justify-center"
          >
            <MessageSquarePlus size={14} color={C.dark} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PersonCard;

