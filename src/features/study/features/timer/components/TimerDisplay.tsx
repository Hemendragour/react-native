import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../../store';
import { colors } from '../../../theme/colors';

interface Props {
  progress: number; // 0–100
}

export function TimerDisplay({ progress }: Props) {
  const { minutes, seconds, isBreakMode, activeTab, completedSessions } =
    useAppSelector(s => s.timer);

  const sessionLabel = isBreakMode
    ? completedSessions % 4 === 0 ? 'Long Break' : 'Short Break'
    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Session`;

  return (
    <View style={styles.card}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < Math.floor(progress / 12.5) && styles.dotFilled]}
          />
        ))}
      </View>

      {/* Time */}
      <Text style={[styles.time, isBreakMode && styles.timeBreak]}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <Text style={styles.sessionLabel}>{sessionLabel}</Text>

      {/* Progress bar */}
      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          { width: `${progress}%` as any },
          isBreakMode && styles.barBreak,
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderBrown,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  time: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -3,
    marginBottom: 6,
  },
  timeBreak: {
    color: colors.success,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  barBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.borderBrown,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  barBreak: {
    backgroundColor: colors.success,
  },
});