// features/home/components/feed/CommentItem.tsx

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DotsIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#4a3728">
    <Path d="M12 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </Svg>
);

const REACTIONS = ['❤️', '👍', '😂', '🔥', '👏'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: any;
  openCommentMenuIndex: any;
  editingCommentId: any;
  editCommentText: any;
  setEditCommentText: (v: string) => void;
  handleCommentReaction: (id: string, emoji: string) => void;
  toggleCommentMenu: (id: string) => void;
  handleCommentAction: (action: string, comment: any) => void;
  handleEditSubmit: (id: string) => void;
  handleReply: (id: string) => void;
  setReplyingTo?: (id: string | null) => void;
  profileImage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CommentItem: React.FC<CommentItemProps> = ({
  comment, openCommentMenuIndex, editingCommentId,
  editCommentText, setEditCommentText,
  handleCommentReaction, toggleCommentMenu,
  handleCommentAction, handleEditSubmit, handleReply,
}) => {
  const commentId  = comment.commentId || comment._id || comment.id;
  const isMenuOpen = openCommentMenuIndex === commentId;
  const isEditing  = editingCommentId === commentId;

  return (
    <View className="bg-brand-border/30 rounded-2xl p-3 mb-2">
      <View className="flex-row items-start gap-2">

        {/* Avatar */}
        <Image
          source={{ uri: comment.avatar || 'https://i.pravatar.cc/150?img=10' }}
          className="w-9 h-9 rounded-xl border border-[#6b5643]"
          resizeMode="cover"
        />

        <View className="flex-1">
          {/* Name + time + menu */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-brand-dark text-xs font-bold">
                {comment.user || comment.authorName || 'User'}
              </Text>
              <Text className="text-brand-dark/55 text-xs">
                {comment.time || comment.timeAgo || ''}
              </Text>
            </View>

            {/* Menu */}
            <View>
              <TouchableOpacity
                className="p-1 rounded-lg"
                onPress={() => toggleCommentMenu(commentId)}
                activeOpacity={0.7}
              >
                <DotsIcon />
              </TouchableOpacity>

              {isMenuOpen && (
                <View className="absolute right-0 top-6 w-36 bg-brand-light rounded-xl border border-brand-border shadow-lg z-50 overflow-hidden">
                  <TouchableOpacity
                    className="px-3 py-2.5 border-b border-brand-border/30"
                    onPress={() => handleCommentAction('edit', comment)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-brand-dark text-xs font-medium">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-3 py-2.5"
                    onPress={() => handleCommentAction('delete', comment)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-red-600 text-xs font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Edit mode or comment text */}
          {isEditing ? (
            <View className="mb-2">
              <TextInput
                value={editCommentText}
                onChangeText={setEditCommentText}
                className="bg-white border border-brand-border rounded-xl px-3 py-2 text-brand-dark text-xs"
                onSubmitEditing={() => handleEditSubmit(commentId)}
                returnKeyType="done"
              />
              <View className="flex-row gap-2 mt-1.5">
                <TouchableOpacity
                  className="bg-[#6b5643] px-3 py-1.5 rounded-lg"
                  onPress={() => handleEditSubmit(commentId)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs font-semibold">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-brand-border px-3 py-1.5 rounded-lg"
                  onPress={() => handleCommentAction('cancelEdit', comment)}
                  activeOpacity={0.7}
                >
                  <Text className="text-brand-dark text-xs font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text className="text-brand-dark/80 text-xs leading-4 mb-2">
              {comment.content || comment.text || ''}
            </Text>
          )}

          {/* Reaction pills */}
          <View className="flex-row items-center gap-1 flex-wrap mb-1">
            {REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                className={`flex-row items-center gap-0.5 px-2 py-1 rounded-lg ${comment.reactions?.[emoji] ? 'bg-brand-border' : 'bg-transparent'}`}
                onPress={() => handleCommentReaction(commentId, emoji)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13 }}>{emoji}</Text>
                {comment.reactions?.[emoji] ? (
                  <Text className="text-brand-dark text-xs font-semibold">
                    {comment.reactions[emoji]}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="ml-2"
              onPress={() => handleReply(commentId)}
              activeOpacity={0.7}
            >
              <Text className="text-brand-dark/60 text-xs font-semibold">Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <View className="ml-3 mt-1 gap-2">
              {comment.replies.map((reply: any) => (
                <View
                  key={reply.id || reply._id}
                  className="bg-white/50 rounded-xl p-2.5 flex-row items-start gap-2"
                >
                  <Image
                    source={{ uri: reply.avatar || 'https://i.pravatar.cc/150?img=20' }}
                    className="w-7 h-7 rounded-lg border border-[#6b5643]"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-0.5">
                      <Text className="text-brand-dark text-xs font-bold">{reply.user}</Text>
                      <Text className="text-brand-dark/50 text-xs">{reply.time}</Text>
                    </View>
                    <Text className="text-brand-dark/80 text-xs">{reply.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CommentItem;