import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
 
interface ExperienceModalProps {
  isOpen: boolean;
  isEditing: boolean;
  error: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  logoUrl: string;
  isSaving?: boolean;
  achievementInput: string;
  achievementsList: string[];
  onClose: () => void;
  onSave: () => void;
  onCompanyChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onIsCurrentChange: (value: boolean) => void;
  onLogoUrlChange: (value: string) => void;
  onAchievementInputChange: (value: string) => void;
  onAddAchievement: () => void;
  onRemoveAchievement: (index: number) => void;
}
 
const SectionLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text className="text-xs font-bold text-[#4a3728] uppercase mb-2 tracking-wide">{text}</Text>
);
 
const StyledInput: React.FC<{
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  editable?: boolean;
}> = ({ placeholder, value, onChangeText, multiline = false, editable = true }) => (
  <TextInput
    placeholder={placeholder}
    placeholderTextColor="#a08060"
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    editable={editable}
    numberOfLines={multiline ? 4 : 1}
    textAlignVertical={multiline ? 'top' : 'center'}
    className={`w-full bg-white rounded-xl px-3 py-3 border border-[#d4c4b5] text-sm text-[#4a3728] ${
      multiline ? 'h-24' : ''
    } ${!editable ? 'opacity-50' : ''}`}
  />
);
 
const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  isEditing,
  error,
  company,
  position,
  description,
  startDate,
  endDate,
  isCurrent,
  logoUrl,
  isSaving,
  achievementInput,
  achievementsList,
  onClose,
  onSave,
  onCompanyChange,
  onPositionChange,
  onDescriptionChange,
  onStartDateChange,
  onEndDateChange,
  onIsCurrentChange,
  onLogoUrlChange,
  onAchievementInputChange,
  onAddAchievement,
  onRemoveAchievement,
}) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable
          className="w-full bg-[#f6ede8] rounded-2xl overflow-hidden shadow-2xl border border-[#e0d8cf] max-h-[92%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 bg-[#f6ede8] border-b border-[#e0d8cf]">
            <View className="flex-1">
              <Text className="text-xl font-bold text-[#4a3728]">
                {isEditing ? '✏️ Edit Experience' : '➕ Add New Experience'}
              </Text>
              <Text className="text-xs text-[#8b6f47] mt-0.5">Share your professional journey</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-lg bg-[#e0d8cf]"
              activeOpacity={0.7}
            >
              <X size={18} color="#4a3728" />
            </TouchableOpacity>
          </View>
 
          {/* Body */}
          <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
            <View className="gap-y-4">
 
              {/* Error */}
              {!!error && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-start gap-x-2">
                  <Text className="text-red-600 font-bold text-base mt-0.5">⚠</Text>
                  <Text className="text-red-700 text-sm flex-1">{error}</Text>
                </View>
              )}
 
              {/* Section 1: Basic Info */}
              <View>
                <SectionLabel text="Basic Information" />
                <View className="bg-white/60 rounded-xl p-4 border border-[#d4c4b5] gap-y-3">
                  <StyledInput
                    placeholder="Company Name *"
                    value={company}
                    onChangeText={onCompanyChange}
                  />
                  <StyledInput
                    placeholder="Job Position *"
                    value={position}
                    onChangeText={onPositionChange}
                  />
                  <StyledInput
                    placeholder="Job Description (Describe your role and responsibilities)"
                    value={description}
                    onChangeText={onDescriptionChange}
                    multiline
                  />
                </View>
              </View>
 
              {/* Section 2: Duration */}
              <View>
                <SectionLabel text="Employment Duration" />
                <View className="bg-white/60 rounded-xl p-4 border border-[#d4c4b5] gap-y-3">
                  <View className="flex-row gap-x-3">
                    {/* Start Date */}
                    <View className="flex-1">
                      <Text className="text-xs text-[#6b5038] font-semibold mb-1">Start Date *</Text>
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#a08060"
                        value={startDate}
                        onChangeText={onStartDateChange}
                        className="bg-white rounded-xl px-3 py-3 border border-[#d4c4b5] text-sm text-[#4a3728]"
                      />
                    </View>
                    {/* End Date */}
                    <View className="flex-1">
                      <Text className="text-xs text-[#6b5038] font-semibold mb-1">End Date</Text>
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#a08060"
                        value={endDate}
                        onChangeText={onEndDateChange}
                        editable={!isCurrent}
                        className={`bg-white rounded-xl px-3 py-3 border border-[#d4c4b5] text-sm text-[#4a3728] ${
                          isCurrent ? 'opacity-40' : ''
                        }`}
                      />
                    </View>
                  </View>
 
                  {/* Currently Working Toggle */}
                  <View className="flex-row items-center gap-x-3 pt-3 border-t border-[#d4c4b5]">
                    <TouchableOpacity
                      onPress={() => onIsCurrentChange(!isCurrent)}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`w-5 h-5 rounded border-2 items-center justify-center ${
                          isCurrent ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#c0b8b0]'
                        }`}
                      >
                        {isCurrent && <Text className="text-white text-xs font-bold">✓</Text>}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onIsCurrentChange(!isCurrent)} activeOpacity={0.7}>
                      <Text className="text-[#4a3728] font-medium text-sm">I currently work here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
 
              {/* Section 3: Company Logo */}
              <View>
                <SectionLabel text="Company Logo" />
                <StyledInput
                  placeholder="https://example.com/logo.png (optional)"
                  value={logoUrl}
                  onChangeText={onLogoUrlChange}
                />
                {!!logoUrl && (
                  <View className="mt-2 flex-row items-center gap-x-3 px-3 py-2 bg-white rounded-xl border border-[#d4c4b5]">
                    <Image
                      source={{ uri: logoUrl }}
                      className="w-8 h-8 rounded"
                      resizeMode="contain"
                    />
                    <Text className="text-xs text-[#6b5038]">Logo preview loaded</Text>
                  </View>
                )}
              </View>
 
              {/* Section 4: Achievements */}
              <View>
                <SectionLabel text={`Key Achievements (${achievementsList.length}/10)`} />
                <View className="bg-white/60 rounded-xl p-4 border border-[#d4c4b5] gap-y-3">
                  {/* Input Row */}
                  <View className="flex-row gap-x-2">
                    <TextInput
                      placeholder="e.g., Led a team of 5 developers..."
                      placeholderTextColor="#a08060"
                      value={achievementInput}
                      onChangeText={onAchievementInputChange}
                      onSubmitEditing={onAddAchievement}
                      returnKeyType="done"
                      className="flex-1 bg-white rounded-xl px-3 py-3 border border-[#d4c4b5] text-sm text-[#4a3728]"
                    />
                    <TouchableOpacity
                      onPress={onAddAchievement}
                      disabled={achievementsList.length >= 10}
                      activeOpacity={0.8}
                      className={`px-4 py-3 bg-[#4a3728] rounded-xl items-center justify-center ${
                        achievementsList.length >= 10 ? 'opacity-40' : ''
                      }`}
                    >
                      <Text className="text-[#f6ede8] font-bold text-xl leading-none">+</Text>
                    </TouchableOpacity>
                  </View>
 
                  {/* Achievements List */}
                  {achievementsList.length === 0 ? (
                    <Text className="text-xs text-[#8b6f47] italic py-1">
                      No achievements added yet. Add your key accomplishments above.
                    </Text>
                  ) : (
                    <View className="gap-y-2">
                      {achievementsList.map((achievement, index) => (
                        <View
                          key={index}
                          className="flex-row items-start gap-x-2 bg-white rounded-xl px-3 py-2.5 border border-[#d4c4b5]"
                        >
                          <Text className="text-[#4a3728] font-bold text-sm mt-0.5">{index + 1}.</Text>
                          <Text className="text-sm text-[#4a3728] flex-1">{achievement}</Text>
                          <TouchableOpacity
                            onPress={() => onRemoveAchievement(index)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <X size={16} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
 
                  <Text className="text-xs text-[#8b6f47]/70">
                    💡 <Text className="font-semibold">Tip:</Text> Add 3-5 key achievements to highlight your impact.
                  </Text>
                </View>
              </View>
            </View>
            <View className="h-4" />
          </ScrollView>
 
          {/* Footer */}
          <View className="flex-row gap-x-3 px-5 py-4 bg-[#f6ede8] border-t border-[#e0d8cf]">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              activeOpacity={0.8}
              className="flex-1 py-3 bg-[#e0d8cf] rounded-xl items-center justify-center"
            >
              <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={isSaving}
              activeOpacity={0.8}
              className={`flex-1 py-3 bg-[#4a3728] rounded-xl flex-row items-center justify-center gap-x-2 ${
                isSaving ? 'opacity-70' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#f6ede8" />
                  <Text className="text-[#f6ede8] font-semibold text-sm">
                    {isEditing ? 'Saving...' : 'Adding...'}
                  </Text>
                </>
              ) : (
                <Text className="text-[#f6ede8] font-semibold text-sm">
                  {isEditing ? '✓ Save Changes' : '✓ Add Experience'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default ExperienceModal;
 
