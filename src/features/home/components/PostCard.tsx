import { View } from 'react-native'
import React from 'react'
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import CommentsSection from './CommentSection';


// ─── Types ────────────────────────────────────────────────────────────────────
 
interface PostCardProps {
  post: any;
  index: number;
  currentUserId?: string;
  likedPosts: Record<string, boolean>;
  handleLike: (postKey: string) => void;
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
}




const PostCard: React.FC<PostCardProps> = (props) => {

    const{
        post, index, currentUserId,
    likedPosts, handleLike,
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
    onOpenWithPerspectiveModal, handleRepostInstant,
    }=props


    const postKey=post.entryId||post.postId
    const isCommentsOpen= openCommentsIndex === postKey;


  return (
    <View className="bg-[#f6ede8]/80 rounded-3xl border border-[#e0d8cf]/50 p-4 mb-4 mx-3">
 
      {/* Header — avatar, name, role, time, menu */}
      <PostHeader
        post={post}
        index={index}
        currentUserId={currentUserId}
        openMenuIndex={openMenuIndex}
        togglePostMenu={togglePostMenu}
        handlePostAction={handlePostAction}
      />
 
      {/* Content — text + images */}
      <PostContent post={post} />
 
      {/* Actions — like, comment, share, repost */}
      <PostActions
        post={post}
        index={index}
        likedPosts={likedPosts}
        handleLike={handleLike}
        openRepostIndex={openRepostIndex}
        toggleRepostMenu={toggleRepostMenu}
        toggleComments={toggleComments}
        openCommentsIndex={openCommentsIndex}
        onOpenWithPerspectiveModal={onOpenWithPerspectiveModal}
        handleRepostInstant={handleRepostInstant}
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
        />
      )}
    </View>
  )
}

export default PostCard