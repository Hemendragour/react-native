import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';
import { RTCView } from 'react-native-webrtc';
import type { MediaStream as RTCMediaStream } from 'react-native-webrtc';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { colors } from '../../../theme/colors';
import type { RootStackParamList } from '../../../app/navigation/types';
import { useAppSelector } from '../../../store';
import { StudyService, fetchChatUsers, getCachedUserName, getCachedUserAvatar, cacheUserFromPayload } from '../../../../../services/study.service';
import {
  joinLiveRoom,
  leaveLiveRoom,
  toggleCamera,
  toggleMic,
  onUserJoinedRoom,
  onUserLeftRoom,
  onUserCameraToggle,
  onUserMicToggle,
  onRoomParticipantsList,
  onSocketError,
  removeLiveRoomListeners,
  getSocket,
  joinGroupChat,
  sendChatMessage,
  onNewMessage,
  removeChatListeners,
  onSessionToggled,
  onGroupRoomBroadcast,
} from '../../../../../services/socket.service';
import {
  GroupBroadcastService,
  GroupBroadcastItem,
} from '../../../../../services/group-broadcast.service';
import { BroadcastModal } from '../components/BroadcastModal';
import {
  initWebRTC,
  connectToParticipants,
  handleNewParticipant,
  removePeer,
  setMicEnabled,
  setCameraEnabled,
  cleanupWebRTC,
  getLocalStream,
} from '../../../../../services/webrtc.service';

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Member {
  id: string | number;
  name: string;
  avatar: string;
  isOnline: boolean;
  studyTime: number;
  rank: number;
  micOn: boolean;
  camOn: boolean;
  speaking: boolean;
}

interface Reaction { emoji: string; users: string[]; }

interface ChatMessage {
  _id: string;
  sender: any;
  content: string;
  messageType?: string;
  createdAt: string;
  updatedAt?: string;
  readBy: string[];
  reactions: Reaction[];
  isPinned: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: any;
  groupId: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function msgTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

export function GroupRoomScreen({ route }: any) {
  const navigation = useNavigation<NavProp>();
  const groupId: string | number = route?.params?.groupId ?? 1;
  const groupName: string = route?.params?.groupName ?? 'Focus JEE Warriors';

  const [sessionActive, setSessionActive] = useState(false);
  const [session, setSession] = useState<{ active: boolean, startedAt: number | null, accumulatedTime: number } | null>(null);
  const [studyTime, setStudyTime] = useState(0);

  // ── Personal local timer (auto-starts on join, fully user-controlled) ──────
  const [personalTime, setPersonalTime]       = useState(0);
  const [personalRunning, setPersonalRunning] = useState(false);
  const personalTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const personalStartRef  = useRef<number>(0);
  const personalAccumRef  = useRef<number>(0); // accumulated ms before last pause

  const startPersonalTimer = useCallback(() => {
    if (personalTimerRef.current) clearInterval(personalTimerRef.current);
    personalStartRef.current = Date.now();
    setPersonalRunning(true);
    personalTimerRef.current = setInterval(() => {
      const elapsed = personalAccumRef.current + (Date.now() - personalStartRef.current);
      setPersonalTime(Math.floor(elapsed / 1000));
    }, 1000);
  }, []);

  const stopPersonalTimer = useCallback(() => {
    if (personalTimerRef.current) { clearInterval(personalTimerRef.current); personalTimerRef.current = null; }
    personalAccumRef.current += Date.now() - personalStartRef.current;
    setPersonalRunning(false);
  }, []);

  const togglePersonalTimer = useCallback(() => {
    if (personalRunning) { stopPersonalTimer(); }
    else { startPersonalTimer(); }
  }, [personalRunning, startPersonalTimer, stopPersonalTimer]);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [webrtcReady, setWebrtcReady] = useState(false);
  const [audioConnections, setAudioConnections] = useState(0);
  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [remoteStreamUrls, setRemoteStreamUrls] = useState<Map<string, { url: string; hasVideo: boolean }>>(new Map());

  const myProfile = useAppSelector((state) => state.profile.data);
  const myUserId = myProfile?.userId || '';

  const [members, setMembers] = useState<Member[]>([]);

  const groups = useAppSelector((state: any) => state.groups?.items || []);
  const currentGroupFromStore = groups.find((g: any) => String(g.id) === String(groupId));

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (route?.params?.isAdmin !== undefined) return !!route?.params?.isAdmin;
    if (route?.params?.isCreator !== undefined) return !!route?.params?.isCreator;
    if (currentGroupFromStore?.isCreator) return true;
    return false;
  });

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcasts, setBroadcasts] = useState<GroupBroadcastItem[]>([]);
  const [unreadBroadcastsCount, setUnreadBroadcastsCount] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] = useState<GroupBroadcastItem | null>(null);
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check admin status
  useEffect(() => {
    let mounted = true;
    async function checkAdmin() {
      try {
        const res = await StudyService.getGroupById(String(groupId));
        const gData = res?.data || res;
        const creatorId = String(
          gData?.creatorId ||
          gData?.creator?._id ||
          gData?.creator?.id ||
          gData?.ownerId ||
          gData?.owner?._id ||
          gData?.createdBy ||
          ''
        );
        if (mounted) {
          if (creatorId && String(myUserId) === creatorId) {
            setIsAdmin(true);
          } else if (gData?.isCreator) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        if (currentGroupFromStore?.isCreator) {
          setIsAdmin(true);
        }
      }
    }
    if (myUserId) {
      checkAdmin();
    }
    return () => { mounted = false; };
  }, [groupId, myUserId, currentGroupFromStore]);

  // Load existing broadcasts for this group
  useEffect(() => {
    GroupBroadcastService.getBroadcastsForGroup(groupId).then((list) => {
      setBroadcasts(list);
    });
  }, [groupId]);

  // Listen for real-time live room broadcasts
  useEffect(() => {
    const unsub = onGroupRoomBroadcast((payload: any) => {
      console.log('📢 [GroupRoomScreen] Broadcast received:', payload);
      const bcast: GroupBroadcastItem = payload?.broadcast || {
        id: 'bcast_' + Date.now(),
        groupId: payload?.groupId || groupId,
        groupName: payload?.groupName || groupName,
        message: payload?.message || '',
        senderName: payload?.senderName || 'Admin',
        senderId: payload?.senderId || '',
        createdAt: payload?.timestamp || new Date().toISOString(),
        isRead: false,
      };

      if (String(bcast.groupId) === String(groupId)) {
        setBroadcasts((prev) => [bcast, ...prev.filter((b) => b.id !== bcast.id)]);
        setUnreadBroadcastsCount((c) => c + 1);
        setActiveAnnouncement(bcast);

        if (announcementTimeoutRef.current) clearTimeout(announcementTimeoutRef.current);
        announcementTimeoutRef.current = setTimeout(() => {
          setActiveAnnouncement(null);
        }, 7000);
      }
    });

    return () => {
      unsub();
      if (announcementTimeoutRef.current) clearTimeout(announcementTimeoutRef.current);
    };
  }, [groupId, groupName]);

  const handleNotifyPress = () => {
    setShowBroadcastModal(true);
    setUnreadBroadcastsCount(0);
    setActiveAnnouncement(null);
  };

  const handleSendBroadcast = async (msg: string) => {
    const senderName =
      (myProfile?.firstName ? `${myProfile.firstName} ${myProfile.lastName || ''}`.trim() : '') ||
      (myProfile as any)?.name ||
      'Admin';
    const item = await GroupBroadcastService.sendBroadcast({
      groupId,
      groupName,
      message: msg,
      senderName,
      senderId: String(myUserId),
      senderAvatar: myProfile?.profileImage || (myProfile as any)?.avatar,
    });
    setBroadcasts((prev) => [item, ...prev.filter((b) => b.id !== item.id)]);
  };

  const roomId = String(groupId);
  const micOnRef = useRef(micOn);
  const camOnRef = useRef(camOn);
  const membersRef = useRef(members);

  useEffect(() => { micOnRef.current = micOn; }, [micOn]);
  useEffect(() => { camOnRef.current = camOn; }, [camOn]);
  useEffect(() => { membersRef.current = members; }, [members]);

  // Load group members
  // useEffect(() => {
  //   let active = true;
  //   async function loadMembers() {
  //     try {
  //       const res = await StudyService.getGroupMembers(String(groupId));
  //       const rawMembers = res.data || res || [];
  //       if (!active) return;

  //       const mapped = rawMembers.map((m: any, idx: number) => {
  //         const userObj = m.userId || {};
  //         const firstName = userObj.firstName || '';
  //         const lastName = userObj.lastName || '';
  //         const name = userObj.name || (firstName ? `${firstName} ${lastName}`.trim() : '') || userObj.username || 'Student';
  //         return {
  //           id: userObj.id || userObj._id || idx,
  //           name,
  //           avatar: userObj.avatar || '👩‍🎓',
  //           isOnline: true,
  //           studyTime: m.studyTime || 0,
  //           rank: idx + 1,
  //           micOn: false,
  //           camOn: false,
  //           speaking: false,
  //         };
  //       });
  //       setMembers(mapped);
  //     } catch (err) {
  //       console.log('Failed to fetch group members:', err);
  //     }
  //   }
  //   loadMembers();
  //   return () => { active = false; };
  // }, [groupId]);

  // The room is now completely dynamic. Users only appear when they join the socket room.

  // Socket connection and live room event listeners
  useEffect(() => {
    if (!myUserId) return;

    // Ensure socket is connected
    const socket = getSocket();

    // BUG FIX: Use a ref instead of a local 'let' variable so that socket event
    // callbacks always read the latest value. A plain 'let' in a closure is captured
    // by value at the time the async IIFE runs — if onRoomParticipantsList fires
    // before initWebRTC resolves, webrtcInitialized is still false and no peer
    // connections are ever created.
    const webrtcReadyRef = { current: false };

    // Set up all socket listeners BEFORE joining the room so we don't miss events
    onUserJoinedRoom((payload) => {
      console.log('👤 User joined room:', payload.userName);
      setMembers(prev => {
        const exists = prev.find(m => String(m.id) === String(payload.userId));
        if (exists) return prev;
        return [
          ...prev,
          {
            id: payload.userId,
            name: payload.userName !== 'Unknown' ? payload.userName : (getCachedUserName(payload.userId) || 'User'),
            avatar: getCachedUserAvatar(payload.userId) || '👤',
            isOnline: true,
            studyTime: 0,
            rank: prev.length + 1,
            micOn: false,
            camOn: false,
            speaking: false,
          },
        ];
      });

      // Fetch actual names and avatars asynchronously for the new user
      fetchChatUsers([payload.userId]).then(() => {
        setMembers(curr => curr.map(m => {
          if (String(m.id) === String(payload.userId)) {
            return {
              ...m,
              name: getCachedUserName(String(m.id)) || m.name,
              avatar: getCachedUserAvatar(String(m.id)) || m.avatar
            };
          }
          return m;
        }));
      });

      // Create a WebRTC peer connection to the new user
      if (webrtcReadyRef.current) {
        handleNewParticipant(payload.userId, String(myUserId));
      }
    });

    onUserLeftRoom((payload) => {
      console.log('👤 User left room:', payload.userName);
      setMembers(prev => prev.filter(m => String(m.id) !== String(payload.userId)));
      removePeer(payload.userId);
    });

    onUserCameraToggle((payload) => {
      console.log('📷 Camera toggle from:', payload.userId, payload.cameraOn);
      setMembers(prev =>
        prev.map(m =>
          String(m.id) === String(payload.userId)
            ? { ...m, camOn: payload.cameraOn }
            : m
        )
      );
    });

    onUserMicToggle((payload) => {
      console.log('🎤 Mic toggle from:', payload.userId, payload.micOn);
      setMembers(prev =>
        prev.map(m =>
          String(m.id) === String(payload.userId)
            ? { ...m, micOn: payload.micOn }
            : m
        )
      );
    });

    onRoomParticipantsList((payload) => {
      console.log('📋 Room participants:', payload.count);

      if (payload.session) {
        setSession(payload.session);
        setSessionActive(payload.session.active);
      } else {
        setSession(null);
        setSessionActive(false);
      }

      setMembers(prev => {
        const participantIds = new Set(payload.participants.map((p: any) => String(p.userId)));
        const keptMembers = prev.filter(m => participantIds.has(String(m.id)));

        payload.participants.forEach((p: any) => {
          const exists = keptMembers.find(m => String(m.id) === String(p.userId));
          if (!exists) {
            keptMembers.push({
              id: p.userId,
              name: p.userName !== 'Unknown' ? p.userName : (getCachedUserName(p.userId) || 'User'),
              avatar: getCachedUserAvatar(p.userId) || '👤',
              isOnline: true,
              studyTime: 0,
              rank: keptMembers.length + 1,
              micOn: p.micOn || false,
              camOn: p.camOn || false,
              speaking: false,
            });
          }
        });
        return keptMembers;
      });

      // Fetch actual names and avatars asynchronously
      fetchChatUsers(payload.participants.map((p: any) => p.userId)).then(() => {
        setMembers(curr => curr.map(m => ({
          ...m,
          name: getCachedUserName(String(m.id)) || m.name,
          avatar: getCachedUserAvatar(String(m.id)) || m.avatar
        })));
      });

      // Connect to all existing participants via WebRTC
      if (webrtcReadyRef.current && myUserId) {
        connectToParticipants(
          payload.participants.map((p: any) => ({ userId: p.userId, socketId: p.socketId || '' })),
          String(myUserId)
        );
      }
    });

    onSocketError((payload) => {
      console.error('❌ Socket error:', payload.message);
      Alert.alert('Error', payload.message);
    });

    let isCancelled = false;

    // BUG FIX: Initialize WebRTC FIRST, then join the live room.
    // Previously, joinLiveRoom() was called immediately while initWebRTC() was
    // still pending, so onRoomParticipantsList fired with webrtcInitialized=false
    // and skipped connectToParticipants entirely → no audio/video connections.
    (async () => {
      const stream = await initWebRTC(roomId, {
        onRemoteStream: (streams) => {
          setAudioConnections(streams.size);
          const urls = new Map<string, { url: string; hasVideo: boolean }>();
          streams.forEach((s: any, id: string) => {
            if (s.toURL) {
              const videoTracks = s.getVideoTracks ? s.getVideoTracks() : [];
              urls.set(id, { url: s.toURL(), hasVideo: videoTracks.length > 0 });
            }
          });
          setRemoteStreamUrls(urls);
          console.log(`🔊 [WebRTC] Active connections: ${streams.size}`);
        },
        onPeerDisconnect: (userId) => {
          console.log(`🔌 [WebRTC] Peer disconnected: ${userId}`);
          setRemoteStreamUrls(prev => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
          });
        },
        onLocalStream: (stream) => {
          if (stream && (stream as any).toURL) {
            setLocalStreamUrl((stream as any).toURL());
          } else {
            setLocalStreamUrl(null);
          }
        },
      });

      if (isCancelled) {
        cleanupWebRTC();
        return;
      }

      if (stream) {
        webrtcReadyRef.current = true;
        setWebrtcReady(true);
        setCamOn(false);
        setLocalStreamUrl(null);
        console.log('✅ [WebRTC] Audio ready, camera OFF by default');
      } else {
        console.warn('⚠️ [WebRTC] Could not acquire audio, joining without mic');
        webrtcReadyRef.current = false;
      }

      // Join the live room AFTER WebRTC is ready so the participants-list event
      // arrives when webrtcReadyRef.current is already true
      joinLiveRoom(roomId);
      setRoomJoined(true);
    })();

    return () => {
      isCancelled = true;
      leaveLiveRoom(String(roomId));
      removeLiveRoomListeners();
      cleanupWebRTC();
      setRoomJoined(false);
      setWebrtcReady(false);
      // Stop personal timer on unmount
      if (personalTimerRef.current) clearInterval(personalTimerRef.current);
    };
  }, [roomId, myUserId]);


  // ── Chat: fetch history + real-time messages ──────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    // Join the group socket room for chat events
    joinGroupChat(roomId);

    // Fetch message history from backend
    (async () => {
      setChatLoading(true);
      try {
        const res = await StudyService.getChatMessages(roomId, 1, 50);
        const raw = res?.data;
        const msgs: ChatMessage[] = raw?.messages || (Array.isArray(raw) ? raw : []);
        const filtered = msgs.filter((m: ChatMessage) => !m.isDeleted);
        setChatMessages(filtered);

        // Fetch user details for all senders
        const senderIds = Array.from(new Set(filtered
          .map(m => getSenderId(m.sender))
          .filter(Boolean)
        ));
        if (senderIds.length > 0) {
          await fetchChatUsers(senderIds);
          // Force re-render with cached names
          setChatMessages(prev => [...prev]);
        }

        console.log(`💬 [Chat] Loaded ${filtered.length} messages, fetched ${senderIds.length} user profiles`);
      } catch (err: any) {
        console.error('❌ [Chat] Failed to load messages:', err.message);
      } finally {
        setChatLoading(false);
      }
    })();

    // Listen for real-time messages
    const unsubNewMessage = onNewMessage((msg: ChatMessage) => {
      console.log('💬 [Chat] New message:', msg._id, msg.content?.slice(0, 30));
      if (msg.sender) cacheUserFromPayload(msg.sender);
      setChatMessages(prev => {
        // Dedup by _id
        if (prev.find(m => m._id === msg._id)) return prev;

        // Replace optimistic message (temp _id) with real one
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

    return () => {
      unsubNewMessage();
    };
  }, [roomId]);

  const toggleMicState = useCallback(async () => {
    const newMicState = !micOn;

    // Apply UI state immediately
    setMicOn(newMicState);

    // Best-effort: toggle track and notify peers
    const micSuccess = await toggleMic(roomId, newMicState);
    if (!micSuccess) {
      console.log('🎤 Mic toggle failed (permission denied)');
      setMicOn(!newMicState); // revert
      return;
    }
    setMicEnabled(newMicState);

    console.log('🎤 Mic toggled to:', newMicState);
  }, [roomId, micOn]);

  const toggleCamState = useCallback(async () => {
    const newCamState = !camOn;

    // Check permission & notify socket
    const camSuccess = await toggleCamera(roomId, newCamState);
    if (!camSuccess) {
      console.log('📷 Camera toggle failed (permission denied)');
      return;
    }

    // Wait for the video track to be fully acquired and added to the stream
    await setCameraEnabled(newCamState);
    // Then apply UI state so RTCView mounts *after* the stream has video
    setCamOn(newCamState);

    console.log('📷 Camera toggled to:', newCamState);
  }, [roomId, camOn]);

  // Auto-start personal timer as soon as user joins the room
  useEffect(() => {
    if (roomJoined) {
      startPersonalTimer();
    }
  }, [roomJoined, startPersonalTimer]);

  // Group session timer (read-only display — no user controls needed)
  useEffect(() => {
    if (session) {
      if (!session.active) {
        setStudyTime(Math.floor(session.accumulatedTime / 1000));
      } else if (session.startedAt) {
        setStudyTime(Math.floor((session.accumulatedTime + (Date.now() - session.startedAt)) / 1000));
      }
    }
  }, [session]);

  useEffect(() => {
    if (!session?.active || !session?.startedAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = session.accumulatedTime + (now - session.startedAt!);
      setStudyTime(Math.floor(elapsed / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const otherMembers = members.filter(m => String(m.id) !== String(myUserId));
  const onlineCount = otherMembers.length + 1; // plus self

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const content = chatInput.trim();

    // Optimistic update — show message immediately
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticMsg: ChatMessage = {
      _id: tempId,
      sender: myUserId,
      content,
      createdAt: new Date().toISOString(),
      readBy: [myUserId],
      reactions: [],
      isPinned: false,
      groupId: roomId,
    };
    setChatMessages(prev => [...prev, optimisticMsg]);
    setChatInput('');

    // Send via socket, fall back to REST API if socket is down
    const s = getSocket();
    if (s.connected) {
      sendChatMessage({ groupId: roomId, content });
    } else {
      console.log('💬 [Chat] Socket down, sending via REST API');
      StudyService.sendChatMessage(roomId, content).catch(err => {
        console.error('❌ [Chat] REST send failed:', err.message);
      });
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Session', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const goToChat = () =>
    navigation.navigate('GroupChat', { groupId, groupName });

  // ── Controls config ──────────────────────────────────────────────────────────

  const controls = [
    { label: 'Mic', icon: micOn ? '🎤' : '🔇', active: micOn, onPress: toggleMicState, danger: false },
    { label: 'Cam', icon: camOn ? '📹' : '📷', active: camOn, onPress: toggleCamState, danger: false },
    {
      label: 'Notify',
      icon: '🔔',
      active: showBroadcastModal || unreadBroadcastsCount > 0,
      badge: unreadBroadcastsCount > 0 ? String(unreadBroadcastsCount) : undefined,
      onPress: handleNotifyPress,
      danger: false,
    },
    { label: 'Challenge', icon: '⚡', active: false, onPress: () => { }, danger: false },
    { label: 'Chat', icon: '💬', active: showChatPanel, onPress: () => setShowChatPanel(p => !p), danger: false },
    { label: 'Leave', icon: '🚪', active: false, onPress: handleLeave, danger: true },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={s.root}>

          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backTxt}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.groupName} numberOfLines={1}>{groupName}</Text>
              <Text style={s.memberCount}>
                {onlineCount} online · {audioConnections > 0 ? `🔊 ${audioConnections} connected` : webrtcReady ? '🎙️ ready' : '⏳ connecting'} · {camOn ? '📹 cam on' : '📷 cam off'}
              </Text>
            </View>
            <View style={s.headerRight}>
              <View style={s.onlineBadge}>
                <Text style={s.onlineBadgeTxt}>👥 {onlineCount}</Text>
              </View>
              <TouchableOpacity style={s.chatRoomBtn} onPress={goToChat}>
                <Text style={s.chatRoomBtnTxt}>💬 Chat Room</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Personal Timer bar (auto-starts on join, fully user-controlled) ── */}
          <View style={s.timerBar}>
            <View style={{ flex: 1 }}>
              <Text style={[s.timerTxt, personalRunning && { color: colors.success }]}>
                {formatTime(personalTime)}
              </Text>
              <View style={s.liveRow}>
                {personalRunning ? (
                  <>
                    <View style={s.liveDot} />
                    <Text style={s.liveTxt}>MY TIMER · RUNNING</Text>
                  </>
                ) : (
                  <Text style={[s.liveTxt, { color: colors.textMuted }]}>MY TIMER · PAUSED</Text>
                )}
              </View>
            </View>

            {/* Personal stop/resume — anyone can control this */}
            <TouchableOpacity
              style={[s.sessionBtn, personalRunning && s.sessionBtnPause]}
              onPress={togglePersonalTimer}
            >
              <Text style={s.sessionBtnTxt}>
                {personalRunning ? '⏸ Pause' : '▶ Resume'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Main content: either Members grid or Chat panel ── */}
          {showChatPanel ? (
            /* ── Inline chat panel ── */
            <View style={s.chatSheet}>
              <View style={s.chatSheetHeader}>
                <Text style={s.chatSheetTitle}>💬 Chat · {chatMessages.length}</Text>
                <TouchableOpacity onPress={() => setShowChatPanel(false)}>
                  <Text style={s.chatSheetClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {chatLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>Loading messages...</Text>
                </View>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={s.chatMsgs}
                >
                  {chatMessages.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingTop: 30 }}>
                      <Text style={{ fontSize: 28 }}>💬</Text>
                      <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 12 }}>No messages yet</Text>
                    </View>
                  ) : (
                    chatMessages.map((msg) => {
                      const senderId = getSenderId(msg.sender);
                      const isOwn = senderId === String(myUserId);
                      const avatarUrl = getCachedUserAvatar(senderId);
                      return (
                        <View key={msg._id} style={[s.qMsgRow, isOwn && s.qMsgRowOwn]}>
                          {!isOwn && (
                            <View style={s.qAvatar}>
                              {avatarUrl ? (
                                <Image
                                  // OLD: source={{ uri: avatarUrl && !avatarUrl.startsWith('http') ? `${Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'}/api/v1/profile/profile-photo/get-photo/${avatarUrl}` : avatarUrl }}
                                  source={{ uri: avatarUrl && !avatarUrl.startsWith('http') ? `${ENV_API_BASE_URL}/api/v1/profile/profile-photo/get-photo/${avatarUrl}` : avatarUrl }}
                                  style={{ width: '100%', height: '100%', borderRadius: 99 }}
                                />
                              ) : (
                                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primary }}>
                                  {getSenderName(msg.sender).charAt(0).toUpperCase()}
                                </Text>
                              )}
                            </View>
                          )}
                          <View style={[s.qBubble, isOwn && s.qBubbleOwn]}>
                            {!isOwn && (
                              <Text style={s.qSender}>{getSenderName(msg.sender)}</Text>
                            )}
                            <Text style={[s.qText, isOwn && { color: '#fff' }]}>{msg.content}</Text>
                            <Text style={[s.qTime, isOwn && { color: 'rgba(255,255,255,0.6)' }]}>
                              {msgTime(msg.createdAt)}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              )}

              <View style={s.chatInputRow}>
                <TextInput
                  style={s.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={handleSendChat}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[s.chatSendBtn, !chatInput.trim() && { backgroundColor: colors.borderBrown }]}
                  onPress={handleSendChat}
                  disabled={!chatInput.trim()}
                >
                  <Text style={s.chatSendTxt}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── Members grid ── */
            <ScrollView style={s.scroll} contentContainerStyle={s.gridContent}>
              <View style={s.grid}>
                {/* Self card */}
                <View style={[s.memberCard, { borderColor: colors.primary }]}>
                  {camOn && localStreamUrl ? (
                    <View style={s.videoContainer}>
                      <RTCView
                        streamURL={localStreamUrl}
                        style={s.videoFeed}
                        objectFit="cover"
                        mirror={true}
                        zOrder={0}
                      />
                    </View>
                  ) : (
                    <View style={s.avatarWrap}>
                      {myProfile?.profileImage ? (
                        <Image source={{ uri: myProfile.profileImage }} style={s.imageAvatar} />
                      ) : (
                        <Text style={s.avatar}>👤</Text>
                      )}
                    </View>
                  )}
                  <Text style={s.memberName}>You ({myProfile?.firstName || 'User'})</Text>
                  <Text style={s.memberTime}>{formatTime(studyTime)}</Text>
                  <View style={s.mediaRow}>
                    <View style={[s.mediaIcon, { backgroundColor: micOn ? colors.primary : colors.error }]}>
                      <Text style={s.mediaIconTxt}>{micOn ? '🎤' : '🔇'}</Text>
                    </View>
                    <View style={[s.mediaIcon, { backgroundColor: camOn ? colors.primary : colors.error }]}>
                      <Text style={s.mediaIconTxt}>{camOn ? '📹' : '📷'}</Text>
                    </View>
                  </View>
                  {sessionActive && (
                    <View style={s.activeBadge}>
                      <Text style={s.activeBadgeTxt}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                {/* Other member cards */}
                {otherMembers.map(m => (
                  <View
                    key={m.id}
                    style={[s.memberCard, { borderColor: m.speaking ? '#22c55e' : colors.borderBrown }]}
                  >
                    {m.camOn && remoteStreamUrls.has(String(m.id)) ? (
                      <View style={s.videoContainer}>
                        <RTCView
                          key={`${remoteStreamUrls.get(String(m.id))!.url}_${remoteStreamUrls.get(String(m.id))!.hasVideo}`}
                          streamURL={remoteStreamUrls.get(String(m.id))!.url}
                          style={s.videoFeed}
                          objectFit="cover"
                          zOrder={0}
                        />
                        <View style={[s.onlineDot, { position: 'absolute', bottom: 4, right: 4 }]} />
                      </View>
                    ) : (
                      <View style={s.avatarWrap}>
                        {m.avatar?.startsWith('http') ? (
                          <Image source={{ uri: m.avatar }} style={s.imageAvatar} />
                        ) : (
                          <Text style={s.avatar}>{m.avatar}</Text>
                        )}
                        <View style={s.onlineDot} />
                      </View>
                    )}
                    <Text style={s.memberName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                    <Text style={s.memberTime}>{formatTime(m.studyTime)}</Text>
                    <Text style={s.memberRank}>🏅 Rank #{m.rank}</Text>
                    <View style={s.mediaRow}>
                      <View style={[s.mediaIcon, { backgroundColor: m.micOn ? '#22c55e' : colors.error }]}>
                        <Text style={s.mediaIconTxt}>{m.micOn ? '🎤' : '🔇'}</Text>
                      </View>
                      <View style={[s.mediaIcon, { backgroundColor: m.camOn ? '#22c55e' : colors.error }]}>
                        <Text style={s.mediaIconTxt}>{m.camOn ? '📹' : '📷'}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Go to Chat Room button */}
              <TouchableOpacity style={s.goToChatBtn} onPress={goToChat}>
                <Text style={s.goToChatTxt}>💬 Go to Chat Room</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── In-room Live Announcement Toast ── */}
          {activeAnnouncement && (
            <View style={s.announcementToast}>
              <View style={s.announcementToastIcon}>
                <Text style={{ fontSize: 18 }}>📢</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={s.announcementSender} numberOfLines={1}>
                    {activeAnnouncement.senderName}
                  </Text>
                  <View style={s.adminTag}>
                    <Text style={s.adminTagTxt}>ADMIN</Text>
                  </View>
                </View>
                <Text style={s.announcementMsg} numberOfLines={2}>
                  {activeAnnouncement.message}
                </Text>
              </View>
              <TouchableOpacity
                style={s.announcementViewBtn}
                onPress={() => {
                  setActiveAnnouncement(null);
                  setShowBroadcastModal(true);
                }}
              >
                <Text style={s.announcementViewTxt}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.announcementCloseBtn}
                onPress={() => setActiveAnnouncement(null)}
              >
                <Text style={s.announcementCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Bottom controls ── */}
          <View style={s.controls}>
            {controls.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.ctrl,
                  btn.danger && s.ctrlDanger,
                  btn.active && s.ctrlActive,
                ]}
                onPress={btn.onPress}
              >
                <Text style={s.ctrlIcon}>{btn.icon}</Text>
                {!!(btn as any).badge && (
                  <View style={s.ctrlBadge}>
                    <Text style={s.ctrlBadgeTxt}>{(btn as any).badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Broadcast Announcement Modal ── */}
          <BroadcastModal
            visible={showBroadcastModal}
            onClose={() => setShowBroadcastModal(false)}
            isAdmin={isAdmin}
            groupId={groupId}
            groupName={groupName}
            currentUserId={String(myUserId)}
            currentUserName={
              (myProfile?.firstName ? `${myProfile.firstName} ${myProfile.lastName || ''}`.trim() : '') ||
              (myProfile as any)?.name ||
              'Admin'
            }
            currentUserAvatar={myProfile?.profileImage || (myProfile as any)?.avatar}
            broadcasts={broadcasts}
            onSendBroadcast={handleSendBroadcast}
          />

        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5, borderBottomColor: colors.borderBrown,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backTxt: { fontSize: 22, color: colors.primaryLight, fontWeight: '700' },
  groupName: { fontSize: 16, fontWeight: '900', color: colors.primary },
  memberCount: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineBadge: {
    backgroundColor: colors.backgroundMid, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  onlineBadgeTxt: { fontSize: 12, fontWeight: '700', color: colors.primary },
  chatRoomBtn: {
    backgroundColor: colors.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chatRoomBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Timer bar
  timerBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.backgroundMid,
    borderBottomWidth: 1, borderBottomColor: colors.borderBrown,
    gap: 12,
  },
  timerTxt: {
    fontSize: 28, fontWeight: '900', color: colors.primary,
    fontVariant: ['tabular-nums'], letterSpacing: -1, lineHeight: 32,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  liveTxt: { fontSize: 10, fontWeight: '800', color: colors.success },
  sessionBtn: {
    backgroundColor: colors.primary, borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  sessionBtnPause: { backgroundColor: colors.textMuted },

  sessionBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Grid
  scroll: { flex: 1 },
  gridContent: { padding: 12, paddingBottom: 16 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },

  // Member cards
  memberCard: {
    width: '47.5%', backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, alignItems: 'center', borderWidth: 2,
    borderColor: colors.borderBrown, gap: 5,
  },
  avatarWrap: { position: 'relative' },
  avatar: { fontSize: 40 },
  imageAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginBottom: 5 },
  videoContainer: {
    width: '100%', height: 120, borderRadius: 12,
    overflow: 'hidden', backgroundColor: '#000',
    marginBottom: 4,
  },
  videoFeed: {
    width: '100%', height: '100%',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff',
  },
  memberName: { fontSize: 13, fontWeight: '800', color: colors.primary },
  memberTime: { fontSize: 13, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },
  memberRank: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  mediaRow: { flexDirection: 'row', gap: 5 },
  mediaIcon: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  mediaIconTxt: { fontSize: 12 },
  activeBadge: {
    backgroundColor: '#dcfce7', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 2,
    borderWidth: 1, borderColor: '#86efac',
  },
  activeBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#15803d' },

  // Go to chat button
  goToChatBtn: {
    marginTop: 12, backgroundColor: colors.backgroundMid,
    borderRadius: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.borderBrown,
    alignItems: 'center',
  },
  goToChatTxt: { fontSize: 13, fontWeight: '700', color: colors.textMuted },

  // Bottom controls
  controls: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 10, paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1.5, borderTopColor: colors.borderBrown,
  },
  ctrl: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.backgroundMid,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlActive: { backgroundColor: colors.primary },
  ctrlDanger: { backgroundColor: '#fee2e2' },
  ctrlIcon: { fontSize: 20 },
  ctrlBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  ctrlBadgeTxt: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  announcementToast: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    right: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  announcementToastIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementSender: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  adminTag: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  adminTagTxt: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  announcementMsg: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  announcementViewBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  announcementViewTxt: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  announcementCloseBtn: {
    padding: 6,
  },
  announcementCloseTxt: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },

  // Chat panel (inline, replaces member grid)
  chatSheet: {
    flex: 1, backgroundColor: colors.surface,
  },
  chatSheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderBrown,
  },
  chatSheetTitle: { fontSize: 14, fontWeight: '800', color: colors.primary },
  chatSheetClose: { fontSize: 16, color: colors.textMuted, fontWeight: '700', padding: 4 },
  chatMsgs: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },

  // Quick message bubbles
  qMsgRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-end', gap: 6 },
  qMsgRowOwn: { flexDirection: 'row-reverse' },
  qAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1.5, borderColor: colors.borderBrown,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  qBubble: {
    maxWidth: '75%', backgroundColor: colors.backgroundMid,
    borderRadius: 16, borderBottomLeftRadius: 4,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  qBubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  qSender: { fontSize: 10, fontWeight: '800', color: colors.textMuted, marginBottom: 3 },
  qText: { fontSize: 13, color: colors.primary },
  qTime: { fontSize: 9, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },

  // Quick chat input
  chatInputRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.borderBrown,
  },
  chatInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.borderBrown,
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 13, color: colors.text, backgroundColor: colors.background,
  },
  chatSendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  chatSendTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});