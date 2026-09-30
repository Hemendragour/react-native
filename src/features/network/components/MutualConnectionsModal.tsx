import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Users, X, UserCheck, MessageSquare } from 'lucide-react-native';
import { ConnectionService } from '../../../services/connection.service';
import { MutualConnectionUser } from '../types/network.types';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

interface MutualConnectionsModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  targetUser: { id: string; name: string } | null;
  onProfilePress?: (userId: string) => void;
}

const MutualConnectionsModal: React.FC<MutualConnectionsModalProps> = ({
  visible,
  onClose,
  currentUserId,
  targetUser,
  onProfilePress,
}) => {
  const [mutuals, setMutuals] = useState<MutualConnectionUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible || !currentUserId || !targetUser?.id) return;

    let isMounted = true;
    const fetchMutuals = async () => {
      setIsLoading(true);
      try {
        const res = await ConnectionService.getMutualConnections(currentUserId, targetUser.id);
        const list = res?.data?.mutualConnections || res?.data || [];
        if (isMounted) {
          const mapped: MutualConnectionUser[] = (Array.isArray(list) ? list : []).map((m: any) => ({
            id: m._id || m.userId || m.id || '',
            userId: m.userId || m._id || m.id || '',
            name: m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m.name || 'Connection',
            headline: m.headline || m.title || 'Connected member',
            image: m.profilePhotoId || m.image || m.profileImage || '',
          }));
          setMutuals(mapped);
        }
      } catch (e) {
        console.log('Failed to fetch mutual connections', e);
        if (isMounted) setMutuals([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMutuals();
    return () => {
      isMounted = false;
    };
  }, [visible, currentUserId, targetUser?.id]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#f6ede8] rounded-t-3xl border-t-2 border-[#4a3728] max-h-[80%]"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-[#e0d8cf]">
            <View className="flex-row items-center gap-x-2.5">
              <View className="w-9 h-9 rounded-xl bg-[#e0d8cf] items-center justify-center">
                <Users size={20} color={C.dark} />
              </View>
              <View>
                <Text className="text-base font-black text-[#4a3728]">
                  Mutual Connections
                </Text>
                <Text className="text-xs text-[#4a3728]/70">
                  Shared with {targetUser?.name || 'user'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView showsVerticalScrollIndicator={false} className="p-6">
            {isLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="small" color={C.dark} />
                <Text className="text-xs font-semibold text-[#7a5c3e] mt-3">
                  Finding shared connections...
                </Text>
              </View>
            ) : mutuals.length === 0 ? (
              <View className="py-10 items-center justify-center bg-[#e0d8cf] p-6 rounded-3xl border border-[#4a3728]/20 mb-4">
                <Users size={32} color={C.mid} />
                <Text className="font-black text-sm text-[#4a3728] mt-3 mb-1">
                  No direct mutual connections found
                </Text>
                <Text className="text-xs text-center text-[#4a3728]/70">
                  You are exploring extended 2nd or 3rd degree graph connections.
                </Text>
              </View>
            ) : (
              <View className="gap-y-3 mb-4">
                {mutuals.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      onClose();
                      onProfilePress?.(user.userId);
                    }}
                    className="flex-row items-center justify-between bg-[#e0d8cf] p-4 rounded-2xl border border-[#4a3728]/20"
                  >
                    <View className="flex-row items-center gap-x-3 flex-1 pr-2">
                      <Image
                        source={{
                          uri:
                            user.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || 'U'
                            )}&background=f6ede8&color=4a3728&size=128`,
                        }}
                        className="w-11 h-11 rounded-2xl bg-[#f6ede8] border border-[#4a3728]/30"
                      />
                      <View className="flex-1">
                        <Text className="font-black text-sm text-[#4a3728]" numberOfLines={1}>
                          {user.name}
                        </Text>
                        <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>
                          {user.headline}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-x-1.5 bg-[#f6ede8] px-3 py-1.5 rounded-xl border border-[#4a3728]/30">
                      <UserCheck size={14} color={C.dark} />
                      <Text className="text-[11px] font-bold text-[#4a3728]">1st</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="bg-[#4a3728] py-3.5 rounded-2xl items-center mb-6"
            >
              <Text className="font-black text-sm text-[#f6ede8]">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default MutualConnectionsModal;
