import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Course } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  course: Course;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#6b8a73',
  Intermediate: '#8b6f47',
  Advanced: '#4a3728',
};

export function EnrolledCourseCard({ course }: Props) {
  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        <Image source={{ uri: course.thumbnail }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{course.progress}%</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{course.name}</Text>
        <Text style={styles.instructor}>{course.instructor}</Text>

        {/* Meta pills */}
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
            <Text style={styles.pillText}>⭐ {course.rating}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
            <Text style={styles.pillText}>👥 {course.students.toLocaleString()}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: DIFFICULTY_COLOR[course.difficulty] + '22' }]}>
            <Text style={[styles.pillText, { color: DIFFICULTY_COLOR[course.difficulty] }]}>
              {course.difficulty}
            </Text>
          </View>
        </View>

        {/* Assignment / Quiz progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Assignments</Text>
            <View style={styles.miniBarBg}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${(course.assignments.completed / course.assignments.total) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressFrac}>
              {course.assignments.completed}/{course.assignments.total}
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Quizzes</Text>
            <View style={styles.miniBarBg}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${(course.quizzes.completed / course.quizzes.total) * 100}%`,
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressFrac}>
              {course.quizzes.completed}/{course.quizzes.total}
            </Text>
          </View>
        </View>

        {/* Next lesson */}
        <View style={styles.nextLesson}>
          <Text style={styles.nextLabel}>Next →</Text>
          <Text style={styles.nextText} numberOfLines={1}>{course.nextLesson}</Text>
        </View>

        {/* Overall progress bar */}
        <View style={styles.mainBarBg}>
          <View style={[styles.mainBarFill, { width: `${course.progress}%` }]} />
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.8}>
          <Text style={styles.ctaText}>Continue Learning</Text>
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
  thumbWrap: {
    height: 90,
    backgroundColor: colors.cardBg,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  progressBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  body: {
    padding: 10,
  },
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
  pills: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pill: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  progressItem: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  miniBarBg: {
    height: 4,
    backgroundColor: colors.cardBg,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressFrac: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'right',
  },
  nextLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.pageBg,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 8,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  nextText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  mainBarBg: {
    height: 5,
    backgroundColor: colors.cardBg,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mainBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.pageBg,
  },
});