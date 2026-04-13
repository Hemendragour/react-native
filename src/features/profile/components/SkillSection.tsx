import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { MoreVertical, Pin, Archive, Trash2, Edit, Zap } from 'lucide-react-native';
// import { useSkillsData } from '@/hooks/data/useSkillsData';
// import AuthService from './..//..//..//services/auth.service';
import DeleteSkillConfirmModal from './modals/DeleteskillconfirmModal';
import PinLimitModal from './modals/PinLimitModal';
import Svg, { Path } from 'react-native-svg';

// ── TODO: Import these when ready ──────────────────────────────────────────────
import AddSkillModal, { SkillFormData } from './modals/AddSkillModal';
import UpdateSkillModal, { UpdateSkillFormData } from './modals/UpdateSkillModal';
import ViewAllSkillsModal from './modals/ViewAllSkillModal';


// ─── Temporary local hook stub (remove when useSkillsData is ready) ───────────

const PlusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);



const useSkillsData = () => {
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
 
  const fetchSkillsData = async () => {
    // TODO: replace with real API call via AuthService
    setIsLoadingSkills(false);
  };
 
  const updateSkillInList = (skillId: string, updatedData: Partial<Skill>) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, ...updatedData } : s))
    );
  };
 
  const getPinnedCount = () => skillsList.filter((s) => s.isPinned).length;
 
  const updatePinStatus = (skillId: string, isPinned: boolean) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, isPinned } : s))
    );
  };
 
  const removeSkillFromList = (skillId: string) => {
    setSkillsList((prev) => prev.filter((s) => s.skillId !== skillId));
  };
 
  return {
    skillsList,
    isLoadingSkills,
    fetchSkillsData,
    updateSkillInList,
    getPinnedCount,
    updatePinStatus,
    removeSkillFromList,
  };
};
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStrengthLevel = (strength: string): number => {
  const map: Record<string, number> = {
    beginner: 2, intermediate: 3, advanced: 4, expert: 5,
  };
  return map[strength] ?? 3;
};

const getStrengthLabel = (strength: string): string => {
  const map: Record<string, string> = {
    beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert',
  };
  return map[strength] ?? 'Intermediate';
};

const getStrengthPercentage = (strength: string): number => {
  const map: Record<string, number> = {
    beginner: 40, intermediate: 60, advanced: 80, expert: 100,
  };
  return map[strength] ?? 60;
};

// ─── Skill Card ───────────────────────────────────────────────────────────────
interface SkillCardProps {
  skill: Skill;
  isActionLoading: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onUpdate: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isActionLoading,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onUpdate,
  onPin,
  onArchive,
  onDelete,
}) => {
  const strengthPct = getStrengthPercentage(skill.skillStrength);
  const strengthDots = getStrengthLevel(skill.skillStrength);
  const strengthLabel = getStrengthLabel(skill.skillStrength);

  return (
    <View className={`mb-4 ${isActionLoading ? 'opacity-60' : 'opacity-100'}`}>
      <View className="bg-[#e0d8cf]/50 rounded-2xl p-4 border border-[#e0d8cf]/60">
        <View className="flex-row items-start gap-x-4">

          {/* Icon + Pin Badge */}
          <View className="relative">
            <View className="w-12 h-12 bg-[#4a3728] rounded-2xl items-center justify-center shadow-md">
              {isActionLoading ? (
                <ActivityIndicator size="small" color="#f6ede8" />
              ) : (
                <Zap size={22} color="#f6ede8" />
              )}
            </View>
            {skill.isPinned && !isActionLoading && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-[#7a5c3e] rounded-full items-center justify-center shadow-md">
                <Pin size={10} color="#f6ede8" fill="#f6ede8" />
              </View>
            )}
          </View>

          {/* Content */}
          <View className="flex-1 min-w-0">
            {/* Name + Menu */}
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-bold text-[#4a3728] flex-1 mr-2" numberOfLines={1}>
                {skill.skillName}
              </Text>

              {/* Three-dot Menu */}
              <View className="relative">
                <TouchableOpacity
                  onPress={onMenuToggle}
                  activeOpacity={0.7}
                  className="p-1.5 rounded-lg"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MoreVertical size={18} color="#4a3728" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category */}
            <Text className="text-xs text-[#4a3728]/70 mb-3">{skill.category}</Text>

            {/* Progress Bar */}
            <View className="w-full h-1.5 bg-[#e0d8cf] rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-[#4a3728] rounded-full"
                style={{ width: `${strengthPct}%` }}
              />
            </View>

            {/* Strength Dots + Years */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-1.5">
                <Text className="text-xs text-[#4a3728]/60 font-medium">{strengthLabel}</Text>
                <View className="flex-row gap-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < strengthDots ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'
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
        </View>
      </View>

      {/* ── Dropdown Menu (rendered as inline sheet below card) ── */}
      {isMenuOpen && (
        <>
          {/* Tap-outside dismisser */}
          <Pressable
            className="absolute inset-0 z-10"
            style={{ top: -9999, left: -9999, right: -9999, bottom: -9999, position: 'absolute' }}
            onPress={onMenuClose}
          />
          <View className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-2xl border border-[#e0d8cf]/60 py-1.5 z-20">
            {/* Update */}
            <TouchableOpacity
              onPress={onUpdate}
              activeOpacity={0.8}
              className="flex-row items-center gap-x-3 px-4 py-3"
            >
              <Edit size={16} color="#4a3728" />
              <Text className="text-sm font-medium text-[#4a3728]">Update Skill</Text>
            </TouchableOpacity>

            {/* Pin / Unpin */}
            <TouchableOpacity
              onPress={onPin}
              activeOpacity={0.8}
              className="flex-row items-center gap-x-3 px-4 py-3"
            >
              <Pin size={16} color="#4a3728" />
              <Text className="text-sm font-medium text-[#4a3728]">
                {skill.isPinned ? 'Unpin Skill' : 'Pin Skill'}
              </Text>
            </TouchableOpacity>

            {/* Archive */}
            <TouchableOpacity
              onPress={onArchive}
              activeOpacity={0.8}
              className="flex-row items-center gap-x-3 px-4 py-3"
            >
              <Archive size={16} color="#4a3728" />
              <Text className="text-sm font-medium text-[#4a3728]">Archive Skill</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="h-px bg-[#e0d8cf] mx-3 my-1" />

            {/* Delete */}
            <TouchableOpacity
              onPress={onDelete}
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

// ─── Main Component ───────────────────────────────────────────────────────────
const SkillsSection: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isUpdateSkillModalOpen, setIsUpdateSkillModalOpen] = useState(false);
  const [isViewAllSkillsModalOpen, setIsViewAllSkillsModalOpen] = useState(false);
  const [selectedSkillForUpdate, setSelectedSkillForUpdate] = useState<Skill | undefined>(undefined);
  const [isPinLimitModalOpen, setIsPinLimitModalOpen] = useState(false);
  const [isPinningSkillId, setIsPinningSkillId] = useState<string | null>(null);
  const [isArchivingSkillId, setIsArchivingSkillId] = useState<string | null>(null);
  const [isDeletingSkillId, setIsDeletingSkillId] = useState<string | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  const {
    skillsList,
    isLoadingSkills,
    fetchSkillsData,
    updateSkillInList,
    getPinnedCount,
    updatePinStatus,
    removeSkillFromList,
  } = useSkillsData();

  useEffect(() => {
    fetchSkillsData();
  }, [fetchSkillsData]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddSkill = async (skillData: any) => {
    try {
    //   const response = await AuthService.createSkill(skillData);
    //   if (response?.data?.skill) await fetchSkillsData();
    await fetchSkillsData();
    } catch (error: any) {
      console.error('❌ Failed to add skill:', error);
    }
  };

  const handleMenuToggle = (skillId: string) => {
    setOpenMenuId(openMenuId === skillId ? null : skillId);
  };

  const handleUpdateSkill = (skillId: string) => {
    const skill = skillsList.find((s) => s.skillId === skillId);
    if (skill) {
      setSelectedSkillForUpdate(skill);
      setIsUpdateSkillModalOpen(true);
      // TODO: AddSkillModal / UpdateSkillModal will be placed here when ready
    }
    setOpenMenuId(null);
  };

  const handlePinSkill = async (skillId: string, isPinned: boolean) => {
    if (!isPinned && getPinnedCount() >= 2) {
      setIsPinLimitModalOpen(true);
      setOpenMenuId(null);
      return;
    }
    setIsPinningSkillId(skillId);
    setOpenMenuId(null);
    try {
      if (isPinned) {
        // const res = await AuthService.unpinSkill(skillId);
        // if (res?.data?.skill) updatePinStatus(skillId, false);
        updatePinStatus(skillId,false);
      } else {
        // const res = await AuthService.pinSkill(skillId, getPinnedCount() + 1);
        // if (res?.data?.skill) updatePinStatus(skillId, true);
        updatePinStatus(skillId,true);
      }
      setTimeout(async () => {
        await fetchSkillsData();
        setIsPinningSkillId(null);
      }, 300);
    } catch (error: any) {
      console.error('❌ Failed to pin/unpin skill:', error);
      setIsPinningSkillId(null);
    }
  };

  const handleArchiveSkill = async (skillId: string) => {
    setIsArchivingSkillId(skillId);
    setOpenMenuId(null);
    try {
    //   const res = await AuthService.archiveSkill(skillId);
    //   if (res?.data?.skill) removeSkillFromList(skillId);
            removeSkillFromList(skillId);

      setIsArchivingSkillId(null);
    } catch (error: any) {
      console.error('❌ Failed to archive skill:', error);
      setIsArchivingSkillId(null);
    }
  };

  const handleDeleteSkill = (skillId: string) => {
    const skill = skillsList.find((s) => s.skillId === skillId);
    if (skill) { setSkillToDelete(skill); setIsDeleteConfirmModalOpen(true); }
    setOpenMenuId(null);
  };

  const handleDeleteSkillConfirm = async () => {
    if (!skillToDelete) return;
    setIsDeletingSkillId(skillToDelete.skillId);
    try {
    //   await AuthService.deleteSkill(skillToDelete.skillId);
      removeSkillFromList(skillToDelete.skillId);
      setIsDeleteConfirmModalOpen(false);
      setSkillToDelete(null);
      setIsDeletingSkillId(null);
    } catch (error: any) {
      console.error('❌ Failed to delete skill:', error);
      setIsDeletingSkillId(null);
    }
  };

  const handleUpdateSkillConfirm = async (skillId: string, updatedData: any) => {
    try {
    //   const res = await AuthService.updateSkill(skillId, updatedData);
    //   if (res?.data?.skill) {
    //     updateSkillInList(skillId, updatedData);
    //     await fetchSkillsData();
    updateSkillInList(skillId,updatedData);
      await fetchSkillsData();
    } catch (error: any) {
      console.error('❌ Failed to update skill:', error);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoadingSkills) {
    return (
      
      <View className="bg-[#f6ede8]/95 rounded-3xl p-8 mb-6 flex-row items-center justify-center gap-x-3">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-[#4a3728] text-sm">Loading skills...</Text>
      </View>
    );
  }
 
  // ── Empty State ───────────────────────────────────────────────────────────
  if (skillsList.length === 0) {
    return (
      <View className="bg-[#f6ede8]/95 rounded-3xl p-6 shadow-md border border-[#e0d8cf]/50 mb-6 mx-3">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-x-3">
            
            <View>
              <Text className="text-xl font-bold text-[#4a3728]">Skills</Text>
              <Text className="text-xs text-[#8b6f47]">Professional Expertise</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => {
              setIsAddSkillModalOpen(true);
              // TODO: AddSkillModal will open here
            }}
            activeOpacity={0.85}
            className='flex-row items-center gap-1.5 bg-brand-dark px-3 py-2 rounded-xl'
          >
            <PlusIcon/>
            <Text className="text-[#4a3728] text-xs font-bold">Add Skill</Text>
          </TouchableOpacity>
        </View>
 
        <View className="items-center py-10 bg-white/30 rounded-2xl border-2 border-dashed border-[#d4c4b5]">
          <Text className="text-4xl mb-3">⚡</Text>
          <Text className="text-base font-bold text-[#4a3728] mb-1">No Skills Added Yet</Text>
          <Text className="text-xs text-[#8b6f47] text-center px-6">
            Showcase your expertise by adding your professional skills
          </Text>
        </View>
 
        <AddSkillModal
          isOpen={isAddSkillModalOpen}
          onClose={() => setIsAddSkillModalOpen(false)}
          onAddSkill={handleAddSkill}
        />
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <View className="bg-[#f6ede8]/95 rounded-3xl px-5 py-6 shadow-xl border border-[#e0d8cf]/50 mb-6">
 
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-x-3">
            <View className="w-11 h-11 bg-[#4a3728] rounded-2xl items-center justify-center shadow-md">
              <Zap size={20} color="#f6ede8" />
            </View>
            <View>
              <Text className="text-xl font-bold text-[#4a3728] tracking-tight">Skills</Text>
              <Text className="text-xs text-[#4a3728]/60 font-medium">Professional Expertise</Text>
            </View>
          </View>
 
          <View className="flex-row items-center gap-x-2">
            {/* Total count badge */}
            <View className="bg-[#4a3728]/10 px-3 py-1 rounded-full border border-[#e0d8cf]/50">
              <Text className="text-xs font-bold text-[#4a3728]">{skillsList.length} Total</Text>
            </View>
            {/* Add button */}
            <TouchableOpacity
              onPress={() => setIsAddSkillModalOpen(true)}
              activeOpacity={0.85}
              className="px-4 py-2 bg-[#4a3728] rounded-full"
            >
              <Text className="text-[#f6ede8] text-xs font-bold">Add Skill</Text>
            </TouchableOpacity>
          </View>
        </View>
 
        {/* Skills List */}
        <View>
          {skillsList.map((skill) => {
            const isActionLoading =
              isPinningSkillId === skill.skillId ||
              isArchivingSkillId === skill.skillId ||
              isDeletingSkillId === skill.skillId;
 
            return (
              <SkillCard
                key={skill.skillId}
                skill={skill}
                isActionLoading={isActionLoading}
                isMenuOpen={openMenuId === skill.skillId}
                onMenuToggle={() => handleMenuToggle(skill.skillId)}
                onMenuClose={() => setOpenMenuId(null)}
                onUpdate={() => handleUpdateSkill(skill.skillId)}
                onPin={() => handlePinSkill(skill.skillId, skill.isPinned)}
                onArchive={() => handleArchiveSkill(skill.skillId)}
                onDelete={() => handleDeleteSkill(skill.skillId)}
              />
            );
          })}
        </View>
 
        {/* Show All Button */}
        {skillsList.length > 2 && (
          <View className="items-center mt-2">
            <TouchableOpacity
              onPress={() => setIsViewAllSkillsModalOpen(true)}
              activeOpacity={0.85}
              className="flex-row items-center gap-x-3 bg-[#4a3728] px-6 py-3.5 rounded-2xl shadow-md"
            >
              <Text className="text-[#f6ede8] font-semibold text-sm">
                Show all {skillsList.length} skills
              </Text>
              <Text className="text-[#f6ede8] text-base">→</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
 
      {/* ── Modals ── */}
 
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={handleAddSkill}
      />
 
      <UpdateSkillModal
        isOpen={isUpdateSkillModalOpen}
        onClose={() => {
          setIsUpdateSkillModalOpen(false);
          setSelectedSkillForUpdate(undefined);
        }}
        onUpdateSkill={handleUpdateSkillConfirm}
        skill={selectedSkillForUpdate}
      />
 
      <ViewAllSkillsModal
        isOpen={isViewAllSkillsModalOpen}
        onClose={() => setIsViewAllSkillsModalOpen(false)}
        skills={skillsList}
      />
 
      <PinLimitModal
        isOpen={isPinLimitModalOpen}
        onClose={() => setIsPinLimitModalOpen(false)}
      />
 
      <DeleteSkillConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setSkillToDelete(null);
        }}
        onConfirm={handleDeleteSkillConfirm}
        skillName={skillToDelete?.skillName || ''}
        isDeleting={isDeletingSkillId === skillToDelete?.skillId}
      />
    </>
  );
};

export default SkillsSection;