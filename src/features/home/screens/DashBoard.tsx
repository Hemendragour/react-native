// features/home/screens/DashboardScreen.tsx

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, TextInput, SafeAreaView, RefreshControl, Pressable, Keyboard, DeviceEventEmitter, FlatList, ActivityIndicator, Alert
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

import LeftSidebar, { HamburgerIcon } from '../components/LeftSideDrawer';
import CreatePostPrompt from '../components/Createpostprompt';
import CreatePostModal from '../../profile/components/modals/CreatePostModal';
import UpdatePostModal from '../../profile/components/modals/UpdatePostModal';
import RepostModal from '../components/modals/RepostModal';
import PostCard from '../components/PostCard';
import { dummyProfile } from '../../profile/components/ProfileHeader';
import { EMOJI_LIST } from '../components/Emojipicker';
import { useProfile } from '../../../store/hooks/useProfile';
// import { Route } from 'lucide-react-native';
import BottomBar, { emitBottomBarScroll, emitBottomBarScrollEnd } from '../../../shared/components/BottomBar';
import AuthService from '../../../services/auth.service';
import FeedService from '../../../services/feed.service';
import ReportModal from '../components/modals/ReportModal';
import ReactorsModal from '../components/modals/ReactorsModal';
import { ReactionType } from '../types/feed.types';
import { useNotifications } from '../../../hooks/notifications/useNotifications';
import { MessageService } from '../../../services/message.service';
import { NotificationService } from '../../../services/notification.service';
import { ConnectionService } from '../../../services/connection.service';

// ─── Dummy posts ──────────────────────────────────────────────────────────────

const DUMMY_POSTS = [
  {
    postId: 'p1', entryId: 'p1',
    user: 'Er.Sujal sharma',
    avatar: 'https://i.pravatar.cc/150?img=8',
    role: 'Founder lolo.com',
    time: '3w ago',
    content: 'Even the sound of the sirens on the news can send a chill down your spine.....',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    likesCount: 30, commentsCount: 5, shares: 2,
    isLikedByCurrentUser: false, userId: 'user2',
  },
  {
    postId: 'p2', entryId: 'p2',
    user: 'Therone8',
    avatar: dummyProfile.profileImage,
    role: 'Pvt. Limited',
    time: '2w ago',
    content: 'Excited to share our latest platform update! AI-powered networking is now live for all users. Connect smarter, grow faster. 🚀',
    image: null,
    likesCount: 14, commentsCount: 3, shares: 1,
    isLikedByCurrentUser: false, userId: 'user1',
  },
  {
    postId: 'p3', entryId: 'p3',
    user: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=20',
    role: 'Product Designer',
    time: '4h ago',
    content: 'Just launched our new design system! Working with an amazing team to create consistent, beautiful experiences. 🎨',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    likesCount: 247, commentsCount: 18, shares: 8,
    isLikedByCurrentUser: false, userId: 'user3',
  },
];

const PostSkeleton = () => (
  <View className="bg-brand-light/95 rounded-3xl border border-brand-dark/10 p-4 mx-3 mb-4">
    {/* Header skeleton */}
    <View className="flex-row items-center gap-3 mb-4">
      <View className="w-12 h-12 rounded-2xl bg-brand-border" />
      <View className="flex-1 gap-2">
        <View className="h-3.5 bg-brand-border rounded-full w-32" />
        <View className="h-3 bg-brand-border rounded-full w-24" />
      </View>
    </View>
    {/* Content skeleton */}
    <View className="gap-2 mb-4">
      <View className="h-3 bg-brand-border rounded-full" />
      <View className="h-3 bg-brand-border rounded-full w-5/6" />
      <View className="h-3 bg-brand-border rounded-full w-4/6" />
    </View>
    {/* Image skeleton */}
    <View className="h-48 bg-brand-border rounded-2xl mb-4" />
    {/* Actions skeleton */}
    <View className="flex-row justify-between pt-3 border-t border-brand-border">
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
    </View>
  </View>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MessageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const NotifsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { profile, fetchProfile, profilePhotos, fetchAllProfilePhotos } = useProfile();

  useEffect(() => {
    fetchProfile();
    fetchAllProfilePhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigation = useNavigation<any>();
  const route = useRoute();

  const currentUser = AuthService.getCurrentUser() as any;
  const currentUserId = currentUser?.userId || currentUser?.id || currentUser?._id;
  const anyProfile = profile as any;

  const DEFAULT_AVATAR_IMG = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  let activeProfileImage = anyProfile?.profileImage || anyProfile?.avatar || anyProfile?.onboarding?.profileImage || currentUser?.profileImage || currentUser?.avatar;
  if (profilePhotos && profilePhotos.length > 0) {
    const activeP = profilePhotos.find((p: any) => p.isActive || p.active) || profilePhotos[0];
    if (activeP) {
      activeProfileImage = activeP.cloudinarySecureUrl || activeP.cloudinaryUrl || activeP.url || activeP.imageUrl || activeP.photoUrl || activeProfileImage;
    }
  }
  if (!activeProfileImage && currentUserId) {
    activeProfileImage = FeedService.getUserFromCache(currentUserId)?.avatar;
  }
  const currentAvatar = activeProfileImage || DEFAULT_AVATAR_IMG;
  const currentUserName = anyProfile?.fullName || (anyProfile?.firstName ? `${anyProfile.firstName} ${anyProfile.lastName || ''}`.trim() : null) || anyProfile?.name || currentUser?.name || currentUser?.fullName || currentUser?.username || 'You';

  // ── UI state ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const [uploadingPost, setUploadingPost] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<any>(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('start_post_upload', async (formData) => {
       setUploadingPost(formData);
       setUploadProgress(0);
       abortControllerRef.current = new AbortController();

       let timer = setInterval(() => {
          setUploadProgress(prev => {
             if (prev >= 90) return prev;
             return prev + 10;
          });
       }, 500);

       try {
          const res = await AuthService.createPost(formData, { signal: abortControllerRef.current.signal });
          clearInterval(timer);
          setUploadProgress(100);
          
          setTimeout(() => {
              setUploadingPost(null);
              
              // Prepend newly created post to the feed optimistically
              const createdData = res?.data?.post || res?.data || res?.post || formData;
              const formattedPost = {
                  ...createdData,
                  id: createdData.entryId || createdData.postId || createdData._id || Date.now().toString(),
                  entryId: createdData.entryId || createdData.postId || createdData._id || Date.now().toString(),
                  userId: currentUserId || profile?.userId || (profile as any)?._id,
                  currentUserId: currentUserId || profile?.userId || (profile as any)?._id,
                  user: currentUserName,
                  authorName: currentUserName,
                  avatar: currentAvatar,
                  authorAvatar: currentAvatar,
                  role: profile?.headline || (currentUser as any)?.headline || 'Member',
                  authorHeadline: profile?.headline || (currentUser as any)?.headline || 'Member',
                  time: 'Just now',
                  title: createdData.title || formData.title,
                  content: createdData.content || formData.content,
                  mood: createdData.mood || formData.mood || null,
                  isOwnPost: true,
                  pollData: createdData.pollData || (formData.poll ? {
                      question: formData.poll.question,
                      totalVotes: 0,
                      options: formData.poll.options.map((opt: string, idx: number) => ({
                          optionId: `opt_${idx}`,
                          text: opt,
                          votes: 0,
                          votedBy: [],
                      })),
                      userVotedOptionId: null,
                  } : null),
                  eventData: createdData.eventData || formData.event || null,
                  images: createdData.images && createdData.images.length > 0 ? createdData.images : (formData.images || []),
                  videos: createdData.videos && createdData.videos.length > 0 ? createdData.videos : (formData.videos || []),
                  likesCount: 0,
                  commentsCount: 0,
                  shares: 0,
                  isLikedByCurrentUser: false,
                  currentUserHasReposted: false,
              };

              setPosts(prev => {
                  const existingId = formattedPost.entryId || formattedPost.postId || formattedPost.id || formattedPost._id;
                  const isDuplicate = prev.some(p => (p.entryId || p.postId || p.id || p._id) === existingId);
                  if (isDuplicate) return prev;
                  return [formattedPost, ...prev];
              });
          }, 500);

       } catch (err: any) {
          clearInterval(timer);
          if (err.message !== 'canceled' && err.message !== 'canceled error' && err.name !== 'CanceledError') {
              console.error('Failed to create post optimistically', err);
              Alert.alert('Post Creation Error', err.message || 'Failed to create post. Please try again.');
          }
          setUploadingPost(null);
       }
    });

    return () => sub.remove();
  }, []);

  const cancelUpload = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setUploadingPost(null);
  };

  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      // Fetch unread notifications count quickly without fetching all profiles
      const { GroupBroadcastService } = require('../../../services/group-broadcast.service');
      Promise.all([
        NotificationService.getNotifications().catch(() => null),
        GroupBroadcastService.getBroadcasts().catch(() => []),
      ]).then(([res, bcasts]) => {
        let rawData = res?.data?.data || res?.data || [];
        let data = Array.isArray(rawData) ? rawData : (rawData.notifications || []);
        let count = data.filter((notif: any) => !notif.isRead).length;
        const unreadBcasts = (bcasts || []).filter((b: any) => !b.isRead).length;
        setUnreadNotifsCount(count + unreadBcasts);
      }).catch(e => console.log('Error fetching notifications count', e));

      // Also fetch unread messages count on focus
      MessageService.getConversations().then(res => {
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (res.data && Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.conversations)) data = res.data.conversations;
        else if (res.conversations && Array.isArray(res.conversations)) data = res.conversations;

        const myProfileId = profile?.userId || (profile as any)?._id || '';
        const count = data.reduce((acc: number, conv: any) => {
          const c = typeof conv.unreadCount === 'number'
            ? conv.unreadCount
            : (conv.unreadCount && conv.unreadCount[myProfileId] || 0);
          return acc + c;
        }, 0);
        setUnreadMessagesCount(count);
      }).catch(e => console.log('Error fetching unread messages', e));

    }, [profile?.userId, (profile as any)?._id])
  );

  useEffect(() => {
    // Listen for real-time notification count updates
    const { onUnreadNotificationCount, onMessageNew, onGroupRoomBroadcast } = require('../../../services/socket.service');
    const unsubNotif = onUnreadNotificationCount((payload: { count: number }) => {
      setUnreadNotifsCount(payload.count);
    });

    const unsubBcast = onGroupRoomBroadcast(() => {
      setUnreadNotifsCount(c => c + 1);
    });

    const unsubMsg = onMessageNew((newMessage: any) => {
      // Re-fetch conversations to get updated unread count when a new message arrives
      MessageService.getConversations().then(res => {
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (res.data && Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.conversations)) data = res.data.conversations;
        else if (res.conversations && Array.isArray(res.conversations)) data = res.conversations;

        const myProfileId = profile?.userId || (profile as any)?._id || '';
        const count = data.reduce((acc: number, conv: any) => {
          const c = typeof conv.unreadCount === 'number'
            ? conv.unreadCount
            : (conv.unreadCount && conv.unreadCount[myProfileId] || 0);
          return acc + c;
        }, 0);
        setUnreadMessagesCount(count);
      }).catch(e => console.log('Error fetching unread messages on new msg', e));
    });

    return () => {
      unsubNotif();
      unsubBcast();
      unsubMsg();
    };
  }, [profile?.userId, (profile as any)?._id]);

  const [_isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);
  const [initialPostImages, setInitialPostImages] = useState<any[]>([]);
  const [initialPostVideos, setInitialPostVideos] = useState<any[]>([]);
  const [initialPostDocuments, setInitialPostDocuments] = useState<any[]>([]);

  // Repost Modal states
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [postToRepost, setPostToRepost] = useState<any>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await AuthService.searchUsers(searchQuery.trim());
        let results = [];
        if (Array.isArray(res)) results = res;
        else if (res.data && Array.isArray(res.data.users)) results = res.data.users;
        else if (res.data && Array.isArray(res.data)) results = res.data;
        else if (res.users && Array.isArray(res.users)) results = res.users;
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // ── Feed state ───────────────────────────────────────────────────────────────

  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRepostIndex, setOpenRepostIndex] = useState<number | null>(null);
  const [openCommentsIndex, setOpenCommentsIndex] = useState<string | null>(null);
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);

  // Modals state
  const [selectedPostForReport, setSelectedPostForReport] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostForReactors, setSelectedPostForReactors] = useState<string | null>(null);
  const [isReactorsModalOpen, setIsReactorsModalOpen] = useState(false);

  // Dwell Time Tracking
  const viewStartTimes = useRef<Record<string, number>>({});
  const onViewableItemsChanged = useRef(({ viewableItems, changed }: any) => {
    const now = Date.now();
    viewableItems.forEach(({ item }: any) => {
      const id = item?.entryId || item?.postId || item?.id;
      if (id && !viewStartTimes.current[id]) {
        viewStartTimes.current[id] = now;
      }
    });

    changed.forEach(({ item, isViewable }: any) => {
      const id = item?.entryId || item?.postId || item?.id;
      if (!isViewable && id && viewStartTimes.current[id]) {
        const durationSec = Math.round((now - viewStartTimes.current[id]) / 1000);
        if (durationSec >= 2) {
          FeedService.trackPostView(id, durationSec, false);
        }
        delete viewStartTimes.current[id];
      }
    });
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handlePickPhotoDirect = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      maxFiles: 5,
    }).then(images => {
      const formatted = images.map(img => ({ uri: img.path, type: img.mime, fileName: img.filename || 'image.jpg' }));
      setInitialPostImages(formatted);
      setInitialPostVideos([]); // clear videos
      setInitialPostDocuments([]);
      setIsPostCreatorOpen(true);
    }).catch(e => {
      console.log('ImagePicker cancelled or failed', e);
    });
  };

  const handlePickVideoDirect = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      maxFiles: 2,
    }).then(videos => {
      const formatted = videos.map(vid => ({ uri: vid.path, type: vid.mime, fileName: vid.filename || 'video.mp4' }));
      setInitialPostVideos(formatted);
      setInitialPostImages([]); // clear photos
      setInitialPostDocuments([]);
      setIsPostCreatorOpen(true);
    }).catch(e => {
      console.log('VideoPicker cancelled or failed', e);
    });
  };

  const handlePickDocumentDirect = async () => {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
        allowMultiSelection: true,
      });
      if (results && results.length > 0) {
        const formatted = results.map((doc: any) => ({
          uri: doc.uri,
          type: doc.type || 'application/pdf',
          fileName: doc.name || 'document.pdf',
          size: doc.size,
        }));
        setInitialPostDocuments(formatted);
        setInitialPostImages([]);
        setInitialPostVideos([]);
        setIsPostCreatorOpen(true);
      }
    } catch (err: any) {
      const DocumentPicker = require('react-native-document-picker').default;
      if (!DocumentPicker.isCancel(err)) {
        console.log('DocumentPicker cancelled or failed', err);
      }
    }
  };

  // Fetch dynamic posts on mount
  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setIsLoadingPosts(true);
      else setIsFetchingMore(true);

      const limit = 10;
      let res: any;
      try {
        res = await FeedService.getAlgorithmicFeed(pageNum, limit);
      } catch (algoErr) {
        console.warn('⚠️ [DASHBOARD] Algorithmic feed failed, falling back to chronological feed:', algoErr);
        res = await FeedService.getChronologicalFeed(pageNum, limit);
      }

      let fetchedPosts: any[] = [];
      const resData: any = res?.data;
      if (Array.isArray(resData?.posts)) fetchedPosts = resData.posts;
      else if (Array.isArray(resData?.data)) fetchedPosts = resData.data;
      else if (Array.isArray(resData)) fetchedPosts = resData;
      else if (Array.isArray((res as any)?.posts)) fetchedPosts = (res as any).posts;
      else if (Array.isArray(res)) fetchedPosts = res;

      // Enrich posts with real author names, usernames, avatars, and headlines
      const enrichedPosts = await FeedService.enrichPostsWithAuthorData(fetchedPosts);

      // Get the current user ID reliably to filter out their own posts
      const currentUserObj: any = AuthService.getCurrentUser();
      const myUserId = currentUserObj?.userId || currentUserObj?.id || profile?.userId || (profile as any)?._id;
      if (myUserId) {
        ConnectionService.initCache(myUserId);
      }

      const getDegreeLabel = (
        connectionDegree: number | null | undefined,
        connectionStatus?: string,
        isOwn?: boolean
      ): string | null => {
        if (isOwn || connectionStatus === 'self') return null;
        if (connectionDegree === 1 || connectionStatus === 'connected' || connectionStatus === 'accepted') return '1st';
        if (connectionDegree === 2) return '2nd';
        if (connectionDegree === 3) return '3rd';
        return '3rd+';
      };

      // Filter out user's own posts from the feed, as requested
      const finalPosts = enrichedPosts
        .filter((p: any) => {
          if (!myUserId) return true;
          const postUserId = p.userId || p.currentUserId || p.repostedBy;
          return postUserId !== myUserId;
        })
        .map((p: any) => {
          if (p.feedItemType === 'repost' && p.originalPost) {
            const op = p.originalPost;
            const isOpMine = Boolean(myUserId && (op.userId === myUserId));
            const opConnStatus = isOpMine ? 'self' : (op.connectionStatus || op.authorConnectionStatus || 'none');
            p.originalPost = {
              ...op,
              user: isOpMine ? (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : ((profile as any)?.username || 'Throne8 User')) : (op.user || op.authorName || 'Throne8 User'),
              avatar: isOpMine ? (profile?.profileImage || op.avatar) : (op.avatar || op.authorAvatar || ''),
              role: isOpMine ? (profile?.headline || op.role) : (op.role || op.authorHeadline || ''),
              time: op.timeAgo || op.time || (op.createdAt ? new Date(op.createdAt).toLocaleDateString() : ''),
              likesCount: op.likesCount ?? op.likes ?? 0,
              commentsCount: op.commentsCount ?? op.comments ?? 0,
              repostsCount: op.repostsCount ?? op.shares ?? 0,
              sendsCount: op.sendsCount ?? 0,
              pollData: (op.pollData?.question && Array.isArray(op.pollData?.options) && op.pollData.options.length >= 2) ? op.pollData : null,
              eventData: ((op.eventData?.eventName || op.eventData?.title) && (op.eventData?.startDate || op.eventData?.eventDate || op.eventData?.registrationLink)) ? op.eventData : null,
              documents: op.documents || [],
              connectionStatus: opConnStatus,
              connectionDegree: op.connectionDegree ?? null,
              degreeLabel: getDegreeLabel(op.connectionDegree, opConnStatus, isOpMine),
            };
          }

          // Normalize author fields so PostHeader always gets consistent data
          const isMyPost = Boolean(myUserId && ((p.userId || p.currentUserId || p.repostedBy) === myUserId));
          const pConnStatus = isMyPost ? 'self' : (p.connectionStatus || p.authorConnectionStatus || 'none');
          const resolvedName = isMyPost
            ? currentUserName
            : (p.feedItemType === 'repost' ? (p.repostedByName || p.user) : (p.user || p.authorName || 'Throne8 User'));
          const resolvedAvatar = isMyPost
            ? (currentAvatar || profile?.profileImage || p.avatar || p.authorAvatar)
            : (p.avatar || p.authorAvatar || '');
          const resolvedHeadline = isMyPost
            ? (profile?.headline || (currentUser as any)?.headline || p.role || 'Member')
            : (p.role || p.authorHeadline || '');
          const resolvedTimeAgo = p.timeAgo || p.time || (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '');

          return {
            ...p,
            user: resolvedName,
            authorName: resolvedName,
            username: p.username || p.userName || '',
            avatar: resolvedAvatar,
            authorAvatar: resolvedAvatar,
            role: resolvedHeadline,
            authorHeadline: resolvedHeadline,
            time: resolvedTimeAgo,
            likesCount: p.likesCount ?? p.likes ?? 0,
            commentsCount: p.commentsCount ?? p.comments ?? 0,
            repostsCount: p.repostsCount ?? p.shares ?? 0,
            sendsCount: p.sendsCount ?? 0,
            isLikedByCurrentUser: Boolean(p.isLikedByCurrentUser),
            currentUserReaction: p.currentUserReaction || (p.isLikedByCurrentUser ? 'like' : null),
            pollData: (p.pollData?.question && Array.isArray(p.pollData?.options) && p.pollData.options.length >= 2) ? p.pollData : null,
            eventData: ((p.eventData?.eventName || p.eventData?.title) && (p.eventData?.startDate || p.eventData?.eventDate || p.eventData?.registrationLink)) ? p.eventData : null,
            documents: p.documents || [],
            connectionStatus: pConnStatus,
            connectionDegree: p.connectionDegree ?? null,
            degreeLabel: getDegreeLabel(p.connectionDegree, pConnStatus, isMyPost),
            matchedInterests: p.matchedInterests || [],
            likedByConnections: p.likedByConnections || [],
            likedByConnectionsAvatars: p.likedByConnectionsAvatars || [],
            likedByConnectionsFull: p.likedByConnectionsFull || [],
            commentedByConnections: p.commentedByConnections || [],
            commentedByConnectionsAvatars: p.commentedByConnectionsAvatars || [],
            commentedByConnectionsFull: p.commentedByConnectionsFull || [],
            isSaved: Boolean(p.isSaved),
            isPinned: Boolean(p.isPinned),
            isMuted: Boolean(p.isMuted),
            currentUserHasReposted: p.currentUserHasReposted || false,
          };
        });

      if (pageNum === 1) {
        setPosts(finalPosts || []);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.entryId || p.postId || p.id || p._id));
          const newUniquePosts = (finalPosts || []).filter(p => !existingIds.has(p.entryId || p.postId || p.id || p._id));
          return [...prev, ...newUniquePosts];
        });
      }

      const pagination = res?.data?.pagination;
      setHasMore(pagination ? pagination.hasNextPage : fetchedPosts.length === limit);
      setPage(pageNum);

      // Initialize liked and reaction state maps for the UI
      setLikedPosts(prev => {
        const newLikes = { ...prev };
        finalPosts.forEach((post: any) => {
          const id = post.id || post._id || post.entryId;
          newLikes[id] = !!post.isLikedByCurrentUser;
        });
        return newLikes;
      });

      setUserReactions(prev => {
        const newReactions = { ...prev };
        finalPosts.forEach((post: any) => {
          const id = post.id || post._id || post.entryId;
          newReactions[id] = post.currentUserReaction || (post.isLikedByCurrentUser ? 'like' : null);
        });
        return newReactions;
      });

    } catch (err) {
      console.error('Failed to fetch home feed:', err);
    } finally {
      setIsLoadingPosts(false);
      setIsFetchingMore(false);
    }
  };

  const fetchMorePosts = () => {
    if (!isFetchingMore && !isLoadingPosts && hasMore) {
      fetchPosts(page + 1);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [profile?.userId]);

  // ── Comment state ─────────────────────────────────────────────────────────
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<any>(null);
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<any>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [postCommentCounts, setPostCommentCounts] = useState<Record<string, number>>({});
  const [commentUserReactions, setCommentUserReactions] = useState<Record<string, string | null>>({});

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLike = async (postKey: string) => {
    const isCurrentlyLiked = likedPosts[postKey];
    const prevReaction = userReactions[postKey];

    // Optimistic UI update
    setLikedPosts(prev => ({ ...prev, [postKey]: !isCurrentlyLiked }));
    setUserReactions(prev => ({ ...prev, [postKey]: isCurrentlyLiked ? null : 'like' }));
    setPosts(prev => prev.map(p => {
      const pId = p.entryId || p.postId || p.id || p._id;
      if (pId === postKey) {
        return {
          ...p,
          likesCount: isCurrentlyLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1,
          isLikedByCurrentUser: !isCurrentlyLiked,
          currentUserReaction: isCurrentlyLiked ? null : 'like',
        };
      }
      return p;
    }));

    try {
      if (isCurrentlyLiked) {
        await FeedService.unlikePost(postKey);
      } else {
        await FeedService.likePost(postKey);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setLikedPosts(prev => ({ ...prev, [postKey]: isCurrentlyLiked }));
      setUserReactions(prev => ({ ...prev, [postKey]: prevReaction }));
      fetchPosts();
    }
  };

  const handleReact = async (postKey: string, type: ReactionType) => {
    const prevReaction = userReactions[postKey];
    const isSame = prevReaction === type;
    const nextReaction = isSame ? null : type;

    // Optimistic UI update
    setUserReactions(prev => ({ ...prev, [postKey]: nextReaction }));
    setLikedPosts(prev => ({ ...prev, [postKey]: Boolean(nextReaction) }));

    setPosts(prev => prev.map(p => {
      const pId = p.entryId || p.postId || p.id || p._id;
      if (pId === postKey) {
        let delta = 0;
        if (!prevReaction && nextReaction) delta = 1;
        else if (prevReaction && !nextReaction) delta = -1;
        return {
          ...p,
          likesCount: Math.max(0, (p.likesCount || 0) + delta),
          isLikedByCurrentUser: Boolean(nextReaction),
          currentUserReaction: nextReaction,
        };
      }
      return p;
    }));

    try {
      if (nextReaction) {
        await FeedService.reactToPost(postKey, nextReaction);
      } else {
        await FeedService.removeReaction(postKey);
      }
    } catch (err) {
      console.error('Failed to react to post:', err);
      setUserReactions(prev => ({ ...prev, [postKey]: prevReaction }));
      setLikedPosts(prev => ({ ...prev, [postKey]: Boolean(prevReaction) }));
    }
  };

  const handleVotePoll = async (postKey: string, optionId: string) => {
    const myId = profile?.userId || (profile as any)?._id;
    setPosts(prev => prev.map(p => {
      const pId = p.entryId || p.postId || p.id || p._id;
      if (pId === postKey && p.pollData) {
        if (p.pollData.userVotedOptionId) return p;

        const updatedOptions = p.pollData.options.map((opt: any) => {
          if (opt.optionId === optionId) {
            return {
              ...opt,
              votes: (opt.votes || 0) + 1,
              votedBy: [...(opt.votedBy || []), myId].filter(Boolean),
            };
          }
          return opt;
        });

        return {
          ...p,
          pollData: {
            ...p.pollData,
            totalVotes: (p.pollData.totalVotes || 0) + 1,
            userVotedOptionId: optionId,
            options: updatedOptions,
          },
        };
      }
      return p;
    }));

    try {
      await FeedService.votePoll(postKey, optionId);
    } catch (err) {
      console.error('Failed to vote on poll:', err);
    }
  };

  const handleRecordSend = async (postKey: string) => {
    setPosts(prev => prev.map(p => {
      const pId = p.entryId || p.postId || p.id || p._id;
      if (pId === postKey) {
        return {
          ...p,
          sendsCount: (p.sendsCount || 0) + 1,
          shares: (p.shares || 0) + 1,
        };
      }
      return p;
    }));
    await FeedService.recordSend(postKey, 1);
  };

  const togglePostMenu = (index: number) => {
    setOpenMenuIndex(prev => prev === index ? null : index);
  };

  const toggleRepostMenu = (index: number) => {
    setOpenRepostIndex(prev => prev === index ? null : index);
  };

  const handlePostAction = async (action: string, index: number, postKey?: string) => {
    setOpenMenuIndex(null);
    const targetPost = posts[index];
    const targetKey = postKey || targetPost?.entryId || targetPost?.postId;

    if (action === 'delete') {
      setPosts(prev => prev.filter((_, i) => i !== index));
      if (targetKey) {
        try {
          await FeedService.deletePost(targetKey);
        } catch (err) {
          console.error('Failed to delete post:', err);
          fetchPosts();
        }
      }
    } else if (action === 'edit') {
      setEditingPost(targetPost);
    } else if (action === 'save') {
      const newSavedState = !targetPost?.isSaved;
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, isSaved: newSavedState } : p));
      if (targetKey) {
        try {
          await FeedService.savePost(targetKey, newSavedState);
        } catch (err) {
          console.error('Failed to save post:', err);
        }
      }
    } else if (action === 'pin') {
      const newPinState = !targetPost?.isPinned;
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, isPinned: newPinState } : p));
      if (targetKey) {
        try {
          await FeedService.pinPost(targetKey, newPinState);
        } catch (err) {
          console.error('Failed to pin post:', err);
        }
      }
    } else if (action === 'mute') {
      const newMuteState = !targetPost?.isMuted;
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, isMuted: newMuteState } : p));
      if (targetKey) {
        try {
          if (newMuteState) {
            await FeedService.mutePostThread(targetKey);
          } else {
            await FeedService.unmutePostThread(targetKey);
          }
        } catch (err) {
          console.error('Failed to toggle mute:', err);
        }
      }
    } else if (action === 'report') {
      setSelectedPostForReport(targetPost);
      setIsReportModalOpen(true);
    }
  };

  // OLD CODE:
  // const toggleComments = (postKey: string) => {
  //   setOpenCommentsIndex(prev => prev === postKey ? null : postKey);
  //   setCommentText('');
  // };

  // NEW CODE: Dynamic Toggle Comments (Fetches comments)
  const toggleComments = async (postKey: string) => {
    const isOpening = openCommentsIndex !== postKey;
    setOpenCommentsIndex(isOpening ? postKey : null);
    setCommentText('');
    setCommentImage(null);

    if (isOpening) {
      setLoadingCommentsPostId(postKey);
      try {
        const res = await AuthService.getCommentsByPostId(postKey);
        let comments = [];
        if (Array.isArray(res)) comments = res;
        else if (Array.isArray(res.data)) comments = res.data;
        else if (res.data && Array.isArray(res.data.comments)) comments = res.data.comments;
        else if (Array.isArray(res.comments)) comments = res.comments;

        setPostComments(prev => ({ ...prev, [postKey]: comments }));
        setPostCommentCounts(prev => ({ ...prev, [postKey]: comments.length }));
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoadingCommentsPostId(null);
      }
    }
  };

  // OLD CODE:
  // const handleCommentSubmit = (postKey: string) => {
  //   if (!commentText.trim()) return;
  //   const newComment = {
  //     id: Date.now().toString(),
  //     commentId: Date.now().toString(),
  //     user: dummyProfile.name,
  //     avatar: dummyProfile.profileImage,
  //     time: 'Just now',
  //     content: commentText.trim(),
  //     reactions: {},
  //     replies: [],
  //   };
  //   setPostComments(prev => ({
  //     ...prev,
  //     [postKey]: [...(prev[postKey] || []), newComment],
  //   }));
  //   setPostCommentCounts(prev => ({
  //     ...prev,
  //     [postKey]: (prev[postKey] || 0) + 1,
  //   }));
  //   setCommentText('');
  // };

  // NEW CODE: Dynamic Comment Submit
  const handleCommentSubmit = async (postKey: string) => {
    if (!commentText.trim() && !commentImage) return;
    const text = commentText.trim();
    const imageToSubmit = commentImage;

    setCommentText(''); // Clear instantly
    setCommentImage(null); // Clear instantly
    setSubmittingCommentPostId(postKey);

    try {
      if (replyingTo) {
        await AuthService.createReply(replyingTo, text);
        setReplyingTo(null);
      } else {
        await AuthService.createComment(postKey, text, imageToSubmit);
      }

      // Refresh comments from server
      const res = await AuthService.getCommentsByPostId(postKey);

      let comments = [];
      if (Array.isArray(res)) comments = res;
      else if (Array.isArray(res.data)) comments = res.data;
      else if (res.data && Array.isArray(res.data.comments)) comments = res.data.comments;
      else if (Array.isArray(res.comments)) comments = res.comments;

      setPostComments(prev => ({ ...prev, [postKey]: comments }));
      setPostCommentCounts(prev => ({ ...prev, [postKey]: comments.length }));

      // Update post comment count locally
      setPosts(prev => prev.map(p => {
        const pId = p.entryId || p.postId || p.id || p._id;
        if (pId === postKey) {
          return { ...p, commentsCount: comments.length };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
      // Restore input on failure
      setCommentText(text);
      setCommentImage(imageToSubmit);
    } finally {
      setSubmittingCommentPostId(null);
    }
  };

  const handleReply = (commentId: string) => setReplyingTo(commentId);

  const handleCommentReaction = async (commentId: string, emoji: string) => {
    const prevEmoji = commentUserReactions[commentId] ?? null;
    const isSame = prevEmoji === emoji;
    const nextEmoji = isSame ? null : emoji;

    // Update user reaction state
    setCommentUserReactions(prev => ({ ...prev, [commentId]: nextEmoji }));

    // Optimistic UI: adjust counts
    setPostComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(postKey => {
        updated[postKey] = updated[postKey].map(c => {
          if ((c.commentId || c.id) === commentId) {
            const reactions = { ...(c.reactions || {}) };
            // Remove old reaction
            if (prevEmoji && reactions[prevEmoji] > 0) {
              reactions[prevEmoji] = reactions[prevEmoji] - 1;
            }
            // Add new reaction (unless toggling off)
            if (!isSame) {
              reactions[emoji] = (reactions[emoji] || 0) + 1;
            }
            return { ...c, reactions };
          }
          return c;
        });
      });
      return updated;
    });

    // Backend call
    try {
      const EMOJI_MAP: Record<string, string> = { '❤️': 'love', '👍': 'like', '😂': 'funny', '🔥': 'celebrate', '👏': 'support' };
      const backendKey = EMOJI_MAP[emoji] || 'like';
      await AuthService.reactToComment(commentId, backendKey);
    } catch (err) {
      console.error('Failed to react to comment:', err);
      // Optional: Revert optimistic update here if needed
    }
  };

  const toggleCommentMenu = (id: string) => {
    setOpenCommentMenuIndex((prev: any) => prev === id ? null : id);
  };

  // OLD CODE:
  // const handleCommentAction = (action: string, comment: any) => {
  //   setOpenCommentMenuIndex(null);
  //   if (action === 'edit') {
  //     setEditingCommentId(comment.commentId || comment.id);
  //     setEditCommentText(comment.content || comment.text || '');
  //   } else if (action === 'delete') {
  //     setPostComments(prev => {
  //       const updated = { ...prev };
  //       Object.keys(updated).forEach(postKey => {
  //         updated[postKey] = updated[postKey].filter(
  //           c => (c.commentId || c.id) !== (comment.commentId || comment.id)
  //         );
  //       });
  //       return updated;
  //     });
  //   } else if (action === 'cancelEdit') {
  //     setEditingCommentId(null);
  //     setEditCommentText('');
  //   }
  // };

  // NEW CODE: Dynamic Comment Action
  const handleCommentAction = async (action: string, comment: any) => {
    setOpenCommentMenuIndex(null);
    const commentId = comment.commentId || comment.id || comment._id;

    if (action === 'edit') {
      setEditingCommentId(commentId);
      setEditCommentText(comment.content || comment.text || '');
    } else if (action === 'delete') {
      // Optimistic delete
      setPostComments(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(postKey => {
          updated[postKey] = updated[postKey].filter(
            c => (c.commentId || c.id || c._id) !== commentId
          );
        });
        return updated;
      });
      try {
        await AuthService.deleteComment(commentId);
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    } else if (action === 'cancelEdit') {
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  // OLD CODE:
  // const handleEditSubmit = (commentId: string) => {
  //   setPostComments(prev => {
  //     const updated = { ...prev };
  //     Object.keys(updated).forEach(postKey => {
  //       updated[postKey] = updated[postKey].map(c => {
  //         if ((c.commentId || c.id) === commentId) {
  //           return { ...c, content: editCommentText, text: editCommentText };
  //         }
  //         return c;
  //       });
  //     });
  //     return updated;
  //   });
  //   setEditingCommentId(null);
  //   setEditCommentText('');
  // };

  // NEW CODE: Dynamic Edit Submit
  const handleEditSubmit = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    // Optimistic update
    setPostComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(postKey => {
        updated[postKey] = updated[postKey].map(c => {
          if ((c.commentId || c.id || c._id) === commentId) {
            return { ...c, content: editCommentText.trim(), text: editCommentText.trim() };
          }
          return c;
        });
      });
      return updated;
    });

    const textToSubmit = editCommentText.trim();
    setEditingCommentId(null);
    setEditCommentText('');

    try {
      await AuthService.updateComment(commentId, textToSubmit);
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handlePickCommentPhoto = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: false,
      cropping: true,
      freeStyleCropEnabled: true,
      compressImageMaxWidth: 1080,
      compressImageMaxHeight: 1440,
      compressImageQuality: 0.8,
    }).then(image => {
      const imageUri = image.path.startsWith('file://') || image.path.startsWith('content://') ? image.path : 'file://' + image.path;
      setCommentImage({
        uri: imageUri,
        type: image.mime || 'image/jpeg',
        fileName: image.filename || `comment_img_${Date.now()}.jpg`,
      });
    }).catch(e => {
      console.log('Comment image picker cancelled', e);
    });
  };

  const handleRepostInstant = async (index: number) => {
    const post = posts[index];
    if (!post) return;
    setOpenRepostIndex(null);
    try {
      await AuthService.createRepost(post.entryId || post.postId, { type: 'repost' });
      // Optimistically mark as reposted
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, currentUserHasReposted: true } : p));
    } catch (err: any) {
      console.log('Failed to repost', err);
    }
  };

  const handleUndoRepost = async (index: number) => {
    const post = posts[index];
    if (!post) return;
    try {
      // Backend: delete repost by entryId
      const repostsRes = await AuthService.getUserReposts();
      const reposts = repostsRes?.data?.reposts || repostsRes?.reposts || [];
      const myRepost = reposts.find((r: any) => r.originalPost?.entryId === (post.entryId || post.postId));
      if (myRepost?.repostId) {
        await AuthService.deleteRepost(myRepost.repostId);
      }
      // Optimistically remove reposted flag
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, currentUserHasReposted: false } : p));
    } catch (err) {
      console.log('Failed to undo repost', err);
    }
  };

  const onOpenWithPerspectiveModal = (post: any) => {
    setPostToRepost(post);
    setIsRepostModalOpen(true);
  };

  const handleRepostSubmit = async (thoughts: string) => {
    if (!postToRepost) return;
    try {
      await AuthService.createRepost(postToRepost.entryId || postToRepost.postId, {
        type: 'quote',
        thoughtText: thoughts
      });
      fetchPosts(); // Refresh feed
    } catch (err) {
      console.log('Failed to repost with thoughts', err);
      throw err;
    }
  };

  // ── Swipe Gesture to Open Drawer (Optimized) ─────────────────────────────────────────────

  /* old code (PanResponder approach):
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy, moveX } = gestureState;
        const startX = moveX - dx;
        // Trigger if swiping right from the left edge (startX < 60) and moving horizontally (dx > 20)
        return startX < 60 && dx > 20 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setSidebarOpen(true);
        }
      },
    })
  ).current;
  */

  const handleGesture = ({ nativeEvent }: any) => {
    // Open drawer if the user swipes right by more than 50 pixels and it's not already opening
    if (nativeEvent.translationX > 50 && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  /* old code:
  return (
    <BottomBar>
      <View className="flex-1 bg-white">
        ...
      </View>
    </BottomBar>
  );
  */

  const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  return (
    <BottomBar>
      <PanGestureHandler
        onGestureEvent={handleGesture}
        activeOffsetX={[-1000, 20]} // Activates only on horizontal swipe to the right
      >
        <View className="flex-1 bg-white">

          {/* ── Top bar ─────────────────────────────────────────────────── */}
          <SafeAreaView className="bg-brand-light">
            <View className="flex-row items-center justify-between px-4 py-6 mt-2">

              {/* Left: hamburger + Throne8 */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  className="w-9 h-9 items-center justify-center"
                  onPress={() => setSidebarOpen(true)}
                  activeOpacity={0.7}
                >
                  <HamburgerIcon />
                </TouchableOpacity>
                <Text
                  className="font-black tracking-widest"
                  style={{ fontSize: 20, color: '#8b6914' }}
                >
                  THRONE8
                </Text>
              </View>

              {/* Right: notifs + message button */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  className="relative w-9 h-9 bg-brand-dark rounded-xl items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Notifs')}
                >
                  <NotifsIcon />
                  {unreadNotifsCount > 0 && (
                    <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border border-white items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">
                        {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="relative w-9 h-9 bg-brand-dark rounded-xl items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MessagesList')}
                >
                  <MessageIcon />
                  {unreadMessagesCount > 0 && (
                    <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border border-white items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Search bar */}
            <View className="flex-row items-center gap-2 px-3 pb-2">
              {/* <Image
              source={{ uri: profile?.profileImage || DEFAULT_AVATAR }}
              className="w-9 h-9 rounded-full border border-brand-border"
              resizeMode="cover"
            /> */}
              <View className="flex-1 flex-row items-center bg-white/40 rounded-full px-4 py-2 border border-[#d4c4b5] gap-2">
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onSubmitEditing={() => {
                    if (searchQuery.trim().length > 0) {
                      setIsSearchFocused(false);
                      Keyboard.dismiss();
                      navigation.navigate('Search', { query: searchQuery.trim() });
                    }
                  }}
                  returnKeyType="search"
                  placeholder="Search"
                  placeholderTextColor="rgba(74,55,40,0.5)"
                  className="flex-1 text-sm"
                  style={{ color: '#4a3728' }}
                />
                <SearchIcon />
              </View>
            </View>
          </SafeAreaView>

          {/* Transparent Overlay to close search */}
          {isSearchFocused && (
            <Pressable
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 40 }}
              onPress={() => {
                setIsSearchFocused(false);
                Keyboard.dismiss();
              }}
            />
          )}

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length >= 2 && (
            <View
              className="absolute left-0 right-0 mx-4 bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-dark/10"
              style={{ top: 140, zIndex: 100, elevation: 5, maxHeight: 300 }}
            >
              {isSearching ? (
                <View className="p-4 items-center">
                  <Text className="text-brand-dark/60 font-medium">Searching users...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                  {searchResults.map((user: any, index: number) => (
                    <TouchableOpacity
                      key={user._id || user.id || user.userId || `user-${index}`}
                      className="flex-row items-center p-3 border-b border-brand-dark/5"
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsSearchFocused(false);
                        Keyboard.dismiss();
                        navigation.navigate('Profile', { userId: user._id || user.id || user.userId });
                      }}
                    >
                      <Image
                        source={{ uri: user.profileImage || user.avatar || user.profilePicture || DEFAULT_AVATAR }}
                        className="w-12 h-12 rounded-full bg-brand-dark/10"
                      />
                      <View className="ml-3 flex-1 justify-center">
                        <Text className="font-bold text-brand-dark text-[15px]" numberOfLines={1}>
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                        </Text>
                        {(user.headline || user.role) && (
                          <Text className="text-xs text-brand-dark/60 mt-0.5" numberOfLines={1}>
                            {user.headline || user.role}
                          </Text>
                        )}
                      </View>
                      <SearchIcon />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View className="p-4 items-center">
                  <Text className="text-brand-dark/60">No users found</Text>
                </View>
              )}

              {/* See all results button */}
              {!isSearching && (
                <TouchableOpacity
                  className="p-3 border-t border-brand-dark/10 bg-brand-dark/5 items-center"
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                    navigation.navigate('Search', { query: searchQuery.trim() });
                  }}
                >
                  <Text className="text-brand-dark font-bold text-sm">
                    See all results for "{searchQuery}"
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Feed ─────────────────────────────────────────────────────── */}
          <FlatList
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
            onScroll={emitBottomBarScroll}
            onScrollEndDrag={emitBottomBarScrollEnd}
            onMomentumScrollEnd={emitBottomBarScrollEnd}
            scrollEventThrottle={16}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingPosts && page === 1}
                onRefresh={() => fetchPosts(1)}
                tintColor="#4a3728"
                colors={["#4a3728"]}
              />
            }
            ListHeaderComponent={
              <>
                {/* Create post prompt */}
                <CreatePostPrompt
                  setIsPostCreatorOpen={setIsPostCreatorOpen}
                  profileImage={currentAvatar}
                  onPickPhotoDirect={handlePickPhotoDirect}
                  onPickVideoDirect={handlePickVideoDirect}
                  onPickArticleDirect={handlePickDocumentDirect}
                />

                {/* Uploading Post Indicator */}
                {uploadingPost && (
                  <View className="mx-4 mt-2 mb-2 bg-[#fdfbf9] border border-[#e0d8cf] p-3 rounded-2xl flex-row items-center justify-between shadow-sm">
                     <View className="flex-1 mr-4">
                        <Text className="text-[#4a3728] text-xs font-semibold mb-2">Uploading post...</Text>
                        <View className="h-1.5 w-full bg-[#f6ede8] rounded-full overflow-hidden">
                           <View style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#4a3728', borderRadius: 4 }} />
                        </View>
                     </View>
                     <TouchableOpacity onPress={cancelUpload} className="w-6 h-6 bg-[#f6ede8] rounded-full items-center justify-center border border-[#e0d8cf]" activeOpacity={0.7}>
                        <Text style={{ fontSize: 10, color: '#4a3728', fontWeight: 'bold' }}>✕</Text>
                     </TouchableOpacity>
                  </View>
                )}
              </>
            }
            data={posts}
            keyExtractor={(item, index) => item.entryId || item.postId || item.id || item._id || index.toString()}
            renderItem={({ item: post, index }) => (
              <PostCard
                key={post.entryId || post.postId || index}
                post={post}
                index={index}
                currentUserId={profile?.userId || (profile as any)?._id || AuthService.getCurrentUser()?.userId || (AuthService.getCurrentUser() as any)?.id}
                currentUserName={currentUserName}
                likedPosts={likedPosts}
                userReactions={userReactions}
                handleLike={handleLike}
                handleReact={handleReact}
                openMenuIndex={openMenuIndex}
                openRepostIndex={openRepostIndex}
                openCommentsIndex={openCommentsIndex}
                commentText={commentText}
                setCommentText={setCommentText}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                openCommentMenuIndex={openCommentMenuIndex}
                editingCommentId={editingCommentId}
                editCommentText={editCommentText}
                setEditCommentText={setEditCommentText}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                handlePostAction={handlePostAction}
                togglePostMenu={togglePostMenu}
                toggleRepostMenu={toggleRepostMenu}
                toggleComments={toggleComments}
                handleCommentSubmit={handleCommentSubmit}
                handleReply={handleReply}
                handleCommentReaction={handleCommentReaction}
                toggleCommentMenu={toggleCommentMenu}
                handleCommentAction={handleCommentAction}
                handleEditSubmit={handleEditSubmit}
                handleEmojiClick={handleEmojiClick}
                postComments={postComments}
                postCommentCounts={postCommentCounts}
                emojiList={EMOJI_LIST}
                profileImage={currentAvatar}
                onOpenWithPerspectiveModal={onOpenWithPerspectiveModal}
                handleRepostInstant={handleRepostInstant}
                handleUndoRepost={handleUndoRepost}
                commentImage={commentImage}
                setCommentImage={setCommentImage}
                onPickCommentPhoto={handlePickCommentPhoto}
                isSubmitting={submittingCommentPostId === (post.entryId || post.postId)}
                isLoadingComments={loadingCommentsPostId === (post.entryId || post.postId || post.id || post._id)}
                commentUserReactions={commentUserReactions}
                onOpenReactors={(postKey: string) => {
                  setSelectedPostForReactors(postKey);
                  setIsReactorsModalOpen(true);
                }}
                onRecordSend={handleRecordSend}
                onVotePoll={handleVotePoll}
              />
            )}
            onEndReached={fetchMorePosts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              <View className="py-6 items-center">
                 {isFetchingMore ? (
                    <ActivityIndicator size="small" color="#4a3728" />
                 ) : !hasMore && posts.length > 0 ? (
                    <Text className="text-brand-dark/50 text-xs font-semibold">You're all caught up!</Text>
                 ) : null}
              </View>
            }
            ListEmptyComponent={
              isLoadingPosts && page === 1 ? (
                <View>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </View>
              ) : (
                <View className="py-20 items-center gap-3">
                  <Text className="text-[#4a3728] font-bold text-base">No posts available yet</Text>
                  <Text className="text-brand-dark/40 text-sm">Check back later for updates!</Text>
                </View>
              )
            }
          />

          {/* ── Create Post Modal ─────────────────────────────────────────── */}
          <UpdatePostModal
            postId={editingPost?.postId || editingPost?.entryId || ''}
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            currentTitle={editingPost?.title || ''}
            currentContent={editingPost?.content || ''}
            onUpdate={(_id: string, _newTitle: string, _newContent: string) => {
              setEditingPost(null);
              fetchPosts(); // Refresh after update
            }}
          />

          <CreatePostModal
            isOpen={_isPostCreatorOpen}
            initialPostImages={initialPostImages}
            initialPostVideos={initialPostVideos}
            initialPostDocuments={initialPostDocuments}
            authorAvatar={currentAvatar}
            authorName={currentUserName}
            onClose={() => {
              setIsPostCreatorOpen(false);
              setInitialPostImages([]);
              setInitialPostVideos([]);
              setInitialPostDocuments([]);
            }}
            onSubmit={(newPost: any) => {
              setIsPostCreatorOpen(false);
              setInitialPostImages([]);
              setInitialPostVideos([]);
              setInitialPostDocuments([]);

              // Map the current user's profile onto the newly created post so it looks good instantly
              const formattedPost = {
                ...newPost,
                userId: currentUserId || profile?.userId || (profile as any)?._id,
                currentUserId: currentUserId || profile?.userId || (profile as any)?._id,
                authorName: currentUserName,
                user: currentUserName,
                authorAvatar: currentAvatar,
                avatar: currentAvatar,
                role: profile?.headline || (currentUser as any)?.headline || 'Member',
                authorHeadline: profile?.headline || (currentUser as any)?.headline || 'Member',
                isOwnPost: true,
              };

              // Optimistically insert it at the top of the feed!
              setPosts((prevPosts: any) => [formattedPost, ...prevPosts]);
            }}
          />

          <RepostModal
            isOpen={isRepostModalOpen}
            onClose={() => setIsRepostModalOpen(false)}
            post={postToRepost}
            onSubmit={handleRepostSubmit}
          />

          <ReportModal
            isOpen={isReportModalOpen}
            postId={selectedPostForReport?.entryId || selectedPostForReport?.postId || ''}
            postOwnerId={selectedPostForReport?.userId}
            onClose={() => {
              setIsReportModalOpen(false);
              setSelectedPostForReport(null);
            }}
          />

          <ReactorsModal
            isOpen={isReactorsModalOpen}
            postId={selectedPostForReactors || ''}
            onClose={() => {
              setIsReactorsModalOpen(false);
              setSelectedPostForReactors(null);
            }}
          />

          {/* ── Left Sidebar Drawer ─────────────────────────────────────────── */}
          <LeftSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </View>
      </PanGestureHandler>
    </BottomBar>
  );
}