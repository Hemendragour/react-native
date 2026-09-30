import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import { useAppSelector } from '../../../store';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

function resolveAvatarUrl(raw: string | undefined, name: string): string {
  if (!raw) return DEFAULT_AVATAR;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('data:')) return raw;
  return DEFAULT_AVATAR;
}

export function DashboardHeader() {
  const profile = useAppSelector(s => s.studyProfile);
  const dashboard = useAppSelector(s => s.dashboard);
  const timer = useAppSelector(s => s.timer);
  const mainProfile = useAppSelector(s => s.profile.data);
  const profilePhotos = useAppSelector(s => s.profile.profilePhotos);

  // ── Name: mainProfile is the real user data ──────────────────────────────
  const firstName = mainProfile?.firstName || dashboard.user?.firstName || profile.firstName || '';
  const lastName = mainProfile?.lastName || dashboard.user?.lastName || profile.lastName || '';
  const displayName = (
    (firstName + ' ' + lastName).trim()
    || dashboard.user?.name
    || profile.name
    || 'Student'
  );

  // ── Username from email ──────────────────────────────────────────────────
  const email = mainProfile?.email || dashboard.user?.email || '';
  const displayUsername = email ? `@${email.split('@')[0]}` : profile.username || '';

  // ── Avatar: resolve from profilePhotos (Cloudinary) → mainProfile → fallback ──
  let rawAvatar = '';

  // 1) Try active profile photo from profilePhotos array (Cloudinary URL)
  if (profilePhotos && profilePhotos.length > 0) {
    const activePhoto = profilePhotos.find((p: any) => p.isActive || p.active) || profilePhotos[0];
    rawAvatar = activePhoto?.cloudinarySecureUrl
      || activePhoto?.cloudinaryUrl
      || activePhoto?.url
      || activePhoto?.imageUrl
      || activePhoto?.photoUrl
      || '';
  }

  // 2) Fallback to main profile's profileImage
  if (!rawAvatar) {
    rawAvatar = mainProfile?.profileImage || '';
  }

  // 3) Fallback to dashboard user avatar
  if (!rawAvatar) {
    rawAvatar = dashboard.user?.profileImage || dashboard.user?.avatar || '';
  }

  // 4) Fallback to study profile avatar
  if (!rawAvatar) {
    rawAvatar = profile.profileImage || profile.avatar || '';
  }

  const displayAvatar = resolveAvatarUrl(rawAvatar, displayName);

  // ── Rank ─────────────────────────────────────────────────────────────────
  const displayRank = dashboard.stats?.globalRank
    ? `#${dashboard.stats.globalRank}`
    : dashboard.performanceAnalytics?.globalRank
      ? `#${dashboard.performanceAnalytics.globalRank}`
      : profile.rank ? `#${profile.rank}` : 'Member';

  // ── Stats ────────────────────────────────────────────────────────────────
  const displayStreak = dashboard.stats?.currentStreak ?? dashboard.performanceAnalytics?.currentStreak ?? profile.streak ?? 0;
  const displayTotalHours = (dashboard.stats?.totalStudyHours ?? dashboard.performanceAnalytics?.totalStudyHours ?? Math.floor(timer.totalStudyTime / 60)) || profile.studyHoursTotal || 0;
  const displayRankScore = dashboard.stats?.rankScore ?? dashboard.performanceAnalytics?.rankScore ?? 0;

  // ── Weekly goal ──────────────────────────────────────────────────────────
  const weeklyGoal = dashboard.stats?.weeklyGoal || timer.dailyGoal * 7 || 35;
  const weeklyProgress = dashboard.stats?.weeklyProgress || timer.totalStudyTime / 60 || 0;

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Image
          source={{ uri: displayAvatar }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.meta}>
            {displayUsername ? <Text style={styles.metaText}>{displayUsername}</Text> : null}
            {displayUsername ? <Text style={styles.metaDot}>·</Text> : null}
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{displayRank}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{displayStreak}</Text>
          <Text style={styles.statLabel}>🔥 Streak</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{displayTotalHours}h</Text>
          <Text style={styles.statLabel}>⏱ Total</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{displayRankScore}</Text>
          <Text style={styles.statLabel}>⭐ Points</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{displayRank}</Text>
          <Text style={styles.statLabel}>📊 Rank</Text>
        </View>
      </View>

      {/* Weekly progress bar */}
      <View style={styles.weeklyWrap}>
        <View style={styles.weeklyRow}>
          <Text style={styles.weeklyLabel}>Weekly Goal</Text>
          <Text style={styles.weeklyFraction}>
            {Math.floor(weeklyProgress)}h / {weeklyGoal}h
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100) || 0}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.border,
  },
  info: { flex: 1 },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rankBadge: {
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pageBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  weeklyWrap: {},
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  weeklyLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  weeklyFraction: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  barBg: {
    height: 6,
    backgroundColor: colors.cardBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
