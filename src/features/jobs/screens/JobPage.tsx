import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import BottomBar, { emitBottomBarScroll, emitBottomBarScrollEnd } from '../../../shared/components/BottomBar';
import { HeroSection } from '../components/HeroSection';
import { JobSections } from '../components/JobSections';
import JobService from '../../../services/job.service';
import { SafeScreen } from '../../study/shared/components/layout/SafeScreen';
import { Job } from '../types/jobs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Transforms a backend job object into the frontend Job interface.
 *
 * Backend shape (from MongoDB):
 *   { jobId, title, companyId, location: { city, state, country, isRemote },
 *     jobType, experience: { level }, salary: { min, max, currency },
 *     isFeatured, tags: [], stats: { applications }, dates: { posted }, ... }
 *
 * Frontend shape (Job interface):
 *   { id, title, company, companyLogo, location (string), type, experience (string),
 *     workMode, salary: { min, max, currency }, featured, tags, applicants, postedAt, ... }
 */
const mapBackendJob = (raw: any): Job => {
  // Build a human-readable location string from the location object
  const loc = raw.location || {};
  const locationParts = [loc.city, loc.state, loc.country].filter(Boolean);
  const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'Remote';

  // Determine workMode from location.isRemote
  const workMode = loc.isRemote ? 'remote' : 'onsite';

  // Build a company logo abbreviation from companyId (first 2 chars uppercased)
  const companyLogo = (raw.companyId || 'T8').substring(0, 2).toUpperCase();

  return {
    id: raw.jobId || raw._id || '',
    title: raw.title || 'Untitled Position',
    company: raw.companyId || 'Unknown Company',
    companyLogo,
    location: locationStr,
    salary: {
      min: raw.salary?.min || 0,
      max: raw.salary?.max || 0,
      currency: raw.salary?.currency || 'INR',
    },
    type: raw.jobType || raw.type || 'full-time',
    experience: raw.experience?.level || 'mid',
    workMode,
    tags: raw.tags || raw.skills?.map((s: any) => s.name) || [],
    description: raw.description || '',
    responsibilities: raw.requirements?.mandatorySkills || [],
    requirements: raw.requirements?.certifications || [],
    benefits: raw.benefits?.others || [],
    postedAt: raw.dates?.posted || raw.createdAt || new Date().toISOString(),
    deadline: raw.dates?.expires || '',
    applicants: raw.stats?.applications || raw.stats?.applicationsCount || 0,
    featured: raw.isFeatured || false,
    category: raw.industry || raw.department || 'other',
  };
};

const JobPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await JobService.getJobs();

      /**
       * Backend response structure (from ResponseUtil.success):
       * { status: "success", statusCode: 200, message: "JOBS_LISTED",
       *   data: { jobs: [...], pagination: { page, limit, total, pages, hasNext } } }
       *
       * Axios wraps this in response.data, so:
       *   response.data.data.jobs → the actual array
       */
      const rawJobs = response.data?.data?.jobs   // Standard path: ResponseUtil wrapped
                   || response.data?.jobs          // Fallback: direct data
                   || response.data?.data          // Fallback: data is the array itself
                   || response.data                // Fallback: response is the array
                   || [];

      // Ensure we have an array, then transform each job
      const jobsArray = Array.isArray(rawJobs) ? rawJobs : [];
      const mappedJobs = jobsArray.map(mapBackendJob);

      console.log(`✅ Mapped ${mappedJobs.length} jobs for display`);
      setJobs(mappedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Alert.alert('Error', 'Could not load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    // Optimistic update
    const isSaved = savedIds.includes(id);
    setSavedIds(prev =>
      isSaved ? prev.filter(savedId => savedId !== id) : [...prev, id]
    );

    try {
      await JobService.saveJob(id);
    } catch (error) {
      console.error('Failed to save job:', error);
      // Revert on failure
      setSavedIds(prev =>
        isSaved ? [...prev, id] : prev.filter(savedId => savedId !== id)
      );
      Alert.alert('Error', 'Could not save the job.');
    }
  };

  const handleApply = (id: string) => {
    Alert.alert(
      'Apply for Job',
      'Are you sure you want to apply for this position?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: async () => {
            if (appliedIds.includes(id)) return;
            
            setApplying(id);
            try {
              await JobService.applyToJob(id);
              setAppliedIds(prev => [...prev, id]);
              Alert.alert('Success', 'Successfully applied to the job!');
            } catch (error) {
              console.error('Failed to apply to job:', error);
              Alert.alert('Error', 'Could not submit application.');
            } finally {
              setApplying(null);
            }
          }
        }
      ]
    );
  };

  const handleSearch = async (query: string, location: string) => {
    if (!query && !location) {
      fetchJobs();
      return;
    }

    try {
      setLoading(true);
      // Use the working list endpoint with title filter instead of the
      // advanced search endpoint (which requires Elasticsearch and expects
      // different query params than what the frontend sends).
      const response = await JobService.getJobs({ title: query });
      const rawJobs = response.data?.data?.jobs
                   || response.data?.jobs
                   || response.data?.data
                   || response.data
                   || [];
      const jobsArray = Array.isArray(rawJobs) ? rawJobs : [];
      const mappedJobs = jobsArray.map(mapBackendJob);

      // If a location filter was provided, filter client-side
      const filtered = location
        ? mappedJobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()))
        : mappedJobs;

      setJobs(filtered);
      if (filtered.length === 0) {
        console.log('ℹ️ No jobs matched the search criteria');
      }
    } catch (error) {
      console.error('Failed to search jobs:', error);
      // Graceful fallback: show empty state instead of error alert
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCompanies = new Set(jobs.map(j => j.company)).size;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
  const heroStats = {
    roles: jobs.length,
    companies: uniqueCompanies,
    applicants: totalApplicants,
  };

  return (
    <BottomBar activeTabOverride="Jobs">
      <SafeScreen style={styles.safeScreen}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={emitBottomBarScroll}
          onScrollEndDrag={emitBottomBarScrollEnd}
          onMomentumScrollEnd={emitBottomBarScrollEnd}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4a3728']}
              tintColor="#4a3728"
            />
          }
        >
          <HeroSection onSearch={handleSearch} stats={heroStats} />
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a3728" />
            </View>
          ) : (
            <JobSections
              jobs={jobs}
              savedIds={savedIds}
              appliedIds={appliedIds}
              onSave={handleSave}
              onApply={handleApply}
            />
          )}
        </ScrollView>
      </SafeScreen>
    </BottomBar>
  );
};

const styles = StyleSheet.create({
  safeScreen: {
    flex: 1,
    backgroundColor: '#f7f3ee',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  }
});

export default JobPage;