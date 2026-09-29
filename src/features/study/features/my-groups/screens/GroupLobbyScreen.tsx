import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft, ChevronRight, Video, Users, Crown, Clock,
  UserX, Radio,
} from 'lucide-react-native';
import { StudyService } from '../../../../../services/study.service';
import AuthService, { api } from '../../../../../services/auth.service';
import { fetchAllProfilePhotos, fetchMyProfile } from '../../../../../store/slices/profileSlice';
import { useAppSelector, useAppDispatch } from '../../../store';
import type { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../theme/colors';

type Nav  = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupLobby'>;

interface GroupMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline?: boolean;
  studyTime?: number;
}

// ─── Avatar Helpers ───────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const base = api.defaults.baseURL || 'http://localhost:4000';
  if (Platform.OS === 'android' && (base.includes('localhost') || base.includes('127.0.0.1'))) {
    return base.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return base;
}

function resolveAvatarUri(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

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

function initialsOf(name: string) {
  const parts = (name || '').trim().split(' ').filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

// ─── Avatar Component ──────────────────────────────────────────────────────────

const MemberAvatar: React.FC<{
  uri?: string; name: string; size?: number; isAdmin?: boolean;
}> = ({ uri, name, size = 54, isAdmin }) => {
  const [imgError, setImgError] = useState(false);
  const resolved = resolveAvatarUri(uri);
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${isAdmin ? 'c9932a' : '4a3728'}&color=ffffff&bold=true&size=128`;
  const finalUri = (!imgError && resolved) ? resolved : fallbackUrl;

  const borderColor = isAdmin ? '#c9932a' : '#d4c4b5';
  const borderWidth = isAdmin ? 2.5 : 1.5;

  useEffect(() => {
    setImgError(false);
  }, [uri]);

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri: finalUri }}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2.5,
          borderWidth,
          borderColor,
          backgroundColor: isAdmin ? '#4a3728' : '#e0d8cf',
        }}
        resizeMode="cover"
      />
      {isAdmin && (
        <View style={ss.crownBadge}>
          <Crown size={10} color="#fff" fill="#fff" />
        </View>
      )}
    </View>
  );
};

// ─── Stats Banner (Video Room Count & Total Members) ──────────────────────────

const StatsBanner: React.FC<{
  videoRoomCount: number;
  totalMembers: number;
}> = ({ videoRoomCount, totalMembers }) => {
  return (
    <View style={ss.statsContainer}>
      {/* Video Room Active Status Card */}
      <View style={[ss.statCard, ss.statCardLive]}>
        <View style={ss.statIconRow}>
          <View style={[ss.pulseDot, videoRoomCount > 0 && ss.pulseDotActive]} />
          <Radio size={14} color={videoRoomCount > 0 ? '#16a34a' : '#9ca3af'} />
          <Text style={[ss.statLabel, videoRoomCount > 0 && { color: '#15803d' }]}>
            IN VIDEO ROOM
          </Text>
        </View>
        <View style={ss.statNumberRow}>
          <Text style={[ss.statValue, videoRoomCount > 0 && { color: '#166534' }]}>
            {videoRoomCount}
          </Text>
          <Text style={ss.statUnit}>
            {videoRoomCount === 1 ? 'person active' : 'people active'}
          </Text>
        </View>
      </View>

      {/* Total Members Count Card */}
      <View style={ss.statCard}>
        <View style={ss.statIconRow}>
          <Users size={14} color={colors.primary} />
          <Text style={ss.statLabel}>TOTAL MEMBERS</Text>
        </View>
        <View style={ss.statNumberRow}>
          <Text style={ss.statValue}>{totalMembers}</Text>
          <Text style={ss.statUnit}>
            {totalMembers === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ─── Admin Card ───────────────────────────────────────────────────────────────

const AdminCard: React.FC<{
  member: GroupMember;
  isYou: boolean;
  selfAvatar?: string;
  onPress: (member: GroupMember) => void;
}> = ({ member, isYou, selfAvatar, onPress }) => {
  const avatarToUse = isYou && selfAvatar ? selfAvatar : member.avatar;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(member)}
      style={ss.adminCard}
    >
      <MemberAvatar uri={avatarToUse} name={member.name} size={62} isAdmin />

      <View style={{ flex: 1, minWidth: 0, marginLeft: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={ss.adminName} numberOfLines={1}>
            {member.name}{isYou ? ' (You)' : ''}
          </Text>
          <View
            style={[ss.onlineDot, {
              backgroundColor: member.isOnline !== false ? '#16a34a' : '#d1d5db',
            }]}
          />
        </View>

        <View style={ss.adminBadgeRow}>
          <Crown size={12} color="#c9932a" fill="#c9932a" />
          <Text style={ss.adminBadgeTxt}>Admin · Group Creator</Text>
        </View>

        {!!member.studyTime && member.studyTime > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Clock size={11} color={colors.textMuted} />
            <Text style={ss.studyTimeTxt}>{member.studyTime}h studied</Text>
          </View>
        ) : null}
      </View>

      <ChevronRight size={18} color="#c9932a" />
    </TouchableOpacity>
  );
};

// ─── Member Card ──────────────────────────────────────────────────────────────

const MemberCard: React.FC<{
  member: GroupMember;
  isYou: boolean;
  viewerIsAdmin: boolean;
  selfAvatar?: string;
  onPress: (member: GroupMember) => void;
  onRemove: (member: GroupMember) => void;
}> = ({ member, isYou, viewerIsAdmin, selfAvatar, onPress, onRemove }) => {
  const isMod = member.role === 'moderator';
  const avatarToUse = isYou && selfAvatar ? selfAvatar : member.avatar;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(member)}
      style={[ss.memberCard, isYou && ss.memberCardSelf]}
    >
      <MemberAvatar uri={avatarToUse} name={member.name} size={50} />

      <View style={ss.memberInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={ss.memberName} numberOfLines={1}>
            {member.name}{isYou ? ' (You)' : ''}
          </Text>
          <View
            style={[ss.onlineDot, {
              backgroundColor: member.isOnline !== false ? '#16a34a' : '#d1d5db',
            }]}
          />
        </View>

        <Text style={[ss.memberRole, { color: isMod ? '#7c3aed' : colors.textMuted }]}>
          {isMod ? '⚡ Moderator' : 'Member'}
        </Text>

        {!!member.studyTime && member.studyTime > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Clock size={11} color={colors.textMuted} />
            <Text style={ss.studyTimeTxt}>{member.studyTime}h studied</Text>
          </View>
        ) : null}
      </View>

      {/* Admin only: remove button (not shown on self) */}
      {viewerIsAdmin && !isYou ? (
        <TouchableOpacity
          onPress={() => onRemove(member)}
          activeOpacity={0.75}
          style={ss.removeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <UserX size={16} color="#dc2626" />
          <Text style={ss.removeBtnTxt}>Remove</Text>
        </TouchableOpacity>
      ) : (
        <ChevronRight size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function GroupLobbyScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const dispatch   = useAppDispatch();
  const { groupId, groupName } = route.params;

  // Current viewer state from Redux
  const mainProfile    = useAppSelector((s: any) => s.profile?.data);
  const profilePhotos  = useAppSelector((s: any) => s.profile?.profilePhotos);
  const authUser       = useAppSelector((s: any) => s.auth?.user);
  const dashboardUser  = useAppSelector((s: any) => s.dashboard?.user);
  const studyProfile   = useAppSelector((s: any) => s.studyProfile);

  const currentUserId = String(
    mainProfile?.userId || mainProfile?._id || mainProfile?.id ||
    authUser?.userId || authUser?._id || authUser?.id ||
    dashboardUser?.userId || dashboardUser?._id || dashboardUser?.id || ''
  );

  // Self avatar resolution directly from the main user profile / active photo
  const activeSelfPhoto = profilePhotos?.find((p: any) => p.isActive || p.active) || profilePhotos?.[0];
  const selfAvatar = (
    activeSelfPhoto?.cloudinarySecureUrl ||
    activeSelfPhoto?.cloudinaryUrl ||
    activeSelfPhoto?.url ||
    activeSelfPhoto?.imageUrl ||
    activeSelfPhoto?.photoUrl ||
    mainProfile?.profileImage ||
    mainProfile?.avatar ||
    studyProfile?.profileImage ||
    studyProfile?.avatar ||
    dashboardUser?.profileImage ||
    dashboardUser?.avatar ||
    authUser?.avatar ||
    ''
  );

  // Data state
  const [members, setMembers]             = useState<GroupMember[]>([]);
  const [videoRoomCount, setVideoRoomCount] = useState<number>(0);
  const [groupCreatorId, setGroupCreatorId] = useState<string>('');
  const [loading, setLoading]             = useState(true);

  // Fetch current user photos and profile on mount
  useEffect(() => {
    dispatch(fetchAllProfilePhotos());
    dispatch(fetchMyProfile());
  }, [dispatch]);

  // Keep members avatar in sync when selfAvatar arrives from Redux
  useEffect(() => {
    if (selfAvatar && currentUserId) {
      setMembers(prev => prev.map(m => {
        if (String(m.userId) === String(currentUserId) && (!m.avatar || !m.avatar.startsWith('http'))) {
          return { ...m, avatar: selfAvatar };
        }
        return m;
      }));
    }
  }, [selfAvatar, currentUserId]);

  // ── Load Group Details & Members ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const gid = String(groupId);

      const [groupRes, m1Res, m2Res, liveStatsRes, activeLiveRoomRes] = await Promise.allSettled([
        StudyService.getGroupById(gid),
        StudyService.getGroupMembers(gid),
        StudyService.getMembers(gid),
        StudyService.getGroupLiveRoomStats(gid),
        StudyService.getActiveGroupLiveRoom(gid),
      ]);

      // 1) Parse group info & creator
      const groupData = groupRes.status === 'fulfilled'
        ? groupRes.value?.data?.group || groupRes.value?.data || groupRes.value
        : null;

      const creatorId = String(
        groupData?.creatorId ||
        groupData?.creator?._id ||
        groupData?.creator?.id ||
        groupData?.createdBy ||
        groupData?.adminId ||
        groupData?.ownerId ||
        groupData?.admin?._id ||
        groupData?.admin?.id ||
        groupData?.userId ||
        ''
      );
      setGroupCreatorId(creatorId);

      // 2) Parse video room count
      let liveCount = 0;
      if (activeLiveRoomRes.status === 'fulfilled') {
        const room = activeLiveRoomRes.value?.data?.room || activeLiveRoomRes.value?.data || activeLiveRoomRes.value;
        if (room && Array.isArray(room.participants)) {
          liveCount = room.participants.length;
        } else if (typeof room?.participantCount === 'number') {
          liveCount = room.participantCount;
        }
      }
      if (liveCount === 0 && liveStatsRes.status === 'fulfilled') {
        const stats = liveStatsRes.value?.data?.stats || liveStatsRes.value?.data || liveStatsRes.value;
        if (typeof stats?.activeParticipants === 'number') {
          liveCount = stats.activeParticipants;
        } else if (typeof stats?.totalActiveUsers === 'number') {
          liveCount = stats.totalActiveUsers;
        }
      }
      setVideoRoomCount(liveCount);

      // 3) Parse all member lists
      const raw1 = m1Res.status === 'fulfilled'
        ? m1Res.value?.data?.members || m1Res.value?.data || m1Res.value || []
        : [];
      const raw2 = m2Res.status === 'fulfilled'
        ? m2Res.value?.data?.members || m2Res.value?.data || m2Res.value || []
        : [];
      const rawGroupMembers = groupData?.members || [];

      const all = [
        ...(Array.isArray(raw1) ? raw1 : []),
        ...(Array.isArray(raw2) ? raw2 : []),
        ...(Array.isArray(rawGroupMembers) ? rawGroupMembers : []),
      ];

      const seen = new Set<string>();
      const unique: GroupMember[] = [];

      // If group has creator object and not in list yet, include creator
      if (groupData?.creator || groupData?.owner) {
        const c = groupData.creator || groupData.owner;
        const cid = String(c._id || c.id || c.userId || creatorId);
        if (cid) {
          seen.add(cid);
          const cName = c.fullName || (c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : '') || c.name || 'Group Creator';
          const cAvatar = c.profileImage || c.avatar || c.profilePic || c.cloudinaryUrl || c.photoUrl;
          unique.push({
            userId: cid,
            name: cName,
            avatar: cAvatar || (cid === currentUserId ? selfAvatar : undefined),
            role: 'admin',
            isOnline: true,
            studyTime: c.studyTime || 0,
          });
        }
      }

      for (const m of all) {
        const uid = String(
          m.userId || m.user?.userId || m.user?._id || m._id || m.id || ''
        );

        if (uid && !seen.has(uid)) {
          seen.add(uid);

          const isCreatorOrAdmin =
            (creatorId && uid === creatorId) ||
            m.role === 'admin' ||
            m.role === 'creator' ||
            m.role === 'owner' ||
            m.role === 'leader' ||
            m.isAdmin === true ||
            m.isCreator === true ||
            m.isOwner === true ||
            m.isLeader === true;

          const role: GroupMember['role'] = isCreatorOrAdmin
            ? 'admin'
            : m.role === 'moderator' || m.isModerator
            ? 'moderator'
            : 'member';

          // Resolve avatar across possible fields
          const avatar =
            m.avatar ||
            m.profileImage ||
            m.profilePic ||
            m.profilePhoto ||
            m.profilePhotoUrl ||
            m.photoUrl ||
            m.imageUrl ||
            m.photo ||
            m.picture ||
            m.cloudinaryUrl ||
            m.cloudinarySecureUrl ||
            m.user?.profileImage ||
            m.user?.avatar ||
            m.user?.profilePic ||
            m.user?.profilePhotoUrl ||
            m.user?.photoUrl ||
            m.user?.picture ||
            (uid === currentUserId ? selfAvatar : undefined);

          const memberName =
            m.name ||
            m.user?.fullName ||
            (m.user?.firstName
              ? `${m.user.firstName} ${m.user.lastName || ''}`.trim()
              : '') ||
            m.fullName ||
            m.username ||
            'Member';

          unique.push({
            userId: uid,
            name: memberName,
            avatar: avatar ? String(avatar) : (uid === currentUserId ? selfAvatar : undefined),
            role,
            isOnline: m.isOnline ?? m.online ?? true,
            studyTime: m.studyTime || m.totalStudyTime || 0,
          });
        }
      }

      // If no admin was designated, promote first member or creator
      const hasAdmin = unique.some(u => u.role === 'admin');
      if (!hasAdmin && unique.length > 0) {
        unique[0].role = 'admin';
      }

      // Sort: Admins first, then mods, then members
      unique.sort((a, b) => {
        const rank = { admin: 0, moderator: 1, member: 2 };
        return rank[a.role] - rank[b.role];
      });

      setMembers(unique);

      // 4) Background Photo Fetch: query photos for any member missing full http avatar
      const missingPhotoUids = unique
        .filter(u => (!u.avatar || !u.avatar.startsWith('http')) && u.userId !== currentUserId)
        .map(u => u.userId);

      if (missingPhotoUids.length > 0) {
        Promise.allSettled(
          missingPhotoUids.map(async (uid) => {
            try {
              const res = await api.get(`/api/v1/profile/profile-photo/user/${uid}/active`)
                .catch(() => api.get(`/api/v1/profile/profile-photo/get-all-photos/${uid}`));
              const data = res?.data?.data || res?.data;
              const photosArray = Array.isArray(data) ? data : data?.photos || (data?.url || data?.cloudinarySecureUrl ? [data] : []);
              const active = Array.isArray(photosArray)
                ? photosArray.find((p: any) => p.isActive || p.active) || photosArray[0]
                : (typeof data === 'string' ? { url: data } : null);
              const pUrl = active?.cloudinarySecureUrl || active?.cloudinaryUrl || active?.url || active?.imageUrl || active?.photoUrl;
              if (pUrl && typeof pUrl === 'string') {
                return { uid, url: pUrl };
              }

              // Fallback to user profile endpoint
              const uRes = await AuthService.getUserProfileById(uid);
              const uData = uRes?.data?.user || uRes?.data?.profile || uRes?.data || uRes;
              const uImg = uData?.profileImage || uData?.avatar || uData?.profilePic;
              if (uImg && typeof uImg === 'string') {
                return { uid, url: uImg };
              }
            } catch {
              return null;
            }
            return null;
          })
        ).then(results => {
          const photoMap: Record<string, string> = {};
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value?.uid && r.value?.url) {
              photoMap[r.value.uid] = r.value.url;
            }
          });
          if (Object.keys(photoMap).length > 0) {
            setMembers(prev => prev.map(m => photoMap[m.userId] ? { ...m, avatar: photoMap[m.userId] } : m));
          }
        });
      }
    } catch (e) {
      console.error('[GroupLobby] Failed to load members:', e);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, currentUserId, selfAvatar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived roles
  const currentMember = members.find(m => String(m.userId) === String(currentUserId));
  const viewerIsAdmin =
    (groupCreatorId && String(currentUserId) === String(groupCreatorId)) ||
    currentMember?.role === 'admin' ||
    members.some(m => m.role === 'admin' && String(m.userId) === String(currentUserId));

  const adminMembers = members.filter(m => m.role === 'admin');
  const otherMembers = members.filter(m => m.role !== 'admin');

  // ── Enter video room ──────────────────────────────────────────────────────
  const handleEnterRoom = () => {
    navigation.navigate('GroupRoom', {
      groupId,
      groupName,
      isAdmin: viewerIsAdmin,
      isCreator: viewerIsAdmin,
    });
  };

  // ── Navigate to member's profile on tap ──────────────────────────────────
  const handleMemberPress = (member: GroupMember) => {
    if (member.userId) {
      (navigation as any).navigate('UserProfile', { userId: member.userId });
    }
  };

  // ── Remove member (admin only) ────────────────────────────────────────────
  const handleRemove = (member: GroupMember) => {
    Alert.alert(
      `Remove ${member.name}?`,
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              try {
                await StudyService.removeMember(String(groupId), member.userId);
              } catch {
                await StudyService.kickMember(String(groupId), member.userId);
              }
              setMembers(prev => prev.filter(m => m.userId !== member.userId));
              Alert.alert('Success', `${member.name} has been removed from the group.`);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to remove member.');
            }
          },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={ss.safe} edges={['top', 'left', 'right']}>

      {/* ── Header ── */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ss.iconBtn} activeOpacity={0.75}>
          <ChevronLeft size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={ss.headerCenter}>
          <Text style={ss.headerTitle} numberOfLines={1}>{groupName || 'Study Group'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Users size={11} color={colors.textMuted} />
            <Text style={ss.headerSub}>
              {members.length} {members.length === 1 ? 'member' : 'members'} total
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={loadData} style={ss.iconBtn} activeOpacity={0.75}>
          <Text style={{ fontSize: 20, color: colors.primary, fontWeight: '700', lineHeight: 24 }}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Banner (Video Room Count & Total Members) ── */}
      <StatsBanner
        videoRoomCount={videoRoomCount}
        totalMembers={members.length}
      />

      {/* ── Content ── */}
      {loading ? (
        <View style={ss.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={ss.loadingTxt}>Loading group members...</Text>
        </View>
      ) : (
        <ScrollView
          style={ss.scroll}
          contentContainerStyle={ss.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Creator / Admin section ── */}
          {adminMembers.length > 0 && (
            <View style={ss.section}>
              <View style={ss.sectionHeaderRow}>
                <Crown size={14} color="#c9932a" fill="#c9932a" />
                <Text style={ss.sectionLabel}>Group Creator</Text>
              </View>
              {adminMembers.map(m => (
                <AdminCard
                  key={m.userId}
                  member={m}
                  isYou={String(m.userId) === String(currentUserId)}
                  selfAvatar={selfAvatar}
                  onPress={handleMemberPress}
                />
              ))}
            </View>
          )}

          {/* ── Members section ── */}
          <View style={ss.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={ss.sectionHeaderRow}>
                <Users size={14} color={colors.primary} />
                <Text style={ss.sectionLabel}>Members ({otherMembers.length})</Text>
              </View>
              {viewerIsAdmin && otherMembers.length > 0 && (
                <Text style={ss.adminHint}>Admin Control Enabled</Text>
              )}
            </View>

            {otherMembers.length === 0 ? (
              <View style={ss.emptyBox}>
                <Users size={32} color="#c0b0a0" />
                <Text style={ss.emptyTitle}>No other members yet</Text>
                <Text style={ss.emptyTxt}>Invite your friends or classmates to study together!</Text>
              </View>
            ) : (
              otherMembers.map(m => (
                <MemberCard
                  key={m.userId}
                  member={m}
                  isYou={String(m.userId) === String(currentUserId)}
                  viewerIsAdmin={viewerIsAdmin}
                  selfAvatar={selfAvatar}
                  onPress={handleMemberPress}
                  onRemove={handleRemove}
                />
              ))
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* ── Fixed Bottom: Enter Video Room ── */}
      <View style={ss.bottomBar}>
        <TouchableOpacity onPress={handleEnterRoom} activeOpacity={0.85} style={ss.enterBtn}>
          <Video size={20} color="#fff" />
          <Text style={ss.enterBtnTxt}>
            {videoRoomCount > 0
              ? `Join Video Room (${videoRoomCount} Online)`
              : 'Enter Video Room'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f3ee' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1, borderBottomColor: '#d4c4b5',
    gap: 10,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d4c4b5',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: '900', color: colors.primary },
  headerSub:    { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 1 },

  // Stats Banner
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ded4',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2d8cd',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardLive: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  pulseDotActive: {
    backgroundColor: '#16a34a',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  statNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // Loading
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { fontSize: 13, color: colors.textMuted, fontWeight: '600' },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },
  section:       { marginBottom: 22 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel:  {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  adminHint:     { fontSize: 11, color: '#16a34a', fontWeight: '700' },

  // Admin Card
  adminCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20, borderWidth: 2, borderColor: '#c9932a',
    padding: 16,
    shadowColor: '#c9932a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  adminName: { fontSize: 16, fontWeight: '900', color: colors.primary, flex: 1 },
  adminBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  adminBadgeTxt: { fontSize: 12, fontWeight: '800', color: '#c9932a' },

  // Crown badge overlay
  crownBadge: {
    position: 'absolute', bottom: -3, right: -3,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#c9932a', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  // Member Card
  memberCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18, borderWidth: 1.5, borderColor: '#e0d8cf',
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#4a3728', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  memberCardSelf: { borderColor: '#a57c52', backgroundColor: '#fffbf5' },
  memberInfo:     { flex: 1, minWidth: 0 },
  memberName:     { fontSize: 15, fontWeight: '800', color: colors.primary, flex: 1 },
  memberRole:     { fontSize: 12, fontWeight: '700', marginTop: 2 },
  studyTimeTxt:   { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  onlineDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },

  // Empty
  emptyBox: {
    alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20,
    backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 1.5, borderColor: '#e0d8cf', gap: 6,
  },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: colors.primary },
  emptyTxt: { fontSize: 12, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },

  // Bottom bar
  bottomBar: {
    padding: 16, paddingBottom: 24,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1, borderTopColor: '#d4c4b5',
  },
  enterBtn: {
    backgroundColor: '#4a3728',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 18,
    shadowColor: '#4a3728', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  enterBtnTxt: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.3 },
});
