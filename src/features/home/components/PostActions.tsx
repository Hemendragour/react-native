// features/home/components/feed/PostActions.tsx

import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ReactionType } from '../types/feed.types';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CommentIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RepostIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Like', color: '#0a66c2' },
  celebrate: { emoji: '👏', label: 'Celebrate', color: '#378fe9' },
  support: { emoji: '🤝', label: 'Support', color: '#13898f' },
  love: { emoji: '❤️', label: 'Love', color: '#e0245e' },
  insightful: { emoji: '💡', label: 'Insightful', color: '#f59e0b' },
  funny: { emoji: '😂', label: 'Funny', color: '#f97316' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostActionsProps {
  post: any;
  index: number;
  likedPosts: Record<string, boolean>;
  userReactions?: Record<string, ReactionType | null>;
  handleLike: (postKey: string) => void;
  handleReact?: (postKey: string, type: ReactionType) => void;
  openRepostIndex: number | null;
  toggleRepostMenu: (index: number) => void;
  toggleComments: (postKey: string) => void;
  openCommentsIndex: string | null;
  onOpenWithPerspectiveModal?: (post: any) => void;
  handleRepostInstant?: (index: number) => void;
  handleUndoRepost?: (index: number) => void;
  onOpenReactors?: (postKey: string) => void;
  onRecordSend?: (postKey: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PostActions: React.FC<PostActionsProps> = ({
  post, index, likedPosts, userReactions, handleLike, handleReact,
  openRepostIndex, toggleRepostMenu,
  toggleComments, openCommentsIndex,
  onOpenWithPerspectiveModal, handleRepostInstant, handleUndoRepost,
  onOpenReactors, onRecordSend,
}: PostActionsProps) => {
  const postKey = post.entryId || post.postId;
  const isLiked = likedPosts[postKey] ?? post.isLikedByCurrentUser ?? false;
  const currentReaction: ReactionType | null =
    userReactions?.[postKey] ?? post.currentUserReaction ?? (isLiked ? 'like' : null);

  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const likeCount = (post.likesCount || post.likes || 0)
    + (isLiked && !post.isLikedByCurrentUser ? 1 : 0)
    + (!isLiked && post.isLikedByCurrentUser ? -1 : 0);

  const isCommentsOpen = openCommentsIndex === postKey;
  const isRepostMenuOpen = openRepostIndex === index;

  const activeReactionInfo = currentReaction ? REACTION_CONFIG[currentReaction] : null;

  const handleLikePress = () => {
    if (showReactionPicker) {
      setShowReactionPicker(false);
      return;
    }
    handleLike(postKey);
  };

  const handleSelectReaction = (type: ReactionType) => {
    setShowReactionPicker(false);
    if (handleReact) {
      handleReact(postKey, type);
    } else {
      handleLike(postKey);
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `Check out this post on Throne8: ${post.title || post.content || 'Great content!'}`,
        title: 'Throne8 Post',
      });
      onRecordSend?.(postKey);
    } catch (err) {
      console.log('Error sharing post:', err);
    }
  };

  return (
    <View className="relative">
      {/* ── Reaction Picker Bar (Popup) ── */}
      {showReactionPicker && (
        <View className="absolute -top-12 left-1 bg-[#fdfbf9] border border-[#e0d8cf] flex-row items-center gap-2 px-3 py-1.5 rounded-full shadow-lg z-50">
          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
            const item = REACTION_CONFIG[type];
            return (
              <TouchableOpacity
                key={type}
                onPress={() => handleSelectReaction(type)}
                className="p-1 active:scale-125"
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Action row */}
      <View className="flex-row items-center justify-between pt-3 border-t border-[#e0d8cf]/50">

        {/* Like / Reaction Button */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-2 py-1.5"
            onPress={handleLikePress}
            onLongPress={() => setShowReactionPicker(true)}
            delayLongPress={250}
            activeOpacity={0.7}
          >
            {activeReactionInfo ? (
              <Text style={{ fontSize: 16 }}>{activeReactionInfo.emoji}</Text>
            ) : (
              <Text style={{ fontSize: 16 }}>👍</Text>
            )}
            <Text
              className="text-xs font-bold"
              style={{ color: activeReactionInfo ? activeReactionInfo.color : '#6b4e3d' }}
            >
              {activeReactionInfo ? activeReactionInfo.label : 'Like'}
            </Text>
          </TouchableOpacity>

          {/* Reactor Count (Opens Reactors Modal) */}
          {likeCount > 0 && (
            <TouchableOpacity
              onPress={() => onOpenReactors?.(postKey)}
              className="pl-0.5 pr-2 py-1.5"
              activeOpacity={0.7}
            >
              <Text className="text-xs text-[#6b5643] font-semibold">
                ({likeCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comment */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 py-1.5"
          onPress={() => toggleComments(postKey)}
          activeOpacity={0.7}
        >
          <CommentIcon />
          <Text className="text-[#6b4e3d] text-xs font-semibold">
            {post.commentsCount || post.comments || 0}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 py-1.5"
          onPress={handleSharePress}
          activeOpacity={0.7}
        >
          <ShareIcon />
          <Text className="text-[#6b4e3d] text-xs font-semibold">
            {post.sendsCount || post.shares || 0}
          </Text>
        </TouchableOpacity>

        {/* Repost button + dropdown */}
        <View>
          {post.currentUserHasReposted ? (
            /* Already reposted — show Undo Repost */
            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-2 py-1.5"
              onPress={() => handleUndoRepost?.(index)}
              activeOpacity={0.7}
            >
              <RepostIcon />
              <Text className="text-green-600 text-xs font-bold">Reposted ✓</Text>
            </TouchableOpacity>
          ) : (
            /* Not yet reposted — show dropdown */
            <>
              <TouchableOpacity
                className="flex-row items-center gap-1.5 px-2 py-1.5"
                onPress={() => toggleRepostMenu(index)}
                activeOpacity={0.7}
              >
                <RepostIcon />
                <Text className="text-[#6b4e3d] text-xs font-semibold">
                  {post.repostsCount || 'Repost'}
                </Text>
              </TouchableOpacity>

              {/* Repost dropdown */}
              {isRepostMenuOpen && (
                <View className="absolute bottom-10 right-0 w-48 bg-[#fdfbf9] rounded-2xl border border-[#e0d8cf] shadow-lg z-50 overflow-hidden">
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-[#e0d8cf]/40"
                    onPress={() => {
                      handleRepostInstant?.(index);
                      toggleRepostMenu(index);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#4a3728] text-xs font-medium">🔁 Repost instantly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-3"
                    onPress={() => {
                      onOpenWithPerspectiveModal?.(post);
                      toggleRepostMenu(index);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#4a3728] text-xs font-medium">💭 Repost with thoughts</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostActions;