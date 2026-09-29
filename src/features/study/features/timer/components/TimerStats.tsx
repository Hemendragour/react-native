import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../../store';
import { colors } from '../../../theme/colors';

export function TimerStats() {
  const { completedSessions, totalStudyTime, streakCount } = useAppSelector(s => s.timer);

  const stats = [
    { value: completedSessions, label: 'Sessions' },
    { value: totalStudyTime,    label: 'Minutes'  },
    { value: streakCount,       label: 'Streak 🔥' },
  ];

  return (
    <View style={styles.row}>
      {stats.map(stat => (
        <View key={stat.label} style={styles.box}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});