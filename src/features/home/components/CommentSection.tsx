// features/home/components/feed/CommentsSection.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, FlatList, Animated } from 'react-native';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  currentUserId?: string;
  currentUserName?: string;
  commentImage?: any;
  setCommentImage?: (v: any) => void;
  onPickCommentPhoto?: () => void;
  commentCount?: number;
  isSubmitting?: boolean;
  isLoadingComments?: boolean;
  commentUserReactions?: Record<string, string | null>;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeNumber = (val: any) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const PAGE_SIZE = 20;

// ─── Skeleton Item ────────────────────────────────────────────────────────────

const SkeletonItem = ({ opacity }: { opacity: Animated.Value }) => (
  <Animated.View style={{ opacity }} className="flex-row items-start gap-2 mb-3 px-4">
    <View className="w-9 h-9 rounded-xl bg-[#d4c4b5]/60" />
    <View className="flex-1 gap-1.5">
      <View className="w-24 h-3 rounded-full bg-[#d4c4b5]/60" />
      <View className="w-full h-3 rounded-full bg-[#d4c4b5]/40" />
      <View className="w-3/4 h-3 rounded-full bg-[#d4c4b5]/40" />
    </View>
  </Animated.View>
);

const LoadingSkeleton = () => {
  const anim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <View className="pt-4">
      {[1, 2, 3, 4].map((i) => <SkeletonItem key={i} opacity={anim} />)}
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  comments, postId, emojiList, profileImage,
  currentUserId, currentUserName,
  commentCount,
  commentImage, setCommentImage, onPickCommentPhoto,
  isSubmitting, isLoadingComments, commentUserReactions, onClose,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, comments.length));
  }, [comments.length]);

  const totalCount = safeNumber(commentCount ?? comments.length);

  const renderComment = useCallback(({ item: comment }: { item: any }) => {
    const commentId = comment.commentId || comment._id || comment.id;
    return (
      <CommentItem
        key={commentId}
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
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        userReaction={commentUserReactions?.[commentId] ?? null}
        onClose={onClose}
      />
    );
  }, [openCommentMenuIndex, editingCommentId, editCommentText, commentUserReactions, profileImage, currentUserId, currentUserName, onClose]);

  const ListFooter = () => (
    hasMore ? (
      <TouchableOpacity
        onPress={loadMore}
        className="py-3 items-center"
        activeOpacity={0.7}
      >
        <Text className="text-[#6b5643] text-xs font-semibold">
          Load {Math.min(PAGE_SIZE, comments.length - visibleCount)} more comments...
        </Text>
      </TouchableOpacity>
    ) : null
  );

  const ListEmpty = () => (
    <View className="items-center justify-center py-10 mt-10">
      <Text className="text-[#4a3728]/50 text-sm font-medium">
        Be the first to comment on this post.
      </Text>
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-[#f6ede8]">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#d4c4b5]/30">
            <View className="w-10" />
            <Text className="font-black text-lg text-[#4a3728]">
              {totalCount} Comment{totalCount !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 -mr-2 bg-[#4a3728]/5 rounded-full w-10 h-10 items-center justify-center"
            >
              <Text className="text-[#4a3728] font-black text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Comment list or skeleton */}
          {isLoadingComments ? (
            <LoadingSkeleton />
          ) : (
            <FlatList
              data={visibleComments}
              keyExtractor={(item) => item.commentId || item._id || item.id || String(Math.random())}
              renderItem={renderComment}
              ListEmptyComponent={ListEmpty}
              ListFooterComponent={ListFooter}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          )}

          {/* Input area fixed at bottom */}
          <View className="bg-white/80 border-t border-[#d4c4b5]/30 px-2 pt-2 pb-6">
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
              commentImage={commentImage}
              setCommentImage={setCommentImage}
              onPickCommentPhoto={onPickCommentPhoto}
              isSubmitting={isSubmitting}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CommentsSection;