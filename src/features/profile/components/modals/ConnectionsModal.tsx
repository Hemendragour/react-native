import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@env';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthService, { api } from '../../../../services/auth.service';

// OLD: const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const BASE_URL = API_BASE_URL;
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: TabType;
}

type TabType = 'Followers' | 'Following' | 'Connections';

interface UserItem {
  id: string;
  userId: string;
  name: string;
  title: string;
  image: string;
  isConnected?: boolean;
}

function resolveImageUrl(raw: any, name?: string): string {
  if (raw && typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://'))) return raw;
  if (raw && typeof raw === 'string' && !raw.startsWith('http') && raw.length > 5) {
    return `${BASE_URL}/api/v1/profile/profile-photo/get-photo/${raw}`;
  }
  if (name && typeof name === 'string' && name.trim()) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0d8cf&color=4a3728&size=128`;
  }
  return DEFAULT_AVATAR;
}

function extractUserId(item: any, currentUser: string, tab: TabType): string | null {
  if (tab === 'Connections') {
    const toId = item.toUserId;
    const fromId = item.fromUserId;
    const toStr = typeof toId === 'string' ? toId : toId?._id || toId?.id || toId?.userId;
    const fromStr = typeof fromId === 'string' ? fromId : fromId?._id || fromId?.id || fromId?.userId;
    if (toStr === currentUser) return fromStr;
    if (fromStr === currentUser) return toStr;
    if (toStr) return toStr;
    if (fromStr) return fromStr;
    const userId = item.userId || item.user || item.connectedUserId;
    const userIdStr = typeof userId === 'string' ? userId : userId?._id || userId?.id || userId?.userId;
    if (userIdStr && userIdStr !== currentUser) return userIdStr;
    return null;
  }
  if (tab === 'Following') {
    const raw = item.followingId || item.user || item;
    return typeof raw === 'string' ? raw : raw?._id || raw?.id || raw?.userId || null;
  }
  const raw = item.followerId || item.user || item;
  return typeof raw === 'string' ? raw : raw?._id || raw?.id || raw?.userId || null;
}

function normalizeList(inputData: any): any[] {
  if (Array.isArray(inputData)) return inputData;
  if (inputData && Array.isArray(inputData.data)) return inputData.data;
  if (inputData && Array.isArray(inputData.connections)) return inputData.connections;
  if (inputData && inputData.data && Array.isArray(inputData.data.connections)) return inputData.data.connections;
  if (inputData && inputData.data && Array.isArray(inputData.data.data)) return inputData.data.data;
  return [];
}

const ConnectionsModal: React.FC<ConnectionsModalProps> = ({ isOpen, onClose, userId, initialTab }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'Connections');
  const [followers, setFollowers] = useState<UserItem[]>([]);
  const [following, setFollowing] = useState<UserItem[]>([]);
  const [connections, setConnections] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tabKeyRef = useRef(0);

  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const fetchUserProfile = async (uid: string): Promise<any> => {
    try {
      const profileRes = await AuthService.getUserProfileById(uid);
      const rawData = profileRes?.data?.data || profileRes?.data || profileRes;

      let profileData: any = {};
      if (rawData?.profile || rawData?.user) {
        profileData = { ...rawData.user, ...rawData.profile };
      } else {
        profileData = rawData || {};
      }

      if (!profileData.profileImage || !profileData.profileImage.startsWith('http')) {
        try {
          const photosRes = await api.get(`/api/v1/profile/profile-photo/user/${uid}/active`).catch(() => api.get(`/api/v1/profile/profile-photo/get-all-photos/${uid}`));
          const photosData = photosRes?.data?.data || photosRes?.data || [];
          const photosArray = Array.isArray(photosData) ? photosData : photosData?.photos || (photosData.url || photosData.cloudinarySecureUrl ? [photosData] : []);
          const activePhoto = Array.isArray(photosArray)
            ? photosArray.find((p: any) => (p.isActive || p.active) && (!p.userId || p.userId === uid)) || photosArray.find((p: any) => !p.userId || p.userId === uid) || photosArray[0]
            : null;
          const photoUrl = activePhoto?.cloudinarySecureUrl || activePhoto?.cloudinaryUrl || activePhoto?.url || activePhoto?.imageUrl || activePhoto?.photoUrl;
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
            profileData.profileImage = photoUrl;
          }
        } catch (e) {
          // Photo fetch failed, keep whatever we have
        }
      }

      return profileData;
    } catch (e) {
      return {};
    }
  };

  const mapDataToUser = async (inputData: any, tab: TabType): Promise<UserItem[]> => {
    const data = normalizeList(inputData);
    if (data.length === 0) return [];

    const mapped = await Promise.all(data.map(async (item: any) => {
      try {
        const targetId = extractUserId(item, userId, tab);
        if (!targetId) {
          return {
            id: item._id || item.id || 'unknown',
            userId: '',
            name: 'Unknown User',
            title: '',
            image: DEFAULT_AVATAR,
          };
        }

        let profileData: any = {};
        if (typeof targetId === 'string') {
          profileData = await fetchUserProfile(targetId);
        } else if (typeof targetId === 'object') {
          profileData = targetId;
        }

        const firstName = profileData.firstName || '';
        const lastName = profileData.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || profileData.name || profileData.username || 'Unknown User';
        const title = profileData.headline || profileData.title || 'Professional';
        const image = resolveImageUrl(profileData.profileImage || profileData.avatar || profileData.profilePhotoId, fullName);

        return {
          id: item._id || item.id || profileData._id || profileData.id || targetId,
          userId: targetId,
          name: fullName,
          title,
          image,
        };
      } catch (e) {
        return {
          id: item._id || item.id || 'error',
          userId: '',
          name: 'Unknown User',
          title: '',
          image: DEFAULT_AVATAR,
        };
      }
    }));
    return mapped;
  };

  const loadData = useCallback(async () => {
    if (!userId || !isOpen) return;
    setIsLoading(true);
    try {
      if (activeTab === 'Followers') {
        const res = await api.get(`/api/v1/connections/follow/followers/${userId}`);
        const data = res?.data?.data || res?.data || [];
        setFollowers(await mapDataToUser(data, 'Followers'));
      } else if (activeTab === 'Following') {
        const res = await api.get(`/api/v1/connections/follow/following/${userId}`);
        const data = res?.data?.data || res?.data || [];
        setFollowing(await mapDataToUser(data, 'Following'));
      } else if (activeTab === 'Connections') {
        const res = await api.get(`/api/v1/connections/connection/user/${userId}`);
        const rawPayload = res?.data?.data || res?.data || [];
        const data = Array.isArray(rawPayload)
          ? rawPayload
          : (Array.isArray(rawPayload?.data) ? rawPayload.data : Array.isArray(rawPayload?.connections) ? rawPayload.connections : []);
        setConnections(await mapDataToUser(data, 'Connections'));
      }
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, userId, isOpen, tabKeyRef.current]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const switchTab = (tab: TabType) => {
    if (tab === activeTab) return;
    tabKeyRef.current += 1;
    setIsLoading(true);
    setActiveTab(tab);
  };

  const handleProfilePress = (targetId: string) => {
    if (!targetId) return;
    onClose();
    navigation.push('Profile', { userId: targetId });
  };

  const renderList = () => {
    let list: UserItem[] = [];
    if (activeTab === 'Followers') list = followers;
    else if (activeTab === 'Following') list = following;
    else if (activeTab === 'Connections') list = connections;

    if (isLoading) {
      return (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-[#4a3728] mt-4 font-medium">Loading {activeTab.toLowerCase()}...</Text>
        </View>
      );
    }

    if (list.length === 0) {
      return (
        <View className="py-16 items-center justify-center">
          <View className="w-20 h-20 bg-[#e0d8cf]/30 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">📭</Text>
          </View>
          <Text className="text-[#4a3728]/80 text-base font-bold mb-1">No {activeTab.toLowerCase()} found</Text>
          <Text className="text-[#8b6f47]/60 text-xs text-center px-6">
            When you connect with people or follow them, they will appear here.
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-col gap-3 pb-8 px-1">
        {list.map(user => (
          <TouchableOpacity
            key={user.id}
            className="flex-row items-center gap-4 bg-white p-4 rounded-[20px] border border-[#e0d8cf]/60 shadow-sm"
            activeOpacity={0.7}
            onPress={() => handleProfilePress(user.userId)}
          >
            <View className="relative">
              <Image
                source={{ uri: user.image }}
                className="w-14 h-14 rounded-full bg-[#e0d8cf] border border-[#e0d8cf]/50"
              />
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#4a3728] mb-0.5" numberOfLines={1}>{user.name}</Text>
              <Text className="text-xs text-[#8b6f47] font-medium" numberOfLines={2}>{user.title}</Text>
            </View>
            <View className="bg-[#4a3728]/5 p-2 rounded-full border border-[#8b6f47]/10">
              <Text className="text-xs">↗️</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
          <Pressable className="bg-[#fcfaf8] rounded-t-[32px] p-6 pb-10 max-h-[85%] border-t border-[#e0d8cf]" onPress={() => { }}>

            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-[#4a3728]">Network</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Text className="text-sm font-bold text-[#8b6f47]">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-[#e0d8cf]/60 mb-5 relative">
              {(['Followers', 'Connections', 'Following'] as TabType[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => switchTab(tab)}
                  className={`flex-1 items-center pb-3 pt-1 ${activeTab === tab ? 'border-b-2 border-[#4a3728]' : ''}`}
                >
                  <Text className={`text-sm font-bold ${activeTab === tab ? 'text-[#4a3728]' : 'text-[#8b6f47]/50'}`}>
                    {tab}
                  </Text>
                  {activeTab === tab && (
                    <View className="absolute bottom-0 w-full h-[2px] bg-[#4a3728] rounded-t-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderList()}
            </ScrollView>

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ConnectionsModal;
