import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomBar from '../../../../../shared/components/BottomBar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../app/navigation/types';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../../theme/colors';

import { DashboardHeader } from '../components/DashboardHeader';
import { StudyTrendChart } from '../components/StudyTrendChart';
import { SubjectPieChart } from '../components/SubjectPieChart';
import { GroupCard } from '../../home/components/GroupCard';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchUserDashboardData, fetchStudyTrendStatistics, fetchPerformanceAnalytics, clearError } from '../store/dashboardSlice';
import { fetchStudyProfile } from '../../profile/store/profilSlice';
import { fetchMyProfile, fetchAllProfilePhotos } from '../../../../../store/slices/profileSlice';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERIOD_OPTIONS = [
  { key: '7days' as const, label: '7D' },
  { key: '30days' as const, label: '30D' },
  { key: '90days' as const, label: '90D' },
];

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  
  const timer = useAppSelector(s => s.timer);
  const myGroups = useAppSelector(s => s.groups.items || []);
  const todos = useAppSelector(s => s.todos.items);
  const dashboard = useAppSelector(s => s.dashboard);
  const studyProfile = useAppSelector(s => s.studyProfile);

  const { loading, trendLoading, analyticsLoading, error, trendPeriod, subjectShare } = dashboard;

  useEffect(() => {
    dispatch(fetchStudyProfile());
    dispatch(fetchUserDashboardData());
    dispatch(fetchStudyTrendStatistics('7days'));
    dispatch(fetchPerformanceAnalytics());
    dispatch(fetchMyProfile());
    dispatch(fetchAllProfilePhotos());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(fetchStudyProfile());
    dispatch(fetchUserDashboardData());
    dispatch(fetchStudyTrendStatistics(trendPeriod));
    dispatch(fetchPerformanceAnalytics());
    dispatch(fetchMyProfile());
    dispatch(fetchAllProfilePhotos());
  }, [dispatch, trendPeriod]);

  const handlePeriodChange = useCallback((period: '7days' | '30days' | '90days') => {
    if (period !== trendPeriod) {
      dispatch(fetchStudyTrendStatistics(period));
    }
  }, [dispatch, trendPeriod]);

  // Derive Study Trend from backend data, fallback to timer local data
  const today = new Date();
  const studyTrend = dashboard.studyTrend && dashboard.studyTrend.length > 0
    ? dashboard.studyTrend.map(stat => {
        const dateObj = new Date(stat.date);
        const parsedHours = Number(stat.hours);
        return {
          day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          hours: isNaN(parsedHours) ? 0 : parsedHours,
        };
      })
    : Array.from({ length: trendPeriod === '7days' ? 7 : trendPeriod === '30days' ? 30 : 90 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - ((trendPeriod === '7days' ? 7 : trendPeriod === '30days' ? 30 : 90) - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        const minutes = Number(timer.weeklyStats?.[dateStr]) || 0;
        const parsedHours = isNaN(minutes) ? 0 : Number((minutes / 60).toFixed(1));
        return {
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          hours: isNaN(parsedHours) ? 0 : parsedHours,
        };
      });

  // Derive Subject Share: prefer backend, fallback to local timer sessions
  const baseColors = ['#4a3728', '#8b6f47', '#d4c4b5', '#6b8a73', '#9ca3af'];
  let finalSubjectShare = subjectShare;

  if (!finalSubjectShare || finalSubjectShare.length === 0) {
    const subjectTotals: Record<string, number> = {};
    let totalSessionMins = 0;
    (timer.studySessions || []).forEach(s => {
      const subj = s.subject || 'Other';
      subjectTotals[subj] = (subjectTotals[subj] || 0) + s.time;
      totalSessionMins += s.time;
    });

    finalSubjectShare = Object.keys(subjectTotals).map((name, idx) => ({
      name,
      value: totalSessionMins > 0 ? Math.round((subjectTotals[name] / totalSessionMins) * 100) : 0,
      color: baseColors[idx % baseColors.length],
    })).filter(s => s.value > 0);
  }

  const allTodos = Object.values(todos).flat();
  const activeTodos = allTodos.filter(t => !t.completed).slice(0, 2);

  // Merge dashboard stats with performance analytics for a complete picture
  const stats = dashboard.stats;
  const analytics = dashboard.performanceAnalytics;
  const displayStreak = stats?.currentStreak ?? analytics?.currentStreak ?? studyProfile.streak ?? 0;
  const displayRank = stats?.globalRank ?? analytics?.globalRank ?? 0;
  const displayRankScore = stats?.rankScore ?? analytics?.rankScore ?? 0;
  const displayTotalHours = stats?.totalStudyHours ?? analytics?.totalStudyHours ?? Math.floor(timer.totalStudyTime / 60) ?? 0;
  const displayActiveGroups = stats?.activeGroups ?? myGroups.length;

  const isLoading = loading && !stats && !analytics;
  const isRefreshing = false;

  return (
    <BottomBar activeTabOverride="Study">
      <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={trendLoading || analyticsLoading}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Error Banner */}
        {error && (
          <TouchableOpacity style={styles.errorBanner} onPress={() => dispatch(clearError())}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorDismiss}>Tap to dismiss</Text>
          </TouchableOpacity>
        )}

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            <DashboardHeader />

            {/* Study Trend Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Study Trend</Text>
              <View style={styles.periodSelector}>
                {PERIOD_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.periodBtn, trendPeriod === opt.key && styles.periodBtnActive]}
                    onPress={() => handlePeriodChange(opt.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.periodText, trendPeriod === opt.key && styles.periodTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {trendLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <StudyTrendChart data={studyTrend} />
            )}

            {finalSubjectShare.length > 0 && <SubjectPieChart data={finalSubjectShare} />}

            {/* Stats Row */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statNum}>{displayActiveGroups}</Text>
                <Text style={styles.statLbl}>Groups</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⏱</Text>
                <Text style={styles.statNum}>{displayTotalHours}h</Text>
                <Text style={styles.statLbl}>Tracked</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statNum}>{displayStreak}</Text>
                <Text style={styles.statLbl}>Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statNum}>{displayRankScore}</Text>
                <Text style={styles.statLbl}>Points</Text>
              </View>
            </View>

            {/* Analytics Row (if available) */}
            {analytics && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>📊</Text>
                  <Text style={styles.statNum}>{analytics.totalSessions || 0}</Text>
                  <Text style={styles.statLbl}>Sessions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>✅</Text>
                  <Text style={styles.statNum}>{analytics.totalTasksCompleted || 0}</Text>
                  <Text style={styles.statLbl}>Tasks Done</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>🎯</Text>
                  <Text style={styles.statNum}>{analytics.totalGoalsAchieved || 0}</Text>
                  <Text style={styles.statLbl}>Goals Hit</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>🏆</Text>
                  <Text style={styles.statNum}>{displayRank ? `#${displayRank}` : '-'}</Text>
                  <Text style={styles.statLbl}>Rank</Text>
                </View>
              </View>
            )}

            {/* Upcoming To-Dos */}
            {activeTodos.length > 0 && (
              <View style={styles.banner}>
                <Text style={styles.bannerIcon}>📅</Text>
                <View style={styles.bannerBody}>
                  <Text style={styles.bannerTitle}>Upcoming To-Dos</Text>
                  {activeTodos.map((t) => (
                    <Text key={t.id} style={styles.bannerLine}>
                      • {t.text}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* My Study Groups */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Study Groups</Text>
              <Text style={styles.sectionCount}>{myGroups.length} groups</Text>
            </View>

            {myGroups.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyText}>No study groups yet</Text>
                <Text style={styles.emptySubtext}>Join or create a group to get started</Text>
              </View>
            ) : (
              myGroups.map((group) => (
                <TouchableOpacity key={group.id} onPress={() => navigation.navigate('GroupLobby', { groupId: String(group.id), groupName: (group as any).title || (group as any).name })}>
                  <View pointerEvents="none">
                    <GroupCard group={group as any} />
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </BottomBar>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pageBg },
  scroll: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 14, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderBrown },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  chartLoading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { fontSize: 12, color: '#991b1b', fontWeight: '600' },
  errorDismiss: { fontSize: 10, color: '#b91c1c', marginTop: 4 },
  periodSelector: { flexDirection: 'row', gap: 4 },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  periodTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statNum: { fontSize: 16, fontWeight: '800', color: colors.primary },
  statLbl: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  banner: { flexDirection: 'row', backgroundColor: '#eef2ff', borderRadius: 12, padding: 12, alignItems: 'center', gap: 12, marginBottom: 14, borderWidth: 1, borderColor: '#c7d2fe' },
  bannerIcon: { fontSize: 24 },
  bannerBody: { flex: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#3730a3', marginBottom: 2 },
  bannerLine: { fontSize: 11, color: '#4338ca', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.primary },
  sectionCount: { fontSize: 12, color: colors.textMuted, fontWeight: '600', paddingBottom: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  emptySubtext: { fontSize: 12, color: colors.textMuted },
});
