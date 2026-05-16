// features/home/components/feed/CommentsSection.tsx

import React from 'react';
import { View, Text } from 'react-native';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface CommentsSectionProps {
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
  handleCommentSubmit: () => void;
  handleReply: (id: string) => void;
  handleCommentReaction: (id: string, emoji: string) => void;
  toggleCommentMenu: (id: string) => void;
  handleCommentAction: (action: string, comment: any) => void;
  handleEditSubmit: (id: string) => void;
  handleEmojiClick: (emoji: string) => void;
  comments: any[];
  postId: string;
  emojiList?: string[];
  profileImage?: string;
  commentCount?: number;
}

const safeNumber = (val: any) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const CommentsSection: React.FC<CommentsSectionProps> = ({
  commentText, setCommentText,
  replyingTo, setReplyingTo,
  openCommentMenuIndex,
  editingCommentId, editCommentText, setEditCommentText,
  showEmojiPicker, setShowEmojiPicker,
  handleCommentSubmit, handleReply,
  handleCommentReaction, toggleCommentMenu,
  handleCommentAction, handleEditSubmit,
  handleEmojiClick,
  comments, postId, emojiList, profileImage, commentCount,
}) => (


  
  <View className="mt-3 pt-3 border-t border-brand-dark/10">

    {/* Comment count */}
    {safeNumber(commentCount ?? comments.length) > 0 && (
      <Text className="text-brand-dark/60 text-xs font-medium mb-3">
        {safeNumber(commentCount ?? comments.length)} comment{safeNumber(commentCount ?? comments.length) !== 1 ? 's' : ''}
      </Text>
    )}

    {/* Comment list */}
    {comments.length > 0 && (
      <View className="mb-3 gap-2">
        {comments.map((comment: any) => (
          <CommentItem
            key={comment.commentId || comment._id || comment.id}
            comment={comment}
            openCommentMenuIndex={openCommentMenuIndex}
            editingCommentId={editingCommentId}
            editCommentText={editCommentText}
            setEditCommentText={setEditCommentText}
            handleCommentReaction={handleCommentReaction}
            toggleCommentMenu={toggleCommentMenu}
            handleCommentAction={handleCommentAction}
            handleEditSubmit={handleEditSubmit}
            handleReply={handleReply}
            setReplyingTo={setReplyingTo}
            profileImage={profileImage}
          />
        ))}
      </View>
    )}

    {/* Input */}
    <CommentInput
      commentText={commentText}
      setCommentText={setCommentText}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      showEmojiPicker={showEmojiPicker}
      setShowEmojiPicker={setShowEmojiPicker}
      handleCommentSubmit={handleCommentSubmit}
      handleEmojiClick={handleEmojiClick}
      emojiList={emojiList}
      profileImage={profileImage}
    />
  </View>
);

export default CommentsSection;