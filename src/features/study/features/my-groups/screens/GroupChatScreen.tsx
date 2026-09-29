import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard,
  ActivityIndicator, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/types';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { colors } from '../../../theme/colors';
import { useAppSelector } from '../../../store';
import { StudyService, fetchChatUsers, getCachedUserName, getCachedUserAvatar, cacheUserFromPayload } from '../../../../../services/study.service';
import {
  joinGroupChat,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
  reactToChatMessage,
  pinChatMessage,
  onNewMessage,
  onMessageEdited,
  onMessageDeleted,
  onMessageReactionUpdated,
  onMessagePinUpdated,
  onJoinedGroup,
  removeChatListeners,
  getSocket,
} from '../../../../../services/socket.service';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Reaction { emoji: string; users: string[]; }

interface Message {
  _id: string;
  sender: any; // populated: { _id, name, avatar, email } or userId string
  content: string;
  messageType?: string;
  createdAt: string;
  updatedAt?: string;
  readBy: string[];
  reactions: Reaction[];
  isPinned: boolean;
  // replyTo: number | null;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: any;
  groupId: string;
}

const EMOJIS = ['👍', '❤️', '😊', '👏', '🔥', '💪', '✅'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
}

function getSenderName(sender: any): string {
  if (!sender) return 'Unknown';
  if (typeof sender === 'string') return getCachedUserName(sender);
  const senderId = sender._id || sender.userId || sender.id;
  if (senderId) return getCachedUserName(senderId);
  const fullName = [sender.firstName, sender.lastName].filter(Boolean).join(' ').trim();
  return fullName || sender.name || sender.username || sender.email?.split('@')[0] || 'User';
}

function getSenderId(sender: any): string {
  if (!sender) return '';
  if (typeof sender === 'string') return String(sender);
  return String(sender.userId || sender._id || sender.id || '');
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export function GroupChatScreen({ route }: any) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const groupId: string = String(route?.params?.groupId ?? '');
  const groupName: string = route?.params?.groupName ?? 'Group Chat';

  const myProfile = useAppSelector((state) => state.profile.data);
  const myUserId = myProfile?.userId || '';

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState(false);

  const pinnedMessages = messages.filter(m => m.isPinned);

  // ── Load history + join socket room ──────────────────────────────────────────
  useEffect(() => {
    if (!groupId) return;

    // Join the group socket room for real-time events
    joinGroupChat(groupId);

    // Fetch message history via REST
    (async () => {
      try {
        const res = await StudyService.getChatMessages(groupId, 1, 100);
        const raw = res?.data;
        const msgs: Message[] = raw?.messages || (Array.isArray(raw) ? raw : []);
        const filtered = msgs.filter(m => !m.isDeleted);
        setMessages(filtered);

        // Fetch user details for all senders
        const senderIds = Array.from(new Set(filtered
          .map(m => getSenderId(m.sender))
          .filter(Boolean)
        ));
        if (senderIds.length > 0) {
          await fetchChatUsers(senderIds);
          setMessages(prev => [...prev]);
        }

        console.log(`💬 [Chat] Loaded ${filtered.length} messages, fetched ${senderIds.length} user profiles`);
      } catch (err: any) {
        console.error('❌ [Chat] Failed to load messages:', err.message);
      } finally {
        setLoading(false);
      }
    })();

    // ── Socket listeners ──────────────────────────────────────────────────
    onJoinedGroup((data) => {
      console.log('✅ [Chat] Joined group room:', data.groupId);
    });

    const unsubNewMessage = onNewMessage((msg: Message) => {
      console.log('💬 [Chat] New message received:', msg._id);
      if (msg.sender) cacheUserFromPayload(msg.sender);
      setMessages(prev => {
        // Dedup by _id
        if (prev.find(m => m._id === msg._id)) return prev;

        // Replace optimistic message with real one
        const senderId = getSenderId(msg.sender);
        const optimisticIdx = prev.findIndex(
          m => m._id.startsWith('temp-') && m.content === msg.content && getSenderId(m.sender) === senderId
        );
        if (optimisticIdx >= 0) {
          const updated = [...prev];
          updated[optimisticIdx] = msg;
          return updated;
        }

        return [...prev, msg];
      });
    });

    const unsubMessageEdited = onMessageEdited((data) => {
      setMessages(prev =>
        prev.map(m => m._id === data._id ? { ...m, content: data.content, isEdited: true } : m)
      );
    });

    const unsubMessageDeleted = onMessageDeleted((data) => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    });

    const unsubMessageReactionUpdated = onMessageReactionUpdated((data) => {
      setMessages(prev =>
        prev.map(m => m._id === data.messageId ? { ...m, reactions: data.reactions } : m)
      );
    });

    const unsubMessagePinUpdated = onMessagePinUpdated((data) => {
      setMessages(prev =>
        prev.map(m => m._id === data.messageId ? { ...m, isPinned: data.isPinned } : m)
      );
    });

    return () => {
      if (typeof unsubNewMessage === 'function') unsubNewMessage();
      if (typeof unsubMessageEdited === 'function') unsubMessageEdited();
      if (typeof unsubMessageDeleted === 'function') unsubMessageDeleted();
      if (typeof unsubMessageReactionUpdated === 'function') unsubMessageReactionUpdated();
      if (typeof unsubMessagePinUpdated === 'function') unsubMessagePinUpdated();
    };
  }, [groupId]);

  // Auto-scroll on new message
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!input.trim()) return;
    const content = input.trim();

    if (editingMsg) {
      editChatMessage(editingMsg._id, content);
      setMessages(prev =>
        prev.map(m => m._id === editingMsg._id ? { ...m, content, isEdited: true } : m)
      );
      setEditingMsg(null);
      setInput('');
      Keyboard.dismiss();
      return;
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticMsg: Message = {
      _id: tempId,
      sender: myUserId,
      content,
      createdAt: new Date().toISOString(),
      readBy: [myUserId],
      reactions: [],
      isPinned: false,
      groupId,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Send — socket first, REST fallback
    const s = getSocket();
    if (s.connected) {
      sendChatMessage({ groupId, content, replyTo: replyingTo || undefined });
    } else {
      console.log('💬 [Chat] Socket down, sending via REST API');
      StudyService.sendChatMessage(groupId, content).catch(err => {
        console.error('❌ [Chat] REST send failed:', err.message);
      });
    }

    setInput('');
    setReplyingTo(null);
    Keyboard.dismiss();
  };

  const handleDelete = (msgId: string) => {
    Alert.alert('Delete Message', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          deleteChatMessage(msgId);
          // Optimistic remove
          setMessages(prev => prev.filter(m => m._id !== msgId));
        },
      },
    ]);
    setActiveMenu(null);
  };

  const handlePin = (msgId: string) => {
    pinChatMessage(msgId);
    setActiveMenu(null);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    reactToChatMessage(msgId, emoji);
    setEmojiPickerFor(null);
  };

  const dismissOverlays = () => { setActiveMenu(null); setEmojiPickerFor(null); };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderDateSep = (dateStr: string) => (
    <View style={s.dateSep}>
      <View style={s.dateLine} />
      <Text style={s.dateTxt}>{formatDate(dateStr)}</Text>
      <View style={s.dateLine} />
    </View>
  );

  const renderMessage = (msg: Message, idx: number) => {
    const senderId = getSenderId(msg.sender);
    const isOwn = senderId === String(myUserId);
    const prevMsg = messages[idx - 1];
    const showDate = idx === 0 || formatDate(msg.createdAt) !== formatDate(prevMsg?.createdAt || '');
    const replySource = msg.replyTo ? messages.find(m => m._id === msg.replyTo?._id || m._id === msg.replyTo) : null;
    const menuOpen = activeMenu === msg._id;
    const pickerOpen = emojiPickerFor === msg._id;
    const avatarUrl = getCachedUserAvatar(senderId);

    return (
      <View key={msg._id}>
        {showDate && renderDateSep(msg.createdAt)}
        <View style={[s.msgRow, isOwn && s.msgRowOwn]}>
          {!isOwn && (
            <View style={s.avatar}>
              {avatarUrl ? (
                <Image
                  // OLD: source={{ uri: avatarUrl && !avatarUrl.startsWith('http') ? `${Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'}/api/v1/profile/profile-photo/get-photo/${avatarUrl}` : avatarUrl }}
                  source={{ uri: avatarUrl && !avatarUrl.startsWith('http') ? `${ENV_API_BASE_URL}/api/v1/profile/profile-photo/get-photo/${avatarUrl}` : avatarUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 99 }}
                />
              ) : (
                <Text style={[s.avatarEmoji, { fontSize: 14, fontWeight: '800', color: colors.primary }]}>
                  {getSenderName(msg.sender).charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
          <View style={[s.bubbleCol, isOwn && s.bubbleColOwn]}>
            {!isOwn && <Text style={s.senderName}>{getSenderName(msg.sender)}</Text>}

            {replySource && (
              <View style={[s.replyPreview, isOwn && s.replyPreviewOwn]}>
                <Text style={s.replyLine} numberOfLines={1}>
                  ↩ {getSenderName(replySource.sender)}: {replySource.content}
                </Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={() => { setActiveMenu(menuOpen ? null : msg._id); setEmojiPickerFor(null); }}
              onPress={() => { if (menuOpen || pickerOpen) dismissOverlays(); }}
              style={[s.bubble, isOwn ? s.bubbleOwn : s.bubbleOther]}
            >
              <Text style={[s.bubbleTxt, isOwn && s.bubbleTxtOwn]}>{msg.content}</Text>
              <View style={s.bubbleFooter}>
                <Text style={[s.bubbleTime, isOwn && s.bubbleTimeOwn]}>
                  {formatTime(msg.createdAt)}{msg.isEdited ? ' · edited' : ''}
                </Text>
                {isOwn && (
                  <Text style={s.readTick}>
                    {msg.readBy?.length > 1 ? '✓✓' : '✓'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Reactions */}
            {msg.reactions?.length > 0 && (
              <View style={[s.reactionsRow, isOwn && s.reactionsRowOwn]}>
                {msg.reactions.map((r: Reaction) => (
                  <TouchableOpacity
                    key={r.emoji}
                    style={[s.reactionChip, r.users?.includes(String(myUserId)) && s.reactionChipActive]}
                    onPress={() => handleReaction(msg._id, r.emoji)}
                  >
                    <Text style={s.reactionEmoji}>{r.emoji}</Text>
                    <Text style={s.reactionCount}>{r.users?.length || 0}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Context menu */}
            {menuOpen && (
              <View style={[s.menu, isOwn ? s.menuOwn : s.menuOther]}>
                {[
                  { label: '↩  Reply', onPress: () => { setReplyingTo(msg._id); setActiveMenu(null); }, danger: false },
                  { label: '😊  React', onPress: () => { setEmojiPickerFor(msg._id); setActiveMenu(null); }, danger: false },
                  { label: msg.isPinned ? '📌  Unpin' : '📌  Pin', onPress: () => handlePin(msg._id), danger: false },
                  ...(isOwn ? [
                    { label: '✏️  Edit', onPress: () => { setEditingMsg(msg); setInput(msg.content); setActiveMenu(null); }, danger: false },
                    { label: '🗑  Delete', onPress: () => handleDelete(msg._id), danger: true },
                  ] : []),
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <View style={s.menuDivider} />}
                    <TouchableOpacity style={s.menuItem} onPress={item.onPress}>
                      <Text style={[s.menuItemTxt, item.danger && { color: colors.error }]}>{item.label}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* Emoji picker */}
            {pickerOpen && (
              <View style={[s.emojiPicker, isOwn ? s.emojiPickerOwn : s.emojiPickerOther]}>
                {EMOJIS.map(emoji => (
                  <TouchableOpacity key={emoji} onPress={() => handleReaction(msg._id, emoji)} style={s.emojiBtn}>
                    <Text style={s.emojiTxt}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={s.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle} numberOfLines={1}>{groupName}</Text>
            <Text style={s.headerSub}>Group chat · {messages.length} messages</Text>
          </View>
          {pinnedMessages.length > 0 && (
            <TouchableOpacity onPress={() => setShowPinned(p => !p)} style={s.pinBtn}>
              <Text style={s.pinBtnTxt}>📌 {pinnedMessages.length}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pinned banner */}
        {showPinned && pinnedMessages.length > 0 && (
          <View style={s.pinnedBanner}>
            <Text style={s.pinnedLabel}>📌 PINNED MESSAGES</Text>
            {pinnedMessages.map(m => (
              <Text key={m._id} style={s.pinnedMsg} numberOfLines={1}>
                <Text style={s.pinnedSender}>{getSenderName(m.sender)}: </Text>{m.content}
              </Text>
            ))}
          </View>
        )}

        {/* Messages */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>Loading messages...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={dismissOverlays}
            onTouchStart={dismissOverlays}
          >
            {messages.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Text style={{ fontSize: 40 }}>💬</Text>
                <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 14 }}>No messages yet. Say hello!</Text>
              </View>
            ) : (
              messages.map((msg, idx) => renderMessage(msg, idx))
            )}
          </ScrollView>
        )}

        {/* Reply / Edit banner */}
        {(replyingTo !== null || editingMsg !== null) && (
          <View style={s.contextBanner}>
            <Text style={s.contextBannerTxt} numberOfLines={1}>
              {editingMsg
                ? `✏️ Editing: ${editingMsg.content}`
                : `↩ Replying to: ${messages.find(m => m._id === replyingTo)?.content ?? ''}`}
            </Text>
            <TouchableOpacity onPress={() => { setReplyingTo(null); setEditingMsg(null); setInput(''); }}>
              <Text style={s.contextBannerX}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={editingMsg ? 'Edit message...' : 'Type a message...'}
            placeholderTextColor={colors.textMuted}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={s.sendTxt}>{editingMsg ? '✓' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5, borderBottomColor: colors.borderBrown, gap: 10,
  },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: colors.primaryLight, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '900', color: colors.primary },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  pinBtn: {
    backgroundColor: '#fef3c7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#fde68a',
  },
  pinBtnTxt: { fontSize: 12, fontWeight: '700', color: '#92400e' },
  pinnedBanner: {
    backgroundColor: '#fef9e7', borderBottomWidth: 1, borderBottomColor: '#fde68a',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  pinnedLabel: { fontSize: 10, fontWeight: '800', color: '#92400e', marginBottom: 5 },
  pinnedMsg: { fontSize: 12, color: '#78350f', marginBottom: 2 },
  pinnedSender: { fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingVertical: 14, paddingBottom: 8 },
  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.borderBrown },
  dateTxt: {
    fontSize: 10, fontWeight: '700', color: colors.textMuted,
    paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: colors.backgroundMid, borderRadius: 20,
  },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1.5, borderColor: colors.borderBrown,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  avatarEmoji: { fontSize: 18 },
  bubbleCol: { flex: 1, alignItems: 'flex-start', maxWidth: '82%' },
  bubbleColOwn: { alignItems: 'flex-end' },
  senderName: { fontSize: 11, fontWeight: '800', color: colors.primaryLight, marginBottom: 3, marginLeft: 4 },
  replyPreview: {
    backgroundColor: 'rgba(74,55,40,0.08)',
    borderLeftWidth: 3, borderLeftColor: colors.primaryLight,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4, maxWidth: '100%',
  },
  replyPreviewOwn: { borderLeftColor: 'rgba(255,255,255,0.5)' },
  replyLine: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%', minWidth: 60 },
  bubbleOther: {
    backgroundColor: colors.surface, borderWidth: 1.5,
    borderColor: colors.borderBrown, borderBottomLeftRadius: 4,
  },
  bubbleOwn: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTxt: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTxtOwn: { color: '#ffffff' },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  bubbleTime: { fontSize: 10, color: colors.textMuted },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.65)' },
  readTick: { fontSize: 11, color: '#93c5fd' },
  reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5, marginLeft: 4 },
  reactionsRowOwn: { justifyContent: 'flex-end', marginLeft: 0, marginRight: 4 },
  reactionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.surfaceWarm, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1.5, borderColor: colors.borderBrown,
  },
  reactionChipActive: { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, fontWeight: '700', color: colors.primaryMid },
  menu: {
    position: 'absolute', bottom: '100%', marginBottom: 6,
    backgroundColor: colors.surface, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    minWidth: 160, zIndex: 100, borderWidth: 1, borderColor: colors.borderBrown, overflow: 'hidden',
  },
  menuOther: { left: 0 },
  menuOwn: { right: 0 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 11 },
  menuItemTxt: { fontSize: 13, fontWeight: '600', color: colors.text },
  menuDivider: { height: 1, backgroundColor: colors.borderBrown },
  emojiPicker: {
    position: 'absolute', bottom: '100%', marginBottom: 6,
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 28, paddingHorizontal: 8, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 7,
    borderWidth: 1, borderColor: colors.borderBrown, zIndex: 100,
  },
  emojiPickerOther: { left: 0 },
  emojiPickerOwn: { right: 0 },
  emojiBtn: { padding: 4 },
  emojiTxt: { fontSize: 22 },
  contextBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe',
    borderTopWidth: 1, borderTopColor: '#bae6fd',
    paddingHorizontal: 16, paddingVertical: 8, gap: 10,
  },
  contextBannerTxt: { flex: 1, fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' },
  contextBannerX: { fontSize: 14, color: '#0369a1', fontWeight: '700', padding: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.surface, borderTopWidth: 1.5, borderTopColor: colors.borderBrown, gap: 8,
  },
  textInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.borderBrown,
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: colors.text, backgroundColor: colors.backgroundMid,
    maxHeight: 120, minHeight: 42,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.borderBrown },
  sendTxt: { fontSize: 16, color: '#fff', fontWeight: '800' },
});