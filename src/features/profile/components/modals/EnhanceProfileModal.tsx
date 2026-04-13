import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Star } from 'lucide-react-native';
 
interface EnhanceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
const enhancements = [
  {
    title: 'Premium Profile',
    description: 'Get a verified badge and stand out to employers and recruiters',
    icon: '⭐',
  },
  {
    title: 'Profile Banner',
    description: 'Add a custom banner image to make your profile more visually appealing',
    icon: '🖼️',
  },
  {
    title: 'Video Introduction',
    description: 'Record a 30-second video introduction to showcase your personality',
    icon: '🎥',
  },
  {
    title: 'Skills Endorsements',
    description: 'Get your skills endorsed by colleagues and connections',
    icon: '✨',
  },
];
 
const EnhanceProfileModal: React.FC<EnhanceProfileModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable
          className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-5 bg-[#4a3728]">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Enhance Profile</Text>
              <Text className="text-white/70 text-sm mt-0.5">
                Discover ways to make your profile stand out
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-white/10"
              activeOpacity={0.7}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
 
          {/* Scrollable Body */}
          <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
            <View className="gap-y-3">
              {enhancements.map((enhancement, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  className="flex-row items-start gap-x-4 p-4 bg-[#f6ede8]/60 rounded-xl border border-[#e0d8cf]"
                >
                  <Text className="text-3xl">{enhancement.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#4a3728]">
                      {enhancement.title}
                    </Text>
                    <Text className="text-sm text-[#4a3728]/70 mt-1 leading-5">
                      {enhancement.description}
                    </Text>
                  </View>
                  <Star size={20} color="#4a3728" opacity={0.3} style={{ marginTop: 2 }} />
                </TouchableOpacity>
              ))}
            </View>
            <View className="h-4" />
          </ScrollView>
 
          {/* Footer */}
          <View className="flex-row gap-x-3 px-5 py-4 border-t border-[#e0d8cf] bg-white">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 py-3 rounded-full border-2 border-[#e0d8cf] items-center justify-center"
            >
              <Text className="text-[#4a3728] font-semibold text-sm">Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 py-3 rounded-full bg-[#4a3728] items-center justify-center"
            >
              <Text className="text-white font-semibold text-sm">Explore Options</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default EnhanceProfileModal;