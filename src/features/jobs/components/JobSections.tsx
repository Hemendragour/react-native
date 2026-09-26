import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Job } from '../types/jobs';
import { JobCard } from './JobCard';

interface JobSectionsProps {
  jobs: Job[];
  savedIds: string[];
  appliedIds: string[];
  onSave: (id: string) => void;
  onApply?: (id: string) => void;
}

const PREVIEW_COUNT = 3;

export function JobSections({ jobs, savedIds, appliedIds, onSave, onApply }: JobSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const px = isSmall ? 14 : 20;

  const renderSection = (title: string, data: Job[], sectionKey: string) => {
    if (data.length === 0) return null;

    const isExpanded = expandedSection === sectionKey;
    const visibleJobs = isExpanded ? data : data.slice(0, PREVIEW_COUNT);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: isSmall ? 15 : 18 }]}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{data.length}</Text>
          </View>
        </View>

        <View style={styles.jobList}>
          {visibleJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedIds.includes(job.id)}
              isApplied={appliedIds.includes(job.id)}
              onSave={onSave}
              onPress={onApply}
            />
          ))}
        </View>

        {!isExpanded && data.length > PREVIEW_COUNT && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setExpandedSection(sectionKey)}
          >
            <Text style={styles.viewAllText}>View all {data.length} jobs ↓</Text>
          </TouchableOpacity>
        )}

        {isExpanded && data.length > PREVIEW_COUNT && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setExpandedSection(null)}
          >
            <Text style={styles.viewAllText}>Show less ↑</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const recommendedJobs = jobs.slice(0, 4);
  const recentJobs = jobs.filter(j => !j.featured);
  const featuredJobs = jobs.filter(j => j.featured);

  // Empty state when no jobs are available
  if (jobs.length === 0) {
    return (
      <View style={[styles.container, { paddingHorizontal: px }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No jobs found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or check back later for new opportunities.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingHorizontal: px }]}>
      {renderSection('Recommended Jobs', recommendedJobs, 'recommended')}
      {renderSection('Featured Jobs', featuredJobs, 'featured')}
      {renderSection('Recently Posted', recentJobs, 'recent')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 16,
    gap: 20,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#4a3728',
  },
  countBadge: {
    backgroundColor: '#e0d8cf',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4c4b5',
  },
  countText: {
    color: '#4a3728',
    fontSize: 11,
    fontWeight: '900',
  },
  jobList: {
    gap: 12,
  },
  viewAllBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d4c4b5',
    borderRadius: 16,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#4a3728',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d4c4b5',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4a3728',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7a6756',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});
