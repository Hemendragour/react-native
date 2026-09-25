import { View, Text, Image, TouchableOpacity } from 'react-native';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ConnectionService } from '../../../services/connection.service';
import AuthService from '../../../services/auth.service';
import { FeedService } from '../../../services/feed.service';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DotsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#4a3728">
    <Path d="M12 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostHeaderProps {
  post: any;
  index: number;
  openMenuIndex: number | null;
  togglePostMenu: (index: number) => void;
  handlePostAction: (action: string, index: number) => void;
  currentUserId?: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  index,
  openMenuIndex,
  togglePostMenu,
  handlePostAction,
  currentUserId,
}: PostHeaderProps) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [imgError, setImgError] = React.useState(false);

  if (!post) return null;

  const currentUserObj = AuthService.getCurrentUser() as any;
  const currentAuthUserId = currentUserObj?.userId || currentUserObj?.id || currentUserObj?._id || currentUserId;

  const targetUserId =
    (post.userId && post.userId !== currentAuthUserId ? post.userId : null) ||
    (post.authorId && post.authorId !== currentAuthUserId ? post.authorId : null) ||
    (post.creatorId && post.creatorId !== currentAuthUserId ? post.creatorId : null) ||
    (post.ownerId && post.ownerId !== currentAuthUserId ? post.ownerId : null) ||
    (typeof post.author === 'object' && post.author?.userId !== currentAuthUserId ? post.author?.userId || post.author?._id || post.author?.id : null) ||
    (typeof post.user === 'object' && post.user?.userId !== currentAuthUserId ? post.user?.userId || post.user?._id || post.user?.id : null) ||
    post.userId ||
    post.authorId;

  const [localPending, setLocalPending] = React.useState(
    targetUserId ? ConnectionService.isPending(targetUserId) : false
  );
  
  const [localWithdrawn, setLocalWithdrawn] = React.useState(
    targetUserId ? ConnectionService.isWithdrawn(targetUserId) : false
  );

  const [localConnected, setLocalConnected] = React.useState(
    targetUserId ? ConnectionService.isConnected(targetUserId) : false
  );

  const [localFollowing, setLocalFollowing] = React.useState(
    targetUserId ? ConnectionService.isFollowing(targetUserId) : false
  );

  React.useEffect(() => {
    if (!targetUserId) return;

    const updateStates = () => {
      setLocalPending(ConnectionService.isPending(targetUserId));
      setLocalWithdrawn(ConnectionService.isWithdrawn(targetUserId));
      setLocalConnected(ConnectionService.isConnected(targetUserId));
      setLocalFollowing(ConnectionService.isFollowing(targetUserId));
    };

    updateStates();

    const unsubscribe = ConnectionService.subscribe(updateStates);

    return () => {
      unsubscribe();
    };
  }, [targetUserId, isFocused]);

  const navigateToProfile = () => {
    if (targetUserId) {
      navigation.navigate('Profile', { userId: targetUserId });
    }
  };

  const isOwner = Boolean(
    currentAuthUserId &&
    (currentAuthUserId === targetUserId ||
     currentAuthUserId === post.userId ||
     currentAuthUserId === post.authorId ||
     currentAuthUserId === post.currentUserId ||
     post.isOwnPost)
  );

  const postConnStatus = post.connectionStatus || post.authorConnectionStatus;
  const isConnected =
    localConnected ||
    postConnStatus === 'connected' ||
    postConnStatus === 'accepted' ||
    postConnStatus === 'active';

  const isPending =
    localPending ||
    postConnStatus === 'pending' ||
    postConnStatus === 'pending_sent';

  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    if (isConnecting || isOwner || isConnected || isPending || !targetUserId) return;
    setIsConnecting(true);
    setLocalPending(true);
    ConnectionService.addPending(targetUserId);

    try {
      await ConnectionService.sendRequest(targetUserId);
    } catch (err: any) {
      console.log('Failed to send connection request', err);
      const isAlreadyExists =
        err?.message?.includes('already exists') ||
        err?.response?.status === 409 ||
        err?.response?.data?.message?.includes('already exists');

      if (isAlreadyExists) {
        ConnectionService.addPending(targetUserId);
        setLocalPending(true);
      } else {
        ConnectionService.removePending(targetUserId);
        setLocalPending(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const renderConnectButton = () => {
    if (isOwner || isConnected || isPending || postConnStatus === 'self' || !targetUserId) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={handleConnect}
        disabled={isConnecting}
        className="px-2.5 py-1 rounded-full border border-[#4a3728] flex-row items-center gap-1"
        activeOpacity={0.7}
      >
        <Text className="text-xs font-semibold text-[#4a3728]">
          {isConnecting ? '...' : '+ Connect'}
        </Text>
      </TouchableOpacity>
    );
  };

  const MOOD_EMOJI_MAP: Record<string, string> = {
    happy: '😊',
    excited: '🤩',
    grateful: '🙏',
    celebrating: '🎉',
    proud: '🏆',
    inspired: '💡',
    thoughtful: '🤔',
    motivated: '💪',
    curious: '🧐',
    creative: '🎨',
    focused: '🎯',
    accomplished: '✨',
    reflective: '💭',
    optimistic: '☀️',
    blessed: '😇',
    energized: '⚡',
    chill: '☕',
  };

  const getDegreeLabel = (
    connectionDegree: number | null | undefined,
    status: string | undefined,
    owner: boolean
  ): string | null => {
    if (owner || status === 'self') return null;
    if (connectionDegree === 1 || status === 'connected' || status === 'accepted') return '1st';
    if (connectionDegree === 2) return '2nd';
    if (connectionDegree === 3) return '3rd';
    return '3rd+';
  };

  const degreeText =
    post.degreeLabel !== undefined && post.degreeLabel !== null && post.degreeLabel !== ''
      ? post.degreeLabel
      : getDegreeLabel(post.connectionDegree, postConnStatus, isOwner);

  const rawAvatar =
    (typeof post.avatar === 'string' && post.avatar) ||
    (typeof post.authorAvatar === 'string' && post.authorAvatar) ||
    (typeof post.author?.profileImage === 'string' && post.author.profileImage) ||
    (typeof post.author?.avatar === 'string' && post.author.avatar) ||
    (typeof post.user?.profileImage === 'string' && post.user.profileImage) ||
    (typeof post.user?.avatar === 'string' && post.user.avatar) ||
    (typeof post.profileImage === 'string' && post.profileImage) ||
    (typeof post.profilePhotoUrl === 'string' && post.profilePhotoUrl) ||
    (targetUserId ? FeedService.getUserFromCache(targetUserId)?.avatar : null) ||
    (isOwner ? (currentUserObj?.profileImage || currentUserObj?.avatar || FeedService.getUserFromCache(currentAuthUserId)?.avatar) : null);

  const authorDisplayName =
    (typeof post.user === 'string' && post.user !== 'Unknown User' && post.user !== 'Throne8 User' ? post.user : '') ||
    (typeof post.authorName === 'string' && post.authorName !== 'Unknown User' && post.authorName !== 'Throne8 User' ? post.authorName : '') ||
    (post.firstName || post.lastName ? `${post.firstName || ''} ${post.lastName || ''}`.trim() : '') ||
    (isOwner && currentUserObj?.firstName ? `${currentUserObj.firstName} ${currentUserObj.lastName || ''}`.trim() : '') ||
    post.user ||
    post.authorName ||
    'Throne8 User';

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorDisplayName)}&background=e0d8cf&color=4a3728&size=128`;
  const finalAvatar = !imgError && rawAvatar && !rawAvatar.includes('pravatar.cc') ? rawAvatar : fallbackAvatar;

  return (
    <View className="flex-row items-center justify-between mb-3">
      {/* Avatar + name + role + time */}
      <View className="flex-row items-center gap-3 flex-1">
        <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
          <Image
            source={{ uri: finalAvatar }}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-2xl border-2 border-[#6b5643]"
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 flex-wrap">
            <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.8}>
              <Text
                className="text-[#4a3728] text-sm font-bold"
                numberOfLines={1}
              >
                {authorDisplayName}
              </Text>
            </TouchableOpacity>

            {/* Mood label — LinkedIn/Website style "is feeling 😊 happy" */}
            {post.mood && MOOD_EMOJI_MAP[post.mood] && (
              <Text className="text-xs text-[#4a3728]/70 font-normal">
                is feeling {MOOD_EMOJI_MAP[post.mood]} {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
              </Text>
            )}

            {/* Username handle */}
            {(post.username || post.userName) ? (
              <Text className="text-xs text-[#4a3728]/60 font-medium">
                @{post.username || post.userName}
              </Text>
            ) : null}

            {/* Degree badge */}
            {degreeText && !isOwner && (
              <Text className="text-xs text-[#4a3728]/50 font-medium">
                · {degreeText}
              </Text>
            )}

            {/* Single Connect button */}
            {renderConnectButton()}
          </View>

          {/* Role / Headline */}
          {Boolean(post.role || post.authorHeadline) && (
            <Text
              className="text-xs font-semibold mt-0.5"
              style={{ color: '#6b5643' }}
              numberOfLines={1}
            >
              {post.role || post.authorHeadline}
            </Text>
          )}

          {/* Time & Pinned */}
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-[#6b5643] text-[11px]">
              {post.time || post.timeAgo || ''}
            </Text>
            {post.isPinned && (
              <Text className="text-[11px] text-[#8b6914] font-bold">
                📌 Pinned
              </Text>
            )}
          </View>
        </View>
      </View>


      {/* 3-dot menu */}
      <View className="relative">
        <TouchableOpacity className="p-2 rounded-xl"
          onPress={() => togglePostMenu(index)}
          activeOpacity={0.7}>
            <DotsIcon />
          </TouchableOpacity>

          {/* Inline dropdown */}
          {openMenuIndex==index &&(
            <View className="absolute right-0 top-8 w-48 bg-[#fdfbf9] rounded-2xl border border-[#e0d8cf] shadow-lg z-50 overflow-hidden">
              {isOwner?(
                <>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-[#e0d8cf]/40"
                  onPress={() => handlePostAction('edit', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">✏️ Edit post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-[#e0d8cf]/40"
                  onPress={() => handlePostAction('pin', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">
                    📌 {post.isPinned ? 'Unpin post' : 'Pin post'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => handlePostAction('delete', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-600 text-sm font-medium">🗑️ Delete post</Text>
                </TouchableOpacity>
                </>
              ):(
                <>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-[#e0d8cf]/40"
                  onPress={() => handlePostAction('save', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">
                    {post.isSaved ? '🔖 Saved' : '📑 Save post'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-[#e0d8cf]/40"
                  onPress={() => handlePostAction('mute', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-sm font-medium">
                    {post.isMuted ? '🔔 Unmute thread' : '🔕 Mute thread'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-[#e0d8cf]/40"
                  onPress={() => handlePostAction('report', index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-red-600 text-sm font-medium">🚩 Report post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2.5 bg-[#4a3728]/5"
                  onPress={() => { togglePostMenu(index); }}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#4a3728] text-xs text-center">Cancel</Text>
                </TouchableOpacity>
                </>
              )}
            </View>
          )}
      </View>
    </View>
  );
};

export default PostHeader;
