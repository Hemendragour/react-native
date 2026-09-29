import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchLeaderboard, fetchStreakLeaderboard, fetchGroupLeaderboard,
  setActiveTab, setSelectedGroupId,
} from '../store/leaderboardSlice';
import { fetchAllProfilePhotos } from '../../../../../store/slices/profileSlice';
import { StudyService } from '../../../../../services/study.service';
import { colors } from '../../../theme/colors';

const TABS = ['monthly', 'weekly', 'global', 'streak', 'group'] as const;
const TAB_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'This Week',
  global: 'All Time',
  streak: 'Streaks',
  group: 'Group',
};

export function LeaderboardScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { users, streakUsers, groupUsers, isLoading, error, activeTab, selectedGroupId } = useAppSelector(s => s.leaderboard);
  const profilePhotos = useAppSelector(s => s.profile.profilePhotos);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  // Fetch user's groups for group selector
  useEffect(() => {
    if (activeTab === 'group') {
      StudyService.getMyGroups().then(res => {
        const data = res?.data || res;
        setGroups(Array.isArray(data) ? data : []);
      }).catch(() => {});
    }
  }, [activeTab]);

  // Fetch leaderboard based on active tab
  useEffect(() => {
    if (activeTab === 'streak') {
      dispatch(fetchStreakLeaderboard());
    } else if (activeTab === 'group' && selectedGroupId) {
      dispatch(fetchGroupLeaderboard(selectedGroupId));
    } else if (activeTab !== 'group') {
      dispatch(fetchLeaderboard(activeTab));
    }
  }, [activeTab, selectedGroupId, dispatch]);

  // Fetch profile photos for avatar resolution
  useEffect(() => {
    dispatch(fetchAllProfilePhotos());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'streak') {
      await dispatch(fetchStreakLeaderboard());
    } else if (activeTab === 'group' && selectedGroupId) {
      await dispatch(fetchGroupLeaderboard(selectedGroupId));
    } else if (activeTab !== 'group') {
      await dispatch(fetchLeaderboard(activeTab));
    }
    setRefreshing(false);
  }, [dispatch, activeTab, selectedGroupId]);

  const currentUsers = useMemo(() => {
    if (activeTab === 'streak') return streakUsers;
    if (activeTab === 'group') return groupUsers;
    return users;
  }, [activeTab, users, streakUsers, groupUsers]);

  // Resolve profile photo from Redux store
  const getAvatarUrl = (userId: string, fallbackAvatar: string) => {
    if (fallbackAvatar && fallbackAvatar.startsWith('http')) return fallbackAvatar;
    const photo = profilePhotos?.find((p: any) => String(p.userId) === String(userId) || String(p._id) === String(userId));
    const url = photo?.url || photo?.imageUrl || photo?.profileImage;
    return url || '';
  };

  const top3 = currentUsers.slice(0, 3);
  const rest = currentUsers.slice(3);

  const renderAvatar = (userId: string, fallback: string, size: number, style?: any) => {
    const url = getAvatarUrl(userId, fallback);
    if (url) {
      return <Image source={{ uri: url }} style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
    }
    return <Text style={{ fontSize: size * 0.6 }}>{fallback || '📚'}</Text>;
  };

  return (
    <SafeScreen>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>🏆 Leaderboard</Text>
        <Text style={s.subtitle}>
          {activeTab === 'streak' ? 'Top streak holders' :
           activeTab === 'group' ? 'Group rankings' :
           'Top study performers'}
        </Text>
      </View>

      {/* Tab bar */}
      <View style={s.tabRow}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          renderItem={({ item: t }) => (
            <TouchableOpacity
              style={[s.tab, activeTab === t && s.tabActive]}
              onPress={() => dispatch(setActiveTab(t))}
            >
              <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>{TAB_LABELS[t]}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Group selector */}
      {activeTab === 'group' && (
        <View style={s.groupSelector}>
          {groups.length === 0 ? (
            <Text style={s.noGroupsText}>No groups found. Join or create a group first.</Text>
          ) : (
            <FlatList
              data={groups}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={g => String(g._id || g.id || g.groupId)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
              renderItem={({ item: g }) => {
                const gid = String(g._id || g.id || g.groupId);
                const selected = selectedGroupId === gid;
                return (
                  <TouchableOpacity
                    style={[s.groupChip, selected && s.groupChipActive]}
                    onPress={() => dispatch(setSelectedGroupId(gid))}
                  >
                    <Text style={[s.groupChipText, selected && s.groupChipTextActive]} numberOfLines={1}>
                      {g.name || g.groupName || 'Group'}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {isLoading && currentUsers.length === 0 ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={s.loadingContainer}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={s.retryBtn}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'group' && !selectedGroupId ? (
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Select a group to view its leaderboard</Text>
        </View>
      ) : currentUsers.length === 0 ? (
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>No rankings yet. Start studying!</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <>
              {/* Podium */}
              <View style={s.podium}>
                {/* 2nd */}
                <View style={[s.podiumItem, s.podiumSilver]}>
                  {renderAvatar(top3[1]?.id, top3[1]?.avatar || '📚', 44)}
                  <Text style={s.podiumBadge}>🥈</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{top3[1]?.name?.split(' ')[0] || '-'}</Text>
                  <Text style={s.podiumHours}>{activeTab === 'streak' ? `${top3[1]?.streak || 0}d` : `${top3[1]?.studyHours || 0}h`}</Text>
                  <View style={[s.podiumBlock, { height: 70, backgroundColor: '#c0c0c0' }]}>
                    <Text style={s.podiumRank}>2</Text>
                  </View>
                </View>

                {/* 1st */}
                <View style={[s.podiumItem, s.podiumGold]}>
                  {renderAvatar(top3[0]?.id, top3[0]?.avatar || '📚', 54)}
                  <Text style={s.podiumBadge}>🥇</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{top3[0]?.name?.split(' ')[0] || '-'}</Text>
                  <Text style={s.podiumHours}>{activeTab === 'streak' ? `${top3[0]?.streak || 0}d` : `${top3[0]?.studyHours || 0}h`}</Text>
                  <View style={[s.podiumBlock, { height: 95, backgroundColor: colors.accent }]}>
                    <Text style={s.podiumRank}>1</Text>
                  </View>
                </View>

                {/* 3rd */}
                <View style={[s.podiumItem, s.podiumBronze]}>
                  {renderAvatar(top3[2]?.id, top3[2]?.avatar || '📚', 44)}
                  <Text style={s.podiumBadge}>🥉</Text>
                  <Text style={s.podiumName} numberOfLines={1}>{top3[2]?.name?.split(' ')[0] || '-'}</Text>
                  <Text style={s.podiumHours}>{activeTab === 'streak' ? `${top3[2]?.streak || 0}d` : `${top3[2]?.studyHours || 0}h`}</Text>
                  <View style={[s.podiumBlock, { height: 50, backgroundColor: '#cd7f32' }]}>
                    <Text style={s.podiumRank}>3</Text>
                  </View>
                </View>
              </View>

              <Text style={s.restTitle}>Rankings</Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={s.row}>
              <Text style={s.rankNum}>#{item.rank}</Text>
              {renderAvatar(item.id, item.avatar || '📚', 38)}
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.meta}>🔥 {item.streak} day streak</Text>
              </View>
              <View style={s.right}>
                <Text style={s.hours}>{activeTab === 'streak' ? `${item.streak}d` : `${item.studyHours}h`}</Text>
                <Text style={s.hoursLabel}>{activeTab === 'streak' ? 'streak' : 'studied'}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  header: { padding: 20, paddingBottom: 8, backgroundColor: colors.background },
  backBtn: { marginBottom: 12 },
  backText: { color: colors.primaryLight, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  tabRow: {
    marginHorizontal: 16, marginVertical: 10,
    backgroundColor: colors.surface, borderRadius: 12, padding: 4,
    borderWidth: 1.5, borderColor: colors.borderBrown,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, alignItems: 'center', marginHorizontal: 2 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: '#fff' },
  groupSelector: { marginBottom: 4 },
  groupChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderBrown,
    marginRight: 8,
  },
  groupChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  groupChipText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  groupChipTextActive: { color: '#fff' },
  noGroupsText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
  podium: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'center', gap: 12, marginVertical: 20,
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  podiumItem: { alignItems: 'center', flex: 1 },
  podiumGold: {},
  podiumSilver: {},
  podiumBronze: {},
  podiumBadge: { fontSize: 18, marginTop: 2 },
  podiumName: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 2 },
  podiumHours: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  podiumBlock: {
    width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  podiumRank: { color: '#fff', fontWeight: '900', fontSize: 18 },
  restTitle: { fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
  },
  rankNum: { fontSize: 15, fontWeight: '800', color: colors.primaryLight, width: 28 },
  name: { fontSize: 14, fontWeight: '700', color: colors.primary },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  hours: { fontSize: 16, fontWeight: '800', color: colors.primary },
  hoursLabel: { fontSize: 10, color: colors.textMuted },
  sep: { height: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: colors.textMuted, marginTop: 10 },
  errorText: { fontSize: 14, color: '#dc2626', textAlign: 'center' },
  retryBtn: { marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
});
