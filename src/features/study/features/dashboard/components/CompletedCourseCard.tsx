import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CompletedCourse } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  course: CompletedCourse;
}

export function CompletedCourseCard({ course }: Props) {
  const scoreColor = course.score >= 90 ? '#16a34a' : course.score >= 75 ? '#d97706' : '#dc2626';

  return (
    <View style={styles.card}>
      {/* Header with gradient feel */}
      <View style={styles.header}>
        <Text style={styles.icon}>🎓</Text>
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{course.score}%</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{course.name}</Text>
        <Text style={styles.instructor}>{course.instructor}</Text>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Completed</Text>
            <Text style={styles.metaValue}>{course.completedDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{course.duration}</Text>
          </View>
        </View>

        <View style={styles.projectBox}>
          <Text style={styles.projectLabel}>Final Project</Text>
          <Text style={styles.projectName}>{course.finalProject}</Text>
        </View>

        <TouchableOpacity style={styles.certBtn} activeOpacity={0.8}>
          <Text style={styles.certBtnText}>🏅 View Certificate</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.cardBg,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: { fontSize: 32 },
  scoreBadge: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
  },
  body: { padding: 10 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
    lineHeight: 18,
  },
  instructor: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  meta: {
    backgroundColor: colors.pageBg,
    borderRadius: 7,
    padding: 8,
    gap: 4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  projectBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 7,
    padding: 8,
    marginBottom: 10,
  },
  projectLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  projectName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  certBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  certBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});