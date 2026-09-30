import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator, RefreshControl, ScrollView, Platform, StatusBar, Modal, Alert, LayoutAnimation, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Svg, { Path } from 'react-native-svg';
import { MessageService } from '../../../services/message.service';
import AuthService, { api } from '../../../services/auth.service';
import FeedService from '../../../services/feed.service';
import { onMessageNew } from '../../../services/socket.service';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12h.01M12 16h.01M12 8h.01M12 12a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm0-8a1 1 0 110-2 1 1 0 010 2z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WriteIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckAllIcon = ({ color = '#4a3728' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12l5 5L17 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l5 5L22 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BellOffIcon = ({ color = '#4a3728' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M18 8a6 6 0 00-9.33-5M1 1l22 22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArchiveIcon = ({ color = '#4a3728' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FilterIcon = ({ color = '#4a3728' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = ({ color = '#dc2626' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ color = '#4a3728' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

type FilterType = 'all' | 'unread' | 'focused' | 'jobs' | 'other' | 'archived';

const userProfileCache: Record<string, any> = {};

const resolveUserFullProfile = async (userId: string): Promise<{
  userId: string;
  name: string;
  avatar: string;
  headline: string;
}> => {
  if (!userId || typeof userId !== 'string') {
    return { userId: '', name: 'Throne8 Member', avatar: '', headline: '' };
  }

  if (userProfileCache[userId] && userProfileCache[userId].avatar && userProfileCache[userId].name) {
    return userProfileCache[userId];
  }

  const feedCached = FeedService.getUserFromCache(userId);
  let cachedPhoto = feedCached?.avatar || '';
  let cachedName = feedCached?.name || '';
  let cachedHeadline = feedCached?.headline || '';

  try {
    const [profileRes, photosRes] = await Promise.allSettled([
      AuthService.getUserProfileById(userId),
      api.get(`/api/v1/profile/profile-photo/get-all-photos/${userId}`).catch(() => api.get(`/api/v1/profile/profile-photo/user/${userId}/active`))
    ]);

    const rawData = profileRes.status === 'fulfilled' ? (profileRes.value?.data?.data || profileRes.value?.data || profileRes.value) : {};
    const p = rawData?.profile || {};
    const account = rawData?.user || rawData?.data || rawData || {};
    const combined = { ...account, ...p };

    const firstName = combined.firstName || '';
    const lastName = combined.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || combined.name || combined.username || combined.displayName || cachedName || 'Throne8 Member';
    const headline = combined.headline || combined.bio || combined.role || combined.title || cachedHeadline || '';

    let photoUrl = '';
    if (photosRes.status === 'fulfilled' && photosRes.value?.data) {
      const pData = photosRes.value.data?.data || photosRes.value.data || [];
      const photosArray = Array.isArray(pData) ? pData : pData.photos || (pData.cloudinarySecureUrl ? [pData] : []);
      const activePhoto = Array.isArray(photosArray)
        ? photosArray.find((ph: any) => ph.isActive || ph.active) || photosArray[0]
        : null;
      if (activePhoto) {
        photoUrl = activePhoto.cloudinarySecureUrl || activePhoto.cloudinaryUrl || activePhoto.url || activePhoto.imageUrl || '';
      }
    }

    if (!photoUrl) {
      const possibleDirectUrl = combined.profileImage || combined.avatar || combined.profilePicture || combined.image || combined.photo || cachedPhoto;
      if (possibleDirectUrl && typeof possibleDirectUrl === 'string' && possibleDirectUrl.startsWith('http') && !possibleDirectUrl.includes('pixabay.com')) {
        photoUrl = possibleDirectUrl;
      }
    }

    const photoId = combined.profilePhotoId || combined.photoId || rawData?.profilePhotoId;
    if (!photoUrl && photoId && typeof photoId === 'string' && photoId.length > 5) {
      try {
        const singlePhotoRes = await AuthService.getProfilePhotoById(photoId);
        const spData = singlePhotoRes?.data?.photo || singlePhotoRes?.data || singlePhotoRes;
        photoUrl = spData?.cloudinarySecureUrl || spData?.cloudinaryUrl || spData?.url || spData?.imageUrl || '';
      } catch (_) {}
    }

    const finalAvatar = (photoUrl && photoUrl.startsWith('http'))
      ? photoUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;

    const result = {
      userId,
      name: fullName,
      avatar: finalAvatar,
      headline,
    };
    userProfileCache[userId] = result;
    return result;
  } catch (err) {
    const fallbackName = cachedName || 'Throne8 Member';
    const fallback = {
      userId,
      name: fallbackName,
      avatar: (cachedPhoto && cachedPhoto.startsWith('http')) ? cachedPhoto : `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=e0d8cf&color=4a3728&size=128`,
      headline: cachedHeadline || '',
    };
    userProfileCache[userId] = fallback;
    return fallback;
  }
};

const getOtherUserId = (conv: any, myId: string | undefined): string | null => {
  if (!conv) return null;
  const members = conv.members || conv.populatedMembers || conv.participants || [];
  for (const m of members) {
    const id = typeof m === 'object' && m !== null ? (m.userId || m._id || m.id) : m;
    if (id && String(id) !== String(myId)) {
      return String(id);
    }
  }
  if (conv.targetUserId && String(conv.targetUserId) !== String(myId)) return String(conv.targetUserId);
  if (conv.targetUser?._id && String(conv.targetUser._id) !== String(myId)) return String(conv.targetUser._id);
  if (conv.otherUser?._id && String(conv.otherUser._id) !== String(myId)) return String(conv.otherUser._id);
  if (conv.recipient?._id && String(conv.recipient._id) !== String(myId)) return String(conv.recipient._id);
  if (conv.lastMessage?.senderId && String(conv.lastMessage.senderId) !== String(myId)) return String(conv.lastMessage.senderId);
  return null;
};

const getOtherUser = (conv: any, myId: string | undefined) => {
  if (!conv) return {};

  const populatedMembers: any[] = conv.populatedMembers || conv.members || [];
  const participants: any[] = conv.participants || [];

  for (const m of populatedMembers) {
    if (typeof m === 'object' && m !== null) {
      const mId = m.userId || m._id || m.id;
      if (myId && String(mId) === String(myId)) continue;
      if (m.firstName || m.lastName || m.name || m.username || m.profileImage || m.avatar) return m;
    }
  }

  for (const p of participants) {
    const userObj = p.user || p.profile || p;
    if (typeof userObj === 'object' && userObj !== null) {
      const pId = userObj._id || userObj.id || userObj.userId || p.userId || p._id || p.id;
      if (myId && String(pId) === String(myId)) continue;
      return userObj;
    }
  }

  if (conv.targetUser && typeof conv.targetUser === 'object') return conv.targetUser;
  if (conv.otherUser && typeof conv.otherUser === 'object') return conv.otherUser;
  if (conv.recipient && typeof conv.recipient === 'object') return conv.recipient;

  return {};
};

const ConversationAvatar = ({ uri, name, isOnline }: { uri: string; name: string; isOnline?: boolean }) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e0d8cf&color=4a3728&size=128`;
  const [imgSrc, setImgSrc] = React.useState(uri && uri.startsWith('http') ? uri : fallback);

  React.useEffect(() => {
    setImgSrc(uri && uri.startsWith('http') ? uri : fallback);
  }, [uri, fallback]);

  return (
    <View className="relative">
      <Image 
        source={{ uri: imgSrc }} 
        className="w-14 h-14 rounded-full bg-[#4a3728]/10" 
        onError={() => setImgSrc(fallback)}
      />
      {isOnline && (
        <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#f6ede8]" />
      )}
    </View>
  );
};

export default function MessagesListScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notifMuted, setNotifMuted] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Focused', value: 'focused' },
    { label: 'Jobs', value: 'jobs' },
    { label: 'Other', value: 'other' },
    { label: 'Archived', value: 'archived' },
  ];

  const fetchConversations = async () => {
    try {
      const res = await MessageService.getConversations();
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (res.data && Array.isArray(res.data)) data = res.data;
      else if (res.data && Array.isArray(res.data.conversations)) data = res.data.conversations;
      else if (res.conversations && Array.isArray(res.conversations)) data = res.conversations;
      
      const currentUser = AuthService.getCurrentUser() as any;
      const myId = currentUser?.userId || currentUser?.id || currentUser?._id;

      setConversations(data);

      const missingUserIds: string[] = [];
      for (const conv of data) {
        const otherUserId = getOtherUserId(conv, myId);
        if (otherUserId && !userProfileCache[otherUserId]) {
          missingUserIds.push(otherUserId);
        }
      }

      if (missingUserIds.length > 0) {
        await Promise.allSettled(
          missingUserIds.map((uid) => resolveUserFullProfile(uid))
        );
        setConversations([...data]);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchUserQuery(query);
    if (!query || query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    
    try {
      setSearchingUsers(true);
      const res = await AuthService.searchUsers(query);
      if (res && Array.isArray(res.data?.users)) {
        setSearchedUsers(res.data.users);
      } else if (res && Array.isArray(res.users)) {
        setSearchedUsers(res.users);
      } else if (Array.isArray(res)) {
        setSearchedUsers(res);
      } else if (res && Array.isArray(res.data)) {
        setSearchedUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const startNewChat = (user: any) => {
    setShowNewChat(false);
    setSearchUserQuery('');
    setSearchedUsers([]);
    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
    const rawAvatar = user.profileImage || user.avatar || user.profilePicture || user.photo || '';
    const avatar = (rawAvatar && typeof rawAvatar === 'string' && rawAvatar.startsWith('http'))
      ? rawAvatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;

    navigation.navigate('Chat', {
      userId: user.userId || user._id || user.id,
      userName: fullName,
      userAvatar: avatar,
      userRole: user.headline || user.role || user.title || ''
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      
      const unsubMessageNew = onMessageNew((newMessage: any) => {
        // Fetch conversations to reflect updated last message and unread count instantly
        fetchConversations();
      });

      return () => {
        unsubMessageNew();
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formattedChats = conversations.map(conv => {
    const currentUser = AuthService.getCurrentUser() as any;
    const myId = currentUser?.userId || currentUser?.id || currentUser?._id;
    const otherUserId = getOtherUserId(conv, myId);
    const cachedProfile = otherUserId ? (userProfileCache[otherUserId] || FeedService.getUserFromCache(otherUserId)) : null;
    const otherUser = getOtherUser(conv, myId);

    const firstName = otherUser.firstName || '';
    const lastName = otherUser.lastName || '';
    const initialFullName = `${firstName} ${lastName}`.trim() || otherUser.name || otherUser.username || otherUser.displayName || '';

    const fullName = cachedProfile?.name || initialFullName || 'Throne8 Member';
    const headline = cachedProfile?.headline || otherUser.headline || otherUser.bio || otherUser.role || otherUser.title || '';

    let avatar = cachedProfile?.avatar || otherUser.profileImage || otherUser.avatar || otherUser.profilePicture || otherUser.image || otherUser.photo || '';
    if (!avatar || typeof avatar !== 'string' || (!avatar.startsWith('http') && avatar.length > 20)) {
      avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;
    }

    return {
      id: conv.conversationId || conv._id || conv.id,
      targetUserId: otherUserId || otherUser.userId || otherUser._id || otherUser.id,
      name: fullName,
      headline: headline,
      avatar: avatar,
      lastMessage: conv.lastMessage?.text || conv.lastMessage?.content || (conv.lastMessage?.type === 'image' ? '📷 Photo' : conv.lastMessage?.type === 'voice' ? '🎙️ Voice note' : 'Start conversation'),
      time: conv.lastMessage?.createdAt || conv.lastMessage?.sentAt ? new Date(conv.lastMessage.createdAt || conv.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (conv.createdAt ? new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
      unreadCount: typeof conv.unreadCount === 'number' ? conv.unreadCount : (conv.unreadCount && conv.unreadCount[myId || ''] || 0),
      isOnline: conv.isOnline || otherUser.isOnline || false,
      category: conv.category || 'focused',
      isArchived: conv.isArchived || false
    };
  });

  const filteredChats = formattedChats.filter(chat => {
    if (activeFilter === 'archived') {
      if (!chat.isArchived) return false;
    } else {
      if (chat.isArchived) return false;
      
      if (activeFilter === 'unread') {
        if (chat.unreadCount === 0) return false;
      } else if (activeFilter !== 'all') {
        if (chat.category !== activeFilter) return false;
      }
    }

    if (!searchQuery) return true;
    return chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleArchive = async (chatId: string, currentStatus: boolean) => {
    // Optimistic update
    setConversations(prev => prev.map(c => {
      const cid = c.conversationId || c._id || c.id;
      if (cid === chatId) return { ...c, isArchived: !currentStatus };
      return c;
    }));
    try {
      await MessageService.archiveConversation(chatId, !currentStatus);
    } catch (e) {
      console.error('Failed to archive chat', e);
      fetchConversations(); // revert on failure
    }
  };

  const handleDelete = (chatId: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Smoothly animate the removal of the item from the list
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            
            // Remove locally
            setConversations(prev => prev.filter(c => (c.conversationId || c._id || c.id) !== chatId));
            
            try {
              await MessageService.deleteConversation(chatId);
            } catch (e) {
              console.error('Failed to delete chat', e);
              // Revert if API fails
              fetchConversations();
            }
          }
        }
      ]
    );
  };

  const handleToggleRead = async (chatId: string, unreadCount: number) => {
    const isUnread = unreadCount > 0;
    // Optimistic UI
    setConversations(prev => prev.map(c => {
      const cid = c.conversationId || c._id || c.id;
      if (cid === chatId) {
        return { ...c, unreadCount: isUnread ? 0 : 1 }; // toggle
      }
      return c;
    }));
    try {
      if (isUnread) {
         await MessageService.markConversationSeen(chatId);
      } else {
         await MessageService.markConversationUnread(chatId);
      }
    } catch (e) {
      console.error('Toggle read failed', e);
      fetchConversations();
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const renderRightActions = () => (
      <View className="flex-row">
        <TouchableOpacity 
          className="bg-[#8b7355] w-[75px] justify-center items-center"
          onPress={() => handleToggleRead(item.id, item.unreadCount)}
        >
          <Text className="text-[#f6ede8] font-bold text-[11px] text-center px-1">
            {item.unreadCount > 0 ? 'Mark Read' : 'Mark Unread'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-[#4a3728] w-[75px] justify-center items-center"
          onPress={() => handleArchive(item.id, item.isArchived)}
        >
          <Text className="text-[#f6ede8] font-bold text-xs">{item.isArchived ? 'Unarchive' : 'Archive'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-red-600 w-[75px] justify-center items-center"
          onPress={() => handleDelete(item.id)}
        >
          <Text className="text-white font-bold text-xs">Delete</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 border-b border-[#4a3728]/5 bg-[#f6ede8]"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Chat', { 
            conversationId: item.id, 
            userId: item.targetUserId, 
            userName: item.name, 
            userAvatar: item.avatar, 
            userRole: item.headline,
            isOnline: item.isOnline
          })}
        >
          <ConversationAvatar uri={item.avatar} name={item.name} isOnline={item.isOnline} />
          
          <View className="flex-1 ml-3 justify-center">
            <View className="flex-row justify-between items-center mb-0.5">
              <Text className="font-bold text-[#4a3728] text-base" numberOfLines={1}>{item.name}</Text>
              <Text className="text-xs text-[#4a3728]/60">{item.time}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className={`text-sm flex-1 mr-2 ${item.unreadCount > 0 ? 'text-[#4a3728] font-medium' : 'text-[#4a3728]/60'}`} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 ? (
                <View className="bg-[#4a3728] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
                  <Text className="text-white text-[10px] font-bold">{item.unreadCount}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const headerPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;

  return (
    <View className="flex-1 bg-[#f6ede8]">
      <View className="bg-[#f6ede8]" style={{ paddingTop: headerPaddingTop }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 mt-2 border-b border-[#d4c4b5]/30">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3 p-1"
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <BackIcon />
            </TouchableOpacity>
            <Text className="font-black text-xl text-[#4a3728] tracking-wide">Messaging</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full active:bg-[#4a3728]/5"
              onPress={() => setShowMenu(true)}
              activeOpacity={0.7}
            >
              <MoreIcon />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center rounded-full active:bg-[#4a3728]/5"
              onPress={() => setShowNewChat(true)}
              activeOpacity={0.7}
            >
              <WriteIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="px-4 pt-3 pb-2 mt-2">
          <View className="flex-row items-center bg-[#f6ede8] rounded-full px-4 py-2 border-2 border-[#d4c4b5]/80 gap-2 shadow-sm">
            <SearchIcon />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search messages"
              placeholderTextColor="rgba(74,55,40,0.5)"
              className="flex-1 text-sm py-1.5"
              style={{ color: '#4a3728' }}
            />
          </View>
        </View>

        {/* Filters */}
        <View className="px-4 pb-3 border-b border-[#d4c4b5]/30">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pt-2 pb-1">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                activeOpacity={0.8}
                className={`px-5 py-1.5 mr-3 rounded-full border-2 ${
                  activeFilter === filter.value 
                    ? 'border-[#4a3728] bg-[#4a3728]' 
                    : 'border-[#4a3728]/50 bg-[#f6ede8]'
                }`}
              >
                <Text className={`text-xs font-black ${
                  activeFilter === filter.value ? 'text-[#f6ede8]' : 'text-[#4a3728]'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4a3728" />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item: any, index: number) => item?.id || item?._id || item?.conversationId || `chat-${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a3728" />}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-[#4a3728]/60">No messages found.</Text>
            </View>
          }
        />
      )}

      {/* ─── New Chat Modal ─── */}
      <Modal
        visible={showNewChat}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewChat(false)}
      >
        <View className="flex-1 bg-[#f6ede8] pt-10">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-[#d4c4b5]/30">
            <TouchableOpacity onPress={() => setShowNewChat(false)} className="p-2 -ml-2">
              <Text className="text-[#4a3728] font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="font-black text-lg text-[#4a3728]">New Message</Text>
            <View className="w-12" />
          </View>

          <View className="px-4 py-4 border-b border-[#d4c4b5]/30 bg-white/50">
            <View className="flex-row items-center">
              <Text className="text-[#4a3728] font-bold mr-3">To:</Text>
              <TextInput
                value={searchUserQuery}
                onChangeText={handleSearchUsers}
                placeholder="Search connections by name..."
                placeholderTextColor="rgba(74,55,40,0.5)"
                className="flex-1 text-base text-[#4a3728] py-2"
                autoFocus
              />
            </View>
          </View>

          {searchingUsers ? (
            <View className="pt-10 items-center">
              <ActivityIndicator size="small" color="#4a3728" />
            </View>
          ) : (
            <FlatList
              data={searchedUsers}
              keyExtractor={(item) => item._id || item.userId || item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className="flex-row items-center px-4 py-3 border-b border-[#4a3728]/5 bg-white/30"
                  onPress={() => startNewChat(item)}
                >
                  <Image 
                    source={{ uri: item.avatar || item.profilePicture || 'https://via.placeholder.com/150' }} 
                    className="w-12 h-12 rounded-full bg-[#4a3728]/10" 
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-bold text-[#4a3728] text-base">
                      {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.username}
                    </Text>
                    {(item.headline || item.role) ? (
                      <Text className="text-xs text-[#4a3728]/60 mt-0.5" numberOfLines={1}>
                        {item.headline || item.role}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchUserQuery.length >= 2 ? (
                  <View className="items-center pt-10">
                    <Text className="text-[#4a3728]/60">No users found matching "{searchUserQuery}"</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </Modal>

      {/* ─── Manage Menu Bottom Sheet ─── */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        />
        {(() => {
          // Compute all dynamic values from real conversation data
          const totalUnread = formattedChats.filter(c => !c.isArchived && c.unreadCount > 0).length;
          const archivedCount = formattedChats.filter(c => c.isArchived).length;
          const focusedCount = formattedChats.filter(c => !c.isArchived && c.category === 'focused').length;
          const requestCount = formattedChats.filter(c => !c.isArchived && c.category === 'other').length;
          const readCount = formattedChats.filter(c => !c.isArchived && c.unreadCount === 0).length;

          return (
            <View
              className="bg-[#f6ede8] rounded-t-3xl px-2 pt-3 pb-10"
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
            >
              {/* Handle bar */}
              <View className="w-10 h-1 bg-[#4a3728]/20 rounded-full self-center mb-4" />

              <View className="flex-row items-center justify-between px-5 mb-3">
                <Text className="text-[#4a3728] font-black text-lg" style={{ letterSpacing: 0.3 }}>
                  Manage Messaging
                </Text>
                {totalUnread > 0 ? (
                  <View className="bg-[#4a3728] rounded-full px-2.5 py-0.5">
                    <Text className="text-[#f6ede8] text-xs font-black">{totalUnread} unread</Text>
                  </View>
                ) : null}
              </View>

              {/* Mark All Read */}
              <TouchableOpacity
                className={`flex-row items-center px-5 py-4 rounded-2xl ${totalUnread === 0 ? 'opacity-40' : 'active:bg-[#4a3728]/5'}`}
                disabled={totalUnread === 0}
                onPress={async () => {
                  setShowMenu(false);
                  setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
                  const unread = conversations.filter(c => (typeof c.unreadCount === 'number' ? c.unreadCount : 0) > 0);
                  await Promise.allSettled(
                    unread.map(c => MessageService.markConversationSeen(c.conversationId || c._id || c.id))
                  );
                }}
              >
                <View className="w-10 h-10 bg-[#4a3728]/10 rounded-full items-center justify-center mr-4">
                  <CheckAllIcon />
                </View>
                <View className="flex-1">
                  <Text className="text-[#4a3728] font-bold text-[15px]">Mark all as read</Text>
                  <Text className="text-[#4a3728]/60 text-xs mt-0.5">
                    {totalUnread > 0 ? `${totalUnread} conversation${totalUnread > 1 ? 's' : ''} with unread messages` : 'All conversations are read'}
                  </Text>
                </View>
                {totalUnread > 0 ? (
                  <View className="bg-[#4a3728] rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
                    <Text className="text-white text-[11px] font-black">{totalUnread}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Notification toggle */}
              <TouchableOpacity
                className="flex-row items-center px-5 py-4 rounded-2xl active:bg-[#4a3728]/5"
                onPress={() => { setNotifMuted(v => !v); setShowMenu(false); }}
              >
                <View className="w-10 h-10 bg-[#4a3728]/10 rounded-full items-center justify-center mr-4">
                  <BellOffIcon color={notifMuted ? '#dc2626' : '#4a3728'} />
                </View>
                <View className="flex-1">
                  <Text className="text-[#4a3728] font-bold text-[15px]">
                    {notifMuted ? 'Unmute notifications' : 'Mute notifications'}
                  </Text>
                  <Text className="text-[#4a3728]/60 text-xs mt-0.5">
                    {notifMuted ? 'Currently muted — tap to resume alerts' : 'Stop message alerts temporarily'}
                  </Text>
                </View>
                <View className={`w-12 h-6 rounded-full border-2 items-center justify-center ${notifMuted ? 'bg-red-500 border-red-500' : 'bg-[#4a3728]/10 border-[#4a3728]/20'}`}>
                  <Text className={`text-[9px] font-black ${notifMuted ? 'text-white' : 'text-[#4a3728]/50'}`}>
                    {notifMuted ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* View Archived */}
              <TouchableOpacity
                className={`flex-row items-center px-5 py-4 rounded-2xl ${archivedCount === 0 ? 'opacity-40' : 'active:bg-[#4a3728]/5'}`}
                disabled={archivedCount === 0}
                onPress={() => { setShowMenu(false); setActiveFilter('archived'); }}
              >
                <View className="w-10 h-10 bg-[#4a3728]/10 rounded-full items-center justify-center mr-4">
                  <ArchiveIcon />
                </View>
                <View className="flex-1">
                  <Text className="text-[#4a3728] font-bold text-[15px]">Archived chats</Text>
                  <Text className="text-[#4a3728]/60 text-xs mt-0.5">
                    {archivedCount > 0 ? `${archivedCount} archived conversation${archivedCount > 1 ? 's' : ''}` : 'No archived conversations'}
                  </Text>
                </View>
                {archivedCount > 0 ? (
                  <View className="bg-[#4a3728]/10 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
                    <Text className="text-[#4a3728] text-[11px] font-black">{archivedCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Message Requests */}
              <TouchableOpacity
                className={`flex-row items-center px-5 py-4 rounded-2xl ${requestCount === 0 ? 'opacity-40' : 'active:bg-[#4a3728]/5'}`}
                disabled={requestCount === 0}
                onPress={() => { setShowMenu(false); setActiveFilter('other'); }}
              >
                <View className="w-10 h-10 bg-[#4a3728]/10 rounded-full items-center justify-center mr-4">
                  <FilterIcon />
                </View>
                <View className="flex-1">
                  <Text className="text-[#4a3728] font-bold text-[15px]">Message requests</Text>
                  <Text className="text-[#4a3728]/60 text-xs mt-0.5">
                    {requestCount > 0 ? `${requestCount} pending request${requestCount > 1 ? 's' : ''}` : 'No pending requests'}
                  </Text>
                </View>
                {requestCount > 0 ? (
                  <View className="bg-amber-500 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
                    <Text className="text-white text-[11px] font-black">{requestCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Focused inbox */}
              <TouchableOpacity
                className={`flex-row items-center px-5 py-4 rounded-2xl ${focusedCount === 0 ? 'opacity-40' : 'active:bg-[#4a3728]/5'}`}
                disabled={focusedCount === 0}
                onPress={() => { setShowMenu(false); setActiveFilter('focused'); }}
              >
                <View className="w-10 h-10 bg-[#4a3728]/10 rounded-full items-center justify-center mr-4">
                  <StarIcon />
                </View>
                <View className="flex-1">
                  <Text className="text-[#4a3728] font-bold text-[15px]">Focused inbox</Text>
                  <Text className="text-[#4a3728]/60 text-xs mt-0.5">
                    {focusedCount > 0 ? `${focusedCount} conversation${focusedCount > 1 ? 's' : ''} in focus` : 'No focused conversations yet'}
                  </Text>
                </View>
                {focusedCount > 0 ? (
                  <View className="bg-[#4a3728]/10 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
                    <Text className="text-[#4a3728] text-[11px] font-black">{focusedCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* Divider */}
              <View className="h-px bg-[#d4c4b5]/40 mx-5 my-2" />

              {/* Delete all read */}
              <TouchableOpacity
                className={`flex-row items-center px-5 py-4 rounded-2xl ${readCount === 0 ? 'opacity-40' : 'active:bg-red-50'}`}
                disabled={readCount === 0}
                onPress={() => {
                  Alert.alert(
                    "Delete All Read Chats",
                    `Are you sure you want to delete ${readCount} read conversation${readCount > 1 ? 's' : ''}? This action cannot be undone.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          setShowMenu(false);
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          const readConvs = conversations.filter(c => (typeof c.unreadCount === 'number' ? c.unreadCount : 0) === 0 && !c.isArchived);
                          setConversations(prev => prev.filter(c => (typeof c.unreadCount === 'number' ? c.unreadCount : 0) > 0 || c.isArchived));
                          await Promise.allSettled(
                            readConvs.map(c => MessageService.deleteConversation(c.conversationId || c._id || c.id))
                          );
                        }
                      }
                    ]
                  );
                }}
              >
                <View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center mr-4">
                  <TrashIcon />
                </View>
                <View className="flex-1">
                  <Text className="text-red-600 font-bold text-[15px]">Delete all read chats</Text>
                  <Text className="text-red-400 text-xs mt-0.5">
                    {readCount > 0 ? `Will remove ${readCount} read conversation${readCount > 1 ? 's' : ''}` : 'No read conversations to delete'}
                  </Text>
                </View>
                {readCount > 0 ? (
                  <View className="bg-red-100 rounded-full min-w-[24px] h-6 items-center justify-center px-1.5">
                    <Text className="text-red-600 text-[11px] font-black">{readCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          );
        })()}
      </Modal>
    </View>
  );
}
