import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppSelector } from '../../../store';
import { colors } from '../../../theme/colors';

export function StudyProgress() {
  const { totalStudyTime, studySessions, dailyGoal } = useAppSelector(s => s.timer);
  const goalPct = Math.min((totalStudyTime / dailyGoal) * 100, 100);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today's Progress</Text>

      {/* Total time */}
      <View style={styles.totalBox}>
        <Text style={styles.totalValue}>{totalStudyTime} min</Text>
        <Text style={styles.totalLabel}>Total Study Time</Text>
      </View>

      {/* Daily goal bar */}
      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>Daily Goal ({dailyGoal} min)</Text>
        <Text style={styles.goalPct}>{Math.round(goalPct)}%</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${goalPct}%` as any }]} />
      </View>

      {/* Subject breakdown */}
      <Text style={styles.sectionTitle}>Subject Breakdown</Text>
      {studySessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sessions yet. Start a timer!</Text>
        </View>
      ) : (
        studySessions.map((session, i) => (
          <View key={i} style={styles.sessionRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {session.subject.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionSubject}>{session.subject}</Text>
              <Text style={styles.sessionTime}>{session.time} minutes</Text>
            </View>
            <Text style={styles.sessionBadge}>{session.time}m</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 14,
  },
  totalBox: {
    backgroundColor: colors.backgroundMid,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabel: { fontSize: 12, fontWeight: '600', color: colors.textMid },
  goalPct: { fontSize: 12, fontWeight: '800', color: colors.primary },
  barBg: {
    height: 6,
    backgroundColor: colors.borderBrown,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundMid,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 13, fontWeight: '700', color: colors.text },
  sessionTime: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  sessionBadge: { fontSize: 15, fontWeight: '900', color: colors.text },
});