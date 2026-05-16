// features/home/components/feed/EmojiPicker.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const EMOJI_LIST = [
  '😀','😂','😍','🥰','😎','🤩','😭','😤',
  '👍','👎','❤️','🔥','💯','🎉','👏','🙏',
  '😊','🤔','😅','🥳','😴','😱','🤗','😇',
  '💪','✨','🚀','💡','🎯','📌','💬','🌟',
];

interface EmojiPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onEmojiClick: (emoji: string) => void;
  emojiList?: string[];
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isVisible, onClose, onEmojiClick, emojiList = EMOJI_LIST,
}) => (
  <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/30" onPress={onClose}>
      <Pressable
        className="absolute bottom-24 left-4 right-4 bg-white rounded-2xl border border-brand-border p-3"
        onPress={() => {}}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-brand-dark text-sm font-bold">Pick an emoji</Text>
          <TouchableOpacity
            className="w-7 h-7 rounded-lg bg-brand-border/50 items-center justify-center"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text className="text-brand-dark text-xs font-bold">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View className="flex-row flex-wrap gap-1">
          {emojiList.map((emoji, idx) => (
            <TouchableOpacity
              key={idx}
              className="w-10 h-10 rounded-xl bg-brand-light items-center justify-center"
              onPress={() => { onEmojiClick(emoji); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default EmojiPicker;
export { EMOJI_LIST };