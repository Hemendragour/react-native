// features/profile/components/ActivitySection.tsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  Modal, Pressable, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CreatePostModal from './/modals/CreatePostModal';
import UpdatePostModal from './modals/UpdatePostModal';
import ShowAllActivityModal from './/modals/ShowAllActivityModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivitySectionProps {
  posts?: any[];
  currentUserId?: string;
  onPostCreated?: () => void;
  followers?: number;
  isLoading?: boolean;
  profileImage?: string;
  fullName?: string;
  headline?: string;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Posts', 'Comments', 'Videos', 'Images'];

// ─── Dummy Data (matches screenshot 2) ───────────────────────────────────────

const DUMMY_POSTS = [
  {
    postId: '1',
    entryId: '1',
    title: 'CCHS.School...',
    content: "Even the sound of the sirens on the news can send a chill down your spine.....More",
    authorName: 'CCHS.School',
    authorHeadline: 'We Don\'t teach.We Educated',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    timeAgo: '4h ago',
    likesCount: 24,
    commentsCount: 5,
    images: [{ cloudinarySecureUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500' }],
    videos: [],
    documents: [],
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const HeartIcon = ({ filled = false }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'}>
    <Path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke={filled ? '#ef4444' : '#4a3728'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CommentIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DotsIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#4a3728">
    <Path d="M12 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const EmptyIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke="rgba(74,55,40,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ label }: { label: string }) => (
  <View className="py-14 items-center gap-3">
    <View className="w-16 h-16 bg-brand-dark/10 rounded-2xl items-center justify-center">
      <EmptyIcon />
    </View>
    <Text className="text-[#4a3728] text-sm font-medium text-center">{label}</Text>
  </View>
);

// ─── Post Card (matches screenshot 2 exactly) ─────────────────────────────────

const PostCard = ({
  post,
  onEditPress,
}: {
  post: typeof DUMMY_POSTS[0];
  onEditPress: (post: any) => void;
}) => {
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(post.likesCount);
  const [menuOpen, setMenuOpen]     = useState(false);

  return (
    <View className="overflow-hidden mb-3 bg-white/40 rounded-2xl p-4  border-2 border-dashed border-[#d4c4b5]">

      {/* Post header */}
      <View className="flex-row items-center p-3 gap-3">
        <Image
          source={{ uri: post.authorAvatar }}
          className="w-10 h-10 rounded-full border border-brand-border"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-[#4a3728] text-sm font-bold" numberOfLines={1}>{post.authorName}</Text>
          <Text className="text-[#6b4e3d] text-xs font-medium" numberOfLines={1}>{post.authorHeadline}</Text>
          <Text className="text-[#6b4e3d] text-xs font-medium">{post.timeAgo}</Text>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => setMenuOpen(!menuOpen)}
          activeOpacity={0.7}
        >
          <DotsIcon />
        </TouchableOpacity>
      </View>

      {/* Inline menu */}
      {menuOpen && (
        <View className="mx-3 mb-2 bg-brand-light border border-[#4a3728] rounded-xl overflow-hidden ">
          <TouchableOpacity
            className="px-4 py-3 border-b border-brand-border/30"
            onPress={() => { onEditPress(post); setMenuOpen(false); }}
            activeOpacity={0.7}
          >
            <Text className="text-[#4a3728] text-sm font-medium">Edit post</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-4 py-3" activeOpacity={0.7}>
            <Text className="text-red-600 text-sm font-medium">Delete post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Post content */}
      <View className="px-3 py-2">
        <Text className="text-[#8b6f47] text-sm leading-5" numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {/* Post image */}
      {post.images && post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0].cloudinarySecureUrl }}
          className="w-full h-48 border-2 border-[#4a3728] "
          resizeMode="cover"
        />
      )}

      {/* Like + Comment actions */}
      <View className="flex-row items-center gap-5 px-4 py-3 border-t border-brand-border/30">
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
          activeOpacity={0.7}
        >
          <HeartIcon filled={liked} />
          <Text className={`text-sm font-semibold ${liked ? 'text-red-500' : 'text-brand-dark/70'}`}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1.5" activeOpacity={0.7}>
          <CommentIcon />
          <Text className="text-brand-dark/70 text-sm font-semibold">{post.commentsCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ActivitySection: React.FC<ActivitySectionProps> = ({
  posts = DUMMY_POSTS,
  currentUserId,
  onPostCreated,
  isLoading = false,
  profileImage,
  fullName,
  headline,
}) => {
  const [activeTab, setActiveTab]                 = useState('Posts');
  const [showCreateModal, setShowCreateModal]     = useState(false);
  const [showAllModal, setShowAllModal]           = useState(false);
  const [editingPost, setEditingPost]             = useState<any>(null);

  const displayPosts = posts.length > 0 ? posts : DUMMY_POSTS;
  const visiblePosts = displayPosts.slice(0, 2);
  const hasMore      = displayPosts.length > 2;

  return (
    <View className="mx-3 mb-6">
      <View className="bg-[#f6ede8]/80 rounded-3xl p-4 border border-[#e0d8cf]/50">

        {/* ── Header ───────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#4a3728] text-xl font-bold">Activity</Text>
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-brand-dark px-3 py-2 rounded-xl"
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <PlusIcon />
            <Text className="text-[#4a3728] text-xs font-semibold">Create post</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <View className="flex-row bg-brand-border/30 rounded-full p-1 mb-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-full items-center ${activeTab === tab ? 'bg-brand-dark' : ''}`}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text className={` font-semibold ${activeTab === tab ? 'text-[#4a3728] font-extrabold text-sm' : 'text-[#4a3728] text-xs'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ──────────────────────────────────────────────── */}
        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#4a3728" />
            <Text className="text-brand-medium text-sm mt-2">Loading activity...</Text>
          </View>
        ) : (
          <>
            {/* Posts tab */}
            {activeTab === 'Posts' && (
              displayPosts.length === 0 ? (
                <EmptyState label="No posts yet. Share something with your network!" />
              ) : (
                <>
                  {visiblePosts.map((post) => (
                    <PostCard
                      key={post.postId || post.entryId}
                      post={post}
                      onEditPress={(p) => setEditingPost(p)}
                    />
                  ))}
                  {hasMore && (
                    <TouchableOpacity
                      className="py-3 items-center border border-brand-border rounded-2xl mt-1"
                      onPress={() => setShowAllModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-brand-dark text-sm font-semibold">
                        Show All Posts ({displayPosts.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )
            )}

            {activeTab === 'Comments' && (
              <EmptyState label="Comments you've made will appear here." />
            )}

            {activeTab === 'Videos' && (
              <EmptyState label="No videos uploaded yet." />
            )}

            {activeTab === 'Images' && (
              <EmptyState label="No images uploaded yet." />
            )}
          </>
        )}
      </View>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async () => {
          setShowCreateModal(false);
          onPostCreated?.();
        }}
      />

      <UpdatePostModal
        postId={editingPost?.postId || editingPost?.entryId || ''}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        currentTitle={editingPost?.title || ''}
        onUpdate={(id, newTitle) => {
          setEditingPost(null);
        }}
      />

      <ShowAllActivityModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        activeSection={activeTab}
        posts={displayPosts}
        postLikes={{}}
        onLikeToggle={() => {}}
      />
    </View>
  );
};

export default ActivitySection;