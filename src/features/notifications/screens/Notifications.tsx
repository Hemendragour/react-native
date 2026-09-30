import React, { useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Svg, { Path } from 'react-native-svg';
import { useNotifications } from '../../../hooks/notifications/useNotifications';

// Icons
const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#e0245e">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const CommentIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#1da1f2">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#17bf63">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#f5a623">
    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </Svg>
);

export default function Notifications() {
  const navigation = useNavigation<any>();
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <HeartIcon />;
      case 'comment':
      case 'mention': return <CommentIcon />;
      case 'connection': return <UserIcon />;
      case 'study_group_broadcast': return <Text style={{ fontSize: 12 }}>📢</Text>;
      case 'system': return <BellIcon />;
      default: return <BellIcon />;
    }
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }

    const entityType = notif.raw?.entityType;
    const entityId = notif.raw?.entityId;
    const type = notif.raw?.type;

    if (
      type === 'study_group_broadcast' ||
      notif.type === 'study_group_broadcast' ||
      entityType === 'study_group' ||
      notif.raw?.groupId
    ) {
      const targetGroupId = notif.raw?.groupId || entityId;
      const targetGroupName = notif.raw?.groupName || notif.raw?.title || 'Study Room';
      if (targetGroupId) {
        (navigation as any).navigate('Study', {
          screen: 'GroupRoom',
          params: { groupId: targetGroupId, groupName: targetGroupName },
        });
      }
      return;
    }

    if (entityType === 'post' && entityId) {
      navigation.navigate('PostDetail', { postId: entityId });
    } else if (type === 'post_commented' && entityId) {
      // Comment notification — auto-open the comment section
      navigation.navigate('PostDetail', { postId: entityId, openComments: true });
    } else if ((type === 'post_liked' || type === 'post_created') && entityId) {
      navigation.navigate('PostDetail', { postId: entityId });
    } else if (notif.type === 'connection' || type === 'connection_accepted' || type === 'connection_request') {
      const senderId = notif.raw?.senderId;
      if (senderId) {
        navigation.navigate('Profile', { userId: senderId });
      }
    } else if (type === 'profile_view') {
      navigation.navigate('ProfileAnalytics');
    }
  };

  return (
    <View className="flex-1 bg-[#f6ede8]">
      <SafeAreaView className="bg-[#f6ede8]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-[#d4c4b5]/30 bg-[#f6ede8]">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-[#4a3728]/10"
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-xl font-black ml-2 flex-1" style={{ color: '#4a3728', letterSpacing: 0.5 }}>
            Notifications
          </Text>
          {notifications.some(n => !n.isRead) && (
            <TouchableOpacity onPress={markAllAsRead} className="px-3 py-1.5 bg-[#4a3728]/15 rounded-full active:bg-[#4a3728]/25">
              <Text className="text-xs font-bold" style={{ color: '#4a3728' }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={
          <RefreshControl
            refreshing={isLoading && notifications.length > 0}
            onRefresh={fetchNotifications}
            tintColor="#4a3728"
          />
        }
      >
        {isLoading && notifications.length === 0 ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#4a3728" />
            <Text className="text-sm mt-4 font-medium text-[#4a3728]/60">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-sm font-medium text-[#4a3728]/60">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const renderRightActions = () => (
              <View className="flex-row mb-3 rounded-r-2xl overflow-hidden">
                {!notif.isRead && (
                  <TouchableOpacity
                    className="bg-[#8b7355] w-[75px] justify-center items-center"
                    onPress={() => markAsRead(notif.id)}
                  >
                    <Text className="text-[#f6ede8] font-bold text-xs text-center px-1">Mark Read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="bg-red-600 w-[75px] justify-center items-center"
                  onPress={() => deleteNotification(notif.id)}
                >
                  <Text className="text-white font-bold text-xs">Delete</Text>
                </TouchableOpacity>
              </View>
            );

            return (
              <Swipeable key={notif.id} renderRightActions={renderRightActions} overshootRight={false}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleNotificationPress(notif)}
                  className={`flex-row p-3.5 mb-3 rounded-2xl border shadow-sm ${notif.isRead ? 'border-[#d4c4b5]/60 bg-[#ede0d4]' : 'border-[#4a3728]/25 bg-[#e2cfc0]'
                    }`}
                >
                  <View className="relative mr-3">
                    <Image
                      source={{ uri: notif.actor?.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                      className="w-12 h-12 rounded-full border border-[#d4c4b5]/70 bg-[#4a3728]/10"
                    />
                    <View className="absolute -bottom-1 -right-1 bg-[#f6ede8] rounded-full p-[2px] shadow-sm">
                      {getNotificationIcon(notif.type)}
                    </View>
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="text-[15px] leading-5 text-[#4a3728]">
                      <Text className="font-bold">{notif.actor?.name}</Text> {notif.content}
                    </Text>
                    {notif.type === 'study_group_broadcast' && (
                      <Text className="text-xs font-bold text-[#8b5cf6] mt-0.5">
                        👉 Tap to enter live study room
                      </Text>
                    )}
                    <Text className="text-xs mt-1 font-medium text-[#4a3728]/60">
                      {notif.time}
                    </Text>
                  </View>

                  {!notif.isRead && (
                    <View className="w-2.5 h-2.5 rounded-full bg-[#4a3728] self-center ml-2" />
                  )}
                </TouchableOpacity>
              </Swipeable>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}