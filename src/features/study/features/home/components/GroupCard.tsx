import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Group } from '../types';
import { colors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { joinGroup, unjoinGroup, joinStudyGroup, leaveStudyGroup } from '../../../store/groupsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  group: Group;
}

export function GroupCard({ group }: Props) {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const joinedIds = useAppSelector(s => s.groups.joinedGroupIds);
  const isJoined = joinedIds.includes(group.id);
  const spotsLeft = group.capacity - group.members;
  const isFull = spotsLeft <= 0;
  const fillPct = (group.members / group.capacity) * 100;

  const handleJoinLeave = async () => {
    if (isJoined) {
      dispatch(unjoinGroup(group.id));
      try {
        await dispatch(leaveStudyGroup(group.id)).unwrap();
      } catch (error: any) {
        dispatch(joinGroup(group.id));
        Alert.alert('Error', error || 'Failed to leave group');
      }
    } else if (!isFull) {
      dispatch(joinGroup(group.id));
      try {
        await dispatch(joinStudyGroup(group.id)).unwrap();
      } catch (error: any) {
        dispatch(unjoinGroup(group.id));
        Alert.alert('Error', error || 'Failed to join group');
      }
    }
  };


  return (
    <View style={styles.card}>
      {/* Top accent bar */}
      <View style={styles.accentBar} />

      <TouchableOpacity
        style={styles.body}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('GroupLobby', { groupId: group.id, groupName: group.title })}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{group.title}</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText} numberOfLines={1}>{group.category}</Text>
            </View>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, group.visibility === 'public' && styles.badgeActive]}>
              <Text style={styles.badgeText}>{group.visibility === 'public' ? '👁' : '🔒'}</Text>
            </View>
            <View style={[styles.badge, group.cameraOn && styles.badgeActive]}>
              <Text style={styles.badgeText}>{group.cameraOn ? '📹' : '📷'}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">{group.description}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>{group.goalHours}h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Attend.</Text>
            <Text style={styles.statValue}>{group.attendanceAvg}%</Text>
          </View>
        </View>

        {/* Capacity bar */}
        <View style={styles.capRow}>
          <Text style={styles.capText}>{group.members}/{group.capacity}</Text>
          <Text style={styles.capText}>{spotsLeft} left</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${Math.min(fillPct, 100)}%` as any }]} />
        </View>

        {/* Leader */}
        <Text style={styles.leader} numberOfLines={1} ellipsizeMode="tail">👤 {group.leader}</Text>
      </TouchableOpacity>

      <View style={styles.btnContainer}>
        {/* Button */}
        <TouchableOpacity
          onPress={handleJoinLeave}
          disabled={isFull && !isJoined}
          style={[
            styles.btn,
            isJoined && styles.btnLeave,
            isFull && !isJoined && styles.btnDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {isJoined ? 'Leave Group' : isFull ? 'Full' : 'Join Group'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#f6ede8',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e5e0d8',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  accentBar: {
    height: 3,
    backgroundColor: colors.primaryLight,
  },
  body: { padding: 10, flex: 1 },
  btnContainer: { paddingHorizontal: 10, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  headerLeft: { flex: 1, marginRight: 4 },
  title: {
    fontSize: Math.min(13, SCREEN_WIDTH * 0.034),
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    maxWidth: '90%',
  },
  categoryText: { color: '#fff', fontSize: 9, fontWeight: '600' },
  badges: { flexDirection: 'row', gap: 3 },
  badge: { padding: 3, borderRadius: 6, backgroundColor: '#f5f0ea' },
  badgeActive: { backgroundColor: `${colors.primaryLight}20` },
  badgeText: { fontSize: 9 },
  desc: {
    fontSize: Math.min(11, SCREEN_WIDTH * 0.028),
    color: colors.textMuted,
    lineHeight: 15,
    minHeight: 30, // Force 2 lines of space
    marginBottom: 8,
  },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statBox: { flex: 1, backgroundColor: '#d4ccc3', borderRadius: 8, padding: 6 },
  statLabel: { fontSize: 9, color: colors.textMuted, marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: colors.text },
  capRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  capText: { fontSize: 9, color: colors.textMuted },
  barBg: { height: 4, backgroundColor: '#e5ddd5', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primaryLight, borderRadius: 4 },
  leader: {
    fontSize: Math.min(10, SCREEN_WIDTH * 0.026),
    color: colors.textMuted,
    marginBottom: 8,
  },
  btn: {
    marginTop: 'auto',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnLeave: { backgroundColor: '#ef4444' },
  btnDisabled: { backgroundColor: '#d1d5db' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
});