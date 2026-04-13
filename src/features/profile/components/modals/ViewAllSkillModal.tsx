import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Pin, Zap } from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Skill {
  skillId: string;
  skillName: string;
  category: string;
  skillStrength: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  isPinned: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface ViewAllSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStrengthLevel = (s: string) =>
  ({ beginner: 2, intermediate: 3, advanced: 4, expert: 5 }[s] ?? 3);

const getStrengthLabel = (s: string) =>
  ({ beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' }[s] ?? 'Intermediate');

const getStrengthPercentage = (s: string) =>
  ({ beginner: 40, intermediate: 60, advanced: 80, expert: 100 }[s] ?? 60);

// ─── Single Skill Card ────────────────────────────────────────────────────────
const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => (
  <View className="bg-[#e0d8cf]/50 rounded-2xl p-4 border border-[#e0d8cf]/60 mb-3">
    {/* Top Row */}
    <View className="flex-row items-start gap-x-3 mb-3">
      {/* Icon */}
      <View className="relative">
        <View className="w-11 h-11 bg-[#4a3728] rounded-xl items-center justify-center shadow-md">
          <Zap size={18} color="#f6ede8" />
        </View>
        {skill.isPinned && (
          <View className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7a5c3e] rounded-full items-center justify-center shadow-md">
            <Pin size={9} color="#f6ede8" fill="#f6ede8" />
          </View>
        )}
      </View>

      {/* Name + Category */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-bold text-[#4a3728]" numberOfLines={1}>
          {skill.skillName}
        </Text>
        <Text className="text-xs text-[#4a3728]/60 mt-0.5" numberOfLines={1}>
          {skill.category}
        </Text>
      </View>
    </View>

    {/* Progress Bar */}
    <View className="w-full h-1.5 bg-[#e0d8cf] rounded-full overflow-hidden mb-2">
      <View
        className="h-full bg-[#4a3728] rounded-full"
        style={{ width: `${getStrengthPercentage(skill.skillStrength)}%` }}
      />
    </View>

    {/* Strength + Years */}
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-x-1.5">
        <Text className="text-xs text-[#4a3728]/60 font-medium">
          {getStrengthLabel(skill.skillStrength)}
        </Text>
        <View className="flex-row gap-x-0.5">
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < getStrengthLevel(skill.skillStrength) ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'
              }`}
            />
          ))}
        </View>
      </View>
      <Text className="text-xs text-[#4a3728]/60 font-medium">
        {skill.yearsOfExperience}+ {skill.yearsOfExperience === 1 ? 'Year' : 'Years'}
      </Text>
    </View>
  </View>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const ViewAllSkillsModal: React.FC<ViewAllSkillsModalProps> = ({ isOpen, onClose, skills }) => (
  <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable
      className="flex-1 bg-black/50 justify-center items-center px-3"
      onPress={onClose}
    >
      <Pressable
        className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90%]"
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-5 bg-[#4a3728]">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">All Skills</Text>
            <Text className="text-white/70 text-sm mt-0.5">
              View and manage all your professional skills
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="p-2 rounded-full bg-white/10"
          >
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
          {skills.length === 0 ? (
            <View className="items-center py-14">
              <Text className="text-5xl mb-3">📭</Text>
              <Text className="text-[#4a3728] font-semibold text-base mb-1">No skills yet</Text>
              <Text className="text-[#4a3728]/60 text-sm">Add your first skill to get started</Text>
            </View>
          ) : (
            skills.map((skill) => <SkillCard key={skill.skillId} skill={skill} />)
          )}
          <View className="h-4" />
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-[#e0d8cf] bg-white">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="py-3 rounded-full border-2 border-[#e0d8cf] items-center"
          >
            <Text className="text-[#4a3728] font-semibold text-sm">Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default ViewAllSkillsModal;