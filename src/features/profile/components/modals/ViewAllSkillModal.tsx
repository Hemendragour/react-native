import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { X, Pin, Zap, MoreVertical, Archive, Trash2, Edit } from 'lucide-react-native';

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
  onUpdate: (skillId: string) => void;
  onPin: (skillId: string, isPinned: boolean) => void;
  onArchive: (skillId: string) => void;
  onDelete: (skillId: string) => void;
  loadingActionId?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStrengthLevel = (s: string) =>
  ({ beginner: 2, intermediate: 3, advanced: 4, expert: 5 }[s] ?? 3);

const getStrengthLabel = (s: string) =>
  ({ beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' }[s] ?? 'Intermediate');

const getStrengthPercentage = (s: string) =>
  ({ beginner: 40, intermediate: 60, advanced: 80, expert: 100 }[s] ?? 60);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const ViewAllSkillsModal: React.FC<ViewAllSkillsModalProps> = ({ 
  isOpen, 
  onClose, 
  skills,
  onUpdate,
  onPin,
  onArchive,
  onDelete,
  loadingActionId 
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuToggle = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  // Close menu when modal closes
  React.useEffect(() => {
    if (!isOpen) closeMenu();
  }, [isOpen]);

  const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
    const isActionLoading = loadingActionId === skill.skillId;
    const isMenuOpen = openMenuId === skill.skillId;

    return (
      <View className={`mb-3 ${isActionLoading ? 'opacity-60' : 'opacity-100'}`}>
        <View className="bg-[#e0d8cf]/50 rounded-2xl p-4 border border-[#e0d8cf]/60">
          {/* Top Row */}
          <View className="flex-row items-start gap-x-3 mb-3">
            {/* Icon */}
            <View className="relative">
              <View className="w-11 h-11 bg-[#4a3728] rounded-xl items-center justify-center shadow-md">
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#f6ede8" />
                ) : (
                  <Zap size={18} color="#f6ede8" />
                )}
              </View>
              {skill.isPinned && !isActionLoading && (
                <View className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#7a5c3e] rounded-full items-center justify-center shadow-md">
                  <Pin size={9} color="#f6ede8" fill="#f6ede8" />
                </View>
              )}
            </View>

            {/* Name + Category */}
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-[#4a3728] flex-1 mr-2" numberOfLines={1}>
                  {skill.skillName}
                </Text>
                
                {/* Three-dot Menu */}
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => handleMenuToggle(skill.skillId)}
                    activeOpacity={0.7}
                    className="p-1.5 rounded-lg"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MoreVertical size={16} color="#4a3728" />
                  </TouchableOpacity>
                </View>
              </View>

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

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            <Pressable
              className="absolute inset-0 z-10"
              style={{ top: -9999, left: -9999, right: -9999, bottom: -9999, position: 'absolute' }}
              onPress={closeMenu}
            />
            <View className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-[#e0d8cf]/60 py-1.5 z-20">
              <TouchableOpacity
                onPress={() => { closeMenu(); onUpdate(skill.skillId); }}
                activeOpacity={0.8}
                className="flex-row items-center gap-x-3 px-4 py-3"
              >
                <Edit size={16} color="#4a3728" />
                <Text className="text-sm font-medium text-[#4a3728]">Update Skill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { closeMenu(); onPin(skill.skillId, skill.isPinned); }}
                activeOpacity={0.8}
                className="flex-row items-center gap-x-3 px-4 py-3"
              >
                <Pin size={16} color="#4a3728" />
                <Text className="text-sm font-medium text-[#4a3728]">
                  {skill.isPinned ? 'Unpin Skill' : 'Pin Skill'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { closeMenu(); onArchive(skill.skillId); }}
                activeOpacity={0.8}
                className="flex-row items-center gap-x-3 px-4 py-3"
              >
                <Archive size={16} color="#4a3728" />
                <Text className="text-sm font-medium text-[#4a3728]">Archive Skill</Text>
              </TouchableOpacity>

              <View className="h-px bg-[#e0d8cf] mx-3 my-1" />

              <TouchableOpacity
                onPress={() => { closeMenu(); onDelete(skill.skillId); }}
                activeOpacity={0.8}
                className="flex-row items-center gap-x-3 px-4 py-3"
              >
                <Trash2 size={16} color="#dc2626" />
                <Text className="text-sm font-medium text-red-600">Delete Skill</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
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
};

export default ViewAllSkillsModal;