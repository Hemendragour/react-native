import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Modal, Pressable } from 'react-native';
import { Cake, Briefcase, Award, Sparkles, Send, CheckCircle2, MessageCircle } from 'lucide-react-native';
import { CatchUpItem } from '../types/network.types';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

interface CatchUpFeedSectionProps {
  items: CatchUpItem[];
  isLoading?: boolean;
  onProfilePress?: (userId: string) => void;
  onSendGreeting?: (item: CatchUpItem, message: string) => Promise<void> | void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'birthday':
      return <Cake size={16} color="#e07a5f" />;
    case 'work_anniversary':
      return <Award size={16} color="#81b29a" />;
    case 'job_change':
      return <Briefcase size={16} color="#3d405b" />;
    case 'milestone':
    default:
      return <Sparkles size={16} color="#f2cc8f" />;
  }
};

const getBadgeLabel = (type: string) => {
  switch (type) {
    case 'birthday':
      return 'Birthday 🎂';
    case 'work_anniversary':
      return 'Anniversary 🎖️';
    case 'job_change':
      return 'New Position 💼';
    case 'milestone':
    default:
      return 'Milestone 🌟';
  }
};

const CatchUpFeedSection: React.FC<CatchUpFeedSectionProps> = ({
  items,
  isLoading = false,
  onProfilePress,
  onSendGreeting,
}) => {
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<CatchUpItem | null>(null);
  const [customMsg, setCustomMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleQuickGreet = async (item: CatchUpItem) => {
    let msg = 'Congratulations on your milestone! 🎉';
    if (item.type === 'birthday') msg = 'Happy Birthday! Wishing you a fantastic year ahead! 🎂';
    if (item.type === 'work_anniversary') msg = 'Happy Work Anniversary! Keep inspiring! 🎖️';
    if (item.type === 'job_change') msg = 'Huge congratulations on the new role! Wishing you great success! 🚀';

    setSentMap(prev => ({ ...prev, [item.id]: true }));
    if (onSendGreeting) {
      await onSendGreeting(item, msg);
    }
  };

  const handleSendCustom = async () => {
    if (!activeItem || !customMsg.trim()) return;
    setIsSending(true);
    try {
      setSentMap(prev => ({ ...prev, [activeItem.id]: true }));
      if (onSendGreeting) {
        await onSendGreeting(activeItem, customMsg.trim());
      }
      setActiveItem(null);
      setCustomMsg('');
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoading && (!items || items.length === 0)) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center gap-x-2">
          <Sparkles size={18} color={C.dark} />
          <Text className="text-base font-black text-[#4a3728]">Catch Up & Celebrate</Text>
        </View>
        <View className="bg-[#4a3728] px-2.5 py-0.5 rounded-full">
          <Text className="text-xs font-black text-[#f6ede8]">{items.length}</Text>
        </View>
      </View>

      {/* Items List */}
      <View className="gap-y-3">
        {items.map(item => {
          const isSent = sentMap[item.id] || item.congratulated;
          return (
            <View
              key={item.id}
              className="bg-[#e0d8cf] p-4 rounded-3xl border border-[#4a3728]/20 shadow-sm"
            >
              <View className="flex-row items-start justify-between">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onProfilePress?.(item.userId)}
                  className="flex-row items-center gap-x-3 flex-1 pr-2"
                >
                  <Image
                    source={{
                      uri:
                        item.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.name || 'User'
                        )}&background=f6ede8&color=4a3728&size=128`,
                    }}
                    className="w-12 h-12 rounded-2xl bg-[#f6ede8] border border-[#4a3728]/30"
                  />
                  <View className="flex-1">
                    <Text className="font-black text-sm text-[#4a3728]" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.headline ? (
                      <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>
                        {item.headline}
                      </Text>
                    ) : null}
                    <View className="flex-row items-center gap-x-1.5 mt-1">
                      {getIconForType(item.type)}
                      <Text className="text-[11px] font-bold text-[#7a5c3e]">
                        {getBadgeLabel(item.type)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {item.date && (
                  <Text className="text-[10px] font-semibold text-[#4a3728]/60">{item.date}</Text>
                )}
              </View>

              {/* Event Description */}
              <View className="bg-[#f6ede8] p-3 rounded-2xl mt-3 mb-3 border border-[#4a3728]/10">
                <Text className="text-xs font-semibold text-[#4a3728] leading-4">
                  {item.title || item.description}
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center gap-x-2">
                {isSent ? (
                  <View className="flex-1 flex-row items-center justify-center gap-x-1.5 bg-[#81b29a]/20 py-2.5 rounded-2xl border border-[#81b29a]">
                    <CheckCircle2 size={16} color="#2d6a4f" />
                    <Text className="text-xs font-bold text-[#2d6a4f]">Wishes Sent</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleQuickGreet(item)}
                      className="flex-1 flex-row items-center justify-center gap-x-1.5 bg-[#4a3728] py-2.5 rounded-2xl"
                    >
                      <Sparkles size={15} color="#f6ede8" />
                      <Text className="text-xs font-black text-[#f6ede8]">
                        {item.type === 'birthday' ? 'Wish Happy Birthday 🎂' : 'Say Congrats 🎉'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setActiveItem(item);
                        setCustomMsg(
                          item.type === 'birthday'
                            ? 'Happy Birthday! 🎉'
                            : 'Congratulations on your achievement! 👏'
                        );
                      }}
                      className="p-2.5 rounded-2xl bg-[#f6ede8] border border-[#4a3728]"
                    >
                      <MessageCircle size={16} color={C.dark} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Custom Message Modal */}
      {activeItem && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setActiveItem(null)}>
          <Pressable
            className="flex-1 bg-black/50 justify-center p-4"
            onPress={() => setActiveItem(null)}
          >
            <Pressable
              className="bg-[#f6ede8] rounded-3xl p-5 border-2 border-[#4a3728]"
              onPress={e => e.stopPropagation()}
            >
              <Text className="text-base font-black text-[#4a3728] mb-1">
                Send Note to {activeItem.name}
              </Text>
              <Text className="text-xs text-[#4a3728]/70 mb-4">
                Personalize your message for their {getBadgeLabel(activeItem.type).toLowerCase()}
              </Text>

              <TextInput
                value={customMsg}
                onChangeText={setCustomMsg}
                placeholder="Write your heartfelt greeting..."
                placeholderTextColor="#7a5c3e80"
                multiline
                numberOfLines={4}
                className="bg-[#e0d8cf] p-4 rounded-2xl text-[#4a3728] font-medium text-sm border border-[#4a3728]/30 mb-4 h-28"
                textAlignVertical="top"
              />

              <View className="flex-row gap-x-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveItem(null)}
                  className="flex-1 py-3 rounded-2xl bg-[#e0d8cf] items-center justify-center border border-[#4a3728]"
                >
                  <Text className="font-bold text-xs text-[#4a3728]">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSendCustom}
                  disabled={isSending || !customMsg.trim()}
                  className={`flex-1 py-3 rounded-2xl flex-row items-center justify-center gap-x-2 ${
                    customMsg.trim() ? 'bg-[#4a3728]' : 'bg-[#4a3728]/40'
                  }`}
                >
                  <Send size={15} color="#f6ede8" />
                  <Text className="font-black text-xs text-[#f6ede8]">
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default CatchUpFeedSection;
