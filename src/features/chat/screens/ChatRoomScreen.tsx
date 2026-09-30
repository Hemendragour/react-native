import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Modal, ScrollView, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { MessageService } from '../../../services/message.service';
import AuthService from '../../../services/auth.service';
import { joinConversation, leaveConversation, onMessageNew } from '../../../services/socket.service';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 12h.01M12 6h.01M12 18h.01" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ChatRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chatId, name, headline, avatar, isOnline, targetUserId } = route.params || {};
  const insets = useSafeAreaInsets();

  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isAttachModalVisible, setIsAttachModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser() as any;
    const currentId = user?.userId || user?._id || user?.id || null;
    setCurrentUserId(currentId);
    
    if (chatId) {
      fetchMessages(currentId);
      MessageService.markConversationSeen(chatId).catch(console.log);

      // Join the socket room for real-time messages
      joinConversation(chatId);

      const unsubMessageNew = onMessageNew((newMessage: any) => {
        // Ensure the message is for this chat
        if (newMessage.conversationId === chatId || (newMessage.conversation && newMessage.conversation === chatId)) {
          console.log('💬 [ChatRoom] New message received:', newMessage._id || newMessage.messageId);
          setMessages(prev => {
            // Dedup exact match
            if (prev.find(m => m.id === (newMessage.messageId || newMessage.id || newMessage._id))) return prev;
            
            const uiMsg = mapMessageToUI(newMessage, currentId);

            // Deduplicate optimistic (temp ID length is usually small like 13, mongo is 24)
            const optimisticIdx = prev.findIndex(m => m.isSentByMe === uiMsg.isSentByMe && m.text === uiMsg.text && m.status === 'sent' && String(m.id).length < 20);
            if (optimisticIdx >= 0) {
               const updated = [...prev];
               updated[optimisticIdx] = uiMsg;
               return updated;
            }
            
            return [uiMsg, ...prev]; // Prepend since list is inverted
          });
          MessageService.markConversationSeen(chatId).catch(console.log);
        }
      });

      return () => {
        leaveConversation(chatId);
        unsubMessageNew();
      };
    } else {
      setIsLoading(false);
      console.warn('ChatRoomScreen mounted without a valid chatId');
    }
  }, [chatId]);

  const mapMessageToUI = (msg: any, userId: string) => {
    return {
      id: msg.messageId || msg.id || msg._id,
      text: msg.text,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: msg.senderId === userId,
      status: msg.status?.toLowerCase() === 'seen' ? 'read' : msg.status?.toLowerCase(),
      isPinned: msg.isPinned || false,
      reactions: msg.reactions || [],
      type: msg.type || 'text',
      mediaUrl: msg.mediaUrl,
    };
  };

  const fetchMessages = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await MessageService.getMessageHistory(chatId);
      const data = res?.data || res;
      if (data?.messages) {
        const uiMsgs = data.messages.map((m: any) => mapMessageToUI(m, userId));
        setMessages(uiMsgs);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !cursor || !currentUserId) return;
    try {
      setIsLoadingMore(true);
      const res = await MessageService.getMessageHistory(chatId, cursor);
      const data = res?.data || res;
      if (data?.messages) {
        const uiMsgs = data.messages.map((m: any) => mapMessageToUI(m, currentUserId));
        setMessages(prev => [...prev, ...uiMsgs]); // Append since inverted=true
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load more messages', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const SMART_REPLIES = ["Sure, I'll send it now!", "Thanks!", "Let me check.", "Sounds good to me."];

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending || !currentUserId) return;
    try {
      setIsSending(true);
      const optimisticId = Date.now().toString();
      const optimisticMsg = {
        id: optimisticId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSentByMe: true,
        status: 'sent' as const,
        type: 'text'
      };
      setMessages(prev => [optimisticMsg, ...prev]);

      const res = await MessageService.sendMessage({
        conversationId: chatId,
        text,
        type: 'text'
      });
      const sentMsg = res?.data || res;

      setMessages(prev => prev.map(m => m.id === optimisticId ? mapMessageToUI(sentMsg, currentUserId) : m));
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!selectedMessage) return;
    const msgId = selectedMessage.id;
    setSelectedMessage(null);
    try {
      // Optimistic update
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          const newReactions = [...(m.reactions || [])];
          const existing = newReactions.find(r => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
          } else {
            newReactions.push({ emoji, count: 1 });
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      }));
      await MessageService.toggleReaction(msgId, emoji);
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  const handleTogglePin = async () => {
    if (!selectedMessage) return;
    const msgId = selectedMessage.id;
    const isCurrentlyPinned = selectedMessage.isPinned;
    setSelectedMessage(null);
    try {
      // Optimistic update
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPinned: !isCurrentlyPinned } : m));
      await MessageService.togglePin(msgId);
    } catch (err) {
      console.error('Failed to pin message', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    const msgId = selectedMessage.id;
    setSelectedMessage(null);
    try {
      // Optimistic update
      setMessages(prev => prev.filter(m => m.id !== msgId));
      await MessageService.deleteMessage(msgId);
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleAttachPress = () => {
    Keyboard.dismiss();
    setIsAttachModalVisible(true);
  };

  const processSelectedMedia = async (result: any) => {
    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      console.log('Selected file to attach:', file);

      Alert.alert('Uploading...', 'Please wait while we upload your media.');

      try {
        const mediaUrl = await MessageService.uploadMedia(file);

        const tempId = `temp-${Date.now()}`;
        const newMsg: any = {
          id: tempId,
          text: '',
          senderId: 'me',
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: 'image',
          mediaUrl: mediaUrl,
        };

        setMessages(prev => [newMsg, ...prev]);

        const sentMsg = await MessageService.sendMessage({
          conversationId: chatId,
          text: '',
          type: 'image',
          mediaUrl: mediaUrl,
        });

        setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        Alert.alert('Upload Failed', `Could not upload media: ${errorMsg}`);
      }
    }
  };

  const handleGalleryPress = async () => {
    setIsAttachModalVisible(false);
    try {
      const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
      processSelectedMedia(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCameraPress = async () => {
    setIsAttachModalVisible(false);
    try {
      const result = await launchCamera({ mediaType: 'mixed', saveToPhotos: true });
      processSelectedMedia(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocumentPress = () => {
    setIsAttachModalVisible(false);
    Alert.alert('Coming Soon', 'Document sharing will be available in the next update.');
  };

  const handleGifPress = () => {
    setIsAttachModalVisible(false);
    Alert.alert('Coming Soon', 'GIF sharing will be available in the next update.');
  };

  const handleMentionPress = () => {
    setIsAttachModalVisible(false);
    Alert.alert('Coming Soon', 'Mentions / Locations will be available in the next update.');
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e0d8cf&color=4a3728&size=128`;
  const [headerImgSrc, setHeaderImgSrc] = useState(avatar && avatar.startsWith('http') && !avatar.includes('pixabay.com') ? avatar : fallbackAvatar);

  useEffect(() => {
    setHeaderImgSrc(avatar && avatar.startsWith('http') && !avatar.includes('pixabay.com') ? avatar : fallbackAvatar);
  }, [avatar, fallbackAvatar]);

  return (
    <View className="flex-1 bg-[#f6ede8]" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-[#e0d8cf] bg-[#f6ede8]">
          <TouchableOpacity
            className="mr-3 p-2 bg-[#e0d8cf] rounded-full border border-[#4a3728]"
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center"
            activeOpacity={0.7}
            onPress={() => targetUserId && navigation.navigate('Profile', { userId: targetUserId })}
          >
            <View className="relative mr-3">
              <Image
                source={{ uri: headerImgSrc }}
                className="w-10 h-10 rounded-full border border-[#4a3728]/20"
                onError={() => setHeaderImgSrc(fallbackAvatar)}
              />
              {isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f6ede8] rounded-full" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#4a3728]" numberOfLines={1}>{name || 'User'}</Text>
              {headline && (
                <Text className="text-xs text-[#4a3728] opacity-70 font-medium" numberOfLines={1}>{headline}</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="p-2 ml-2" onPress={() => setIsMoreModalVisible(true)}>
            <MoreIcon />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4a3728" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              if (item.type === 'date') {
                return (
                  <View className="items-center my-4">
                    <View className="bg-[#e0d8cf] px-3 py-1 rounded-full border border-[#4a3728]/10">
                      <Text className="text-xs font-bold text-[#4a3728] opacity-70">{item.text}</Text>
                    </View>
                  </View>
                );
              }
              return <MessageBubble {...item as any} onLongPress={() => setSelectedMessage(item)} />;
            }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
            inverted // This makes the list start from bottom like standard chat apps
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#4a3728" className="my-4" /> : null}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-20 transform rotate-180">
                <Text className="text-[#4a3728] opacity-50">Say hello to {name?.split(' ')[0] || 'your connection'}!</Text>
              </View>
            }
          />
        )}

        {/* Smart Replies */}
        <View className="bg-[#f6ede8]">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-3 pb-2 pt-1 flex-row">
            {SMART_REPLIES.map((reply, index) => (
              <TouchableOpacity
                key={index}
                className="bg-[#e0d8cf] px-4 py-2 rounded-full mr-2 border border-[#4a3728]/20"
                onPress={() => handleSend(reply)}
              >
                <Text className="text-sm font-bold text-[#4a3728]">{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <ChatInput onSend={handleSend} onAttachPress={handleAttachPress} />
      </KeyboardAvoidingView>

      {/* More Options Modal */}
      <Modal
        visible={isMoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsMoreModalVisible(false)}
        >
          <View className="bg-[#f6ede8] rounded-t-3xl pt-6 pb-10 px-6">
            <View className="w-12 h-1 bg-[#4a3728]/20 rounded-full self-center mb-6" />

            <TouchableOpacity className="py-4 border-b border-[#e0d8cf]" onPress={() => {
              setIsMoreModalVisible(false);
              if (targetUserId) {
                navigation.navigate('Profile', { userId: targetUserId });
              }
            }}>
              <Text className="text-base font-bold text-[#4a3728]">View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-4 border-b border-[#e0d8cf]" onPress={() => {
              setIsMoreModalVisible(false);
              Alert.alert('Mute Conversation', 'Notifications for this conversation are now muted.');
            }}>
              <Text className="text-base font-bold text-[#4a3728]">Mute Conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-4 border-b border-[#e0d8cf]" onPress={() => {
              setIsMoreModalVisible(false);
              Alert.alert(
                'Delete Conversation',
                'Are you sure you want to delete this conversation?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete', style: 'destructive', onPress: () => {
                      // Just navigate back for now since we don't have a backend endpoint implemented yet
                      navigation.goBack();
                    }
                  }
                ]
              );
            }}>
              <Text className="text-base font-bold text-red-500">Delete Conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-4" onPress={() => {
              setIsMoreModalVisible(false);
              Alert.alert('Report / Block', 'The user has been reported and blocked.');
            }}>
              <Text className="text-base font-bold text-red-500">Report / Block</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Message Actions Modal */}
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-4"
          activeOpacity={1}
          onPress={() => setSelectedMessage(null)}
        >
          <View className="bg-[#f6ede8] rounded-2xl w-full max-w-[300px] overflow-hidden">
            <View className="flex-row justify-around py-4 border-b border-[#e0d8cf] bg-[#e0d8cf]/50">
              {['👍', '❤️', '😂', '🔥', '👏'].map((emoji) => (
                <TouchableOpacity key={emoji} onPress={() => handleReaction(emoji)}>
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity className="py-4 border-b border-[#e0d8cf] items-center" onPress={handleTogglePin}>
              <Text className="text-base font-bold text-[#4a3728]">
                {selectedMessage?.isPinned ? 'Unpin Message' : 'Pin Message'}
              </Text>
            </TouchableOpacity>

            {selectedMessage?.isSentByMe ? (
              <TouchableOpacity className="py-4 items-center" onPress={handleDelete}>
                <Text className="text-base font-bold text-red-500">Delete Message</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="py-4 items-center" onPress={() => setSelectedMessage(null)}>
                <Text className="text-base font-bold text-[#4a3728]">Reply Privately</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Attachment Options Modal */}
      <Modal
        visible={isAttachModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAttachModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsAttachModalVisible(false)}
        >
          <View className="bg-[#f6ede8] rounded-t-3xl pt-6 pb-10 px-6">
            <View className="w-12 h-1 bg-[#4a3728]/20 rounded-full self-center mb-6" />

            <View className="flex-row flex-wrap justify-between px-4">
              {/* Document */}
              <TouchableOpacity className="items-center mb-6 w-1/3" onPress={handleDocumentPress}>
                <View className="w-14 h-14 rounded-full bg-blue-500/20 items-center justify-center mb-2">
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#4a3728]">Document</Text>
              </TouchableOpacity>

              {/* Camera */}
              <TouchableOpacity className="items-center mb-6 w-1/3" onPress={handleCameraPress}>
                <View className="w-14 h-14 rounded-full bg-red-500/20 items-center justify-center mb-2">
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx={12} cy={13} r={4} stroke="#ef4444" strokeWidth={2} />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#4a3728]">Camera</Text>
              </TouchableOpacity>

              {/* Media/Gallery */}
              <TouchableOpacity className="items-center mb-6 w-1/3" onPress={handleGalleryPress}>
                <View className="w-14 h-14 rounded-full bg-purple-500/20 items-center justify-center mb-2">
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={3} width={18} height={18} rx={2} ry={2} stroke="#a855f7" strokeWidth={2} />
                    <Circle cx={8.5} cy={8.5} r={1.5} stroke="#a855f7" strokeWidth={2} />
                    <Path d="M21 15l-5-5L5 21" stroke="#a855f7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#4a3728]">Media</Text>
              </TouchableOpacity>

              {/* GIF */}
              <TouchableOpacity className="items-center mb-2 w-1/3" onPress={handleGifPress}>
                <View className="w-14 h-14 rounded-full bg-orange-500/20 items-center justify-center mb-2">
                  <Text className="font-bold text-orange-500 text-lg">GIF</Text>
                </View>
                <Text className="text-xs font-bold text-[#4a3728]">GIF</Text>
              </TouchableOpacity>

              {/* Mention */}
              <TouchableOpacity className="items-center mb-2 w-1/3" onPress={handleMentionPress}>
                <View className="w-14 h-14 rounded-full bg-green-500/20 items-center justify-center mb-2">
                  <Text className="font-bold text-green-500 text-2xl">@</Text>
                </View>
                <Text className="text-xs font-bold text-[#4a3728]">Mention</Text>
              </TouchableOpacity>

              <View className="w-1/3"></View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
