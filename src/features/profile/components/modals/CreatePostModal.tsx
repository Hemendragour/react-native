// features/profile/components/CreatePostModal.tsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostFormData {
  title: string;
  content: string;
  images: any[];
  videos: any[];
  documents: any[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ImageIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VideoIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RemoveIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// ─── Attach Button ────────────────────────────────────────────────────────────

const AttachButton = ({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) => (
  <TouchableOpacity
    className="flex-row items-center gap-2 px-4 py-2.5 bg-brand-border/30 border-2 border-dashed border-brand-dark/30 rounded-xl"
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon}
    <Text className="text-[#4a3728] text-sm font-medium">{label}</Text>
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '', content: '', images: [], videos: [], documents: [],
  });
  const [errors, setErrors]     = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setFormData({ title: '', content: '', images: [], videos: [], documents: [] });
    setErrors({ title: '', content: '' });
  };

  const handleClose = () => { reset(); onClose(); };

  const validate = () => {
    const errs = { title: '', content: '' };
    if (!formData.title.trim())   errs.title   = 'Title is required';
    if (!formData.content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    return !errs.title && !errs.content;
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 5 }, (res) => {
      if (res.didCancel || !res.assets) return;
      setFormData(prev => ({ ...prev, images: [...prev.images, ...res.assets!] }));
    });
  };

  const handlePickVideo = () => {
    launchImageLibrary({ mediaType: 'video', selectionLimit: 2 }, (res) => {
      if (res.didCancel || !res.assets) return;
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...res.assets!] }));
    });
  };

  const removeImage = (idx: number) =>
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const removeVideo = (idx: number) =>
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);
      // await AuthService.createPost(formData);  ← uncomment when API ready
      onSubmit(formData);
      reset();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#f6ede8] rounded-t-3xl max-h-[92%]">

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-brand-dark rounded-t-3xl">
            <View>
              <Text className="text-[#4a3728] text-lg font-bold">Create Post</Text>
              <Text className="text-[#8b6f47] text-xs mt-0.5">Share with your network</Text>
            </View>
            <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={handleClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="px-5 pt-5" showsVerticalScrollIndicator={false}>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-[#4a3728] text-sm font-semibold mb-1.5">
                Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(v) => { setFormData(p => ({ ...p, title: v })); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
                placeholder="Enter post title..."
                placeholderTextColor="rgba(74,55,40,0.4)"
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 text-brand-dark text-sm ${errors.title ? 'border-red-400' : 'border-[#e0d8cf]'}`}
              />
              {errors.title ? <Text className="text-red-500 text-xs mt-1">{errors.title}</Text> : null}
            </View>

            {/* Content */}
            <View className="mb-4">
              <Text className="text-[#4a3728] text-sm font-semibold mb-1.5">
                Content <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.content}
                onChangeText={(v) => { setFormData(p => ({ ...p, content: v })); if (errors.content) setErrors(p => ({ ...p, content: '' })); }}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(74,55,40,0.4)"
                multiline
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white/50 text-brand-dark text-sm ${errors.content ? 'border-red-400' : 'border-[#e0d8cf]'}`}
                style={{ height: 120, textAlignVertical: 'top' }}
              />
              {errors.content ? <Text className="text-red-500 text-xs mt-1">{errors.content}</Text> : null}
            </View>

            {/* Attach Images */}
            <View className="mb-4 gap-2">
              <AttachButton label="Attach Images" icon={<ImageIcon />} onPress={handlePickImage} />
              {formData.images.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {formData.images.map((img, idx) => (
                    <View key={idx} className="relative">
                      <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-xl" resizeMode="cover" />
                      <TouchableOpacity
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                        onPress={() => removeImage(idx)}
                      >
                        <RemoveIcon />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Attach Videos */}
            <View className="mb-4 gap-2 border-[#e0d8cf]">
              <AttachButton label="Attach Videos" icon={<VideoIcon />} onPress={handlePickVideo} />
              {formData.videos.map((vid, idx) => (
                <View key={idx} className="flex-row items-center justify-between bg-brand-border/30  p-3 rounded-xl">
                  <Text className="text-brand-dark text-sm flex-1" numberOfLines={1}>{vid.fileName || 'Video'}</Text>
                  <TouchableOpacity onPress={() => removeVideo(idx)}>
                    <Text className="text-red-500 text-xs font-medium ml-2">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View className="h-6" />
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 px-5 py-4 bg-[#f6ede8] border-t border-[#e0d8cf]">
            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-[#e0d8cf] items-center"
              onPress={handleClose}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text className="text-[#4a3728] text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-[#4a3728] items-center"
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving
                ? <ActivityIndicator color="#f6ede8" />
                : <Text className="text-[#f6ede8] text-sm font-semibold">Create Post</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default CreatePostModal;