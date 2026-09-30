// features/home/components/feed/CreatePostPrompt.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ImageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VideoIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const ArticleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#4a3728" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatePostPromptProps {
  setIsPostCreatorOpen: (open: boolean) => void;
  profileImage?: string;
  onPickPhotoDirect?: () => void;
  onPickVideoDirect?: () => void;
  onPickArticleDirect?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreatePostPrompt: React.FC<CreatePostPromptProps> = ({
  setIsPostCreatorOpen,
  profileImage,
  onPickPhotoDirect,
  onPickVideoDirect,
  onPickArticleDirect,
}) => (
  <View className="bg-[#f6ede8]/80 rounded-3xl border border-[#e0d8cf]/50 p-4 mx-3 mb-3">

    {/* Top row — avatar + prompt text */}
    <TouchableOpacity
      className="flex-row items-center gap-3 mb-3"
      onPress={() => setIsPostCreatorOpen(true)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: profileImage || DEFAULT_AVATAR }}
        className="w-12 h-12 rounded-2xl border-1 border-[#6b5643]"
        resizeMode="cover"
      />
      <View className="flex-1 bg-white/40 rounded-2xl px-4 py-3 border-2  border-[#d4c4b5]">
        <Text className="text-[#4a3728] text-sm font-semibold">Create a post...</Text>
      </View>
    </TouchableOpacity>

    {/* Bottom row — quick action buttons */}
    <View className="flex-row items-center justify-between border-t border-[#4a3728]/20 pt-3">
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center py-2 px-1 rounded-xl active:bg-black/5"
        onPress={() => {
          if (onPickPhotoDirect) onPickPhotoDirect();
          else setIsPostCreatorOpen(true);
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <View pointerEvents="none" className="flex-row items-center gap-1.5">
          <ImageIcon />
          <Text className="text-[#4a3728] text-xs font-semibold">Photo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center py-2 px-1 rounded-xl active:bg-black/5"
        onPress={() => {
          if (onPickVideoDirect) onPickVideoDirect();
          else setIsPostCreatorOpen(true);
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <View pointerEvents="none" className="flex-row items-center gap-1.5">
          <VideoIcon />
          <Text className="text-[#4a3728] text-xs font-semibold">Video</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center py-2 px-1 rounded-xl active:bg-black/5"
        onPress={() => {
          if (onPickArticleDirect) onPickArticleDirect();
          else setIsPostCreatorOpen(true);
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <View pointerEvents="none" className="flex-row items-center gap-1.5">
          <ArticleIcon />
          <Text className="text-[#4a3728] text-xs font-semibold">Article / Doc</Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default CreatePostPrompt;