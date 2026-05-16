import {  Text, View ,ActivityIndicator} from 'react-native'
import React from 'react'
import PostCard from './PostCard';


interface FeedContainerProps {
  posts: any[];
  isLoadingPosts: boolean;
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

const PostSkeleton = () => (
  <View className="bg-brand-light/95 rounded-3xl border border-brand-dark/10 p-4 mx-3 mb-4">
    {/* Header skeleton */}
    <View className="flex-row items-center gap-3 mb-4">
      <View className="w-12 h-12 rounded-2xl bg-brand-border" />
      <View className="flex-1 gap-2">
        <View className="h-3.5 bg-brand-border rounded-full w-32" />
        <View className="h-3 bg-brand-border rounded-full w-24" />
      </View>
    </View>
    {/* Content skeleton */}
    <View className="gap-2 mb-4">
      <View className="h-3 bg-brand-border rounded-full" />
      <View className="h-3 bg-brand-border rounded-full w-5/6" />
      <View className="h-3 bg-brand-border rounded-full w-4/6" />
    </View>
    {/* Image skeleton */}
    <View className="h-48 bg-brand-border rounded-2xl mb-4" />
    {/* Actions skeleton */}
    <View className="flex-row justify-between pt-3 border-t border-brand-border">
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
      <View className="h-3 bg-brand-border rounded-full w-14" />
    </View>
  </View>
);


export default function FeedContainer(props: FeedContainerProps) {
    const{posts=[], isLoadingPosts=false}=props;

      // Loading — show 3 skeletons

    if (isLoadingPosts) {
    return (
      <View>
        {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="py-20 items-center gap-3">
        <ActivityIndicator color="#4a3728" />
        <Text className="text-[#4a3728] text-base">No posts available yet</Text>
        <Text className="text-brand-dark/40 text-sm">Check back later for updates!</Text>
      </View>
    );
  }


  return (
    <View>
      {posts.map((post:any,index:number)=>(
        <PostCard  key={post.entryId || post.postId || index}
          post={post}
          index={index}
          currentUserId={props.currentUserId}
          likedPosts={props.likedPosts}
          handleLike={props.handleLike}
          openMenuIndex={props.openMenuIndex}
          openRepostIndex={props.openRepostIndex}
          openCommentsIndex={props.openCommentsIndex}
          commentText={props.commentText}
          setCommentText={props.setCommentText}
          replyingTo={props.replyingTo}
          setReplyingTo={props.setReplyingTo}
          openCommentMenuIndex={props.openCommentMenuIndex}
          editingCommentId={props.editingCommentId}
          editCommentText={props.editCommentText}
          setEditCommentText={props.setEditCommentText}
          showEmojiPicker={props.showEmojiPicker}
          setShowEmojiPicker={props.setShowEmojiPicker}
          handlePostAction={props.handlePostAction}
          togglePostMenu={props.togglePostMenu}
          toggleRepostMenu={props.toggleRepostMenu}
          toggleComments={props.toggleComments}
          handleCommentSubmit={props.handleCommentSubmit}
          handleReply={props.handleReply}
          handleCommentReaction={props.handleCommentReaction}
          toggleCommentMenu={props.toggleCommentMenu}
          handleCommentAction={props.handleCommentAction}
          handleEditSubmit={props.handleEditSubmit}
          handleEmojiClick={props.handleEmojiClick}
          postComments={props.postComments}
          postCommentCounts={props.postCommentCounts}
          emojiList={props.emojiList}
          profileImage={props.profileImage}
          onOpenWithPerspectiveModal={props.onOpenWithPerspectiveModal}
          handleRepostInstant={props.handleRepostInstant}
        />
      ))}
    </View>
  )
}
