import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CompletedCourse } from '../types';
import { colors } from '../../../theme/colors';

interface Props {
  course: CompletedCourse;
}

export function CertificateCard({ course }: Props) {
  return (
    <View style={styles.card}>
      {/* Certificate head */}
      <View style={styles.certHeader}>
        <Text style={styles.certIcon}>🏆</Text>
        <Text style={styles.certTitle}>Certificate of Completion</Text>
        <View style={styles.certIdBadge}>
          <Text style={styles.certId}>{course.certificateId}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.instructor}>{course.instructor}</Text>

        {/* Score highlight */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{course.score}%</Text>
            <Text style={styles.scoreLabel}>Final Score</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{course.completedDate}</Text>
            <Text style={styles.dateLabel}>Completed</Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.skillsWrap}>
          <Text style={styles.skillsTitle}>Skills Acquired</Text>
          <View style={styles.skills}>
            {course.skills.map((s, i) => (
              <View key={i} style={styles.skillTag}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8}>
            <Text style={styles.btnPrimaryText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
            <Text style={styles.btnOutlineText}>↓ Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  certHeader: {
    backgroundColor: colors.primary,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  certIcon: { fontSize: 28 },
  certTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.pageBg,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  certIdBadge: {
    backgroundColor: 'rgba(247,243,238,0.2)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  certId: {
    fontSize: 10,
    color: colors.pageBg,
    fontWeight: '600',
  },
  body: { padding: 12 },
  courseName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 3,
  },
  instructor: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#fef9f0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4a574',
  },
  scoreNum: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateBox: {
    flex: 1,
    backgroundColor: colors.pageBg,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  dateLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  skillsWrap: { marginBottom: 12 },
  skillsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
  },
  skillTag: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.pageBg,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.pageBg,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});