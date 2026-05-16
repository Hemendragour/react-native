// features/home/components/feed/PostActions.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'}>
    <Path
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      stroke={filled ? '#ef4444' : '#4a3728'}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const CommentIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RepostIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostActionsProps {
  post: any;
  index: number;
  likedPosts: Record<string, boolean>;
  handleLike: (postKey: string) => void;
  openRepostIndex: number | null;
  toggleRepostMenu: (index: number) => void;
  toggleComments: (postKey: string) => void;
  openCommentsIndex: string | null;
  onOpenWithPerspectiveModal?: (post: any) => void;
  handleRepostInstant?: (index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PostActions: React.FC<PostActionsProps> = ({
  post, index, likedPosts, handleLike,
  openRepostIndex, toggleRepostMenu,
  toggleComments, openCommentsIndex,
  onOpenWithPerspectiveModal, handleRepostInstant,
}) => {
  const postKey  = post.entryId || post.postId;
  const isLiked  = likedPosts[postKey] ?? post.isLikedByCurrentUser ?? false;
  const likeCount = (post.likesCount || post.likes || 0)
    + (isLiked && !post.isLikedByCurrentUser ? 1 : 0)
    + (!isLiked && post.isLikedByCurrentUser ? -1 : 0);

  const isCommentsOpen  = openCommentsIndex === postKey;
  const isRepostMenuOpen = openRepostIndex === index;

  return (
    <View>
      {/* Action row */}
      <View className="flex-row items-center justify-between pt-3 border-t border-brand-dark/10">

        {/* Like */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 py-1.5"
          onPress={() => handleLike(postKey)}
          activeOpacity={0.7}
        >
          <HeartIcon filled={isLiked} />
          <Text className={`text-sm font-semibold ${isLiked ? 'text-red-500' : 'text-[#6b4e3d]'}`}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 py-1.5"
          onPress={() => toggleComments(postKey)}
          activeOpacity={0.7}
        >
          <CommentIcon />
          <Text className="text-[#6b4e3d] text-sm font-semibold">
            {post.commentsCount || post.comments || 0}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-2 py-1.5"
          activeOpacity={0.7}
        >
          <ShareIcon />
          <Text className="text-[#6b4e3d] text-sm font-semibold">
            {post.shares || 0}
          </Text>
        </TouchableOpacity>

        {/* Repost button + dropdown */}
        <View>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-2 py-1.5"
            onPress={() => toggleRepostMenu(index)}
            activeOpacity={0.7}
          >
            <RepostIcon />
            <Text className="text-[#6b4e3d] text-sm font-semibold">Repost</Text>
          </TouchableOpacity>

          {/* Repost dropdown */}
          {isRepostMenuOpen && (
            <View className="absolute bottom-10 right-0 w-52 bg-white/40 rounded-2xl border border-brand-border   overflow-hidden">
              <TouchableOpacity
                className="px-4 py-3 border-b border-brand-border/30"
                onPress={() => {
                  handleRepostInstant?.(index);
                  toggleRepostMenu(index);
                }}
                activeOpacity={0.7}
              >
                <Text className="text-[#6b4e3d] text-sm font-medium">Repost instantly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => {
                  onOpenWithPerspectiveModal?.(post);
                  toggleRepostMenu(index);
                }}
                activeOpacity={0.7}
              >
                <Text className="text-[#6b4e3d] text-sm font-medium">Repost with thoughts</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostActions;