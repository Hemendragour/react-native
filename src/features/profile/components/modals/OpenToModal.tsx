import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
 
interface OpenToModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
interface MainFeature {
  id: string;
  title: string;
  icon: string;
  subFeatures: string[];
}
 
const mainFeatures: MainFeature[] = [
  {
    id: 'job',
    title: 'Finding a new job',
    icon: '💼',
    subFeatures: [
      'Job titles',
      'Location types (On-site/Hybrid/Remote)',
      'Locations (specific cities)',
      'Notice period',
      'Expected annual salary',
      'Start date (Immediate/Flexible)',
      'Full-time employment',
      'Part-time employment',
      'Contract employment',
      'Internship employment',
      'Temporary employment',
      'Privacy (Only visible to recruiters)',
    ],
  },
  {
    id: 'hiring',
    title: 'Hiring',
    icon: '👥',
    subFeatures: [
      'Share open roles',
      'Job title',
      'Location',
      'Employment type',
      'Job description',
      'Attract qualified candidates',
    ],
  },
  {
    id: 'services',
    title: 'Providing services',
    icon: '🛠️',
    subFeatures: [
      'Service description',
      'Service categories',
      'Portfolio/Work samples',
      'Search visibility',
      'Profile showcase',
      'Client outreach',
      'Pricing info',
    ],
  },
  {
    id: 'volunteer',
    title: 'Finding volunteer opportunities',
    icon: '🤝',
    subFeatures: [
      'Causes you care about',
      'Skills',
      'Volunteering preferences',
      'Nonprofit search visibility',
      'Profile display',
      'Time availability',
      'Remote/On-site preference',
    ],
  },
];
 
const OpenToModal: React.FC<OpenToModalProps> = ({ isOpen, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    job: true,
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
 
  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };
 
  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };
 
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay */}
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
              <Text className="text-2xl font-bold text-white">Open to</Text>
              <Text className="text-white/70 text-sm mt-0.5">
                Tell people what opportunities you're interested in
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
              {mainFeatures.map((feature) => (
                <View
                  key={feature.id}
                  className="border border-[#e0d8cf] rounded-xl overflow-hidden"
                >
                  {/* Feature Header */}
                  <TouchableOpacity
                    onPress={() => toggleSection(feature.id)}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-x-3 px-4 py-3 bg-[#f6ede8]"
                  >
                    <Text className="text-2xl">{feature.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-[#4a3728]">
                        {feature.title}
                      </Text>
                      <Text className="text-xs text-[#4a3728]/60 mt-0.5">
                        {feature.subFeatures.length} features
                      </Text>
                    </View>
                    <ChevronDown
                      size={18}
                      color="#4a3728"
                      style={{
                        transform: [{ rotate: expandedSections[feature.id] ? '180deg' : '0deg' }],
                      }}
                    />
                  </TouchableOpacity>
 
                  {/* Sub-features */}
                  {expandedSections[feature.id] && (
                    <View className="bg-white border-t border-[#e0d8cf] px-3 py-3 gap-y-2">
                      {feature.subFeatures.map((subFeature, index) => {
                        const key = `${feature.id}-${index}`;
                        const checked = !!checkedItems[key];
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => toggleCheck(key)}
                            activeOpacity={0.7}
                            className="flex-row items-center gap-x-3 px-3 py-2.5 bg-[#f6ede8]/40 rounded-lg border border-[#e0d8cf]/60"
                          >
                            {/* Custom checkbox */}
                            <View
                              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                checked
                                  ? 'bg-[#4a3728] border-[#4a3728]'
                                  : 'bg-white border-[#c0b8b0]'
                              }`}
                            >
                              {checked && (
                                <Text className="text-white text-xs font-bold">✓</Text>
                              )}
                            </View>
                            <Text className="text-sm font-medium text-[#4a3728] flex-1">
                              {subFeature}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
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
              <Text className="text-[#4a3728] font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 py-3 rounded-full bg-[#4a3728] items-center justify-center"
            >
              <Text className="text-white font-semibold text-sm">Apply Changes</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default OpenToModal;