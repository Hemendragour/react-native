// features/profile/components/ShowAllActivityModal.tsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  Image, Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowAllActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  posts: any[];
  postLikes: { [key: string]: { count: number; isLiked: boolean } };
  onLikeToggle: (postId: string) => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const HeartIcon = ({ filled = false }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'}>
    <Path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke={filled ? '#ef4444' : '#4a3728'} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CommentIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const EmptyIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="rgba(74,55,40,0.4)" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ label }: { label: string }) => (
  <View className="py-14 items-center gap-3">
    <View className="w-16 h-16 bg-brand-dark/10 rounded-2xl items-center justify-center">
      <EmptyIcon />
    </View>
    <Text className="text-brand-dark/50 text-sm font-medium text-center">{label}</Text>
  </View>
);

// ─── Post Card (full version) ─────────────────────────────────────────────────

const ModalPostCard = ({
  post, liked, likeCount, onLike,
}: {
  post: any; liked: boolean; likeCount: number; onLike: () => void;
}) => (
  <View className="bg-white/70 rounded-2xl border border-brand-border/40 overflow-hidden mb-4">

    {/* Header */}
    <View className="flex-row items-center p-3 gap-3">
      <Image
        source={{ uri: post.authorAvatar || 'https://i.pravatar.cc/150?img=12' }}
        className="w-10 h-10 rounded-full"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-brand-dark text-sm font-bold" numberOfLines={1}>{post.authorName || post.title}</Text>
        <Text className="text-brand-dark/60 text-xs" numberOfLines={1}>{post.authorHeadline || ''}</Text>
        <Text className="text-brand-dark/50 text-xs">{post.timeAgo || ''}</Text>
      </View>
    </View>

    <View className="h-px bg-brand-border/40 mx-3" />

    {/* Content */}
    <View className="px-3 py-2">
      <Text className="text-brand-dark text-sm leading-5">{post.content || post.title}</Text>
    </View>

    {/* Images */}
    {post.images && post.images.length > 0 && (
      <Image
        source={{ uri: post.images[0].cloudinarySecureUrl }}
        className="w-full h-52"
        resizeMode="cover"
      />
    )}

    {/* Actions */}
    <View className="flex-row items-center gap-5 px-4 py-3 border-t border-brand-border/30">
      <TouchableOpacity className="flex-row items-center gap-1.5" onPress={onLike} activeOpacity={0.7}>
        <HeartIcon filled={liked} />
        <Text className={`text-sm font-semibold ${liked ? 'text-red-500' : 'text-brand-dark/70'}`}>{likeCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
        <CommentIcon />
        <Text className="text-brand-dark/70 text-sm font-semibold">{post.commentsCount ?? 0}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const ShowAllActivityModal: React.FC<ShowAllActivityModalProps> = ({
  isOpen, onClose, activeSection, posts, postLikes, onLikeToggle,
}) => {
  const [localLikes, setLocalLikes] = useState<{ [key: string]: { count: number; isLiked: boolean } }>({});

  const getLikeState = (postId: string, defaultCount: number) => ({
    isLiked: localLikes[postId]?.isLiked ?? postLikes[postId]?.isLiked ?? false,
    count:   localLikes[postId]?.count   ?? postLikes[postId]?.count   ?? defaultCount,
  });

  const handleLike = (postId: string, defaultCount: number) => {
    const curr = getLikeState(postId, defaultCount);
    setLocalLikes(prev => ({
      ...prev,
      [postId]: { isLiked: !curr.isLiked, count: curr.isLiked ? curr.count - 1 : curr.count + 1 },
    }));
    onLikeToggle(postId);
  };

  // Extract all images and videos from posts
  const allImages  = posts.flatMap(p => (p.images  || []).map((img: any)  => ({ post: p, img })));
  const allVideos  = posts.flatMap(p => (p.videos  || []).map((vid: any)  => ({ post: p, video: vid })));

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-brand-light rounded-t-3xl" style={{ height: '90%' }}>

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-brand-dark rounded-t-3xl">
            <Text className="text-brand-light text-lg font-bold">All {activeSection}</Text>
            <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={onClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

            {/* Posts */}
            {activeSection === 'Posts' && (
              posts.length === 0 ? (
                <EmptyState label="No posts yet." />
              ) : (
                posts.map((post) => {
                  const id    = post.postId || post.entryId;
                  const likes = getLikeState(id, post.likesCount || 0);
                  return (
                    <ModalPostCard
                      key={id}
                      post={post}
                      liked={likes.isLiked}
                      likeCount={likes.count}
                      onLike={() => handleLike(id, post.likesCount || 0)}
                    />
                  );
                })
              )
            )}

            {/* Comments */}
            {activeSection === 'Comments' && (
              <EmptyState label="Comments you've made will appear here." />
            )}

            {/* Videos */}
            {activeSection === 'Videos' && (
              allVideos.length === 0 ? (
                <EmptyState label="No videos uploaded yet." />
              ) : (
                allVideos.map(({ post, video }, idx) => (
                  <View key={idx} className="bg-white/60 rounded-2xl border border-brand-border/40 p-3 mb-3">
                    <Text className="text-brand-dark text-sm font-bold mb-1">{post.title}</Text>
                    <Text className="text-brand-dark/60 text-xs">{video.originalName || 'Video'}</Text>
                  </View>
                ))
              )
            )}

            {/* Images */}
            {activeSection === 'Images' && (
              allImages.length === 0 ? (
                <EmptyState label="No images uploaded yet." />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {allImages.map(({ post, img }, idx) => (
                    <View key={idx} className="rounded-xl overflow-hidden" style={{ width: '48%' }}>
                      <Image
                        source={{ uri: img.cloudinarySecureUrl }}
                        className="w-full h-36"
                        resizeMode="cover"
                      />
                      <View className="p-2 bg-white/70">
                        <Text className="text-brand-dark text-xs font-medium" numberOfLines={1}>{post.title}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
            )}

            <View className="h-8" />
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

export default ShowAllActivityModal;