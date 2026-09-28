// features/profile/components/UpdatePostModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AuthService from '../../../../services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpdatePostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentContent?: string;
  onUpdate: (postId: string, newTitle: string, newContent: string) => void;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdatePostModal: React.FC<UpdatePostModalProps> = ({
  postId, isOpen, onClose, currentTitle = '', currentContent = '', onUpdate,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const [content, setContent] = useState(currentContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
    setContent(currentContent);
  }, [currentTitle, currentContent, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Post must have a title or content.');
      return;
    }
    try {
      setIsSubmitting(true);
      await AuthService.updatePost(postId, { title: title.trim(), content: content.trim() });
      onUpdate(postId, title.trim(), content.trim());
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#f6ede8] rounded-t-3xl max-h-[90%]">

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-brand-dark rounded-t-3xl">
            <Text className="text-[#4a3728] text-lg font-bold text-white">Edit Post</Text>
            <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={onClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView className="p-5">
            <Text className="text-[#4a3728] text-sm font-semibold mb-2">Post Title (Optional)</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter your post title here..."
              placeholderTextColor="rgba(74,55,40,0.4)"
              selectionColor="#4a3728"
              cursorColor="#4a3728"
              style={{ color: '#4a3728' }}
              className="w-full px-4 py-3 border border-[#e0d8cf] rounded-xl text-[#4a3728] text-sm bg-white/50 mb-4"
            />
            
            <Text className="text-[#4a3728] text-sm font-semibold mb-2">Post Content</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What do you want to talk about?"
              placeholderTextColor="rgba(74,55,40,0.4)"
              multiline
              selectionColor="#4a3728"
              cursorColor="#4a3728"
              className="w-full px-4 py-3 border border-[#e0d8cf] rounded-xl text-[#4a3728] text-sm bg-white/50"
              style={{ minHeight: 120, textAlignVertical: 'top', color: '#4a3728' }}
            />
            <Text className="text-brand-dark/50 text-xs mt-1.5 mb-5">{content.length} characters</Text>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3  px-5 py-4 bg-[#f6ede8] border-t border-[#e0d8cf]">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-brand-border/30 items-center"
              onPress={onClose}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text className="text-[#4a3728] text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-[#4a3728] items-center flex-row justify-center gap-2"
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting
                ? <ActivityIndicator color="#f6ede8" size="small" />
                : <Text className="text-[#f6ede8] text-sm font-semibold">Update Post</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default UpdatePostModal;