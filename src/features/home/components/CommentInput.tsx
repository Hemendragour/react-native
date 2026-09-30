// features/home/components/feed/CommentInput.tsx

import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import EmojiPicker, { EMOJI_LIST } from './Emojipicker';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ImageIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EmojiIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentInputProps {
  commentText: string;
  setCommentText: (v: string) => void;
  replyingTo: string | null;
  setReplyingTo?: (v: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;
  handleCommentSubmit: () => void;
  handleEmojiClick: (emoji: string) => void;
  emojiList?: string[];
  profileImage?: string;
  commentImage?: any;
  setCommentImage?: (v: any) => void;
  onPickCommentPhoto?: () => void;
  isSubmitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CommentInput: React.FC<CommentInputProps> = ({
  commentText, setCommentText,
  replyingTo, setReplyingTo,
  showEmojiPicker, setShowEmojiPicker,
  handleCommentSubmit, handleEmojiClick,
  emojiList = EMOJI_LIST,
  profileImage,
  commentImage, setCommentImage, onPickCommentPhoto,
  isSubmitting,
}) => (
  <View className="bg-brand-border/30 rounded-2xl p-3 mt-3">
    <View className="flex-row gap-2">

      {/* Avatar */}
      <Image
        source={{ uri: profileImage || 'https://ui-avatars.com/api/?name=Me&background=e0d8cf&color=4a3728&size=128' }}
        className="w-9 h-9 rounded-xl border-2 border-[#6b5643]"
        resizeMode="cover"
      />

      <View className="flex-1 gap-2">

        {/* Replying to indicator */}
        {replyingTo && (
          <View className="flex-row items-center justify-between bg-white/50 px-3 py-1.5 rounded-lg">
            <Text className="text-brand-dark/70 text-xs">Replying to comment...</Text>
            <TouchableOpacity onPress={() => setReplyingTo?.(null)} activeOpacity={0.7}>
              <Text className="text-red-500 text-xs font-semibold ml-2">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input + Post button */}
        <View className="flex-row gap-2">
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
            placeholderTextColor="rgba(74,55,40,0.5)"
            className="flex-1 bg-white border border-brand-border/50 rounded-xl px-3 py-2 text-sm"
            style={{ color: '#4a3728' }}
            returnKeyType="send"
            onSubmitEditing={handleCommentSubmit}
            multiline
            editable={!isSubmitting}
          />
          <TouchableOpacity
            className="bg-brand-dark px-4 rounded-xl items-center justify-center"
            onPress={handleCommentSubmit}
            activeOpacity={0.85}
            disabled={isSubmitting}
            style={isSubmitting && { opacity: 0.6 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#f6ede8" size="small" />
            ) : (
              <Text className="text-brand-light text-sm font-semibold">Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {commentImage && (
          <View className="relative self-start mb-2">
            <Image
              source={{ uri: commentImage.uri }}
              className="w-20 h-20 rounded-lg border border-brand-border/50"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
              onPress={() => setCommentImage?.(null)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold leading-3">x</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action buttons — Photo, GIF, Emoji */}
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-light/50"
              onPress={onPickCommentPhoto}
              activeOpacity={0.7}
              disabled={isSubmitting}
              style={isSubmitting && { opacity: 0.5 }}
            >
              <ImageIcon />
              <Text className="text-brand-dark/70 text-xs font-medium">Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-light/50"
              onPress={() => !isSubmitting && setShowEmojiPicker(!showEmojiPicker)}
              activeOpacity={0.7}
              disabled={isSubmitting}
              style={isSubmitting && { opacity: 0.5 }}
            >
              <EmojiIcon />
              <Text className="text-brand-dark/70 text-xs font-medium">Emoji</Text>
            </TouchableOpacity>
          </View>

          {isSubmitting && (
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded bg-[#7a5c3e]/10">
              <ActivityIndicator size="small" color="#7a5c3e" />
              <Text className="text-[#7a5c3e] text-[10px] font-semibold">Uploading...</Text>
            </View>
          )}
        </View>
      </View>
    </View>

    {/* Emoji picker modal */}
    <EmojiPicker
      isVisible={showEmojiPicker}
      onClose={() => setShowEmojiPicker(false)}
      onEmojiClick={handleEmojiClick}
      emojiList={emojiList}
    />
  </View>
);

export default CommentInput;