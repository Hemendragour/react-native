import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';

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

export interface UpdateSkillFormData {
  skillName: string;
  category: string;
  skillStrength: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

interface UpdateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSkill: (skillId: string, skillData: UpdateSkillFormData) => void;
  skill?: Skill;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Programming', 'Backend Development', 'Frontend Development',
  'Full Stack Development', 'Mobile Development', 'DevOps',
  'Cloud Computing', 'Database Management', 'Data Science',
  'Machine Learning', 'Design', 'Project Management',
  'Business Strategy', 'Other',
];

const STRENGTH_LEVELS: { label: string; value: UpdateSkillFormData['skillStrength'] }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
];

const STRENGTH_DOT_MAP: Record<string, number> = {
  beginner: 2, intermediate: 3, advanced: 4, expert: 5,
};

// ─── Reusable Label ───────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text className="text-sm font-medium text-[#4a3728] mb-2">
    {text}{required && <Text className="text-red-500"> *</Text>}
  </Text>
);

// ─── Picker Row (replaces <select>) ──────────────────────────────────────────
const PickerSheet: React.FC<{
  visible: boolean;
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  title: string;
}> = ({ visible, options, selected, onSelect, onClose, title }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
      <Pressable
        className="bg-white rounded-t-3xl overflow-hidden"
        onPress={(e) => e.stopPropagation()}
      >
        {/* Sheet Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#e0d8cf]">
          <Text className="text-base font-bold text-[#4a3728]">{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <X size={18} color="#4a3728" />
          </TouchableOpacity>
        </View>
        <ScrollView className="max-h-72" showsVerticalScrollIndicator={false}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => { onSelect(opt.value); onClose(); }}
              activeOpacity={0.8}
              className={`flex-row items-center justify-between px-5 py-3.5 border-b border-[#e0d8cf]/40 ${
                selected === opt.value ? 'bg-[#f6ede8]' : ''
              }`}
            >
              <Text className={`text-sm ${selected === opt.value ? 'font-bold text-[#4a3728]' : 'text-[#4a3728]/80'}`}>
                {opt.label}
              </Text>
              {selected === opt.value && <Text className="text-[#4a3728]">✓</Text>}
            </TouchableOpacity>
          ))}
          <View className="h-4" />
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const UpdateSkillModal: React.FC<UpdateSkillModalProps> = ({
  isOpen, onClose, onUpdateSkill, skill,
}) => {
  const [formData, setFormData] = useState<UpdateSkillFormData>({
    skillName: '',
    category: '',
    skillStrength: 'intermediate',
    yearsOfExperience: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showStrengthPicker, setShowStrengthPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && skill) {
      setFormData({
        skillName: skill.skillName || '',
        category: skill.category || '',
        skillStrength: skill.skillStrength || 'intermediate',
        yearsOfExperience: skill.yearsOfExperience || 1,
      });
      setErrors({});
    }
  }, [isOpen, skill]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.skillName.trim()) e.skillName = 'Skill name is required';
    if (!formData.category.trim()) e.category = 'Category is required';
    if (formData.yearsOfExperience < 1 || formData.yearsOfExperience > 50)
      e.yearsOfExperience = 'Must be between 1 and 50';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!skill) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onUpdateSkill(skill.skillId, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update skill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dotLevel = STRENGTH_DOT_MAP[formData.skillStrength] ?? 3;
  const selectedStrengthLabel =
    STRENGTH_LEVELS.find((s) => s.value === formData.skillStrength)?.label ?? 'Intermediate';

  return (
    <>
      <Modal
        visible={isOpen && !!skill}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-3"
          onPress={onClose}
        >
          <Pressable
            className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[92%]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-5 bg-[#4a3728]">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">Update Skill</Text>
                <Text className="text-white/70 text-sm mt-0.5">Modify your skill details below</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                activeOpacity={0.7}
                className={`p-2 rounded-full bg-white/10 ${isSubmitting ? 'opacity-50' : ''}`}
              >
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5 py-5" showsVerticalScrollIndicator={false}>
              <View className="gap-y-5">

                {/* ── Section: Skill Information ── */}
                <View>
                  <Text className="text-base font-semibold text-[#4a3728] mb-4">
                    ⚡ Skill Information
                  </Text>

                  {/* Skill Name */}
                  <View className="mb-4">
                    <FieldLabel text="Skill Name" required />
                    <TextInput
                      value={formData.skillName}
                      onChangeText={(v) => setFormData((p) => ({ ...p, skillName: v }))}
                      placeholder="e.g., React.js, Node.js"
                      placeholderTextColor="#a08060"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#e0d8cf] bg-white text-sm text-[#4a3728]"
                    />
                    {errors.skillName && (
                      <Text className="text-red-500 text-xs mt-1">{errors.skillName}</Text>
                    )}
                  </View>

                  {/* Category Picker */}
                  <View>
                    <FieldLabel text="Category" required />
                    <TouchableOpacity
                      onPress={() => setShowCategoryPicker(true)}
                      activeOpacity={0.8}
                      className="w-full flex-row items-center justify-between px-4 py-3 rounded-xl border-2 border-[#e0d8cf] bg-white"
                    >
                      <Text className={`text-sm ${formData.category ? 'text-[#4a3728]' : 'text-[#a08060]'}`}>
                        {formData.category || 'Select a category'}
                      </Text>
                      <ChevronDown size={16} color="#4a3728" />
                    </TouchableOpacity>
                    {errors.category && (
                      <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
                    )}
                  </View>
                </View>

                {/* ── Section: Skill Level ── */}
                <View>
                  <Text className="text-base font-semibold text-[#4a3728] mb-4">
                    📊 Skill Level & Experience
                  </Text>

                  <View className="flex-row gap-x-3">
                    {/* Strength Picker */}
                    <View className="flex-1">
                      <FieldLabel text="Skill Strength" />
                      <TouchableOpacity
                        onPress={() => setShowStrengthPicker(true)}
                        activeOpacity={0.8}
                        className="flex-row items-center justify-between px-3 py-3 rounded-xl border-2 border-[#e0d8cf] bg-white"
                      >
                        <Text className="text-sm text-[#4a3728]">{selectedStrengthLabel}</Text>
                        <ChevronDown size={14} color="#4a3728" />
                      </TouchableOpacity>
                    </View>

                    {/* Years of Experience */}
                    <View className="flex-1">
                      <FieldLabel text="Years Exp." />
                      <TextInput
                        value={String(formData.yearsOfExperience)}
                        onChangeText={(v) => {
                          const n = parseInt(v) || 1;
                          setFormData((p) => ({
                            ...p,
                            yearsOfExperience: Math.max(1, Math.min(50, n)),
                          }));
                        }}
                        keyboardType="number-pad"
                        className="px-3 py-3 rounded-xl border-2 border-[#e0d8cf] bg-white text-sm text-[#4a3728]"
                      />
                      {errors.yearsOfExperience && (
                        <Text className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* ── Strength Preview ── */}
                <View className="bg-[#f6ede8]/50 rounded-xl p-4 border-2 border-[#e0d8cf]">
                  <Text className="text-sm font-semibold text-[#4a3728] mb-3">
                    Strength Level Preview
                  </Text>
                  <View className="flex-row gap-x-2">
                    {[...Array(5)].map((_, i) => (
                      <View
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < dotLevel ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'}`}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <View className="h-4" />
            </ScrollView>

            {/* Footer */}
            <View className="flex-row gap-x-3 px-5 py-4 border-t border-[#e0d8cf] bg-white">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-full border-2 border-[#e0d8cf] items-center ${isSubmitting ? 'opacity-50' : ''}`}
              >
                <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className={`flex-1 py-3 rounded-full bg-[#4a3728] flex-row items-center justify-center gap-x-2 ${isSubmitting ? 'opacity-60' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-semibold text-sm">Updating...</Text>
                  </>
                ) : (
                  <Text className="text-white font-semibold text-sm">Update Skill</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Category Sheet */}
      <PickerSheet
        visible={showCategoryPicker}
        title="Select Category"
        options={CATEGORIES.map((c) => ({ label: c, value: c }))}
        selected={formData.category}
        onSelect={(v) => setFormData((p) => ({ ...p, category: v }))}
        onClose={() => setShowCategoryPicker(false)}
      />

      {/* Strength Sheet */}
      <PickerSheet
        visible={showStrengthPicker}
        title="Select Skill Strength"
        options={STRENGTH_LEVELS.map((s) => ({ label: s.label, value: s.value }))}
        selected={formData.skillStrength}
        onSelect={(v) => setFormData((p) => ({ ...p, skillStrength: v as UpdateSkillFormData['skillStrength'] }))}
        onClose={() => setShowStrengthPicker(false)}
      />
    </>
  );
};

export default UpdateSkillModal;