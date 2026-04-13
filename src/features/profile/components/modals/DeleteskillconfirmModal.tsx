import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';

interface DeleteSkillConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
  isDeleting: boolean;
}

const DeleteSkillConfirmModal: React.FC<DeleteSkillConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  skillName,
  isDeleting,
}) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-5"
        onPress={!isDeleting ? onClose : undefined}
      >
        <Pressable
          className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-red-600">
            <View className="flex-row items-center gap-x-3">
              <AlertTriangle size={22} color="#fde047" />
              <Text className="text-xl font-bold text-white">Delete Skill</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              activeOpacity={0.7}
              className={`p-1.5 rounded-full bg-white/10 ${isDeleting ? 'opacity-50' : ''}`}
            >
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="px-5 py-6">
            <Text className="text-[#4a3728] text-base leading-6 mb-2">
              Are you sure you want to permanently delete{' '}
              <Text className="font-bold">{skillName}</Text>?
            </Text>
            <Text className="text-red-600 text-sm leading-5 mb-6">
              ⚠️ This action cannot be undone!
            </Text>

            {/* Buttons */}
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={isDeleting}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-full border-2 border-[#e0d8cf] items-center justify-center ${
                  isDeleting ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                disabled={isDeleting}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-full bg-red-600 flex-row items-center justify-center gap-x-2 ${
                  isDeleting ? 'opacity-60' : ''
                }`}
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-semibold text-sm">Deleting...</Text>
                  </>
                ) : (
                  <Text className="text-white font-semibold text-sm">Delete Permanently</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteSkillConfirmModal;