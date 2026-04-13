// features/profile/components/UpdatePostModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpdatePostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onUpdate: (postId: string, newTitle: string) => void;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UpdatePostModal: React.FC<UpdatePostModalProps> = ({
  postId, isOpen, onClose, currentTitle, onUpdate,
}) => {
  const [title, setTitle]           = useState(currentTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }
    try {
      setIsSubmitting(true);
      // await AuthService.updatePost(postId, { title: title.trim() }); ← uncomment when API ready
      onUpdate(postId, title.trim());
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
        <View className="bg-[#f6ede8] rounded-t-3xl">

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-brand-dark rounded-t-3xl">
            <Text className="text-[#4a3728] text-lg font-bold">Update Post Title</Text>
            <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={onClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="p-5">
            <Text className="text-[#4a3728] text-sm font-semibold mb-2">Post Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter your post title here..."
              placeholderTextColor="rgba(74,55,40,0.4)"
              multiline
              className="w-full px-4 py-3 border-2 border-[#e0d8cf] rounded-xl text-brand-dark text-sm bg-white/50"
              style={{ height: 100, textAlignVertical: 'top' }}
            />
            <Text className="text-brand-dark/50 text-xs mt-1.5">{title.length} characters</Text>
          </View>

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
                : <Text className="text-[#f6ede8] text-sm font-semibold">Update</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default UpdatePostModal;