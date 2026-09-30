import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  StyleSheet, StatusBar, Modal, ScrollView, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import { MessageService } from '../../../services/message.service';
import AuthService, { api } from '../../../services/auth.service';
import FeedService from '../../../services/feed.service';
import {
  joinConversation,
  leaveConversation,
  onMessageNew,
  emitTyping,
  emitDelivered,
  onMessageStatus,
  onTyping,
  onConversationSeen,
  onMessageReaction,
  onDirectMessageDeleted,
  onDirectMessageEdited,
} from '../../../services/socket.service';
import ImageViewer from 'react-native-image-zoom-viewer';

const C = {
  bg: '#f6ede8',
  headerBg: '#fdfbf9',
  headerText: '#4a3728',
  bubbleMe: '#4a3728',
  bubbleOther: '#ffffff',
  textMe: '#f6ede8',
  textOther: '#4a3728',
  inputBg: '#fdfbf9',
  border: '#d4c4b5',
  mid: '#8b6f47',
  dark: '#4a3728',
  accent: '#4a3728',
  highlight: '#f0e6dd',
  onlineGreen: '#44b264',
  subtext: '#9c7c5c',
};

const SUGGESTIONS = [
  '👋 Hey!',
  '😊 Sounds great!',
  "👍 Sure, let's connect!",
  '🙏 Thanks!',
  '📅 Let\'s schedule a call',
  '💼 Interested!',
];

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke={C.dark} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.2" fill={C.mid} />
    <Circle cx="12" cy="12" r="1.2" fill={C.mid} />
    <Circle cx="12" cy="19" r="1.2" fill={C.mid} />
  </Svg>
);

const SendIcon = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={active ? "#fff" : C.mid} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AttachIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke={C.mid} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ReplyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10h10a8 8 0 018 8v1M3 10l6 6m-6-6l6-6" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CameraIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke="#4a3728" strokeWidth={2} />
  </Svg>
);

const DocumentIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="14 2 14 8 20 8" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="16" y1="13" x2="8" y2="13" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="16" y1="17" x2="8" y2="17" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="10" y1="9" x2="8" y2="9" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GifIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 14v-4h2m-2 2h1m6-2v4m4-4v4m-2-2h2m-5-2v4m-2-2h2" stroke="#4a3728" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MentionIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#4a3728" strokeWidth={2} />
    <Path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6c-2.5 0-4.5 1-4.5 2v1h9v-1c0-1-2-2-4.5-2z" stroke="#4a3728" strokeWidth={1.5} />
  </Svg>
);

const MediaIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#4a3728" strokeWidth={2} />
    <Polyline points="21 15 16 10 5 21" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const isSameDay = (d1?: string, d2?: string) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

const formatMessageDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  
  const isToday = isSameDay(dateStr, now.toISOString());
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = isSameDay(dateStr, yesterday.toISOString());
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

const getAvatarFallback = (name?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e0d8cf&color=4a3728&size=128`;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    conversationId: paramConvId,
    userId: paramUserId,
    userName: paramUserName,
    userAvatar: paramUserAvatar,
    userRole: paramUserRole,
    isOnline: paramIsOnline = false,
  } = route.params || {};

  const [conversationId, setConversationId] = useState(paramConvId);
  const [userId, setUserId] = useState(
    typeof paramUserId === 'object' ? (paramUserId._id || paramUserId.userId || paramUserId.id) : paramUserId
  );
  const [chatUserName, setChatUserName] = useState(paramUserName || '');
  const [chatUserAvatar, setChatUserAvatar] = useState(paramUserAvatar || '');
  const [chatUserRole, setChatUserRole] = useState(paramUserRole || '');

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [replyingToMsg, setReplyingToMsg] = useState<any>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const abortControllers = useRef<{ [key: string]: AbortController }>({});

  const currentUser = AuthService.getCurrentUser();
  const myId = currentUser?.userId;

  const resolveTargetUserProfile = async (targetId: string) => {
    if (!targetId) return;
    try {
      const feedCached = FeedService.getUserFromCache(targetId);
      let cachedPhoto = feedCached?.avatar || '';
      let cachedName = feedCached?.name || '';
      let cachedHeadline = feedCached?.headline || '';

      const [profileRes, photosRes] = await Promise.allSettled([
        AuthService.getUserProfileById(targetId),
        api.get(`/api/v1/profile/profile-photo/get-all-photos/${targetId}`).catch(() => api.get(`/api/v1/profile/profile-photo/user/${targetId}/active`))
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
        : getAvatarFallback(fullName);

      setChatUserName(fullName);
      setChatUserAvatar(finalAvatar);
      if (headline) setChatUserRole(headline);
    } catch (e) {
      console.log('Failed to resolve target user profile in ChatScreen', e);
    }
  };

  const resolveUserFromConversation = async (cId: string) => {
    try {
      const res = await MessageService.getConversations();
      let convs: any[] = [];
      if (Array.isArray(res)) convs = res;
      else if (res.data && Array.isArray(res.data)) convs = res.data;
      else if (res.data?.conversations) convs = res.data.conversations;
      else if (res.conversations) convs = res.conversations;
      
      const conv = convs.find(c => (c.conversationId || c._id || c.id) === cId);
      if (conv) {
        const members = conv.members || conv.populatedMembers || conv.participants || [];
        let otherId: string | null = null;
        for (const m of members) {
          const id = typeof m === 'object' && m !== null ? (m.userId || m._id || m.id) : m;
          if (id && String(id) !== String(myId)) {
            otherId = String(id);
            break;
          }
        }
        if (!otherId) {
          otherId = conv.targetUserId || conv.targetUser?._id || conv.otherUser?._id || conv.recipient?._id;
        }

        if (otherId) {
          setUserId(otherId);
          await resolveTargetUserProfile(otherId);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        let activeCid = conversationId;
        if (!activeCid && userId) {
          const dConvRes = await MessageService.createDirectConversation(userId);
          const dConv = dConvRes?.data || dConvRes;
          activeCid = dConv?.conversationId || dConv?._id || dConv?.id;
          setConversationId(activeCid);
        }

        if (userId) {
          if (!chatUserName || chatUserName === 'User' || chatUserName === 'Unknown User' || !chatUserAvatar || chatUserAvatar.includes('pixabay.com')) {
            resolveTargetUserProfile(userId);
          }
        }

        if (activeCid) {
          const res = await MessageService.getMessageHistory(activeCid);
          let data: any[] = [];
          if (Array.isArray(res)) data = res;
          else if (res.data && Array.isArray(res.data)) data = res.data;
          else if (res.data?.messages) data = res.data.messages;
          else if (res.messages) data = res.messages;
          setMessages(data);
          MessageService.markConversationSeen(activeCid).catch(() => {});

          // Fetch pinned messages
          MessageService.getPinnedMessages(activeCid).then(pinRes => {
            let pinned: any[] = [];
            if (Array.isArray(pinRes)) pinned = pinRes;
            else if (pinRes.data && Array.isArray(pinRes.data)) pinned = pinRes.data;
            else if (pinRes.data?.messages) pinned = pinRes.data.messages;
            setPinnedMessages(pinned);
          }).catch(() => {});

          try {
            joinConversation(activeCid);
          } catch (_) {}

          if (!chatUserName || chatUserName === 'Unknown User' || chatUserName === 'User' || !chatUserAvatar || chatUserAvatar.includes('pixabay.com')) {
            resolveUserFromConversation(activeCid);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initChat();
    
    let unsubMessageNew: (() => void) | null = null;
    let unsubStatus: (() => void) | null = null;
    let unsubTyping: (() => void) | null = null;
    let unsubSeen: (() => void) | null = null;
    let unsubReaction: (() => void) | null = null;
    let unsubDeleted: (() => void) | null = null;
    let unsubEdited: (() => void) | null = null;

    if (conversationId || userId) {
      unsubMessageNew = onMessageNew((newMessage: any) => {
        setConversationId((prevCid: string | null) => {
          const matchCid = prevCid || conversationId;
          if (matchCid && (newMessage.conversationId === matchCid || (newMessage.conversation && newMessage.conversation === matchCid))) {
            const mId = newMessage.messageId || newMessage._id || newMessage.id;
            if (mId) emitDelivered(mId);

            setMessages(prev => {
              if (prev.find(m => (m._id || m.id || m.messageId) === (newMessage._id || newMessage.id || newMessage.messageId))) return prev;
               
              // Deduplicate optimistic messages
              const incomingSender = String(newMessage.senderId || newMessage.sender?._id || newMessage.sender?.userId || newMessage.sender || '');
              const optimisticIdx = prev.findIndex(m => {
                const existingId = m._id || m.id || m.messageId || '';
                const mSender = String(m.senderId || m.sender?._id || m.sender?.userId || m.sender || '');
                return existingId.startsWith('temp-') && m.text === newMessage.text && mSender === incomingSender;
              });

              if (optimisticIdx >= 0) {
                const updated = [...prev];
                updated[optimisticIdx] = newMessage;
                return updated;
              }

              return [newMessage, ...prev];
            });
            MessageService.markConversationSeen(matchCid).catch(() => {});
          }
          return prevCid;
        });
      });

      unsubStatus = onMessageStatus((payload) => {
        setMessages(prev => prev.map(m => {
          const mId = m.messageId || m._id || m.id;
          if (mId === payload.messageId) {
            return { ...m, status: payload.status };
          }
          return m;
        }));
      });

      unsubTyping = onTyping((payload) => {
        if (payload.userId !== myId) {
          setIsOtherTyping(payload.isTyping);
        }
      });

      unsubSeen = onConversationSeen((payload) => {
        setMessages(prev => prev.map(m => ({ ...m, status: 'seen' })));
      });

      unsubReaction = onMessageReaction((payload) => {
        setMessages(prev => prev.map(m => {
          const mId = m.messageId || m._id || m.id;
          if (mId === payload.messageId) {
            return { ...m, reactions: payload.reactions };
          }
          return m;
        }));
      });

      unsubDeleted = onDirectMessageDeleted((payload) => {
        setMessages(prev => prev.filter(m => {
          const mId = m.messageId || m._id || m.id;
          return mId !== payload.messageId;
        }));
      });

      unsubEdited = onDirectMessageEdited((payload) => {
        setMessages(prev => prev.map(m => {
          const mId = m.messageId || m._id || m.id;
          if (mId === payload.messageId) {
            return { ...m, text: payload.text, isEdited: true };
          }
          return m;
        }));
      });
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
      if (unsubMessageNew) unsubMessageNew();
      if (unsubStatus) unsubStatus();
      if (unsubTyping) unsubTyping();
      if (unsubSeen) unsubSeen();
      if (unsubReaction) unsubReaction();
      if (unsubDeleted) unsubDeleted();
      if (unsubEdited) unsubEdited();
    };
  }, [userId, conversationId]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || isSending) return;
    const textToSend = message.trim();
    const replyMeta = replyingToMsg
      ? {
          replyToId: replyingToMsg.messageId || replyingToMsg._id || replyingToMsg.id,
          replyToText: replyingToMsg.text || replyingToMsg.content || '📎 Media attachment',
          replyToSender: String(replyingToMsg.sender?._id || replyingToMsg.senderId || replyingToMsg.sender),
        }
      : undefined;
    
    setMessage('');
    setReplyingToMsg(null);
    setIsSending(true);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId, messageId: tempId,
      senderId: myId, sender: { _id: myId },
      type: 'text', text: textToSend,
      status: 'sending', createdAt: new Date().toISOString(),
      metadata: replyMeta
    };
    
    setMessages(prev => [optimisticMsg, ...prev]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    
    try {
      const res = await MessageService.sendMessage({ 
        conversationId, 
        text: textToSend,
        type: 'text',
        replyToMessageId: replyingToMsg?.messageId || replyingToMsg?._id || replyingToMsg?.id,
        metadata: replyMeta
      });
      const newMsg = res.data || res;
      if (replyMeta) newMsg.metadata = replyMeta;
      
      setMessages(prev => prev.map(m => (m._id === tempId || m.messageId === tempId) ? newMsg : m));
    } catch (_) {
      setMessages(prev => prev.filter(m => m._id !== tempId && m.messageId !== tempId));
      setMessage(textToSend);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleLaunchCamera = async () => {
    setShowAttachMenu(false);
    launchCamera({ mediaType: 'photo', quality: 0.8 }, handleMediaResponse);
  };

  const handleLaunchMedia = async () => {
    setShowAttachMenu(false);
    launchImageLibrary({ mediaType: 'mixed', quality: 0.8, selectionLimit: 1 }, handleMediaResponse);
  };

  const cancelUpload = (tempId: string) => {
    if (abortControllers.current[tempId]) {
      abortControllers.current[tempId].abort();
      delete abortControllers.current[tempId];
    }
    setMessages(prev => prev.filter(m => (m._id || m.id || m.messageId) !== tempId));
  };

  const handleSendDocument = async (file: { uri: string; name?: string; type?: string; size?: number }) => {
    try {
      setIsSending(true);
      
      // Attempt to get a valid filename with an extension
      let fileName: string = file.name || (file.uri ? file.uri.split('/').pop() || 'document.pdf' : 'document.pdf');
      if (fileName && !fileName.includes('.')) {
        fileName += '.pdf';
      }

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        _id: tempId, messageId: tempId,
        senderId: myId, sender: { _id: myId },
        type: 'document', text: `📄 ${fileName}`,
        status: 'uploading', createdAt: new Date().toISOString()
      };
      setMessages(prev => [optimisticMsg, ...prev]);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      const controller = new AbortController();
      abortControllers.current[tempId] = controller;

      try {
        const mediaUrl = await MessageService.uploadMedia({
          uri: file.uri, name: fileName, type: file.type || 'application/pdf',
        }, { signal: controller.signal });
        const res = await MessageService.sendMessage({
          conversationId: conversationId!, text: `📄 ${fileName}`, type: 'document', mediaUrl,
        });
        const newMsg = res?.data || res;
        setMessages(prev => prev.map(m => (m._id === tempId || m.messageId === tempId) ? newMsg : m));
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.message === 'canceled') return; // Handled by cancel function
        setMessages(prev => prev.filter(m => (m._id !== tempId && m.messageId !== tempId)));
        Alert.alert('Upload failed', err?.response?.data?.message || err?.message || 'Could not upload document');
      } finally {
        delete abortControllers.current[tempId];
      }
    } catch (err) {
      Alert.alert('Error', 'Could not send document');
    }
  };

  const handleLaunchDocument = async () => {
    setShowAttachMenu(false);
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
      });
      if (res && res.uri) {
        await handleSendDocument({
          uri: res.uri,
          name: res.name || undefined,
          type: res.type || undefined,
          size: res.size || undefined,
        });
      }
    } catch (err: any) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Could not open document picker');
      }
    }
  };

  const handleHeaderAction = async (action: string) => {
    setShowHeaderMenu(false);
    try {
      if (action === 'delete') {
        Alert.alert(
          'Delete Conversation',
          'Are you sure you want to delete this conversation?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await MessageService.deleteConversation(conversationId);
                navigation.goBack();
              }
            }
          ]
        );
      } else if (action === 'archive') {
        await MessageService.archiveConversation(conversationId, true);
        Alert.alert('Success', 'Conversation archived');
        navigation.goBack();
      } else {
        Alert.alert('Coming soon', `This feature will be available in the next update.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    }
  };

  const handleScrollToMessage = (msgId?: string) => {
    if (!msgId) return;
    const idx = messages.findIndex(m => (m._id || m.id || m.messageId) === msgId);
    if (idx >= 0) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 1500);
    } else {
      Alert.alert('Message not found', 'This message might be in an older part of the history.');
    }
  };

  const handleMediaResponse = async (response: any) => {
    if (response.didCancel || !response.assets?.length) return;
    if (!conversationId) { Alert.alert('Error', 'No active conversation. Please try again.'); return; }
    
    const asset = response.assets[0];
    const mimeType = asset.type || '';
    const isVideo = mimeType.startsWith('video');

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId, messageId: tempId,
      senderId: myId, sender: { _id: myId },
      type: isVideo ? 'video' : 'image',
      text: isVideo ? '🎥 Video' : '',
      mediaUrl: asset.uri, status: 'uploading',
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [optimisticMsg, ...prev]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    const controller = new AbortController();
    abortControllers.current[tempId] = controller;

    try {
      const mediaUrl = await MessageService.uploadMedia(asset as any, { signal: controller.signal });
      const res = await MessageService.sendMessage({
        conversationId: conversationId!,
        text: isVideo ? '🎥 Video' : '',
        type: isVideo ? 'video' : 'image',
        mediaUrl,
      });
      const newMsg = res?.data || res;
      setMessages(prev => prev.map(m => (m._id === tempId || m.messageId === tempId) ? newMsg : m));
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message === 'canceled') return; // Handled by cancel function
      setMessages(prev => prev.filter(m => (m._id !== tempId && m.messageId !== tempId)));
      Alert.alert('Upload failed', err?.response?.data?.message || err?.message || 'Could not upload file');
    } finally {
      delete abortControllers.current[tempId];
    }
  };

  const handleFileDownload = async (fileUrl: string) => {
    try {
      const fileName = fileUrl.split('/').pop()?.split('?')[0] || `document-${Date.now()}.pdf`;
      const localPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      
      Alert.alert('Downloading', 'Download has started...');
      
      const downloadResult = await ReactNativeBlobUtil.config({
        path: localPath,
        fileCache: true,
      }).fetch('GET', fileUrl);

      if (downloadResult.info().status === 200) {
        Alert.alert('Download Complete', `File is ready.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save/Share', onPress: async () => {
              try {
                await Share.open({ url: 'file://' + localPath });
              } catch (err) {
                console.log('Share error:', err);
              }
          }}
        ]);
      } else {
        Alert.alert('Download Failed', 'Could not download the file.');
      }
    } catch (err) {
      console.log('Download error:', err);
      Alert.alert('Error', 'An error occurred while downloading.');
    }
  };

  const handleMsgAction = async (action: 'delete' | 'pin' | 'react' | 'reply' | 'download', payload?: any) => {
    if (!selectedMsg) return;
    const msgId = selectedMsg._id || selectedMsg.id || selectedMsg.messageId;
    const isCurrentlyPinned = selectedMsg.isPinned;

    setShowMsgMenu(false);

    if (action === 'reply') {
      setReplyingToMsg(selectedMsg);
      setSelectedMsg(null);
      return;
    }

    try {
      if (action === 'delete') {
        setMessages(prev => prev.filter(m => (m._id || m.id || m.messageId) !== msgId));
        await MessageService.deleteMessage(msgId);
      } else if (action === 'pin') {
        setMessages(prev => prev.map(m => {
          if ((m._id || m.id || m.messageId) === msgId) return { ...m, isPinned: !isCurrentlyPinned };
          return m;
        }));
        const result = await MessageService.togglePin(msgId);
        // Sync pinned messages list
        if (!isCurrentlyPinned) {
          setPinnedMessages(prev => [selectedMsg, ...prev]);
        } else {
          setPinnedMessages(prev => prev.filter(p => (p._id || p.id || p.messageId) !== msgId));
        }
      } else if (action === 'download') {
        let url = selectedMsg.mediaUrl || selectedMsg.media?.url;
        if (url) {
          if (url.includes('cloudinary.com')) {
            if (url.includes('/raw/upload/')) {
              url = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
            } else if (url.includes('/upload/')) {
              url = url.replace('/upload/', '/upload/fl_attachment/');
            }
          }
          const finalUrl = encodeURI(url);
          handleFileDownload(finalUrl);
        }
      } else if (action === 'react') {
        const emoji = payload;
        setMessages(prev => prev.map(m => {
          if ((m._id || m.id || m.messageId) === msgId) {
            const reactions = m.reactions ? JSON.parse(JSON.stringify(m.reactions)) : [];
            const existingIdx = reactions.findIndex((r: any) => r.reactedByMe);
            
            if (existingIdx !== -1) {
              const existing = reactions[existingIdx];
              if (existing.emoji === emoji) {
                // Toggle off
                existing.count -= 1;
                existing.reactedByMe = false;
                if (existing.count <= 0) reactions.splice(existingIdx, 1);
              } else {
                // Changing emoji
                existing.count -= 1;
                existing.reactedByMe = false;
                if (existing.count <= 0) reactions.splice(existingIdx, 1);
                
                const newEmojiExisting = reactions.find((r: any) => r.emoji === emoji);
                if (newEmojiExisting) {
                  newEmojiExisting.count += 1;
                  newEmojiExisting.reactedByMe = true;
                } else {
                  reactions.push({ emoji, count: 1, reactedByMe: true });
                }
              }
            } else {
              // Add new reaction
              const existing = reactions.find((r: any) => r.emoji === emoji);
              if (existing) {
                existing.count += 1;
                existing.reactedByMe = true;
              } else {
                reactions.push({ emoji, count: 1, reactedByMe: true });
              }
            }
            return { ...m, reactions };
          }
          return m;
        }));
        await MessageService.toggleReaction(msgId, emoji);
      }
    } catch (err) {
      console.log('Action failed:', err);
    } finally {
      setSelectedMsg(null);
    }
  };

  const openMsgMenu = (msg: any) => {
    setSelectedMsg(msg);
    setShowMsgMenu(true);
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const senderId = item.sender?._id || item.senderId || item.sender || item.userId;
    const isMe = String(senderId) === String(myId);
    
    // Add debug log to figure out the ID mismatch
    // console.log(`Msg from ${senderId}, myId is ${myId}, isMe: ${isMe}`);

    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    const text = item.text || item.content || '';
    const mediaUrl = item.mediaUrl || item.media?.url || '';
    const msgType = item.type || 'text';

    const nextItem = messages[index - 1];
    const nextSenderId = nextItem?.sender?._id || nextItem?.senderId || nextItem?.sender || nextItem?.userId;
    const showAvatar = !isMe && String(nextSenderId) !== String(senderId);

    const showDateHeader = index === messages.length - 1 || !isSameDay(item.createdAt, messages[index + 1]?.createdAt);

    return (
      <View>
        {showDateHeader && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <View style={{ backgroundColor: 'rgba(74,55,40,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: C.mid }}>
                {formatMessageDate(item.createdAt)}
              </Text>
            </View>
          </View>
        )}
        <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
        {!isMe && (
          <View style={styles.avatarCol}>
            {showAvatar ? (
              <TouchableOpacity onPress={() => userId && navigation.navigate('Profile', { userId })}>
                <Image 
                  source={{ 
                    uri: chatUserAvatar && chatUserAvatar.startsWith('http') && !chatUserAvatar.includes('pixabay.com') 
                      ? chatUserAvatar 
                      : getAvatarFallback(chatUserName) 
                  }} 
                  style={styles.msgAvatar}
                  onError={() => {
                    setChatUserAvatar(getAvatarFallback(chatUserName));
                  }}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.msgAvatarPlaceholder} />
            )}
          </View>
        )}

        <View style={{ position: 'relative', maxWidth: '75%' }}>
          <TouchableOpacity
            style={[
              styles.bubble, 
              isMe ? styles.bubbleMe : styles.bubbleOther,
              highlightedMsgId === (item._id || item.id || item.messageId) && { backgroundColor: C.highlight }
            ]}
            onPress={() => {
              if (item.status === 'uploading') return;
              if (mediaUrl) {
                if (msgType === 'image' || msgType === 'photo') {
                  setFullScreenImage(mediaUrl);
                } else if (msgType !== 'video') {
                  let url = mediaUrl;
                  if (url.includes('cloudinary.com')) {
                    if (url.includes('/raw/upload/')) {
                      url = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
                    } else if (url.includes('/upload/')) {
                      url = url.replace('/upload/', '/upload/fl_attachment/');
                    }
                  }
                  const finalUrl = encodeURI(url);
                  handleFileDownload(finalUrl);
                }
              }
            }}
            onLongPress={() => openMsgMenu(item)}
            delayLongPress={250}
            activeOpacity={0.85}
          >
            {item.isPinned && (
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 14, paddingTop: 10 }}>
                 <Text style={{ fontSize: 10, color: isMe && highlightedMsgId !== (item._id || item.id || item.messageId) ? 'rgba(255,255,255,0.7)' : C.mid, fontWeight: 'bold' }}>📌 Pinned</Text>
               </View>
            )}

            {(item.metadata?.replyToId || item.metadata?.replyToText) ? (
              <TouchableOpacity 
                style={{ backgroundColor: isMe && highlightedMsgId !== (item._id || item.id || item.messageId) ? 'rgba(255,255,255,0.1)' : 'rgba(74,55,40,0.07)', borderRadius: 8, padding: 8, marginHorizontal: 10, marginBottom: 6, marginTop: 10, borderLeftWidth: 3, borderLeftColor: isMe && highlightedMsgId !== (item._id || item.id || item.messageId) ? '#fff' : C.dark }}
                onPress={() => handleScrollToMessage(item.metadata?.replyToId)}
                activeOpacity={0.7}
              >
                 <Text style={{ fontSize: 11, fontWeight: '700', color: isMe && highlightedMsgId !== (item._id || item.id || item.messageId) ? 'rgba(255,255,255,0.85)' : C.dark, marginBottom: 2 }}>↩ Replying to</Text>
                 <Text style={{ fontSize: 12, color: isMe && highlightedMsgId !== (item._id || item.id || item.messageId) ? 'rgba(255,255,255,0.75)' : C.mid }} numberOfLines={2}>
                   {item.metadata?.replyToText || 'Original message'}
                 </Text>
              </TouchableOpacity>
            ) : null}

            {mediaUrl && (msgType === 'image' || msgType === 'photo') ? (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: mediaUrl }} style={styles.mediaImg} resizeMode="cover" />
                {item.status === 'uploading' && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }]}>
                    <TouchableOpacity onPress={() => cancelUpload(item._id || item.id || item.messageId)} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : mediaUrl && msgType === 'video' ? (
              <View style={[styles.mediaImg, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', position: 'relative' }]}>
                <Text style={{ color: '#fff', fontSize: 24 }}>▶️</Text>
                {item.status === 'uploading' && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }]}>
                    <TouchableOpacity onPress={() => cancelUpload(item._id || item.id || item.messageId)} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : mediaUrl ? (
              <TouchableOpacity
                onPress={() => {
                  if (item.status !== 'uploading' && mediaUrl) {
                    let url = mediaUrl;
                    if (url.includes('cloudinary.com')) {
                      if (url.includes('/raw/upload/')) {
                        url = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
                      } else if (url.includes('/upload/')) {
                        url = url.replace('/upload/', '/upload/fl_attachment/');
                      }
                    }
                    const finalUrl = encodeURI(url);
                    handleFileDownload(finalUrl);
                  }
                }}
                activeOpacity={item.status === 'uploading' ? 1 : 0.7}
                style={{ width: 220, height: 70, backgroundColor: isMe ? 'rgba(255,255,255,0.1)' : 'rgba(74,55,40,0.05)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', position: 'relative' }}
              >
                <Text style={{ fontSize: 28, marginRight: 10 }}>📄</Text>
                <Text style={{ color: isMe ? '#fff' : C.dark, fontSize: 14, fontWeight: '600' }}>Document File</Text>
                {item.status === 'uploading' && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' }]}>
                    <TouchableOpacity onPress={() => cancelUpload(item._id || item.id || item.messageId)} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ) : null}

            {!!text && (
              <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther, (mediaUrl || item.isPinned) && { paddingHorizontal: 16 }]}>
                {text}
              </Text>
            )}

            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeOther]}>
                {timeStr}
              </Text>
              {isMe && (
                <Text style={{ fontSize: 10, color: (item.status === 'SEEN' || item.status === 'seen') ? '#34B7F1' : (isMe ? 'rgba(255,255,255,0.7)' : C.mid), marginLeft: 4 }}>
                  {item.status === 'sending' || item.status === 'uploading' ? '⏳' : 
                   (item.status === 'SEEN' || item.status === 'seen' ? '✓✓' : 
                   (item.status === 'DELIVERED' || item.status === 'delivered' ? '✓✓' : '✓'))}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {item.reactions && item.reactions.length > 0 && (
            <View style={[styles.reactionBadge, isMe ? { right: 8 } : { left: 8 }]} pointerEvents="none">
              {item.reactions.slice(0, 3).map((r: any, idx: number) => (
                <Text key={idx} style={{ fontSize: 12 }}>{r.emoji}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
    );
  };

  const inputPaddingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerProfile} onPress={() => {
          if (userId) navigation.navigate('Profile', { userId });
        }}>
          <View style={styles.avatarWrap}>
            <Image 
              source={{ 
                uri: chatUserAvatar && chatUserAvatar.startsWith('http') && !chatUserAvatar.includes('pixabay.com') 
                  ? chatUserAvatar 
                  : getAvatarFallback(chatUserName) 
              }} 
              style={styles.headerAvatar} 
              onError={() => {
                setChatUserAvatar(getAvatarFallback(chatUserName));
              }}
            />
            {paramIsOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{chatUserName || 'Chat'}</Text>
            {isOtherTyping ? (
              <Text style={{ fontSize: 11, color: '#44b264', fontStyle: 'italic', fontWeight: '600' }}>typing...</Text>
            ) : chatUserRole ? (
              <Text style={styles.headerRole} numberOfLines={1}>{chatUserRole}</Text>
            ) : paramIsOnline ? (
              <Text style={styles.headerOnlineLabel}>Online</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerActionBtn} onPress={() => setShowHeaderMenu(true)}>
          <MoreIcon />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >

      {pinnedMessages.length > 0 && (
        <TouchableOpacity
          style={styles.pinnedBanner}
          activeOpacity={0.8}
          onPress={() => {
            const pinMsg = pinnedMessages[0];
            const pinId = pinMsg._id || pinMsg.id || pinMsg.messageId;
            const idx = messages.findIndex(m => (m._id || m.id || m.messageId) === pinId);
            if (idx >= 0) {
              flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
            }
          }}
        >
          <Text style={styles.pinnedBannerIcon}>📌</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pinnedBannerLabel}>Pinned Message</Text>
            <Text style={styles.pinnedBannerText} numberOfLines={1}>
              {pinnedMessages[0]?.text || pinnedMessages[0]?.content || '📎 Media'}
            </Text>
          </View>
          {pinnedMessages.length > 1 && (
            <Text style={styles.pinnedBannerCount}>{pinnedMessages.length}</Text>
          )}
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id || item.id || item.messageId || Math.random().toString()}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setShowSuggestions(false)}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={C.dark} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No messages yet. Say hi! 👋</Text>
          )
        }
      />

      {showSuggestions && messages.length === 0 && !loading && (
        <View style={styles.suggestionsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => { setMessage(s); setShowSuggestions(false); }}
                activeOpacity={0.75}
              >
                <Text style={styles.suggestionChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

        {replyingToMsg && (
          <View style={{ backgroundColor: C.headerBg, paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border + '55' }}>
            <View style={{ flex: 1, backgroundColor: C.inputBg, borderRadius: 8, padding: 8, borderLeftWidth: 4, borderLeftColor: C.dark }}>
               <Text style={{ fontSize: 12, fontWeight: '700', color: C.dark }}>Replying to {String(replyingToMsg.sender?._id || replyingToMsg.senderId) === String(myId) ? 'Yourself' : chatUserName}</Text>
               <Text style={{ fontSize: 13, color: C.mid, marginTop: 2 }} numberOfLines={1}>{replyingToMsg.text || 'Media attachment'}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingToMsg(null)} style={{ padding: 12 }}>
               <Text style={{ fontSize: 18, color: C.mid, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputBar, { paddingBottom: inputPaddingBottom + 4 }]}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowAttachMenu(true)}
            disabled={isUploading || loading}
            activeOpacity={0.7}
          >
            {isUploading ? <ActivityIndicator size="small" color={C.mid} /> : <AttachIcon />}
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={C.mid}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (message.trim().length > 0 || isSending) && styles.sendBtnActive]}
            onPress={handleSend}
            disabled={isSending || loading}
          >
            {isSending ? <ActivityIndicator size="small" color="#fff" /> : <SendIcon active={message.trim().length > 0} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showMsgMenu} transparent animationType="fade" onRequestClose={() => setShowMsgMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMsgMenu(false)} />
        <View style={styles.msgMenuContent}>
          <View style={styles.reactionRow}>
            {['👍', '❤️', '😂', '😮', '😢', '🔥'].map((emoji) => (
              <TouchableOpacity key={emoji} onPress={() => handleMsgAction('react', emoji)} style={styles.reactionBtn}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleMsgAction('reply')}>
            <Text style={styles.modalActionText}>↩️ Reply to Message</Text>
          </TouchableOpacity>

          {selectedMsg && (selectedMsg.mediaUrl || selectedMsg.media?.url) && (
            <>
              <View style={styles.modalDivider} />
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleMsgAction('download')}>
                <Text style={styles.modalActionText}>⬇️ Download File</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleMsgAction('pin')}>
            <Text style={styles.modalActionText}>{selectedMsg?.isPinned ? '📌 Unpin Message' : '📌 Pin Message'}</Text>
          </TouchableOpacity>
          
          {selectedMsg && String(selectedMsg.sender?._id || selectedMsg.senderId) === String(myId) && (
            <>
              <View style={styles.modalDivider} />
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleMsgAction('delete')}>
                <Text style={[styles.modalActionText, { color: '#e63946' }]}>🗑 Delete Message</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      <Modal visible={showAttachMenu} transparent animationType="slide" onRequestClose={() => setShowAttachMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)} />
        <View style={[styles.attachMenuContent, { paddingBottom: insets.bottom + 16 }]}>
           <View style={styles.modalHandle} />
           <Text style={styles.attachMenuTitle}>Share attachment</Text>
           
           <View style={styles.attachGrid}>
              <TouchableOpacity style={styles.attachOption} onPress={handleLaunchMedia}>
                 <View style={[styles.attachIconWrap, { backgroundColor: '#e8f0fe' }]}>
                   <MediaIcon />
                 </View>
                 <Text style={styles.attachLabel}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={handleLaunchCamera}>
                 <View style={[styles.attachIconWrap, { backgroundColor: '#fce8e6' }]}>
                   <CameraIcon />
                 </View>
                 <Text style={styles.attachLabel}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={handleLaunchDocument}>
                 <View style={[styles.attachIconWrap, { backgroundColor: '#e6f4ea' }]}>
                   <DocumentIcon />
                 </View>
                 <Text style={styles.attachLabel}>Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={() => { setShowAttachMenu(false); Alert.alert('Coming soon', 'GIFs will be available in the next update.'); }}>
                 <View style={[styles.attachIconWrap, { backgroundColor: '#fef7e0' }]}>
                   <GifIcon />
                 </View>
                 <Text style={styles.attachLabel}>GIF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.attachOption} onPress={() => { setShowAttachMenu(false); Alert.alert('Coming soon', 'Mentions will be available in the next update.'); }}>
                 <View style={[styles.attachIconWrap, { backgroundColor: '#f3e8fd' }]}>
                   <MentionIcon />
                 </View>
                 <Text style={styles.attachLabel}>Mention</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

      <Modal visible={showHeaderMenu} transparent animationType="fade" onRequestClose={() => setShowHeaderMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHeaderMenu(false)} />
        <View style={styles.msgMenuContent}>
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('view_linkedin')}>
            <Text style={styles.modalActionText}>🔗 View LinkedIn</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('unmute')}>
            <Text style={styles.modalActionText}>🔔 Unmute</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('mark_unread')}>
            <Text style={styles.modalActionText}>✉️ Mark as unread</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('archive')}>
            <Text style={styles.modalActionText}>📦 Archive</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('report')}>
            <Text style={styles.modalActionText}>⚠️ Report</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('block')}>
            <Text style={[styles.modalActionText, { color: '#e63946' }]}>🚫 Block</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleHeaderAction('delete')}>
            <Text style={[styles.modalActionText, { color: '#e63946' }]}>🗑 Delete conversation</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ─── Full Screen Image Modal ─── */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          {fullScreenImage && (
            <ImageViewer 
              imageUrls={[{ url: fullScreenImage }]}
              enableSwipeDown={true}
              onSwipeDown={() => setFullScreenImage(null)}
              renderHeader={() => (
                <TouchableOpacity 
                  style={{ position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 9999, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }} 
                  onPress={() => setFullScreenImage(null)}
                >
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', width: 24, textAlign: 'center' }}>✕</Text>
                </TouchableOpacity>
              )}
              renderIndicator={() => <View />}
              backgroundColor="transparent"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBackBtn: { padding: 8, marginRight: 2 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative', marginRight: 12 },
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: '#e0e0e0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: C.onlineGreen,
    borderWidth: 2,
    borderColor: C.headerBg,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.headerText,
    letterSpacing: 0.1,
  },
  headerRole: {
    fontSize: 12,
    color: C.subtext,
    marginTop: 1,
  },
  headerOnlineLabel: {
    fontSize: 12,
    color: C.onlineGreen,
    fontWeight: '600',
    marginTop: 1,
  },
  headerActionBtn: { padding: 10 },
  // ─── List ───
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: C.mid,
    fontSize: 14,
  },
  // ─── Message Rows ───
  msgRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  avatarCol: { width: 34, marginRight: 8, justifyContent: 'flex-end' },
  msgAvatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.border },
  msgAvatarPlaceholder: { width: 34, height: 34 },
  // ─── Bubbles ───
  bubble: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bubbleMe: {
    backgroundColor: C.bubbleMe,
    borderBottomRightRadius: 4,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleOther: {
    backgroundColor: C.bubbleOther,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  bubbleTextMe: { color: C.textMe },
  bubbleTextOther: { color: C.textOther },
  mediaImg: {
    width: 240,
    height: 180,
    backgroundColor: '#e0e0e0',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 7,
    paddingTop: 2,
  },
  bubbleTime: { fontSize: 10 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },
  bubbleTimeOther: { color: C.subtext },
  reactionBadge: {
    position: 'absolute',
    bottom: -9,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // ─── Input Bar ───
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: C.inputBg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  input: {
    fontSize: 15,
    color: C.dark,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d0cdc8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendBtnActive: { backgroundColor: C.accent },
  suggestionsWrap: {
    backgroundColor: C.bg,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: C.border + '66',
  },
  suggestionsRow: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#fff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionChipText: {
    fontSize: 13,
    color: C.dark,
    fontWeight: '600',
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.highlight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border + '88',
    gap: 10,
  },
  pinnedBannerIcon: {
    fontSize: 16,
  },
  pinnedBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.dark,
    letterSpacing: 0.3,
  },
  pinnedBannerText: {
    fontSize: 13,
    color: C.mid,
    marginTop: 1,
  },
  pinnedBannerCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: C.dark,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  // ─── Modals ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  msgMenuContent: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 36,
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reactionBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#f3f2ef',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: { fontSize: 22 },
  modalDivider: { height: 1, backgroundColor: C.border },
  modalActionBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  modalActionText: { fontSize: 15, fontWeight: '600', color: C.dark },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#d0d0d0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  attachMenuContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  attachMenuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  attachGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachOption: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 20,
  },
  attachIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attachLabel: {
    fontSize: 12,
    color: C.dark,
    fontWeight: '600',
  },
});
