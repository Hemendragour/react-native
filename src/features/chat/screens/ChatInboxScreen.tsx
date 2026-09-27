import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import ChatItem from '../components/ChatItem';
import { MessageService } from '../../../services/message.service';
import AuthService from '../../../services/auth.service';
import { ConnectionService } from '../../../services/connection.service';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ComposeIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#4a3728" strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

type FilterType = 'all' | 'unread' | 'focused' | 'jobs' | 'other' | 'archived';

export default function ChatInboxScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Compose Modal States
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [isFetchingConnections, setIsFetchingConnections] = useState(false);
  const [composeSearchQuery, setComposeSearchQuery] = useState('');

  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const fetchConversations = async () => {
        try {
          setIsLoading(true);
          const res = await MessageService.getConversations();
          if (!isActive) return;

          // Expecting backend to return { success: true, data: [...] }
          const rawData = res?.data || res || [];
          const list = Array.isArray(rawData) ? rawData : rawData.data || [];
          
          const currentUser = AuthService.getCurrentUser() as any;
          const currentUserId = currentUser?.userId || currentUser?._id || currentUser?.id;

          const formatted = list.map((conv: any) => {
            // Find the other participant
            const otherParticipant = conv.participants?.find((p: any) => 
               (p.userId && p.userId !== currentUserId) || 
               (p._id && p._id !== currentUserId)
            ) || {};
            
            const otherUser = otherParticipant?.profile || conv.targetUser || conv.otherUser || otherParticipant;

            return {
              id: conv._id || conv.id,
              name: otherUser.name || `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Unknown User',
              headline: otherUser.headline || otherUser.bio || '',
              avatar: otherUser.avatar || otherUser.profilePicture || null,
              lastMessage: conv.lastMessage?.text || 'No messages yet',
              timestamp: conv.lastMessage?.createdAt 
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : '',
              unreadCount: typeof conv.unreadCount === 'number' ? conv.unreadCount : (conv.unreadCount?.[currentUserId] || 0),
              isOnline: false,
              category: conv.category || 'focused', // Default to focused if backend doesn't provide
              isArchived: conv.isArchived || false,
            };
          });

          setConversations(formatted);
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchConversations();

      return () => { isActive = false; };
    }, [])
  );

  const handleOpenCompose = async () => {
    setIsComposeVisible(true);
    setIsFetchingConnections(true);
    try {
      const currentUser = AuthService.getCurrentUser() as any;
      const currentUserId = currentUser?.userId || currentUser?._id || currentUser?.id;
      if (currentUserId) {
        const res = await ConnectionService.getUserConnections(currentUserId);
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data.data || [];
        
        // Fetch profiles for each connection to get names and avatars
        const mappedConnections = await Promise.all(list.map(async (conn: any) => {
          let targetUserId = conn.toUserId === currentUserId ? conn.fromUserId : conn.toUserId;
          // Fallback if the backend already populated it
          if (typeof targetUserId === 'object') {
            targetUserId = targetUserId.userId || targetUserId._id || targetUserId.id;
          }

          let profileData: any = {};
          if (targetUserId && typeof targetUserId === 'string') {
            try {
              const profileRes = await AuthService.getUserProfileById(targetUserId);
              const rawData = profileRes?.data?.data || profileRes?.data || profileRes;
              const p = rawData?.profile || {};
              const account = rawData?.user || rawData?.data || rawData || {};
              profileData = { ...account, ...p };
            } catch (e) {
              console.log('Failed to fetch profile for connection', targetUserId);
            }
          }

          const firstName = profileData.firstName || '';
          const lastName = profileData.lastName || '';
          const nameFallback = profileData.name || profileData.username || 'Unknown User';
          const fullName = `${firstName} ${lastName}`.trim() || nameFallback;
          
          let rawImage = profileData.profileImage || profileData.avatar || profileData.profilePhotoId;
          let finalImage = rawImage;
          if (!rawImage || (typeof rawImage === 'string' && !rawImage.startsWith('http') && rawImage.length > 20)) {
            finalImage = null; // We handle null in UI to show initials
          }

          return {
            ...conn,
            userId: targetUserId,
            name: fullName,
            headline: profileData.headline || profileData.title || '',
            avatar: finalImage,
          };
        }));

        setConnections(mappedConnections);
      }
    } catch (err) {
      console.error('Failed to fetch connections', err);
    } finally {
      setIsFetchingConnections(false);
    }
  };

  const handleCreateChat = async (targetUser: any) => {
    try {
      setIsComposeVisible(false);
      const targetUserId = targetUser.userId || targetUser._id || targetUser.id;
      
      const res = await MessageService.createDirectConversation(targetUserId);
      const conv = res?.data || res;
      
      navigation.navigate('ChatRoom', {
        chatId: conv._id || conv.id,
        name: targetUser.name || `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Unknown User',
        headline: targetUser.headline || targetUser.bio || '',
        avatar: targetUser.avatar || targetUser.profilePicture || null,
        isOnline: false
      });
    } catch (err) {
      console.error('Failed to create chat', err);
    }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Focused', value: 'focused' },
    { label: 'Jobs', value: 'jobs' },
    { label: 'Other', value: 'other' },
    { label: 'Archived', value: 'archived' },
  ];

  const filteredChats = conversations.filter(chat => {
    // If viewing archived, ONLY show archived. Otherwise, HIDE archived.
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

    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (chat.headline && chat.headline.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <View className="flex-1 bg-[#f6ede8]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e0d8cf] justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3 p-2 bg-[#e0d8cf] rounded-full border border-[#4a3728]"
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-xl font-black text-[#4a3728]">Messaging</Text>
        </View>
        <TouchableOpacity 
          className="p-2 bg-[#e0d8cf] rounded-full border border-[#4a3728]"
          onPress={handleOpenCompose}
        >
          <ComposeIcon />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-[#f6ede8]">
        <View className="flex-row items-center bg-[#e0d8cf] rounded-xl px-3 py-2 border border-[#4a3728]/20">
          <SearchIcon />
          <TextInput
            className="flex-1 ml-2 text-sm font-bold text-[#4a3728] py-0"
            placeholder="Search messages"
            placeholderTextColor="rgba(74,55,40,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 py-3 border-b border-[#e0d8cf] bg-[#f6ede8]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
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

      {/* Chat List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center pt-10">
          <ActivityIndicator size="large" color="#4a3728" />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatItem
              {...item}
              onPress={() => navigation.navigate('ChatRoom', { 
                chatId: item.id,
                name: item.name,
                headline: item.headline,
                avatar: item.avatar,
                isOnline: item.isOnline
              })}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-10">
              <Text className="text-[#4a3728] opacity-70">No conversations found</Text>
            </View>
          }
        />
      )}

      {/* Compose / New Message Modal */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsComposeVisible(false)}
      >
        <View className="flex-1 bg-[#f6ede8]">
          <View className="flex-row items-center px-4 py-4 border-b border-[#e0d8cf]">
            <TouchableOpacity onPress={() => setIsComposeVisible(false)} className="mr-4">
              <Text className="text-[#4a3728] font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-black text-[#4a3728] flex-1 text-center">New Message</Text>
            <View style={{ width: 50 }} />
          </View>
          
          <View className="px-4 py-3 border-b border-[#e0d8cf]">
            <View className="flex-row items-center bg-[#e0d8cf] rounded-xl px-3 py-2 border border-[#4a3728]/20">
              <SearchIcon />
              <TextInput
                className="flex-1 ml-2 text-sm font-bold text-[#4a3728] py-0"
                placeholder="Type a name..."
                placeholderTextColor="rgba(74,55,40,0.5)"
                value={composeSearchQuery}
                onChangeText={setComposeSearchQuery}
                autoFocus
              />
            </View>
          </View>

          {isFetchingConnections ? (
            <ActivityIndicator size="large" color="#4a3728" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={connections.filter(c => c.name.toLowerCase().includes(composeSearchQuery.toLowerCase()))}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              renderItem={({ item }) => {
                const name = item.name;
                const avatar = item.avatar;
                // Prepare targetUser object to pass to handleCreateChat
                const targetUser = { userId: item.userId, name: item.name, headline: item.headline, avatar: item.avatar };
                
                return (
                  <TouchableOpacity 
                    className="flex-row items-center px-4 py-3 border-b border-[#e0d8cf]"
                    onPress={() => handleCreateChat(targetUser)}
                  >
                    <View className="w-12 h-12 rounded-full overflow-hidden bg-[#e0d8cf] mr-3">
                      {avatar ? (
                        <Image source={{ uri: avatar }} className="w-full h-full" />
                      ) : (
                        <View className="flex-1 items-center justify-center bg-[#4a3728]">
                          <Text className="text-[#f6ede8] font-bold text-lg">{name ? name.charAt(0) : '?'}</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-[#4a3728]">{name}</Text>
                      {item.headline && (
                        <Text className="text-xs text-[#4a3728] opacity-60 mt-0.5" numberOfLines={1}>{item.headline}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center pt-10">
                  <Text className="text-[#4a3728] opacity-70">No connections found</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
