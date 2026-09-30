import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@env';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import TokenStorage from '../store/token.storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoomParticipant {
  userId: string;
  userName: string;
  socketId: string;
}

export interface UserJoinedPayload {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface UserLeftPayload {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface UserCameraTogglePayload {
  userId: string;
  cameraOn: boolean;
  timestamp: Date;
}

export interface UserMicTogglePayload {
  userId: string;
  micOn: boolean;
  timestamp: Date;
}

export interface RoomParticipantsListPayload {
  roomId: string;
  participants: RoomParticipant[];
  count: number;
}

// ─── Permission Helpers ────────────────────────────────────────────────────────

export async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    try {
      // @ts-ignore
      const { check, request, RESULTS, PERMISSIONS } = await import('react-native-permissions');
      const result = await check(PERMISSIONS.IOS.MICROPHONE);
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return true;
      const reqResult = await request(PERMISSIONS.IOS.MICROPHONE);
      return reqResult === RESULTS.GRANTED || reqResult === RESULTS.LIMITED;
    } catch {
      return true; // Fallback: let the OS handle it
    }
  }

  // Android: Use PermissionsAndroid
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'This app needs access to your microphone for voice chat in study rooms.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('⚠️ Mic permission error:', err);
    return false;
  }
}

export async function requestCamPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    try {
      // @ts-ignore
      const { check, request, RESULTS, PERMISSIONS } = await import('react-native-permissions');
      const result = await check(PERMISSIONS.IOS.CAMERA);
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) return true;
      const reqResult = await request(PERMISSIONS.IOS.CAMERA);
      return reqResult === RESULTS.GRANTED || reqResult === RESULTS.LIMITED;
    } catch {
      return true;
    }
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera for video chat in study rooms.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('⚠️ Camera permission error:', err);
    return false;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let socket: Socket | null = null;

// OLD: const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const BASE_URL = API_BASE_URL;

// ─── Get or create socket connection ──────────────────────────────────────────

export function getSocket(): Socket {
  // If socket exists and is connected, return it
  if (socket && socket.connected) {
    return socket;
  }

  // If socket exists but is disconnected/reconnecting, force it to connect
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  let socketUrl = BASE_URL;

  socket = io(socketUrl, {
    auth: (cb) => {
      const token = TokenStorage.getAccessToken();
      cb({ token });
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('✅ [Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ [Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.log('❌ [Socket] Connection error:', err.message);
  });

  return socket;
}

// ─── Disconnect ───────────────────────────────────────────────────────────────

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [Socket] Disconnected manually');
  }
}

let _activeLiveRoomId: string | null = null;
let _liveRoomRejoinListenerAdded = false;

export function joinLiveRoom(roomId: string): void {
  const s = getSocket();
  _activeLiveRoomId = roomId;

  if (s.connected) {
    s.emit('join-live-room', { roomId });
    console.log('📡 [Socket] Joining live room:', roomId);
  } else {
    console.warn('⚠️ [Socket] Not connected, will join room on connect');
    s.once('connect', () => {
      if (_activeLiveRoomId === roomId) {
        s.emit('join-live-room', { roomId });
        console.log('📡 [Socket] Joining live room (after connect):', roomId);
      }
    });
  }

  if (!_liveRoomRejoinListenerAdded) {
    _liveRoomRejoinListenerAdded = true;
    s.on('connect', () => {
      if (_activeLiveRoomId) {
        s.emit('join-live-room', { roomId: _activeLiveRoomId });
        console.log('📡 [Socket] Re-joined live room after reconnect:', _activeLiveRoomId);
      }
    });
  }
}

export function leaveLiveRoom(roomId: string): void {
  const s = getSocket();
  if (_activeLiveRoomId === roomId) {
    _activeLiveRoomId = null;
  }
  s.emit('leave-live-room', { roomId });
  console.log('📡 [Socket] Leaving live room:', roomId);
}

// OLD: returned Promise<void> — caller had no way to know if permission was denied
// export async function toggleCamera(roomId: string, cameraOn: boolean): Promise<void> { ... }

export async function toggleCamera(roomId: string, cameraOn: boolean): Promise<boolean> {
  // If turning ON, request camera permission first
  if (cameraOn) {
    const hasPermission = await requestCamPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required for video chat.');
      return false;
    }
  }

  const s = getSocket();
  if (!s.connected) {
    console.warn('⚠️ [Socket] Not connected, cannot toggle camera');
    return false;
  }
  s.emit('toggle-camera', { roomId, cameraOn });
  console.log('📷 [Socket] Camera toggle:', cameraOn);
  return true;
}

// OLD: returned Promise<void> — caller had no way to know if permission was denied
// export async function toggleMic(roomId: string, micOn: boolean): Promise<void> { ... }

export async function toggleMic(roomId: string, micOn: boolean): Promise<boolean> {
  // If turning ON, request mic permission first
  if (micOn) {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required for voice chat.');
      return false;
    }
  }

  const s = getSocket();
  if (!s.connected) {
    console.warn('⚠️ [Socket] Not connected, cannot toggle mic');
    return false;
  }
  s.emit('toggle-mic', { roomId, micOn });
  console.log('🎤 [Socket] Mic toggle:', micOn);
  return true;
}

export function toggleScreenShare(roomId: string, sharing: boolean): void {
  const s = getSocket();
  s.emit('toggle-screen-share', { roomId, sharing });
}

export function getRoomParticipants(roomId: string): void {
  const s = getSocket();
  s.emit('get-room-participants', { roomId });
}

// ─── WebRTC Signaling Methods ─────────────────────────────────────────────────

export function sendWebRTCOffer(roomId: string, targetUserId: string, offer: any): void {
  const s = getSocket();
  s.emit('webrtc-offer', { roomId, targetUserId, offer });
}

export function sendWebRTCAnswer(roomId: string, targetUserId: string, answer: any): void {
  const s = getSocket();
  s.emit('webrtc-answer', { roomId, targetUserId, answer });
}

export function sendWebRTCIceCandidate(roomId: string, targetUserId: string, candidate: any): void {
  const s = getSocket();
  s.emit('webrtc-ice-candidate', { roomId, targetUserId, candidate });
}

export function toggleSession(roomId: string, active: boolean): void {
  const s = getSocket();
  if (!s.connected) {
    console.warn('⚠️ [Socket] Not connected, cannot toggle session');
    return;
  }
  s.emit('toggle-session', { roomId, active });
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

export function onUserJoinedRoom(callback: (payload: { userId: string, userName: string, timestamp: Date }) => void): void {
  const s = getSocket();
  s.on('user-joined-room', callback);
}

export function onUserLeftRoom(callback: (payload: { userId: string, userName: string, timestamp: Date }) => void): void {
  const s = getSocket();
  s.on('user-left-room', callback);
}

export function onUserCameraToggle(callback: (payload: UserCameraTogglePayload) => void): void {
  const s = getSocket();
  s.on('user-camera-toggle', callback);
}

export function onUserMicToggle(callback: (payload: UserMicTogglePayload) => void): void {
  const s = getSocket();
  s.on('user-mic-toggle', callback);
}

export function onRoomParticipantsList(callback: (payload: any) => void): void {
  const s = getSocket();
  s.on('room-participants-list', callback);
}

export function onSessionToggled(callback: (payload: { roomId: string, session: { active: boolean, startedAt: number | null, accumulatedTime: number } }) => void): void {
  const s = getSocket();
  s.on('session-toggled', callback);
}

export function onSocketError(callback: (payload: { event: string; message: string }) => void): void {
  const s = getSocket();
  s.on('error', callback);
}

// ─── Notification Listeners ──────────────────────────────────────────────────

export function onNewNotification(callback: (payload: any) => void): () => void {
  const s = getSocket();
  s.on('notification:new', callback);
  return () => s.off('notification:new', callback);
}

export function onUnreadNotificationCount(callback: (payload: { count: number }) => void): () => void {
  const s = getSocket();
  s.on('notification:unread:count', callback);
  return () => s.off('notification:unread:count', callback);
}

export function onGroupRoomBroadcast(callback: (payload: any) => void): () => void {
  const s = getSocket();
  s.on('group-room-broadcast', callback);
  return () => s.off('group-room-broadcast', callback);
}

// ─── WebRTC Event Listeners ───────────────────────────────────────────────────

export function onWebRTCOfferReceived(callback: (payload: { fromUserId: string; roomId: string; offer: any }) => void): void {
  const s = getSocket();
  s.on('webrtc-offer-received', callback);
}

export function onWebRTCAnswerReceived(callback: (payload: { fromUserId: string; roomId: string; answer: any }) => void): void {
  const s = getSocket();
  s.on('webrtc-answer-received', callback);
}

export function onWebRTCIceCandidateReceived(callback: (payload: { fromUserId: string; roomId: string; candidate: any }) => void): void {
  const s = getSocket();
  s.on('webrtc-ice-candidate-received', callback);
}

// ─── Remove Listeners ─────────────────────────────────────────────────────────

export function removeLiveRoomListeners(): void {
  const s = getSocket();
  s.off('user-joined-room');
  s.off('user-left-room');
  s.off('user-camera-toggle');
  s.off('user-mic-toggle');
  s.off('room-participants-list');
  s.off('group-room-broadcast');
  s.off('error');
  s.off('webrtc-offer-received');
  s.off('webrtc-answer-received');
  s.off('webrtc-ice-candidate-received');
}

// ─── Chat Methods ─────────────────────────────────────────────────────────────

let _chatGroupId: string | null = null;
let _chatRejoinListenerAdded = false;

export function joinGroupChat(groupId: string): void {
  const s = getSocket();
  _chatGroupId = groupId;

  if (s.connected) {
    s.emit('join-group', groupId);
    console.log('📡 [Socket] Joining group chat:', groupId);
  }

  // Re-join on every reconnect (register listener only once)
  if (!_chatRejoinListenerAdded) {
    _chatRejoinListenerAdded = true;
    s.on('connect', () => {
      if (_chatGroupId) {
        s.emit('join-group', _chatGroupId);
        console.log('📡 [Socket] Re-joined group chat after reconnect:', _chatGroupId);
      }
    });
  }
}

/** Pending chat messages to flush on next connect */
const pendingMessages: { groupId: string; content: string; replyTo?: string }[] = [];

export function sendChatMessage(payload: { groupId: string; content: string; replyTo?: string }): void {
  const s = getSocket();

  if (s.connected) {
    s.emit('send-message', payload);
    console.log('💬 [Socket] Message sent:', payload.content.slice(0, 40));
    return;
  }

  // Not connected — queue and try to reconnect
  console.warn('⚠️ [Socket] Not connected, queuing message and reconnecting...');
  pendingMessages.push(payload);

  // Force reconnect
  s.connect();

  // Flush queue once connected
  const flush = () => {
    while (pendingMessages.length > 0) {
      const msg = pendingMessages.shift()!;
      s.emit('send-message', msg);
      console.log('💬 [Socket] Queued message sent:', msg.content.slice(0, 40));
    }
  };

  // Use both connect event and a short timeout as fallback
  s.once('connect', flush);
  setTimeout(() => {
    s.off('connect', flush); // clean up the once listener
    if (pendingMessages.length > 0) {
      if (s.connected) {
        flush();
      } else {
        console.warn('⚠️ [Socket] Still not connected after 3s, messages queued for next connect');
        s.once('connect', flush);
      }
    }
  }, 3000);
}

export function editChatMessage(messageId: string, content: string): void {
  const s = getSocket();
  // Backend listens for 'edit-message'
  s.emit('edit-message', { messageId, content });
}

export function deleteChatMessage(messageId: string): void {
  const s = getSocket();
  // Backend listens for 'delete-message'
  s.emit('delete-message', { messageId });
}

export function reactToChatMessage(messageId: string, emoji: string): void {
  const s = getSocket();
  // Backend listens for 'react-message'
  s.emit('react-message', { messageId, emoji });
}

export function pinChatMessage(messageId: string): void {
  const s = getSocket();
  // Backend listens for 'pin-message'
  s.emit('pin-message', { messageId });
}

export function onNewMessage(callback: (msg: any) => void): () => void {
  const s = getSocket();
  s.on('new-message', callback);
  return () => s.off('new-message', callback);
}

export function onMessageEdited(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('message-edited', callback);
  return () => s.off('message-edited', callback);
}

export function onMessageDeleted(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('message-deleted', callback);
  return () => s.off('message-deleted', callback);
}

export function onMessageReactionUpdated(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('message-reaction-updated', callback);
  return () => s.off('message-reaction-updated', callback);
}

export function onMessagePinUpdated(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('message-pin-updated', callback);
  return () => s.off('message-pin-updated', callback);
}

export function onJoinedGroup(callback: (data: any) => void): void {
  const s = getSocket();
  s.on('joined-group', callback);
}

export function removeChatListeners(): void {
  const s = getSocket();
  s.off('new-message');
  s.off('message-edited');
  s.off('message-deleted');
  s.off('message-reaction-updated');
  s.off('message-pin-updated');
  s.off('joined-group');
  _chatGroupId = null;
  // Reset flag so the rejoin listener is re-registered fresh on next joinGroupChat call
  _chatRejoinListenerAdded = false;
}

// ─── Direct Messages (1-on-1 chat) ───────────────────────────────────────────

export function joinConversation(conversationId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('conversation:join', conversationId);
    console.log('📡 [Socket] Joining conversation:', conversationId);
  }
}

export function leaveConversation(conversationId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('conversation:leave', conversationId);
    console.log('📡 [Socket] Leaving conversation:', conversationId);
  }
}

export function emitTyping(conversationId: string, isTyping: boolean): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('message:typing', { conversationId, isTyping });
  }
}

export function emitDelivered(messageId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('message:delivered', messageId);
  }
}

export function onMessageNew(callback: (msg: any) => void): () => void {
  const s = getSocket();
  s.on('message:new', callback);
  return () => s.off('message:new', callback);
}

export function onMessageStatus(callback: (payload: { messageId: string; conversationId: string; status: 'delivered' | 'seen'; updatedAt?: string }) => void): () => void {
  const s = getSocket();
  s.on('message:status', callback);
  return () => s.off('message:status', callback);
}

export function onTyping(callback: (payload: { conversationId: string; userId: string; isTyping: boolean }) => void): () => void {
  const s = getSocket();
  s.on('message:typing', callback);
  return () => s.off('message:typing', callback);
}

export function onConversationSeen(callback: (payload: { conversationId: string; seenBy: string; seenAt: string }) => void): () => void {
  const s = getSocket();
  s.on('conversation:seen', callback);
  return () => s.off('conversation:seen', callback);
}

export function onMessageReaction(callback: (payload: { messageId: string; reactions: Array<{ emoji: string; count: number }> }) => void): () => void {
  const s = getSocket();
  s.on('message:reaction', callback);
  return () => s.off('message:reaction', callback);
}

export function onDirectMessageDeleted(callback: (payload: { messageId: string; deletedAt?: string }) => void): () => void {
  const s = getSocket();
  s.on('message:deleted', callback);
  return () => s.off('message:deleted', callback);
}

export function onDirectMessageEdited(callback: (payload: { messageId: string; conversationId: string; text: string; editedAt?: string }) => void): () => void {
  const s = getSocket();
  s.on('message:edited', callback);
  return () => s.off('message:edited', callback);
}

// ── Mentorship WebSockets ───────────────────────────────────────────────────

export function notifyJoinMentorshipSession(sessionId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('mentorship:notify-join', { sessionId });
  }
}

export function sendMentorshipReaction(sessionId: string, emoji: '👍' | '❤️' | '😂' | '👏' | '🎉' | string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('mentorship:send-reaction', { sessionId, emoji });
  }
}

export function onMentorshipPeerJoined(
  callback: (payload: { sessionId: string; joinerRole: 'mentor' | 'mentee'; title: string }) => void
): () => void {
  const s = getSocket();
  s.on('mentorship:peer-joined', callback);
  return () => s.off('mentorship:peer-joined', callback);
}

export function onMentorshipReactionReceived(
  callback: (payload: { sessionId: string; emoji: string; fromUserId: string }) => void
): () => void {
  const s = getSocket();
  s.on('mentorship:reaction-received', callback);
  return () => s.off('mentorship:reaction-received', callback);
}
