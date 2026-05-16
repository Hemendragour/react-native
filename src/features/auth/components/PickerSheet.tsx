import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface PickerSheetProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

/**
 * Reusable bottom-sheet picker — replaces <select> dropdowns across all signup steps.
 * Used in: WorkingJobDetails, UpdateSkillModal, AddSkillModal
 */
const PickerSheet: React.FC<PickerSheetProps> = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
      <Pressable
        className="bg-white rounded-t-3xl overflow-hidden"
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-bold text-[#4a3728]">{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={18} color="#4a3728" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <ScrollView className="max-h-72" showsVerticalScrollIndicator={false}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => { onSelect(opt.value); onClose(); }}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between px-5 py-4 border-b border-gray-50 ${
                selected === opt.value ? 'bg-[#f6ede8]' : ''
              }`}
            >
              <Text
                className={`text-sm ${
                  selected === opt.value
                    ? 'font-bold text-[#4a3728]'
                    : 'text-gray-700'
                }`}
              >
                {opt.label}
              </Text>
              {selected === opt.value && (
                <Text className="text-[#4a3728] font-bold">✓</Text>
              )}
            </TouchableOpacity>
          ))}
          <View className="h-4" />
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

export default PickerSheet;