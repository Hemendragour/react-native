import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { X, ChevronRight, Calendar } from 'lucide-react-native';
 
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
 
interface ShowAllExperiencesModalProps {
  isOpen: boolean;
  experiences: Experience[];
  onClose: () => void;
  onSelectExperience?: (index: number) => void;
}
 
const ShowAllExperiencesModal: React.FC<ShowAllExperiencesModalProps> = ({
  isOpen,
  experiences,
  onClose,
  onSelectExperience,
}) => {
  const [selectedExp, setSelectedExp] = useState<Experience | null>(
    experiences.length > 0 ? experiences[0] : null
  );
  const [view, setView] = useState<'list' | 'detail'>('list');
 
  const handleSelect = (exp: Experience, index: number) => {
    setSelectedExp(exp);
    onSelectExperience?.(index);
    setView('detail');
  };
 
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-[#f6ede8] rounded-t-3xl overflow-hidden shadow-2xl border border-[#e0d8cf] max-h-[92%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#e0d8cf] bg-[#f6ede8]">
            <View className="flex-row items-center gap-x-3">
              {view === 'detail' && (
                <TouchableOpacity
                  onPress={() => setView('list')}
                  activeOpacity={0.7}
                  className="p-1.5 rounded-lg bg-[#e0d8cf]"
                >
                  <ChevronRight
                    size={18}
                    color="#4a3728"
                    style={{ transform: [{ rotate: '180deg' }] }}
                  />
                </TouchableOpacity>
              )}
              <View>
                <Text className="text-xl font-bold text-[#4a3728]">
                  {view === 'detail' && selectedExp ? selectedExp.company.split(' (')[0] : 'All Experiences'}
                </Text>
                <Text className="text-xs text-[#8b6f47] mt-0.5">
                  {view === 'detail' && selectedExp
                    ? selectedExp.position
                    : `Total: ${experiences.length} positions`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="p-2 rounded-lg bg-[#e0d8cf]"
            >
              <X size={18} color="#4a3728" />
            </TouchableOpacity>
          </View>
 
          {/* LIST VIEW */}
          {view === 'list' && (
            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              <View className="gap-y-3">
                {experiences.map((exp, i) => {
                  const isSelected = selectedExp?.experienceId === exp.experienceId;
                  return (
                    <TouchableOpacity
                      key={exp.experienceId}
                      onPress={() => handleSelect(exp, i)}
                      activeOpacity={0.85}
                      className={`flex-row items-center gap-x-3 p-4 rounded-2xl border-2 ${
                        isSelected
                          ? 'bg-[#4a3728] border-[#6b5038]'
                          : 'bg-[#e0d8cf]/50 border-[#d4c4b5]'
                      }`}
                    >
                      {/* Logo */}
                      <View
                        className={`w-12 h-12 rounded-full border-2 items-center justify-center overflow-hidden ${
                          isSelected ? 'border-[#f6ede8] bg-white' : 'border-[#d4c4b5] bg-white'
                        }`}
                      >
                        <Image
                          source={{ uri: exp.logo }}
                          className="w-9 h-9"
                          resizeMode="contain"
                        />
                      </View>
 
                      {/* Info */}
                      <View className="flex-1">
                        <Text
                          className={`font-bold text-sm leading-tight ${
                            isSelected ? 'text-[#f6ede8]' : 'text-[#4a3728]'
                          }`}
                          numberOfLines={1}
                        >
                          {exp.company.split(' (')[0]}
                        </Text>
                        <Text
                          className={`text-xs font-medium mt-0.5 ${
                            isSelected ? 'text-[#f6ede8]/80' : 'text-[#6b5038]'
                          }`}
                          numberOfLines={1}
                        >
                          {exp.position}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${
                            isSelected ? 'text-[#f6ede8]/70' : 'text-[#8b6f47]'
                          }`}
                        >
                          {exp.period}
                        </Text>
                        {exp.current && (
                          <View
                            className={`mt-1.5 self-start px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-[#f6ede8]' : 'bg-[#4a3728]'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-[#4a3728]' : 'text-[#f6ede8]'
                              }`}
                            >
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
 
                      {/* Arrow */}
                      <ChevronRight
                        size={16}
                        color={isSelected ? '#f6ede8' : '#8b6f47'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View className="h-6" />
            </ScrollView>
          )}
 
          {/* DETAIL VIEW */}
          {view === 'detail' && selectedExp && (
            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              <View className="gap-y-3">
                {/* Company Card */}
                <View className="bg-[#e0d8cf]/70 rounded-2xl p-4 border border-[#d4c4b5]">
                  <View className="flex-row items-center gap-x-3 mb-3">
                    <Image
                      source={{ uri: selectedExp.logo }}
                      className="w-11 h-11"
                      resizeMode="contain"
                    />
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#4a3728] uppercase">Company</Text>
                      <Text className="text-sm font-bold text-[#6b5038]" numberOfLines={2}>
                        {selectedExp.company}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-x-2 pt-3 border-t border-[#d4c4b5]">
                    <Calendar size={13} color="#8b6f47" />
                    <Text className="text-xs text-[#8b6f47] font-semibold flex-1">
                      {selectedExp.period}
                    </Text>
                    {selectedExp.current && (
                      <View className="px-2 py-0.5 bg-[#4a3728] rounded-full">
                        <Text className="text-[#f6ede8] text-xs font-bold">Current</Text>
                      </View>
                    )}
                  </View>
                </View>
 
                {/* Position Card */}
                <View className="bg-[#e0d8cf]/70 rounded-2xl p-4 border border-[#d4c4b5]">
                  <Text className="text-xs font-bold text-[#4a3728] uppercase mb-1">Position</Text>
                  <Text className="text-lg font-black text-[#4a3728]">{selectedExp.position}</Text>
                </View>
 
                {/* Role Overview */}
                <View className="bg-[#e0d8cf]/70 rounded-2xl p-4 border border-[#d4c4b5]">
                  <Text className="text-xs font-bold text-[#4a3728] uppercase mb-2">Role Overview</Text>
                  <Text className="text-xs text-[#4a3728]/70 leading-5">{selectedExp.description}</Text>
                </View>
 
                {/* Achievements */}
                {selectedExp.achievements.length > 0 && (
                  <View className="bg-[#e0d8cf]/70 rounded-2xl p-4 border border-[#d4c4b5]">
                    <Text className="text-xs font-bold text-[#4a3728] uppercase mb-3">
                      Key Achievements
                    </Text>
                    <View className="gap-y-2">
                      {selectedExp.achievements.map((achievement, i) => (
                        <View key={i} className="flex-row items-start gap-x-2">
                          <ChevronRight size={13} color="#8b6f47" style={{ marginTop: 2 }} />
                          <Text className="text-xs text-[#4a3728]/70 font-medium flex-1 leading-4">
                            {achievement}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              <View className="h-6" />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default ShowAllExperiencesModal;
 
