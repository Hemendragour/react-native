import { View, Text, Image, TouchableOpacity } from 'react-native';
import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import CommentsSection from './CommentSection';

// ─── Types ────────────────────────────────────────────────────────────────────
 
interface PostCardProps {
  key?: any;
  post: any;
  index: number;
  currentUserId?: string;
  currentUserName?: string;
  likedPosts: Record<string, boolean>;
  userReactions?: Record<string, any>;
  handleLike: (postKey: string) => void;
  handleReact?: (postKey: string, type: any) => void;
  openMenuIndex: number | null;
  openRepostIndex: number | null;
  openCommentsIndex: string | null;
  commentText: string;
  setCommentText: (v: string) => void;
  replyingTo: string | null;
  setReplyingTo?: (v: string | null) => void;
  openCommentMenuIndex: any;
  editingCommentId: any;
  editCommentText: string;
  setEditCommentText: (v: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;
  handlePostAction: (action: string, index: number) => void;
  togglePostMenu: (index: number) => void;
  toggleRepostMenu: (index: number) => void;
  toggleComments: (postKey: string) => void;
  handleCommentSubmit: (postKey: string) => void;
  handleReply: (id: string) => void;
  handleCommentReaction: (id: string, emoji: string) => void;
  toggleCommentMenu: (id: string) => void;
  handleCommentAction: (action: string, comment: any) => void;
  handleEditSubmit: (id: string) => void;
  handleEmojiClick: (emoji: string) => void;
  postComments: Record<string, any[]>;
  postCommentCounts: Record<string, number>;
  emojiList?: string[];
  profileImage?: string;
  onOpenWithPerspectiveModal?: (post: any) => void;
  handleRepostInstant?: (index: number) => void;
  handleUndoRepost?: (index: number) => void;
  commentImage?: any;
  setCommentImage?: (v: any) => void;
  onPickCommentPhoto?: () => void;
  isSubmitting?: boolean;
  submittingCommentPostId?: string | null;
  isLoadingComments?: boolean;
  commentUserReactions?: Record<string, string | null>;
  onOpenReactors?: (postKey: string) => void;
  onRecordSend?: (postKey: string) => void;
  onVotePoll?: (postKey: string, optionId: string) => void;
}

const PostCard: React.FC<PostCardProps> = (props: PostCardProps) => {
  const {
    post, index, currentUserId, currentUserName,
    likedPosts, userReactions, handleLike, handleReact,
    openMenuIndex, openRepostIndex, openCommentsIndex,
    commentText, setCommentText,
    replyingTo, setReplyingTo,
    openCommentMenuIndex,
    editingCommentId, editCommentText, setEditCommentText,
    showEmojiPicker, setShowEmojiPicker,
    handlePostAction, togglePostMenu, toggleRepostMenu, toggleComments,
    handleCommentSubmit,
    handleReply, handleCommentReaction,
    toggleCommentMenu, handleCommentAction,
    handleEditSubmit, handleEmojiClick,
    postComments, postCommentCounts,
    emojiList, profileImage,
    onOpenWithPerspectiveModal, handleRepostInstant, handleUndoRepost,
    commentImage, setCommentImage, onPickCommentPhoto, isSubmitting, isLoadingComments, commentUserReactions,
    onOpenReactors, onRecordSend, onVotePoll,
  } = props;

  const navigation = useNavigation<any>();
  const postKey = post.entryId || post.postId;
  const isCommentsOpen = openCommentsIndex === postKey;

  // "Liked by connections you know" / "Commented by connections" state matching website
  const [dismissedLikedBy, setDismissedLikedBy] = React.useState(false);
  const [dismissedCommentedBy, setDismissedCommentedBy] = React.useState(false);

  const renderLikedByConnections = () => {
    const names: string[] = post.likedByConnections || [];
    const totalCount: number = post.likedByConnectionsCount || names.length || 0;
    const fullList: Array<{ userId: string; name: string; avatar?: string | null }> =
      post.likedByConnectionsFull || [];

    if (names.length === 0 || dismissedLikedBy) return null;

    const shownPeople = names.slice(0, 2).map((n, i) => ({
      name: n,
      userId: fullList[i]?.userId || null,
    }));
    const remaining = totalCount - Math.min(names.length, 2);
    const firstLikerAvatar = post.likedByConnectionsAvatars?.[0] || fullList[0]?.avatar || null;
    const firstLikerInitial = names[0]?.charAt(0)?.toUpperCase() || '?';

    return (
      <View className="flex-row items-center justify-between pb-2 mb-2 border-b border-[#4a3728]/10">
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          {firstLikerAvatar ? (
            <Image
              source={{ uri: firstLikerAvatar }}
              className="w-5 h-5 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-5 h-5 rounded-full bg-[#6b5643] items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{firstLikerInitial}</Text>
            </View>
          )}
          <Text className="text-xs text-[#4a3728]/80 flex-1" numberOfLines={1}>
            {shownPeople.map((person, i) => (
              <React.Fragment key={person.userId || person.name || i}>
                <Text
                  onPress={() => {
                    if (person.userId) navigation.navigate('Profile', { userId: person.userId });
                  }}
                  className="font-bold text-[#4a3728]"
                >
                  {person.name}
                </Text>
                {i < shownPeople.length - 1 ? ' and ' : ''}
              </React.Fragment>
            ))}
            {remaining > 0 ? ` and ${remaining} other${remaining > 1 ? 's' : ''} like this` : ' like this'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setDismissedLikedBy(true)}
          className="p-1 rounded-full"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-[#4a3728]/60 font-bold leading-none">✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCommentedByConnections = () => {
    const names: string[] = post.commentedByConnections || [];
    const totalCount: number = post.commentedByConnectionsCount || names.length || 0;
    const fullList: Array<{ userId: string; name: string; avatar?: string | null }> =
      post.commentedByConnectionsFull || [];

    if (names.length === 0 || dismissedCommentedBy) return null;

    const shownPeople = names.slice(0, 2).map((n, i) => ({
      name: n,
      userId: fullList[i]?.userId || null,
    }));
    const remaining = totalCount - Math.min(names.length, 2);
    const firstCommenterAvatar = post.commentedByConnectionsAvatars?.[0] || fullList[0]?.avatar || null;
    const firstCommenterInitial = names[0]?.charAt(0)?.toUpperCase() || '?';

    return (
      <View className="flex-row items-center justify-between pb-2 mb-2 border-b border-[#4a3728]/10">
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          {firstCommenterAvatar ? (
            <Image
              source={{ uri: firstCommenterAvatar }}
              className="w-5 h-5 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-5 h-5 rounded-full bg-[#6b5643] items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{firstCommenterInitial}</Text>
            </View>
          )}
          <Text className="text-xs text-[#4a3728]/80 flex-1" numberOfLines={1}>
            {shownPeople.map((person, i) => (
              <React.Fragment key={person.userId || person.name || i}>
                <Text
                  onPress={() => {
                    if (person.userId) navigation.navigate('Profile', { userId: person.userId });
                  }}
                  className="font-bold text-[#4a3728]"
                >
                  {person.name}
                </Text>
                {i < shownPeople.length - 1 ? ' and ' : ''}
              </React.Fragment>
            ))}
            {remaining > 0 ? ` and ${remaining} other${remaining > 1 ? 's' : ''} commented` : ' commented'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setDismissedCommentedBy(true)}
          className="p-1 rounded-full"
          activeOpacity={0.7}
        >
          <Text className="text-xs text-[#4a3728]/60 font-bold leading-none">✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show only ONE line — whichever is more recent (comment OR like), matching website
  const renderRecentActivity = () => {
    const hasLikes = (post.likedByConnections || []).length > 0 && !dismissedLikedBy;
    const hasComments = (post.commentedByConnections || []).length > 0 && !dismissedCommentedBy;

    if (!hasLikes && !hasComments) return null;
    if (hasLikes && !hasComments) return renderLikedByConnections();
    if (!hasLikes && hasComments) return renderCommentedByConnections();

    const likedAt = post.likedByConnectionsAt ? new Date(post.likedByConnectionsAt).getTime() : null;
    const commentedAt = post.commentedByConnectionsAt ? new Date(post.commentedByConnectionsAt).getTime() : null;

    if (likedAt && commentedAt) {
      return commentedAt >= likedAt ? renderCommentedByConnections() : renderLikedByConnections();
    }
    return renderCommentedByConnections();
  };

  return (
    <View className="bg-[#f6ede8]/90 rounded-3xl border border-[#4a3728]/15 p-4 mb-4 mx-3 shadow-sm">
      {/* ── Social Proof Header Strip (Liked / Commented by connections) ── */}
      {renderRecentActivity()}

      {/* ── Repost Header & Thought ── */}
      {(post.feedItemType === 'repost' || post.currentUserHasReposted) && (
        <View className="mb-3">
          <View className="flex-row items-center gap-1.5 mb-2">
            <Text className="text-[#6b4e3d] text-xs font-bold">
              🔄 {post.feedItemType === 'repost'
                ? (post.repostedBy === currentUserId ? 'You' : (post.repostedByName || post.repostedBy))
                : 'You'} reposted this
            </Text>
          </View>
          {post.thoughtText ? (
            <Text className="text-[#4a3728] text-sm mb-3">
              {post.thoughtText}
            </Text>
          ) : null}
        </View>
      )}

      <View className={post.feedItemType === 'repost' ? "border border-[#e0d8cf]/80 rounded-2xl p-3 bg-white/40" : ""}>
        {/* Header — avatar, name, role, time, menu */}
        <PostHeader
          post={post.feedItemType === 'repost' ? post.originalPost : post}
          index={index}
          currentUserId={currentUserId}
          openMenuIndex={openMenuIndex}
          togglePostMenu={togglePostMenu}
          handlePostAction={handlePostAction}
        />

        {/* Content — text + images + polls + events + documents */}
        <PostContent
          post={post.feedItemType === 'repost' ? post.originalPost : post}
          onVotePoll={onVotePoll}
          currentUserId={currentUserId}
        />
      </View>

      {/* Actions — like, comment, share, repost */}
      <PostActions
        post={post.feedItemType === 'repost' ? { ...post.originalPost, currentUserHasReposted: false } : post}
        index={index}
        likedPosts={likedPosts}
        userReactions={userReactions}
        handleLike={handleLike}
        handleReact={handleReact}
        openRepostIndex={openRepostIndex}
        toggleRepostMenu={toggleRepostMenu}
        toggleComments={toggleComments}
        openCommentsIndex={openCommentsIndex}
        onOpenWithPerspectiveModal={onOpenWithPerspectiveModal}
        handleRepostInstant={handleRepostInstant}
        handleUndoRepost={handleUndoRepost}
        onOpenReactors={onOpenReactors}
        onRecordSend={onRecordSend}
      />
 
      {/* Comments section — shown when toggled */}
      {isCommentsOpen && (
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
          handleCommentSubmit={() => handleCommentSubmit(postKey)}
          handleReply={handleReply}
          handleCommentReaction={handleCommentReaction}
          toggleCommentMenu={toggleCommentMenu}
          handleCommentAction={handleCommentAction}
          handleEditSubmit={handleEditSubmit}
          handleEmojiClick={handleEmojiClick}
          comments={postComments?.[postKey] || []}
          commentCount={postCommentCounts?.[postKey] ?? post.commentsCount ?? 0}
          postId={postKey}
          emojiList={emojiList}
          profileImage={profileImage}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          commentImage={commentImage}
          setCommentImage={setCommentImage}
          onPickCommentPhoto={onPickCommentPhoto}
          isSubmitting={isSubmitting}
          isLoadingComments={isLoadingComments}
          commentUserReactions={commentUserReactions}
          onClose={() => toggleComments(postKey)}
        />
      )}
    </View>
  );
};

export default PostCard;