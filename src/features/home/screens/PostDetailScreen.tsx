import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import PostCard from '../components/PostCard';
import UpdatePostModal from '../../profile/components/modals/UpdatePostModal';
import AuthService, { api } from '../../../services/auth.service';
import { FeedService } from '../../../services/feed.service';
import ImagePicker from 'react-native-image-crop-picker';

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M15 19l-7-7 7-7" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function PostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId, openComments } = route.params || {};

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States required for PostCard props
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<any>(null);
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openCommentsIndex, setOpenCommentsIndex] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [postCommentCounts, setPostCommentCounts] = useState<Record<string, number>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRepostIndex, setOpenRepostIndex] = useState<number | null>(null);
  const [openCommentMenuIndex, setOpenCommentMenuIndex] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<any>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const fetchPostDetails = async () => {
    if (!postId) {
      setError('Post ID is missing');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch post, auth-profile, and profile photos concurrently
      const [postRes, profileRes, photosRes] = await Promise.all([
        AuthService.getPostById(postId).catch((err) => { throw err; }),
        AuthService.getUserProfile().catch(() => null),
        AuthService.getAllProfilePhotos(false).catch(() => null),
      ]);

      const userRes = AuthService.getCurrentUser() as any;

      const fetchedPost = postRes?.data?.post || postRes?.post;
      if (!fetchedPost) {
        setError('Post not found');
        return;
      }

      // Enrich post with real author data from FeedService cache / backend API
      const enrichedList = await FeedService.enrichPostsWithAuthorData([fetchedPost]);
      const enrichedPost = enrichedList[0] || fetchedPost;

      // Map post fields
      const pKey = fetchedPost.id || fetchedPost._id || fetchedPost.entryId;
      const authorId = fetchedPost.userId || fetchedPost.authorId || fetchedPost.author?._id || fetchedPost.author?.id;
      const currentUserId = userRes?.userId || userRes?.id || userRes?._id;
      const isOwnPost = Boolean(currentUserId && (authorId === currentUserId || fetchedPost.userId === currentUserId || fetchedPost.currentUserId === currentUserId));

      // Fetch connection status between current user and post author
      let authorConnectionStatus = 'none';
      if (authorId && currentUserId && authorId !== currentUserId) {
        try {
          const connRes = await api.get(`/api/v1/connections/status/${authorId}`).catch(() => null);
          const status = connRes?.data?.status || connRes?.status;
          if (status === 'accepted' || status === 'active') authorConnectionStatus = 'active';
          else if (status === 'pending') authorConnectionStatus = 'pending';
        } catch { // eslint-disable-line no-empty
          // Silently ignore — fallback is 'none'
        }
      } else if (isOwnPost) {
        authorConnectionStatus = 'self'; // own post — button hidden via isOwner check
      }

      // Resolve the current user's active profile photo for the comment input avatar
      const photos: any[] = photosRes?.data?.data || photosRes?.data || photosRes || [];
      const activePhoto = Array.isArray(photos)
        ? photos.find((p: any) => p.isActive || p.status === 'active') || photos[0]
        : null;
      const resolvedProfileImage =
        activePhoto?.cloudinarySecureUrl ||
        activePhoto?.url ||
        profileRes?.data?.profileImage ||
        userRes?.profileImage ||
        userRes?.avatar ||
        null;

      const profileData = profileRes?.data?.profile || profileRes?.profile || profileRes?.data || {};
      const myDisplayName = profileData.fullName || (profileData.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : null) || userRes?.name || userRes?.fullName || 'You';

      const authorDisplayName = isOwnPost
        ? myDisplayName
        : (enrichedPost.authorName || enrichedPost.user || fetchedPost.authorName || fetchedPost.author?.name || fetchedPost.user?.name || 'Throne8 User');

      const authorAvatarUrl = isOwnPost
        ? (resolvedProfileImage || enrichedPost.authorAvatar || enrichedPost.avatar || '')
        : (enrichedPost.authorAvatar || enrichedPost.avatar || fetchedPost.authorAvatar || fetchedPost.author?.profileImage || fetchedPost.user?.avatar || '');

      const authorHeadlineText = isOwnPost
        ? (profileData.headline || userRes?.headline || 'Member')
        : (enrichedPost.authorHeadline || enrichedPost.role || fetchedPost.authorHeadline || fetchedPost.author?.headline || '');

      const mappedPost = {
        ...fetchedPost,
        ...enrichedPost,
        entryId: pKey,
        postId: pKey,
        user: authorDisplayName,
        authorName: authorDisplayName,
        username: enrichedPost.username || fetchedPost.username || fetchedPost.userName || '',
        avatar: authorAvatarUrl,
        authorAvatar: authorAvatarUrl,
        role: authorHeadlineText,
        authorHeadline: authorHeadlineText,
        time: fetchedPost.createdAt ? new Date(fetchedPost.createdAt).toLocaleDateString() : 'Just now',
        timeAgo: fetchedPost.createdAt ? new Date(fetchedPost.createdAt).toLocaleDateString() : 'Just now',
        likesCount: fetchedPost.likesCount ?? fetchedPost.likes ?? 0,
        commentsCount: fetchedPost.commentsCount ?? fetchedPost.comments ?? 0,
        images: fetchedPost.images || [],
        videos: fetchedPost.videos || [],
        documents: fetchedPost.documents || [],
        authorConnectionStatus,
        isOwnPost,
      };

      setPost(mappedPost);
      setCurrentUser(userRes);

      setProfile({
        ...profileData,
        profileImage: resolvedProfileImage,
      });

      // Setup initial liked state
      setLikedPosts({ [pKey]: !!fetchedPost.isLikedByCurrentUser });

      // Only auto-open comments if explicitly requested (e.g. from a comment notification)
      if (openComments) {
        setOpenCommentsIndex(pKey);
      }

      // Load comments for the post
      const commRes = await AuthService.getCommentsByPostId(pKey).catch(() => []);
      let comments = [];
      if (Array.isArray(commRes)) comments = commRes;
      else if (Array.isArray(commRes.data)) comments = commRes.data;
      else if (commRes.data && Array.isArray(commRes.data.comments)) comments = commRes.data.comments;
      else if (Array.isArray(commRes.comments)) comments = commRes.comments;

      setPostComments({ [pKey]: comments });
      setPostCommentCounts({ [pKey]: comments.length });

    } catch (err: any) {
      console.error('Error fetching post details:', err);
      setError(err?.message || 'Failed to load post details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleLike = async (postKey: string) => {
    const isCurrentlyLiked = likedPosts[postKey];
    setLikedPosts(prev => ({ ...prev, [postKey]: !isCurrentlyLiked }));
    setPost((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        likesCount: isCurrentlyLiked ? Math.max(0, (prev.likesCount || 0) - 1) : (prev.likesCount || 0) + 1,
        isLikedByCurrentUser: !isCurrentlyLiked
      };
    });

    try {
      if (isCurrentlyLiked) {
        await AuthService.unlikePost(postKey);
      } else {
        await AuthService.likePost(postKey);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setLikedPosts(prev => ({ ...prev, [postKey]: isCurrentlyLiked }));
      fetchPostDetails();
    }
  };

  const toggleComments = (postKey: string) => {
    setOpenCommentsIndex(prev => prev === postKey ? null : postKey);
  };

  const handleCommentSubmit = async (postKey: string) => {
    if (!commentText.trim() && !commentImage) return;
    const text = commentText.trim();
    const imageToSubmit = commentImage;

    setCommentText('');
    setCommentImage(null);
    setSubmittingCommentPostId(postKey);

    try {
      if (replyingTo) {
        await AuthService.createReply(replyingTo, text);
        setReplyingTo(null);
      } else {
        await AuthService.createComment(postKey, text, imageToSubmit);
      }

      const res = await AuthService.getCommentsByPostId(postKey);
      let comments = [];
      if (Array.isArray(res)) comments = res;
      else if (Array.isArray(res.data)) comments = res.data;
      else if (res.data && Array.isArray(res.data.comments)) comments = res.data.comments;
      else if (Array.isArray(res.comments)) comments = res.comments;

      setPostComments(prev => ({ ...prev, [postKey]: comments }));
      setPostCommentCounts(prev => ({ ...prev, [postKey]: comments.length }));
      setPost((prev: any) => {
        if (!prev) return prev;
        return { ...prev, commentsCount: comments.length };
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
      setCommentText(text);
      setCommentImage(imageToSubmit);
    } finally {
      setSubmittingCommentPostId(null);
    }
  };

  const handlePostAction = async (action: string, _index: number) => {
    setOpenMenuIndex(null);
    if (action === 'delete' && post) {
      const pKey = post.entryId || post.postId;
      try {
        await AuthService.deletePost(pKey);
        navigation.goBack();
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    } else if (action === 'edit' && post) {
      setEditingPost(post);
    }
  };

  const handleReply = (commentId: string) => setReplyingTo(commentId);

  const handleCommentReaction = (commentId: string, emoji: string) => {
    const pKey = post?.entryId || post?.postId;
    if (!pKey) return;
    setPostComments(prev => {
      const updated = { ...prev };
      const list = updated[pKey] || [];
      updated[pKey] = list.map(c => {
        if (c._id === commentId) {
          const reactions = { ...c.reactions };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...c, reactions };
        }
        return c;
      });
      return updated;
    });
  };

  const toggleCommentMenu = (id: string) => {
    setOpenCommentMenuIndex((prev: any) => prev === id ? null : id);
  };

  const handleCommentAction = async (action: string, comment: any) => {
    setOpenCommentMenuIndex(null);
    const pKey = post?.entryId || post?.postId;
    if (!pKey) return;

    if (action === 'delete') {
      try {
        await AuthService.deleteComment(comment._id);
        const res = await AuthService.getCommentsByPostId(pKey);

        let comments = [];
        if (Array.isArray(res)) comments = res;
        else if (Array.isArray(res.data)) comments = res.data;
        else if (res.data && Array.isArray(res.data.comments)) comments = res.data.comments;
        else if (Array.isArray(res.comments)) comments = res.comments;

        setPostComments(prev => ({ ...prev, [pKey]: comments }));
        setPostCommentCounts(prev => ({ ...prev, [pKey]: comments.length }));
        setPost((prev: any) => {
          if (!prev) return prev;
          return { ...prev, commentsCount: comments.length };
        });
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    } else if (action === 'edit') {
      setEditingCommentId(comment._id);
      setEditCommentText(comment.content);
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    const pKey = post?.entryId || post?.postId;
    if (!pKey) return;
    const textToSubmit = editCommentText.trim();
    if (!textToSubmit) return;

    setEditingCommentId(null);
    setEditCommentText('');

    try {
      await AuthService.updateComment(commentId, textToSubmit);
      const res = await AuthService.getCommentsByPostId(pKey);

      let comments = [];
      if (Array.isArray(res)) comments = res;
      else if (Array.isArray(res.data)) comments = res.data;
      else if (res.data && Array.isArray(res.data.comments)) comments = res.data.comments;
      else if (Array.isArray(res.comments)) comments = res.comments;

      setPostComments(prev => ({ ...prev, [pKey]: comments }));
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText(prev => prev + emoji);
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
      setCommentImage({
        uri: image.path,
        type: image.mime,
        fileName: image.filename || `comment_img_${Date.now()}.jpg`,
      });
    }).catch(e => {
      console.log('Comment image picker cancelled', e);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f6ede8]"
    >
      <SafeAreaView className="bg-[#f6ede8]" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-[#d4c4b5]/30 bg-[#f6ede8]">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-[#4a3728]/10"
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-xl font-black ml-2 flex-1" style={{ color: '#4a3728', letterSpacing: 0.5 }}>
            Post Details
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 pt-3">
        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#4a3728" />
            <Text className="text-sm mt-4 font-medium text-[#4a3728]/60">Loading post details...</Text>
          </View>
        ) : error ? (
          <View className="py-20 items-center px-6">
            <Text className="text-base font-bold text-red-600 text-center">{error}</Text>
            <TouchableOpacity
              onPress={fetchPostDetails}
              className="mt-4 px-6 py-2.5 bg-[#4a3728] rounded-xl active:bg-[#4a3728]/80"
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : post ? (
          <PostCard
            post={post}
            index={0}
            currentUserId={currentUser?.userId || currentUser?.id || profile?.userId || (profile as any)?._id}
            currentUserName={profile?.fullName || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : null) || (profile as any)?.name || currentUser?.name || currentUser?.fullName}
            likedPosts={likedPosts}
            handleLike={handleLike}
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
            togglePostMenu={(idx) => setOpenMenuIndex(prev => prev === idx ? null : idx)}
            toggleRepostMenu={(idx) => setOpenRepostIndex(prev => prev === idx ? null : idx)}
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
            profileImage={profile?.profileImage}
            commentImage={commentImage}
            setCommentImage={setCommentImage}
            onPickCommentPhoto={handlePickCommentPhoto}
            isSubmitting={submittingCommentPostId === (post.entryId || post.postId)}
          />
        ) : null}
        <View className="h-20" />
      </ScrollView>

      <UpdatePostModal
        postId={editingPost?.postId || editingPost?.entryId || ''}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        currentTitle={editingPost?.title || ''}
        currentContent={editingPost?.content || ''}
        onUpdate={(_id: string, _newTitle: string, _newContent: string) => {
          setEditingPost(null);
          fetchPostDetails(); // Refresh after update
        }}
      />
    </KeyboardAvoidingView>
  );
}
