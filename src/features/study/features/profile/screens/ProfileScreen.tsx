import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, TextInput, StyleSheet, Image, RefreshControl,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchStudyProfile, updateProfile } from '../store/profilSlice';
import { fetchMyProfile, fetchAllProfilePhotos } from '../../../../../store/slices/profileSlice';
import AuthService, { api } from '../../../../../services/auth.service';
import { colors } from '../../../theme/colors';
import {
  Clock, Flame, Target, CheckCircle2,
  Users, Award, ChevronLeft, Edit3,
  Calendar, Sparkles, Trophy,
} from 'lucide-react-native';

function getBaseUrl(): string {
  const base = api.defaults.baseURL || 'http://localhost:4000';
  if (Platform.OS === 'android' && (base.includes('localhost') || base.includes('127.0.0.1'))) {
    return base.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return base;
}

function resolveAvatarUri(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const base = getBaseUrl();
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/') || trimmed.startsWith('api/')) {
    return `${base}/${trimmed}`;
  }

  return `${base}/api/v1/profile/profile-photo/get-photo/${trimmed}`;
}

interface StatCardProps {
  iconNode: React.ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
  highlight?: boolean;
}

function StatCard({ iconNode, value, label, sublabel, highlight }: StatCardProps) {
  return (
    <View style={[sc.card, highlight && sc.cardHighlight]}>
      <View style={sc.iconWrapper}>{iconNode}</View>
      <Text style={sc.value}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sublabel ? <Text style={sc.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  // Redux state
  const studyProfile   = useAppSelector(s => s.studyProfile);
  const goals          = useAppSelector(s => s.goals.items || []);
  const todos          = useAppSelector(s => s.todos.items || {});
  const mainProfile    = useAppSelector(s => s.profile?.data);
  const profilePhotos  = useAppSelector(s => s.profile?.profilePhotos);
  const authUser       = useAppSelector((s: any) => s.auth?.user);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [imgError, setImgError]     = useState(false);

  // Edit form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [bio, setBio]             = useState('');

  // ── Load All Data ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      await Promise.allSettled([
        dispatch(fetchStudyProfile()),
        dispatch(fetchMyProfile()),
        dispatch(fetchAllProfilePhotos()),
      ]);
    } catch (e) {
      console.warn('[ProfileScreen] Refresh error:', e);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ── Resolved Dynamic Profile Information ──────────────────────────────────
  const mp: any = mainProfile || {};
  const realFirstName = mp.firstName || authUser?.firstName || studyProfile.firstName || '';
  const realLastName  = mp.lastName || authUser?.lastName || studyProfile.lastName || '';
  const displayName   = (
    (realFirstName + ' ' + realLastName).trim() ||
    mp.name ||
    studyProfile.name ||
    authUser?.name ||
    'Student'
  );

  const email = mp.email || authUser?.email || '';
  const displayUsername = email
    ? `@${email.split('@')[0]}`
    : mp.username
    ? `@${mp.username}`
    : studyProfile.username
    ? (studyProfile.username.startsWith('@') ? studyProfile.username : `@${studyProfile.username}`)
    : '@student';

  const isValidHl = (val: any): boolean => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim().toLowerCase();
    return trimmed.length > 0 && trimmed !== 'user' && trimmed !== 'admin' && trimmed !== 'member' && trimmed !== 'null' && trimmed !== 'undefined';
  };

  const candidateHl = typeof mp.headline === 'object' && mp.headline !== null ? (mp.headline.title || mp.headline.headlineText || mp.headline.text) : mp.headline;

  const displayBio = (
    (isValidHl(candidateHl) && candidateHl.trim()) ||
    (isValidHl(mp.about) && mp.about.trim()) ||
    (isValidHl(studyProfile.bio) && studyProfile.bio.trim()) ||
    'Focused student on Throne8 Study Groups'
  );

  // Joined date resolution
  const createdAt = mp.createdAt || authUser?.createdAt || mp.created_at;
  const joinedDateText = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Photo resolution
  const activePhoto = profilePhotos?.find((p: any) => p.isActive || p.active) || profilePhotos?.[0];
  const rawAvatarUrl = (
    activePhoto?.cloudinarySecureUrl ||
    activePhoto?.cloudinaryUrl ||
    activePhoto?.url ||
    activePhoto?.imageUrl ||
    activePhoto?.photoUrl ||
    mp.profileImage ||
    mp.avatar ||
    studyProfile.profileImage ||
    studyProfile.avatar ||
    ''
  );
  const resolvedAvatar = resolveAvatarUri(rawAvatarUrl);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4a3728&color=ffffff&bold=true&size=180`;
  const avatarToDisplay = (!imgError && resolvedAvatar) ? resolvedAvatar : fallbackAvatar;

  // ── Calculated Real Stats ─────────────────────────────────────────────────
  const totalTodosCount = Object.values(todos).reduce((acc: number, list: any) => {
    if (Array.isArray(list)) {
      return acc + list.filter(t => t.completed).length;
    }
    return acc;
  }, 0);

  const completedGoalsCount = goals.filter(g => {
    const p = g.progress || [];
    return p.length > 0 && p.every(Boolean);
  }).length;

  const totalStudyHoursDisplay = studyProfile.studyHoursTotal > 0
    ? `${studyProfile.studyHoursTotal}h`
    : '0h';

  const currentStreak = studyProfile.streak || 0;
  const longestStreak = studyProfile.longestStreak || currentStreak;
  const globalRank    = studyProfile.rank > 0 ? `#${studyProfile.rank}` : 'Unranked';

  // Open Edit modal with prefilled data
  const handleOpenEdit = () => {
    setFirstName(realFirstName);
    setLastName(realLastName);
    setBio(displayBio);
    setEditing(true);
  };

  // Save changes to backend
  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: bio.trim(),
      };

      await AuthService.updateUserProfile(updates);
      dispatch(updateProfile({
        firstName: updates.firstName,
        lastName: updates.lastName,
        name: `${updates.firstName} ${updates.lastName}`.trim(),
        bio: updates.headline,
      }));
      dispatch(fetchMyProfile());

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeScreen>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            activeOpacity={0.75}
          >
            <ChevronLeft size={22} color={colors.primary} />
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Study Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Main Profile Card ── */}
        <View style={s.avatarCard}>
          <View style={s.avatarRing}>
            <Image
              source={{ uri: avatarToDisplay }}
              onError={() => setImgError(true)}
              style={s.avatarImg}
              resizeMode="cover"
            />
          </View>

          <Text style={s.profileName}>{displayName}</Text>
          <Text style={s.username}>{displayUsername}</Text>
          <Text style={s.bio}>{displayBio}</Text>

          {/* Metadata Row: Joined date + Global Rank Badge */}
          <View style={s.joinedRow}>
            <View style={s.joinedBadge}>
              <Calendar size={13} color={colors.textMuted} />
              <Text style={s.joined}>Joined {joinedDateText}</Text>
            </View>

            <View style={s.rankBadge}>
              <Trophy size={13} color="#fff" />
              <Text style={s.rankText}>{globalRank}</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={s.editBtn}
            onPress={handleOpenEdit}
            activeOpacity={0.8}
          >
            <Edit3 size={15} color={colors.primary} />
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Streak Banner ── */}
        <View style={s.streakBanner}>
          <View style={s.streakIconBox}>
            <Flame size={24} color="#f97316" fill="#f97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.streakTitle}>
              {currentStreak > 0 ? `${currentStreak}-Day Study Streak!` : 'Start Your Streak Today!'}
            </Text>
            <Text style={s.streakSub}>
              {longestStreak > 0
                ? `Personal best: ${longestStreak} days in a row`
                : 'Complete a study session today to build momentum'}
            </Text>
          </View>
        </View>

        {/* ── Stats Grid (100% Dynamic from Backend) ── */}
        <View style={s.sectionHeaderRow}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={s.sectionTitle}>Performance Analytics</Text>
        </View>

        <View style={s.statsGrid}>
          <StatCard
            iconNode={<Clock size={20} color={colors.primary} />}
            value={totalStudyHoursDisplay}
            label="Total Study Time"
            sublabel={studyProfile.todayStudyHours > 0 ? `${studyProfile.todayStudyHours}h today` : undefined}
          />
          <StatCard
            iconNode={<Flame size={20} color="#f97316" fill="#f97316" />}
            value={currentStreak}
            label="Day Streak"
            sublabel={`${longestStreak}d record`}
          />
          <StatCard
            iconNode={<Target size={20} color="#0284c7" />}
            value={studyProfile.totalGoalsAchieved || completedGoalsCount}
            label="Goals Completed"
            sublabel={`${goals.length} active`}
          />
          <StatCard
            iconNode={<CheckCircle2 size={20} color="#16a34a" />}
            value={studyProfile.totalTasksCompleted || totalTodosCount}
            label="Tasks Completed"
          />
          <StatCard
            iconNode={<Users size={20} color="#7c3aed" />}
            value={studyProfile.activeGroups || 0}
            label="Active Groups"
          />
          <StatCard
            iconNode={<Award size={20} color="#c9932a" />}
            value={studyProfile.totalSessions || 0}
            label="Study Sessions"
          />
        </View>

        {/* ── Goals Overview Section ── */}
        <View style={s.sectionHeaderRow}>
          <Target size={16} color={colors.primary} />
          <Text style={s.sectionTitle}>Goals Overview</Text>
        </View>

        <View style={s.goalsCard}>
          {goals.length === 0 ? (
            <View style={s.emptyBox}>
              <Target size={30} color="#c0b0a0" />
              <Text style={s.emptyTitle}>No study goals yet</Text>
              <Text style={s.emptyText}>Create a study goal to track your weekly progress!</Text>
            </View>
          ) : (
            goals.map(g => {
              const prog = g.progress || [];
              const done = prog.filter(Boolean).length;
              const pct  = prog.length > 0 ? Math.round((done / prog.length) * 100) : 0;
              const barColor = g.color || colors.primary;

              return (
                <View key={g.id} style={s.goalRow}>
                  <View style={[s.goalDot, { backgroundColor: barColor }]} />
                  <Text style={s.goalName} numberOfLines={1}>{g.title}</Text>
                  <View style={s.goalProgress}>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { backgroundColor: barColor, width: `${pct}%` as any }]} />
                    </View>
                    <Text style={s.pctLabel}>{pct}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editing} transparent animationType="slide">
        <View style={em.overlay}>
          <View style={em.box}>
            <View style={em.topRow}>
              <Text style={em.heading}>Edit Study Profile</Text>
              <TouchableOpacity onPress={() => setEditing(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={em.x}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={em.label}>First Name</Text>
            <TextInput
              style={em.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={em.label}>Last Name</Text>
            <TextInput
              style={em.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={em.label}>Bio / Headline</Text>
            <TextInput
              style={[em.input, { height: 85, textAlignVertical: 'top' }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell other students about your study goals..."
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <View style={em.actions}>
              <TouchableOpacity
                style={em.cancelBtn}
                onPress={() => setEditing(false)}
                disabled={saving}
              >
                <Text style={em.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[em.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={em.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#e8ded4',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHighlight: {
    borderColor: '#d4c4b5',
    backgroundColor: '#fffdfa',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#e8ded4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
});

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#f7f3ee',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#d4c4b5',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },

  // Avatar Card
  avatarCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8ded4',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#c9932a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a3728',
    marginBottom: 12,
    shadowColor: '#c9932a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
  },
  username: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  bio: {
    fontSize: 13,
    color: '#6b5847',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ded4',
  },
  joined: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#d4c4b5',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },

  // Streak Banner
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#fff7ed',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
  },
  streakIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#9a3412',
  },
  streakSub: {
    fontSize: 11,
    color: '#c2410c',
    fontWeight: '600',
    marginTop: 2,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },

  // Goals Section
  goalsCard: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8ded4',
    gap: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 120,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    backgroundColor: '#f1ebe5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});

const em = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  box: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  x: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1.5,
    borderColor: '#e8ded4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d4c4b5',
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
});