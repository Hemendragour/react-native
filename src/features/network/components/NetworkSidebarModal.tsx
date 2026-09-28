import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Globe, X, Activity, ChevronRight } from 'lucide-react-native';

const C = { dark: '#4a3728' };

const NetworkSidebarModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  statsData?: { connections: number; following: number; followers: number; groups: number };
  pendingCount?: number;
  onOpenTab?: (tab: 'connections' | 'requests' | 'following' | 'followers') => void;
  onOpenAnalytics?: () => void;
}> = ({
  visible,
  onClose,
  statsData = { connections: 0, following: 0, followers: 0, groups: 0 },
  pendingCount = 0,
  onOpenTab,
  onOpenAnalytics,
}) => {
  const safeStats = statsData || { connections: 0, following: 0, followers: 0, groups: 0 };
  const dynamicStats = [
    {
      label: 'Connections',
      icon: '🤝',
      count: safeStats.connections || 0,
      onPress: () => {
        onClose();
        onOpenTab?.('connections');
      },
    },
    {
      label: 'Pending Requests',
      icon: '⏰',
      count: pendingCount || 0,
      onPress: () => {
        onClose();
        onOpenTab?.('requests');
      },
    },
    {
      label: 'Following',
      icon: '👁️',
      count: safeStats.following || 0,
      onPress: () => {
        onClose();
        onOpenTab?.('following');
      },
    },
    {
      label: 'Followers',
      icon: '👥',
      count: safeStats.followers || 0,
      onPress: () => {
        onClose();
        onOpenTab?.('followers');
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#e0d8cf] rounded-t-3xl p-6 border-t-2 border-[#4a3728]"
          onPress={e => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-x-3">
              <View className="w-12 h-12 rounded-2xl bg-[#f6ede8] items-center justify-center">
                <Globe size={24} color={C.dark} />
              </View>
              <View>
                <Text className="text-xl font-black text-[#4a3728]">My Network</Text>
                <Text className="text-xs text-[#4a3728]/70">Build meaningful connections</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Network Analytics Banner in Sidebar */}
          {onOpenAnalytics && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onOpenAnalytics();
              }}
              className="flex-row items-center justify-between bg-[#4a3728] p-4 rounded-2xl mb-3.5 shadow-sm"
            >
              <View className="flex-row items-center gap-x-3">
                <View className="w-10 h-10 rounded-xl bg-[#f6ede8]/20 items-center justify-center">
                  <Activity size={20} color="#f6ede8" />
                </View>
                <View>
                  <Text className="font-black text-sm text-[#f6ede8]">
                    Network Health & Analytics
                  </Text>
                  <Text className="text-[11px] text-[#f6ede8]/70">
                    View reach score & growth insights
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#f6ede8" />
            </TouchableOpacity>
          )}

          <View className="gap-y-3 pb-4">
            {dynamicStats.map((item, i) => (
              <TouchableOpacity
                key={i}
                disabled={!item.onPress}
                onPress={item.onPress}
                activeOpacity={0.8}
                className="flex-row items-center justify-between bg-[#f6ede8] p-4 rounded-2xl shadow-sm"
              >
                <View className="flex-row items-center gap-x-3">
                  <View className="w-10 h-10 rounded-xl bg-[#e0d8cf] items-center justify-center">
                    <Text className="text-lg">{item.icon}</Text>
                  </View>
                  <Text className="font-bold text-sm text-[#4a3728]">{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  {item.count !== undefined && (
                    <View className="bg-[#e0d8cf] px-3 py-1 rounded-full">
                      <Text className="text-xs font-black text-[#4a3728]">{item.count}</Text>
                    </View>
                  )}
                  <ChevronRight size={15} color={C.dark} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NetworkSidebarModal;
