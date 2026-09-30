import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, TextInput, Linking, ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video'; // Replaced expo-av with react-native-video
import CreatePostModal from './modals/CreatePostModal';
import UpdatePostModal from './modals/UpdatePostModal';
import ShowAllActivityModal from './modals/ShowAllActivityModal';
import AuthService from '../../../services/auth.service';
import ImageViewerModal from '../../../shared/components/ImageViewerModal';
import VideoViewerModal from '../../../shared/components/VideoViewerModal';
import CommentsSection from '../../home/components/CommentSection';
// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivitySectionProps {
  posts?: any[];
  currentUserId?: string; // NEW
  onPostCreated?: () => void;
  followers?: number;
  isLoading?: boolean;
  profileImage?: string;
  fullName?: string;
  headline?: string;
  isOwnProfile?: boolean;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Posts', 'Comments', 'Videos', 'Images', 'Documents'];

// ─── Dummy Data (matches screenshot 2) ───────────────────────────────────────
const DUMMY_POSTS: any[] = []; // Empty or fallback

// ─── Icons ────────────────────────────────────────────────────────────────────

const FileIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

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
    <Path d="M12 5v14m-7-7h14" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: any;
  onEditPress: (post: any) => void;
  onImageClick?: (url: string) => void;
  onDeletePress?: (postId: string) => void;
  onCommentAdded?: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
  isOwnProfile?: boolean;
}

export const PostCard = ({
  post,
  onEditPress,
  onImageClick,
  onDeletePress,
  onCommentAdded,
  currentUser,
  isOwnProfile = true,
}: PostCardProps) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [videoViewerUrl, setVideoViewerUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<any>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentImage, setCommentImage] = useState<any>(null);

  const combinedText = post.title && post.content && post.title !== post.content
    ? `${post.title}\n\n${post.content}`
    : post.content || post.title || '';

  useEffect(() => {
    setLiked(post.isLiked || false);
    setLikeCount(post.likesCount || 0);
    setComments(post.comments || []);
  }, [post.postId, post.isLiked, post.likesCount, post.comments]);

  // Calculate dynamic aspect ratio for single images
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);

  const isValidImageUrl = (url: any): boolean => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    if (lower.includes('unsplash.com') || lower.includes('via.placeholder.com') || lower.includes('placeholder.com') || lower.includes('pravatar.cc')) {
      return false;
    }
    return true;
  };

  const images: string[] = [];
  if (post.image && isValidImageUrl(post.image)) {
    images.push(post.image);
  }
  if (post.images?.length) {
    post.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : (img.cloudinarySecureUrl || img.url || img.uri || img.secure_url || img.path);
      if (isValidImageUrl(url)) images.push(url);
    });
  }

  const firstImage = images[0] || null;

  useEffect(() => {
    if (firstImage) {
      Image.getSize(
        firstImage,
        (width, height) => {
          if (width && height) {
            let ratio = width / height;
            // Clamp aspect ratio to reasonable limits (min 0.75 portrait, max 1.91 landscape)
            if (ratio < 0.75) ratio = 0.75;
            if (ratio > 1.91) ratio = 1.91;
            setAspectRatio(ratio);
          }
        },
        (error) => {
          console.log('Failed to get image dimensions in profile post card:', error);
        }
      );
    }
  }, [firstImage]);

  const handleLike = async () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => newLiked ? prev + 1 : prev - 1);

    try {
      if (newLiked) {
        await AuthService.likePost(post.postId);
      } else {
        await AuthService.unlikePost(post.postId);
      }
    } catch (error) {
      console.error('Like action failed', error);
      // Revert if API call fails
      setLiked(!newLiked);
      setLikeCount((prev: number) => newLiked ? prev - 1 : prev + 1);
    }
  };

  const loadComments = async () => {
    try {
      const response = await AuthService.getCommentsByPostId(post.postId);
      setComments(response?.data?.comments || response?.comments || []);
    } catch (err) {
      console.log('Failed to fetch comments', err);
    }
  };

  const handleToggleComments = () => {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow) {
      loadComments();
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    try {
      setIsSubmittingComment(true);
      await AuthService.createComment(post.postId, commentText);
      setCommentText('');
      await loadComments(); // refresh local comments
      onCommentAdded?.(); // refresh global activity section
    } catch (err) {
      console.log('Failed to create comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <View className="overflow-hidden mb-3 bg-[#f6ede8]/80 rounded-3xl p-4 border border-[#e0d8cf]/50">

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
        {isOwnProfile && (
          <TouchableOpacity
            className="p-2"
            onPress={() => setMenuOpen(!menuOpen)}
            activeOpacity={0.7}
          >
            <DotsIcon />
          </TouchableOpacity>
        )}
      </View>

      {/* Inline menu */}
      {menuOpen && (
        <View className="mx-3 mb-2 bg-[#f6ede8] border border-[#4a3728] rounded-xl overflow-hidden">
          <TouchableOpacity
            className="px-4 py-3 border-b border-[#4a3728]/20"
            onPress={() => { onEditPress(post); setMenuOpen(false); }}
            activeOpacity={0.7}
          >
            <Text className="text-[#4a3728] text-sm font-medium">Edit post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-3"
            activeOpacity={0.7}
            onPress={() => {
              setMenuOpen(false);
              onDeletePress?.(post.postId);
            }}
          >
            <Text className="text-red-600 text-sm font-medium">Delete post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Post content */}
      {combinedText ? (
        <View className="px-3 py-2">
          <Text
            className="text-[#8b6f47] text-sm leading-5"
            numberOfLines={expanded ? undefined : 3}
          >
            {combinedText}
          </Text>
          {(combinedText.length > 120 || combinedText.split('\n').length > 3) && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)} className="mt-1">
              <Text className="text-[#6b4e3d] text-xs font-bold">
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Post image(s) */}
      {images.length === 1 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImageClick?.(images[0])}
          className="rounded-2xl overflow-hidden bg-[#e0d8cf]/30 mt-2"
        >
          <Image
            source={{ uri: images[0] }}
            style={{
              width: '100%',
              aspectRatio: aspectRatio,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {images.length > 1 && (
        <View className="flex-row flex-wrap gap-1 rounded-2xl overflow-hidden mt-2">
          {images.slice(0, 4).map((uri, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.9}
              onPress={() => onImageClick?.(uri)}
              style={{
                width: '49%',
                aspectRatio: 1,
              }}
              className="overflow-hidden rounded-xl"
            >
              <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {idx === 3 && images.length > 4 && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-white text-xl font-black">
                    +{images.length - 4}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Post video */}
      {post.videos && post.videos.length > 0 && (() => {
        const videoUri = post.videos[0]?.cloudinarySecureUrl || post.videos[0]?.url || post.videos[0]?.uri || post.videos[0];
        if (!videoUri || typeof videoUri !== 'string') return null;
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setVideoViewerUrl(videoUri)}
            className="rounded-2xl overflow-hidden mt-2"
            style={{ width: '100%', height: 224 }}
          >
            <Video
              source={{ uri: videoUri }}
              style={{ width: '100%', height: 224 }}
              resizeMode="cover"
              controls={true}
              paused={true}
            />
          </TouchableOpacity>
        );
      })()}

      {/* Like + Comment actions */}
      <View className="flex-row items-center gap-5 px-4 py-3 border-t border-[#4a3728]/10 mt-3">
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <HeartIcon filled={liked} />
          <Text className={`text-sm font-semibold ${liked ? 'text-red-500' : 'text-[#4a3728]/70'}`}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          activeOpacity={0.7}
          onPress={handleToggleComments}
        >
          <CommentIcon />
          <Text className="text-[#4a3728]/70 text-sm font-semibold">
            {Math.max(post.commentsCount || 0, comments.length)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Comments Section */}
      {showComments && (
        <CommentsSection
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
          handleCommentSubmit={handleSubmitComment}
          handleReply={(id: string) => setReplyingTo(id)}
          handleCommentReaction={() => { }}
          toggleCommentMenu={(id: string) => setOpenCommentMenuIndex((prev: any) => prev === id ? null : id)}
          handleCommentAction={async (action: string, comment: any) => {
            setOpenCommentMenuIndex(null);
            const cId = comment.commentId || comment._id || comment.id;
            if (action === 'edit') {
              setEditingCommentId(cId);
              setEditCommentText(comment.content || comment.text || '');
            } else if (action === 'delete') {
              try {
                await AuthService.deleteComment(cId);
                loadComments();
              } catch (e) {
                console.log('Failed to delete comment', e);
              }
            } else if (action === 'cancelEdit') {
              setEditingCommentId(null);
              setEditCommentText('');
            }
          }}
          handleEditSubmit={async (id: string) => {
            if (!editCommentText.trim()) return;
            try {
              await AuthService.updateComment(id, editCommentText.trim());
              setEditingCommentId(null);
              setEditCommentText('');
              loadComments();
            } catch (e) {
              console.log('Failed to edit comment', e);
            }
          }}
          handleEmojiClick={(emoji: string) => {
            setCommentText(prev => prev + emoji);
            setShowEmojiPicker(false);
          }}
          comments={comments}
          postId={post.postId}
          emojiList={['❤️', '👍', '😂', '🔥', '👏']}
          profileImage={(currentUser as any)?.avatar || (currentUser as any)?.profileImage}
          currentUserId={(currentUser as any)?.id || (currentUser as any)?.userId}
          currentUserName={(currentUser as any)?.name || (currentUser as any)?.fullName}
          commentImage={commentImage}
          setCommentImage={setCommentImage}
          isSubmitting={isSubmittingComment}
          onClose={() => setShowComments(false)}
          commentCount={post.commentsCount}
        />
      )}

      <VideoViewerModal
        visible={!!videoViewerUrl}
        videoUrl={videoViewerUrl}
        onClose={() => setVideoViewerUrl(null)}
      />

    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ActivitySection = ({
  posts = DUMMY_POSTS,
  currentUserId,
  onPostCreated,
  isLoading = false,
  profileImage,
  fullName,
  headline,
  isOwnProfile = true,
}: ActivitySectionProps) => {
  const [activeTab, setActiveTab] = useState('Posts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [fullScreenVideo, setFullScreenVideo] = useState<string | null>(null);

  const [fetchedPosts, setFetchedPosts] = useState<any[]>([]);
  const [fetchedReposts, setFetchedReposts] = useState<any[]>([]);
  const [fetchedComments, setFetchedComments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchActivities = async (silent = false) => {
    try {
      if (!silent) setIsFetching(true);
      if (isOwnProfile) {
        const [postsRes, commentsRes, repostsRes] = await Promise.all([
          AuthService.getAllUserPosts().catch(() => null),
          AuthService.getMyComments().catch(() => null),
          AuthService.getUserReposts().catch(() => null),
        ]);
        const rawPosts = postsRes?.data?.posts || postsRes?.posts || postsRes?.data || [];
        setFetchedPosts(Array.isArray(rawPosts) ? rawPosts : []);
        setFetchedComments(commentsRes?.data?.comments || commentsRes?.comments || []);
        const repostsList = repostsRes?.data?.reposts || repostsRes?.reposts || [];
        setFetchedReposts(repostsList);
      } else if (currentUserId) {
        const postsRes = await AuthService.getPostsByUserId(currentUserId).catch(() => null);
        const rawPosts = postsRes?.data?.posts || postsRes?.posts || postsRes?.data || [];
        setFetchedPosts(Array.isArray(rawPosts) ? rawPosts : []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnProfile, currentUserId]);

  const handleDeletePost = async (postId: string) => {
    try {
      await AuthService.deletePost(postId);
      // Remove from UI instantly
      setFetchedPosts(prev => prev.filter(p => (p.entryId || p._id || p.postId) !== postId));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const getMediaUrl = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.cloudinarySecureUrl || item.cloudinaryUrl || item.url || item.uri || item.secure_url || item.path || '';
  };

  const mapPost = (apiPost: any) => {
    if (!apiPost) return null;
    const target = apiPost.originalPost || apiPost;
    const id = currentUserId;
    const isLiked = target.isLiked === true || target.isLikedByCurrentUser === true || apiPost.isLiked === true || apiPost.isLikedByCurrentUser === true ||
      (Array.isArray(target.likedBy) && id ? target.likedBy.some((like: any) =>
        like === id || like._id === id || like.userId === id || like.user === id
      ) : false) ||
      (Array.isArray(target.likes) && id ? target.likes.some((like: any) =>
        like === id || like._id === id || like.userId === id || like.user === id
      ) : false);

    const rawImages = target.images || apiPost.images || (target.image ? [target.image] : apiPost.image ? [apiPost.image] : []);
    const filteredImages = (Array.isArray(rawImages) ? rawImages : []).filter((img: any) => {
      const url = typeof img === 'string' ? img : (img?.cloudinarySecureUrl || img?.url || img?.uri || img?.secure_url || img?.path);
      if (!url || typeof url !== 'string') return false;
      const lower = url.toLowerCase();
      return !lower.includes('unsplash.com') && !lower.includes('via.placeholder.com') && !lower.includes('placeholder.com') && !lower.includes('pravatar.cc');
    });

    const videos = target.videos || apiPost.videos || (target.video ? [target.video] : apiPost.video ? [apiPost.video] : []);
    const documents = target.documents || apiPost.documents || [];

    const name = target.authorName || fullName || target.author?.name || 'User';
    const rawAvatar = target.authorAvatar || profileImage || target.author?.profileImage || target.author?.avatar;
    const finalAvatar = (rawAvatar && typeof rawAvatar === 'string' && !rawAvatar.includes('pravatar.cc') && !rawAvatar.includes('unsplash.com'))
      ? rawAvatar
      : (profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0d8cf&color=4a3728&size=128`);

    return {
      postId: apiPost.repostId || apiPost.entryId || apiPost._id || target.entryId || target._id || String(Math.random()),
      entryId: apiPost.entryId || apiPost._id || target.entryId || target._id || String(Math.random()),
      feedItemType: apiPost.feedItemType || 'post',
      thoughtText: apiPost.thoughtText || null,
      title: target.title || apiPost.title || 'Untitled',
      content: target.content || apiPost.content || '',
      authorName: name,
      authorHeadline: (target.authorHeadline && typeof target.authorHeadline === 'string' && target.authorHeadline.trim().toLowerCase() !== 'user') 
        ? target.authorHeadline 
        : (headline && typeof headline === 'string' && headline.trim().toLowerCase() !== 'user') 
        ? headline 
        : (target.author?.headline && typeof target.author.headline === 'string' && target.author.headline.trim().toLowerCase() !== 'user') 
        ? target.author.headline 
        : '',
      authorAvatar: finalAvatar,
      timeAgo: target.createdAt ? new Date(target.createdAt).toLocaleDateString() : (apiPost.createdAt ? new Date(apiPost.createdAt).toLocaleDateString() : 'Just now'),
      createdAt: apiPost.createdAt || target.createdAt,
      likesCount: Array.isArray(target.likedBy) ? target.likedBy.length : (target.likesCount || apiPost.likesCount || 0),
      commentsCount: target.commentsCount || apiPost.commentsCount || 0,
      images: filteredImages,
      videos,
      documents,
      isLiked,
      comments: target.comments || apiPost.comments || [],
    };
  };

  const mappedPosts = fetchedPosts.map(mapPost).filter(Boolean);
  const mappedOtherPosts = (posts || []).map(mapPost).filter(Boolean);

  // Map reposts into display-ready objects with a repost banner
  const mappedReposts = fetchedReposts
    .filter((r: any) => r.originalPost)
    .map((r: any) => {
      const op = r.originalPost;
      const mapped = mapPost(op);
      if (!mapped) return null;
      return {
        ...mapped,
        postId: r.repostId || mapped.postId,
        feedItemType: 'repost',
        repostedBy: r.repostedBy,
        thoughtText: r.thoughtText || null,
        createdAt: r.createdAt || mapped.timeAgo,
      };
    })
    .filter(Boolean);

  const activePosts = mappedPosts.length > 0 ? mappedPosts : mappedOtherPosts;

  const displayPosts = isOwnProfile
    ? [...activePosts, ...mappedReposts]
        .filter((p: any, index: number, self: any[]) =>
          p && index === self.findIndex((t: any) => t && (t.postId === p.postId || t.entryId === p.entryId))
        )
        .sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
    : (activePosts.length > 0 ? activePosts : mappedOtherPosts);
  const visiblePosts = displayPosts.slice(0, 2);
  const hasMore = displayPosts.length > 2;
  const currentIsLoading = isOwnProfile ? (isLoading || isFetching) : isLoading;

  // Extract all media, documents and comments from posts
  const allImages = displayPosts.flatMap((p: any) => (p.images || []).map((img: any) => ({ post: p, img })));
  const allVideos = displayPosts.flatMap((p: any) => (p.videos || []).map((vid: any) => ({ post: p, video: vid })));
  const allDocuments = displayPosts.flatMap((p: any) =>
    (p.documents || []).map((doc: any, docIdx: number) => ({ post: p, doc, docIdx }))
  );

  // Map fetched comments with their respective posts to display "on [post title]"
  const allComments = fetchedComments.filter(Boolean).map((c: any) => {
    const post = displayPosts.find((p: any) => (p.postId || p.entryId) === c.postId) || { title: 'a post' };
    return { post, comment: c };
  });

  return (
    <View className="mx-3 mb-6 ">
      <View className="bg-[#f6ede8]/80 rounded-3xl p-4 border border-[#e0d8cf]/50">

        {/* ── Header ───────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#4a3728] text-xl font-bold">Activity</Text>
          {isOwnProfile && (
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-[#4a3728] px-3 py-2 rounded-xl"
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <PlusIcon />
              <Text className="text-white text-xs font-semibold">Create post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row bg-white/40 rounded-full p-1 gap-1">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`px-4 py-2 rounded-full items-center ${activeTab === tab ? 'bg-[#4a3728]' : ''}`}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold ${activeTab === tab ? 'text-white text-xs' : 'text-[#4a3728] text-xs'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── Content ──────────────────────────────────────────────── */}
        {currentIsLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#4a3728" />
            <Text className="text-[#4a3728]/70 text-sm mt-2">Loading activity...</Text>
          </View>
        ) : (
          <>
            {/* Posts tab */}
            {activeTab === 'Posts' && (
              displayPosts.length === 0 ? (
                <EmptyState label="No posts yet. Share something with your network!" />
              ) : (
                <>
                  {visiblePosts.map((post: any) => (
                    <View key={post?.postId || post?.entryId} className="mb-3">
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
                        onEditPress={(p: any) => setEditingPost(p)}
                        onImageClick={(url: string) => setFullScreenImage(url)}
                        onDeletePress={handleDeletePost}
                        onCommentAdded={() => fetchActivities(true)}
                        currentUser={{
                          id: currentUserId,
                          name: fullName,
                          avatar: profileImage
                        }}
                        isOwnProfile={post.feedItemType !== 'repost' && isOwnProfile}
                      />
                    </View>
                  ))}
                  {hasMore && (
                    <TouchableOpacity
                      className="py-3 items-center border border-[#4a3728]/20 rounded-2xl mt-1"
                      onPress={() => setShowAllModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-[#4a3728] text-sm font-semibold">
                        Show All Posts ({displayPosts.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )
            )}

            {activeTab === 'Comments' && (
              allComments.length === 0 ? (
                <EmptyState label="Comments you've made will appear here." />
              ) : (
                allComments.map(({ post, comment }: any, idx: number) => {
                  const isCurrentUser = Boolean(currentUserId && (comment.userId === currentUserId || comment.user === currentUserId));
                  const name = (isCurrentUser && fullName) ? fullName : (comment.user?.username || comment.author?.name || 'User');
                  const rawAvatar = (isCurrentUser && profileImage) ? profileImage : (comment.user?.profileImage || comment.author?.profileImage);
                  const avatar = (rawAvatar && typeof rawAvatar === 'string' && !rawAvatar.includes('pravatar.cc') && !rawAvatar.includes('unsplash.com'))
                    ? rawAvatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0d8cf&color=4a3728&size=128`;

                  return (
                    <View key={idx} className="mb-3 bg-white/50 p-3 rounded-xl border border-[#d4c4b5]/30">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                          <Image source={{ uri: avatar }} className="w-6 h-6 rounded-full" />
                          <Text className="text-[#4a3728] font-semibold text-xs">{name}</Text>
                        </View>
                        <Text className="text-[#4a3728]/50 text-xs text-right flex-1 ml-2" numberOfLines={1}>
                          on {post.title}
                        </Text>
                      </View>
                      <Text className="text-[#4a3728] text-xs pl-8">
                        {comment.content}
                      </Text>
                    </View>
                  );
                })
              )
            )}

            {activeTab === 'Videos' && (
              allVideos.length === 0 ? (
                <EmptyState label="No videos uploaded yet." />
              ) : (
                allVideos.map(({ post, video }: any, idx: number) => {
                  const mediaUrl = getMediaUrl(video);
                  return (
                    <View key={idx} className="bg-white/60 rounded-2xl border border-[#d4c4b5]/40 p-3 mb-3">
                      <Text className="text-[#4a3728] text-sm font-bold mb-2">{post.title}</Text>
                      <TouchableOpacity 
                        className="w-full bg-black rounded-xl overflow-hidden"
                        style={{ height: 160 }}
                        activeOpacity={0.9}
                        onPress={() => setFullScreenVideo(mediaUrl)}
                      >
                        <Video
                          source={{ uri: mediaUrl }}
                          style={{ width: '100%', height: '100%' }}
                          controls={true}
                          resizeMode="cover"
                          paused={true}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )
            )}

            {activeTab === 'Images' && (
              allImages.length === 0 ? (
                <EmptyState label="No images uploaded yet." />
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {allImages.map(({ post, img }: any, idx: number) => {
                    const mediaUrl = getMediaUrl(img);
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        className="rounded-xl overflow-hidden border border-[#d4c4b5]/40" 
                        style={{ width: '48%' }}
                        onPress={() => setFullScreenImage(mediaUrl)}
                        activeOpacity={0.9}
                      >
                        <Image
                          source={{ uri: mediaUrl }}
                          className="w-full h-32"
                          resizeMode="cover"
                        />
                        <View className="p-2 bg-white/70">
                          <Text className="text-[#4a3728] text-xs font-medium" numberOfLines={1}>{post.title}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            )}

            {activeTab === 'Documents' && (
              allDocuments.length === 0 ? (
                <EmptyState label="No documents uploaded yet." />
              ) : (
                allDocuments.map(({ post, doc, docIdx }: any, idx: number) => {
                  const mediaUrl = getMediaUrl(doc);
                  const docName = doc.name || doc.fileName || doc.title || (typeof doc === 'string' ? doc.split('/').pop() : `Document ${docIdx + 1}`);
                  const extension = docName.split('.').pop()?.toUpperCase() || 'PDF';

                  return (
                    <TouchableOpacity
                      key={idx}
                      className="bg-white/70 rounded-2xl border border-[#d4c4b5]/40 p-3.5 mb-3 flex-row items-center gap-3.5"
                      activeOpacity={0.7}
                      onPress={() => {
                        if (mediaUrl) Linking.openURL(mediaUrl);
                      }}
                    >
                      <View className="w-11 h-11 bg-[#4a3728]/10 rounded-xl items-center justify-center">
                        <FileIcon />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-0.5">
                          <Text className="text-[#4a3728] text-sm font-bold flex-1" numberOfLines={1}>
                            {docName}
                          </Text>
                          <View className="bg-[#4a3728]/10 px-2 py-0.5 rounded-md">
                            <Text className="text-[#4a3728] text-[10px] font-bold">{extension}</Text>
                          </View>
                        </View>
                        <Text className="text-[#4a3728]/60 text-xs" numberOfLines={1}>
                          From post: {post.title || 'Untitled Post'}
                        </Text>
                        <Text className="text-[#8b6f47] text-[10px] mt-0.5 font-medium">
                          Tap to open & view
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )
            )}
          </>
        )}
      </View>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <CreatePostModal
        isOpen={showCreateModal}
        authorAvatar={profileImage}
        authorName={fullName}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async () => {
          setShowCreateModal(false);
          await fetchActivities();
          onPostCreated?.();
        }}
      />

      <UpdatePostModal
        postId={editingPost?.postId || editingPost?.entryId || ''}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        currentTitle={editingPost?.title || ''}
        currentContent={editingPost?.content || ''}
        onUpdate={(_id: string, _newTitle: string, _newContent: string) => {
          setEditingPost(null);
          fetchActivities(); // Refresh after update
        }}
      />

      <ShowAllActivityModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        activeSection={activeTab}
        posts={displayPosts}
        postLikes={{}}
        onLikeToggle={() => { }}
        onEditPress={(p: any) => setEditingPost(p)}
        onDeletePress={handleDeletePost}
        onCommentAdded={() => fetchActivities(true)}
        currentUser={{
          id: currentUserId,
          name: fullName,
          avatar: profileImage
        }}
        allComments={allComments}
        allDocuments={allDocuments}
      />

      {/* Full Screen Image Modal */}
      <ImageViewerModal
        visible={!!fullScreenImage}
        imageUrl={fullScreenImage}
        onClose={() => setFullScreenImage(null)}
      />

      {/* Full Screen Video Modal */}
      <VideoViewerModal
        visible={!!fullScreenVideo}
        videoUrl={fullScreenVideo}
        onClose={() => setFullScreenVideo(null)}
      />
    </View>
  );
};

export default ActivitySection;