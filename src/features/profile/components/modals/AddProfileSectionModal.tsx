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
 
interface AddProfileSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
interface SubFeature {
  id: string;
  name: string;
}
 
interface Section {
  id: string;
  title: string;
  subFeatures: SubFeature[];
}
 
interface Category {
  id: string;
  name: string;
  icon: string;
  sections: Section[];
}
 
const categories: Category[] = [
  {
    id: 'core',
    name: 'CORE SECTIONS',
    icon: '⭐',
    sections: [
      {
        id: 'education',
        title: 'Education',
        subFeatures: [
          { id: 'sch_name', name: "School/University name" },
          { id: 'deg_type', name: "Degree type (Bachelor's, Master's, PhD, etc.)" },
          { id: 'field', name: 'Field of study' },
          { id: 'start_date', name: 'Start date' },
          { id: 'end_date', name: 'End date' },
          { id: 'gpa', name: 'Grade/GPA' },
          { id: 'activities', name: 'Activities and societies' },
          { id: 'description', name: 'Description' },
          { id: 'media', name: 'Media attachments' },
        ],
      },
      {
        id: 'experience',
        title: 'Position (Experience)',
        subFeatures: [
          { id: 'job_title', name: 'Job title' },
          { id: 'company', name: 'Company name' },
          { id: 'emp_type', name: 'Employment type (Full-time, Part-time, Contract, Freelance, etc.)' },
          { id: 'location', name: 'Location' },
          { id: 'exp_start', name: 'Start date' },
          { id: 'exp_end', name: 'End date' },
          { id: 'job_desc', name: 'Job description' },
          { id: 'skills_used', name: 'Skills used' },
          { id: 'exp_media', name: 'Media attachments' },
        ],
      },
      {
        id: 'services',
        title: 'Services',
        subFeatures: [
          { id: 'service_cat', name: 'Service categories (up to 10 services)' },
          { id: 'service_about', name: 'About description' },
          { id: 'service_location', name: 'Work location & remote work options' },
          { id: 'service_pricing', name: 'Starting hourly rate/pricing' },
          { id: 'service_media', name: 'Media (images, videos, documents) - Premium only' },
          { id: 'service_btn', name: 'Request services button' },
        ],
      },
      {
        id: 'skills',
        title: 'Skills',
        subFeatures: [
          { id: 'skills_add', name: 'Add up to 50 skills' },
          { id: 'skills_featured', name: 'Top 3 featured skills' },
          { id: 'skills_endorsements', name: 'Skill endorsements' },
          { id: 'skills_assessments', name: 'Skill assessments/badges' },
          { id: 'skills_reorder', name: 'Reorder skills' },
        ],
      },
    ],
  },
  {
    id: 'recommended',
    name: 'RECOMMENDED SECTIONS',
    icon: '✨',
    sections: [
      {
        id: 'featured',
        title: 'Featured',
        subFeatures: [
          { id: 'feat_posts', name: 'Posts (your LinkedIn posts)' },
          { id: 'feat_articles', name: 'Articles (published articles)' },
          { id: 'feat_links', name: 'Links (external URLs)' },
          { id: 'feat_media', name: 'Media (images, videos, documents, presentations)' },
        ],
      },
      {
        id: 'certifications',
        title: 'Licenses & Certifications',
        subFeatures: [
          { id: 'cert_name', name: 'Certification name' },
          { id: 'cert_org', name: 'Issuing organization' },
          { id: 'cert_issue', name: 'Issue date' },
          { id: 'cert_expire', name: 'Expiration date' },
          { id: 'cert_id', name: 'Credential ID' },
          { id: 'cert_url', name: 'Credential URL' },
          { id: 'cert_skills', name: 'Skills associated' },
        ],
      },
    ],
  },
  {
    id: 'additional',
    name: 'ADDITIONAL SECTIONS',
    icon: '➕',
    sections: [
      {
        id: 'projects',
        title: 'Projects',
        subFeatures: [
          { id: 'proj_name', name: 'Project name' },
          { id: 'proj_desc', name: 'Project description' },
          { id: 'proj_url', name: 'Project URL' },
          { id: 'proj_start', name: 'Start date' },
          { id: 'proj_end', name: 'End date' },
          { id: 'proj_media', name: 'Media attachments' },
        ],
      },
      {
        id: 'languages',
        title: 'Languages',
        subFeatures: [
          { id: 'lang_name', name: 'Language name' },
          { id: 'lang_prof', name: 'Proficiency level' },
        ],
      },
      {
        id: 'volunteer',
        title: 'Volunteer Experience',
        subFeatures: [
          { id: 'vol_role', name: 'Role' },
          { id: 'vol_org', name: 'Organization' },
          { id: 'vol_cause', name: 'Cause' },
          { id: 'vol_start', name: 'Start date' },
          { id: 'vol_end', name: 'End date' },
          { id: 'vol_desc', name: 'Description' },
        ],
      },
    ],
  },
];
 
const AddProfileSectionModal: React.FC<AddProfileSectionModalProps> = ({ isOpen, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    core: true,
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({});
  const [checkedSubFeatures, setCheckedSubFeatures] = useState<Record<string, boolean>>({});
 
  const toggleCategory = (id: string) =>
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
 
  const toggleSection = (id: string) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
 
  const toggleSectionCheck = (id: string) =>
    setCheckedSections((prev) => ({ ...prev, [id]: !prev[id] }));
 
  const toggleSubFeatureCheck = (id: string) =>
    setCheckedSubFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
 
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
              <Text className="text-2xl font-bold text-white">Add Profile Section</Text>
              <Text className="text-white/70 text-sm mt-0.5">
                Choose sections to add to your profile
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
              {categories.map((category) => (
                <View
                  key={category.id}
                  className="border-2 border-[#e0d8cf] rounded-2xl overflow-hidden"
                >
                  {/* Category Header */}
                  <TouchableOpacity
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.85}
                    className="flex-row items-center gap-x-3 px-5 py-4 bg-[#4a3728]"
                  >
                    <Text className="text-2xl">{category.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-white">{category.name}</Text>
                      <Text className="text-white/60 text-xs mt-0.5">
                        {category.sections.length} sections available
                      </Text>
                    </View>
                    <ChevronDown
                      size={20}
                      color="#ffffff"
                      style={{
                        transform: [
                          { rotate: expandedCategories[category.id] ? '180deg' : '0deg' },
                        ],
                      }}
                    />
                  </TouchableOpacity>
 
                  {/* Sections */}
                  {expandedCategories[category.id] && (
                    <View className="bg-white px-3 py-3 gap-y-2 border-t-2 border-[#e0d8cf]">
                      {category.sections.map((section) => (
                        <View
                          key={section.id}
                          className="border border-[#e0d8cf] rounded-xl overflow-hidden"
                        >
                          {/* Section Header */}
                          <TouchableOpacity
                            onPress={() => toggleSection(section.id)}
                            activeOpacity={0.8}
                            className="flex-row items-center gap-x-3 px-4 py-3 bg-[#f6ede8]/60"
                          >
                            {/* Checkbox */}
                            <TouchableOpacity
                              onPress={() => toggleSectionCheck(section.id)}
                              activeOpacity={0.7}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <View
                                className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                  checkedSections[section.id]
                                    ? 'bg-[#4a3728] border-[#4a3728]'
                                    : 'bg-white border-[#c0b8b0]'
                                }`}
                              >
                                {checkedSections[section.id] && (
                                  <Text className="text-white text-xs font-bold">✓</Text>
                                )}
                              </View>
                            </TouchableOpacity>
                            <View className="flex-1">
                              <Text className="text-sm font-semibold text-[#4a3728]">
                                {section.title}
                              </Text>
                              <Text className="text-xs text-[#4a3728]/60 mt-0.5">
                                {section.subFeatures.length} features
                              </Text>
                            </View>
                            <ChevronDown
                              size={16}
                              color="#4a3728"
                              style={{
                                transform: [
                                  { rotate: expandedSections[section.id] ? '180deg' : '0deg' },
                                ],
                              }}
                            />
                          </TouchableOpacity>
 
                          {/* Sub-features */}
                          {expandedSections[section.id] && (
                            <View className="bg-white border-t border-[#e0d8cf] px-3 py-2 gap-y-1.5">
                              {section.subFeatures.map((subFeature) => {
                                const checked = !!checkedSubFeatures[subFeature.id];
                                return (
                                  <TouchableOpacity
                                    key={subFeature.id}
                                    onPress={() => toggleSubFeatureCheck(subFeature.id)}
                                    activeOpacity={0.7}
                                    className="flex-row items-center gap-x-3 pl-8 pr-3 py-2 bg-[#f6ede8]/30 rounded-lg"
                                  >
                                    <View
                                      className={`w-4 h-4 rounded border-2 items-center justify-center ${
                                        checked
                                          ? 'bg-[#4a3728] border-[#4a3728]'
                                          : 'bg-white border-[#c0b8b0]'
                                      }`}
                                    >
                                      {checked && (
                                        <Text className="text-white text-[9px] font-bold">✓</Text>
                                      )}
                                    </View>
                                    <Text className="text-xs text-[#4a3728]/80 flex-1">
                                      {subFeature.name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      ))}
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
              <Text className="text-white font-semibold text-sm">Add Selected</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default AddProfileSectionModal;