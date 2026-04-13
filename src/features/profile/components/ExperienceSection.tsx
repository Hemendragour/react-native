import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import ExperienceModal from './modals/ExperienceModal';
import ShowAllExperiencesModal from './modals/ShowAllExperiencesModal';
import AuthService from '..//././/..//././..//services/auth.service';
import { ChevronRight, Plus, Pencil, Minus, Archive } from 'lucide-react-native';
 
interface Experience {
  experienceId: string;
  company: string;
  position: string;
  period: string;
  current: boolean;
  description: string;
  achievements: string[];
  logo: string;
  startDate: string;
  endDate?: string;
}
 
interface ExperienceSectionProps {
  experienceIds?: string[];
}
 
const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceIds = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShowAllModalOpen, setIsShowAllModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
 
  // Form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [achievementsList, setAchievementsList] = useState<string[]>([]);
//  const experienceIds=1
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        const fetchPromises = experienceIds.map((id: string) => AuthService.getExperienceById(id));
        const responses = await Promise.all(fetchPromises);
 
        const transformed: Experience[] = responses.map((response: any) => {
          const exp = response.data.experience;
          return {
            experienceId: exp.experienceId,
            company: exp.companyName,
            position: exp.currentPosition,
            period: exp.duration || formatPeriod(exp.startDate, exp.endDate),
            current: exp.currentlyWorking,
            description: exp.description,
            achievements: exp.keyAchievements || [],
            logo: 'https://img.icons8.com/color/96/briefcase.png',
            startDate: exp.startDate,
            endDate: exp.endDate,
          };
        });
 
        transformed.sort((a, b) =>
          (b.startDate || '9999').localeCompare(a.startDate || '9999')
        );
        setExperiences(transformed);
        if (transformed.length > 0) setCurrentIndex(0);
      } catch (err: any) {
        setError(err.message || 'Failed to load experiences');
      } finally {
        setIsLoading(false);
      }
    };

    if (experienceIds && experienceIds.length > 0) {
      fetchExperiences();
    } else {
      setIsLoading(false);
    }
  }, [experienceIds]);

 
  const formatPeriod = (start: string, end?: string) => {
    const startYear = new Date(start).getFullYear();
    const endYear = end ? new Date(end).getFullYear() : 'Present';
    return `${startYear} - ${endYear}`;
  };
 
  const resetForm = () => {
    setCompany('');
    setPosition('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setLogoUrl('');
    setAchievementInput('');
    setAchievementsList([]);
    setError('');
  };
 
  const addAchievement = () => {
    if (achievementInput.trim()) {
      if (achievementsList.length >= 10) {
        setError('Maximum 10 achievements allowed');
        return;
      }
      setAchievementsList([...achievementsList, achievementInput.trim()]);
      setAchievementInput('');
    }
  };
 
  const removeAchievement = (i: number) => {
    setAchievementsList(achievementsList.filter((_, idx) => idx !== i));
  };
 
  const validateExperience = (): string | null => {
    if (!startDate) return 'Start date is required';
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return 'Invalid start date';
    if (start > new Date()) return 'Start date cannot be in the future';
    if (!isCurrent) {
      if (!endDate) return 'End date is required when not currently working';
      const end = new Date(endDate);
      if (isNaN(end.getTime())) return 'Invalid end date';
      if (end < start) return 'End date must be after start date';
    }
    if (achievementsList.length > 10) return 'Maximum 10 achievements allowed';
    return null;
  };
 
  const handleSaveExperience = async () => {
    setError('');
    const validationError = validateExperience();
    if (validationError) { setError(validationError); return; }
    setIsSaving(true);
    try {
      const payload = {
        currentPosition: position.trim(),
        companyName: company.trim(),
        description: description.trim(),
        startDate,
        endDate: isCurrent ? undefined : endDate,
        currentlyWorking: isCurrent,
        keyAchievements: achievementsList.length > 0 ? achievementsList : undefined,
      };
 
      let response;
      if (isEditing) {
        const experienceId = experiences[currentIndex].experienceId;
        response = await AuthService.updateExperience(experienceId, payload);
        const updated: Experience = {
          experienceId: response.data.experience.experienceId,
          company: response.data.experience.companyName,
          position: response.data.experience.currentPosition,
          period: response.data.experience.duration || formatPeriod(response.data.experience.startDate, response.data.experience.endDate),
          current: response.data.experience.currentlyWorking,
          description: response.data.experience.description,
          achievements: response.data.experience.keyAchievements || [],
          logo: logoUrl || experiences[currentIndex].logo,
          startDate: response.data.experience.startDate,
          endDate: response.data.experience.endDate,
        };
        const updatedList = [...experiences];
        updatedList[currentIndex] = updated;
        updatedList.sort((a, b) => (b.startDate || '9999').localeCompare(a.startDate || '9999'));
        setExperiences(updatedList);
        setCurrentIndex(updatedList.findIndex((e) => e.experienceId === updated.experienceId));
      } else {
        response = await AuthService.createExperience(payload);
        const newExp: Experience = {
          experienceId: response.data.experience.experienceId,
          company: response.data.experience.companyName,
          position: response.data.experience.currentPosition,
          period: response.data.experience.duration || formatPeriod(response.data.experience.startDate, response.data.experience.endDate),
          current: response.data.experience.currentlyWorking,
          description: response.data.experience.description,
          achievements: response.data.experience.keyAchievements || [],
          logo: logoUrl || 'https://img.icons8.com/color/96/briefcase.png',
          startDate: response.data.experience.startDate,
          endDate: response.data.experience.endDate,
        };
        const updatedList = [...experiences, newExp].sort((a, b) =>
          (b.startDate || '9999').localeCompare(a.startDate || '9999')
        );
        setExperiences(updatedList);
        setCurrentIndex(updatedList.findIndex((e) => e.experienceId === newExp.experienceId));
      }
 
      resetForm();
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
 
  const handleDeleteExperience = () => setIsDeleteConfirmOpen(true);
 
  const confirmDeleteExperience = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const experienceId = experiences[currentIndex].experienceId;
      await AuthService.deleteExperience(experienceId);
      const updated = experiences.filter((_, i) => i !== currentIndex);
      setExperiences(updated);
      setCurrentIndex(Math.max(0, currentIndex - 1));
      setIsDeleteConfirmOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete experience');
    } finally {
      setIsDeleting(false);
    }
  };
 
  const handleArchiveExperience = async () => {
    setIsArchiving(true);
    try {
      const experienceId = experiences[currentIndex].experienceId;
      await AuthService.archiveExperience(experienceId);
      const updated = experiences.filter((_, i) => i !== currentIndex);
      setExperiences(updated);
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to archive experience');
    } finally {
      setIsArchiving(false);
    }
  };
 
  // ─── LOADING STATE ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <View className="bg-[#f6ede8]/80 rounded-2xl p-6 shadow-md border border-[#e0d8cf]/50 mb-6 items-center justify-center min-h-[120px]">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-sm text-[#8b6f47] mt-3">Loading experiences...</Text>
      </View>
    );
  }
 
  // ─── EMPTY STATE ─────────────────────────────────────────────────
  if (experiences.length === 0) {
    return (
      <View className="bg-[#f6ede8]/80 rounded-2xl p-5 shadow-md border border-[#e0d8cf]/50 mx-3 mb-6">
        {/* Header */}
        <Text className="text-xl font-bold text-[#4a3728] mb-1">Experience</Text>
        <Text className="text-xs text-[#8b6f47] mb-5">Professional Journey</Text>
 
        {/* Empty Card */}
        <View className="items-center py-8 px-4 bg-white/40 rounded-2xl border-2 border-dashed border-[#d4c4b5]">
          <Text className="text-4xl mb-3">💼</Text>
          <Text className="text-base font-bold text-[#4a3728] mb-1">No Experience Added</Text>
          <Text className="text-xs text-[#8b6f47] text-center mb-5 leading-4">
            Showcase your professional journey and achievements
          </Text>
          <TouchableOpacity
            onPress={() => { resetForm(); setIsModalOpen(true); }}
            activeOpacity={0.85}
            className="flex-row items-center gap-x-2 px-6 py-3 bg-[#4a3728] rounded-xl shadow-md"
          >
            <Text className="text-[#f6ede8] font-semibold text-sm">Add Your First Experience</Text>
          </TouchableOpacity>
 
          <View className="mt-5 px-4 py-3 bg-[#4a3728]/5 rounded-xl border border-[#8b6f47]/20 w-full">
            <Text className="text-xs text-[#6b5038] text-center">
              💡 <Text className="font-semibold">Tip:</Text> Include job title, company, dates, and key achievements to stand out.
            </Text>
          </View>
        </View>
 
        <ExperienceModal
          isOpen={isModalOpen}
          isEditing={isEditing}
          error={error}
          company={company}
          position={position}
          description={description}
          startDate={startDate}
          endDate={endDate}
          isCurrent={isCurrent}
          logoUrl={logoUrl}
          achievementInput={achievementInput}
          achievementsList={achievementsList}
          isSaving={isSaving}
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          onSave={handleSaveExperience}
          onCompanyChange={setCompany}
          onPositionChange={setPosition}
          onDescriptionChange={setDescription}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onIsCurrentChange={setIsCurrent}
          onLogoUrlChange={setLogoUrl}
          onAchievementInputChange={setAchievementInput}
          onAddAchievement={addAchievement}
          onRemoveAchievement={removeAchievement}
        />
      </View>
    );
  }
 
  // ─── MAIN VIEW ───────────────────────────────────────────────────
  const currentExp = experiences[currentIndex];
 
  return (
    <View className="bg-[#f6ede8]/80 rounded-2xl p-4 shadow-md border border-[#e0d8cf]/50 mb-6">
 
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xl font-bold text-[#4a3728]">Experience</Text>
          <Text className="text-xs text-[#8b6f47]">
            Professional Journey ({currentIndex + 1}/{experiences.length})
          </Text>
        </View>
 
        {/* Action Buttons */}
        <View className="flex-row gap-x-2">
          {/* Add */}
          <TouchableOpacity
            onPress={() => { resetForm(); setIsModalOpen(true); }}
            activeOpacity={0.8}
            className="p-2 rounded-xl bg-[#4a3728]"
          >
            <Plus size={16} color="#f6ede8" />
          </TouchableOpacity>
 
          {/* Edit */}
          <TouchableOpacity
            onPress={() => {
              setIsEditing(true);
              setIsModalOpen(true);
              setCompany(currentExp.company);
              setPosition(currentExp.position);
              setDescription(currentExp.description);
              setStartDate(currentExp.startDate.split('T')[0]);
              setEndDate(currentExp.current ? '' : (currentExp.endDate?.split('T')[0] || ''));
              setIsCurrent(currentExp.current);
              setLogoUrl(currentExp.logo);
              setAchievementsList(currentExp.achievements);
            }}
            activeOpacity={0.8}
            className="p-2 rounded-xl bg-[#4a3728]"
          >
            <Pencil size={16} color="#f6ede8" />
          </TouchableOpacity>
 
          {/* Delete */}
          <TouchableOpacity
            onPress={handleDeleteExperience}
            disabled={isDeleting}
            activeOpacity={0.8}
            className={`p-2 rounded-xl bg-[#4a3728] ${isDeleting ? 'opacity-50' : ''}`}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color="#f6ede8" />
              : <Minus size={16} color="#f6ede8" />
            }
          </TouchableOpacity>
 
          {/* Archive */}
          <TouchableOpacity
            onPress={handleArchiveExperience}
            disabled={isArchiving}
            activeOpacity={0.8}
            className={`p-2 rounded-xl bg-[#4a3728] ${isArchiving ? 'opacity-50' : ''}`}
          >
            {isArchiving
              ? <ActivityIndicator size="small" color="#f6ede8" />
              : <Archive size={16} color="#f6ede8" />
            }
          </TouchableOpacity>
        </View>
      </View>
 
      {/* Timeline + Details */}
      <View className="flex-row gap-x-3">
 
        {/* LEFT: Timeline */}
        <View className="w-[38%]">
          {/* Vertical line */}
          <View className="absolute left-5 top-5 bottom-5 w-px bg-[#d4c4b5]" />
 
          <View className="gap-y-6">
            {experiences.slice(0, 3).map((exp, i) => {
              const active = i === currentIndex;
              return (
                <TouchableOpacity
                  key={exp.experienceId}
                  onPress={() => setCurrentIndex(i)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-x-3"
                >
                  {/* Dot / Logo */}
                  <View
                    className={`w-10 h-10 rounded-full border-4 items-center justify-center overflow-hidden z-10 ${
                      active
                        ? 'bg-[#4a3728] border-[#f6ede8] shadow-lg'
                        : 'bg-white border-[#d4c4b5]'
                    }`}
                  >
                    <Image source={{ uri: exp.logo }} className="w-7 h-7" resizeMode="contain" />
                  </View>
 
                  {/* Text */}
                  <View className="flex-1">
                    <Text
                      className={`font-bold text-xs leading-tight ${
                        active ? 'text-[#4a3728]' : 'text-[#8b6f47]'
                      }`}
                      numberOfLines={1}
                    >
                      {exp.company.split(' (')[0]}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        active ? 'text-[#6b5038] font-semibold' : 'text-[#8b6f47]/60'
                      }`}
                    >
                      {exp.period}
                    </Text>
                    {exp.current && (
                      <View className="mt-1 self-start px-2 py-0.5 bg-[#4a3728] rounded-full">
                        <Text className="text-[#f6ede8] text-[10px] font-bold">Current</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
 
            {/* Show All */}
            {experiences.length > 3 && (
              <TouchableOpacity
                onPress={() => setIsShowAllModalOpen(true)}
                activeOpacity={0.85}
                className="mt-2 py-2.5 px-3 border-2 border-[#4a3728] rounded-xl items-center"
              >
                <Text className="text-[#4a3728] font-bold text-xs">
                  Show All ({experiences.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
 
        {/* RIGHT: Details */}
        <View className="flex-1 gap-y-2.5">
          {/* Company */}
          <View className="bg-[#e0d8cf]/70 rounded-xl p-3 border border-[#d4c4b5]">
            <Text className="text-[10px] font-bold text-[#4a3728] uppercase mb-1">Company</Text>
            <Text className="text-sm font-bold text-[#6b5038]" numberOfLines={2}>
              {currentExp.company}
            </Text>
            <View className="flex-row items-center gap-x-1.5 mt-1.5">
              <Text className="text-xs text-[#8b6f47] font-semibold">{currentExp.period}</Text>
              {currentExp.current && (
                <View className="px-1.5 py-0.5 bg-[#4a3728] rounded-full ml-1">
                  <Text className="text-[#f6ede8] text-[10px] font-bold">Current</Text>
                </View>
              )}
            </View>
          </View>
 
          {/* Position */}
          <View className="bg-[#e0d8cf]/70 rounded-xl p-3 border border-[#d4c4b5]">
            <Text className="text-[10px] font-bold text-[#4a3728] uppercase mb-1">Position</Text>
            <Text className="text-base font-black text-[#4a3728]" numberOfLines={2}>
              {currentExp.position}
            </Text>
          </View>
 
          {/* Role Overview */}
          <View className="bg-[#e0d8cf]/70 rounded-xl p-3 border border-[#d4c4b5]">
            <Text className="text-[10px] font-bold text-[#4a3728] uppercase mb-1">Role Overview</Text>
            <Text className="text-xs text-[#4a3728]/70 leading-4" numberOfLines={4}>
              {currentExp.description}
            </Text>
          </View>
 
          {/* Achievements */}
          {currentExp.achievements.length > 0 && (
            <View className="bg-[#e0d8cf]/70 rounded-xl p-3 border border-[#d4c4b5]">
              <Text className="text-[10px] font-bold text-[#4a3728] uppercase mb-2">
                Key Achievements
              </Text>
              <View className="gap-y-1.5">
                {currentExp.achievements.slice(0, 4).map((a, i) => (
                  <View key={i} className="flex-row items-start gap-x-1.5">
                    <ChevronRight size={11} color="#8b6f47" style={{ marginTop: 2 }} />
                    <Text className="text-xs text-[#4a3728]/70 font-medium flex-1 leading-4">
                      {a}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
 
      {/* ── MODALS ── */}
      <ExperienceModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        error={error}
        company={company}
        position={position}
        description={description}
        startDate={startDate}
        endDate={endDate}
        isCurrent={isCurrent}
        logoUrl={logoUrl}
        achievementInput={achievementInput}
        achievementsList={achievementsList}
        isSaving={isSaving}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        onSave={handleSaveExperience}
        onCompanyChange={setCompany}
        onPositionChange={setPosition}
        onDescriptionChange={setDescription}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onIsCurrentChange={setIsCurrent}
        onLogoUrlChange={setLogoUrl}
        onAchievementInputChange={setAchievementInput}
        onAddAchievement={addAchievement}
        onRemoveAchievement={removeAchievement}
      />
 
      <ShowAllExperiencesModal
        isOpen={isShowAllModalOpen}
        experiences={experiences}
        onClose={() => setIsShowAllModalOpen(false)}
        onSelectExperience={(index) => {
          setCurrentIndex(index);
          setIsShowAllModalOpen(false);
        }}
      />
 
      {/* Delete Confirm Modal */}
      <Modal
        visible={isDeleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setIsDeleteConfirmOpen(false)}
        >
          <Pressable
            className="w-full bg-[#f6ede8] rounded-2xl overflow-hidden border border-[#e0d8cf]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center gap-x-2 px-5 py-4 border-b border-[#e0d8cf]">
              <Text className="text-red-600 text-xl">⚠️</Text>
              <Text className="text-lg font-bold text-[#4a3728]">Delete Experience?</Text>
            </View>
 
            {/* Body */}
            <View className="px-5 py-5">
              <Text className="text-sm text-[#4a3728] leading-5">
                Are you sure you want to permanently delete{' '}
                <Text className="font-bold">"{currentExp?.company}"</Text> experience? This action cannot be undone.
              </Text>
              {!!error && (
                <View className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex-row items-start gap-x-2">
                  <Text className="text-red-600 font-bold">⚠</Text>
                  <Text className="text-red-700 text-xs flex-1">{error}</Text>
                </View>
              )}
            </View>
 
            {/* Footer */}
            <View className="flex-row gap-x-3 px-5 py-4 border-t border-[#e0d8cf] bg-[#f0e6d8]">
              <TouchableOpacity
                onPress={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
                activeOpacity={0.8}
                className="flex-1 py-3 bg-[#e0d8cf] rounded-xl items-center"
              >
                <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteExperience}
                disabled={isDeleting}
                activeOpacity={0.8}
                className={`flex-1 py-3 bg-red-600 rounded-xl flex-row items-center justify-center gap-x-2 ${
                  isDeleting ? 'opacity-60' : ''
                }`}
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-semibold text-sm">Deleting...</Text>
                  </>
                ) : (
                  <Text className="text-white font-semibold text-sm">Yes, Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
 
export default ExperienceSection;