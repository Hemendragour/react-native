import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Image, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onSubmit: (thoughts: string) => void;
}

const RepostModal: React.FC<RepostModalProps> = ({ isOpen, onClose, post, onSubmit }) => {
  const [thoughts, setThoughts] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(thoughts);
      setThoughts('');
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!isOpen || !post) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="bg-[#f6ede8] rounded-t-[32px] overflow-hidden"
          style={{ maxHeight: '90%' }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-brand-dark/10 bg-[#f6ede8]">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-brand-dark/5">
                <CloseIcon />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-brand-dark">Repost with thoughts</Text>
            </View>
          </View>

          <ScrollView className="p-6" keyboardShouldPersistTaps="handled">
            {/* Input area */}
            {/* OLD CODE:
            <TextInput
              value={thoughts}
              onChangeText={setThoughts}
              placeholder="Add your thoughts..."
              placeholderTextColor="rgba(74,55,40,0.5)"
              multiline
              className="text-base text-brand-dark min-h-[100px]"
              style={{ textAlignVertical: 'top' }}
              autoFocus
            />
            */}
            
            {/* NEW CODE: */}
            <View className="bg-white/40 p-4 rounded-3xl border border-brand-dark/5 shadow-sm mb-2">
              <TextInput
                value={thoughts}
                onChangeText={setThoughts}
                placeholder="Share your thoughts on this..."
                placeholderTextColor="rgba(74,55,40,0.5)"
                multiline
                className="text-[15px] text-[#4a3728] min-h-[100px] font-medium leading-relaxed"
                style={{ textAlignVertical: 'top' }}
                autoFocus
              />
            </View>

            {/* Quoted Post Preview */}
            {/* OLD CODE:
            <View className="mt-4 p-4 rounded-2xl border border-brand-dark/20 bg-white/50">
              <View className="flex-row items-center gap-3 mb-3">
                <Image
                  source={{ uri: post.authorAvatar || post.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                  className="w-10 h-10 rounded-full"
                />
                <View>
                  <Text className="font-bold text-brand-dark">
                    {post.authorName || post.user}
                  </Text>
                  <Text className="text-xs text-brand-dark/60">
                    {post.time || 'Just now'}
                  </Text>
                </View>
              </View>
              
              {post.content && (
                <Text className="text-brand-dark text-sm mb-3" numberOfLines={3}>
                  {post.content}
                </Text>
              )}
              
              {(post.image || post.images?.[0] || post.media?.[0]?.url) && (
                <Image
                  source={{ uri: post.image || post.images?.[0] || post.media?.[0]?.url }}
                  className="w-full h-32 rounded-xl"
                  resizeMode="cover"
                />
              )}
            </View>
            */}

            {/* NEW CODE: */}
            <View className="mt-2 p-4 rounded-3xl border border-[#d4c4b5]/80 bg-[#fdfbf9]/60 shadow-sm overflow-hidden">
              <View className="flex-row items-center gap-3 mb-3 border-b border-[#d4c4b5]/30 pb-3">
                <Image
                  source={{ uri: post.authorAvatar || post.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                  className="w-10 h-10 rounded-full border border-brand-dark/10"
                />
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-extrabold text-[14px] text-brand-dark" numberOfLines={1}>
                      {post.authorName || post.user}
                    </Text>
                    <Text className="text-brand-dark/40 text-[10px]">•</Text>
                    <Text className="text-xs font-medium text-brand-dark/60">
                      {post.time || 'Just now'}
                    </Text>
                  </View>
                  {(post.authorHeadline || post.role || post.headline) && (
                    <Text className="text-[11px] text-brand-dark/60 mt-0.5" numberOfLines={1}>
                      {post.authorHeadline || post.role || post.headline}
                    </Text>
                  )}
                </View>
              </View>
              
              {post.content && (
                <Text className="text-[#4a3728] text-[13px] leading-relaxed mb-3" numberOfLines={3}>
                  {post.content}
                </Text>
              )}
              
              {(() => {
                const imgUri = typeof post.image === 'string' ? post.image : 
                               (post.images?.[0]?.cloudinarySecureUrl || post.images?.[0]?.url || (typeof post.images?.[0] === 'string' ? post.images?.[0] : null)) || 
                               post.media?.[0]?.url;
                if (!imgUri) return null;
                return (
                  <Image
                    source={{ uri: imgUri }}
                    className="w-full h-40 rounded-2xl"
                    resizeMode="cover"
                  />
                );
              })()}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-8 w-full py-4 rounded-3xl items-center justify-center ${isSubmitting ? 'bg-[#4a3728]/70' : 'bg-[#4a3728]'}`}
              style={{ 
                shadowColor: '#4a3728', 
                shadowOffset: { width: 0, height: 8 }, 
                shadowOpacity: 0.25, 
                shadowRadius: 16, 
                elevation: 8 
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-extrabold text-[16px] tracking-wide">Share Thoughts</Text>
              )}
            </TouchableOpacity>
            
            <View className="h-20" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default RepostModal;
