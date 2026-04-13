import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, ChevronDown, Share2, FileDown, Bookmark, Activity, Info } from 'lucide-react-native';
 
interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}
 
interface Resource {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  Icon: React.ElementType;
  onAction: () => void;
}
 
const ResourcesModal: React.FC<ResourcesModalProps> = ({ isOpen, onClose }) => {
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});
 
  const resources: Resource[] = [
    {
      id: 'message',
      title: 'Send profile in a message',
      description: 'Share your profile link with a message to your connections',
      buttonLabel: 'Send Message',
      Icon: Share2,
      onAction: () => console.log('Send profile'),
    },
    {
      id: 'pdf',
      title: 'Save to PDF',
      description: 'Download your profile as a PDF document',
      buttonLabel: 'Download PDF',
      Icon: FileDown,
      onAction: () => console.log('Save to PDF'),
    },
    {
      id: 'saved',
      title: 'Saved items',
      description: 'View all your saved items and collections',
      buttonLabel: 'View Saved Items',
      Icon: Bookmark,
      onAction: () => console.log('View saved items'),
    },
    {
      id: 'activity',
      title: 'Activity',
      description: 'Check your profile activity and engagement stats',
      buttonLabel: 'View Activity',
      Icon: Activity,
      onAction: () => console.log('View activity'),
    },
    {
      id: 'about',
      title: 'About this profile',
      description: 'Learn more about how profiles work and best practices',
      buttonLabel: 'Learn More',
      Icon: Info,
      onAction: () => console.log('About profile'),
    },
  ];
 
  const toggleResource = (id: string) =>
    setExpandedResources((prev) => ({ ...prev, [id]: !prev[id] }));
 
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
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
              <Text className="text-2xl font-bold text-white">Resources</Text>
              <Text className="text-white/70 text-sm mt-0.5">
                Manage and share your profile
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
              {resources.map((resource) => {
                const expanded = !!expandedResources[resource.id];
                return (
                  <View
                    key={resource.id}
                    className="border border-[#e0d8cf] rounded-xl overflow-hidden"
                  >
                    {/* Resource Row */}
                    <TouchableOpacity
                      onPress={() => toggleResource(resource.id)}
                      activeOpacity={0.8}
                      className="flex-row items-center gap-x-4 px-4 py-4 bg-[#f6ede8]"
                    >
                      <resource.Icon size={22} color="#4a3728" />
                      <Text className="flex-1 text-base font-semibold text-[#4a3728]">
                        {resource.title}
                      </Text>
                      <ChevronDown
                        size={18}
                        color="#4a3728"
                        style={{
                          transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                        }}
                      />
                    </TouchableOpacity>
 
                    {/* Expanded Details */}
                    {expanded && (
                      <View className="bg-white border-t border-[#e0d8cf] px-4 py-4 gap-y-3">
                        <Text className="text-sm text-[#4a3728]/80 leading-5">
                          {resource.description}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            resource.onAction();
                            toggleResource(resource.id);
                          }}
                          activeOpacity={0.8}
                          className="w-full py-2.5 bg-[#4a3728] rounded-xl items-center justify-center"
                        >
                          <Text className="text-white font-semibold text-sm">
                            {resource.buttonLabel}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <View className="h-4" />
          </ScrollView>
 
          {/* Footer */}
          <View className="px-5 py-4 border-t border-[#e0d8cf] bg-white">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="w-full py-3 rounded-full bg-[#4a3728] items-center justify-center"
            >
              <Text className="text-white font-semibold text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
 
export default ResourcesModal;