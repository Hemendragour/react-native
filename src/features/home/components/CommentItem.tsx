// features/home/components/feed/CommentItem.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Modal, Animated, ScrollView } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import AuthService from '../../../services/auth.service';
import { FeedService } from '../../../services/feed.service';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DotsIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#4a3728">
    <Path d="M12 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </Svg>
);

const REACTIONS = ['❤️', '👍', '😂', '🔥', '👏'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const isIdentifier = (str: any): boolean => {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (/^[0-9a-fA-F]{24}$/.test(s)) return true;
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(s)) return true;
  if (/^(usr_|user_|auth_|com_|comment_|post_)[a-zA-Z0-9_-]+$/i.test(s)) return true;
  return false;
};

const isValidImageUrl = (url: any): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('data:') &&
    !trimmed.startsWith('file://')
  ) {
    return false;
  }
  if (trimmed.includes('pravatar.cc') || trimmed.includes('unsplash.com')) {
    return false;
  }
  return true;
};

const extractNameFromEntity = (entity: any): string => {
  if (!entity) return '';
  if (typeof entity === 'string') {
    if (isIdentifier(entity) || entity === 'Unknown User' || entity === 'undefined' || entity === 'null') return '';
    return entity.trim();
  }
  if (typeof entity === 'object') {
    const fn = entity.firstName || entity.personalInfo?.firstName || '';
    const ln = entity.lastName || entity.personalInfo?.lastName || '';
    const full = `${fn} ${ln}`.trim();
    if (full && !isIdentifier(full)) return full;
    if (typeof entity.fullName === 'string' && entity.fullName.trim() && !isIdentifier(entity.fullName)) {
      return entity.fullName.trim();
    }
    if (typeof entity.name === 'string' && entity.name.trim() && !isIdentifier(entity.name) && entity.name !== 'Unknown User') {
      return entity.name.trim();
    }
    if (typeof entity.username === 'string' && entity.username.trim() && !isIdentifier(entity.username)) {
      return entity.username.trim();
    }
    if (typeof entity.displayName === 'string' && entity.displayName.trim() && !isIdentifier(entity.displayName)) {
      return entity.displayName.trim();
    }
    if (typeof entity.handle === 'string' && entity.handle.trim() && !isIdentifier(entity.handle)) {
      return entity.handle.trim();
    }
  }
  return '';
};

const extractAvatarFromEntity = (entity: any): string => {
  if (!entity) return '';
  if (typeof entity === 'string') {
    if (isValidImageUrl(entity)) return entity.trim();
    return '';
  }
  if (typeof entity === 'object') {
    const candidates = [
      entity.profileImage,
      entity.avatar,
      entity.avatarUrl,
      entity.profilePicture,
      entity.profilePhoto,
      entity.image,
      entity.logo,
      entity.personalInfo?.profilePicture,
      entity.personalInfo?.profileImage,
      entity.personalInfo?.avatar,
    ];
    for (const c of candidates) {
      if (isValidImageUrl(c)) return c.trim();
    }
  }
  return '';
};

export const getCommentAuthor = (
  comment: any,
  currentUserId?: string,
  currentUserName?: string,
  currentUserAvatar?: string
) => {
  if (!comment) {
    const fallbackName = 'User';
    return {
      name: fallbackName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=e0d8cf&color=4a3728&size=128`,
      userId: '',
    };
  }

  // Check if current user
  const commentUid =
    (typeof comment.userId === 'string' ? comment.userId : comment.userId?._id || comment.userId?.id || comment.userId?.userId) ||
    (typeof comment.user === 'string' ? comment.user : comment.user?._id || comment.user?.id || comment.user?.userId) ||
    (typeof comment.author === 'string' ? comment.author : comment.author?._id || comment.author?.id || comment.author?.userId) ||
    (typeof comment.commenter === 'string' ? comment.commenter : comment.commenter?._id || comment.commenter?.id) ||
    comment.createdBy?._id || comment.createdBy;

  const authUser = AuthService.getCurrentUser() as any;
  const myId = currentUserId || authUser?.userId || authUser?.id || authUser?._id;
  const isSelf = Boolean(myId && commentUid && String(myId) === String(commentUid));

  // Check FeedService cache for this author
  const cachedUser = commentUid && typeof commentUid === 'string' ? FeedService.getUserFromCache(commentUid) : null;

  // 1. Resolve Name
  let name =
    extractNameFromEntity(comment.user) ||
    extractNameFromEntity(comment.author) ||
    extractNameFromEntity(comment.userId) ||
    extractNameFromEntity(comment.commenter) ||
    extractNameFromEntity(comment.postedBy) ||
    extractNameFromEntity(comment.createdBy) ||
    extractNameFromEntity(comment.authorName) ||
    extractNameFromEntity(comment.userName) ||
    extractNameFromEntity(comment.userFullName) ||
    extractNameFromEntity(comment.fullName) ||
    extractNameFromEntity(comment.name) ||
    extractNameFromEntity(`${comment.firstName || ''} ${comment.lastName || ''}`.trim()) ||
    (cachedUser && cachedUser.name && !isIdentifier(cachedUser.name) ? cachedUser.name : '');

  if ((!name || isIdentifier(name)) && isSelf) {
    name =
      currentUserName ||
      authUser?.name ||
      authUser?.fullName ||
      `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() ||
      authUser?.username ||
      '';
  }

  if (!name || isIdentifier(name)) {
    name = 'User';
  }

  // 2. Resolve Avatar
  let avatar =
    extractAvatarFromEntity(comment.user) ||
    extractAvatarFromEntity(comment.author) ||
    extractAvatarFromEntity(comment.userId) ||
    extractAvatarFromEntity(comment.commenter) ||
    extractAvatarFromEntity(comment.postedBy) ||
    extractAvatarFromEntity(comment.createdBy) ||
    extractAvatarFromEntity(comment.authorAvatar) ||
    extractAvatarFromEntity(comment.authorImage) ||
    extractAvatarFromEntity(comment.userAvatar) ||
    extractAvatarFromEntity(comment.userImage) ||
    extractAvatarFromEntity(comment.avatar) ||
    extractAvatarFromEntity(comment.profileImage) ||
    extractAvatarFromEntity(comment.profilePicture) ||
    (cachedUser && cachedUser.avatar ? cachedUser.avatar : '');

  if (!avatar && isSelf) {
    avatar =
      currentUserAvatar ||
      authUser?.profileImage ||
      authUser?.avatar ||
      authUser?.profilePicture ||
      '';
  }

  if (!avatar || !isValidImageUrl(avatar)) {
    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0d8cf&color=4a3728&size=128`;
  }

  return { name, avatar, userId: typeof commentUid === 'string' ? commentUid : '' };
};

const formatCommentTime = (timeOrDate: any): string => {
  if (!timeOrDate) return '';
  if (typeof timeOrDate === 'string') {
    if (
      timeOrDate.includes('ago') ||
      timeOrDate === 'Just now' ||
      timeOrDate === 'Today' ||
      timeOrDate === 'Yesterday'
    ) {
      return timeOrDate;
    }
  }
  const date = new Date(timeOrDate);
  if (isNaN(date.getTime())) return typeof timeOrDate === 'string' ? timeOrDate : '';
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: any;
  openCommentMenuIndex: any;
  editingCommentId: any;
  editCommentText: any;
  setEditCommentText: (v: string) => void;
  handleCommentReaction: (id: string, emoji: string) => void;
  toggleCommentMenu: (id: string) => void;
  handleCommentAction: (action: string, comment: any) => void;
  handleEditSubmit: (id: string) => void;
  handleReply: (id: string) => void;
  setReplyingTo?: (id: string | null) => void;
  profileImage?: string;
  currentUserId?: string;
  currentUserName?: string;
  userReaction?: string | null;
  onClose?: () => void;
}

// ─── Reply Component ──────────────────────────────────────────────────────────

const ReplyItem = ({
  reply,
  currentUserId,
  currentUserName,
  profileImage,
  onClose,
}: {
  reply: any;
  currentUserId?: string;
  currentUserName?: string;
  profileImage?: string;
  onClose?: () => void;
}) => {
  const navigation = useNavigation<any>();
  const [authorInfo, setAuthorInfo] = useState(() =>
    getCommentAuthor(reply, currentUserId, currentUserName, profileImage)
  );

  useEffect(() => {
    const initial = getCommentAuthor(reply, currentUserId, currentUserName, profileImage);
    setAuthorInfo(initial);

    const uid = initial.userId;
    if (uid && (initial.name === 'User' || !initial.avatar || initial.avatar.includes('ui-avatars.com'))) {
      FeedService.getUser(uid).then((fetched) => {
        if (fetched && fetched.name) {
          setAuthorInfo((prev) => ({
            ...prev,
            name: fetched.name || prev.name,
            avatar: fetched.avatar || prev.avatar,
          }));
        }
      });
    }
  }, [reply, currentUserId, currentUserName, profileImage]);

  const handleNavigateToProfile = () => {
    const uid =
      authorInfo.userId ||
      reply.userId ||
      reply.authorId ||
      reply.user?._id ||
      reply.user?.id ||
      reply.user?.userId ||
      reply.author?._id ||
      reply.author?.id ||
      reply.author?.userId ||
      (typeof reply.user === 'string' && isIdentifier(reply.user) ? reply.user : null) ||
      (typeof reply.author === 'string' && isIdentifier(reply.author) ? reply.author : null);

    onClose?.();

    if (uid) {
      navigation.navigate('Profile', { userId: uid });
    } else {
      navigation.navigate('Profile');
    }
  };

  const replyTime = formatCommentTime(reply.time || reply.timeAgo || reply.createdAt || reply.updatedAt || reply.timestamp);

  return (
    <View
      key={reply.id || reply._id || String(Math.random())}
      className="bg-white/50 rounded-xl p-2.5 flex-row items-start gap-2"
    >
      <TouchableOpacity onPress={handleNavigateToProfile} activeOpacity={0.8}>
        <Image
          source={{ uri: authorInfo.avatar }}
          className="w-7 h-7 rounded-lg border border-[#6b5643]"
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <TouchableOpacity onPress={handleNavigateToProfile} activeOpacity={0.8}>
            <Text className="text-brand-dark text-xs font-bold">{authorInfo.name}</Text>
          </TouchableOpacity>
          {Boolean(replyTime) && (
            <Text className="text-brand-dark/50 text-xs">{replyTime}</Text>
          )}
        </View>
        <Text className="text-brand-dark/80 text-xs">{reply.text || reply.content}</Text>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  openCommentMenuIndex,
  editingCommentId,
  editCommentText,
  setEditCommentText,
  handleCommentReaction,
  toggleCommentMenu,
  handleCommentAction,
  handleEditSubmit,
  handleReply,
  profileImage,
  currentUserId,
  currentUserName,
  userReaction,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const commentId = comment.commentId || comment._id || comment.id;
  const isMenuOpen = openCommentMenuIndex === commentId;
  const isEditing = editingCommentId === commentId;
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 1,
      }).start();
    }
  };

  const [authorInfo, setAuthorInfo] = useState(() =>
    getCommentAuthor(comment, currentUserId, currentUserName, profileImage)
  );

  useEffect(() => {
    const initial = getCommentAuthor(comment, currentUserId, currentUserName, profileImage);
    setAuthorInfo(initial);

    const uid = initial.userId;
    if (uid && (initial.name === 'User' || !initial.avatar || initial.avatar.includes('ui-avatars.com'))) {
      FeedService.getUser(uid).then((fetched) => {
        if (fetched && fetched.name) {
          setAuthorInfo((prev) => ({
            ...prev,
            name: fetched.name || prev.name,
            avatar: fetched.avatar || prev.avatar,
          }));
        }
      });
    }
  }, [comment, currentUserId, currentUserName, profileImage]);

  const handleNavigateToProfile = () => {
    const uid =
      authorInfo.userId ||
      comment.userId ||
      comment.authorId ||
      comment.user?._id ||
      comment.user?.id ||
      comment.user?.userId ||
      comment.author?._id ||
      comment.author?.id ||
      comment.author?.userId ||
      (typeof comment.user === 'string' && isIdentifier(comment.user) ? comment.user : null) ||
      (typeof comment.author === 'string' && isIdentifier(comment.author) ? comment.author : null);

    onClose?.();

    if (uid) {
      navigation.navigate('Profile', { userId: uid });
    } else {
      navigation.navigate('Profile');
    }
  };

  const commentTime = formatCommentTime(comment.time || comment.timeAgo || comment.createdAt || comment.updatedAt || comment.timestamp);

  return (
    <View className="bg-brand-border/30 rounded-2xl p-3 mb-2">
      <View className="flex-row items-start gap-2">

        {/* Avatar */}
        <TouchableOpacity onPress={handleNavigateToProfile} activeOpacity={0.8}>
          <Image
            source={{ uri: authorInfo.avatar }}
            className="w-9 h-9 rounded-xl border border-[#6b5643]"
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Name + time + menu */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={handleNavigateToProfile} activeOpacity={0.8}>
                <Text className="text-brand-dark text-xs font-bold">
                  {authorInfo.name}
                </Text>
              </TouchableOpacity>
              {Boolean(commentTime) && (
                <Text className="text-brand-dark/55 text-xs">
                  {commentTime}
                </Text>
              )}
            </View>

            {/* Menu */}
            <View>
              <TouchableOpacity
                className="p-1 rounded-lg"
                onPress={() => toggleCommentMenu(commentId)}
                activeOpacity={0.7}
              >
                <DotsIcon />
              </TouchableOpacity>

              {isMenuOpen && (
                <View className="absolute right-0 top-6 w-36 bg-brand-light rounded-xl border border-brand-border shadow-lg z-50 overflow-hidden">
                  <TouchableOpacity
                    className="px-3 py-2.5 border-b border-brand-border/30"
                    onPress={() => handleCommentAction('edit', comment)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-brand-dark text-xs font-medium">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-3 py-2.5"
                    onPress={() => handleCommentAction('delete', comment)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-red-600 text-xs font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Edit mode or comment text */}
          {isEditing ? (
            <View className="mb-2">
              <TextInput
                value={editCommentText}
                onChangeText={setEditCommentText}
                className="bg-white border border-brand-border rounded-xl px-3 py-2 text-xs"
                style={{ color: '#4a3728' }}
                onSubmitEditing={() => handleEditSubmit(commentId)}
                returnKeyType="done"
              />
              <View className="flex-row gap-2 mt-1.5">
                <TouchableOpacity
                  className="bg-[#6b5643] px-3 py-1.5 rounded-lg"
                  onPress={() => handleEditSubmit(commentId)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-semibold">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-brand-border px-3 py-1.5 rounded-lg"
                  onPress={() => handleCommentAction('cancelEdit', comment)}
                  activeOpacity={0.7}
                >
                  <Text className="text-brand-dark text-xs font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {!!(comment.content || comment.text) && (
                <Text className="text-brand-dark/80 text-xs leading-4 mb-2">
                  {comment.content || comment.text || ''}
                </Text>
              )}
              {!!comment.imageUrl && (
                <TouchableOpacity onPress={() => setIsImageModalVisible(true)} activeOpacity={0.8} className="mb-2 self-start">
                  <Image
                    source={{ uri: comment.imageUrl }}
                    className="w-32 h-32 rounded-lg border border-brand-border/50"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Image Zoom Modal */}
          {!!comment.imageUrl && (
            <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
              <View className="flex-1 bg-black/90 justify-center items-center">
                <TouchableOpacity
                  className="absolute top-10 right-5 z-50 p-2 bg-black/50 rounded-full"
                  onPress={() => setIsImageModalVisible(false)}
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
                {/* ScrollView provides native zoom on iOS */}
                <ScrollView 
                  contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  className="w-full h-full"
                >
                  {/* PinchGestureHandler provides basic pinch-to-zoom on Android */}
                  <PinchGestureHandler
                    onGestureEvent={onPinchEvent}
                    onHandlerStateChange={onPinchStateChange}
                  >
                    <Animated.Image
                      source={{ uri: comment.imageUrl }}
                      className="w-full h-full"
                      resizeMode="contain"
                      style={{ transform: [{ scale: scale }] }}
                    />
                  </PinchGestureHandler>
                </ScrollView>
              </View>
            </Modal>
          )}

          {/* Reaction pills — all emojis always visible, one selection at a time */}
          <View className="flex-row items-center gap-1 flex-wrap mb-1">
            {REACTIONS.map((emoji) => {
              const EMOJI_MAP: Record<string, string> = { '❤️': 'love', '👍': 'like', '😂': 'funny', '🔥': 'celebrate', '👏': 'support' };
              const backendKey = EMOJI_MAP[emoji];
              const reactionCount = comment.reactions?.[emoji] || comment.reactionStats?.[backendKey] || 0;
              const isActive = userReaction === emoji;

              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleCommentReaction(commentId, emoji)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-0.5 px-2 py-1 rounded-lg ${
                    isActive ? 'bg-[#6b5643]/20 border border-[#6b5643]/40' : 'bg-white/40'
                  }`}
                >
                  <Text style={{ fontSize: 14 }}>{emoji}</Text>
                  {reactionCount > 0 && (
                    <Text className={`text-xs font-semibold ${
                      isActive ? 'text-[#4a3728]' : 'text-[#4a3728]/50'
                    }`}>
                      {reactionCount}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              className="ml-2"
              onPress={() => handleReply(commentId)}
              activeOpacity={0.7}
            >
              <Text className="text-brand-dark/60 text-xs font-semibold">Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <View className="ml-3 mt-1 gap-2">
              {comment.replies.map((reply: any) => (
                <ReplyItem
                  key={reply.id || reply._id || String(Math.random())}
                  reply={reply}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  profileImage={profileImage}
                  onClose={onClose}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CommentItem;