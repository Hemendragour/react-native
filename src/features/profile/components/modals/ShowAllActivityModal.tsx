import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  Image, Pressable, Platform, StatusBar, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';
import ImageViewerModal from '../../../../shared/components/ImageViewerModal';
import { PostCard } from '../ProfileActivity';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShowAllActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  posts: any[];
  postLikes: { [key: string]: { count: number; isLiked: boolean } };
  onLikeToggle?: (postId: string) => void;
  onEditPress?: (post: any) => void;
  onDeletePress?: (postId: string) => void;
  onCommentAdded?: () => void;
  currentUser?: { id?: string; name?: string; avatar?: string; };
  allComments?: { post: any; comment: any }[];
  allDocuments?: { post: any; doc: any; docIdx?: number }[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const FileIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
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
    <View className="w-16 h-16 bg-[#4a3728]/10 rounded-2xl items-center justify-center">
      <EmptyIcon />
    </View>
    <Text className="text-[#4a3728]/50 text-sm font-medium text-center">{label}</Text>
  </View>
);

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

// ─── Main Modal ───────────────────────────────────────────────────────────────
const ShowAllActivityModal = ({
  isOpen, onClose, activeSection, posts, postLikes, onLikeToggle, onEditPress, onDeletePress, onCommentAdded, currentUser, allComments, allDocuments,
}: ShowAllActivityModalProps) => {
  const [localLikes, setLocalLikes] = useState<{ [key: string]: { count: number; isLiked: boolean } }>({});
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

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
    onLikeToggle?.(postId);
  };

  // Extract all images, videos, comments, and documents from posts
  const allImages   = posts.flatMap((p: any) => (p.images   || []).map((img: any)  => ({ post: p, img })));
  const allVideos   = posts.flatMap((p: any) => (p.videos   || []).map((vid: any)  => ({ post: p, video: vid })));
  const displayDocs = allDocuments || posts.flatMap((p: any) => (p.documents || []).map((doc: any, docIdx: number) => ({ post: p, doc, docIdx })));
  
  // NEW CODE: Uses allComments prop if provided, else falls back to extraction
  const displayComments = allComments || posts.flatMap((p: any) => (p.comments || []).map((c: any) => ({ post: p, comment: c })));

  const getMediaUrl = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.cloudinarySecureUrl || item.cloudinaryUrl || item.url || item.uri || item.secure_url || item.path || '';
  };

  return (
    <Modal visible={isOpen} transparent={false} animationType="slide" onRequestClose={onClose} statusBarTranslucent={true}>
      <StatusBar backgroundColor="#f6ede8" barStyle="dark-content" translucent={true} />
      <View style={{ flex: 1, backgroundColor: '#f6ede8', paddingTop: STATUSBAR_HEIGHT }}>
        <View className="flex-1">

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-[#f6ede8]">
            <Text className="text-[#4a3728] text-2xl font-bold">All {activeSection}</Text>
            <TouchableOpacity className="p-2 rounded-full bg-[#4a3728]/10" onPress={onClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>

            {/* Posts */}
            {activeSection === 'Posts' && (
              posts.length === 0 ? (
                <EmptyState label="No posts yet." />
              ) : (
                posts.map((post: any) => {
                  const id = post.postId || post.entryId;
                  return (
                    <View key={id} className="mb-3">
                      {/* Repost banner — LinkedIn style */}
                      {post.feedItemType === 'repost' && (
                        <View className="flex-row items-center gap-1.5 mb-2 px-1">
                          <Text className="text-[#6b4e3d] text-xs font-bold">🔄 You reposted this</Text>
                        </View>
                      )}
                      {post.thoughtText ? (
                        <Text className="text-[#4a3728] text-sm mb-2 px-1">{post.thoughtText}</Text>
                      ) : null}
                      <PostCard
                        post={post}
                        onEditPress={onEditPress || (() => {})}
                        onDeletePress={post.feedItemType === 'repost' ? undefined : onDeletePress}
                        onCommentAdded={onCommentAdded}
                        currentUser={currentUser}
                        onImageClick={(url) => setFullScreenImage(url)}
                        isOwnProfile={post.feedItemType !== 'repost'}
                      />
                    </View>
                  );
                })
              )
            )}

            {/* Comments */}
            {activeSection === 'Comments' && (
              displayComments.length === 0 ? (
                <EmptyState label="Comments you've made will appear here." />
              ) : (
                displayComments.map(({ post, comment }: any, idx: number) => {
                  const isCurrentUser = Boolean(currentUser?.id && (comment.userId === currentUser.id || comment.user === currentUser.id));
                  const name = (isCurrentUser && currentUser?.name) ? currentUser.name : (comment.user?.username || comment.author?.name || 'User');
                  const rawAvatar = (isCurrentUser && currentUser?.avatar) ? currentUser.avatar : (comment.user?.profileImage || comment.author?.profileImage);
                  const avatar = (rawAvatar && typeof rawAvatar === 'string' && !rawAvatar.includes('pravatar.cc') && !rawAvatar.includes('unsplash.com'))
                    ? rawAvatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0d8cf&color=4a3728&size=128`;
                  
                  return (
                    <View key={idx} className="mb-3 bg-white/60 p-4 rounded-2xl border border-[#d4c4b5]/40 shadow-sm">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-3">
                          <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full border border-brand-border" />
                          <Text className="text-[#4a3728] font-bold text-sm">{name}</Text>
                        </View>
                        <Text className="text-[#4a3728]/50 text-xs text-right flex-1 ml-2" numberOfLines={1}>
                          on {post.title || 'a post'}
                        </Text>
                      </View>
                      <Text className="text-[#4a3728] text-sm leading-5">
                        {comment.content}
                      </Text>
                    </View>
                  );
                })
              )
            )}

            {/* Videos */}
            {activeSection === 'Videos' && (
              allVideos.length === 0 ? (
                <EmptyState label="No videos uploaded yet." />
              ) : (
                allVideos.map(({ post, video }: any, idx: number) => {
                  const mediaUrl = getMediaUrl(video);
                  return (
                    <View key={idx} className="bg-white/60 rounded-2xl border border-[#d4c4b5]/40 p-4 mb-4 shadow-sm">
                      <Text className="text-[#4a3728] text-base font-bold mb-3">{post.title || 'Untitled Video'}</Text>
                      <View className="w-full h-48 bg-black rounded-xl overflow-hidden border border-brand-border">
                        <Video
                          source={{ uri: mediaUrl }}
                          style={{ width: '100%', height: '100%' }}
                          controls={true}
                          resizeMode="cover"
                          paused={true}
                        />
                      </View>
                    </View>
                  );
                })
              )
            )}

            {/* Images */}
            {activeSection === 'Images' && (
              allImages.length === 0 ? (
                <EmptyState label="No images uploaded yet." />
              ) : (
                <View className="flex-row flex-wrap gap-3">
                  {allImages.map(({ post, img }: any, idx: number) => {
                    const mediaUrl = getMediaUrl(img);
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        className="rounded-2xl overflow-hidden border border-[#d4c4b5]/40 shadow-sm" 
                        style={{ width: '48%', marginBottom: 12 }}
                        onPress={() => setFullScreenImage(mediaUrl)}
                        activeOpacity={0.9}
                      >
                        <Image
                          source={{ uri: mediaUrl }}
                          className="w-full h-36"
                          resizeMode="cover"
                        />
                        <View className="p-3 bg-white/80">
                          <Text className="text-[#4a3728] text-sm font-bold" numberOfLines={1}>{post.title || 'Image'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            )}

            {/* Documents */}
            {activeSection === 'Documents' && (
              displayDocs.length === 0 ? (
                <EmptyState label="No documents uploaded yet." />
              ) : (
                displayDocs.map(({ post, doc, docIdx }: any, idx: number) => {
                  const mediaUrl = getMediaUrl(doc);
                  const docName = doc.name || doc.fileName || doc.title || (typeof doc === 'string' ? doc.split('/').pop() : `Document ${(docIdx ?? idx) + 1}`);
                  const extension = docName.split('.').pop()?.toUpperCase() || 'PDF';

                  return (
                    <TouchableOpacity
                      key={idx}
                      className="bg-white/70 rounded-2xl border border-[#d4c4b5]/40 p-4 mb-3 flex-row items-center gap-3.5 shadow-sm"
                      activeOpacity={0.7}
                      onPress={() => {
                        if (mediaUrl) Linking.openURL(mediaUrl);
                      }}
                    >
                      <View className="w-12 h-12 bg-[#4a3728]/10 rounded-xl items-center justify-center">
                        <FileIcon />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-[#4a3728] text-sm font-bold flex-1" numberOfLines={1}>
                            {docName}
                          </Text>
                          <View className="bg-[#4a3728]/10 px-2.5 py-0.5 rounded-md">
                            <Text className="text-[#4a3728] text-[11px] font-bold">{extension}</Text>
                          </View>
                        </View>
                        <Text className="text-[#4a3728]/60 text-xs" numberOfLines={1}>
                          From post: {post.title || 'Untitled Post'}
                        </Text>
                        <Text className="text-[#8b6f47] text-xs mt-1 font-semibold">
                          Tap to open & view document ↗
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )
            )}

            <View className="h-10" />
          </ScrollView>

        </View>
      </View>
      
      {/* Full Screen Image Modal */}
      <ImageViewerModal
        visible={!!fullScreenImage}
        imageUrl={fullScreenImage}
        onClose={() => setFullScreenImage(null)}
      />

    </Modal>
  );
};

export default ShowAllActivityModal;