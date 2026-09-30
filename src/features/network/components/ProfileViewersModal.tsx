import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Eye, X, UserPlus, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { ConnectionService } from '../../../services/connection.service';
import { ProfileViewerDetail } from '../types/network.types';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

interface ProfileViewersModalProps {
  visible: boolean;
  onClose: () => void;
  onProfilePress?: (userId: string) => void;
  onConnect?: (userId: string) => void;
}

const ProfileViewersModal: React.FC<ProfileViewersModalProps> = ({
  visible,
  onClose,
  onProfilePress,
  onConnect,
}) => {
  const [viewers, setViewers] = useState<ProfileViewerDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchViewers = async () => {
      setIsLoading(true);
      try {
        const [viewersRes, countRes] = await Promise.allSettled([
          ConnectionService.getProfileViewers(20, 0),
          ConnectionService.getProfileViewCount(),
        ]);

        if (isMounted) {
          if (countRes.status === 'fulfilled') {
            setTotalViews(countRes.value?.data?.count || countRes.value?.count || 0);
          }

          if (viewersRes.status === 'fulfilled') {
            const raw = viewersRes.value?.data?.viewers || viewersRes.value?.data || [];
            const mapped: ProfileViewerDetail[] = (Array.isArray(raw) ? raw : []).map((v: any) => ({
              id: v._id || v.viewerId || v.id || '',
              userId: v.viewerId || v.userId || v._id || v.id || '',
              name: v.firstName
                ? `${v.firstName} ${v.lastName || ''}`.trim()
                : v.name || 'Member in your network',
              headline: v.headline || v.title || 'Viewed your profile recently',
              image: v.profilePhotoId || v.image || v.profileImage || '',
              viewedAt: v.createdAt || v.viewedAt || 'Recently',
              timeAgo: v.timeAgo || 'Recently',
            }));
            setViewers(mapped);
          }
        }
      } catch (e) {
        console.log('Failed to fetch profile viewers', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchViewers();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#f6ede8] rounded-t-3xl border-t-2 border-[#4a3728] max-h-[85%]"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-[#e0d8cf]">
            <View className="flex-row items-center gap-x-2.5">
              <View className="w-9 h-9 rounded-xl bg-[#e0d8cf] items-center justify-center">
                <Eye size={20} color={C.dark} />
              </View>
              <View>
                <Text className="text-base font-black text-[#4a3728]">
                  Profile Viewers ({totalViews || viewers.length})
                </Text>
                <Text className="text-xs text-[#4a3728]/70">
                  People who visited your profile in the last 30 days
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
                  Loading profile visitors...
                </Text>
              </View>
            ) : viewers.length === 0 ? (
              <View className="py-10 items-center justify-center bg-[#e0d8cf] p-6 rounded-3xl border border-[#4a3728]/20 mb-4">
                <Eye size={32} color={C.mid} />
                <Text className="font-black text-sm text-[#4a3728] mt-3 mb-1">
                  No profile views yet
                </Text>
                <Text className="text-xs text-center text-[#4a3728]/70">
                  When other students and recruiters visit your profile, they will appear here.
                </Text>
              </View>
            ) : (
              <View className="gap-y-3 mb-4">
                {viewers.map(viewer => (
                  <View
                    key={viewer.id}
                    className="flex-row items-center justify-between bg-[#e0d8cf] p-4 rounded-2xl border border-[#4a3728]/20"
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        onProfilePress?.(viewer.userId);
                      }}
                      className="flex-row items-center gap-x-3 flex-1 pr-2"
                    >
                      <Image
                        source={{
                          uri:
                            viewer.image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              viewer.name || 'User'
                            )}&background=f6ede8&color=4a3728&size=128`,
                        }}
                        className="w-11 h-11 rounded-2xl bg-[#f6ede8] border border-[#4a3728]/30"
                      />
                      <View className="flex-1">
                        <Text className="font-black text-sm text-[#4a3728]" numberOfLines={1}>
                          {viewer.name}
                        </Text>
                        <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>
                          {viewer.headline}
                        </Text>
                        <Text className="text-[10px] font-semibold text-[#7a5c3e] mt-0.5">
                          {viewer.timeAgo || 'Recently'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {onConnect && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onConnect(viewer.userId)}
                        className="bg-[#4a3728] px-3 py-2 rounded-xl flex-row items-center gap-x-1"
                      >
                        <UserPlus size={13} color="#f6ede8" />
                        <Text className="text-xs font-black text-[#f6ede8]">Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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

export default ProfileViewersModal;
