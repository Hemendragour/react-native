import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';

interface PinLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinLimitModal: React.FC<PinLimitModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-5"
        onPress={onClose}
      >
        <Pressable
          className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-[#4a3728]">
            <View className="flex-row items-center gap-x-3">
              <AlertCircle size={22} color="#fde047" />
              <Text className="text-xl font-bold text-white">Pin Limit Reached</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="p-1.5 rounded-full bg-white/10"
            >
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="px-5 py-6">
            <Text className="text-[#4a3728] text-base leading-6 mb-6">
              You can only pin <Text className="font-bold">2 skills</Text> at a time.{'\n'}
              Please unpin an existing skill before pinning a new one.
            </Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              className="w-full py-3 rounded-full bg-[#4a3728] items-center justify-center"
            >
              <Text className="text-white font-semibold text-sm">Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PinLimitModal;