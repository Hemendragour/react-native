import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StudyGroup } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  group: StudyGroup;
  onPress?: () => void;
}

export function StudyGroupCard({ group, onPress }: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{group.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{group.category}</Text>
          </View>
        </View>
        <View style={styles.membersBadge}>
          <Text style={styles.membersText}>👥 {group.members}</Text>
        </View>
      </View>

      {/* Next session */}
      <View style={styles.sessionBox}>
        <Text style={styles.sessionLabel}>Next Session</Text>
        <Text style={styles.sessionTime}>{group.nextSession}</Text>
        <Text style={styles.sessionTopic}>{group.sessionTopic}</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.stats}>
        {[
          { label: 'Weekly', value: `${group.weeklyHours}h` },
          { label: 'Sessions', value: String(group.totalSessions) },
          { label: 'Attend', value: `${group.attendanceRate}%` },
          { label: 'Streak', value: `${group.studyStreak}d` },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statVal}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Group Progress</Text>
          <Text style={styles.progressPct}>{group.progress}%</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${group.progress}%` }]} />
        </View>
      </View>

      {/* Achievements */}
      {group.achievements.length > 0 && (
        <View style={styles.achievements}>
          {group.achievements.map((a, i) => (
            <View key={i} style={styles.achieveBadge}>
              <Text style={styles.achieveText}>🏅 {a}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.viewBtn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.viewBtnText}>View Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1, gap: 4 },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.pageBg,
  },
  categoryBadge: {
    backgroundColor: 'rgba(247,243,238,0.2)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    color: colors.pageBg,
    fontWeight: '600',
  },
  membersBadge: {
    backgroundColor: 'rgba(247,243,238,0.2)',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  membersText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pageBg,
  },
  sessionBox: {
    backgroundColor: colors.pageBg,
    padding: 10,
    gap: 2,
  },
  sessionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  sessionTopic: {
    fontSize: 11,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    padding: 10,
    gap: 6,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 7,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  progressWrap: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  barBg: {
    height: 5,
    backgroundColor: colors.cardBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  achieveBadge: {
    backgroundColor: '#fef9f0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#d4a574',
  },
  achieveText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  viewBtn: {
    margin: 10,
    marginTop: 0,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.pageBg,
  },
});