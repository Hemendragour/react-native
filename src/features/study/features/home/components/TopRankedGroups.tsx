import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { joinStudyGroup, leaveStudyGroup } from '../../../store/groupsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Generates initials from a group title (first 2 words) */
const getInitials = (title: string): string => {
  const words = title.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.substring(0, 2).toUpperCase();
};

/** Deterministic color from string (no external images needed) */
const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#14b8a6', '#a855f7',
];
const getAvatarColor = (id: string | number): string => {
  const hash = String(id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function TopRankedGroups() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const topRankedGroups = useAppSelector(s => s.groups.topRankedGroups);
  const joinedGroupIds = useAppSelector(s => s.groups.joinedGroupIds);
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  if (!topRankedGroups || topRankedGroups.length === 0) {
    return null;
  }

  const handleJoin = async (groupId: string | number) => {
    setLoadingId(groupId);
    try {
      await dispatch(joinStudyGroup(groupId)).unwrap();
    } catch {
      // error handled in slice
    } finally {
      setLoadingId(null);
    }
  };

  const handleLeave = async (groupId: string | number) => {
    setLoadingId(groupId);
    try {
      await dispatch(leaveStudyGroup(groupId)).unwrap();
    } catch {
      // error handled in slice
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Ranked Groups</Text>
        <Text style={styles.subtitle}>Join the most active and successful study communities</Text>
      </View>

      <View style={styles.list}>
        {topRankedGroups.map((group, index) => {
          const spotsLeft = group.capacity - group.members;
          const isFull = spotsLeft <= 0;
          const isJoined = joinedGroupIds.includes(group.id) || joinedGroupIds.includes(String(group.id));
          const isLoading = loadingId === group.id;
          const initials = getInitials(group.title);
          const avatarBg = getAvatarColor(group.id);

          return (
            <View key={group.id || `top-ranked-${index}`} style={styles.card}>
              {/* Initials Avatar — top left offset */}
              <View style={[styles.avatarWrapper, { backgroundColor: avatarBg }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              {/* Rank badge — top right */}
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{group.rank || index + 1}</Text>
              </View>

              {/* Content — offset to right of avatar */}
              <View style={styles.content}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('GroupLobby', { groupId: group.id, groupName: group.title })}
                >
                  <Text style={styles.groupTitle} numberOfLines={1} ellipsizeMode="tail">{group.title}</Text>
                  <Text style={styles.leader} numberOfLines={1} ellipsizeMode="tail">🏆 {group.leader || 'Creator'}</Text>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>📈 Attend.</Text>
                      <Text style={styles.statValue}>{group.attendanceAvg ?? 80}%</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>👥 Members</Text>
                      <Text style={styles.statValue}>{group.members}/{group.capacity}</Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    {isJoined ? (
                      <View style={styles.joinedBadge}>
                        <Text style={styles.joinedBadgeText}>✓ Member</Text>
                      </View>
                    ) : isFull ? (
                      <View style={styles.fullBadge}>
                        <Text style={styles.fullText}>Full</Text>
                      </View>
                    ) : (
                      <View style={styles.openBadge}>
                        <Text style={styles.openText}>{spotsLeft} spots left</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {isJoined ? (
                  <TouchableOpacity
                    style={styles.leaveBtn}
                    activeOpacity={0.8}
                    disabled={isLoading}
                    onPress={() => handleLeave(group.id)}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.leaveBtnText}>Leave Group</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.joinBtn, (isFull || isLoading) && styles.joinBtnDisabled]}
                    activeOpacity={0.8}
                    disabled={isFull || isLoading}
                    onPress={() => handleJoin(group.id)}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.joinBtnText}>{isFull ? 'Group Full' : 'Join Group'}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center', paddingHorizontal: 8 },

  list: { gap: 16 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    paddingTop: 22,
    borderWidth: 1.5,
    borderColor: '#e5ddd5',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 16,
  },
  avatarWrapper: {
    position: 'absolute',
    top: -14,
    left: 14,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#f59e0b',
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rankText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  content: { marginLeft: Math.min(60, SCREEN_WIDTH * 0.16) },
  groupTitle: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.038),
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  leader: {
    fontSize: Math.min(11, SCREEN_WIDTH * 0.028),
    color: colors.textMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },

  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statItem: {
    flex: 1,
    backgroundColor: '#fdf8f3',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#f0e8df',
  },
  statLabel: { fontSize: 9, color: colors.textMuted, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  statusRow: { marginBottom: 8 },
  openBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22,163,74,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.2)',
  },
  openText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  fullBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(220,38,38,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  fullText: { fontSize: 10, fontWeight: '700', color: '#dc2626' },
  joinedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99,102,241,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  joinedBadgeText: { fontSize: 10, fontWeight: '700', color: '#6366f1' },

  joinBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  joinBtnDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  leaveBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  leaveBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

