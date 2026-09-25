// src/features/home/components/modals/ReactorsModal.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { PostReactor, ReactionType } from '../../types/feed.types';
import FeedService from '../../../../services/feed.service';

interface ReactorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  celebrate: '👏',
  support: '🤝',
  love: '❤️',
  insightful: '💡',
  funny: '😂',
};

export const ReactorsModal: React.FC<ReactorsModalProps> = ({ isOpen, onClose, postId }: ReactorsModalProps) => {
  const navigation = useNavigation<any>();
  const [reactors, setReactors] = useState<PostReactor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen && postId) {
      loadReactors();
    }
  }, [isOpen, postId]);

  const loadReactors = async () => {
    setIsLoading(true);
    try {
      const data = await FeedService.getPostReactors(postId);
      setReactors(data);
    } catch (err) {
      console.error('Failed to load post reactors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReactors =
    selectedFilter === 'all'
      ? reactors
      : reactors.filter((r) => r.reactionType === selectedFilter);

  const filterTabs = [
    { key: 'all', label: `All ${reactors.length}` },
    ...Object.entries(REACTION_EMOJIS)
      .map(([type, emoji]) => {
        const count = reactors.filter((r) => r.reactionType === type).length;
        return { key: type, label: `${emoji} ${count}`, count };
      })
      .filter((t) => t.count > 0),
  ];

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#fdfbf9] rounded-t-3xl p-5 h-[70%] border-t border-[#e0d8cf]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-[#e0d8cf]">
            <Text className="text-base font-bold text-[#4a3728]">Reactions</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M6 18L18 6M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row items-center py-2.5 border-b border-[#e0d8cf]/60 gap-1.5 flex-wrap">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white/80 border-[#e0d8cf]'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-[#4a3728]'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reactors List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#4a3728" />
            </View>
          ) : filteredReactors.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-[#6b5643]/70">No reactions yet</Text>
            </View>
          ) : (
            <FlatList
              data={filteredReactors}
              keyExtractor={(item, index) => item.userId || index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
              renderItem={({ item }) => {
                const avatar =
                  item.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    item.name || 'User'
                  )}&background=e0d8cf&color=4a3728&size=128`;
                const reactionEmoji = REACTION_EMOJIS[item.reactionType] || '👍';

                return (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      if (item.userId) {
                        navigation.navigate('Profile', { userId: item.userId });
                      }
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between py-2.5 border-b border-[#e0d8cf]/30"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="relative">
                        <Image
                          source={{ uri: avatar }}
                          className="w-11 h-11 rounded-full border border-[#e0d8cf]"
                        />
                        <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <Text style={{ fontSize: 12 }}>{reactionEmoji}</Text>
                        </View>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#4a3728]" numberOfLines={1}>
                          {item.name || 'Throne8 Member'}
                        </Text>
                        <Text className="text-xs text-[#6b5643]" numberOfLines={1}>
                          {item.headline || item.role || 'Member'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReactorsModal;
