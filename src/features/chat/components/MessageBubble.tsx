import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const PinIcon = ({ isSentByMe }: { isSentByMe: boolean }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
    <Path d="M16 3l5 5m-5-5L6 13v6l-4 4m14-20l-5 5m5-5v6L6 19" stroke={isSentByMe ? "#f6ede8" : "#4a3728"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface MessageBubbleProps {
  id: string;
  text: string;
  timestamp: string;
  isSentByMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isPinned?: boolean;
  reactions?: { emoji: string; count: number }[];
  type?: string;
  mediaUrl?: string;
  onLongPress?: () => void;
  onImagePress?: () => void;
}

export default function MessageBubble({
  text,
  timestamp,
  isSentByMe,
  status,
  isPinned,
  reactions,
  type,
  mediaUrl,
  onLongPress,
  onImagePress
}: MessageBubbleProps) {
  return (
    <View className={`mb-4 flex-row ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={onLongPress}
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isSentByMe
            ? 'bg-[#4a3728] rounded-tr-sm'
            : 'bg-[#e0d8cf] border border-[#4a3728]/10 rounded-tl-sm'
        }`}
      >
        {isPinned && (
          <View className="flex-row items-center mb-1 opacity-80">
            <PinIcon isSentByMe={isSentByMe} />
            <Text className={`text-[10px] ml-1 font-bold ${isSentByMe ? 'text-[#f6ede8]' : 'text-[#4a3728]'}`}>Pinned</Text>
          </View>
        )}
        
        {type === 'image' && mediaUrl ? (
          <TouchableOpacity activeOpacity={0.9} onPress={onImagePress} className="relative rounded-lg overflow-hidden my-1">
            <Image 
              source={{ uri: mediaUrl }} 
              className="w-48 h-48 bg-black/10"
              resizeMode="cover"
            />
            {status === 'sending' && (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        {!!text && (
          <Text className={`text-[15px] font-medium ${isSentByMe ? 'text-[#f6ede8]' : 'text-[#4a3728]'}`}>
            {text}
          </Text>
        )}
        
        <View className={`flex-row items-center justify-end mt-1 ${isSentByMe ? 'opacity-80' : 'opacity-60'}`}>
          <Text className={`text-[10px] font-bold ${isSentByMe ? 'text-[#f6ede8]' : 'text-[#4a3728]'}`}>
            {timestamp}
          </Text>
          {isSentByMe && status && status !== 'sending' && (
            <Text className="text-[10px] text-[#f6ede8] ml-1 font-bold">
              {status === 'read' ? '••' : '•'}
            </Text>
          )}
          {isSentByMe && status === 'sending' && (
            <Text className="text-[10px] text-[#f6ede8] ml-1 font-bold">
              ...
            </Text>
          )}
        </View>
        
        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <View className={`absolute -bottom-3 flex-row ${isSentByMe ? 'right-2' : 'left-2'}`}>
            {reactions.map((r, i) => (
              <View key={i} className="bg-[#f6ede8] border border-[#e0d8cf] rounded-full px-1.5 py-0.5 flex-row items-center ml-1">
                <Text className="text-[10px]">{r.emoji}</Text>
                {r.count > 1 && <Text className="text-[9px] text-[#4a3728] ml-0.5 font-bold">{r.count}</Text>}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
