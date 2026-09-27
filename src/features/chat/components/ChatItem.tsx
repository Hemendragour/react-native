import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface ChatItemProps {
  id: string;
  name: string;
  headline?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isArchived?: boolean;
  onPress: () => void;
  onMarkUnread?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export default function ChatItem({
  name,
  headline,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  isArchived = false,
  onPress,
  onMarkUnread,
  onArchive,
  onDelete,
}: ChatItemProps) {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e0d8cf&color=4a3728&size=128`;
  const [imgSrc, setImgSrc] = React.useState(avatar && avatar.startsWith('http') && !avatar.includes('pixabay.com') ? avatar : fallbackAvatar);

  React.useEffect(() => {
    setImgSrc(avatar && avatar.startsWith('http') && !avatar.includes('pixabay.com') ? avatar : fallbackAvatar);
  }, [avatar, fallbackAvatar]);

  const renderRightActions = () => (
    <View className="flex-row">
      <TouchableOpacity 
        className="bg-[#8b7355] w-[75px] justify-center items-center"
        onPress={onMarkUnread}
      >
        <Text className="text-[#f6ede8] font-bold text-[11px] text-center px-1">
          {unreadCount > 0 ? 'Mark Read' : 'Mark Unread'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="bg-[#4a3728] w-[75px] justify-center items-center"
        onPress={onArchive}
      >
        <Text className="text-[#f6ede8] font-bold text-xs">{isArchived ? 'Unarchive' : 'Archive'}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="bg-red-600 w-[75px] justify-center items-center"
        onPress={onDelete}
      >
        <Text className="text-white font-bold text-xs">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 border-b border-[#e0d8cf] bg-[#f6ede8]"
        activeOpacity={0.7}
        onPress={onPress}
      >
      <View className="relative mr-3">
        <Image
          source={{ uri: imgSrc }}
          className="w-14 h-14 rounded-full border border-[#4a3728]/20"
          onError={() => setImgSrc(fallbackAvatar)}
        />
        {isOnline && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#f6ede8] rounded-full" />
        )}
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-bold text-[#4a3728]" numberOfLines={1}>
            {name}
          </Text>
          {timestamp && (
            <Text className="text-xs text-[#4a3728] opacity-60 font-medium">
              {timestamp}
            </Text>
          )}
        </View>

        {headline && (
          <Text className="text-xs text-[#4a3728] opacity-80 mb-0.5 font-medium" numberOfLines={1}>
            {headline}
          </Text>
        )}

        <View className="flex-row justify-between items-center">
          <Text 
            className={`text-sm flex-1 mr-2 ${unreadCount > 0 ? 'font-bold text-[#4a3728]' : 'text-[#4a3728] opacity-60'}`} 
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          
          {unreadCount > 0 && (
            <View className="bg-[#4a3728] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
              <Text className="text-[#f6ede8] text-[10px] font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    </Swipeable>
  );
}
