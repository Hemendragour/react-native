import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Users,
  X,
  Search,
  UserMinus,
  UserCheck,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import { API_BASE_URL } from '@env';
import { ConnectionService } from '../../../services/connection.service';
import AuthService, { api } from '../../../services/auth.service';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

const BASE_URL = API_BASE_URL || 'http://localhost:4000';
const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export type NetworkMemberTab = 'connections' | 'requests' | 'following' | 'followers';

export interface MemberItem {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  image: string;
  type: 'connection' | 'request' | 'following' | 'follower';
  subText?: string;
  raw?: any;
}

interface ConnectionsListModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  initialTab?: NetworkMemberTab;
  onProfilePress?: (userId: string) => void;
  onDataChanged?: () => void;
}

// Global cache across renders
const profileCache = new Map<string, { userId: string; name: string; headline: string; image: string }>();

function getBaseUrl(): string {
  const base = api.defaults.baseURL || BASE_URL;
  if (Platform.OS === 'android' && (base.includes('localhost') || base.includes('127.0.0.1'))) {
    return base.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return base;
}

function resolveImageUrl(raw: any, name?: string): string {
  if (!raw) {
    if (name && name.trim()) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name.trim()
      )}&background=4a3728&color=ffffff&bold=true&size=128`;
    }
    return DEFAULT_AVATAR;
  }

  if (typeof raw === 'object') {
    const url = raw.cloudinarySecureUrl || raw.cloudinaryUrl || raw.url || raw.imageUrl || raw.photoUrl;
    if (url && typeof url === 'string') return resolveImageUrl(url, name);
    if (raw._id || raw.id || raw.photoId) return resolveImageUrl(raw._id || raw.id || raw.photoId, name);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const base = getBaseUrl();
    if (trimmed.startsWith('/')) {
      return `${base}${trimmed}`;
    }
    if (trimmed.startsWith('uploads/') || trimmed.startsWith('api/')) {
      return `${base}/${trimmed}`;
    }
    return `${base}/api/v1/profile/profile-photo/get-photo/${trimmed}`;
  }

  return DEFAULT_AVATAR;
}

function extractUserId(item: any, currentUser: string, tab: NetworkMemberTab): string | null {
  if (!item) return null;

  if (tab === 'connections') {
    const toId = item.toUserId;
    const fromId = item.fromUserId;
    const toStr = typeof toId === 'string' ? toId : toId?._id || toId?.id || toId?.userId;
    const fromStr = typeof fromId === 'string' ? fromId : fromId?._id || fromId?.id || fromId?.userId;
    if (toStr && toStr !== currentUser) return toStr;
    if (fromStr && fromStr !== currentUser) return fromStr;
    const u = item.userId || item.user || item.connectedUserId;
    const uStr = typeof u === 'string' ? u : u?._id || u?.id || u?.userId;
    if (uStr && uStr !== currentUser) return uStr;
    return toStr || fromStr || null;
  }

  if (tab === 'following') {
    const raw = item.followingId || item.toUserId || item.user || item.userId || item;
    return typeof raw === 'string' ? raw : raw?._id || raw?.id || raw?.userId || null;
  }

  if (tab === 'followers') {
    const raw = item.followerId || item.fromUserId || item.user || item.userId || item;
    return typeof raw === 'string' ? raw : raw?._id || raw?.id || raw?.userId || null;
  }

  if (tab === 'requests') {
    const raw = item.fromUserId || item.toUserId || item.sender || item.receiver || item.user || item.userId || item;
    const rawStr = typeof raw === 'string' ? raw : raw?._id || raw?.id || raw?.userId;
    if (rawStr && rawStr !== currentUser) return rawStr;
    return rawStr || null;
  }

  return null;
}

async function fetchFullUserProfile(
  uid: string,
  rawObj: any = {},
  fallbackRole = 'Member'
): Promise<{ userId: string; name: string; headline: string; image: string }> {
  if (!uid || uid.length < 3) {
    const first = rawObj?.firstName || '';
    const last = rawObj?.lastName || '';
    const n = rawObj?.name || `${first} ${last}`.trim() || rawObj?.username || 'User';
    return {
      userId: '',
      name: n,
      headline: rawObj?.headline || rawObj?.title || fallbackRole,
      image: resolveImageUrl(rawObj?.profileImage || rawObj?.profilePhotoId || rawObj?.image, n),
    };
  }

  if (profileCache.has(uid)) {
    return profileCache.get(uid)!;
  }

  try {
    const [profileRes, photosRes] = await Promise.allSettled([
      AuthService.getUserProfileById(uid),
      api
        .get(`/api/v1/profile/profile-photo/user/${uid}/active`)
        .catch(() => api.get(`/api/v1/profile/profile-photo/get-all-photos/${uid}`)),
    ]);

    let merged: any = typeof rawObj === 'object' && rawObj !== null ? { ...rawObj } : {};

    if (profileRes.status === 'fulfilled') {
      const rawData = profileRes.value?.data?.data || profileRes.value?.data || profileRes.value;
      const p = rawData?.profile || {};
      const u = rawData?.user || rawData?.data || rawData || {};
      merged = { ...merged, ...u, ...p };
    }

    const firstName = merged.firstName || merged.user?.firstName || '';
    const lastName = merged.lastName || merged.user?.lastName || '';
    const nameFallback =
      merged.name ||
      merged.user?.name ||
      merged.username ||
      merged.user?.username ||
      (merged.email ? merged.email.split('@')[0] : 'Member');
    const fullName = `${firstName} ${lastName}`.trim() || nameFallback;

    const headline =
      merged.headline ||
      merged.user?.headline ||
      merged.title ||
      merged.user?.title ||
      merged.bio ||
      fallbackRole;

    // Resolve photo URL from photo service response
    let finalPhotoUrl = '';
    if (photosRes.status === 'fulfilled') {
      const photosData = photosRes.value?.data?.data || photosRes.value?.data || [];
      const photosArray = Array.isArray(photosData)
        ? photosData
        : photosData?.photos || (photosData?.url || photosData?.cloudinarySecureUrl ? [photosData] : []);

      if (Array.isArray(photosArray) && photosArray.length > 0) {
        const activePhoto =
          photosArray.find((p: any) => (p.isActive || p.active) && (!p.userId || p.userId === uid)) ||
          photosArray.find((p: any) => !p.userId || p.userId === uid) ||
          photosArray[0];

        finalPhotoUrl =
          activePhoto?.cloudinarySecureUrl ||
          activePhoto?.cloudinaryUrl ||
          activePhoto?.url ||
          activePhoto?.imageUrl ||
          activePhoto?.photoUrl ||
          activePhoto?.fileUrl ||
          activePhoto?._id ||
          activePhoto?.photoId ||
          '';
      }
    }

    if (!finalPhotoUrl) {
      finalPhotoUrl =
        merged.profileImage ||
        merged.user?.profileImage ||
        merged.profilePhotoId ||
        merged.user?.profilePhotoId ||
        merged.avatar ||
        merged.user?.avatar ||
        merged.image ||
        '';
    }

    const result = {
      userId: uid,
      name: fullName,
      headline,
      image: resolveImageUrl(finalPhotoUrl, fullName),
    };

    profileCache.set(uid, result);
    return result;
  } catch (e) {
    const first = rawObj?.firstName || '';
    const last = rawObj?.lastName || '';
    const n = rawObj?.name || `${first} ${last}`.trim() || rawObj?.username || 'Member';
    const fallback = {
      userId: uid,
      name: n,
      headline: rawObj?.headline || rawObj?.title || fallbackRole,
      image: resolveImageUrl(rawObj?.profileImage || rawObj?.profilePhotoId, n),
    };
    profileCache.set(uid, fallback);
    return fallback;
  }
}

const MemberAvatarItem: React.FC<{ image: string; name: string }> = ({ image, name }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'User'
  )}&background=4a3728&color=ffffff&bold=true&size=128`;

  return (
    <View className="w-12 h-12 rounded-2xl bg-[#f6ede8] border border-[#4a3728]/30 overflow-hidden items-center justify-center">
      <Image
        source={{ uri: !hasError && image ? image : fallback }}
        onError={() => setHasError(true)}
        className="w-12 h-12 rounded-2xl"
        resizeMode="cover"
      />
    </View>
  );
};

const ConnectionsListModal: React.FC<ConnectionsListModalProps> = ({
  visible,
  onClose,
  currentUserId,
  initialTab = 'connections',
  onProfilePress,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<NetworkMemberTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [connections, setConnections] = useState<MemberItem[]>([]);
  const [requests, setRequests] = useState<MemberItem[]>([]);
  const [following, setFollowing] = useState<MemberItem[]>([]);
  const [followers, setFollowers] = useState<MemberItem[]>([]);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const fetchTabData = useCallback(async () => {
    if (!currentUserId || !visible) return;
    setIsLoading(true);
    try {
      if (activeTab === 'connections') {
        const res = await ConnectionService.getUserConnections(currentUserId, 1, 100);
        const raw = res?.data?.data || res?.data?.connections || res?.data || [];
        const list = Array.isArray(raw) ? raw : raw?.data || [];

        const mapped = await Promise.all(
          list.map(async (c: any) => {
            const targetId = extractUserId(c, currentUserId, 'connections');
            const profile = await fetchFullUserProfile(targetId || '', c, '1st degree connection');

            return {
              id: c._id || c.id || profile.userId,
              userId: profile.userId,
              name: profile.name,
              headline: profile.headline,
              image: profile.image,
              type: 'connection' as const,
              subText: c.createdAt ? `Connected ${new Date(c.createdAt).toLocaleDateString()}` : '1st degree',
              raw: c,
            };
          })
        );
        setConnections(mapped);
      } else if (activeTab === 'requests') {
        const [inRes, outRes] = await Promise.allSettled([
          ConnectionService.getIncomingRequests(currentUserId),
          ConnectionService.getOutgoingRequests(currentUserId),
        ]);

        const inRaw =
          inRes.status === 'fulfilled'
            ? inRes.value?.data?.data || inRes.value?.data || inRes.value || []
            : [];
        const outRaw =
          outRes.status === 'fulfilled'
            ? outRes.value?.data?.data || outRes.value?.data || outRes.value || []
            : [];

        const inItems = Array.isArray(inRaw) ? inRaw : inRaw?.data || [];
        const outItems = Array.isArray(outRaw) ? outRaw : outRaw?.data || [];

        const inMapped = await Promise.all(
          inItems.map(async (r: any) => {
            const senderId = extractUserId(r, currentUserId, 'requests');
            const profile = await fetchFullUserProfile(senderId || '', r, 'Incoming Request');

            return {
              id: r._id || r.id || r.requestId || profile.userId,
              userId: profile.userId,
              name: profile.name,
              headline: profile.headline,
              image: profile.image,
              type: 'request' as const,
              subText: 'Received request',
              raw: { ...r, isIncoming: true },
            };
          })
        );

        const outMapped = await Promise.all(
          outItems.map(async (r: any) => {
            const receiverId = extractUserId(r, currentUserId, 'requests');
            const profile = await fetchFullUserProfile(receiverId || '', r, 'Outgoing Request');

            return {
              id: r._id || r.id || r.requestId || profile.userId,
              userId: profile.userId,
              name: profile.name,
              headline: profile.headline,
              image: profile.image,
              type: 'request' as const,
              subText: 'Sent • Pending response',
              raw: { ...r, isIncoming: false },
            };
          })
        );

        setRequests([...inMapped, ...outMapped]);
      } else if (activeTab === 'following') {
        const res = await ConnectionService.getFollowing(currentUserId, 1, 100);
        const raw = res?.data?.following || res?.data?.data || res?.data || [];
        const list = Array.isArray(raw) ? raw : raw?.data || [];

        const mapped = await Promise.all(
          list.map(async (f: any) => {
            const targetId = extractUserId(f, currentUserId, 'following');
            const profile = await fetchFullUserProfile(targetId || '', f, 'Following');

            return {
              id: f._id || f.id || profile.userId,
              userId: profile.userId,
              name: profile.name,
              headline: profile.headline,
              image: profile.image,
              type: 'following' as const,
              subText: 'You are following',
              raw: f,
            };
          })
        );
        setFollowing(mapped);
      } else if (activeTab === 'followers') {
        const res = await ConnectionService.getFollowers(currentUserId, 1, 100);
        const raw = res?.data?.followers || res?.data?.data || res?.data || [];
        const list = Array.isArray(raw) ? raw : raw?.data || [];

        const mapped = await Promise.all(
          list.map(async (f: any) => {
            const targetId = extractUserId(f, currentUserId, 'followers');
            const profile = await fetchFullUserProfile(targetId || '', f, 'Follower');

            return {
              id: f._id || f.id || profile.userId,
              userId: profile.userId,
              name: profile.name,
              headline: profile.headline,
              image: profile.image,
              type: 'follower' as const,
              subText: 'Follows your profile',
              raw: f,
            };
          })
        );
        setFollowers(mapped);
      }
    } catch (e) {
      console.log(`Failed to fetch tab data for ${activeTab}`, e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, visible, activeTab]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // Actions
  const handleRemoveConnection = (item: MemberItem) => {
    Alert.alert(
      'Remove Connection',
      `Are you sure you want to remove ${item.name} from your connections?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(item.id);
            try {
              await ConnectionService.removeConnection(item.id);
              ConnectionService.removeConnected(item.userId);
              setConnections(prev => prev.filter(c => c.id !== item.id));
              onDataChanged?.();
            } catch (e) {
              console.error('Failed to remove connection', e);
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUnfollow = async (item: MemberItem) => {
    setActionLoadingId(item.id);
    try {
      await ConnectionService.unfollowUser(item.userId);
      ConnectionService.removeFollowing(item.userId);
      setFollowing(prev => prev.filter(f => f.id !== item.id));
      onDataChanged?.();
    } catch (e) {
      console.error('Failed to unfollow user', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (item: MemberItem) => {
    setActionLoadingId(item.id);
    try {
      await ConnectionService.acceptRequest(item.id);
      setRequests(prev => prev.filter(r => r.id !== item.id));
      onDataChanged?.();
    } catch (e) {
      console.error('Failed to accept request', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRequest = async (item: MemberItem) => {
    setActionLoadingId(item.id);
    try {
      await ConnectionService.cancelRequest(item.id);
      ConnectionService.removePending(item.userId);
      setRequests(prev => prev.filter(r => r.id !== item.id));
      onDataChanged?.();
    } catch (e) {
      console.error('Failed to cancel request', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'connections':
        return connections;
      case 'requests':
        return requests;
      case 'following':
        return following;
      case 'followers':
        return followers;
    }
  }, [activeTab, connections, requests, following, followers]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase();
    return currentList.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.headline && item.headline.toLowerCase().includes(q))
    );
  }, [currentList, searchQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#f6ede8] rounded-t-3xl border-t-2 border-[#4a3728] max-h-[88%]"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-3 border-b border-[#e0d8cf]">
            <View className="flex-row items-center gap-x-2.5">
              <View className="w-9 h-9 rounded-xl bg-[#e0d8cf] items-center justify-center">
                <Users size={20} color={C.dark} />
              </View>
              <View>
                <Text className="text-base font-black text-[#4a3728]">My Network Directory</Text>
                <Text className="text-xs text-[#4a3728]/70">Live real connections & profiles</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View className="flex-row px-4 pt-3 pb-2 gap-x-2 border-b border-[#e0d8cf]">
            {[
              { key: 'connections' as const, label: 'Connections', count: connections.length },
              { key: 'requests' as const, label: 'Requests', count: requests.length },
              { key: 'following' as const, label: 'Following', count: following.length },
              { key: 'followers' as const, label: 'Followers', count: followers.length },
            ].map(t => {
              const isActive = activeTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveTab(t.key);
                    setSearchQuery('');
                  }}
                  className={`flex-1 py-2 rounded-xl items-center ${
                    isActive ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'
                  }`}
                >
                  <Text
                    className={`text-xs font-black ${
                      isActive ? 'text-[#f6ede8]' : 'text-[#4a3728]'
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Search bar & Refresh */}
          <View className="px-6 pt-3 pb-2 flex-row items-center gap-x-2">
            <View className="flex-1 flex-row items-center bg-[#e0d8cf] px-3.5 py-2 rounded-2xl border border-[#4a3728]/30">
              <Search size={16} color={C.dark} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Search in ${activeTab}...`}
                placeholderTextColor="#7a5c3e80"
                className="flex-1 ml-2 text-sm text-[#4a3728] font-medium p-0"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={C.dark} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => {
                profileCache.clear();
                fetchTabData();
              }}
              activeOpacity={0.7}
              className="p-2.5 rounded-2xl bg-[#e0d8cf] border border-[#4a3728]/30"
            >
              <RefreshCw size={15} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView showsVerticalScrollIndicator={false} className="p-6 pt-2">
            {isLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="small" color={C.dark} />
                <Text className="text-xs font-semibold text-[#7a5c3e] mt-3">
                  Loading real {activeTab}...
                </Text>
              </View>
            ) : filteredList.length === 0 ? (
              <View className="py-10 items-center justify-center bg-[#e0d8cf] p-6 rounded-3xl border border-[#4a3728]/20 mb-4">
                <Users size={32} color={C.mid} />
                <Text className="font-black text-sm text-[#4a3728] mt-3 mb-1">
                  {searchQuery ? 'No matching members found' : `No ${activeTab} yet`}
                </Text>
                <Text className="text-xs text-center text-[#4a3728]/70">
                  {searchQuery
                    ? 'Try searching with another name or title.'
                    : `Your ${activeTab} will dynamically populate with real users here.`}
                </Text>
              </View>
            ) : (
              <View className="gap-y-3 mb-4">
                {filteredList.map(item => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between bg-[#e0d8cf] p-4 rounded-2xl border border-[#4a3728]/20"
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        if (item.userId) onProfilePress?.(item.userId);
                      }}
                      className="flex-row items-center gap-x-3 flex-1 pr-2"
                    >
                      <MemberAvatarItem image={item.image} name={item.name} />
                      <View className="flex-1">
                        <Text className="font-black text-sm text-[#4a3728]" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="text-xs text-[#4a3728]/70" numberOfLines={1}>
                          {item.headline}
                        </Text>
                        {item.subText && (
                          <Text className="text-[10px] font-semibold text-[#7a5c3e] mt-0.5">
                            {item.subText}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Action buttons depending on tab */}
                    {activeTab === 'connections' && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleRemoveConnection(item)}
                        disabled={actionLoadingId === item.id}
                        className="p-2.5 rounded-xl bg-[#f6ede8] border border-[#4a3728]/40"
                      >
                        {actionLoadingId === item.id ? (
                          <ActivityIndicator size="small" color={C.dark} />
                        ) : (
                          <UserMinus size={15} color={C.dark} />
                        )}
                      </TouchableOpacity>
                    )}

                    {activeTab === 'following' && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleUnfollow(item)}
                        disabled={actionLoadingId === item.id}
                        className="px-3 py-1.5 rounded-xl bg-[#f6ede8] border border-[#4a3728]/40"
                      >
                        {actionLoadingId === item.id ? (
                          <ActivityIndicator size="small" color={C.dark} />
                        ) : (
                          <Text className="text-xs font-bold text-[#4a3728]">Unfollow</Text>
                        )}
                      </TouchableOpacity>
                    )}

                    {activeTab === 'requests' && (
                      <View className="flex-row gap-x-1.5">
                        {item.raw?.isIncoming ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleAcceptRequest(item)}
                            disabled={actionLoadingId === item.id}
                            className="p-2 rounded-xl bg-[#4a3728]"
                          >
                            <Check size={14} color="#f6ede8" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleCancelRequest(item)}
                            disabled={actionLoadingId === item.id}
                            className="px-2.5 py-1.5 rounded-xl bg-[#f6ede8] border border-[#4a3728]"
                          >
                            <Text className="text-[11px] font-bold text-[#4a3728]">Withdraw</Text>
                          </TouchableOpacity>
                        )}
                      </View>
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
              <Text className="font-black text-sm text-[#f6ede8]">Close Directory</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConnectionsListModal;
