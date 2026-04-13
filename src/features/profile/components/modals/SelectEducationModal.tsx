// features/profile/components/SelectEducationModal.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  educationList: any[];
  onSelectEducation: (education: any) => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const AwardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 15a7 7 0 100-14 7 7 0 000 14zm0 0v6m-3-3h6" stroke="#f6ede8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MapPinIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#8b7355" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Format date ──────────────────────────────────────────────────────────────

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

// ─── Main Modal ───────────────────────────────────────────────────────────────

const SelectEducationModal: React.FC<SelectEducationModalProps> = ({
  isOpen, onClose, educationList, onSelectEducation,
}) => (
  <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl max-h-[85%]">

        {/* Header */}
        <View className="flex-row items-center justify-between p-5 bg-brand-dark rounded-t-3xl">
          <View>
            <Text className="text-brand-light text-lg font-bold">Select Education</Text>
            <Text className="text-brand-light/70 text-xs mt-0.5">Choose which education to update</Text>
          </View>
          <TouchableOpacity className="p-2 rounded-full bg-white/20" onPress={onClose} activeOpacity={0.7}>
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
          {educationList.length === 0 ? (
            <View className="py-12 items-center gap-3">
              <View className="w-16 h-16 rounded-full bg-brand-dark/10 items-center justify-center">
                <AwardIcon />
              </View>
              <Text className="text-brand-dark/60 text-base">No education records found</Text>
              <Text className="text-brand-dark/40 text-sm">Add an education record to get started</Text>
            </View>
          ) : (
            educationList.map((edu) => (
              <TouchableOpacity
                key={edu.educationId}
                className="bg-brand-light/50 border border-brand-border/40 rounded-2xl p-4 mb-3"
                onPress={() => { onSelectEducation(edu); onClose(); }}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">

                    {/* Award badge + degree */}
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-9 h-9 rounded-lg bg-brand-dark items-center justify-center">
                        <AwardIcon />
                      </View>
                      <View className="flex-1">
                        <Text className="text-brand-dark text-sm font-bold" numberOfLines={1}>
                          {edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}
                        </Text>
                        <View className="bg-brand-dark/10 px-2 py-0.5 rounded-full self-start mt-0.5">
                          <Text className="text-brand-dark text-xs font-medium">{edu.degreeType}</Text>
                        </View>
                      </View>
                    </View>

                    {/* College */}
                    <View className="flex-row items-center gap-1.5 mb-1 ml-11">
                      <MapPinIcon />
                      <Text className="text-brand-dark/70 text-xs">{edu.schoolCollegeName}</Text>
                    </View>

                    {/* Dates */}
                    <View className="flex-row items-center gap-1.5 ml-11">
                      <CalendarIcon />
                      <Text className="text-brand-dark/70 text-xs">
                        {fmt(edu.startDate)} – {edu.isOngoing ? 'Present' : fmt(edu.endDate || '')}
                      </Text>
                    </View>
                  </View>

                  {/* Chevron */}
                  <View className="w-9 h-9 rounded-full bg-brand-dark/10 items-center justify-center mt-1">
                    <ChevronIcon />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View className="h-4" />
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-brand-border">
          <TouchableOpacity
            className="py-3 rounded-2xl border-2 border-brand-border items-center"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text className="text-brand-dark text-sm font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  </Modal>
);

export default SelectEducationModal;