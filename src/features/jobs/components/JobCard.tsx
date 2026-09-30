import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Job } from '../types/jobs';
import { LOGO_BG, WORK_MODE_STYLE, TYPE_LABEL, formatSalary, timeAgo } from '../types/jobConstants';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  isApplied?: boolean;
  onSave?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function JobCard({ job, isSaved = false, isApplied = false, onSave, onPress }: JobCardProps) {
  const workMode = job.workMode || 'onsite';
  const modeStyle = WORK_MODE_STYLE[workMode] || { bg: '#fff', text: '#000', border: '#ccc' };
  const tags = job.tags || [];
  const salaryMin = job.salary?.min || 0;
  const salaryMax = job.salary?.max || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, job.featured && styles.cardFeatured]}
      onPress={() => onPress && onPress(job.id)}
    >
      {job.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>TOP</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logo, { backgroundColor: LOGO_BG[job.companyLogo] || '#4a3728' }]}>
            <Text style={styles.logoText}>{job.companyLogo}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>{job.company}</Text>
            <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave && onSave(job.id)}
        >
          <Text style={isSaved ? styles.saveIconActive : styles.saveIconInactive}>
            {isSaved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Badges */}
      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: modeStyle.bg, borderColor: modeStyle.border }]}>
          <View style={[styles.dot, { backgroundColor: modeStyle.text }]} />
          <Text style={[styles.badgeText, { color: modeStyle.text }]}>
            {workMode.charAt(0).toUpperCase() + workMode.slice(1)}
          </Text>
        </View>
        <View style={styles.badgeNeutral}>
          <Text style={styles.badgeNeutralText}>{TYPE_LABEL[job.type]}</Text>
        </View>
        <View style={styles.badgeNeutral}>
          <Text style={[styles.badgeNeutralText, { textTransform: 'capitalize' }]}>
            {job.experience}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {tags.slice(0, 3).map((tag, index) => (
          <View key={`${tag}-${index}`} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {tags.length > 3 && (
          <Text style={styles.extraTagsText}>+{tags.length - 3}</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.salaryText}>{formatSalary(salaryMin, salaryMax)}</Text>
          <Text style={styles.locationText}>{job.location || 'Location N/A'}</Text>
        </View>
        <View style={styles.footerRight}>
          {isApplied ? (
            <View style={styles.appliedBadge}>
              <Text style={styles.appliedText}>✓ Applied</Text>
            </View>
          ) : (
            <Text style={styles.timeAgoText}>{job.postedAt ? timeAgo(job.postedAt) : ''}</Text>
          )}
          <Text style={styles.applicantsText}>{job.applicants || 0} applicants</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardFeatured: {
    borderColor: '#d4a574',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    right: -25,
    backgroundColor: '#4a3728',
    paddingVertical: 2,
    paddingHorizontal: 25,
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  featuredBadgeText: {
    color: '#d4a574',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d4c4b5/40',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 11,
    color: '#7a6756',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 15,
    color: '#4a3728',
    fontWeight: '900',
  },
  saveBtn: {
    padding: 4,
    zIndex: 3,
  },
  saveIconActive: {
    fontSize: 20,
    color: '#d4a574',
  },
  saveIconInactive: {
    fontSize: 20,
    color: '#d4c4b5',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeNeutral: {
    backgroundColor: 'rgba(224, 216, 207, 0.4)',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeNeutralText: {
    fontSize: 10,
    color: '#4a3728',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(224, 216, 207, 0.5)',
    borderWidth: 1,
    borderColor: '#d4c4b5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 9,
    color: '#4a3728',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  extraTagsText: {
    fontSize: 10,
    color: '#7a6756',
    fontWeight: '700',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d4c4b5/40',
  },
  salaryText: {
    color: '#4a3728',
    fontSize: 14,
    fontWeight: '900',
  },
  locationText: {
    color: '#7a6756',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  timeAgoText: {
    color: '#7a6756',
    fontSize: 11,
    fontWeight: '600',
  },
  applicantsText: {
    color: '#8b7355',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  appliedBadge: {
    backgroundColor: '#e0d8cf',
    borderColor: '#d4c4b5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appliedText: {
    color: '#4a3728',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
