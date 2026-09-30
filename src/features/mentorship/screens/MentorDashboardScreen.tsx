import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  Clipboard,
  Platform,
  Share,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Star,
  BarChart3,
  Users,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  Award,
  CheckCircle,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Plus,
  Trash2,
  Edit3,
  Video,
  Share2,
  Copy,
  Package,
  HelpCircle,
  Bell,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Bookmark,
  RotateCw,
  Briefcase,
  Check,
  Search,
  XCircle,
  ChevronLeft,
  Ban,
  Globe,
  TrendingUp,
  Building2,
  Smartphone,
  Link as LinkIcon,
  Gift,
  Mail,
  Download,
  QrCode,
  Megaphone,
  MoreVertical,
  Pencil,
  ArrowUpDown,
  RefreshCw,
  ClipboardList,
  Tag,
  AlarmClock,
  AlertCircle,
  Eye,
  Upload,
  Image as ImageIcon,
  Lock,
  ThumbsUp,
  Flag,
  MessageCircle,
  Send,
  ArrowUp,
  ArrowDown,
  Wallet,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { DASHBOARD_MENU_ITEMS } from '../data/mentorMockdata';
import BookingsPage from '../components/BookingsPage';
import { SectionHeader, Card } from '../components/SharedUI';
import MentorProfile from '../components/mentorProfile';
import UpdateProfileModal from '../components/UpdateProfileModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import MentorshipService from '../../../services/mentorship.service';
import SessionService from '../../../services/session.service';
import AvailabilityService from '../../../services/availability.service';
import AnalyticsService from '../../../services/analytics.service';
import ReviewService from '../../../services/review.service';
import NotificationService from '../../../services/notification.service';
import QueryService from '../../../services/query.service';
import WithdrawalService from '../../../services/withdrawal.service';
import SeniorMentorService from '../../../services/senior-mentor.service';
import SeniorMentorApplicationScreen from './SeniorMentorApplicationScreen';
import { FeedService } from '../../../services/feed.service';
import MentorshipSearchService from '../../../services/mentorship-search.service';
import ImagePicker from 'react-native-image-crop-picker';
import { API_BASE_URL } from '@env';
import { api } from '../../../services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW } = Dimensions.get('window');
const DRAWER_W = Math.min(SW * 0.82, 320);

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f7f3ee',
  surface: '#FAF9F6',
  border: '#d4c4b5',
  gold: '#c9932a',
};

function initialsFrom(name: any) {
  if (typeof name !== 'string') return 'M';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'M';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function getNumericTrustScore(scoreData: any): number {
  if (typeof scoreData === 'number') return scoreData;
  if (typeof scoreData === 'object' && scoreData !== null) {
    if (typeof scoreData.overall === 'number') return scoreData.overall;
    if (typeof scoreData.score === 'number') return scoreData.score;
  }
  if (typeof scoreData === 'string') {
    const parsed = parseInt(scoreData, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 86;
}

export const getResolvedAuthorId = (item: any): string | null => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return (
    item.userId ||
    item.menteeId ||
    item.authorId ||
    item.user?._id ||
    item.user?.userId ||
    item.user?.id ||
    item.mentee?._id ||
    item.mentee?.userId ||
    item.mentee?.id ||
    item.author?._id ||
    item.author?.userId ||
    item.author?.id ||
    item.bookedBy?._id ||
    item.bookedBy?.userId ||
    item.bookedBy?.id ||
    (typeof item.bookedBy === 'string' ? item.bookedBy : null) ||
    item._id ||
    item.id ||
    null
  );
};

export const getResolvedAuthorEmail = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string' && item.includes('@')) return item;
  const candidates = [
    item.email,
    item.mentee?.email,
    item.user?.email,
    item.author?.email,
    item.bookedBy?.email,
    item.menteeEmail,
    item.bookedByEmail,
    item.account?.email,
  ];
  for (const e of candidates) {
    if (typeof e === 'string' && e.trim().length > 0 && !e.includes('example.com') && !e.includes('test.com')) {
      return e.trim();
    }
  }
  return '';
};

export const getResolvedAuthorName = (item: any): string => {
  if (!item) return 'Community Member';
  const candidates = [
    item.authorName,
    item.author?.fullName,
    item.author?.name,
    item.user?.fullName,
    item.user?.name,
    item.menteeName,
    item.mentee?.fullName,
    item.mentee?.name,
    item.fullName,
    item.name,
    (item.user?.firstName || item.user?.lastName) ? `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() : null,
    (item.mentee?.firstName || item.mentee?.lastName) ? `${item.mentee?.firstName || ''} ${item.mentee?.lastName || ''}`.trim() : null,
    (item.author?.firstName || item.author?.lastName) ? `${item.author?.firstName || ''} ${item.author?.lastName || ''}`.trim() : null,
    item.userName,
    item.username,
    item.author?.username,
    item.user?.username,
    item.account?.fullName,
    item.account?.name,
    item.title,
  ];
  for (const n of candidates) {
    if (typeof n === 'string' && n.trim().length > 0 && n !== 'Community Mentor' && n !== 'Unknown User' && n !== 'Throne8 User' && n !== 'Senior Mentor' && n !== 'Mentor') {
      return n.trim();
    }
  }
  return item.authorName || item.fullName || item.username || 'Community Member';
};

export const menteeProfileCache: Record<string, any> = {};

export const fetchMenteeProfile = async (userId: string): Promise<any> => {
  if (!userId || typeof userId !== 'string') return null;
  if (menteeProfileCache[userId]) return menteeProfileCache[userId];

  try {
    const [userRes, photoRes] = await Promise.allSettled([
      api.get(`/api/v1/auth/get-user/${userId}`),
      api.get(`/api/v1/profile/profile-photo/get-all-photos/${userId}`).catch(() =>
        api.get(`/api/v1/profile/profile-photo/user/${userId}/active`)
      ),
    ]);

    let rawUser: any = {};
    let rawProfile: any = {};
    if (userRes.status === 'fulfilled') {
      const data = userRes.value.data?.data || userRes.value.data || {};
      rawUser = data.user || data.account || (data.data?.user ? data.data.user : data);
      rawProfile = data.profile || (data.data?.profile ? data.data.profile : {});
    }

    let photoUrl = '';
    if (photoRes.status === 'fulfilled' && photoRes.value?.data) {
      const pData = photoRes.value.data?.data || photoRes.value.data || [];
      const pArr = Array.isArray(pData) ? pData : pData.photos || (pData.url || pData.cloudinarySecureUrl ? [pData] : []);
      const activePhoto = Array.isArray(pArr)
        ? pArr.find((p: any) => p.isActive || p.active) || pArr[0]
        : null;
      photoUrl =
        activePhoto?.cloudinarySecureUrl ||
        activePhoto?.cloudinaryUrl ||
        activePhoto?.url ||
        activePhoto?.imageUrl ||
        '';
    }

    const firstName = rawUser.firstName || rawProfile.firstName || '';
    const lastName = rawUser.lastName || rawProfile.lastName || '';
    const fullName =
      rawUser.fullName ||
      rawProfile.fullName ||
      `${firstName} ${lastName}`.trim() ||
      rawUser.name ||
      rawProfile.name ||
      rawUser.username ||
      '';
    const email = rawUser.email || rawProfile.email || '';
    const avatar =
      photoUrl ||
      rawUser.profileImage ||
      rawUser.avatar ||
      rawUser.profilePhoto ||
      rawProfile.profileImage ||
      rawProfile.avatar ||
      '';

    const resolved = {
      userId,
      _id: userId,
      name: fullName,
      fullName,
      firstName,
      lastName,
      email,
      avatar,
      profilePic: avatar,
      profileImage: avatar,
      username: rawUser.username,
      raw: { ...rawUser, ...rawProfile },
    };

    if (fullName || email || avatar) {
      menteeProfileCache[userId] = resolved;
    }
    return resolved;
  } catch (err) {
    console.warn('⚠️ [MENTEE_FETCH] Failed for user:', userId, err);
    return null;
  }
};

export const getResolvedAuthorPic = (item: any): string | null => {
  if (!item) return null;
  const baseUrl = API_BASE_URL || 'http://localhost:4000';
  const candidates = [
    item.avatar,
    item.profilePic,
    item.profilePhotoUrl,
    item.profileImage,
    item.profilePhoto,
    item.authorAvatar,
    item.menteeProfilePhoto,
    item.mentee?.profilePic,
    item.mentee?.avatar,
    item.mentee?.profilePhoto,
    item.mentee?.profileImage,
    item.mentee?.profilePhotoUrl,
    item.user?.avatar,
    item.user?.profilePic,
    item.user?.profileImage,
    item.user?.profilePhoto,
    item.user?.profilePhotoUrl,
    item.author?.avatar,
    item.author?.profileImage,
    item.author?.profilePhoto,
    item.author?.profilePhotoUrl,
    item.photo,
    item.account?.profileImage,
    item.account?.avatar,
  ];
  for (const pic of candidates) {
    if (!pic) continue;
    if (typeof pic === 'string' && pic.trim().length > 0) {
      if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') || pic.startsWith('file:')) {
        return pic;
      }
      return `${baseUrl}/api/v1/profile/profile-photo/get-photo/${pic}`;
    }
    if (typeof pic === 'object' && pic !== null) {
      const nested = pic.url || pic.secure_url || pic.uri || pic.cloudinarySecureUrl || pic.imageUrl;
      if (typeof nested === 'string' && nested.trim().length > 0) {
        if (nested.startsWith('http://') || nested.startsWith('https://') || nested.startsWith('data:') || nested.startsWith('file:')) {
          return nested;
        }
        return `${baseUrl}/api/v1/profile/profile-photo/get-photo/${nested}`;
      }
    }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. DASHBOARD OVERVIEW (MOBILE CARDS)
// ─────────────────────────────────────────────────────────────────────────────
const DashboardOverviewPage: React.FC<{
  mentorData: any;
  sessions: any[];
  setActivePage: (p: string) => void;
  refreshSessions?: () => void;
}> = ({ mentorData, sessions, setActivePage, refreshSessions }) => {
  const [liveTrustScore, setLiveTrustScore] = useState<any>(null);
  const [liveUpcomingSessions, setLiveUpcomingSessions] = useState<any[]>([]);
  const [liveAnalytics, setLiveAnalytics] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const mentorId = mentorData?.mentorId || mentorData?._id;

  const fetchOverviewData = useCallback(async () => {
    if (!mentorId) return;
    try {
      setLoadingOverview(true);
      const [trustRes, upcomingRes, analyticsRes] = await Promise.allSettled([
        MentorshipService.getMyTrustScore(),
        SessionService.getUpcomingSessions(),
        AnalyticsService.getMentorDashboard(mentorId),
      ]);

      if (trustRes.status === 'fulfilled' && trustRes.value) {
        setLiveTrustScore(trustRes.value);
      }
      if (upcomingRes.status === 'fulfilled' && upcomingRes.value?.data) {
        const up = Array.isArray(upcomingRes.value.data) ? upcomingRes.value.data : [];
        setLiveUpcomingSessions(up);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setLiveAnalytics(analyticsRes.value);
      }
    } catch (e) {
      // Fallback gracefully to props
    } finally {
      setLoadingOverview(false);
    }
  }, [mentorId]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // Combined upcoming sessions from live endpoint or sessions prop
  const effectiveSessions = liveUpcomingSessions.length > 0 ? liveUpcomingSessions : sessions;
  const upcomingSessionsList = effectiveSessions.filter(
    (s: any) => s.status !== 'completed' && s.status !== 'cancelled'
  );

  const allOverviewBookings = useMemo(() => {
    return (sessions || []).flatMap((s: any) => {
      if (s.bookings && s.bookings.length > 0) return s.bookings;
      if (s.attendees && s.attendees.length > 0) return s.attendees;
      if (Boolean(s.bookedBy || s.menteeId || s.bookedMenteeName || s.mentee) && s.status !== 'available' && s.status !== 'open') return [s];
      return [];
    });
  }, [sessions]);

  const totalSessionsCount = Math.max(
    sessions.length,
    allOverviewBookings.length,
    liveAnalytics?.totalSessions ?? 0,
    mentorData?.stats?.totalSessions ?? 0
  );

  const averageRating =
    liveAnalytics?.reviews?.averageRating ??
    mentorData?.stats?.averageRating ??
    0;

  const rawTrust = liveTrustScore?.overallScore ?? liveTrustScore?.score ?? mentorData?.trustScore;
  const trustScoreValue = rawTrust ? getNumericTrustScore(rawTrust) : 86;

  const isVerified =
    mentorData?.isVerified === true ||
    mentorData?.verificationStatus === 'verified' ||
    liveTrustScore?.verificationStatus === 'verified' ||
    trustScoreValue >= 80;

  return (
    <View style={{ gap: 20 }}>
      {/* ── 1. Top 4 Metric Cards (2x2 Grid) ── */}
      <View style={{ marginBottom: 2 }}>
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {/* Total Sessions */}
          <View className="w-[48.5%] bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm justify-between min-h-[125px]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-[#f5ede4] items-center justify-center">
                <FileText size={18} color="#7a5c3e" />
              </View>
              {liveAnalytics?.bookingRate?.value !== undefined && (
                <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Text className="text-[10px] font-bold text-emerald-700">
                    {liveAnalytics.bookingRate.value}% rate
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-3xl font-black text-[#3c2a1e] tracking-tight">{totalSessionsCount}</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-1">Total sessions</Text>
          </View>

          {/* Upcoming Sessions */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActivePage('booking')}
            className="w-[48.5%] bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm justify-between min-h-[125px]"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-[#f5ede4] items-center justify-center">
                <Calendar size={18} color="#7a5c3e" />
              </View>
              <View className="bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#e4dbd1]">
                <Text className="text-[10px] font-bold text-[#7a5c3e]">Live</Text>
              </View>
            </View>
            <Text className="text-3xl font-black text-[#3c2a1e] tracking-tight">{upcomingSessionsList.length}</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-1">Upcoming</Text>
          </TouchableOpacity>

          {/* Rating */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActivePage('review')}
            className="w-[48.5%] bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm justify-between min-h-[125px]"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-[#f5ede4] items-center justify-center">
                <Star size={18} color="#7a5c3e" fill="#7a5c3e" />
              </View>
              <Text className="text-[10px] font-bold text-[#8a7a6a]">
                {liveAnalytics?.reviews?.totalReviews || mentorData?.stats?.totalReviews || 0} reviews
              </Text>
            </View>
            <Text className="text-2xl font-black italic text-[#4a3728] tracking-tight">
              {averageRating > 0 ? `${averageRating.toFixed(1)} ★` : 'New'}
            </Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-1">Rating</Text>
          </TouchableOpacity>

          {/* Trust Score */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActivePage('trust')}
            className="w-[48.5%] bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm justify-between min-h-[125px]"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-10 h-10 rounded-xl bg-[#f5ede4] items-center justify-center">
                <ShieldCheck size={18} color="#7a5c3e" />
              </View>
              <View className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Text className="text-[10px] font-bold text-amber-700">Top 10%</Text>
              </View>
            </View>
            <Text className="text-2xl font-black italic text-[#4a3728] tracking-tight">
              {trustScoreValue}%
            </Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-1">Trust score</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Verification / Trust Status Banner ── */}
      <View className="mt-4">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActivePage('trust')}
          className="bg-white rounded-3xl p-4 border border-[#e4dbd1] flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center flex-1 pr-3">
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isVerified ? 'bg-emerald-700' : 'bg-[#3c2a1e]'
              }`}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#3c2a1e]">
                {isVerified ? 'Verified Mentor Badge Active' : 'Complete verification to unlock your badge'}
              </Text>
              <Text className="text-xs text-[#8a7a6a] mt-0.5">
                {isVerified
                  ? 'Your profile is verified and ranked higher in searches'
                  : 'Verified mentors get 3x more booking requests'}
              </Text>
            </View>
          </View>
          <ArrowUpRight size={18} color="#7a5c3e" />
        </TouchableOpacity>
      </View>

      {/* ── 3. Upcoming Sessions Section ── */}
      <View className="mt-4 bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm">

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-lg bg-[#f5ede4] items-center justify-center">
              <Calendar size={16} color="#7a5c3e" />
            </View>
            <View>
              <Text className="text-base font-black text-[#3c2a1e]">Upcoming sessions</Text>
              <Text className="text-[10px] text-[#8a7a6a]">
                {upcomingSessionsList.length} scheduled session{upcomingSessionsList.length === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setActivePage('booking')}
            className="bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#e4dbd1]"
          >
            <Text className="text-xs font-bold text-[#7a5c3e]">View all</Text>
          </TouchableOpacity>
        </View>

        {upcomingSessionsList.length === 0 ? (
          <View className="bg-[#FAF8F5] p-7 rounded-2xl border border-[#ece4dc] items-center justify-center">
            <View className="w-12 h-12 rounded-2xl bg-[#f4ebe1] items-center justify-center mb-3">
              <Calendar size={22} color="#7a5c3e" />
            </View>
            <Text className="text-sm font-bold text-[#3c2a1e] mb-1">No upcoming sessions yet</Text>
            <Text className="text-xs text-[#8a7a6a] text-center mb-4">
              Set your availability to start accepting 1:1 mentorship bookings.
            </Text>
            <TouchableOpacity
              onPress={() => setActivePage('availability')}
              className="bg-[#4a3728] px-4 py-2 rounded-full flex-row items-center gap-1.5"
            >
              <Clock size={14} color="#fff" />
              <Text className="text-xs font-bold text-white">Set Availability</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {upcomingSessionsList.slice(0, 4).map((s: any, idx: number) => {
              const b = (s.bookings && s.bookings[0]) || s;
              const menteeName =
                b.menteeName ||
                b.bookedMenteeName ||
                s.mentee?.fullName ||
                s.mentee?.firstName ||
                'Mentee';
              const isExpired = s.scheduledAt ? new Date(s.scheduledAt).getTime() < Date.now() : false;
              const sessionDate = s.scheduledAt
                ? new Date(s.scheduledAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Upcoming';

              return (
                <TouchableOpacity
                  key={s.sessionId || s._id || idx}
                  activeOpacity={0.75}
                  onPress={() => setActivePage('booking')}
                  className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-9 h-9 rounded-full bg-[#4a3728] items-center justify-center mr-3">
                      <Text className="text-xs font-bold text-white">{initialsFrom(menteeName)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-[#3c2a1e]">{menteeName}</Text>
                      <Text className="text-[11px] text-[#8a7a6a] mt-0.5">
                        {s.title || s.sessionType || '1:1 Mentorship'} • {sessionDate}
                      </Text>
                    </View>
                  </View>
                  <View className={`${isExpired ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'} px-2.5 py-1 rounded-full border`}>
                    <Text className={`text-[10px] font-bold ${isExpired ? 'text-rose-700' : 'text-emerald-700'} uppercase`}>
                      {isExpired ? 'Expired' : (s.status || 'Confirmed')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ── 4. Quick Actions ── */}
      <View style={{ marginTop: 2 }}>
        <Text className="text-sm font-black text-[#3c2a1e] mb-3">Quick actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <TouchableOpacity
            onPress={() => setActivePage('availability')}
            className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-full px-4 py-2.5 flex-row items-center gap-2 mr-2.5 active:bg-[#f0e6dc]"
          >
            <Clock size={16} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Update availability</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActivePage('services')}
            className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-full px-4 py-2.5 flex-row items-center gap-2 mr-2.5 active:bg-[#f0e6dc]"
          >
            <Briefcase size={16} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Manage services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActivePage('plans')}
            className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-full px-4 py-2.5 flex-row items-center gap-2 mr-2.5 active:bg-[#f0e6dc]"
          >
            <Calendar size={16} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Create a plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActivePage('analytics')}
            className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-full px-4 py-2.5 flex-row items-center gap-2 mr-2.5 active:bg-[#f0e6dc]"
          >
            <BarChart3 size={16} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">View analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActivePage('review')}
            className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-full px-4 py-2.5 flex-row items-center gap-2 active:bg-[#f0e6dc]"
          >
            <Star size={16} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Reviews</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── 5. Become Senior Mentor Promo Card (New Box) ── */}
      <View style={{ marginTop: 2 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActivePage('senior-mentor')}
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: '#2d1f14',
            borderWidth: 1,
            borderColor: '#4a3728',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Gold gradient header strip */}
          <View
            style={{
              backgroundColor: '#c9932a',
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Award size={16} color="#fff" fill="#fff" />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '900',
                color: '#fff',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Exclusive Programme
            </Text>
          </View>
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 6, lineHeight: 26 }}>
                  Become a{' '}
                  <Text style={{ color: '#c9932a' }}>Senior Mentor</Text>
                </Text>
                <Text style={{ fontSize: 13, color: '#c8b8a8', lineHeight: 19, marginBottom: 14 }}>
                  Unlock elite perks: higher earnings, priority placement, verified badge, and exclusive community access.
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {['3× Visibility', 'Gold Badge', 'Priority Support'].map((perk) => (
                    <View
                      key={perk}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: '#ffffff18',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}
                    >
                      <CheckCircle size={12} color="#c9932a" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#e8d5b0' }}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#c9932a22',
                  borderWidth: 2,
                  borderColor: '#c9932a55',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={26} color="#c9932a" />
              </View>
            </View>
            <View
              style={{
                marginTop: 16,
                backgroundColor: '#c9932a',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Apply Now</Text>
              <ArrowUpRight size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. QUERIES & PRIORITY DMS
// ─────────────────────────────────────────────────────────────────────────────
const QueriesPage: React.FC<{ mentorData: any }> = ({ mentorData }) => {
  const [queries, setQueries] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'pending' | 'answered' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);

  const fetchQueries = useCallback(async () => {
    try {
      const res = await QueryService.getMentorQueries();
      setQueries(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleAnswerSubmit = async () => {
    const trimmed = answerText.trim();
    if (!trimmed || !selectedQuery) return;

    if (trimmed.length < 10) {
      Alert.alert('Response Too Short', 'Your answer must be at least 10 characters long to provide meaningful guidance.');
      return;
    }

    const targetQueryId = selectedQuery.queryId || selectedQuery.id || selectedQuery._id;
    if (!targetQueryId) {
      Alert.alert('Error', 'Unable to find query identifier.');
      return;
    }

    setAnswering(true);
    try {
      await QueryService.answerQuery(targetQueryId, trimmed);
      Alert.alert('Success', 'Your response has been delivered!');
      setSelectedQuery(null);
      setAnswerText('');
      fetchQueries();
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to submit answer';
      Alert.alert('Unable to Submit Answer', serverMsg);
    } finally {
      setAnswering(false);
    }
  };

  const allCount = queries.length;
  const pendingCount = useMemo(() => queries.filter((q) => q.status === 'pending' || !q.status).length, [queries]);
  const answeredCount = useMemo(() => queries.filter((q) => q.status === 'answered').length, [queries]);
  const expiredCount = useMemo(() => queries.filter((q) => q.status === 'expired').length, [queries]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      // Status filter
      let matchesStatus = true;
      if (tab === 'pending') matchesStatus = q.status === 'pending' || !q.status;
      else if (tab === 'answered') matchesStatus = q.status === 'answered';
      else if (tab === 'expired') matchesStatus = q.status === 'expired';

      if (!matchesStatus) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const search = searchQuery.toLowerCase();
      const mName = (q.mentee?.fullName || q.mentee?.firstName || q.menteeName || '').toLowerCase();
      const question = (q.question || '').toLowerCase();
      const title = (q.title || '').toLowerCase();
      return mName.includes(search) || question.includes(search) || title.includes(search);
    });
  }, [queries, tab, searchQuery]);

  const queryTabs = [
    { id: 'all', label: 'All', icon: HelpCircle, count: allCount },
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount },
    { id: 'answered', label: 'Answered', icon: CheckCircle2, count: answeredCount },
    { id: 'expired', label: 'Expired', icon: XCircle, count: expiredCount },
  ];

  const currentTabLabel = queryTabs.find((t) => t.id === tab)?.label || 'All';

  return (
    <View className="space-y-4">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center gap-3 mb-1">
        <View className="w-10 h-10 rounded-xl bg-[#3c2a1e] items-center justify-center shadow-sm">
          <HelpCircle size={20} color="#ffffff" />
        </View>
        <View>
          <Text className="text-lg font-black text-[#3c2a1e]">Queries</Text>
          <Text className="text-xs text-[#8a7a6a] font-medium">Text questions from your mentees</Text>
        </View>
      </View>

      {/* ── 2. Search Bar ── */}
      <View className="bg-white border border-[#e4dbd1] rounded-2xl px-3.5 py-2.5 flex-row items-center mb-1 shadow-sm">
        <Search size={16} color="#8a7a6a" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search queries, questions or mentees..."
          placeholderTextColor="#b0a090"
          className="flex-1 ml-2.5 text-xs text-[#3c2a1e] py-0"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <X size={15} color="#8a7a6a" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── 3. Tabs Pill Bar with Counts (No Big Boxes) ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2 py-0.5">
          {queryTabs.map((t) => {
            const isSelected = tab === t.id;
            const IconComp = t.icon;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id as any)}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-2.5 rounded-full border shadow-xs ${
                  isSelected
                    ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                    : 'bg-white border-[#e4dbd1]'
                }`}
              >
                <IconComp size={13} color={isSelected ? '#ffffff' : '#7a5c3e'} />
                <Text
                  className={`text-xs font-bold ml-1.5 ${
                    isSelected ? 'text-white' : 'text-[#3c2a1e]'
                  }`}
                >
                  {t.label}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full ml-2 ${
                    isSelected ? 'bg-white/20' : 'bg-[#FAF8F5] border border-[#e4dbd1]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      isSelected ? 'text-white' : 'text-[#7a5c3e]'
                    }`}
                  >
                    {t.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── 4. Queries Content List / Empty State ── */}
      {loading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="small" color="#4a3728" />
          <Text className="text-[#8a7a6a] mt-2 text-xs font-bold">Loading queries...</Text>
        </View>
      ) : filteredQueries.length === 0 ? (
        <View className="bg-white rounded-3xl p-10 border border-[#e4dbd1] shadow-sm items-center justify-center">
          <View className="w-12 h-12 rounded-2xl bg-[#faf6f0] border border-[#ece4dc] items-center justify-center mb-3">
            <HelpCircle size={22} color="#8a7a6a" />
          </View>
          <Text className="text-sm font-black text-[#3c2a1e]">
            {tab === 'all' && !searchQuery ? 'No queries yet' : `No ${currentTabLabel.toLowerCase()} queries found`}
          </Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1">
            Queries from mentees will show up here
          </Text>
        </View>
      ) : (
        <View className="gap-y-3">
          {filteredQueries.map((q: any, idx: number) => {
            const menteeName = q.mentee?.fullName || q.mentee?.firstName || q.menteeName || 'Mentee Question';
            const initials = menteeName.slice(0, 2).toUpperCase();
            const isPending = q.status === 'pending' || !q.status;
            const isAnswered = q.status === 'answered';

            return (
              <View
                key={q._id || q.queryId || idx}
                className="bg-white p-5 rounded-3xl border border-[#e4dbd1] shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 rounded-2xl bg-[#f5ede4] border border-[#d4c4b5] items-center justify-center mr-3">
                      <Text className="text-[#4a3728] font-black text-xs">{initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-[#3c2a1e]" numberOfLines={1}>
                        {menteeName}
                      </Text>
                      <Text className="text-[10px] text-[#8a7a6a] mt-0.5">
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Recent'} • {q.topic || 'Priority Q&A'}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`px-2.5 py-0.5 rounded-full border ${
                      isAnswered
                        ? 'bg-emerald-50 border-emerald-200'
                        : isPending
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-bold uppercase ${
                        isAnswered ? 'text-emerald-800' : isPending ? 'text-amber-800' : 'text-gray-700'
                      }`}
                    >
                      {q.status || 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Question Box */}
                <View className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] mb-3">
                  <Text className="text-xs text-[#3c2a1e] leading-5 font-medium">{q.question}</Text>
                </View>

                {/* Answer / Action */}
                {q.answer ? (
                  <View className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                    <Text className="text-[10px] font-bold text-emerald-800 uppercase mb-1">Your Guidance</Text>
                    <Text className="text-xs text-emerald-950 leading-5">{q.answer}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setSelectedQuery(q)}
                    activeOpacity={0.8}
                    className="w-full bg-[#3c2a1e] py-3 rounded-2xl items-center shadow-sm"
                  >
                    <Text className="text-white text-xs font-bold">Reply to Question</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── 5. Answer Bottom-Sheet Modal ── */}
      {selectedQuery && (
        <Modal visible={!!selectedQuery} transparent animationType="slide" onRequestClose={() => setSelectedQuery(null)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end bg-black/50"
          >
            <Pressable className="flex-1" onPress={() => setSelectedQuery(null)} />
            <View className="bg-white rounded-t-[36px] p-6 border-t border-[#d4c4b5] shadow-2xl max-h-[85%]">
              <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-black text-[#3c2a1e]">Answer Query</Text>
                <TouchableOpacity onPress={() => setSelectedQuery(null)}>
                  <X size={18} color="#7a5c3e" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-[#7a5c3e] mb-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] leading-5 font-medium">
                "{selectedQuery.question}"
              </Text>
              <TextInput
                value={answerText}
                onChangeText={setAnswerText}
                placeholder="Type your mentoring guidance (min 10 characters)..."
                placeholderTextColor="#b0a090"
                multiline
                numberOfLines={4}
                className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-3.5 text-xs text-[#3c2a1e] min-h-[105px] mb-2 text-align-top"
              />
              <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className="text-[10px] text-[#8a7a6a]">
                  {answerText.trim().length < 10
                    ? `Minimum 10 characters required (${answerText.trim().length}/10)`
                    : 'Ready to submit'}
                </Text>
                <Text className="text-[10px] text-[#8a7a6a]">{answerText.trim().length}/5000</Text>
              </View>
              <TouchableOpacity
                onPress={handleAnswerSubmit}
                disabled={answering || answerText.trim().length < 10}
                className={`w-full bg-[#3c2a1e] py-3.5 rounded-2xl items-center shadow-sm mb-4 ${
                  answering || answerText.trim().length < 10 ? 'opacity-60' : ''
                }`}
              >
                {answering ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-xs font-black">Send Response</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. SERVICES PAGE (MOBILE APP ADAPTED FROM WEBSITE)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 3. SERVICES PAGE (MATCHING WEBSITE DASHBOARD WITH SORT & MENTEE STATUS)
// ─────────────────────────────────────────────────────────────────────────────
type SortOption = 'recent' | 'price_high' | 'price_low' | 'name';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most recent',
  price_high: 'Price: High to Low',
  price_low: 'Price: Low to High',
  name: 'Name (A-Z)',
};

const SERVICE_TYPES = [
  { id: 'quick_call', label: 'Quick Call', icon: Video, color: '#3b82f6', bg: '#e8effd', duration: 30, defaultPrice: 499, desc: '1:1 focused quick discussion' },
  { id: 'deep_dive', label: 'Deep Dive', icon: Video, color: '#8b5cf6', bg: '#f1ebfa', duration: 60, defaultPrice: 999, desc: 'Comprehensive consultation session' },
  { id: 'resume_review', label: 'Resume Review', icon: FileText, color: '#f59e0b', bg: '#fef3e2', duration: 30, defaultPrice: 799, desc: 'Detailed feedback on your resume' },
  { id: 'mock_interview', label: 'Mock Interview', icon: MessageSquare, color: '#10b981', bg: '#e6f7f2', duration: 45, defaultPrice: 1299, desc: 'Realistic interview simulation & feedback' },
  { id: 'career_planning', label: 'Career Planning', icon: Briefcase, color: '#6366f1', bg: '#eeedfd', duration: 45, defaultPrice: 899, desc: 'Long-term roadmap & career guidance' },
  { id: 'portfolio_review', label: 'Portfolio Review', icon: Package, color: '#ec4899', bg: '#fdeef5', duration: 30, defaultPrice: 799, desc: 'Portfolio critique & recommendations' },
  { id: 'ask_query', label: 'Ask a Query', icon: MessageSquare, color: '#f97316', bg: '#fef1e8', duration: 15, defaultPrice: 299, desc: 'Priority text Q&A response' },
  { id: 'group_session', label: 'Group Session', icon: Users, color: '#059669', bg: '#e7f7ed', duration: 60, defaultPrice: 499, desc: 'Live group masterclass for multiple learners' },
];

// ── Service Type & Follow-up Options Constants (Matching Web) ────────────────
const SERVICE_TYPE_DETAILS = [
  { name: 'quick_call', label: 'Quick Call', description: 'Quick 30-minute call for specific questions', emoji: '⚡', needsDescription: false },
  { name: 'deep_dive', label: 'Deep Dive', description: 'In-depth 60-minute session for detailed discussion', emoji: '🎯', needsDescription: true },
  { name: 'resume_review', label: 'Resume Review', description: 'Professional resume review with ATS scoring', emoji: '📄', needsDescription: true },
  { name: 'mock_interview', label: 'Mock Interview', description: 'Practice interview with real-time feedback', emoji: '🎤', needsDescription: true },
  { name: 'career_planning', label: 'Career Planning', description: 'Comprehensive career planning and roadmap', emoji: '🗺️', needsDescription: true },
  { name: 'portfolio_review', label: 'Portfolio Review', description: 'Portfolio review for designers and developers', emoji: '💼', needsDescription: true },
  { name: 'ask_query', label: 'Ask a Query', description: 'Text-based async query (no live call)', emoji: '❓', needsDescription: false },
  { name: 'group_session', label: 'Group Session', description: 'Group learning and interactive mentoring', emoji: '👥', needsDescription: true },
];

// ─── SERVICE DATE TIME PICKER (INTERACTIVE CALENDAR & SLOTS) ──────────────────
interface ServiceDateTimePickerProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedTimeStr: string; // e.g. "16:00"
  onSelectTimeStr: (t: string) => void;
  title?: string;
}

const ServiceDateTimePicker: React.FC<ServiceDateTimePickerProps> = ({
  selectedDate,
  onSelectDate,
  selectedTimeStr,
  onSelectTimeStr,
  title = "Schedule Date & Time",
}) => {
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = new Date(year, month, 1).getDay();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const quickDates = useMemo(() => {
    const d0 = new Date();
    const d1 = new Date(); d1.setDate(d1.getDate() + 1);
    const d2 = new Date(); d2.setDate(d2.getDate() + 2);
    const d7 = new Date(); d7.setDate(d7.getDate() + 7);
    return [
      { label: 'Today', date: d0 },
      { label: 'Tomorrow', date: d1 },
      { label: 'In 2 Days', date: d2 },
      { label: 'Next Week', date: d7 },
    ];
  }, []);

  const timePresets = [
    { label: '09:00 AM', value: '09:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '02:00 PM', value: '14:00' },
    { label: '04:00 PM', value: '16:00' },
    { label: '06:00 PM', value: '18:00' },
    { label: '07:30 PM', value: '19:30' },
    { label: '08:00 PM', value: '20:00' },
  ];

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const formattedSelected = useMemo(() => {
    const [h, m] = (selectedTimeStr || '16:00').split(':').map(Number);
    const d = new Date(selectedDate || new Date());
    d.setHours(h || 16, m || 0, 0, 0);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [selectedDate, selectedTimeStr]);

  return (
    <View className="p-4 rounded-2xl border-2 border-[#e0d8cf] bg-[#fbf7f3] mb-4">
      {/* Title */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#4a3728" />
          <Text className="text-xs font-bold text-[#4a3728] uppercase">{title}</Text>
        </View>
        <View className="bg-[#e0d8cf]/60 px-2.5 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-[#7a5c3e]">Select Date & Time</Text>
        </View>
      </View>

      {/* Quick Date Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3 py-0.5">
        {quickDates.map((q) => {
          const isSel = isSameDay(selectedDate, q.date);
          return (
            <TouchableOpacity
              key={q.label}
              onPress={() => {
                onSelectDate(q.date);
                setCalendarMonth(new Date(q.date.getFullYear(), q.date.getMonth(), 1));
              }}
              className={`px-3 py-1.5 rounded-xl border mr-2 ${
                isSel ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
              }`}
            >
              <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                {q.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mini Calendar View */}
      <View className="bg-white rounded-2xl p-3.5 border border-[#e0d8cf] mb-3 shadow-sm">
        <View className="flex-row items-center justify-between mb-2.5 pb-2 border-b border-[#f0ebe4]">
          <TouchableOpacity
            onPress={() => setCalendarMonth(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-lg bg-[#fbf7f3] border border-[#e0d8cf] items-center justify-center"
          >
            <ChevronLeft size={14} color="#4a3728" />
          </TouchableOpacity>
          <Text className="text-xs font-black text-[#4a3728]">
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded-lg bg-[#fbf7f3] border border-[#e0d8cf] items-center justify-center"
          >
            <ChevronRight size={14} color="#4a3728" />
          </TouchableOpacity>
        </View>

        {/* Day Labels */}
        <View className="flex-row mb-1.5">
          {dayLabels.map((dl, idx) => (
            <View key={`dl-${dl}-${idx}`} className="flex-1 items-center">
              <Text className="text-[10px] font-bold text-[#8a7a6a]">{dl}</Text>
            </View>
          ))}
        </View>

        {/* Month Day Grid */}
        <View className="flex-row flex-wrap">
          {Array.from({ length: startingDay }).map((_, i) => (
            <View key={`empty-${i}`} style={{ width: `${100 / 7}%` }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const cellDate = new Date(year, month, dayNum);
            const isPast = cellDate < todayStart;
            const isSel = isSameDay(selectedDate, cellDate);
            const isTd = isSameDay(today, cellDate);

            return (
              <View key={`day-${dayNum}`} style={{ width: `${100 / 7}%` }} className="p-0.5">
                <TouchableOpacity
                  onPress={() => {
                    if (!isPast) {
                      onSelectDate(cellDate);
                    }
                  }}
                  disabled={isPast}
                  activeOpacity={0.7}
                  className={`aspect-square rounded-lg items-center justify-center ${
                    isPast
                      ? 'bg-transparent'
                      : isSel
                      ? 'bg-[#4a3728]'
                      : isTd
                      ? 'bg-[#f0ebe4] border border-[#7a5c3e]'
                      : 'bg-[#faf6f0]'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isPast
                        ? 'text-gray-300'
                        : isSel
                        ? 'text-white'
                        : isTd
                        ? 'text-[#7a5c3e]'
                        : 'text-[#4a3728]'
                    }`}
                  >
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Time Slots Section */}
      <View className="mb-3">
        <View className="flex-row items-center gap-1.5 mb-2">
          <Clock size={13} color="#7a5c3e" />
          <Text className="text-xs font-bold text-[#4a3728]">Select Time Slot</Text>
        </View>
        <View className="flex-row flex-wrap gap-1.5 mb-1">
          {timePresets.map((tp) => {
            const isSel = selectedTimeStr === tp.value;
            return (
              <TouchableOpacity
                key={tp.value}
                onPress={() => onSelectTimeStr(tp.value)}
                className={`px-3 py-1.5 rounded-xl border ${
                  isSel ? 'bg-[#7a5c3e] border-[#7a5c3e]' : 'bg-white border-[#e0d8cf]'
                }`}
              >
                <Text className={`text-[11px] font-bold ${isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                  {tp.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Date & Time Confirmation Banner */}
      <View className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl flex-row items-center gap-2">
        <CheckCircle2 size={16} color="#059669" />
        <View className="flex-1">
          <Text className="text-[10px] font-bold text-emerald-800 uppercase">Selected Schedule</Text>
          <Text className="text-xs font-black text-emerald-950">{formattedSelected}</Text>
        </View>
      </View>
    </View>
  );
};

const FOLLOW_UP_ALLOWED_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1 Time' },
  { value: '2', label: '2 Times' },
  { value: '3', label: '3 Times' },
  { value: '4', label: '4 Times' },
  { value: '5', label: '5 Times' },
  { value: '6', label: '6 Times' },
  { value: '7', label: '7 Times' },
];

const FOLLOW_UP_PERIOD_OPTIONS = [
  { value: '0', label: 'N/A' },
  { value: '1', label: '24 Hours' },
  { value: '2', label: '48 Hours' },
  { value: '3', label: '72 Hours' },
  { value: '4', label: '96 Hours' },
  { value: '5', label: '120 Hours' },
];

const BUFFER_TIME_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1 Min' },
  { value: '5', label: '5 Min' },
  { value: '10', label: '10 Min' },
  { value: '15', label: '15 Min' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'free', label: 'Free (No Charge)' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getInitials = (nameStr: string) => {
  if (!nameStr) return 'M';
  const parts = nameStr.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameStr.slice(0, 2).toUpperCase();
};

function ServicesPage({
  sessions,
  refreshSessions,
  mentorData,
}: {
  sessions: any[];
  refreshSessions?: () => Promise<void> | void;
  mentorData?: any;
}) {
  const navigation = useNavigation<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(SERVICE_TYPES[0]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [description, setDescription] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('10');
  const [creating, setCreating] = useState(false);
  const [createCoverImage, setCreateCoverImage] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

  // Create Service Date & Time Picker state
  const [createScheduledDate, setCreateScheduledDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(16, 0, 0, 0);
    return d;
  });
  const [createScheduledTimeStr, setCreateScheduledTimeStr] = useState<string>('16:00');

  // Group Sessions & API
  const [groupSessions, setGroupSessions] = useState<any[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Sort State (Most recent, Price High/Low, Name) ─────────────────────────
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortModal, setShowSortModal] = useState(false);

  // ── Edit Service / Mentee Status Modal State (Matching Web) ────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaveError, setEditSaveError] = useState<string | null>(null);
  const [canonicalSession, setCanonicalSession] = useState<any>(null);
  const [originalScheduledAt, setOriginalScheduledAt] = useState<string>('');
  const [activeMenteeSession, setActiveMenteeSession] = useState<any>(null);
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null);

  // Edit Service Date & Time Picker state
  const [editSelectedDate, setEditSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(16, 0, 0, 0);
    return d;
  });
  const [editSelectedTimeStr, setEditSelectedTimeStr] = useState<string>('16:00');

  const [editFormData, setEditFormData] = useState<Record<string, any>>({
    title: '',
    description: '',
    duration: '30',
    scheduledAt: '',
    status: 'available',
    sessionType: 'quick_call',
    price: '0',
    paymentMethod: 'stripe',
    followUpAllowed: '0',
    followUpPeriod: '0',
    bufferTime: '0',
    minParticipants: '1',
    maxParticipants: '10',
  });

  const [liveSessions, setLiveSessions] = useState<any[]>(sessions || []);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [liveReviewStats, setLiveReviewStats] = useState<any>(null);

  // ── Card 3-Dots Action Menu State ─────────────────────────────────────────
  const [activeMenuSession, setActiveMenuSession] = useState<any>(null);
  const [showActionMenuModal, setShowActionMenuModal] = useState(false);

  const fetchAllServiceData = useCallback(async () => {
    const mentorId = mentorData?.mentorId || mentorData?._id;
    if (!mentorId) return;
    try {
      setGroupLoading(true);
      const [sRes, gRes, statsRes, reviewStatsRes] = await Promise.allSettled([
        SessionService.getMentorSessions(mentorId),
        MentorshipService.getAllGroupSessions({ mentorId }),
        SessionService.getSessionStats().catch(() => null),
        ReviewService.getReviewStats(mentorId).catch(() => null),
      ]);

      if (sRes.status === 'fulfilled' && sRes.value?.data) {
        setLiveSessions(Array.isArray(sRes.value.data) ? sRes.value.data : []);
      }
      if (gRes.status === 'fulfilled' && gRes.value) {
        const data = gRes.value?.data || gRes.value || [];
        setGroupSessions(Array.isArray(data) ? data : (data.data || []));
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setLiveStats(statsRes.value.data);
      }
      if (reviewStatsRes.status === 'fulfilled' && reviewStatsRes.value?.data) {
        setLiveReviewStats(reviewStatsRes.value.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setGroupLoading(false);
    }
  }, [mentorData]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setLiveSessions(sessions);
    }
    fetchAllServiceData();
  }, [sessions, fetchAllServiceData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshSessions) await refreshSessions();
    await fetchAllServiceData();
    setIsRefreshing(false);
  };

  // ── Selected Category Filter for Horizontal Bar ───────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryCounts = useMemo(() => {
    const list = liveSessions.length > 0 ? liveSessions : (sessions || []);
    const counts: Record<string, number> = {
      all: list.length + (groupSessions || []).length,
    };
    SERVICE_TYPES.forEach((st) => {
      if (st.id === 'group_session') {
        const gCount = (groupSessions || []).length + list.filter((s: any) => s.sessionType === 'group_session').length;
        counts[st.id] = gCount;
      } else {
        counts[st.id] = list.filter((s: any) => s.sessionType === st.id).length;
      }
    });
    return counts;
  }, [liveSessions, sessions, groupSessions]);

  // Filtered 1:1 sessions based on selected category
  const filteredSessionsList = useMemo(() => {
    const base = liveSessions.length > 0 ? liveSessions : (sessions || []);
    if (selectedCategory === 'all') return base;
    return base.filter((s: any) => s.sessionType === selectedCategory);
  }, [liveSessions, sessions, selectedCategory]);

  // Filtered group sessions based on selected category
  const filteredGroupList = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === 'group_session') {
      return groupSessions || [];
    }
    return [];
  }, [groupSessions, selectedCategory]);

  // ── Sort logic ────────────────────────────────────────────────────────────
  const sortedSessions = useMemo(() => {
    const list = [...(filteredSessionsList || [])];
    switch (sortBy) {
      case 'price_high':
        return list.sort((a, b) => (b.pricing?.basePrice ?? b.price ?? 0) - (a.pricing?.basePrice ?? a.price ?? 0));
      case 'price_low':
        return list.sort((a, b) => (a.pricing?.basePrice ?? a.price ?? 0) - (b.pricing?.basePrice ?? b.price ?? 0));
      case 'name':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'recent':
      default:
        return list;
    }
  }, [filteredSessionsList, sortBy]);

  const sortedGroupSessions = useMemo(() => {
    const list = [...(filteredGroupList || [])];
    switch (sortBy) {
      case 'price_high':
        return list.sort((a, b) => (b.pricing?.basePrice ?? b.pricePerPerson ?? 0) - (a.pricing?.basePrice ?? a.pricePerPerson ?? 0));
      case 'price_low':
        return list.sort((a, b) => (a.pricing?.basePrice ?? a.pricePerPerson ?? 0) - (b.pricing?.basePrice ?? b.pricePerPerson ?? 0));
      case 'name':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'recent':
      default:
        return list;
    }
  }, [filteredGroupList, sortBy]);

  // ── Open Create Modal ─────────────────────────────────────────────────────
  const handleOpenCreateModal = (st: any) => {
    setIsEditMode(false);
    setEditingSession(null);
    setCreateCoverImage(null);
    setSelectedType(st);
    setTitle(st.label);
    setPrice(String(st.defaultPrice));
    setDuration(String(st.duration));
    setDescription(st.desc);
    const defDate = new Date();
    defDate.setDate(defDate.getDate() + 1);
    defDate.setHours(16, 0, 0, 0);
    setCreateScheduledDate(defDate);
    setCreateScheduledTimeStr('16:00');
    setShowModal(true);
  };

  const handleChooseCreateImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setCreateCoverImage({
          uri: asset.uri,
          name: asset.fileName || 'service_cover.jpg',
          type: asset.type || 'image/jpeg',
        });
      }
    });
  };

  // ── Open Mentee Status / Edit Modal (Matching Web) ────────────────────────
  const handleOpenMenteeStatus = async (session: any) => {
    setShowActionMenuModal(false);
    setActiveMenteeSession(session);
    setEditModalVisible(true);
    setEditLoading(true);
    setEditSaveError(null);

    try {
      const targetSessionId = session.sessionId || session._id || session.id;
      let dbSession = session;
      const isGroup = session.sessionType === 'group_session' || session.isGroupSession || session.maxAttendees !== undefined;

      try {
        if (isGroup) {
          const gResponse = await MentorshipService.getGroupSessionById(targetSessionId).catch(() => null);
          if (gResponse?.data) {
            dbSession = { ...dbSession, ...gResponse.data, isGroupSession: true };
          } else if (gResponse && typeof gResponse === 'object') {
            dbSession = { ...dbSession, ...gResponse, isGroupSession: true };
          }
        }
        const response = await SessionService.getSessionById(targetSessionId).catch(() => null);
        if (response?.data) {
          dbSession = { ...dbSession, ...response.data };
        }

        // Enrich bookings & attendees with real user profile details
        const userIdsToEnrich = new Set<string>();
        (dbSession.bookings || []).forEach((b: any) => {
          const uid = getResolvedAuthorId(b.mentee || b.user || b.bookedBy || b);
          if (uid && typeof uid === 'string') userIdsToEnrich.add(uid);
          if (typeof b.bookedBy === 'string') userIdsToEnrich.add(b.bookedBy);
          if (typeof b.menteeId === 'string') userIdsToEnrich.add(b.menteeId);
        });
        (dbSession.attendees || []).forEach((att: any) => {
          const uid = getResolvedAuthorId(att.user || att);
          if (uid && typeof uid === 'string') userIdsToEnrich.add(uid);
          if (typeof att.userId === 'string') userIdsToEnrich.add(att.userId);
        });
        if (typeof dbSession.bookedBy === 'string') userIdsToEnrich.add(dbSession.bookedBy);
        if (typeof dbSession.menteeId === 'string') userIdsToEnrich.add(dbSession.menteeId);

        const idArray = Array.from(userIdsToEnrich).filter(id => Boolean(id) && id.length >= 8);
        if (idArray.length > 0) {
          try {
            const results = await Promise.allSettled(idArray.map((uid) => fetchMenteeProfile(uid)));
            const uMap: Record<string, any> = {};
            results.forEach((res, idx) => {
              if (res.status === 'fulfilled' && res.value) {
                uMap[idArray[idx]] = res.value;
              }
            });

            if (Array.isArray(dbSession.bookings)) {
              dbSession.bookings = dbSession.bookings.map((b: any) => {
                const uid = getResolvedAuthorId(b.mentee || b.user || b.bookedBy || b) || b.bookedBy || b.menteeId;
                if (uid && uMap[uid]) {
                  const uObj = uMap[uid];
                  return {
                    ...b,
                    mentee: typeof b.mentee === 'object' && b.mentee !== null ? { ...uObj, ...b.mentee } : uObj,
                    user: typeof b.user === 'object' && b.user !== null ? { ...uObj, ...b.user } : uObj,
                    menteeName: uObj.name || b.menteeName,
                    menteeEmail: uObj.email || b.menteeEmail,
                    menteeProfilePhoto: uObj.avatar || b.menteeProfilePhoto,
                  };
                }
                return b;
              });
            }

            if (Array.isArray(dbSession.attendees)) {
              dbSession.attendees = dbSession.attendees.map((att: any) => {
                const uid = getResolvedAuthorId(att.user || att) || att.userId;
                if (uid && uMap[uid]) {
                  const uObj = uMap[uid];
                  return {
                    ...att,
                    user: typeof att.user === 'object' && att.user !== null ? { ...uObj, ...att.user } : uObj,
                    fullName: uObj.name || att.fullName,
                    name: uObj.name || att.name,
                    email: uObj.email || att.email,
                    avatar: uObj.avatar || att.avatar,
                  };
                }
                return att;
              });
            }

            if (typeof dbSession.bookedBy === 'string' && uMap[dbSession.bookedBy]) {
              const uObj = uMap[dbSession.bookedBy];
              dbSession.mentee = uObj;
              dbSession.bookedMenteeName = uObj.name;
              dbSession.menteeName = uObj.name;
              dbSession.menteeEmail = uObj.email;
              dbSession.menteeProfilePhoto = uObj.avatar;
            }
          } catch (enrichErr) {
            console.warn('⚠️ [MENTEE ENRICH] Enrichment error:', enrichErr);
          }
        }
      } catch {
        // fallback to session prop
      }
      setCanonicalSession(dbSession);

      const isBooked = !!session.bookingId;
      const targetBooking = isBooked ? dbSession.bookings?.find((b: any) => b._id === session.bookingId) : null;
      const scheduledTime = targetBooking?.scheduledAt || dbSession.scheduledAt || new Date(Date.now() + 86400000).toISOString();
      const parsedDate = new Date(scheduledTime);
      const validDate = isNaN(parsedDate.getTime()) ? new Date(Date.now() + 86400000) : parsedDate;
      setEditSelectedDate(validDate);
      const hStr = String(validDate.getHours()).padStart(2, '0');
      const mStr = String(validDate.getMinutes()).padStart(2, '0');
      setEditSelectedTimeStr(`${hStr}:${mStr}`);

      const formattedDate = validDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setOriginalScheduledAt(formattedDate);

      const activeStatus = targetBooking ? targetBooking.status : (dbSession.status || 'available');

      setEditFormData({
        title: dbSession.title || '',
        description: dbSession.description || '',
        duration: String(dbSession.duration || (isGroup ? 60 : 30)),
        scheduledAt: formattedDate,
        status: activeStatus || (isGroup ? 'open' : 'available'),
        sessionType: dbSession.sessionType || (isGroup ? 'group_session' : 'quick_call'),
        price: String(dbSession.pricing?.basePrice ?? dbSession.pricePerPerson ?? dbSession.price ?? 0),
        paymentMethod: dbSession.payment?.method || dbSession.paymentMethod || 'stripe',
        followUpAllowed: dbSession.settings?.followUp?.allowed === true ? '1' :
                         dbSession.settings?.followUp?.allowed === false ? '0' :
                         (Number(dbSession.settings?.followUp?.allowed) > 0 ? String(dbSession.settings.followUp.allowed) : '0'),
        followUpPeriod: (Number(dbSession.settings?.followUp?.periodDays) > 0) ? String(dbSession.settings.followUp.periodDays) : '0',
        bufferTime: String(dbSession.settings?.bufferTimeMinutes ?? dbSession.bufferTime ?? 0),
        thumbnailUri: dbSession.thumbnailImage || null,
        thumbnailImage: null,
        rescheduleReason: '',
        minParticipants: String(dbSession.minParticipants ?? 1),
        maxParticipants: String(dbSession.maxParticipants ?? dbSession.maxAttendees ?? 10),
      });
    } catch (err: any) {
      setEditSaveError('Error loading existing session data.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Image Picker Handler ──────────────────────────────────────────────────
  const handleChooseImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (asset?.uri) {
        setEditFormData((prev: any) => ({
          ...prev,
          thumbnailImage: {
            uri: asset.uri,
            name: asset.fileName || 'service_image.jpg',
            type: asset.type || 'image/jpeg',
          },
          thumbnailUri: asset.uri,
        }));
      }
    });
  };

  // ── Save Edit Service Handler (Matching Web handleUpdate) ─────────────────
  const handleSaveEditService = async () => {
    if (!canonicalSession) return;
    const targetSessionId = canonicalSession.sessionId || canonicalSession._id || canonicalSession.id;
    const isGroup = editFormData.sessionType === 'group_session' || canonicalSession.isGroupSession || canonicalSession.maxAttendees !== undefined;

    try {
      setEditSaving(true);
      setEditSaveError(null);

      const scheduledIso = originalScheduledAt && !isNaN(new Date(originalScheduledAt).getTime())
        ? new Date(originalScheduledAt).toISOString()
        : new Date().toISOString();

      const isBooked = !!activeMenteeSession?.bookingId;
      const isRescheduling = false;

      if (isGroup) {
        await MentorshipService.updateGroupSession(targetSessionId, {
          title: editFormData.title,
          description: editFormData.description,
          duration: Number(editFormData.duration) || 60,
          pricePerPerson: Number(editFormData.price) || 0,
          minParticipants: Number(editFormData.minParticipants) || 1,
          maxParticipants: Number(editFormData.maxParticipants) || 10,
          status: editFormData.status || 'open',
          paymentMethod: editFormData.paymentMethod || 'razorpay',
          scheduledAt: scheduledIso,
        });
        await fetchAllServiceData();
      } else {
        const changes: any = {
          title: editFormData.title,
          description: editFormData.description,
          duration: Number(editFormData.duration) || 30,
          sessionType: editFormData.sessionType,
          paymentMethod: editFormData.paymentMethod,
        };

        if (!isRescheduling) {
          changes.scheduledAt = scheduledIso;
          if (editFormData.status) {
            changes.status = editFormData.status;
          }
        }

        const isFree = editFormData.paymentMethod === 'free';
        changes.pricing = isFree
          ? { basePrice: 0, platformFee: 0, totalAmount: 0, currency: 'INR' }
          : {
              basePrice: Number(editFormData.price) || 0,
              platformFee: Math.round((Number(editFormData.price) || 0) * 0.15),
              totalAmount: (Number(editFormData.price) || 0) + Math.round((Number(editFormData.price) || 0) * 0.15),
              currency: 'INR',
            };

        changes.settings = {
          followUp: {
            allowed: Number(editFormData.followUpAllowed) > 0,
            periodDays: Number(editFormData.followUpPeriod) || 0,
          },
          bufferTimeMinutes: Number(editFormData.bufferTime) || 0,
        };

        if (editFormData.thumbnailImage) {
          changes.thumbnailImageFile = editFormData.thumbnailImage;
        }

        await SessionService.updateSession(targetSessionId, changes);

        if (isRescheduling) {
          await SessionService.rescheduleSession(
            targetSessionId,
            {
              newScheduledAt: scheduledIso,
              reason: editFormData.rescheduleReason || 'Rescheduled by mentor',
            }
          );
        }

        if (refreshSessions) await refreshSessions();
      }

      await fetchAllServiceData();
      Alert.alert('Success', 'Service details updated successfully!');
      setEditModalVisible(false);
    } catch (err: any) {
      setEditSaveError(err.message || 'Failed to update service details.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete Service ────────────────────────────────────────────────────────
  const handleDeleteService = (session: any) => {
    setShowActionMenuModal(false);
    const bookings = session.bookings || [];
    const hasActiveBooking = bookings.some((b: any) => b.status === 'confirmed' || b.status === 'pending');

    if (hasActiveBooking) {
      Alert.alert(
        'Cannot Delete Service',
        'This service has active bookings. Please manage or cancel the bookings from Mentee Status before deleting.'
      );
      return;
    }

    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${session.title || 'this service'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const id = session.sessionId || session._id || session.id;
              if (session.sessionType === 'group_session' || session.maxAttendees !== undefined) {
                await MentorshipService.deleteGroupSession(id);
              } else {
                await SessionService.deleteSession(id);
                if (refreshSessions) refreshSessions();
              }
              await fetchAllServiceData();
              Alert.alert('Deleted', 'Service deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete service.');
            }
          },
        },
      ]
    );
  };

  // ── Create Service ────────────────────────────────────────────────────────
  const handleSaveService = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please enter a title and price.');
      return;
    }
    setCreating(true);
    try {
      // Set scheduledAt safely in the future so backend future-date validation passes
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      futureDate.setHours(12, 0, 0, 0);
      const scheduledAtIso = futureDate.toISOString();

      const numericPrice = parseFloat(price) || 0;
      const cleanDesc = description.trim()
        ? (description.trim().length < 20
            ? `${description.trim()} - Mentorship session with personalized guidance and actionable advice.`
            : description.trim())
        : `${title.trim()} - 1:1 mentorship session covering personalized guidance, practical advice, and actionable feedback.`;

      const pricingObj = {
        basePrice: numericPrice,
        platformFee: 0,
        totalAmount: numericPrice,
        currency: 'INR',
      };

      if (selectedType.id === 'group_session') {
        const groupDesc = description.trim()
          ? (description.trim().length < 50
              ? `${description.trim()} - Detailed group masterclass session with live walkthroughs and interactive mentoring.`
              : description.trim())
          : `${title.trim()} - Comprehensive group mentorship session covering practical workflows, deep dive concepts, and real-time interactive Q&A.`;

        await MentorshipService.createGroupSession({
          title: title.trim(),
          topic: title.trim(),
          description: groupDesc,
          sessionType: 'group_session',
          duration: parseInt(duration, 10) || 60,
          maxParticipants: parseInt(maxAttendees, 10) || 10,
          minParticipants: 1,
          scheduledAt: scheduledAtIso,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          pricePerPerson: numericPrice,
          paymentMethod: numericPrice > 0 ? 'razorpay' : 'free',
          thumbnailImage: createCoverImage || undefined,
          pricing: pricingObj,
        });
        Alert.alert('Success', 'Group session created successfully!');
      } else {
        await SessionService.createSession({
          sessionType: selectedType.id,
          title: title.trim(),
          description: cleanDesc,
          duration: parseInt(duration, 10) || 30,
          paymentMethod: numericPrice > 0 ? 'razorpay' : 'free',
          thumbnailImageFile: createCoverImage || undefined,
          scheduledAt: scheduledAtIso,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          pricing: pricingObj,
        });
        Alert.alert('Success', `${title} service created and published!`);
        if (refreshSessions) refreshSessions();
      }

      await fetchAllServiceData();
      setShowModal(false);
      setTitle('');
      setPrice('');
      setDescription('');
      setCreateCoverImage(null);
      setIsEditMode(false);
      setEditingSession(null);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to save service.');
    } finally {
      setCreating(false);
    }
  };

  // ── Confirm a pending mentee booking ──────────────────────────────────────
  const handleConfirmBooking = async (booking: any) => {
    const bookingId = booking.bookingId || booking._id || booking.id;
    const sessionId = canonicalSession?.sessionId || canonicalSession?._id || activeMenteeSession?.sessionId || activeMenteeSession?._id;
    if (!sessionId || !bookingId) return;

    try {
      setConfirmingBookingId(bookingId);
      await SessionService.confirmSession(sessionId, bookingId);
      Alert.alert('Confirmed', 'Mentee booking has been confirmed!');
      if (canonicalSession?.bookings) {
        setCanonicalSession({
          ...canonicalSession,
          bookings: canonicalSession.bookings.map((b: any) =>
            (b.bookingId === bookingId || b._id === bookingId || b.id === bookingId)
              ? { ...b, status: 'confirmed' }
              : b
          ),
        });
      }
      await fetchAllServiceData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to confirm booking.');
    } finally {
      setConfirmingBookingId(null);
    }
  };

  // ── Aggregate all enrolled mentees & buyers for the active session ─────────
  const enrolledMentees = useMemo(() => {
    const list: any[] = [];
    const src = canonicalSession || activeMenteeSession;
    if (!src) return list;

    // 1. Check bookings array
    if (Array.isArray(src.bookings) && src.bookings.length > 0) {
      src.bookings.forEach((b: any, idx: number) => {
        const mId = getResolvedAuthorId(b.mentee || b.user || b.bookedBy || b) || b.menteeId || b.userId || b.bookingId || b._id || b.id;
        const cached = (mId && menteeProfileCache[mId]) || {};
        const mName = getResolvedAuthorName(b.mentee || b.user || b.bookedBy || cached || b) || cached.name || b.menteeName || b.userName || b.bookedByName || `Mentee ${idx + 1}`;
        const mPic = getResolvedAuthorPic(b.mentee || b.user || b.bookedBy || cached || b) || cached.avatar || b.menteeProfilePhoto || '';
        const mEmail = getResolvedAuthorEmail(b.mentee || b.user || b.bookedBy || cached || b) || cached.email || '';

        list.push({
          id: b.bookingId || b._id || b.id || b.menteeId || `booking-${idx}`,
          userId: mId,
          bookingId: b.bookingId || b._id || b.id,
          name: mName,
          email: mEmail,
          avatar: mPic,
          scheduledAt: b.scheduledAt || src.scheduledAt,
          slotTime: b.slotTime || src.slotTime,
          status: b.status || (src.status !== 'available' ? src.status : 'confirmed'),
          amount: b.pricing?.totalAmount ?? b.pricing?.basePrice ?? b.amountPaid ?? src.pricePerPerson ?? src.pricing?.basePrice ?? src.price ?? 0,
          currency: b.pricing?.currency || 'INR',
          paymentStatus: b.payment?.status || b.paymentStatus || (Number(src.price || src.pricePerPerson) > 0 ? 'paid' : 'free'),
          paymentMethod: b.payment?.method || b.paymentMethod || 'razorpay',
          enrolledAt: b.bookedAt || b.createdAt || b.enrolledAt || src.createdAt,
          raw: b,
        });
      });
    }

    // 2. Check attendees array (for group masterclasses / sessions)
    if (Array.isArray(src.attendees) && src.attendees.length > 0) {
      src.attendees.forEach((att: any, idx: number) => {
        const exists = list.some(item => (att._id && item.id === att._id) || (att.userId && item.id === att.userId));
        if (!exists) {
          const aId = getResolvedAuthorId(att.user || att) || att.userId || att._id || att.id;
          const cached = (aId && menteeProfileCache[aId]) || {};
          const aName = getResolvedAuthorName(att.user || cached || att) || cached.name || att.fullName || att.name || att.menteeName || `Attendee ${idx + 1}`;
          const aPic = getResolvedAuthorPic(att.user || cached || att) || cached.avatar || att.avatar || '';
          const aEmail = getResolvedAuthorEmail(att.user || cached || att) || cached.email || '';

          list.push({
            id: att._id || att.userId || att.id || `att-${idx}`,
            userId: aId,
            bookingId: att.bookingId || att._id,
            name: aName,
            email: aEmail,
            avatar: aPic,
            scheduledAt: att.joinedAt || src.scheduledAt,
            slotTime: src.slotTime,
            status: att.status || 'confirmed',
            amount: att.amountPaid ?? src.pricePerPerson ?? src.pricing?.basePrice ?? src.price ?? 0,
            currency: 'INR',
            paymentStatus: att.paymentStatus || (Number(src.price || src.pricePerPerson) > 0 ? 'paid' : 'free'),
            paymentMethod: att.paymentMethod || 'razorpay',
            enrolledAt: att.joinedAt || att.createdAt || src.createdAt,
            raw: att,
          });
        }
      });
    }

    // 3. Direct booking check if 1:1 session is booked
    if (list.length === 0 && (src.bookedBy || src.mentee || src.bookedMenteeName || (src.status && src.status !== 'available' && src.status !== 'open'))) {
      const dId = getResolvedAuthorId(src.mentee || src.user || src.bookedBy || src) || src.bookingId || src._id;
      const cached = (dId && menteeProfileCache[dId]) || {};
      const dName = getResolvedAuthorName(src.mentee || src.user || src.bookedBy || cached || src) || cached.name || src.bookedMenteeName || src.menteeName || 'Enrolled Mentee';
      const dPic = getResolvedAuthorPic(src.mentee || src.user || src.bookedBy || cached || src) || cached.avatar || src.menteeProfilePhoto || '';
      const dEmail = getResolvedAuthorEmail(src.mentee || src.user || src.bookedBy || cached || src) || cached.email || '';

      list.push({
        id: src.bookingId || src._id || 'direct',
        userId: dId,
        bookingId: src.bookingId || src._id,
        name: dName,
        email: dEmail,
        avatar: dPic,
        scheduledAt: src.scheduledAt,
        slotTime: src.slotTime,
        status: src.status || 'confirmed',
        amount: src.pricing?.totalAmount ?? src.pricing?.basePrice ?? src.price ?? 0,
        currency: src.pricing?.currency || 'INR',
        paymentStatus: src.payment?.status || (Number(src.price) > 0 ? 'paid' : 'free'),
        paymentMethod: src.payment?.method || 'razorpay',
        enrolledAt: src.createdAt,
        raw: src,
      });
    }

    return list;
  }, [canonicalSession, activeMenteeSession]);

  // ── Dynamic Stats calculations ───────────────────────────────────────────
  const combinedSessionsList = useMemo(() => {
    return [...(liveSessions || []), ...(groupSessions || [])];
  }, [liveSessions, groupSessions]);

  const allServiceBookings = useMemo(() => {
    return combinedSessionsList.flatMap((s: any) => s.bookings || []);
  }, [combinedSessionsList]);

  const totalSessionsCount = useMemo(() => {
    if (typeof liveStats?.totalSessions === 'number') return liveStats.totalSessions;
    if (typeof mentorData?.stats?.totalSessions === 'number') return mentorData.stats.totalSessions;
    return combinedSessionsList.length;
  }, [liveStats, mentorData, combinedSessionsList]);

  const completedCount = useMemo(() => {
    if (typeof liveStats?.completedSessions === 'number') return liveStats.completedSessions;
    if (typeof mentorData?.stats?.completedSessions === 'number') return mentorData.stats.completedSessions;
    const completedSessions = combinedSessionsList.filter(
      (s: any) => s.status === 'completed' || s.status === 'finished'
    ).length;
    const completedBookings = allServiceBookings.filter(
      (b: any) => b.status === 'completed' || b.status === 'finished'
    ).length;
    return completedSessions + completedBookings;
  }, [liveStats, mentorData, combinedSessionsList, allServiceBookings]);

  const { avgRatingText, totalReviewsCount } = useMemo(() => {
    const rawAvg =
      liveReviewStats?.averageRating ??
      mentorData?.stats?.averageRating ??
      mentorData?.rating;
    const totalRev =
      liveReviewStats?.totalReviews ??
      mentorData?.stats?.totalReviews ??
      mentorData?.reviewsCount ??
      mentorData?.totalReviews ??
      0;
    const ratingStr = rawAvg && Number(rawAvg) > 0 ? `${Number(rawAvg).toFixed(1)} ★` : (totalRev > 0 ? '5.0 ★' : '5.0 ★');
    return { avgRatingText: ratingStr, totalReviewsCount: totalRev };
  }, [liveReviewStats, mentorData]);

  const currentServiceType = useMemo(() => {
    const stVal = editFormData.sessionType;
    return SERVICE_TYPE_DETAILS.find((t) => t.name === stVal) || SERVICE_TYPE_DETAILS[0];
  }, [editFormData.sessionType]);

  const isRescheduling = !!activeMenteeSession?.bookingId && editFormData.scheduledAt !== originalScheduledAt;

  return (
    <View className="space-y-4">
      {/* ── 1. Page Header with Refresh Action ── */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1 mr-2 min-w-0">
          <View className="w-11 h-11 rounded-2xl bg-[#3e2f24] items-center justify-center mr-3 shadow-xs">
            <Briefcase size={20} color="#ffffff" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-xl font-black text-[#3e2f24]" numberOfLines={1}>My Services</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>Manage your offerings</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleManualRefresh}
          activeOpacity={0.8}
          className="flex-row items-center px-3.5 py-2 rounded-xl border border-[#d4c4b5] bg-white shadow-xs"
        >
          <RotateCw size={13} color="#7a5c3e" className={isRefreshing ? 'animate-spin' : ''} />
          <Text className="text-xs font-bold text-[#7a5c3e] ml-1.5">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. Top Metric Cards Row ── */}
      <View className="flex-row gap-2.5 mb-4">
        {/* Total Sessions */}
        <View className="flex-1 bg-white rounded-2xl p-3 border border-[#e4dbd1] shadow-xs justify-between min-h-[92px]">
          <View className="w-8 h-8 rounded-xl bg-[#e8effd] border border-blue-100 items-center justify-center mb-1">
            <Users size={15} color="#2563eb" />
          </View>
          <View>
            <Text className="text-lg font-black text-[#3e2f24] tracking-tight" numberOfLines={1}>
              {totalSessionsCount}
            </Text>
            <Text className="text-[10px] font-bold text-[#8a7a6a] uppercase mt-0.5" numberOfLines={1}>
              Sessions
            </Text>
          </View>
        </View>

        {/* Completed */}
        <View className="flex-1 bg-white rounded-2xl p-3 border border-[#e4dbd1] shadow-xs justify-between min-h-[92px]">
          <View className="w-8 h-8 rounded-xl bg-[#e7f7ed] border border-emerald-100 items-center justify-center mb-1">
            <Clock size={15} color="#059669" />
          </View>
          <View>
            <Text className="text-lg font-black text-[#3e2f24] tracking-tight" numberOfLines={1}>
              {completedCount}
            </Text>
            <Text className="text-[10px] font-bold text-[#8a7a6a] uppercase mt-0.5" numberOfLines={1}>
              Completed
            </Text>
          </View>
        </View>

        {/* Avg Rating & Reviews */}
        <View className="flex-1 bg-white rounded-2xl p-3 border border-[#e4dbd1] shadow-xs justify-between min-h-[92px]">
          <View className="w-8 h-8 rounded-xl bg-[#fef3e2] border border-amber-100 items-center justify-center mb-1">
            <Star size={15} color="#d97706" />
          </View>
          <View>
            <Text className="text-lg font-black text-[#3e2f24] tracking-tight" numberOfLines={1}>
              {avgRatingText}
            </Text>
            <Text className="text-[10px] font-bold text-[#8a7a6a] uppercase mt-0.5" numberOfLines={1}>
              {totalReviewsCount > 0 ? `${totalReviewsCount} ${totalReviewsCount === 1 ? 'Review' : 'Reviews'}` : 'Rating'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── 3. Horizontal Categories Filter Bar ── */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2 px-0.5">
          <Text className="text-xs font-black text-[#7a6756] uppercase tracking-wider">
            Service Categories
          </Text>
          <Text className="text-xs text-[#8a7a6a] font-semibold">
            {selectedCategory === 'all'
              ? `${categoryCounts.all || 0} Total`
              : `${categoryCounts[selectedCategory] || 0} Created`}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
          <View className="flex-row items-center gap-2 pr-4">
            {/* "All Services" pill */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.8}
              className={`flex-row items-center px-3 py-2 rounded-xl border ${
                selectedCategory === 'all'
                  ? 'bg-[#3e2f24] border-[#3e2f24]'
                  : 'bg-white border-[#e4dbd1]'
              }`}
            >
              <Sparkles size={14} color={selectedCategory === 'all' ? '#ffffff' : '#7a5c3e'} />
              <Text
                numberOfLines={1}
                className={`text-xs font-bold ml-1.5 ${
                  selectedCategory === 'all' ? 'text-white' : 'text-[#3e2f24]'
                }`}
              >
                All Services
              </Text>
              {(categoryCounts.all || 0) > 0 ? (
                <View
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                    selectedCategory === 'all' ? 'bg-white/20' : 'bg-[#f4eee6]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      selectedCategory === 'all' ? 'text-white' : 'text-[#7a5c3e]'
                    }`}
                  >
                    {categoryCounts.all}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Individual Service Type Pills */}
            {SERVICE_TYPES.map((st) => {
              const isSelected = selectedCategory === st.id;
              const count = categoryCounts[st.id] || 0;
              const IconComp = st.icon;

              return (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setSelectedCategory(st.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center px-3 py-2 rounded-xl border ${
                    isSelected
                      ? 'bg-[#3e2f24] border-[#3e2f24]'
                      : 'bg-white border-[#e4dbd1]'
                  }`}
                >
                  <View
                    style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : st.bg }}
                    className="w-6 h-6 rounded-lg items-center justify-center mr-1.5"
                  >
                    <IconComp size={13} color={isSelected ? '#ffffff' : st.color} />
                  </View>
                  <Text
                    numberOfLines={1}
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-[#3e2f24]'
                    }`}
                  >
                    {st.label}
                  </Text>
                  {/* If 0 don't show any number! Only show badge when count > 0 */}
                  {count > 0 ? (
                    <View
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-[#f4eee6]'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black ${
                          isSelected ? 'text-white' : 'text-[#7a5c3e]'
                        }`}
                      >
                        {count}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── 4. Current Services Section (Filtered by Category) ── */}
      {selectedCategory !== 'group_session' && (
        <View className="mt-1 mb-2">
          {/* Header Title Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-2 min-w-0">
              <Text className="text-base font-black text-[#3e2f24]" numberOfLines={1}>
                {selectedCategory === 'all'
                  ? 'Current Services'
                  : `${SERVICE_TYPES.find((t) => t.id === selectedCategory)?.label || ''} Services`}
              </Text>
              <Text className="text-xs text-[#8a7a6a] font-medium" numberOfLines={1}>
                Manage your individual offerings & mentees
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                const targetType = SERVICE_TYPES.find((t) => t.id === selectedCategory) || SERVICE_TYPES[0];
                handleOpenCreateModal(targetType);
              }}
              activeOpacity={0.8}
              className="bg-[#3e2f24] px-3 py-1.5 rounded-xl flex-row items-center shadow-xs"
            >
              <Plus size={13} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">New</Text>
            </TouchableOpacity>
          </View>

          {/* Sort Row */}
          {sortedSessions.length > 0 && (
            <View className="flex-row items-center justify-end mb-2.5">
              <TouchableOpacity
                onPress={() => setShowSortModal(true)}
                activeOpacity={0.8}
                className="flex-row items-center px-2.5 py-1 rounded-lg border border-[#d4c4b5] bg-white shadow-xs"
              >
                <ArrowUpDown size={11} color="#7a5c3e" />
                <Text className="text-xs font-bold text-[#7a5c3e] ml-1">{SORT_LABELS[sortBy]}</Text>
              </TouchableOpacity>
            </View>
          )}

          {sortedSessions.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 border border-[#e4dbd1] shadow-xs items-center justify-center my-2">
              <View className="w-12 h-12 rounded-xl bg-[#faf6f0] border border-[#ece4dc] items-center justify-center mb-2.5">
                <ClipboardList size={22} color="#8a7a6a" />
              </View>
              <Text className="text-sm font-black text-[#3e2f24] text-center">
                {selectedCategory === 'all'
                  ? 'No services yet'
                  : `No ${SERVICE_TYPES.find((t) => t.id === selectedCategory)?.label || ''} services yet`}
              </Text>
              <Text className="text-xs text-[#8a7a6a] text-center mt-1 mb-3.5 max-w-[260px]">
                Create your offering to start accepting bookings from learners.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const targetType = SERVICE_TYPES.find((t) => t.id === selectedCategory) || SERVICE_TYPES[0];
                  handleOpenCreateModal(targetType);
                }}
                activeOpacity={0.8}
                className="bg-[#3e2f24] px-4 py-2 rounded-xl flex-row items-center shadow-xs"
              >
                <Plus size={13} color="#fff" />
                <Text className="text-white text-xs font-bold ml-1.5">
                  Create {SERVICE_TYPES.find((t) => t.id === selectedCategory)?.label || 'Offering'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-y-3">
              {sortedSessions.map((s, idx) => {
                const sTypeObj = SERVICE_TYPES.find((t) => t.id === s.sessionType) || SERVICE_TYPES[0];
                const priceVal = s.pricing?.basePrice ?? s.price ?? 0;
                const hasBookings = s.bookings && s.bookings.length > 0;
                const isDirectBooked = s.status && s.status !== 'available' && s.status !== 'open';
                const menteeCount = hasBookings ? s.bookings.length : isDirectBooked ? 1 : 0;
                const IconComp = sTypeObj.icon;

                return (
                  <View
                    key={s.sessionId || s._id || idx}
                    className="bg-white p-4 rounded-2xl border border-[#e4dbd1] shadow-xs"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2 min-w-0">
                        <View
                          style={{ backgroundColor: sTypeObj.bg }}
                          className="w-10 h-10 rounded-xl items-center justify-center mr-2.5"
                        >
                          <IconComp size={18} color={sTypeObj.color} />
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text className="text-sm font-black text-[#3e2f24]" numberOfLines={1} ellipsizeMode="tail">
                            {s.title || sTypeObj.label}
                          </Text>
                          <Text className="text-[11px] text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>
                            {s.duration || 30} mins • {(s.sessionType || '1:1').replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenuSession(s);
                          setShowActionMenuModal(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-[#faf6f0] border border-[#ece4dc] items-center justify-center"
                      >
                        <MoreVertical size={15} color="#8a7a6a" />
                      </TouchableOpacity>
                    </View>

                    {s.description ? (
                      <Text className="text-xs text-[#7a6756] leading-4 mb-2" numberOfLines={2} ellipsizeMode="tail">
                        {s.description}
                      </Text>
                    ) : null}

                    {s.scheduledAt ? (
                      <View className="flex-row items-center mb-2.5 bg-[#faf6f0] px-2.5 py-1 rounded-lg self-start border border-[#ece4dc]">
                        <Calendar size={11} color="#7a5c3e" />
                        <Text className="text-[11px] font-semibold text-[#7a5c3e] ml-1">
                          {new Date(s.scheduledAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    ) : null}

                    {/* Bottom: Price & Mentee Status Action */}
                    <View className="flex-row items-center justify-between pt-2.5 border-t border-[#f0ebe4]">
                      <View className="flex-1 mr-2">
                        <Text className="text-[9px] font-bold text-[#8a7a6a] uppercase">Price</Text>
                        <Text className="text-base font-black text-[#7a5c3e]" numberOfLines={1}>
                          {priceVal > 0 ? `₹${priceVal.toLocaleString('en-IN')}/hr` : 'Free'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleOpenMenteeStatus(s)}
                        activeOpacity={0.8}
                        className="bg-[#3e2f24] px-3.5 py-1.5 rounded-xl flex-row items-center"
                      >
                        <Users size={13} color="#ffffff" />
                        <Text className="text-white text-xs font-bold ml-1.5">
                          {menteeCount > 0 ? `Mentees (${menteeCount})` : 'Mentees'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── 5. Current Group Sessions Section (With Mentee Status) ── */}
      {(selectedCategory === 'all' || selectedCategory === 'group_session') && (
        <View className="mt-2">
          {/* Header Title Row */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-2 min-w-0">
              <Text className="text-base font-black text-[#3e2f24]" numberOfLines={1}>Group Sessions</Text>
              <Text className="text-xs text-[#8a7a6a] font-medium" numberOfLines={1}>
                Manage your group learning & masterclasses
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleOpenCreateModal(SERVICE_TYPES[7])}
              activeOpacity={0.8}
              className="bg-[#3e2f24] px-3 py-1.5 rounded-xl flex-row items-center shadow-xs"
            >
              <Plus size={13} color="#fff" />
              <Text className="text-white text-xs font-bold ml-1">New Group</Text>
            </TouchableOpacity>
          </View>

          {sortedGroupSessions.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 border border-dashed border-[#d4c4b5] shadow-xs items-center justify-center my-2">
              <View className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 items-center justify-center mb-2.5">
                <Users size={22} color="#059669" />
              </View>
              <Text className="text-sm font-black text-[#3e2f24] text-center">No group sessions yet</Text>
              <Text className="text-xs text-[#8a7a6a] text-center mt-1 mb-3.5 max-w-[260px]">
                Create your first group session to start teaching multiple mentees.
              </Text>
              <TouchableOpacity
                onPress={() => handleOpenCreateModal(SERVICE_TYPES[7])}
                activeOpacity={0.8}
                className="bg-[#3e2f24] px-4 py-2 rounded-xl flex-row items-center shadow-xs"
              >
                <Plus size={13} color="#fff" />
                <Text className="text-white text-xs font-bold ml-1.5">Create Group Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-y-3">
              {sortedGroupSessions.map((gs, idx) => {
                const attendees = gs.attendees || gs.bookings || [];
                const priceVal = gs.pricing?.basePrice ?? gs.pricePerPerson ?? gs.price ?? 0;
                const maxCount = gs.maxAttendees || gs.maxParticipants || 10;
                const currentCount = gs.currentParticipants ?? attendees.length ?? 0;

                return (
                  <View
                    key={gs._id || gs.sessionId || idx}
                    className="bg-white p-4 rounded-2xl border border-[#e4dbd1] shadow-xs"
                  >
                    {/* Top Bar */}
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2 min-w-0">
                        <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mr-1.5">
                          <Text className="text-[9px] font-bold text-emerald-800 uppercase">Group</Text>
                        </View>
                        {gs.scheduledAt && new Date(gs.scheduledAt).getTime() < Date.now() && (
                          <View className="bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <Text className="text-[9px] font-bold text-rose-700">Expired</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenuSession({ ...gs, isGroupSession: true });
                          setShowActionMenuModal(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-[#faf6f0] border border-[#ece4dc] items-center justify-center"
                      >
                        <MoreVertical size={15} color="#8a7a6a" />
                      </TouchableOpacity>
                    </View>

                    {/* Middle Details */}
                    <View className="flex-row items-center mb-2.5">
                      <View className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center mr-2.5">
                        <Users size={18} color="#059669" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-sm font-black text-[#3e2f24]" numberOfLines={1} ellipsizeMode="tail">
                          {gs.title || 'Group Masterclass'}
                        </Text>
                        <Text className="text-[11px] text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>
                          {gs.duration || 60} mins • {currentCount}/{maxCount} Mentees
                        </Text>
                        {gs.scheduledAt ? (
                          <View className="flex-row items-center mt-1 bg-[#faf6f0] px-2 py-0.5 rounded-lg self-start border border-[#ece4dc]">
                            <Calendar size={11} color="#7a5c3e" />
                            <Text className="text-[10px] font-semibold text-[#7a5c3e] ml-1">
                              {new Date(gs.scheduledAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Bottom: Price per person & Mentee Status */}
                    <View className="flex-row items-center justify-between pt-2.5 border-t border-[#f0ebe4]">
                      <View className="flex-1 mr-2">
                        <Text className="text-[9px] font-bold text-[#8a7a6a] uppercase">Price</Text>
                        <Text className="text-base font-black text-[#7a5c3e]" numberOfLines={1}>
                          {priceVal > 0 ? `₹${priceVal.toLocaleString('en-IN')}/person` : 'Free'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleOpenMenteeStatus({ ...gs, isGroupSession: true, bookings: attendees })}
                        activeOpacity={0.8}
                        className="bg-[#3e2f24] px-3.5 py-1.5 rounded-xl flex-row items-center"
                      >
                        <Users size={13} color="#ffffff" />
                        <Text className="text-white text-xs font-bold ml-1.5">
                          {attendees.length > 0 ? `Mentees (${attendees.length})` : 'Mentees'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── 6. Sort Selection Modal ── */}
      <Modal visible={showSortModal} transparent animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowSortModal(false)}>
          <View className="bg-white rounded-t-3xl p-5 border-t border-[#d4c4b5]">
            <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />
            <Text className="text-base font-black text-[#4a3728] mb-3">Sort Services By</Text>
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setSortBy(opt);
                  setShowSortModal(false);
                }}
                className={`py-3.5 px-4 rounded-xl mb-1.5 flex-row items-center justify-between ${
                  sortBy === opt ? 'bg-[#f7f3ee]' : 'bg-transparent'
                }`}
              >
                <Text className={`text-sm font-bold ${sortBy === opt ? 'text-[#4a3728]' : 'text-[#7a6756]'}`}>
                  {SORT_LABELS[opt]}
                </Text>
                {sortBy === opt && <Check size={18} color="#4a3728" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── 7. Card 3-Dots Action Menu Modal (Edit / Delete) ── */}
      <Modal visible={showActionMenuModal} transparent animationType="fade" onRequestClose={() => setShowActionMenuModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowActionMenuModal(false)}>
          <View className="bg-white rounded-t-3xl p-5 border-t border-[#d4c4b5]">
            <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />
            <Text className="text-sm font-black text-[#4a3728] mb-3" numberOfLines={1}>
              {activeMenuSession?.title || 'Service Options'}
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenMenteeStatus(activeMenuSession)}
              className="py-3.5 px-4 rounded-xl mb-2 bg-[#f7f3ee] flex-row items-center gap-3"
            >
              <Pencil size={18} color="#4a3728" />
              <Text className="text-sm font-bold text-[#4a3728]">Edit & View Enrolled Mentees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteService(activeMenuSession)}
              className="py-3.5 px-4 rounded-xl mb-2 bg-red-50 flex-row items-center gap-3"
            >
              <Trash2 size={18} color="#dc2626" />
              <Text className="text-sm font-bold text-red-600">Delete Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowActionMenuModal(false)}
              className="py-3 rounded-xl items-center mt-2 border border-[#d4c4b5]"
            >
              <Text className="text-xs font-bold text-[#7a6756]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── 8. Edit Service & Mentee Status Modal ── */}
      {editModalVisible && (
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => !editSaving && setEditModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end bg-black/60"
          >
            <Pressable className="flex-1" onPress={() => !editSaving && setEditModalVisible(false)} />
            <View className="bg-white rounded-t-[36px] p-6 border-t-2 border-[#e0d8cf] shadow-2xl max-h-[92%]">
              <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />

              {/* Modal Header */}
              <View className="flex-row justify-between items-start mb-4 pb-3 border-b border-[#e0d8cf]">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <Text className="text-3xl">{currentServiceType.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-[#4a3728]">Service & Mentee Status</Text>
                    <Text className="text-xs text-[#8a7a6a]">Manage service details & enrolled buyers</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  disabled={editSaving}
                  className="p-2 bg-[#fbf7f3] rounded-xl border border-[#e0d8cf]"
                >
                  <X size={18} color="#4a3728" />
                </TouchableOpacity>
              </View>

              {editLoading ? (
                <View className="py-16 items-center justify-center">
                  <ActivityIndicator size="large" color="#4a3728" />
                  <Text className="mt-3 text-sm font-bold text-[#4a3728]">Loading Service Details...</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
                  
                  {/* ── ENROLLED MENTEES & BUYERS SECTION (TOP HIGHLIGHT) ── */}
                  <View className="mb-5 p-4 rounded-2xl bg-[#faf6f0] border-2 border-[#e0d8cf]">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-2">
                        <Users size={18} color="#4a3728" />
                        <Text className="text-sm font-black text-[#4a3728]">
                          Enrolled Mentees ({enrolledMentees.length})
                        </Text>
                      </View>
                      <View className="bg-[#4a3728] px-2.5 py-1 rounded-full">
                        <Text className="text-[10px] font-bold text-white uppercase">
                          {enrolledMentees.length} Registered
                        </Text>
                      </View>
                    </View>

                    {enrolledMentees.length === 0 ? (
                      <View className="py-5 items-center justify-center bg-white rounded-xl border border-[#e0d8cf] px-4">
                        <Users size={28} color="#b0a090" />
                        <Text className="text-xs font-bold text-[#4a3728] mt-2 text-center">
                          No Mentees Enrolled Yet
                        </Text>
                        <Text className="text-[11px] text-[#8a7a6a] text-center mt-1">
                          Share your offering link to start receiving bookings and student registrations.
                        </Text>
                      </View>
                    ) : (
                      <View className="gap-y-2.5">
                        {enrolledMentees.map((mentee: any, mIdx: number) => {
                          const isConf = confirmingBookingId === mentee.bookingId;
                          const isPending = mentee.status === 'pending';
                          const isConfirmed = mentee.status === 'confirmed';

                          return (
                            <View
                              key={mentee.id || mIdx}
                              className="bg-white p-3.5 rounded-2xl border border-[#e0d8cf] shadow-sm"
                            >
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                  const targetId = mentee.userId || mentee.id;
                                  if (targetId) {
                                    setEditModalVisible(false);
                                    navigation.navigate('Profile', { userId: targetId });
                                  }
                                }}
                                className="flex-row items-center gap-3 mb-2.5 active:opacity-80"
                              >
                                {mentee.avatar ? (
                                  <Image
                                    source={{ uri: mentee.avatar }}
                                    className="w-11 h-11 rounded-full border border-[#d4c4b5]"
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View className="w-11 h-11 rounded-full bg-[#4a3728] items-center justify-center">
                                    <Text className="text-xs font-bold text-white">
                                      {getInitials(mentee.name)}
                                    </Text>
                                  </View>
                                )}
                                <View className="flex-1 min-w-0">
                                  <View className="flex-row items-center gap-1.5">
                                    <Text className="text-xs font-black text-[#4a3728]" numberOfLines={1}>
                                      {mentee.name}
                                    </Text>
                                    <ArrowUpRight size={12} color="#7a5c3e" />
                                  </View>
                                  {!!mentee.email && (
                                    <Text className="text-[11px] text-[#8a7a6a]" numberOfLines={1}>
                                      {mentee.email}
                                    </Text>
                                  )}
                                </View>

                                {/* Status Badge */}
                                <View
                                  className={`px-2.5 py-1 rounded-full border ${
                                    isConfirmed
                                      ? 'bg-emerald-50 border-emerald-300'
                                      : isPending
                                      ? 'bg-amber-50 border-amber-300'
                                      : 'bg-gray-100 border-gray-300'
                                  }`}
                                >
                                  <Text
                                    className={`text-[9px] font-black uppercase ${
                                      isConfirmed
                                        ? 'text-emerald-700'
                                        : isPending
                                        ? 'text-amber-700'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {mentee.status}
                                  </Text>
                                </View>
                              </TouchableOpacity>

                              {/* Booking details metadata row */}
                              <View className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#e0d8cf] flex-row items-center justify-between">
                                <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                                  <Clock size={12} color="#7a5c3e" />
                                  <Text className="text-[10px] font-semibold text-[#7a5c3e]">
                                    {mentee.slotTime ||
                                      (mentee.scheduledAt
                                        ? new Date(mentee.scheduledAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : 'Scheduled')}
                                  </Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                  <CreditCard size={12} color="#4a3728" />
                                  <Text className="text-[10px] font-bold text-[#4a3728]">
                                    {mentee.amount > 0 ? `₹${mentee.amount}` : 'Free'} ({mentee.paymentStatus})
                                  </Text>
                                </View>
                              </View>

                              {/* Action if pending */}
                              {isPending && (
                                <TouchableOpacity
                                  onPress={() => handleConfirmBooking(mentee)}
                                  disabled={isConf}
                                  className="mt-2.5 bg-[#4a3728] py-2 rounded-xl items-center flex-row justify-center gap-1.5 shadow-sm"
                                >
                                  <CheckCircle2 size={13} color="#fff" />
                                  <Text className="text-white text-xs font-bold">
                                    {isConf ? 'Confirming...' : 'Confirm Booking'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* 1. Update Service Image Box */}
                  <View className="p-5 rounded-2xl border-2 border-dashed border-[#e0d8cf] bg-[#fbf7f3] items-center justify-center mb-4">
                    {editFormData.thumbnailUri ? (
                      <View className="items-center w-full">
                        <Image
                          source={{ uri: editFormData.thumbnailUri }}
                          className="w-full h-36 rounded-xl mb-3"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={handleChooseImage}
                          disabled={editSaving}
                          className="bg-[#4a3728] px-5 py-2.5 rounded-xl flex-row items-center gap-2"
                        >
                          <Upload size={14} color="#fff" />
                          <Text className="text-white text-xs font-bold">Change Image</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View className="items-center py-2">
                        <View className="w-16 h-16 bg-white rounded-2xl border-2 border-[#e0d8cf] items-center justify-center mb-2 shadow-sm">
                          <ImageIcon size={28} color="#7a5c3e" />
                        </View>
                        <Text className="text-base font-bold text-[#4a3728] mb-1">Update Service Image</Text>
                        <Text className="text-xs text-[#8a7a6a] mb-3">Add a professional image for your service</Text>
                        <TouchableOpacity
                          onPress={handleChooseImage}
                          disabled={editSaving}
                          className="bg-[#4a3728] px-5 py-2.5 rounded-xl flex-row items-center gap-2"
                        >
                          <Upload size={14} color="#fff" />
                          <Text className="text-white text-xs font-bold">Choose Image</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* 2. Service Type Box */}
                  <View className="p-4 rounded-2xl border-2 border-[#e0d8cf] bg-[#fbf7f3] mb-4">
                    <Text className="text-xs font-bold text-[#4a3728] uppercase mb-2">
                      Service Type
                    </Text>
                    <View className="flex-row items-center gap-3 p-3 rounded-xl bg-white border border-[#e0d8cf]">
                      <Text className="text-3xl">{currentServiceType.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#4a3728]">{currentServiceType.label}</Text>
                        <Text className="text-xs text-[#8a7a6a] mt-0.5">{currentServiceType.description}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 3. Service Name & Price */}
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                      Service Name
                    </Text>
                    <TextInput
                      value={editFormData.title || ''}
                      onChangeText={(t) => setEditFormData({ ...editFormData, title: t })}
                      placeholder="e.g. 1:1 Mentorship Session"
                      placeholderTextColor="#9ca3af"
                      editable={!editSaving}
                      className="p-3.5 rounded-xl border-2 border-[#e0d8cf] bg-[#fbf7f3] text-sm font-semibold text-[#4a3728]"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                      Price in INR (₹)
                    </Text>
                    <View className="relative justify-center">
                      <Text className="absolute left-3.5 text-base font-bold text-[#7a5c3e] z-10">₹</Text>
                      <TextInput
                        value={String(editFormData.price ?? '')}
                        onChangeText={(t) => setEditFormData({ ...editFormData, price: t })}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        editable={!editSaving && editFormData.paymentMethod !== 'free'}
                        className={`p-3.5 pl-8 rounded-xl border-2 border-[#e0d8cf] text-sm font-bold text-[#4a3728] ${
                          editFormData.paymentMethod === 'free' ? 'bg-[#e5e7eb] text-gray-500' : 'bg-[#fbf7f3]'
                        }`}
                      />
                    </View>
                  </View>

                  {/* 4. Payment Method */}
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-[#4a3728] mb-2">
                      💳 Payment Method
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {PAYMENT_METHOD_OPTIONS.map((pm) => {
                        const isSelected = (editFormData.paymentMethod || 'stripe').toLowerCase() === pm.value;
                        return (
                          <TouchableOpacity
                            key={pm.value}
                            onPress={() => setEditFormData({ ...editFormData, paymentMethod: pm.value })}
                            disabled={editSaving}
                            className={`px-3.5 py-2 rounded-xl border-2 ${
                              isSelected
                                ? 'bg-[#4a3728] border-[#4a3728]'
                                : 'bg-[#fbf7f3] border-[#e0d8cf]'
                            }`}
                          >
                            <Text
                              className={`text-xs font-bold ${
                                isSelected ? 'text-white' : 'text-[#4a3728]'
                              }`}
                            >
                              {pm.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* 6. Duration & Status */}
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                        Duration (min)
                      </Text>
                      <TextInput
                        value={String(editFormData.duration ?? '')}
                        onChangeText={(t) => setEditFormData({ ...editFormData, duration: t })}
                        placeholder="30"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        editable={!editSaving}
                        className="p-3.5 rounded-xl border-2 border-[#e0d8cf] bg-[#fbf7f3] text-sm font-semibold text-[#4a3728]"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                        📊 Status
                      </Text>
                      <View className="p-3.5 rounded-xl border-2 border-[#e0d8cf] bg-[#fbf7f3]">
                        <Text className="text-xs font-bold text-[#4a3728] capitalize">
                          {editFormData.status || 'Available'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status selection pills */}
                  <View className="mb-4">
                    <Text className="text-[11px] font-bold text-[#8a7a6a] uppercase mb-1.5">Change Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                      {STATUS_OPTIONS.map((st) => {
                        const isSel = (editFormData.status || 'available').toLowerCase() === st.value;
                        return (
                          <TouchableOpacity
                            key={st.value}
                            onPress={() => setEditFormData({ ...editFormData, status: st.value })}
                            disabled={editSaving}
                            className={`px-3 py-1.5 rounded-xl border mr-1.5 ${
                              isSel ? 'bg-[#7a5c3e] border-[#7a5c3e]' : 'bg-white border-[#e0d8cf]'
                            }`}
                          >
                            <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                              {st.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* 7. Description */}
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">
                      Description
                    </Text>
                    <TextInput
                      value={editFormData.description || ''}
                      onChangeText={(t) => setEditFormData({ ...editFormData, description: t })}
                      placeholder="Add details about this mentoring service..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      editable={!editSaving}
                      className="p-3.5 rounded-xl border-2 border-[#e0d8cf] bg-[#fbf7f3] text-xs font-medium text-[#4a3728] min-h-[90px]"
                    />
                  </View>

                  {/* 8. Follow-up Settings */}
                  <View className="p-4 rounded-2xl border-2 border-[#e0d8cf] bg-[#fbf7f3] mb-4">
                    <Text className="text-sm font-black text-[#4a3728] mb-3">Follow-up Settings</Text>

                    {/* Follow-up Allowed */}
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Follow-up Allowed</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3 py-1">
                      {FOLLOW_UP_ALLOWED_OPTIONS.map((opt) => {
                        const isSel = (editFormData.followUpAllowed || '0') === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setEditFormData({ ...editFormData, followUpAllowed: opt.value })}
                            disabled={editSaving}
                            className={`px-3 py-1.5 rounded-xl border mr-1.5 ${
                              isSel ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
                            }`}
                          >
                            <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Follow-up Period */}
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Follow-up Period</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3 py-1">
                      {FOLLOW_UP_PERIOD_OPTIONS.map((opt) => {
                        const isDisabled = editFormData.followUpAllowed === '0';
                        const isSel = !isDisabled && (editFormData.followUpPeriod || '0') === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => !isDisabled && setEditFormData({ ...editFormData, followUpPeriod: opt.value })}
                            disabled={editSaving || isDisabled}
                            className={`px-3 py-1.5 rounded-xl border mr-1.5 ${
                              isDisabled
                                ? 'bg-gray-200 border-gray-300 opacity-60'
                                : isSel
                                ? 'bg-[#4a3728] border-[#4a3728]'
                                : 'bg-white border-[#e0d8cf]'
                            }`}
                          >
                            <Text className={`text-xs font-bold ${isDisabled ? 'text-gray-400' : isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Buffer Time */}
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Buffer Time</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                      {BUFFER_TIME_OPTIONS.map((opt) => {
                        const isSel = (editFormData.bufferTime || '0') === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setEditFormData({ ...editFormData, bufferTime: opt.value })}
                            disabled={editSaving}
                            className={`px-3 py-1.5 rounded-xl border mr-1.5 ${
                              isSel ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
                            }`}
                          >
                            <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-[#4a3728]'}`}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Save Error */}
                  {editSaveError ? (
                    <View className="p-3.5 rounded-xl bg-red-100 border border-red-300 mb-4">
                      <Text className="text-xs font-bold text-red-800">❌ {editSaveError}</Text>
                    </View>
                  ) : null}

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 pt-2">
                    <TouchableOpacity
                      onPress={() => setEditModalVisible(false)}
                      disabled={editSaving}
                      className="flex-1 py-3.5 rounded-xl items-center justify-center border-2 border-[#e0d8cf] bg-[#fbf7f3]"
                    >
                      <Text className="text-sm font-bold text-[#4a3728]">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSaveEditService}
                      disabled={editSaving}
                      className="flex-1 py-3.5 rounded-xl items-center justify-center bg-[#4a3728] shadow-md"
                    >
                      {editSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-sm font-bold text-white">Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* ── 9. Create / Edit Offering Modal ── */}
      {showModal && (
        <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end bg-black/50"
          >
            <Pressable className="flex-1" onPress={() => setShowModal(false)} />
            <View className="bg-white rounded-t-[36px] p-6 border-t border-[#d4c4b5] shadow-2xl max-h-[90%]">
              <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />
              <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-[#e0d8cf]">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-xl bg-[#faf6f0] items-center justify-center">
                    {React.createElement(selectedType.icon, { size: 16, color: selectedType.color })}
                  </View>
                  <Text className="text-base font-black text-[#4a3728]">
                    {isEditMode ? 'Edit Offering' : `Add ${selectedType.label}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={18} color="#7a5c3e" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Offering Title */}
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Offering Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={`e.g. 1:1 ${selectedType.label}`}
                  placeholderTextColor="#b0a090"
                  className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-3.5 text-xs text-[#4a3728] mb-3 font-semibold"
                />

                {/* Duration Pills */}
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Duration</Text>
                <View className="flex-row gap-2 mb-3">
                  {['15', '30', '45', '60', '90'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-xl items-center border ${
                        duration === d
                          ? 'bg-[#4a3728] border-[#4a3728]'
                          : 'bg-[#FAF8F5] border-[#d4c4b5]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          duration === d ? 'text-white' : 'text-[#4a3728]'
                        }`}
                      >
                        {d}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Price in INR */}
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Price in INR (₹) *</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 999"
                  keyboardType="numeric"
                  placeholderTextColor="#b0a090"
                  className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-3.5 text-xs text-[#4a3728] mb-3 font-bold"
                />

                {/* Group Attendees (if group session) */}
                {selectedType.id === 'group_session' && (
                  <>
                    <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Max Attendees</Text>
                    <TextInput
                      value={maxAttendees}
                      onChangeText={setMaxAttendees}
                      placeholder="e.g. 10"
                      keyboardType="numeric"
                      placeholderTextColor="#b0a090"
                      className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-3.5 text-xs text-[#4a3728] mb-3"
                    />
                  </>
                )}

                {/* Cover Image Upload */}
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Cover Image (Optional)</Text>
                <View className="p-3.5 rounded-2xl border border-dashed border-[#d4c4b5] bg-[#faf6f0] items-center justify-center mb-3">
                  {createCoverImage?.uri ? (
                    <View className="w-full items-center">
                      <Image source={{ uri: createCoverImage.uri }} className="w-full h-28 rounded-xl mb-2" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={handleChooseCreateImage}
                        className="bg-[#4a3728] px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                      >
                        <Upload size={12} color="#fff" />
                        <Text className="text-white text-[11px] font-bold">Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleChooseCreateImage}
                      className="items-center py-1.5"
                    >
                      <ImageIcon size={22} color="#7a5c3e" />
                      <Text className="text-xs font-bold text-[#4a3728] mt-1">Upload Cover Photo</Text>
                      <Text className="text-[10px] text-[#8a7a6a]">PNG, JPG up to 5MB</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Description */}
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Description (optional)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What will mentees learn or achieve in this session?"
                  placeholderTextColor="#b0a090"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-3.5 text-xs text-[#4a3728] mb-4 h-20"
                />

                {/* Submit / Save Button */}
                <TouchableOpacity
                  onPress={handleSaveService}
                  disabled={creating || !title || !price}
                  className={`w-full bg-[#4a3728] py-3.5 rounded-2xl items-center shadow-sm mb-4 ${
                    creating || !title || !price ? 'opacity-60' : ''
                  }`}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-xs font-black">
                      {isEditMode ? 'Update Offering' : 'Publish Offering'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MARKETING KIT (FULL RESPONSIVE MOBILE EXPERIENCE)
// ─────────────────────────────────────────────────────────────────────────────
const MarketingKitPage: React.FC<{ mentorData: any }> = ({ mentorData }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const mentorId = mentorData?.mentorId || mentorData?._id || 'f3150fa6-5fbb-4b58-a063-80280da514f0';
  const mentorName = mentorData?.user?.fullName || mentorData?.title || 'Ujjwal Tiwari';
  const mentorSlug = mentorName.toLowerCase().replace(/\s+/g, '-');

  const shareUrl = `https://throne8.com/mentorship/mentor-card/${mentorSlug}/${mentorId}`;
  const referralUrl = `${shareUrl}?ref=${mentorId}`;

  const linkedInCaption = `🚀 Excited to share that I'm now mentoring on Throne8!\n\nIf you're looking to grow in your career, I'd love to help. Check out my mentor profile and book a session:\n${shareUrl}\n\n#Mentorship #CareerGrowth #Throne8`;

  const instagramCaption = `✨ I'm now a mentor on Throne8! Helping folks navigate their careers, one session at a time.\n\nLink in bio 👉\n${shareUrl}`;

  const whatsAppMessage = `Hey! I've started mentoring on Throne8 🎓 If you or anyone you know needs guidance, here's my profile: ${shareUrl}`;

  const emailSubject = `Subject: Let's grow together — I'm mentoring on Throne8 🎓`;
  const emailBody = `Hi there,\n\nI wanted to share something exciting — I've joined Throne8 as a mentor! If you're looking for guidance on your career, skills, or growth journey, I'd be glad to help.\n\nYou can check out my profile and book a session here:\n${shareUrl}\n\nLooking forward to connecting!\n\nBest,\n${mentorName}`;

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    Clipboard.setString(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
    Alert.alert('Copied!', 'Copied to clipboard successfully.');
  };

  const handleShare = async (title: string, message: string, url: string) => {
    try {
      await Share.share({
        title,
        message: `${message}\n\n${url}`,
        url,
      });
    } catch (e) {}
  };

  return (
    <View className="w-full">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Megaphone size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Marketing Kit</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">
              Promote your mentor profile and grow your bookings
            </Text>
          </View>
        </View>
      </View>

      {/* ── 2. Card 1: Shareable Profile Link ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center shrink-0">
            <LinkIcon size={16} color="#7a5c3e" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-[#3c2a1e]">Shareable Profile Link</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">
              Share this anywhere to bring people to your mentor profile
            </Text>
          </View>
        </View>

        <Text className="text-[11px] font-black text-[#8a7a6a] uppercase tracking-wider mb-2">
          YOUR PROFILE LINK
        </Text>

        <View className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl p-2.5 flex-row items-center justify-between mb-2.5">
          <Text className="text-xs font-bold text-[#3c2a1e] flex-1 pr-2" numberOfLines={1}>
            {shareUrl}
          </Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(shareUrl, setCopiedLink)}
            activeOpacity={0.8}
            className="bg-[#3c2a1e] px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm shrink-0"
          >
            <Copy size={12} color="#fff" />
            <Text className="text-white text-xs font-bold">{copiedLink ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-1.5 mt-1">
          <Share2 size={13} color="#8a7a6a" />
          <Text className="text-xs text-[#8a7a6a]">
            Add this to your LinkedIn bio, email signature, or resume
          </Text>
        </View>

        {/* QR Code Container */}
        <View className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl p-5 items-center justify-center mt-4">
          <View className="w-28 h-28 bg-white border border-[#e4dbd1] rounded-2xl items-center justify-center shadow-xs p-2">
            <QrCode size={90} color="#3c2a1e" />
          </View>
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <QrCode size={14} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Scan to visit</Text>
          </View>
        </View>
      </View>

      {/* ── 3. Card 2: Referral Program ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center shrink-0">
            <Gift size={16} color="#7a5c3e" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-[#3c2a1e]">Referral Program</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">
              Invite people using your link and track how they engage
            </Text>
          </View>
        </View>

        {/* 3 Metric Cards */}
        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] items-center justify-center min-h-[85px]">
            <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-[#3c2a1e] leading-tight">
              0
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1 text-center">People Invited</Text>
          </View>

          <View className="flex-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] items-center justify-center min-h-[85px]">
            <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-[#3c2a1e] leading-tight">
              0
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1 text-center">Joined via You</Text>
          </View>

          <View className="flex-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] items-center justify-center min-h-[85px]">
            <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-[#3c2a1e] leading-tight">
              ₹0
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1 text-center">Rewards Earned</Text>
          </View>
        </View>

        <Text className="text-[11px] font-black text-[#8a7a6a] uppercase tracking-wider mb-2">
          YOUR REFERRAL LINK
        </Text>

        <View className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl p-2.5 flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#3c2a1e] flex-1 pr-2" numberOfLines={1}>
            {referralUrl}
          </Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(referralUrl, setCopiedReferral)}
            activeOpacity={0.8}
            className="bg-[#3c2a1e] px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm shrink-0"
          >
            <Copy size={12} color="#fff" />
            <Text className="text-white text-xs font-bold">{copiedReferral ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 4. Card 3: Social Media Post Templates ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center shrink-0">
            <Sparkles size={16} color="#7a5c3e" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-[#3c2a1e]">Social Media Post Templates</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">
              Ready-to-use captions — just copy and post
            </Text>
          </View>
        </View>

        {/* Template 1: LinkedIn */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3.5">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-md bg-[#0077b5] items-center justify-center">
                <Text className="text-white text-[10px] font-black">in</Text>
              </View>
              <Text className="text-xs font-black text-[#3c2a1e]">LinkedIn</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(linkedInCaption, setCopiedLinkedIn)}
              activeOpacity={0.8}
              className="bg-[#3c2a1e] px-3 py-1.5 rounded-xl flex-row items-center gap-1 shadow-sm"
            >
              <Copy size={11} color="#fff" />
              <Text className="text-white text-[11px] font-bold">{copiedLinkedIn ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-[#5a483a] leading-relaxed">{linkedInCaption}</Text>
        </View>

        {/* Template 2: Instagram */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3.5">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-md bg-[#e1306c] items-center justify-center">
                <Text className="text-white text-[10px] font-black">📷</Text>
              </View>
              <Text className="text-xs font-black text-[#3c2a1e]">Instagram</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(instagramCaption, setCopiedInsta)}
              activeOpacity={0.8}
              className="bg-[#3c2a1e] px-3 py-1.5 rounded-xl flex-row items-center gap-1 shadow-sm"
            >
              <Copy size={11} color="#fff" />
              <Text className="text-white text-[11px] font-bold">{copiedInsta ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-[#5a483a] leading-relaxed">{instagramCaption}</Text>
        </View>

        {/* Template 3: WhatsApp */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc]">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-md bg-[#25d366] items-center justify-center">
                <Text className="text-white text-[10px] font-black">💬</Text>
              </View>
              <Text className="text-xs font-black text-[#3c2a1e]">WhatsApp</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(whatsAppMessage, setCopiedWhatsApp)}
              activeOpacity={0.8}
              className="bg-[#3c2a1e] px-3 py-1.5 rounded-xl flex-row items-center gap-1 shadow-sm"
            >
              <Copy size={11} color="#fff" />
              <Text className="text-white text-[11px] font-bold">{copiedWhatsApp ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-[#5a483a] leading-relaxed">{whatsAppMessage}</Text>
        </View>
      </View>

      {/* ── 5. Card 4: Downloadable Assets ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center shrink-0">
            <Download size={16} color="#7a5c3e" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-[#3c2a1e]">Downloadable Assets</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">
              Badges and banners to use on your website or socials
            </Text>
          </View>
        </View>

        {/* 4 Downloadable Tiles in 2x2 Grid */}
        <View className="flex-row flex-wrap justify-between">
          {[
            { title: 'Verified Mentor Badge', dim: 'PNG, transparent', icon: ShieldCheck },
            { title: 'Profile Banner', dim: '1200×628 px', icon: LinkIcon },
            { title: 'Instagram Story Card', dim: '1080×1920 px', icon: Users },
            { title: 'LinkedIn Post Graphic', dim: '1200×1200 px', icon: Megaphone },
          ].map((asset, i) => {
            const IconComp = asset.icon;
            return (
              <View
                key={i}
                className="w-[48%] bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3 items-center justify-between min-h-[140px]"
              >
                <View className="w-10 h-10 rounded-xl bg-white border border-[#e4dbd1] items-center justify-center mb-2 shadow-xs">
                  <IconComp size={18} color="#7a5c3e" />
                </View>
                <Text className="text-xs font-black text-[#3c2a1e] text-center" numberOfLines={2}>
                  {asset.title}
                </Text>
                <Text className="text-[10px] text-[#8a7a6a] mt-0.5 mb-2">{asset.dim}</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert('Asset Ready', `${asset.title} downloaded to your device.`)}
                  activeOpacity={0.8}
                  className="w-full bg-[#3c2a1e] py-2 px-3 rounded-xl flex-row items-center justify-center gap-1 shadow-sm"
                >
                  <Download size={11} color="#fff" />
                  <Text className="text-white text-[11px] font-bold">Download</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 6. Card 5: Email Invite Template ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-8">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center shrink-0">
            <Mail size={16} color="#7a5c3e" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-[#3c2a1e]">Email Invite Template</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">
              Send this to your network to invite them
            </Text>
          </View>
        </View>

        {/* Email Preview Box */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3">
          <Text className="text-xs font-bold text-[#3c2a1e] mb-2">{emailSubject}</Text>
          <Text className="text-xs text-[#5a483a] leading-relaxed">{emailBody}</Text>
        </View>

        {/* Bottom Copy Bar */}
        <View className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl p-2.5 flex-row items-center justify-between">
          <Text className="text-xs font-bold text-[#3c2a1e] flex-1 pr-2" numberOfLines={1}>
            {emailSubject} — {emailBody.replace(/\n+/g, ' ')}
          </Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(`${emailSubject}\n\n${emailBody}`, setCopiedEmail)}
            activeOpacity={0.8}
            className="bg-[#3c2a1e] px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 shadow-sm shrink-0"
          >
            <Copy size={12} color="#fff" />
            <Text className="text-white text-xs font-bold">{copiedEmail ? 'Copied!' : 'Copy'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. NOTIFICATION PAGE (FULL RESPONSIVE MOBILE EXPERIENCE)
// ─────────────────────────────────────────────────────────────────────────────
const NotificationPage: React.FC = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = useCallback(async () => {
    try {
      const res = await NotificationService.getMentorshipNotifications();
      const list = Array.isArray(res?.data) ? res.data : [];
      setNotifs(list);
    } catch (e) {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifs();
  }, [loadNotifs]);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '1d ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'query':
        return <MessageSquare size={16} color="#7a5c3e" />;
      case 'booking':
      case 'session':
        return <Calendar size={16} color="#7a5c3e" />;
      case 'payment':
        return <CreditCard size={16} color="#7a5c3e" />;
      case 'review':
        return <Star size={16} color="#d97706" />;
      default:
        return <Bell size={16} color="#7a5c3e" />;
    }
  };

  const displayList =
    notifs.length > 0
      ? notifs
      : [
          {
            _id: 'default-1',
            type: 'query',
            title: 'New Query',
            message: 'Pallav Shrivastava asked you a query',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            isRead: false,
          },
        ];

  return (
    <View className="w-full">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Bell size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Notifications</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">You're all caught up</Text>
          </View>
        </View>
      </View>

      {/* ── 2. Notifications Group Card ── */}
      {loading ? (
        <View className="bg-white rounded-3xl p-8 border border-[#e4dbd1] shadow-sm items-center justify-center">
          <ActivityIndicator size="small" color="#3c2a1e" />
          <Text className="text-xs text-[#8a7a6a] font-medium mt-2">Loading notifications...</Text>
        </View>
      ) : displayList.length === 0 ? (
        <View className="bg-white rounded-3xl p-8 border border-[#e4dbd1] shadow-sm items-center justify-center">
          <View className="w-12 h-12 rounded-2xl bg-[#f5ede4] items-center justify-center mb-2.5">
            <Bell size={22} color="#8a7a6a" />
          </View>
          <Text className="text-xs font-bold text-[#3c2a1e]">No notifications yet</Text>
          <Text className="text-[10px] text-[#8a7a6a] mt-0.5 text-center">
            You'll get notified about new bookings, queries, and reviews here.
          </Text>
        </View>
      ) : (
        <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
          <Text className="text-[10px] font-black text-[#8a7a6a] uppercase tracking-wider mb-3.5">
            THIS WEEK
          </Text>

          <View className="space-y-2.5">
            {displayList.map((n, idx) => (
              <View
                key={n._id || idx}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                  n.isRead
                    ? 'bg-[#FAF8F5] border-[#ece4dc]'
                    : 'bg-white border-[#e4dbd1] shadow-xs'
                }`}
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center mr-3 shrink-0">
                    {getNotificationIcon(n.type)}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-black text-[#3c2a1e]" numberOfLines={1}>
                      {n.title || 'New Notification'}
                    </Text>
                    <Text className="text-xs text-[#8a7a6a] mt-0.5" numberOfLines={2}>
                      {n.message || 'You have a new update.'}
                    </Text>
                  </View>
                </View>

                <Text className="text-[10px] text-[#8a7a6a] font-medium shrink-0">
                  {formatRelativeTime(n.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. AVAILABILITY PAGE (FULL LIVE BACKEND INTEGRATION & INTERACTIVE UI)
// ─────────────────────────────────────────────────────────────────────────────

interface DayScheduleSlot {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

interface DayScheduleItem {
  day: string;
  short: string;
  enabled: boolean;
  slots: DayScheduleSlot[];
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
}

const ALL_WEEK_DAYS: DayScheduleItem[] = [
  { day: 'Monday', short: 'M', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Tuesday', short: 'T', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Wednesday', short: 'W', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Thursday', short: 'T', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Friday', short: 'F', enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Saturday', short: 'S', enabled: false, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
  { day: 'Sunday', short: 'S', enabled: false, slots: [{ startTime: '09:00', endTime: '17:00' }], startTime: '09:00', endTime: '17:00' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TIME_OPTIONS_30MIN: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

interface AvailabilitySlotItem {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  isBlocked?: boolean;
  bookingId?: string;
}

interface BackendAvailabilityRecord {
  availabilityId: string;
  _id?: string;
  mentorId: string;
  date: string;
  dayOfWeek: string;
  timezone: string;
  isDateBlocked?: boolean;
  isRecurring?: boolean;
  slots: AvailabilitySlotItem[];
}

interface StatsData {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  blockedSlots: number;
}

const isSameDate = (dateVal: any, targetDateStr: string): boolean => {
  if (!dateVal) return false;
  if (typeof dateVal === 'string') {
    if (dateVal.startsWith(targetDateStr)) return true;
    if (dateVal.substring(0, 10) === targetDateStr) return true;
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (localStr === targetDateStr) return true;
    const utcStr = d.toISOString().substring(0, 10);
    if (utcStr === targetDateStr) return true;
  }
  return false;
};

const AvailabilityPage: React.FC<{ mentorData: any }> = ({ mentorData }) => {
  const mentorId = mentorData?.mentorId || mentorData?._id || mentorData?.id;

  // ── Core Calendar & Configuration State ──────────────────
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [slotDuration, setSlotDuration] = useState<number>(30); // in minutes
  const [bufferTime, setBufferTime] = useState<number>(0);     // in minutes
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');

  // ── Toggles ──────────────────────────────────────────────
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);
  const [autoBlockBooked, setAutoBlockBooked] = useState(true);
  const [autoClosePast, setAutoClosePast] = useState(true);

  // ── API State ────────────────────────────────────────────
  const [existingAvailability, setExistingAvailability] = useState<BackendAvailabilityRecord[]>([]);
  const [mentorSessions, setMentorSessions] = useState<any[]>([]);
  const [cachedBookedSlots, setCachedBookedSlots] = useState<any[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Inline Edit State ────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlots, setEditSlots] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [isUpdatingSlot, setIsUpdatingSlot] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── 30-Min Dropdown Picker State ─────────────────────────
  const [timePickerTarget, setTimePickerTarget] = useState<{
    dayIdx: number;
    slotIdx: number;
    field: 'startTime' | 'endTime';
    value: string;
  } | null>(null);

  // ── Block Date Modal State ───────────────────────────────
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isBlockingDate, setIsBlockingDate] = useState(false);
  const [blockActionId, setBlockActionId] = useState<string | null>(null);

  // ── Weekly Schedule State ────────────────────────────────
  const buildScheduleFromBackend = useCallback(() => {
    // Check if mentorData already has multi-slots weeklySchedule
    const backendWeekly: any[] | undefined =
      mentorData?.availability?.weeklySchedule ||
      mentorData?.availability?.schedule;

    const daysAvailable: string[] | undefined = mentorData?.availability?.daysAvailable;
    const start = mentorData?.availability?.preferredHours?.start || '09:00';
    const end = mentorData?.availability?.preferredHours?.end || '17:00';

    if (Array.isArray(backendWeekly) && backendWeekly.length > 0) {
      return ALL_WEEK_DAYS.map((d) => {
        const found = backendWeekly.find((bw: any) => bw.day?.toLowerCase() === d.day.toLowerCase());
        if (found) {
          const slots = Array.isArray(found.slots) && found.slots.length > 0
            ? found.slots.map((s: any) => ({
                startTime: s.startTime || '09:00',
                endTime: s.endTime || '17:00',
              }))
            : [{ startTime: found.startTime || start, endTime: found.endTime || end }];
          return {
            ...d,
            enabled: found.enabled !== undefined ? !!found.enabled : (daysAvailable ? daysAvailable.map((x: string) => x.toLowerCase()).includes(d.day.toLowerCase()) : true),
            slots,
            startTime: slots[0]?.startTime || start,
            endTime: slots[slots.length - 1]?.endTime || end,
          };
        }
        const isEnabled = daysAvailable ? daysAvailable.map((x: string) => x.toLowerCase()).includes(d.day.toLowerCase()) : true;
        return {
          ...d,
          enabled: isEnabled,
          slots: [{ startTime: start, endTime: end }],
          startTime: start,
          endTime: end,
        };
      });
    }

    if (!daysAvailable || daysAvailable.length === 0) {
      return ALL_WEEK_DAYS;
    }
    return ALL_WEEK_DAYS.map((d) => ({
      ...d,
      enabled: daysAvailable.map((x) => x.toLowerCase()).includes(d.day.toLowerCase()),
      slots: [{ startTime: start, endTime: end }],
      startTime: start,
      endTime: end,
    }));
  }, [mentorData]);

  const [weekSchedule, setWeekSchedule] = useState<DayScheduleItem[]>(() => buildScheduleFromBackend());

  // Load persisted schedule from AsyncStorage so closing & reopening never deletes slots
  useEffect(() => {
    let isMounted = true;
    const loadCachedSchedule = async () => {
      if (!mentorId) return;
      try {
        const cacheKey = `@throne8_mentor_schedule_${mentorId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWeekSchedule(parsed);
            if (mentorData?.availability) {
              mentorData.availability.weeklySchedule = parsed;
              mentorData.availability.schedule = parsed;
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load schedule from AsyncStorage:', err);
      }
      if (isMounted) {
        setWeekSchedule(buildScheduleFromBackend());
      }
    };
    loadCachedSchedule();
    return () => {
      isMounted = false;
    };
  }, [mentorId, buildScheduleFromBackend]);

  // If mentorData explicitly updates with weeklySchedule from backend, sync it
  useEffect(() => {
    if (mentorData?.availability?.weeklySchedule || mentorData?.availability?.schedule) {
      const backendSched = buildScheduleFromBackend();
      setWeekSchedule(backendSched);
      if (mentorId) {
        AsyncStorage.setItem(`@throne8_mentor_schedule_${mentorId}`, JSON.stringify(backendSched)).catch(() => {});
      }
    }
  }, [mentorData?.availability?.weeklySchedule, mentorData?.availability?.schedule, mentorId, buildScheduleFromBackend]);

  // Sync weekly schedule to mentor profile with debounce and immediate AsyncStorage cache
  const syncTimerRef = useRef<any>(null);
  const handleScheduleChange = (newSched: DayScheduleItem[]) => {
    setWeekSchedule(newSched);
    if (!mentorId) return;

    // Immediately cache in AsyncStorage so closing/reopening the tab or app preserves all slots
    AsyncStorage.setItem(`@throne8_mentor_schedule_${mentorId}`, JSON.stringify(newSched)).catch((err) => {
      console.warn('Failed to save schedule to AsyncStorage:', err);
    });

    // Also keep reference in mentorData object in memory
    if (mentorData?.availability) {
      mentorData.availability.weeklySchedule = newSched;
      mentorData.availability.schedule = newSched;
    }

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const enabledDays = newSched.filter((d) => d.enabled).map((d) => d.day.toLowerCase());
      const base = newSched.find((d) => d.enabled) || newSched[0];
      const firstSlot = base?.slots?.[0] || { startTime: base?.startTime || '09:00', endTime: base?.endTime || '17:00' };

      MentorshipService.updateMentorAvailability(mentorId, {
        timezone,
        daysAvailable: enabledDays,
        preferredHours: { start: firstSlot.startTime, end: firstSlot.endTime },
        bufferBetweenSessions: bufferTime,
        weeklySchedule: newSched,
        schedule: newSched,
      } as any).catch((err: any) => {
        console.error('Failed to sync weekly availability to mentor profile:', err.message);
      });
    }, 800);
  };

  const handleToggleDay = (dayIdx: number) => {
    const updated = weekSchedule.map((item, idx) => {
      if (idx !== dayIdx) return item;
      const willEnable = !item.enabled;
      const slots = willEnable && (!item.slots || item.slots.length === 0)
        ? [{ startTime: '09:00', endTime: '17:00' }]
        : item.slots;
      return { ...item, enabled: willEnable, slots };
    });
    handleScheduleChange(updated);
  };

  const handleAddSlotForDay = (dayIdx: number) => {
    const updated = weekSchedule.map((item, idx) => {
      if (idx !== dayIdx) return item;
      const currentSlots = item.slots && item.slots.length > 0 ? item.slots : [];
      let nextStart = '09:00';
      let nextEnd = '17:00';
      if (currentSlots.length > 0) {
        const lastSlot = currentSlots[currentSlots.length - 1];
        nextStart = lastSlot.endTime || '14:00';
        const [h, m] = nextStart.split(':').map(Number);
        const endHour = Math.min(23, (isNaN(h) ? 14 : h) + 1);
        nextEnd = `${String(endHour).padStart(2, '0')}:${String(isNaN(m) ? 0 : m).padStart(2, '0')}`;
      }
      const newSlots = [...currentSlots, { startTime: nextStart, endTime: nextEnd }];
      return {
        ...item,
        enabled: true,
        slots: newSlots,
        startTime: newSlots[0]?.startTime || item.startTime,
        endTime: newSlots[newSlots.length - 1]?.endTime || item.endTime,
      };
    });
    handleScheduleChange(updated);
  };

  const handleRemoveSlotForDay = (dayIdx: number, slotIdx: number) => {
    const updated = weekSchedule.map((item, idx) => {
      if (idx !== dayIdx) return item;
      const updatedSlots = (item.slots || []).filter((_, sIdx) => sIdx !== slotIdx);
      return {
        ...item,
        slots: updatedSlots,
        startTime: updatedSlots[0]?.startTime || item.startTime,
        endTime: updatedSlots[updatedSlots.length - 1]?.endTime || item.endTime,
      };
    });
    handleScheduleChange(updated);
  };

  const handleUpdateSlotTime = (
    dayIdx: number,
    slotIdx: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = weekSchedule.map((item, idx) => {
      if (idx !== dayIdx) return item;
      const updatedSlots = (item.slots || []).map((slot, sIdx) =>
        sIdx === slotIdx ? { ...slot, [field]: value } : slot
      );
      return {
        ...item,
        slots: updatedSlots,
        startTime: updatedSlots[0]?.startTime || item.startTime,
        endTime: updatedSlots[updatedSlots.length - 1]?.endTime || item.endTime,
      };
    });
    handleScheduleChange(updated);
  };

  // ── Month Navigation Helpers ─────────────────────────────
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIdx];
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOffset = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  // ── Data Fetching ────────────────────────────────────────
  const fetchMonthAvailability = useCallback(async () => {
    if (!mentorId) return;
    setIsLoadingData(true);
    try {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, currentDate.getMonth() + 1, 0).getDate();
      const startDate = `${y}-${m}-01`;
      const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

      const [res, sRes, allSessRes] = await Promise.all([
        AvailabilityService.getMentorAvailability(mentorId, { startDate, endDate }).catch(() => ({ data: { availabilities: [] } })),
        SessionService.getMentorSessions(mentorId).catch(() => ({ data: [] })),
        SessionService.getAllSessions({ role: 'mentor' }).catch(() => ({ data: [] })),
      ]);

      setExistingAvailability(res?.data?.availabilities ?? []);

      const extractSessions = (response: any): any[] => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data?.sessions)) return response.data.sessions;
        if (Array.isArray(response.data?.data)) return response.data.data;
        if (Array.isArray(response.sessions)) return response.sessions;
        return [];
      };

      const combinedSessions = [
        ...extractSessions(sRes),
        ...extractSessions(allSessRes),
      ];
      setMentorSessions(combinedSessions);

      // Load cached booked slots
      AsyncStorage.getItem(`@throne8_booked_slots_${mentorId}`)
        .then((val) => {
          if (val) {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) setCachedBookedSlots(parsed);
            } catch (_) {}
          }
        })
        .catch(() => {});
    } catch (err: any) {
      console.error('Fetch availability failed:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [mentorId, currentDate]);

  const fetchStats = useCallback(async () => {
    if (!mentorId) return;
    setStatsLoading(true);
    try {
      const res = await AvailabilityService.getAvailabilityStats(mentorId);
      setStats(res.data);
    } catch (err: any) {
      console.error('Fetch availability stats failed:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    fetchMonthAvailability();
    fetchStats();
  }, [fetchMonthAvailability, fetchStats]);

  // ── Slot Counts & Blocked Status Maps ────────────────────
  const slotCountByDate = useMemo(() => {
    const map = new Map<number, number>();
    existingAvailability.forEach((a) => {
      const day = parseInt(a.date.substring(8, 10), 10);
      if (!isNaN(day)) {
        map.set(day, (map.get(day) ?? 0) + (a.slots?.length || 0));
      }
    });
    return map;
  }, [existingAvailability]);

  const blockedRecordsByDay = useMemo(() => {
    const map = new Map<number, BackendAvailabilityRecord>();
    existingAvailability.forEach((a) => {
      if (a.isDateBlocked) {
        const day = parseInt(a.date.substring(8, 10), 10);
        if (!isNaN(day)) {
          map.set(day, a);
        }
      }
    });
    return map;
  }, [existingAvailability]);

  const blockedDateList = useMemo(() => {
    return Array.from(blockedRecordsByDay.entries())
      .map(([day, record]) => ({
        availabilityId: record.availabilityId,
        date: record.date.substring(0, 10),
        day,
      }))
      .sort((a, b) => a.day - b.day);
  }, [blockedRecordsByDay]);

  const isDateBlocked = (day: number) => blockedRecordsByDay.has(day);

  // ── Selected Date Slots & Booking Information ────────────
  const selectedDaySlotsData = useMemo(() => {
    if (selectedDate === null) return null;

    const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const dateObj = new Date(currentYear, currentMonthIdx, selectedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const isBlocked = isDateBlocked(selectedDate);
    const blockedRecord = blockedRecordsByDay.get(selectedDate);

    // Find DB availability record for this date
    const matchedRecord = existingAvailability.find((a) => {
      const aDateStr = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
      return aDateStr === dateStr || isSameDate(a.date, dateStr);
    });

    const toMins = (t: string) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    // Determine raw slots for this date
    let rawSlots: Array<{ startTime: string; endTime: string; isBooked?: boolean; isBlocked?: boolean }> = [];

    if (matchedRecord && Array.isArray(matchedRecord.slots) && matchedRecord.slots.length > 0) {
      rawSlots = matchedRecord.slots.map((s) => ({ ...s }));
    } else {
      // Fallback to weekly schedule for this day
      const daySched = weekSchedule.find((d) => d.day.toLowerCase() === dayName.toLowerCase());
      if (daySched && daySched.enabled && Array.isArray(daySched.slots) && daySched.slots.length > 0) {
        rawSlots = daySched.slots.map((s) => ({ ...s, isBooked: false, isBlocked: false }));
      } else if (daySched && daySched.enabled) {
        rawSlots = [{ startTime: '09:00', endTime: '17:00', isBooked: false, isBlocked: false }];
      }
    }

    // Get all bookings on this date (from DB sessions + AsyncStorage cache)
    const bookingsOnDate: Array<{
      start: number;
      end: number;
      slotTime?: string;
      menteeName?: string;
      serviceTitle?: string;
    }> = [];

    // 1. From DB sessions
    mentorSessions.forEach((s: any) => {
      const checkBooking = (b: any, parentSession?: any) => {
        if (b.status === 'cancelled' || b.status === 'rejected') return;
        const bDate = b.scheduledAt || b.date || parentSession?.scheduledAt;
        if (isSameDate(bDate, dateStr)) {
          let sMin = 0;
          let eMin = 0;
          const slotStr = b.slotTime || parentSession?.slotTime;
          if (slotStr && slotStr.includes('-')) {
            const [st, et] = slotStr.split('-').map((x: string) => x.trim());
            sMin = toMins(st);
            eMin = toMins(et);
          } else if (b.startTime && b.endTime) {
            sMin = toMins(b.startTime);
            eMin = toMins(b.endTime);
          } else if (b.scheduledAt) {
            const d = new Date(b.scheduledAt);
            sMin = d.getHours() * 60 + d.getMinutes();
            eMin = sMin + (b.duration || parentSession?.duration || 30);
          }
          if (eMin > sMin) {
            bookingsOnDate.push({
              start: sMin,
              end: eMin,
              slotTime: slotStr,
              menteeName: b.mentee?.name || b.menteeName || b.userName || b.user?.name || 'Mentee',
              serviceTitle: b.serviceTitle || parentSession?.title || 'Mentorship Session',
            });
          }
        }
      };

      if (Array.isArray(s.bookings)) {
        s.bookings.forEach((b: any) => checkBooking(b, s));
      }
      if (s.status !== 'cancelled' && s.status !== 'rejected') {
        checkBooking(s);
      }
    });

    // 2. From cached booked slots
    cachedBookedSlots.forEach((c: any) => {
      if (isSameDate(c.date, dateStr)) {
        const sMin = toMins(c.startTime);
        const eMin = toMins(c.endTime);
        if (eMin > sMin) {
          bookingsOnDate.push({
            start: sMin,
            end: eMin,
            slotTime: c.slotTime,
            menteeName: 'Booked Session',
            serviceTitle: 'Mentorship Call',
          });
        }
      }
    });

    // Map each slot to its status (Booked, Blocked, or Available)
    const evaluatedSlots = rawSlots.map((slot) => {
      const sMin = toMins(slot.startTime);
      const eMin = toMins(slot.endTime);

      const isDirectlyBooked =
        (slot as any).isBooked === true ||
        (slot as any).isBooked === 'true' ||
        (slot as any).status === 'booked' ||
        !!(slot as any).bookingId;

      const matchedBooking = bookingsOnDate.find((b) => {
        return sMin < b.end && eMin > b.start;
      });

      const isBooked = isDirectlyBooked || !!matchedBooking;
      const isSlotBlocked = isBlocked || (slot as any).isBlocked === true || (slot as any).isBlocked === 'true';

      return {
        ...slot,
        isBooked,
        isBlocked: isSlotBlocked,
        bookingInfo: matchedBooking || (isDirectlyBooked ? { menteeName: 'Booked Mentee', serviceTitle: 'Confirmed Session' } : null),
      };
    });

    const bookedCount = evaluatedSlots.filter((s) => s.isBooked).length;
    const availableCount = evaluatedSlots.filter((s) => !s.isBooked && !s.isBlocked).length;
    const blockedCount = evaluatedSlots.filter((s) => s.isBlocked).length;

    return {
      dateStr,
      dateObj,
      dayName,
      dayNumber: selectedDate,
      isDateBlocked: isBlocked,
      blockedReason: (blockedRecord as any)?.reason,
      slots: evaluatedSlots,
      bookedCount,
      availableCount,
      blockedCount,
      totalCount: evaluatedSlots.length,
    };
  }, [selectedDate, currentYear, currentMonthIdx, existingAvailability, weekSchedule, isDateBlocked, blockedRecordsByDay, mentorSessions, cachedBookedSlots]);

  // ── Slot Generation Helper ───────────────────────────────
  const generateSlots = (startTime: string, endTime: string, duration: number, buffer: number) => {
    const slots: { startTime: string; endTime: string }[] = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;

    while (current + duration <= end) {
      const slotEnd = current + duration;
      slots.push({
        startTime: `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`,
      });
      current = slotEnd + buffer;
    }
    return slots;
  };

  const copyMondayToAll = () => {
    const monday = weekSchedule.find((d) => d.day === 'Monday');
    if (!monday) return;
    const mondaySlots = monday.slots && monday.slots.length > 0
      ? monday.slots
      : [{ startTime: monday.startTime || '09:00', endTime: monday.endTime || '17:00' }];
    const updated = weekSchedule.map((d) => ({
      ...d,
      slots: mondaySlots.map((s) => ({ ...s })),
      startTime: mondaySlots[0]?.startTime || monday.startTime,
      endTime: mondaySlots[mondaySlots.length - 1]?.endTime || monday.endTime,
      enabled: true,
    }));
    handleScheduleChange(updated);
    Alert.alert('Success', 'Monday schedule copied to all days!');
  };

  // ── Save Availability (Single Day or Bulk Month) ─────────
  const handleSaveAvailability = async () => {
    if (!mentorId) {
      Alert.alert('Error', 'Mentor ID not found. Please refresh.');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedDate !== null) {
        // Single Day Mode
        const targetDate = new Date(currentYear, currentMonthIdx, selectedDate);
        const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
        const daySched = weekSchedule.find((d) => d.day === dayName);

        const daySlots = (daySched?.slots && daySched.slots.length > 0)
          ? daySched.slots
          : [{ startTime: daySched?.startTime || '09:00', endTime: daySched?.endTime || '17:00' }];

        const slots = daySlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        }));
        if (slots.length === 0) {
          Alert.alert('Error', 'No slots configured for this day. Please add at least one slot.');
          return;
        }

        const y = currentYear;
        const m = String(currentMonthIdx + 1).padStart(2, '0');
        const dd = String(selectedDate).padStart(2, '0');
        const dateStr = `${y}-${m}-${dd}`;

        await AvailabilityService.createAvailability({
          mentorId,
          date: dateStr,
          slots,
          timezone,
          isRecurring: false,
          dayOfWeek: dayName.toLowerCase(),
        });

        // Ensure full weekly schedule is persisted
        AsyncStorage.setItem(`@throne8_mentor_schedule_${mentorId}`, JSON.stringify(weekSchedule)).catch(() => {});
        const enabledDays = weekSchedule.filter((d) => d.enabled).map((d) => d.day.toLowerCase());
        const base = weekSchedule.find((d) => d.enabled) || weekSchedule[0];
        const firstSlot = base?.slots?.[0] || { startTime: base?.startTime || '09:00', endTime: base?.endTime || '17:00' };
        MentorshipService.updateMentorAvailability(mentorId, {
          timezone,
          daysAvailable: enabledDays,
          preferredHours: { start: firstSlot.startTime, end: firstSlot.endTime },
          bufferBetweenSessions: bufferTime,
          weeklySchedule: weekSchedule,
          schedule: weekSchedule,
        } as any).catch(() => {});

        Alert.alert('Success', `Saved ${slots.length} slots for ${currentMonthName} ${selectedDate}, ${currentYear}!`);
      } else {
        // Bulk Full Month Mode
        const enabledDays = weekSchedule.filter((d) => d.enabled).map((d) => d.day.toLowerCase());
        if (enabledDays.length === 0) {
          Alert.alert('Notice', 'Please enable at least one day in your weekly schedule.');
          return;
        }

        const y = currentYear;
        const m = String(currentMonthIdx + 1).padStart(2, '0');
        const lastDay = new Date(y, currentMonthIdx + 1, 0).getDate();
        const startDate = `${y}-${m}-01`;
        const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

        const base = weekSchedule.find((d) => d.enabled) || weekSchedule[0];
        const baseStart = base?.slots?.[0]?.startTime || base?.startTime || '09:00';
        const baseEnd = base?.slots?.[base.slots.length - 1]?.endTime || base?.endTime || '17:00';

        const res = await AvailabilityService.bulkCreateAvailability({
          mentorId,
          dateRange: { startDate, endDate },
          slotConfig: {
            startTime: baseStart,
            endTime: baseEnd,
            slotDuration,
            bufferBetween: bufferTime,
          },
          daysOfWeek: enabledDays,
          timezone,
        });

        Alert.alert(
          'Bulk Publish Successful',
          `Created: ${res.data?.created ?? 0} slots across ${currentMonthName} ${currentYear}.${
            res.data?.failed ? ` (${res.data.failed} failed)` : ''
          }`
        );
      }

      await fetchMonthAvailability();
      await fetchStats();
      setSelectedDate(null);
    } catch (error: any) {
      Alert.alert('Error Saving Availability', error.message || 'Failed to save availability.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Block / Unblock Date Handlers ────────────────────────
  const handleOpenBlockModal = () => {
    const y = currentYear;
    const m = String(currentMonthIdx + 1).padStart(2, '0');
    const dd = String(selectedDate || new Date().getDate()).padStart(2, '0');
    setNewBlockDate(`${y}-${m}-${dd}`);
    setNewBlockReason('');
    setShowBlockModal(true);
  };

  const handleConfirmBlockDate = async () => {
    if (!newBlockDate.trim() || !mentorId) {
      Alert.alert('Required', 'Please specify a valid date (YYYY-MM-DD).');
      return;
    }

    setIsBlockingDate(true);
    try {
      await AvailabilityService.blockDateByDate(
        mentorId,
        newBlockDate.trim(),
        newBlockReason.trim() || undefined,
        timezone
      );
      Alert.alert('Date Blocked', `Date ${newBlockDate} has been blocked.`);
      setShowBlockModal(false);
      setNewBlockReason('');
      await fetchMonthAvailability();
      await fetchStats();
    } catch (err: any) {
      Alert.alert('Block Date Failed', err.message || 'Unable to block date.');
    } finally {
      setIsBlockingDate(false);
    }
  };

  const handleUnblockDate = async (availabilityId: string, dateStr: string) => {
    setBlockActionId(availabilityId);
    try {
      await AvailabilityService.unblockDateById(availabilityId);
      Alert.alert('Date Unblocked', `Date ${dateStr} has been unblocked.`);
      await fetchMonthAvailability();
      await fetchStats();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to unblock date.');
    } finally {
      setBlockActionId(null);
    }
  };

  // ── Slot Inline Edit & Delete Handlers ───────────────────
  const startEdit = (record: BackendAvailabilityRecord) => {
    setEditingId(record.availabilityId);
    setEditSlots(record.slots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlots([]);
  };

  const handleAddSlotToEdit = () => {
    const toHHMM = (mins: number) =>
      `${String(Math.floor((mins % 1440) / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

    if (editSlots.length === 0) {
      setEditSlots([{ startTime: '09:00', endTime: '09:30' }]);
      return;
    }

    const last = editSlots[editSlots.length - 1];
    const [h, m] = last.endTime.split(':').map(Number);
    const startMins = h * 60 + m;
    setEditSlots([...editSlots, { startTime: toHHMM(startMins), endTime: toHHMM(startMins + slotDuration) }]);
  };

  const handleRemoveSlotFromEdit = (index: number) => {
    setEditSlots(editSlots.filter((_, i) => i !== index));
  };

  const handleSaveSlotEdits = async (availabilityId: string) => {
    if (editSlots.length === 0) {
      Alert.alert('Validation', 'At least one slot is required.');
      return;
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Overlap validation
    for (let i = 0; i < editSlots.length; i++) {
      const aStart = toMinutes(editSlots[i].startTime);
      const aEnd = toMinutes(editSlots[i].endTime);
      if (aStart >= aEnd) {
        Alert.alert('Validation Error', `Slot ${i + 1} start time must be before end time.`);
        return;
      }
      for (let j = i + 1; j < editSlots.length; j++) {
        const bStart = toMinutes(editSlots[j].startTime);
        const bEnd = toMinutes(editSlots[j].endTime);
        if (aStart < bEnd && aEnd > bStart) {
          Alert.alert(
            'Slot Overlap Detected',
            `Slot ${i + 1} (${editSlots[i].startTime}–${editSlots[i].endTime}) overlaps with Slot ${j + 1} (${editSlots[j].startTime}–${editSlots[j].endTime}). Please adjust before saving.`
          );
          return;
        }
      }
    }

    setIsUpdatingSlot(true);
    try {
      await AvailabilityService.updateAvailability(availabilityId, { slots: editSlots });
      Alert.alert('Success', 'Availability slots updated successfully!');
      setEditingId(null);
      setEditSlots([]);
      await fetchMonthAvailability();
      await fetchStats();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update slots.');
    } finally {
      setIsUpdatingSlot(false);
    }
  };

  const handleDeleteAvailability = (availabilityId: string, dateStr: string) => {
    Alert.alert(
      'Delete Availability',
      `Are you sure you want to delete availability for ${dateStr}? Booked sessions may be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(availabilityId);
            try {
              await AvailabilityService.deleteAvailability(availabilityId);
              Alert.alert('Deleted', 'Availability deleted successfully.');
              await fetchMonthAvailability();
              await fetchStats();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Cannot delete availability.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // ── Metrics Calculation ──────────────────────────────────
  const totalSlotsCount = stats?.totalSlots ?? existingAvailability.reduce((sum, a) => sum + (a.slots?.length || 0), 0);
  const availableSlotsCount = stats?.availableSlots ?? existingAvailability.reduce((sum, a) => sum + (a.slots?.filter((s) => !s.isBooked && !s.isBlocked)?.length || 0), 0);
  const bookedSlotsCount = stats?.bookedSlots ?? existingAvailability.reduce((sum, a) => sum + (a.slots?.filter((s) => s.isBooked)?.length || 0), 0);
  const blockedSlotsCount = stats?.blockedSlots ?? blockedRecordsByDay.size;

  return (
    <View className="w-full">
      {/* ── 1. Page Header & Refresh ── */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Clock size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Availability</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">Set your available hours</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            fetchMonthAvailability();
            fetchStats();
          }}
          disabled={isLoadingData || statsLoading}
          activeOpacity={0.8}
          className="bg-[#FAF8F5] border border-[#e4dbd1] px-3 py-2 rounded-xl flex-row items-center gap-1.5"
        >
          {isLoadingData ? (
            <ActivityIndicator size="small" color="#7a5c3e" />
          ) : (
            <RefreshCw size={14} color="#7a5c3e" />
          )}
          <Text className="text-xs font-bold text-[#7a5c3e]">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. Metric Summary Cards (Live 2x2 Grid) ── */}
      <View className="flex-row flex-wrap justify-between mb-6">
        {/* Total Slots */}
        <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm mb-3 min-h-[108px] justify-between">
          <View className="w-8 h-8 rounded-xl bg-[#f5ede4] items-center justify-center">
            <BarChart3 size={16} color="#7a5c3e" />
          </View>
          <View className="mt-2">
            <Text className="text-2xl font-black text-[#3c2a1e] leading-none" numberOfLines={1}>
              {statsLoading ? '—' : totalSlotsCount}
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1">Total Slots</Text>
          </View>
        </View>

        {/* Available */}
        <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm mb-3 min-h-[108px] justify-between">
          <View className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center">
            <BarChart3 size={16} color="#059669" />
          </View>
          <View className="mt-2">
            <Text className="text-2xl font-black text-emerald-800 leading-none" numberOfLines={1}>
              {statsLoading ? '—' : availableSlotsCount}
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1">Available</Text>
          </View>
        </View>

        {/* Booked */}
        <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm min-h-[108px] justify-between">
          <View className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center">
            <BarChart3 size={16} color="#d97706" />
          </View>
          <View className="mt-2">
            <Text className="text-2xl font-black text-amber-800 leading-none" numberOfLines={1}>
              {statsLoading ? '—' : bookedSlotsCount}
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1">Booked</Text>
          </View>
        </View>

        {/* Blocked */}
        <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm min-h-[108px] justify-between">
          <View className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 items-center justify-center">
            <BarChart3 size={16} color="#dc2626" />
          </View>
          <View className="mt-2">
            <Text className="text-2xl font-black text-red-700 leading-none" numberOfLines={1}>
              {statsLoading ? '—' : blockedSlotsCount}
            </Text>
            <Text className="text-[11px] text-[#8a7a6a] font-medium mt-1">Blocked</Text>
          </View>
        </View>
      </View>

      {/* ── 3. Slot Duration, Break & Timezone Configurations Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        {/* Slot Duration */}
        <View className="mb-5">
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Clock size={15} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Slot Duration</Text>
          </View>
          <View className="flex-row gap-2">
            {[30, 45, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => setSlotDuration(mins)}
                activeOpacity={0.8}
                className={`flex-1 py-3 rounded-2xl items-center justify-center border ${
                  slotDuration === mins
                    ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                    : 'bg-[#FAF8F5] border-[#e4dbd1]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    slotDuration === mins ? 'text-white' : 'text-[#3c2a1e]'
                  }`}
                >
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Break Between Sessions */}
        <View className="mb-5">
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Clock size={15} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Break Between Sessions</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
              { label: 'No Break', value: 0 },
              { label: '15 min', value: 15 },
              { label: '30 min', value: 30 },
              { label: '45 min', value: 45 },
            ].map((brk) => (
              <TouchableOpacity
                key={brk.value}
                onPress={() => {
                  setBufferTime(brk.value);
                  if (mentorId) {
                    MentorshipService.updateMentorAvailability(mentorId, {
                      bufferBetweenSessions: brk.value,
                    }).catch(() => {});
                  }
                }}
                activeOpacity={0.8}
                className={`px-4 py-2.5 rounded-xl border mr-2 items-center justify-center ${
                  bufferTime === brk.value
                    ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                    : 'bg-[#FAF8F5] border-[#e4dbd1]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    bufferTime === brk.value ? 'text-white' : 'text-[#3c2a1e]'
                  }`}
                >
                  {brk.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timezone */}
        <View>
          <View className="flex-row items-center gap-1.5 mb-2">
            <Globe size={15} color="#7a5c3e" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Timezone</Text>
          </View>
          <View className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 flex-row items-center justify-between">
            <Text className="text-xs font-bold text-[#3c2a1e]">
              {timezone === 'Asia/Kolkata' ? 'IST (GMT+5:30)' : timezone}
            </Text>
            <View className="bg-[#f5ede4] px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-[#7a5c3e] uppercase">Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── 4. Quick Utility Actions Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row gap-2.5 mb-3.5">
          <TouchableOpacity
            onPress={copyMondayToAll}
            activeOpacity={0.8}
            className="flex-1 bg-[#3c2a1e] py-3.5 px-2 rounded-2xl flex-row items-center justify-center gap-1.5 shadow-sm"
          >
            <Copy size={14} color="#fff" />
            <Text className="text-white text-xs font-bold" numberOfLines={1}>
              Copy Monday → All Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenBlockModal}
            activeOpacity={0.8}
            className="px-4 bg-[#FAF8F5] border border-[#e4dbd1] py-3.5 rounded-2xl flex-row items-center justify-center gap-1.5"
          >
            <Ban size={14} color="#dc2626" />
            <Text className="text-xs font-bold text-[#dc2626]">Block Dates</Text>
          </TouchableOpacity>
        </View>

        {/* Free Trial Slot Toggle */}
        <TouchableOpacity
          onPress={() => setFreeTrialEnabled(!freeTrialEnabled)}
          activeOpacity={0.8}
          className="flex-row items-center gap-3 pt-3 border-t border-[#f0e8e0]"
        >
          <View
            className={`w-5 h-5 rounded-md border items-center justify-center ${
              freeTrialEnabled ? 'bg-[#3c2a1e] border-[#3c2a1e]' : 'border-[#d4c4b5] bg-white'
            }`}
          >
            {freeTrialEnabled && <Check size={13} color="#ffffff" />}
          </View>
          <Text className="text-xs font-bold text-[#3c2a1e]">Free Trial Slot Toggle</Text>
        </TouchableOpacity>
      </View>

      {/* ── 5. Interactive Calendar Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        {/* Month & Year Navigation */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Calendar size={18} color="#7a5c3e" />
            <Text className="text-base font-black text-[#3c2a1e]">
              {currentMonthName} {currentYear}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center"
            >
              <ChevronLeft size={16} color="#4a3728" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextMonth}
              className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center"
            >
              <ChevronRight size={16} color="#4a3728" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode indicator badge */}
        <TouchableOpacity
          onPress={() => setSelectedDate(null)}
          activeOpacity={0.8}
          className="py-2.5 px-3 rounded-2xl items-center border mb-4 bg-[#FAF8F5] border-[#e4dbd1]"
        >
          <Text className="text-xs font-bold text-[#7a5c3e]">
            {selectedDate
              ? `Single day: ${selectedDate} ${currentMonthName} (Tap to switch to Full Month)`
              : `Bulk: Full month (${currentMonthName} ${currentYear})`}
          </Text>
        </TouchableOpacity>

        {/* Day of Week Headers */}
        <View className="flex-row justify-between mb-2.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <View key={i} className="flex-1 items-center justify-center">
              <Text className="text-xs font-bold text-[#8a7a6a]">{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap">
          {/* Offset blanks */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <View key={`empty-${i}`} className="w-[14.28%] aspect-square p-1 items-center justify-center" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              dayNum === new Date().getDate() &&
              currentMonthIdx === new Date().getMonth() &&
              currentYear === new Date().getFullYear();
            const isSelected = selectedDate === dayNum;
            const blocked = isDateBlocked(dayNum);
            const slotCount = slotCountByDate.get(dayNum) ?? 0;
            const hasSlots = slotCount > 0;

            return (
              <View key={`day-${dayNum}`} className="w-[14.28%] aspect-square p-1">
                <TouchableOpacity
                  onPress={() => setSelectedDate(selectedDate === dayNum ? null : dayNum)}
                  activeOpacity={0.7}
                  className={`w-full h-full rounded-xl items-center justify-center border ${
                    isSelected
                      ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                      : blocked
                      ? 'bg-red-50 border-red-200'
                      : isToday
                      ? 'bg-[#f5ede4] border-[#d4a574]'
                      : 'bg-white border-[#e4dbd1]'
                  }`}
                >
                  <Text
                    style={{ includeFontPadding: false }}
                    className={`text-xs font-bold text-center ${
                      isSelected
                        ? 'text-white font-black'
                        : blocked
                        ? 'text-red-700 font-bold'
                        : isToday
                        ? 'text-[#7a5c3e] font-black'
                        : 'text-[#3c2a1e]'
                    }`}
                  >
                    {dayNum}
                  </Text>

                  {hasSlots && !blocked && (
                    <Text
                      style={{ includeFontPadding: false }}
                      className={`text-[9px] font-extrabold mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-blue-600'
                      }`}
                    >
                      {slotCount}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-center gap-3 mt-4 pt-3.5 border-t border-[#f0e8e0] flex-wrap">
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-md bg-[#f5ede4] border border-[#d4a574]" />
            <Text className="text-[10px] text-[#8a7a6a] font-medium">Today</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-md bg-[#3c2a1e]" />
            <Text className="text-[10px] text-[#8a7a6a] font-medium">Selected</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-md bg-white border border-[#e4dbd1]" />
            <Text className="text-[10px] text-blue-600 font-bold">Number = slots</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-md bg-red-100 border border-red-200" />
            <Text className="text-[10px] text-red-700 font-medium">Blocked</Text>
          </View>
        </View>
      </View>

      {/* ── 5B. Selected Date Slots & Booking Status Card ── */}
      {selectedDate !== null && selectedDaySlotsData && (
        <View className="bg-white rounded-3xl p-5 border-2 border-[#7a5c3e] shadow-md mb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3.5 border-b border-[#f0e8e0]">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Calendar size={15} color="#7a5c3e" />
                <Text className="text-sm font-black text-[#3c2a1e]">
                  {selectedDaySlotsData.dayName}, {selectedDaySlotsData.dayNumber} {currentMonthName} {currentYear}
                </Text>
              </View>
              <Text className="text-xs text-[#8a7a6a]">
                All time slots and bookings for this date
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center"
            >
              <X size={15} color="#7a5c3e" />
            </TouchableOpacity>
          </View>

          {/* Status Summary Pills */}
          <View className="flex-row items-center gap-2 my-3.5 flex-wrap">
            <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex-row items-center gap-1.5">
              <CheckCircle2 size={11} color="#059669" />
              <Text className="text-[11px] font-bold text-emerald-800">
                {selectedDaySlotsData.availableCount} Available
              </Text>
            </View>
            <View className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex-row items-center gap-1.5">
              <Lock size={11} color="#d97706" />
              <Text className="text-[11px] font-bold text-amber-800">
                {selectedDaySlotsData.bookedCount} Booked
              </Text>
            </View>
            {selectedDaySlotsData.isDateBlocked && (
              <View className="bg-red-50 border border-red-200 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                <Ban size={11} color="#dc2626" />
                <Text className="text-[11px] font-bold text-red-700">Date Blocked</Text>
              </View>
            )}
          </View>

          {/* Slots List */}
          {selectedDaySlotsData.slots.length === 0 ? (
            <View className="py-6 items-center justify-center bg-[#FAF8F5] rounded-2xl border border-[#ece4dc]">
              <Clock size={24} color="#b5a99d" />
              <Text className="text-xs font-bold text-[#8a7a6a] mt-2 text-center">
                No slots configured for {selectedDaySlotsData.dayName}
              </Text>
              <Text className="text-[11px] text-[#a09080] mt-0.5 text-center">
                Configure slots in the weekly schedule below or click Save to publish
              </Text>
            </View>
          ) : (
            <View className="space-y-2.5">
              {selectedDaySlotsData.slots.map((slot, sIdx) => {
                const isBooked = slot.isBooked;
                const isBlocked = slot.isBlocked;

                return (
                  <View
                    key={`selected-day-slot-${sIdx}`}
                    className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                      isBooked
                        ? 'bg-amber-50/70 border-amber-200'
                        : isBlocked
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-[#FAF8F5] border-[#ece4dc]'
                    }`}
                  >
                    {/* Left: Time & Details */}
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2">
                        <Clock
                          size={13}
                          color={isBooked ? '#b45309' : isBlocked ? '#dc2626' : '#7a5c3e'}
                        />
                        <Text
                          className={`text-xs font-black ${
                            isBooked
                              ? 'text-amber-900'
                              : isBlocked
                              ? 'text-red-900'
                              : 'text-[#3c2a1e]'
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </View>

                      {isBooked && (
                        <Text className="text-[11px] text-amber-800 font-medium mt-1">
                          {slot.bookingInfo?.menteeName
                            ? `Booked by ${slot.bookingInfo.menteeName}`
                            : 'Occupied by booked session'}
                          {slot.bookingInfo?.serviceTitle ? ` • ${slot.bookingInfo.serviceTitle}` : ''}
                        </Text>
                      )}
                      {!isBooked && !isBlocked && (
                        <Text className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Open for booking
                        </Text>
                      )}
                      {isBlocked && !isBooked && (
                        <Text className="text-[11px] text-red-700 font-medium mt-0.5">
                          Slot blocked
                        </Text>
                      )}
                    </View>

                    {/* Right: Status Badge */}
                    <View>
                      {isBooked ? (
                        <View className="bg-amber-200/80 border border-amber-300 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                          <Lock size={11} color="#92400e" strokeWidth={2.5} />
                          <Text className="text-[10px] font-black text-amber-900 uppercase">
                            Booked
                          </Text>
                        </View>
                      ) : isBlocked ? (
                        <View className="bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                          <Text className="text-[10px] font-black text-red-700 uppercase">
                            Blocked
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full flex-row items-center gap-1.5">
                          <CheckCircle2 size={11} color="#059669" strokeWidth={2.5} />
                          <Text className="text-[10px] font-black text-emerald-800 uppercase">
                            Available
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── 6. Weekly Schedule Card ── */}
      <View className="bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="mb-4">
          <Text className="text-sm font-black text-[#3c2a1e]">Weekly Schedule</Text>
          <Text className="text-[11px] text-[#8a7a6a] mt-0.5">
            Set active days and specific daily time slots
          </Text>

          {/* Quick 7-Day Toggle Bar - Full Width Evenly Distributed (Will NEVER go off-screen) */}
          <View className="flex-row items-center justify-between mt-3.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#ece4dc]">
            {weekSchedule.map((d, i) => (
              <TouchableOpacity
                key={d.day}
                onPress={() => handleToggleDay(i)}
                activeOpacity={0.7}
                className={`flex-1 h-8 rounded-xl items-center justify-center mx-0.5 ${
                  d.enabled ? 'bg-[#3c2a1e] shadow-xs' : 'bg-transparent'
                }`}
              >
                <Text
                  style={{ includeFontPadding: false }}
                  className={`text-xs font-bold text-center ${
                    d.enabled ? 'text-white font-black' : 'text-[#8a7a6a]'
                  }`}
                >
                  {d.short}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day Cards with Multi-Slot Management */}
        <View className="space-y-3">
          {weekSchedule.map((d, idx) => (
            <View
              key={d.day}
              className={`p-3.5 rounded-2xl border ${
                d.enabled
                  ? 'bg-[#FAF8F5] border-[#ece4dc]'
                  : 'bg-gray-50 border-gray-200 opacity-70'
              }`}
            >
              {/* Day Header Row: Day Info on Left | Toggle & (+) Icon on Right */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleDay(idx)}
                  className="flex-row items-center gap-2.5 flex-1 mr-2"
                >
                  <View
                    className={`w-8 h-8 rounded-xl items-center justify-center ${
                      d.enabled ? 'bg-[#3c2a1e]' : 'bg-[#e8ded5]'
                    }`}
                  >
                    <Text
                      style={{ includeFontPadding: false }}
                      className={`text-xs font-black ${
                        d.enabled ? 'text-white' : 'text-[#8a7a6a]'
                      }`}
                    >
                      {d.short}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-black text-[#3c2a1e]">{d.day}</Text>
                    <Text className="text-[10px] text-[#8a7a6a] mt-0.5" numberOfLines={1}>
                      {d.enabled
                        ? `${d.slots?.length || 0} slot${(d.slots?.length || 0) === 1 ? '' : 's'} configured`
                        : 'Unavailable'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Right Side: Toggle Switch + (+) Button on Right Side of Toggle */}
                <View className="flex-row items-center gap-2">
                  {/* Day Toggle */}
                  <TouchableOpacity
                    onPress={() => handleToggleDay(idx)}
                    activeOpacity={0.8}
                    className={`w-9 h-5 rounded-full px-0.5 justify-center ${
                      d.enabled ? 'bg-[#3c2a1e] items-end' : 'bg-[#d8cec4] items-start'
                    }`}
                  >
                    <View className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </TouchableOpacity>

                  {/* (+) Icon button on right side of toggle to add slot */}
                  <TouchableOpacity
                    onPress={() => handleAddSlotForDay(idx)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="w-7 h-7 rounded-xl bg-white border border-[#e4dbd1] items-center justify-center shadow-xs"
                  >
                    <Plus size={14} color="#3c2a1e" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Slots List: Stacked one after another */}
              {d.enabled && (
                <View className="mt-3 pt-3 border-t border-[#ede5dd] space-y-2.5">
                  {(!d.slots || d.slots.length === 0) ? (
                    <View className="flex-row items-center justify-between py-1 px-1">
                      <Text className="text-[11px] text-[#8a7a6a] italic">
                        No time slots added for {d.day}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleAddSlotForDay(idx)}
                        className="flex-row items-center gap-1 bg-white border border-[#e4dbd1] px-2.5 py-1 rounded-lg"
                      >
                        <Plus size={11} color="#7a5c3e" />
                        <Text className="text-[10px] font-bold text-[#7a5c3e]">Add Slot</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    d.slots.map((slot, slotIdx) => (
                      <View
                        key={slotIdx}
                        className="bg-white p-3 rounded-2xl border border-[#ece4dc] shadow-xs"
                      >
                        {/* Slot Header: Badge on Left, Delete on Right */}
                        <View className="flex-row items-center justify-between mb-2.5">
                          <View className="flex-row items-center gap-1.5 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#e4dbd1]">
                            <Clock size={11} color="#7a5c3e" />
                            <Text className="text-[10px] font-black text-[#7a5c3e] uppercase">
                              Slot {slotIdx + 1}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleRemoveSlotForDay(idx, slotIdx)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-100"
                          >
                            <Trash2 size={11} color="#dc2626" />
                            <Text className="text-[10px] font-bold text-red-600">Delete</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Time Inputs Row: Spacious Start Time [flex-1] to End Time [flex-1] */}
                        <View className="flex-row items-center gap-2">
                          {/* Start Time Box: Typeable + 30-min Dropdown */}
                          <View className="flex-1 flex-row items-center justify-between bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl px-2.5 py-2">
                            <TextInput
                              value={slot.startTime}
                              onChangeText={(val) =>
                                handleUpdateSlotTime(idx, slotIdx, 'startTime', val)
                              }
                              placeholder="09:00"
                              placeholderTextColor="#b5a99d"
                              maxLength={5}
                              className="text-xs font-bold text-[#3c2a1e] p-0 flex-1 text-center"
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setTimePickerTarget({
                                  dayIdx: idx,
                                  slotIdx,
                                  field: 'startTime',
                                  value: slot.startTime,
                                })
                              }
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              className="pl-2 border-l border-[#e4dbd1]"
                            >
                              <ChevronDown size={13} color="#7a5c3e" />
                            </TouchableOpacity>
                          </View>

                          <Text className="text-xs font-bold text-[#8a7a6a]">to</Text>

                          {/* End Time Box: Typeable + 30-min Dropdown */}
                          <View className="flex-1 flex-row items-center justify-between bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl px-2.5 py-2">
                            <TextInput
                              value={slot.endTime}
                              onChangeText={(val) =>
                                handleUpdateSlotTime(idx, slotIdx, 'endTime', val)
                              }
                              placeholder="17:00"
                              placeholderTextColor="#b5a99d"
                              maxLength={5}
                              className="text-xs font-bold text-[#3c2a1e] p-0 flex-1 text-center"
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setTimePickerTarget({
                                  dayIdx: idx,
                                  slotIdx,
                                  field: 'endTime',
                                  value: slot.endTime,
                                })
                              }
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              className="pl-2 border-l border-[#e4dbd1]"
                            >
                              <ChevronDown size={13} color="#7a5c3e" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* ── 8. Auto Block Settings Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <ShieldCheck size={18} color="#3c2a1e" />
          <Text className="text-sm font-black text-[#3c2a1e]">Auto Block Settings</Text>
        </View>

        {/* Auto Block Booked Slots */}
        <TouchableOpacity
          onPress={() => setAutoBlockBooked(!autoBlockBooked)}
          activeOpacity={0.8}
          className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] flex-row items-center gap-3 mb-2.5"
        >
          <View
            className={`w-5 h-5 rounded-md border items-center justify-center ${
              autoBlockBooked ? 'bg-[#3c2a1e] border-[#3c2a1e]' : 'border-[#d4c4b5] bg-white'
            }`}
          >
            {autoBlockBooked && <Check size={13} color="#ffffff" />}
          </View>
          <Text className="text-xs font-bold text-[#3c2a1e]">Auto Block Booked Slots</Text>
        </TouchableOpacity>

        {/* Auto Close Past Slots */}
        <TouchableOpacity
          onPress={() => setAutoClosePast(!autoClosePast)}
          activeOpacity={0.8}
          className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] flex-row items-center gap-3"
        >
          <View
            className={`w-5 h-5 rounded-md border items-center justify-center ${
              autoClosePast ? 'bg-[#3c2a1e] border-[#3c2a1e]' : 'border-[#d4c4b5] bg-white'
            }`}
          >
            {autoClosePast && <Check size={13} color="#ffffff" />}
          </View>
          <Text className="text-xs font-bold text-[#3c2a1e]">Auto Close Past Slots</Text>
        </TouchableOpacity>
      </View>

      {/* ── 9. Blocked Dates Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="flex-row items-center gap-2 mb-3.5">
          <Ban size={16} color="#dc2626" />
          <Text className="text-sm font-black text-[#3c2a1e]">Blocked Dates</Text>
        </View>

        {blockedDateList.length === 0 ? (
          <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] items-center justify-center mb-3.5">
            <Text className="text-xs text-[#8a7a6a]">No blocked dates configured for this month.</Text>
          </View>
        ) : (
          <View className="space-y-2 mb-3.5">
            {blockedDateList.map((item) => (
              <View
                key={item.availabilityId}
                className="bg-[#FAF8F5] border border-[#e4dbd1] p-3 rounded-2xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2">
                  <Ban size={14} color="#dc2626" />
                  <Text className="text-xs font-bold text-[#3c2a1e]">{item.date}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleUnblockDate(item.availabilityId, item.date)}
                  disabled={blockActionId === item.availabilityId}
                  className="bg-white border border-red-200 p-1.5 rounded-xl"
                >
                  {blockActionId === item.availabilityId ? (
                    <ActivityIndicator size="small" color="#dc2626" />
                  ) : (
                    <Trash2 size={13} color="#dc2626" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={handleOpenBlockModal}
          activeOpacity={0.8}
          className="w-full bg-[#3c2a1e] py-3.5 rounded-2xl items-center flex-row justify-center gap-1.5 shadow-sm"
        >
          <Plus size={14} color="#fff" />
          <Text className="text-white text-xs font-bold">Add Blocked Date</Text>
        </TouchableOpacity>
      </View>

      {/* ── 10. Bottom Save Action Bar ── */}
      <View className="mb-8">
        <Text className="text-[11px] text-[#8a7a6a] text-center mb-3 font-medium">
          {selectedDate
            ? `Single day mode — ${selectedDate} ${currentMonthName} ${currentYear} • Tap date again to deselect`
            : `Bulk mode — Full month: ${currentMonthName} ${currentYear} • Tap a calendar date to switch to single day`}
        </Text>
        <TouchableOpacity
          onPress={handleSaveAvailability}
          disabled={isSaving}
          activeOpacity={0.85}
          className={`w-full bg-[#3c2a1e] py-4 rounded-2xl items-center justify-center shadow-md ${
            isSaving ? 'opacity-60' : ''
          }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-xs font-black">
              {selectedDate
                ? `Save Availability for ${selectedDate} ${currentMonthName}`
                : `Save Full Month (${currentMonthName} ${currentYear})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Modal: 30-Min Time Dropdown Picker ── */}
      <Modal
        visible={timePickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerTarget(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setTimePickerTarget(null)}
          className="flex-1 bg-black/60 items-center justify-center p-4"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-2xl"
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-[#f0e8e0] mb-3">
              <View>
                <Text className="text-sm font-black text-[#3c2a1e]">
                  Select {timePickerTarget?.field === 'startTime' ? 'Start Time' : 'End Time'}
                </Text>
                <Text className="text-[10px] text-[#8a7a6a] mt-0.5">
                  {timePickerTarget !== null
                    ? `${weekSchedule[timePickerTarget.dayIdx]?.day} • Slot ${timePickerTarget.slotIdx + 1} (30 min increments)`
                    : '30 min increments'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setTimePickerTarget(null)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center"
              >
                <X size={14} color="#7a5c3e" />
              </TouchableOpacity>
            </View>

            {/* Quick 30-minute Time Options Grid */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 280 }}
            >
              <View className="flex-row flex-wrap gap-2 justify-between py-1">
                {TIME_OPTIONS_30MIN.map((timeOption) => {
                  const isSelected = timePickerTarget?.value === timeOption;
                  return (
                    <TouchableOpacity
                      key={timeOption}
                      onPress={() => {
                        if (timePickerTarget) {
                          handleUpdateSlotTime(
                            timePickerTarget.dayIdx,
                            timePickerTarget.slotIdx,
                            timePickerTarget.field,
                            timeOption
                          );
                          setTimePickerTarget(null);
                        }
                      }}
                      className={`w-[22%] py-2.5 rounded-xl border items-center justify-center ${
                        isSelected
                          ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                          : 'bg-[#FAF8F5] border-[#e4dbd1]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-[#3c2a1e]'
                        }`}
                      >
                        {timeOption}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View className="mt-3 pt-3 border-t border-[#f0e8e0] flex-row items-center justify-between">
              <Text className="text-[10px] text-[#8a7a6a]">
                Or type directly in the time box
              </Text>
              <TouchableOpacity
                onPress={() => setTimePickerTarget(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1]"
              >
                <Text className="text-xs font-bold text-[#7a5c3e]">Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── 11. Modal: Block Date ── */}
      <Modal
        visible={showBlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Ban size={18} color="#dc2626" />
                <Text className="text-base font-black text-[#3c2a1e]">Block Specific Date</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBlockModal(false)} className="p-1">
                <X size={18} color="#7a5c3e" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#8a7a6a] mb-4">
              Block an entire date from mentee bookings for holidays, leave, or exams.
            </Text>

            <View className="mb-3">
              <Text className="text-xs font-bold text-[#3c2a1e] mb-1.5">Date (YYYY-MM-DD)</Text>
              <TextInput
                value={newBlockDate}
                onChangeText={setNewBlockDate}
                placeholder="2026-09-18"
                className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs font-bold text-[#3c2a1e]"
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-bold text-[#3c2a1e] mb-1.5">Reason / Label (Optional)</Text>
              <TextInput
                value={newBlockReason}
                onChangeText={setNewBlockReason}
                placeholder="e.g. Diwali Holiday, Personal Off"
                className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs font-medium text-[#3c2a1e]"
              />
            </View>

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setShowBlockModal(false)}
                className="flex-1 py-3 rounded-2xl bg-[#FAF8F5] border border-[#e4dbd1] items-center"
              >
                <Text className="text-xs font-bold text-[#7a5c3e]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmBlockDate}
                disabled={isBlockingDate}
                className="flex-1 py-3 rounded-2xl bg-[#dc2626] items-center justify-center shadow-sm"
              >
                {isBlockingDate ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs font-black text-white">Block Date</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── PAYMENTS & EARNINGS PAGE (FULL RESPONSIVE MOBILE EXPERIENCE) ───────────
const PaymentsPage: React.FC<{ sessions: any[]; mentorData: any }> = ({ sessions, mentorData }) => {
  const allBookings = useMemo(() => {
    return (sessions || []).flatMap((s: any) => {
      if (s.bookings && s.bookings.length > 0) {
        return s.bookings.map((b: any) => ({
          ...b,
          status: b.status || (s.status !== 'available' ? s.status : 'pending'),
          amount: b.pricing?.totalAmount || b.pricing?.basePrice || b.amount || s.pricing?.totalAmount || s.pricing?.basePrice || 0,
          date: b.scheduledAt || b.bookedAt || b.createdAt || s.scheduledAt,
        }));
      }
      if (s.attendees && s.attendees.length > 0) {
        return s.attendees.map((att: any) => ({
          ...att,
          status: att.status || s.status || 'confirmed',
          amount: s.pricing?.totalAmount || s.pricing?.basePrice || s.price || 0,
          date: att.joinedAt || s.startDate || s.scheduledAt,
        }));
      }
      const hasMentee = Boolean(s.bookedBy || s.menteeId || s.bookedMenteeName || s.mentee);
      const isBookedStatus = s.status && s.status !== 'available' && s.status !== 'open';
      if (hasMentee && isBookedStatus) {
        return [{
          ...s,
          status: s.status,
          amount: s.pricing?.totalAmount || s.pricing?.basePrice || s.price || 0,
          date: s.scheduledAt || s.createdAt,
        }];
      }
      return [];
    });
  }, [sessions]);

  const confirmedBookings = useMemo(
    () => allBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'completed'),
    [allBookings]
  );
  const totalEarnings = useMemo(
    () => confirmedBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
    [confirmedBookings]
  );

  const thisMonthBookings = useMemo(() => {
    const now = new Date();
    return confirmedBookings.filter((b: any) => {
      const d = new Date(b.date || Date.now());
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [confirmedBookings]);

  const thisMonthEarnings = useMemo(
    () => thisMonthBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
    [thisMonthBookings]
  );

  const pendingBookings = useMemo(
    () => allBookings.filter((b: any) => b.status === 'pending' || b.status === 'upcoming'),
    [allBookings]
  );

  const pendingEarnings = useMemo(
    () => pendingBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
    [pendingBookings]
  );

  const mentorId = mentorData?._id || mentorData?.mentorId || mentorData?.id;

  // Withdrawal Methods State
  const [withdrawalMethods, setWithdrawalMethods] = useState<any[]>(
    mentorData?.payoutDetails?.methods || []
  );
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [isSubmittingMethod, setIsSubmittingMethod] = useState(false);

  // Payout Request State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Modals
  const [showBankModal, setShowBankModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Bank Form State
  const [bankHolder, setBankHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // UPI Form State
  const [upiId, setUpiId] = useState('');
  const [upiHolder, setUpiHolder] = useState('');

  const fetchWithdrawalMethods = useCallback(async () => {
    if (!mentorId) return;
    try {
      setLoadingMethods(true);
      const res = await WithdrawalService.getMethods(mentorId);
      const methods = res?.data || res || [];
      if (Array.isArray(methods)) {
        setWithdrawalMethods(methods);
      }
    } catch (err: any) {
      console.log('ℹ️ Withdrawal methods fetch:', err?.message || err);
    } finally {
      setLoadingMethods(false);
    }
  }, [mentorId]);

  useEffect(() => {
    fetchWithdrawalMethods();
  }, [fetchWithdrawalMethods]);

  const handleAddBank = async () => {
    if (!bankHolder.trim() || !bankName.trim() || !accountNum.trim() || !ifscCode.trim()) {
      Alert.alert('Validation Error', 'Please fill in all bank details.');
      return;
    }
    try {
      setIsSubmittingMethod(true);
      if (mentorId) {
        await WithdrawalService.addMethod(mentorId, {
          type: 'bank',
          bankName: bankName.trim(),
          accountHolderName: bankHolder.trim(),
          accountNumber: accountNum.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountType: 'savings',
          isDefault: withdrawalMethods.length === 0,
        });
        await fetchWithdrawalMethods();
      } else {
        const newMethod = {
          _id: `bank_${Date.now()}`,
          type: 'bank',
          accountHolderName: bankHolder.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNum.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          isDefault: withdrawalMethods.length === 0,
        };
        setWithdrawalMethods([...withdrawalMethods, newMethod]);
      }
      setShowBankModal(false);
      setBankHolder('');
      setBankName('');
      setAccountNum('');
      setIfscCode('');
      Alert.alert('Success', 'Bank account added successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add bank account.');
    } finally {
      setIsSubmittingMethod(false);
    }
  };

  const handleAddUpi = async () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid UPI ID (e.g. username@bank).');
      return;
    }
    try {
      setIsSubmittingMethod(true);
      if (mentorId) {
        await WithdrawalService.addMethod(mentorId, {
          type: 'upi',
          upiId: upiId.trim().toLowerCase(),
          upiName: upiHolder.trim() || mentorData?.user?.fullName || 'Mentor',
          isDefault: withdrawalMethods.length === 0,
        });
        await fetchWithdrawalMethods();
      } else {
        const newMethod = {
          _id: `upi_${Date.now()}`,
          type: 'upi',
          upiId: upiId.trim().toLowerCase(),
          upiName: upiHolder.trim() || mentorData?.user?.fullName || 'Mentor',
          isDefault: withdrawalMethods.length === 0,
        };
        setWithdrawalMethods([...withdrawalMethods, newMethod]);
      }
      setShowUpiModal(false);
      setUpiId('');
      setUpiHolder('');
      Alert.alert('Success', 'UPI ID added successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add UPI ID.');
    } finally {
      setIsSubmittingMethod(false);
    }
  };

  const handleSetDefaultMethod = async (methodId: string) => {
    if (!mentorId || !methodId) return;
    try {
      await WithdrawalService.setDefault(mentorId, methodId);
      await fetchWithdrawalMethods();
      Alert.alert('Success', 'Default payout method updated!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to set default payout method.');
    }
  };

  const handleRemoveMethod = (id: string) => {
    Alert.alert('Remove Payout Method', 'Are you sure you want to remove this withdrawal method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            if (mentorId) {
              await WithdrawalService.deleteMethod(mentorId, id);
              await fetchWithdrawalMethods();
            } else {
              setWithdrawalMethods(withdrawalMethods.filter((m) => (m._id || m.id) !== id));
            }
            Alert.alert('Success', 'Payout method removed.');
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to remove payout method.');
          }
        },
      },
    ]);
  };

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    if (!selectedMethodId && withdrawalMethods.length > 0) {
      setSelectedMethodId(withdrawalMethods[0]._id || withdrawalMethods[0].id);
    }
    const methodId = selectedMethodId || (withdrawalMethods[0]?._id || withdrawalMethods[0]?.id);
    if (!methodId) {
      Alert.alert('Missing Payout Method', 'Please select or add a withdrawal method first.');
      return;
    }
    try {
      setIsRequestingPayout(true);
      if (mentorId) {
        await WithdrawalService.requestPayout(mentorId, { amount, methodId });
      }
      setShowPayoutModal(false);
      setPayoutAmount('');
      Alert.alert('Payout Requested', `Payout request of ₹${amount.toLocaleString('en-IN')} submitted successfully.`);
    } catch (err: any) {
      Alert.alert('Payout Request Failed', err?.message || 'Unable to submit payout request.');
    } finally {
      setIsRequestingPayout(false);
    }
  };


  return (
    <View className="w-full">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <CreditCard size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Payment & Earnings</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">Track your income</Text>
          </View>
        </View>
      </View>

      {/* ── 2. Top Metric Earnings Cards (Dark Brown Aesthetic) ── */}
      <View className="mb-6">
        {/* Total Earnings Card */}
        <View className="bg-[#3c2a1e] rounded-3xl p-5 border border-[#554030] shadow-sm mb-3.5 overflow-hidden">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-bold text-[#d4c4b5]">Total Earnings</Text>
            <View className="w-8 h-8 rounded-xl bg-white/10 items-center justify-center shrink-0">
              <TrendingUp size={16} color="#ffffff" />
            </View>
          </View>
          <Text
            style={{ includeFontPadding: false }}
            className="text-3xl font-black text-white tracking-tight leading-tight my-0.5"
            numberOfLines={1}
          >
            ₹{totalEarnings.toLocaleString('en-IN')}
          </Text>
          <Text className="text-xs text-[#d4c4b5] font-medium mt-1" numberOfLines={1}>
            {confirmedBookings.length > 0
              ? `${confirmedBookings.length} paid session${confirmedBookings.length > 1 ? 's' : ''}`
              : 'No earnings yet'}
          </Text>
        </View>

        {/* This Month & Pending Side-by-Side Cards */}
        <View className="flex-row justify-between">
          {/* This Month */}
          <View className="w-[48%] bg-[#433226] rounded-3xl p-4 border border-[#554030] shadow-sm min-h-[105px] justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs font-bold text-[#d4c4b5]">This Month</Text>
              <View className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center shrink-0">
                <Calendar size={13} color="#ffffff" />
              </View>
            </View>
            <View className="mt-1">
              <Text
                style={{ includeFontPadding: false }}
                className="text-2xl font-black text-white tracking-tight leading-tight"
                numberOfLines={1}
              >
                ₹{thisMonthEarnings.toLocaleString('en-IN')}
              </Text>
              <Text className="text-[11px] text-[#d4c4b5] font-medium mt-1" numberOfLines={1}>
                {thisMonthBookings.length > 0 ? `${thisMonthBookings.length} this month` : 'No earnings'}
              </Text>
            </View>
          </View>

          {/* Pending */}
          <View className="w-[48%] bg-[#433226] rounded-3xl p-4 border border-[#554030] shadow-sm min-h-[105px] justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs font-bold text-[#d4c4b5]">Pending</Text>
              <View className="w-7 h-7 rounded-lg bg-white/10 items-center justify-center shrink-0">
                <Clock size={13} color="#ffffff" />
              </View>
            </View>
            <View className="mt-1">
              <Text
                style={{ includeFontPadding: false }}
                className="text-2xl font-black text-white tracking-tight leading-tight"
                numberOfLines={1}
              >
                ₹{pendingEarnings.toLocaleString('en-IN')}
              </Text>
              <Text className="text-[11px] text-[#d4c4b5] font-medium mt-1" numberOfLines={1}>
                {pendingBookings.length > 0 ? `${pendingBookings.length} pending` : 'No pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── 3. Transaction History Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
        <Text className="text-sm font-black text-[#3c2a1e] mb-4">Transaction History</Text>

        {allBookings.length === 0 ? (
          <View className="bg-[#FAF8F5] py-8 px-4 rounded-2xl border border-[#ece4dc] items-center justify-center">
            <View className="w-12 h-12 rounded-2xl bg-[#f5ede4] items-center justify-center mb-2.5">
              <CreditCard size={22} color="#8a7a6a" />
            </View>
            <Text className="text-xs font-bold text-[#8a7a6a]">No transactions yet</Text>
            <Text className="text-[10px] text-[#b0a090] mt-0.5 text-center">
              Transactions from your booked sessions will appear here.
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {allBookings.map((b: any, idx: number) => {
              const basePrice = b.pricing?.basePrice || b.amount || 0;
              const platformFee = Math.round(basePrice * 0.1);
              const mentorPayout = basePrice - platformFee;
              const isCompleted = b.status === 'confirmed' || b.status === 'completed';

              return (
                <View
                  key={b._id || idx}
                  className="p-3.5 bg-[#FAF8F5] border border-[#ece4dc] rounded-2xl mb-2.5"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-black text-[#3c2a1e]" numberOfLines={1}>
                        {b.menteeName || b.mentee?.fullName || 'Student Session'}
                      </Text>
                      <Text className="text-[10px] text-[#8a7a6a] mt-0.5">
                        {b.bookedAt ? new Date(b.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-full shrink-0 ${
                        isCompleted ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black uppercase ${
                          isCompleted ? 'text-emerald-800' : 'text-amber-800'
                        }`}
                      >
                        {b.status || 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap items-center justify-between pt-2 border-t border-[#f0e8e0] gap-y-1">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[11px] text-[#8a7a6a]">
                        Base: <Text className="font-bold text-[#3c2a1e]">₹{basePrice}</Text>
                      </Text>
                      <Text className="text-[11px] text-[#8a7a6a]">
                        Fee (10%): <Text className="font-bold text-[#3c2a1e]">₹{platformFee}</Text>
                      </Text>
                    </View>
                    <Text className="text-xs font-black text-emerald-800">
                      Payout: ₹{mentorPayout}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ── 4. Withdrawal Methods Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-black text-[#3c2a1e]">Withdrawal Methods</Text>
            <Text className="text-[10px] text-[#8a7a6a] font-medium mt-0.5">
              Add bank account or UPI to receive payouts
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 shrink-0">
            <TouchableOpacity
              onPress={() => setShowBankModal(true)}
              activeOpacity={0.8}
              className="bg-[#FAF8F5] border border-[#e4dbd1] px-2.5 py-1.5 rounded-xl flex-row items-center gap-1"
            >
              <Building2 size={12} color="#7a5c3e" />
              <Text className="text-[11px] font-bold text-[#3c2a1e]">Bank</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowUpiModal(true)}
              activeOpacity={0.8}
              className="bg-[#3c2a1e] px-2.5 py-1.5 rounded-xl flex-row items-center gap-1 shadow-sm"
            >
              <Smartphone size={12} color="#fff" />
              <Text className="text-[11px] font-bold text-white">UPI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {withdrawalMethods.length === 0 ? (
          /* Dashed Empty Container */
          <View
            style={{
              borderStyle: 'dashed',
              borderWidth: 1.5,
              borderColor: '#d4c4b5',
            }}
            className="bg-[#FAF8F5] rounded-2xl p-5 items-center justify-center my-1"
          >
            <View className="w-11 h-11 rounded-2xl bg-white border border-[#e4dbd1] items-center justify-center mb-2 shadow-sm">
              <CreditCard size={20} color="#8a7a6a" />
            </View>
            <Text className="text-xs font-bold text-[#3c2a1e]">No withdrawal methods added</Text>
            <Text className="text-[10px] text-[#8a7a6a] mt-0.5 text-center mb-3.5">
              Add a bank account or UPI ID to receive your earnings
            </Text>
            <View className="flex-row gap-2.5 w-full">
              <TouchableOpacity
                onPress={() => setShowBankModal(true)}
                activeOpacity={0.8}
                className="flex-1 bg-white border border-[#d4c4b5] py-2.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm"
              >
                <Building2 size={13} color="#4a3728" />
                <Text className="text-xs font-bold text-[#4a3728]">Add Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowUpiModal(true)}
                activeOpacity={0.8}
                className="flex-1 bg-[#3c2a1e] py-2.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm"
              >
                <Smartphone size={13} color="#ffffff" />
                <Text className="text-xs font-bold text-white">Add UPI</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* List of Added Methods */
          <View className="space-y-2.5">
            {withdrawalMethods.map((m) => {
              const methodId = m._id || m.id;
              const isDefault = m.isDefault || m.isPrimary;
              return (
                <View
                  key={methodId}
                  className="p-3.5 bg-[#FAF8F5] border border-[#ece4dc] rounded-2xl mb-2 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-white border border-[#e4dbd1] items-center justify-center shrink-0">
                      {m.type === 'bank' ? (
                        <Building2 size={18} color="#7a5c3e" />
                      ) : (
                        <Smartphone size={18} color="#7a5c3e" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-xs font-black text-[#3c2a1e]" numberOfLines={1}>
                          {m.type === 'bank' ? (m.bankName || 'Bank Account') : 'UPI ID'}
                        </Text>
                        {isDefault ? (
                          <View className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md shrink-0">
                            <Text className="text-[9px] font-black text-emerald-800 uppercase">Default</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleSetDefaultMethod(methodId)}
                            className="bg-[#f5ede4] px-1.5 py-0.5 rounded-md shrink-0"
                          >
                            <Text className="text-[9px] font-bold text-[#7a5c3e]">Set Default</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text className="text-[11px] text-[#8a7a6a] mt-0.5" numberOfLines={1}>
                        {m.type === 'bank'
                          ? `•••• ${m.accountNumber?.slice(-4)} (${m.ifscCode || m.ifsc || 'IFSC'})`
                          : (m.upiId || m.upiName)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveMethod(methodId)}
                    className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 items-center justify-center shrink-0"
                  >
                    <Trash2 size={13} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Request Payout Button */}
            <TouchableOpacity
              onPress={() => setShowPayoutModal(true)}
              activeOpacity={0.85}
              className="mt-3 w-full bg-[#3c2a1e] py-3 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm"
            >
              <CreditCard size={15} color="#fff" />
              <Text className="text-white text-xs font-bold">Request Withdrawal / Payout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Request Payout Modal ── */}
      <Modal visible={showPayoutModal} transparent animationType="fade" onRequestClose={() => setShowPayoutModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <Pressable onPress={() => setShowPayoutModal(false)} className="flex-1 bg-black/60 justify-center p-4">
            <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <CreditCard size={18} color="#3c2a1e" />
                  <Text className="text-base font-black text-[#3c2a1e]">Request Payout</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                  <X size={18} color="#8a7a6a" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3 mb-5">
                <View>
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Withdrawal Amount (₹)</Text>
                  <TextInput
                    value={payoutAmount}
                    onChangeText={setPayoutAmount}
                    keyboardType="number-pad"
                    placeholder={`e.g. ${totalEarnings > 0 ? totalEarnings : 1000}`}
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                  <Text className="text-[10px] text-[#8a7a6a] mt-1">
                    Available earnings: ₹{totalEarnings.toLocaleString('en-IN')}
                  </Text>
                </View>

                {withdrawalMethods.length > 0 && (
                  <View className="mt-2.5">
                    <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Select Payout Method</Text>
                    {withdrawalMethods.map((m) => {
                      const id = m._id || m.id;
                      const isSel = (selectedMethodId || withdrawalMethods[0]?._id || withdrawalMethods[0]?.id) === id;
                      return (
                        <TouchableOpacity
                          key={id}
                          onPress={() => setSelectedMethodId(id)}
                          className={`p-3 rounded-xl border mb-1.5 flex-row items-center justify-between ${
                            isSel ? 'bg-[#f5ede4] border-[#7a5c3e]' : 'bg-[#FAF8F5] border-[#ece4dc]'
                          }`}
                        >
                          <Text className="text-xs font-bold text-[#3c2a1e]">
                            {m.type === 'bank' ? `${m.bankName || 'Bank'} (•••• ${m.accountNumber?.slice(-4)})` : m.upiId}
                          </Text>
                          {isSel && <CheckCircle2 size={15} color="#7a5c3e" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleRequestPayout}
                disabled={isRequestingPayout}
                activeOpacity={0.85}
                className={`w-full bg-[#3c2a1e] py-3.5 rounded-2xl items-center justify-center shadow-sm ${
                  isRequestingPayout ? 'opacity-60' : ''
                }`}
              >
                {isRequestingPayout ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-xs font-bold">Submit Payout Request</Text>
                )}
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>


      {/* ── Add Bank Modal ── */}
      <Modal visible={showBankModal} transparent animationType="fade" onRequestClose={() => setShowBankModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <Pressable onPress={() => setShowBankModal(false)} className="flex-1 bg-black/60 justify-center p-4">
            <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Building2 size={18} color="#3c2a1e" />
                  <Text className="text-base font-black text-[#3c2a1e]">Add Bank Account</Text>
                </View>
                <TouchableOpacity onPress={() => setShowBankModal(false)}>
                  <X size={18} color="#8a7a6a" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3 mb-5">
                <View>
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Account Holder Name</Text>
                  <TextInput
                    value={bankHolder}
                    onChangeText={setBankHolder}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>

                <View className="mt-2.5">
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Bank Name</Text>
                  <TextInput
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="e.g. HDFC Bank, ICICI Bank"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>

                <View className="mt-2.5">
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Account Number</Text>
                  <TextInput
                    value={accountNum}
                    onChangeText={setAccountNum}
                    keyboardType="number-pad"
                    placeholder="e.g. 50100234567890"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>

                <View className="mt-2.5">
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">IFSC Code</Text>
                  <TextInput
                    value={ifscCode}
                    onChangeText={setIfscCode}
                    autoCapitalize="characters"
                    placeholder="e.g. HDFC0001234"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddBank}
                activeOpacity={0.85}
                className="w-full bg-[#3c2a1e] py-3.5 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white text-xs font-bold">Save Bank Account</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Add UPI Modal ── */}
      <Modal visible={showUpiModal} transparent animationType="fade" onRequestClose={() => setShowUpiModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <Pressable onPress={() => setShowUpiModal(false)} className="flex-1 bg-black/60 justify-center p-4">
            <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-2xl">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Smartphone size={18} color="#3c2a1e" />
                  <Text className="text-base font-black text-[#3c2a1e]">Add UPI ID</Text>
                </View>
                <TouchableOpacity onPress={() => setShowUpiModal(false)}>
                  <X size={18} color="#8a7a6a" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3 mb-5">
                <View>
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">UPI ID (VPA)</Text>
                  <TextInput
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                    placeholder="e.g. username@okaxis, 9876543210@paytm"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>

                <View className="mt-2.5">
                  <Text className="text-xs font-bold text-[#3c2a1e] mb-1">Account Holder Name (Optional)</Text>
                  <TextInput
                    value={upiHolder}
                    onChangeText={setUpiHolder}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#a09080"
                    className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-3.5 py-3 text-xs text-[#3c2a1e]"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddUpi}
                activeOpacity={0.85}
                className="w-full bg-[#3c2a1e] py-3.5 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="text-white text-xs font-bold">Save UPI ID</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ─── REVIEWS PAGE (FULL LIVE BACKEND INTEGRATION & RESPONSIVE UI) ─────────────
const ReviewsPage: React.FC<{ mentorData: any; reviews?: any[]; loadingReviews?: boolean }> = ({
  mentorData,
}) => {
  const mentorId = mentorData?.mentorId || mentorData?._id || mentorData?.id;

  const [stats, setStats] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Official Mentor Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Report Review State
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch initial stats and reviews
  const loadReviewsData = useCallback(async (isRefresh = false) => {
    if (!mentorId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [statsRes, reviewsRes] = await Promise.all([
        ReviewService.getReviewStats(mentorId).catch(() => null),
        ReviewService.getMentorReviews(mentorId, 1, 10).catch(() => null),
      ]);

      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      if (reviewsRes?.data) {
        setReviewsList(reviewsRes.data);
        const meta = reviewsRes.meta || reviewsRes.pagination;
        setTotalPages(meta?.totalPages || 1);
        setTotalReviewsCount(meta?.total ?? reviewsRes.data.length);
        setPage(1);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mentorId]);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Load More Reviews
  const handleLoadMore = async () => {
    if (!mentorId || page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await ReviewService.getMentorReviews(mentorId, nextPage, 10);
      if (res?.data) {
        setReviewsList((prev) => [...prev, ...res.data]);
        setPage(nextPage);
      }
    } catch (err: any) {
      console.error('Failed to load more reviews:', err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Upvote / Mark Helpful
  const handleMarkHelpful = async (reviewId: string) => {
    setReviewsList((prev) =>
      prev.map((r) =>
        (r.reviewId === reviewId || r._id === reviewId)
          ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
          : r
      )
    );
    try {
      await ReviewService.markHelpful(reviewId);
    } catch {
      setReviewsList((prev) =>
        prev.map((r) =>
          (r.reviewId === reviewId || r._id === reviewId)
            ? { ...r, helpfulCount: Math.max(0, (r.helpfulCount || 1) - 1) }
            : r
        )
      );
    }
  };

  // Submit Mentor Response
  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await ReviewService.postMentorResponse(reviewId, replyText.trim());
      setReviewsList((prev) =>
        prev.map((r) =>
          (r.reviewId === reviewId || r._id === reviewId)
            ? {
                ...r,
                mentorResponse: {
                  comment: replyText.trim(),
                  response: replyText.trim(),
                  respondedAt: new Date().toISOString(),
                },
              }
            : r
        )
      );
      setReplyingReviewId(null);
      setReplyText('');
      Alert.alert('Response Published', 'Your official response has been added to this review.');
    } catch (err: any) {
      Alert.alert('Failed to Submit Reply', err.message || 'Error publishing response.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit Report Review
  const handleConfirmReport = async () => {
    if (!reportingReviewId || !reportReason.trim()) {
      Alert.alert('Required', 'Please enter a reason for reporting.');
      return;
    }
    setIsSubmittingReport(true);
    try {
      await ReviewService.reportReview(reportingReviewId, reportReason.trim());
      Alert.alert('Report Submitted', 'Thank you. Our moderation team will inspect this review.');
      setShowReportModal(false);
      setReportingReviewId(null);
      setReportReason('');
    } catch (err: any) {
      Alert.alert('Report Failed', err.message || 'Error submitting report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const distribution = stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = stats?.totalReviews ?? totalReviewsCount ?? mentorData?.stats?.totalReviews ?? 0;
  const averageRating = stats?.averageRating ?? mentorData?.stats?.averageRating ?? 5.0;
  const fiveStarCount = distribution[5] ?? 0;
  const positivePct = totalReviews > 0
    ? Math.round((((distribution[5] || 0) + (distribution[4] || 0)) / totalReviews) * 100)
    : 100;

  const statCards = [
    { label: 'Overall Rating', value: averageRating.toFixed(1), icon: Star, color: '#f59e0b' },
    { label: 'Total Reviews', value: String(totalReviews), icon: MessageSquare, color: '#4a3728' },
    { label: 'Positive', value: `${positivePct}%`, icon: Sparkles, color: '#059669' },
    { label: '5-Star Reviews', value: String(fiveStarCount), icon: Award, color: '#c9932a' },
  ];

  return (
    <View className="w-full">
      {/* ── 1. Page Header & Refresh ── */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Star size={22} color="#ffffff" fill="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Reviews & Ratings</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">Feedback from your learners</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => loadReviewsData(true)}
          disabled={loading || refreshing}
          activeOpacity={0.8}
          className="bg-[#FAF8F5] border border-[#e4dbd1] px-3 py-2 rounded-xl flex-row items-center gap-1.5"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#7a5c3e" />
          ) : (
            <RefreshCw size={14} color="#7a5c3e" />
          )}
          <Text className="text-xs font-bold text-[#7a5c3e]">Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="bg-white rounded-3xl p-10 border border-[#e4dbd1] shadow-sm items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-xs font-bold text-[#8a7a6a] mt-3">Loading verified reviews...</Text>
        </View>
      ) : error ? (
        <View className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm items-center justify-center mb-6">
          <AlertCircle size={28} color="#d97706" />
          <Text className="text-sm font-bold text-[#3c2a1e] mt-2">{error}</Text>
          <TouchableOpacity
            onPress={() => loadReviewsData(false)}
            className="mt-3 bg-[#4a3728] px-4 py-2 rounded-xl"
          >
            <Text className="text-xs font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ── 2. Hero Rating & Star Distribution Card ── */}
          <View className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-sm mb-6">
            <View className="flex-row items-center justify-between flex-wrap gap-4 mb-5 pb-5 border-b border-[#f0e8e0]">
              {/* Left numerical score */}
              <View className="items-center sm:items-start min-w-[120px]">
                <Text style={{ includeFontPadding: false }} className="text-5xl font-black text-[#3c2a1e]">
                  {averageRating.toFixed(1)}
                </Text>
                <View className="flex-row gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      color={s <= Math.round(averageRating) ? '#f59e0b' : '#d4c4b5'}
                      fill={s <= Math.round(averageRating) ? '#f59e0b' : 'transparent'}
                    />
                  ))}
                </View>
                <Text className="text-xs font-bold text-[#8a7a6a]">
                  Based on {totalReviews} review{totalReviews === 1 ? '' : 's'}
                </Text>
              </View>

              {/* Right Star Distribution Bars */}
              <View className="flex-1 min-w-[180px] space-y-1.5 justify-center">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars as keyof typeof distribution] ?? 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <View key={stars} className="flex-row items-center gap-2">
                      <Text className="text-xs font-bold text-[#8a7a6a] w-5 text-right">{stars}★</Text>
                      <View className="flex-1 h-2 rounded-full bg-[#f3ece4] overflow-hidden">
                        <View
                          className="h-full rounded-full bg-[#7a5c3e]"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                      <Text className="text-[11px] font-bold text-[#8a7a6a] w-8">{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── 2x2 Metric Summary Grid ── */}
            <View className="flex-row flex-wrap justify-between">
              {statCards.map((c, idx) => {
                const IconComponent = c.icon;
                return (
                  <View
                    key={idx}
                    className="w-[48%] bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] mb-2.5 min-h-[82px] justify-between"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] font-bold text-[#8a7a6a]">{c.label}</Text>
                      <IconComponent size={14} color={c.color} />
                    </View>
                    <Text className="text-xl font-black text-[#3c2a1e]">{c.value}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── 3. Reviews List Card ── */}
          <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-black text-[#3c2a1e]">
                Learner Testimonials ({reviewsList.length})
              </Text>
            </View>

            {reviewsList.length === 0 ? (
              <View className="bg-[#FAF8F5] py-10 px-4 rounded-2xl border border-[#ece4dc] items-center justify-center">
                <View className="w-12 h-12 rounded-2xl bg-[#f5ede4] items-center justify-center mb-2.5">
                  <Star size={22} color="#8a7a6a" />
                </View>
                <Text className="text-xs font-bold text-[#8a7a6a]">No reviews yet</Text>
                <Text className="text-[11px] text-[#b0a090] mt-1 text-center max-w-xs">
                  Student feedback, ratings, and testimonials will appear here after completed mentorship sessions.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {reviewsList.map((r, idx) => {
                  const revId = r.reviewId || r._id || String(idx);
                  const menteeName = r.mentee?.fullName || `${r.mentee?.firstName || ''} ${r.mentee?.lastName || ''}`.trim() || 'Verified Learner';
                  const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) : 'Recent session';

                  const hasMentorResponse = Boolean(r.mentorResponse?.comment || r.mentorResponse?.response);
                  const isReplying = replyingReviewId === revId;

                  return (
                    <View
                      key={revId}
                      className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3"
                    >
                      {/* Review Header */}
                      <View className="flex-row justify-between items-start mb-2.5">
                        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                          <View className="w-9 h-9 rounded-full bg-[#4a3728] items-center justify-center shrink-0">
                            <Text className="text-white text-xs font-bold">
                              {menteeName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center gap-1.5 flex-wrap">
                              <Text className="text-xs font-black text-[#3c2a1e]">{menteeName}</Text>
                              {r.isVerified && (
                                <View className="bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                  <Text className="text-[9px] font-extrabold text-emerald-800">✓ Verified</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-[10px] text-[#8a7a6a] mt-0.5">{dateStr}</Text>
                          </View>
                        </View>

                        {/* Star Rating Badge */}
                        <View className="flex-row items-center bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
                          <Star size={11} color="#d97706" fill="#d97706" />
                          <Text className="text-[11px] font-bold text-amber-800 ml-1">
                            {(r.rating || 5).toFixed(1)}
                          </Text>
                        </View>
                      </View>

                      {/* Comment text */}
                      {r.comment && (
                        <Text className="text-xs text-[#4a3728] leading-relaxed mb-3">
                          {r.comment}
                        </Text>
                      )}

                      {/* Tags */}
                      {r.tags && r.tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-1.5 mb-3">
                          {r.tags.map((tag: string, ti: number) => (
                            <View
                              key={ti}
                              className="bg-white border border-[#e4dbd1] px-2.5 py-1 rounded-xl"
                            >
                              <Text className="text-[10px] font-bold text-[#7a5c3e] capitalize">
                                {tag.replace(/_/g, ' ')}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Mentor Official Response (if exists) */}
                      {hasMentorResponse && (
                        <View className="bg-white rounded-xl p-3 border border-[#e4dbd1] mb-3 ml-2 border-l-4 border-l-[#4a3728]">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-black text-[#4a3728]">Your Official Response</Text>
                            {r.mentorResponse?.respondedAt && (
                              <Text className="text-[9px] text-[#8a7a6a]">
                                {new Date(r.mentorResponse.respondedAt).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                          <Text className="text-xs text-[#5a483a] leading-relaxed">
                            {r.mentorResponse.comment || r.mentorResponse.response}
                          </Text>
                        </View>
                      )}

                      {/* Action Bar: Helpful, Reply, Report */}
                      <View className="flex-row items-center justify-between pt-2 border-t border-[#f0e8e0]">
                        <TouchableOpacity
                          onPress={() => handleMarkHelpful(revId)}
                          activeOpacity={0.7}
                          className="flex-row items-center gap-1.5 py-1 px-2 rounded-lg bg-white border border-[#e4dbd1]"
                        >
                          <ThumbsUp size={12} color="#7a5c3e" />
                          <Text className="text-[10px] font-bold text-[#7a5c3e]">
                            Helpful ({r.helpfulCount || 0})
                          </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-2">
                          {!hasMentorResponse && (
                            <TouchableOpacity
                              onPress={() => {
                                setReplyingReviewId(isReplying ? null : revId);
                                setReplyText('');
                              }}
                              activeOpacity={0.7}
                              className="flex-row items-center gap-1 py-1 px-2 rounded-lg bg-white border border-[#e4dbd1]"
                            >
                              <MessageCircle size={12} color="#4a3728" />
                              <Text className="text-[10px] font-bold text-[#4a3728]">
                                {isReplying ? 'Cancel' : 'Reply'}
                              </Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            onPress={() => {
                              setReportingReviewId(revId);
                              setReportReason('');
                              setShowReportModal(true);
                            }}
                            activeOpacity={0.7}
                            className="p-1.5 rounded-lg bg-white border border-[#e4dbd1]"
                          >
                            <Flag size={12} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Inline Reply Input Box */}
                      {isReplying && (
                        <View className="mt-3 pt-3 border-t border-[#f0e8e0]">
                          <TextInput
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Write your official response to this student review..."
                            multiline
                            className="bg-white border border-[#e4dbd1] rounded-xl p-3 text-xs text-[#3c2a1e] min-h-[60px]"
                          />
                          <View className="flex-row justify-end gap-2 mt-2">
                            <TouchableOpacity
                              onPress={() => setReplyingReviewId(null)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#e4dbd1]"
                            >
                              <Text className="text-[11px] font-bold text-[#7a5c3e]">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleSubmitReply(revId)}
                              disabled={isSubmittingReply || !replyText.trim()}
                              className="px-3.5 py-1.5 rounded-lg bg-[#4a3728] flex-row items-center gap-1"
                            >
                              {isSubmittingReply ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Send size={11} color="#fff" />
                                  <Text className="text-[11px] font-bold text-white">Post Reply</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Load More Button */}
            {page < totalPages && (
              <TouchableOpacity
                onPress={handleLoadMore}
                disabled={loadingMore}
                activeOpacity={0.8}
                className="w-full mt-3 py-3 rounded-2xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center"
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color="#7a5c3e" />
                ) : (
                  <Text className="text-xs font-bold text-[#7a5c3e]">
                    Load More Reviews ({reviewsList.length} of {totalReviews})
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* ── Report Modal ── */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Flag size={18} color="#dc2626" />
                <Text className="text-base font-black text-[#3c2a1e]">Report Review</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportModal(false)} className="p-1">
                <X size={18} color="#7a5c3e" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#8a7a6a] mb-4">
              Please let us know why this review should be moderated (e.g. spam, abusive, or fake).
            </Text>

            <TextInput
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Enter reason for reporting..."
              multiline
              className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl p-3.5 text-xs text-[#3c2a1e] min-h-[80px] mb-5"
            />

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setShowReportModal(false)}
                className="flex-1 py-3 rounded-2xl bg-[#FAF8F5] border border-[#e4dbd1] items-center"
              >
                <Text className="text-xs font-bold text-[#7a5c3e]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmReport}
                disabled={isSubmittingReport || !reportReason.trim()}
                className="flex-1 py-3 rounded-2xl bg-[#dc2626] items-center justify-center shadow-sm"
              >
                {isSubmittingReport ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs font-black text-white">Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── ANALYTICS PAGE (FULL LIVE BACKEND INTEGRATION & RESPONSIVE UI) ───────────
const AnalyticsPage: React.FC<{
  mentorData: any;
  sessions?: any[];
  reviews?: any[];
}> = ({ mentorData, sessions = [], reviews = [] }) => {
  const mentorId = mentorData?.mentorId || mentorData?._id || mentorData?.id;

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async (isRefresh = false) => {
    if (!mentorId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [dashRes, statsRes] = await Promise.all([
        AnalyticsService.getMentorDashboard(mentorId).catch(() => null),
        AnalyticsService.getMentorStats(mentorId).catch(() => null),
      ]);

      if (dashRes?.data) {
        setAnalyticsData(dashRes.data);
      }
      if (statsRes?.data) {
        setDetailedStats(statsRes.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mentorId]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Extract all bookings dynamically from sessions (1:1 sessions, group attendees, direct bookings)
  const allBookings = useMemo(() => {
    return (sessions || []).flatMap((s: any) => {
      if (s.bookings && s.bookings.length > 0) {
        return s.bookings.map((b: any) => ({
          ...b,
          sessionType: s.sessionType || '1:1 Session',
          sessionTitle: s.title || s.sessionType || 'Mentorship Session',
          duration: b.duration || s.duration || 30,
          scheduledAt: b.scheduledAt || s.scheduledAt,
          status: b.status || (s.status !== 'available' ? s.status : 'pending'),
          amount: b.pricing?.totalAmount || b.pricing?.basePrice || b.amount || s.pricing?.totalAmount || s.pricing?.basePrice || 0,
        }));
      }
      if (s.attendees && s.attendees.length > 0) {
        return s.attendees.map((att: any) => ({
          ...att,
          sessionType: s.sessionType || 'group_session',
          sessionTitle: s.title || s.topic || 'Group Masterclass',
          duration: s.duration || 60,
          scheduledAt: att.joinedAt || s.startDate || s.scheduledAt,
          status: att.status || s.status || 'confirmed',
          amount: s.pricing?.totalAmount || s.pricing?.basePrice || s.price || 0,
        }));
      }
      const hasMentee = Boolean(s.bookedBy || s.menteeId || s.bookedMenteeName || s.mentee);
      const isBookedStatus = s.status && s.status !== 'available' && s.status !== 'open';
      if (hasMentee && isBookedStatus) {
        return [{
          sessionId: s.sessionId || s._id,
          sessionType: s.sessionType || '1:1 Session',
          sessionTitle: s.title || s.sessionType || 'Mentorship Session',
          duration: s.duration || 30,
          scheduledAt: s.scheduledAt,
          status: s.status,
          amount: s.pricing?.totalAmount || s.pricing?.basePrice || s.price || 0,
        }];
      }
      return [];
    });
  }, [sessions]);

  // Derived metrics from live data & API
  const profileViewsVal = analyticsData?.profileViews?.value ?? mentorData?.profileViews ?? 0;
  const profileViewsChange = analyticsData?.profileViews?.changePercent ?? 0;
  const profileViewsTrend = analyticsData?.profileViews?.trend ?? (profileViewsChange >= 0 ? 'up' : 'down');

  // Total bookings count: accurately reflecting real live bookings
  const totalBookingsFromServices = useMemo(() => {
    return Math.max(
      allBookings.length,
      detailedStats?.sessions?.total ?? 0,
      analyticsData?.popularServices?.reduce((sum: number, s: any) => sum + (s.bookings || 0), 0) ?? 0,
      mentorData?.stats?.totalSessions ?? 0
    );
  }, [allBookings, detailedStats?.sessions?.total, analyticsData?.popularServices, mentorData?.stats?.totalSessions]);

  // Popular Services Breakdown grouped from live data
  const popularServicesList = useMemo(() => {
    const serviceMap: Record<string, { sessionType: string; bookings: number; revenue: number }> = {};

    // Ensure all created sessions/services are represented
    (sessions || []).forEach((s: any) => {
      const typeKey = s.sessionType || s.title || '1:1 Session';
      if (!serviceMap[typeKey]) {
        serviceMap[typeKey] = {
          sessionType: typeKey,
          bookings: 0,
          revenue: 0,
        };
      }
    });

    // Populate counts and revenue from actual bookings
    allBookings.forEach((b: any) => {
      const typeKey = b.sessionType || b.sessionTitle || '1:1 Session';
      if (!serviceMap[typeKey]) {
        serviceMap[typeKey] = {
          sessionType: typeKey,
          bookings: 0,
          revenue: 0,
        };
      }
      serviceMap[typeKey].bookings += 1;
      if (b.status === 'confirmed' || b.status === 'completed') {
        serviceMap[typeKey].revenue += (b.amount || 0);
      }
    });

    // Merge with API popular services if available
    (analyticsData?.popularServices || []).forEach((ps: any) => {
      const key = ps.sessionType;
      if (serviceMap[key]) {
        serviceMap[key].bookings = Math.max(serviceMap[key].bookings, ps.bookings || 0);
        serviceMap[key].revenue = Math.max(serviceMap[key].revenue, ps.revenue || 0);
      } else {
        serviceMap[key] = {
          sessionType: key,
          bookings: ps.bookings || 0,
          revenue: ps.revenue || 0,
        };
      }
    });

    return Object.values(serviceMap);
  }, [sessions, allBookings, analyticsData?.popularServices]);

  // Monthly earnings list computed from live bookings and API data
  const monthlyEarningsList = useMemo(() => {
    if (analyticsData?.monthlyEarnings && analyticsData.monthlyEarnings.length > 0) {
      return analyticsData.monthlyEarnings;
    }

    const monthMap: Record<string, number> = {};
    const now = new Date();
    // Build default entries for last 3 months
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[ym] = 0;
    }

    allBookings
      .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
      .forEach((b: any) => {
        const d = new Date(b.scheduledAt || b.bookedAt || b.createdAt || Date.now());
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[ym] = (monthMap[ym] || 0) + (b.amount || 0);
      });

    return Object.keys(monthMap)
      .sort()
      .map((ym) => ({
        month: ym,
        amount: monthMap[ym],
      }));
  }, [analyticsData?.monthlyEarnings, allBookings]);

  const liveTotalEarnings = useMemo(() => {
    return allBookings
      .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
  }, [allBookings]);

  const totalEarnings = useMemo(() => {
    return Math.max(
      liveTotalEarnings,
      detailedStats?.earnings?.total || 0,
      monthlyEarningsList.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    );
  }, [liveTotalEarnings, detailedStats?.earnings?.total, monthlyEarningsList]);

  // Completion Rate: dynamic from live completed vs cancelled
  const completionRateVal = useMemo(() => {
    const completedCount = allBookings.filter((b: any) => b.status === 'completed').length;
    const cancelledCount = allBookings.filter((b: any) => b.status === 'cancelled' || b.status === 'refunded').length;
    if (completedCount + cancelledCount > 0) {
      return Math.round((completedCount / (completedCount + cancelledCount)) * 100);
    }
    return analyticsData?.bookingRate?.value ?? detailedStats?.sessions?.completionRate ?? 100;
  }, [allBookings, analyticsData?.bookingRate?.value, detailedStats?.sessions?.completionRate]);

  // Avg Session Duration from live sessions
  const avgDurationVal = useMemo(() => {
    if (allBookings.length > 0) {
      const totalDur = allBookings.reduce((sum: number, b: any) => sum + (Number(b.duration) || 30), 0);
      return Math.round(totalDur / allBookings.length);
    }
    return analyticsData?.avgSessionDuration?.value ?? (sessions[0]?.duration || 30);
  }, [allBookings, analyticsData?.avgSessionDuration?.value, sessions]);

  // Real review counts & rating
  const totalReviewsCount = useMemo(() => {
    return (reviews && reviews.length > 0)
      ? reviews.length
      : (analyticsData?.reviews?.totalReviews || detailedStats?.reviews?.totalReviews || mentorData?.stats?.totalReviews || 0);
  }, [reviews, analyticsData?.reviews?.totalReviews, detailedStats?.reviews?.totalReviews, mentorData?.stats?.totalReviews]);

  const avgRatingVal = useMemo(() => {
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
      return (sum / reviews.length).toFixed(1);
    }
    const val = analyticsData?.reviews?.averageRating || detailedStats?.reviews?.averageRating || mentorData?.stats?.averageRating;
    return val ? Number(val).toFixed(1) : '5.0';
  }, [reviews, analyticsData?.reviews?.averageRating, detailedStats?.reviews?.averageRating, mentorData?.stats?.averageRating]);

  const monthLabel = (ym: string) => {
    if (!ym) return '';
    const parts = ym.split('-');
    if (parts.length >= 2) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      if (!isNaN(y) && !isNaN(m)) {
        return new Date(y, m - 1).toLocaleString('en-US', { month: 'short' });
      }
    }
    return ym;
  };

  const maxEarning = Math.max(...monthlyEarningsList.map((m: any) => m.amount || 0), 1);

  return (
    <View className="w-full">
      {/* ── 1. Page Header & Refresh ── */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <BarChart3 size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Analytics & Growth</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">Track your mentorship impact</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => fetchAnalyticsData(true)}
          disabled={loading || refreshing}
          activeOpacity={0.8}
          className="bg-[#FAF8F5] border border-[#e4dbd1] px-3 py-2 rounded-xl flex-row items-center gap-1.5"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#7a5c3e" />
          ) : (
            <RefreshCw size={14} color="#7a5c3e" />
          )}
          <Text className="text-xs font-bold text-[#7a5c3e]">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Summary Pill */}
      <View className="bg-[#3c2a1e] p-4 rounded-3xl mb-6 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center">
            <TrendingUp size={18} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-black text-white">
              {totalBookingsFromServices} Booking{totalBookingsFromServices === 1 ? '' : 's'} · ₹{totalEarnings.toLocaleString()}
            </Text>
            <Text className="text-[11px] text-white/70 font-medium mt-0.5">
              Verified platform mentorship revenue
            </Text>
          </View>
        </View>
        <View className="bg-white/20 px-2.5 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-white uppercase tracking-wider">Live</Text>
        </View>
      </View>

      {loading ? (
        <View className="bg-white rounded-3xl p-10 border border-[#e4dbd1] shadow-sm items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-xs font-bold text-[#8a7a6a] mt-3">Loading analytics metrics...</Text>
        </View>
      ) : error ? (
        <View className="bg-white rounded-3xl p-8 border border-amber-200 shadow-sm items-center justify-center mb-6">
          <AlertCircle size={28} color="#d97706" />
          <Text className="text-sm font-bold text-[#3c2a1e] mt-2">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchAnalyticsData(false)}
            className="mt-3 bg-[#4a3728] px-4 py-2 rounded-xl"
          >
            <Text className="text-xs font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ── 2. 2x2 Metric Summary Grid ── */}
          <View className="flex-row flex-wrap justify-between mb-6">
            {/* Profile Views */}
            <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm mb-3 min-h-[110px] justify-between">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-[#8a7a6a]">Profile Views</Text>
                <View className="w-7 h-7 rounded-lg bg-[#f5ede4] items-center justify-center">
                  <Eye size={14} color="#7a5c3e" />
                </View>
              </View>
              <View className="mt-1">
                <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-[#3c2a1e] leading-tight">
                  {profileViewsVal.toLocaleString()}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <View
                    className={`flex-row items-center px-1.5 py-0.5 rounded-full ${
                      profileViewsTrend === 'up' ? 'bg-emerald-50' : 'bg-red-50'
                    }`}
                  >
                    {profileViewsTrend === 'up' ? (
                      <ArrowUp size={10} color="#059669" />
                    ) : (
                      <ArrowDown size={10} color="#dc2626" />
                    )}
                    <Text
                      className={`text-[10px] font-black ${
                        profileViewsTrend === 'up' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {profileViewsChange >= 0 ? `+${profileViewsChange}%` : `${profileViewsChange}%`}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-[#8a7a6a]">this month</Text>
                </View>
              </View>
            </View>

            {/* Completion Rate */}
            <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm mb-3 min-h-[110px] justify-between">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-[#8a7a6a]">Completion Rate</Text>
                <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center">
                  <CheckCircle2 size={14} color="#059669" />
                </View>
              </View>
              <View className="mt-1">
                <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-emerald-800 leading-tight">
                  {completionRateVal}%
                </Text>
                <Text className="text-[10px] text-[#8a7a6a] font-medium mt-1">Verified rate</Text>
              </View>
            </View>

            {/* Response Time / Avg Duration */}
            <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm min-h-[110px] justify-between">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-[#8a7a6a]">Avg Session</Text>
                <View className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center">
                  <Clock size={14} color="#7a5c3e" />
                </View>
              </View>
              <View className="mt-1">
                <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-[#3c2a1e] leading-tight">
                  {avgDurationVal} min
                </Text>
                <Text className="text-[10px] text-emerald-700 font-bold mt-1">Standard duration</Text>
              </View>
            </View>

            {/* Trust Score */}
            <View className="w-[48%] bg-white rounded-3xl p-4 border border-[#e4dbd1] shadow-sm min-h-[110px] justify-between">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold text-[#8a7a6a]">Trust Score</Text>
                <View className="w-7 h-7 rounded-lg bg-amber-50 items-center justify-center">
                  <Award size={14} color="#c9932a" />
                </View>
              </View>
              <View className="mt-1">
                <Text style={{ includeFontPadding: false }} className="text-2xl font-black text-emerald-800 leading-tight">
                  {mentorData?.trustScore ? `${getNumericTrustScore(mentorData.trustScore)}%` : '95%'}
                </Text>
                <Text className="text-[10px] text-[#8a7a6a] font-medium mt-1">Verified Elite</Text>
              </View>
            </View>
          </View>

          {/* ── 3. Monthly Earnings Trend (Visual Bar Chart) ── */}
          <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-black text-[#3c2a1e]">Monthly Earnings Trend</Text>
                <Text className="text-[11px] text-[#8a7a6a] mt-0.5">Historical session revenue</Text>
              </View>
              <View className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#e4dbd1] items-center justify-center">
                <Wallet size={16} color="#7a5c3e" />
              </View>
            </View>

            {monthlyEarningsList.length === 0 ? (
              <View className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#ece4dc] items-center justify-center">
                <Text className="text-xs text-[#8a7a6a]">No earnings recorded yet.</Text>
              </View>
            ) : (
              <>
                {/* Visual Chart Bars */}
                <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#e4dbd1] mb-4">
                  <View className="flex-row items-end justify-between gap-2 h-28 pt-2 pb-1">
                    {[...monthlyEarningsList].reverse().map((d: any, idx: number, arr: any[]) => {
                      const amount = d.amount || 0;
                      const heightPct = Math.max((amount / maxEarning) * 100, 10);
                      const isLatest = idx === arr.length - 1;

                      return (
                        <View key={d.month || idx} className="flex-1 items-center justify-end h-full">
                          <Text className="text-[9px] font-bold text-[#8a7a6a] mb-1">
                            ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
                          </Text>
                          <View className="w-full h-16 items-center justify-end">
                            <View
                              className={`w-full rounded-t-lg ${
                                isLatest ? 'bg-[#4a3728]' : 'bg-[#d4c4b5]'
                              }`}
                              style={{ height: `${heightPct}%`, maxWidth: 36 }}
                            />
                          </View>
                          <Text
                            className={`text-[10px] font-bold mt-1.5 uppercase ${
                              isLatest ? 'text-[#4a3728] font-black' : 'text-[#8a7a6a]'
                            }`}
                          >
                            {monthLabel(d.month)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Monthly Breakdown List */}
                <View className="space-y-2">
                  {monthlyEarningsList.map((m: any, idx: number) => (
                    <View
                      key={idx}
                      className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#ece4dc] flex-row items-center justify-between mb-2"
                    >
                      <View className="flex-row items-center gap-2">
                        <View className="w-7 h-7 rounded-lg bg-white border border-[#e4dbd1] items-center justify-center">
                          <Calendar size={13} color="#7a5c3e" />
                        </View>
                        <Text className="text-xs font-black text-[#3c2a1e]">{m.month}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-black text-emerald-800">
                          ₹{(m.amount || 0).toLocaleString()}
                        </Text>
                        <Text className="text-[9px] text-[#8a7a6a]">Settled</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* ── 4. Popular Services Breakdown Card ── */}
          <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-black text-[#3c2a1e]">Popular Services</Text>
                <Text className="text-[11px] text-[#8a7a6a] mt-0.5">Booking distribution by service type</Text>
              </View>
              <View className="bg-[#FAF8F5] border border-[#e4dbd1] px-2.5 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-[#7a5c3e]">
                  {totalBookingsFromServices} Booking{totalBookingsFromServices === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            {popularServicesList.length === 0 ? (
              <View className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#ece4dc] items-center justify-center">
                <Text className="text-xs text-[#8a7a6a]">No services recorded yet.</Text>
              </View>
            ) : (
              <View className="space-y-4">
                {popularServicesList.map((service: any, idx: number) => {
                  const bookings = service.bookings || 0;
                  const pct = totalBookingsFromServices > 0
                    ? Math.round((bookings / totalBookingsFromServices) * 100)
                    : 0;

                  return (
                    <View key={idx} className="mb-3">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center gap-2">
                          <View className="w-6 h-6 rounded-md bg-[#f5ede4] items-center justify-center">
                            <Target size={12} color="#7a5c3e" />
                          </View>
                          <Text className="text-xs font-black text-[#3c2a1e] capitalize">
                            {service.sessionType?.replace(/_/g, ' ').replace(/-/g, ' ') || 'Session'}
                          </Text>
                        </View>
                        <Text className="text-xs font-bold text-[#7a5c3e]">
                          {bookings} booking{bookings === 1 ? '' : 's'} ({pct}%)
                        </Text>
                      </View>
                      <View className="w-full h-2 rounded-full bg-[#FAF8F5] border border-[#e4dbd1] overflow-hidden">
                        <View
                          className="h-full rounded-full bg-[#4a3728]"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── 5. Ratings & Feedback Overview Card ── */}
          <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm font-black text-[#3c2a1e]">Student Feedback Summary</Text>
                <Text className="text-[11px] text-[#8a7a6a] mt-0.5">Rating satisfaction score</Text>
              </View>
              <View className="flex-row items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                <Star size={12} color="#d97706" fill="#d97706" />
                <Text className="text-xs font-black text-amber-800">
                  {avgRatingVal}
                </Text>
              </View>
            </View>

            <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-black text-[#3c2a1e]">Total Verified Reviews</Text>
                <Text className="text-[10px] text-[#8a7a6a] mt-0.5">All student reviews on platform</Text>
              </View>
              <Text className="text-xl font-black text-[#4a3728]">
                {totalReviewsCount}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

// ─── PLANS PAGE (RESPONSIVE SUBSCRIPTION PLANS) ───────────────────────────────
const PlansPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro');

  const plans = [
    {
      id: 'Basic',
      name: 'Basic',
      price: '₹999',
      period: '/mo',
      isPopular: false,
      features: [
        'Up to 10 sessions/month',
        'Basic analytics',
        'Email support',
        'Profile listing',
      ],
      btnText: 'Choose Basic',
      btnStyle: 'bg-[#FAF8F5] border border-[#d4c4b5]',
      btnTextStyle: 'text-[#3c2a1e]',
    },
    {
      id: 'Pro',
      name: 'Pro',
      price: '₹2,499',
      period: '/mo',
      isPopular: true,
      features: [
        'Unlimited sessions',
        'Advanced analytics',
        'Priority support',
        'Marketing tools',
        'Featured listing',
      ],
      btnText: 'Choose Pro',
      btnStyle: 'bg-[#3c2a1e]',
      btnTextStyle: 'text-white',
    },
    {
      id: 'Enterprise',
      name: 'Enterprise',
      price: '₹4,999',
      period: '/mo',
      isPopular: false,
      features: [
        'Everything in Pro',
        'Custom branding',
        'API access',
        'Dedicated manager',
        'Premium badge',
      ],
      btnText: 'Choose Enterprise',
      btnStyle: 'bg-[#FAF8F5] border border-[#d4c4b5]',
      btnTextStyle: 'text-[#3c2a1e]',
    },
  ];

  return (
    <View className="w-full">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Award size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Subscription Plans</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">
              Choose the best plan for you
            </Text>
          </View>
        </View>
      </View>

      {/* ── 2. Plans List ── */}
      <View className="space-y-6">
        {plans.map((plan) => (
          <View
            key={plan.id}
            className={`bg-white rounded-3xl p-6 shadow-sm mb-6 ${
              plan.isPopular
                ? 'border-2 border-[#3c2a1e] shadow-md relative mt-2'
                : 'border border-[#e4dbd1]'
            }`}
          >
            {/* Most Popular Floating Pill */}
            {plan.isPopular && (
              <View className="absolute -top-3.5 left-0 right-0 items-center">
                <View className="bg-[#3c2a1e] px-4 py-1 rounded-full shadow-xs">
                  <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                    Most Popular
                  </Text>
                </View>
              </View>
            )}

            {/* Plan Header */}
            <View className="items-center mt-1">
              <Text className="text-xl font-black text-[#3c2a1e]">{plan.name}</Text>
              <View className="flex-row items-baseline mt-2 mb-1">
                <Text
                  style={{ includeFontPadding: false }}
                  className="text-4xl font-black text-[#3c2a1e]"
                >
                  {plan.price}
                </Text>
                <Text className="text-sm font-bold text-[#8a7a6a] ml-1">{plan.period}</Text>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-[#f0e8e0] my-4 w-full" />

            {/* Features List */}
            <View className="space-y-3 mb-6">
              {plan.features.map((feat, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <View className="w-5 h-5 rounded-full bg-emerald-50 items-center justify-center shrink-0">
                    <CheckCircle2 size={16} color="#059669" />
                  </View>
                  <Text className="text-sm font-medium text-[#4a3728] flex-1">{feat}</Text>
                </View>
              ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan(plan.name);
                Alert.alert(
                  'Plan Selected',
                  `You selected the ${plan.name} plan (${plan.price}${plan.period}).`
                );
              }}
              activeOpacity={0.85}
              className={`w-full py-3.5 rounded-2xl items-center justify-center shadow-xs ${plan.btnStyle}`}
            >
              <Text className={`text-sm font-bold ${plan.btnTextStyle}`}>{plan.btnText}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── TRUST SCORE PAGE (FULL RESPONSIVE CREDIBILITY DASHBOARD) ────────────────
const TrustScorePage: React.FC<{ mentorData: any }> = ({ mentorData }) => {
  const trustScoreObj = typeof mentorData?.trustScore === 'object' && mentorData?.trustScore !== null ? mentorData.trustScore : null;
  const trustScore = getNumericTrustScore(mentorData?.trustScore);

  const breakdownMetrics = [
    {
      title: 'Profile Completeness',
      desc: 'How complete your mentor profile is',
      score: trustScoreObj?.breakdown?.profileCompleteness ?? 80,
      icon: Users,
    },
    {
      title: 'Reliability',
      desc: 'On-time sessions, low cancellations',
      score: trustScoreObj?.breakdown?.reliability ?? 100,
      icon: ShieldCheck,
    },
    {
      title: 'Student Satisfaction',
      desc: 'Ratings & reviews from mentees',
      score: trustScoreObj?.breakdown?.studentSatisfaction ?? 100,
      icon: Star,
    },
    {
      title: 'Engagement',
      desc: 'Response time & platform activity',
      score: trustScoreObj?.breakdown?.engagement ?? 0,
      icon: Zap,
    },
  ];

  const improvementTips = [
    {
      text: 'Complete 5 more sessions this month',
      icon: Clock,
    },
    {
      text: 'Respond to inquiries within 2 hours',
      icon: MessageSquare,
    },
    {
      text: 'Get 3 more 5-star reviews',
      icon: Star,
    },
    {
      text: 'Update your profile with recent achievements',
      icon: Sparkles,
    },
  ];

  return (
    <View className="w-full">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <Shield size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#3c2a1e]">Trust Score</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5">
              Your credibility score
            </Text>
          </View>
        </View>
      </View>

      {/* ── 2. Overall Trust Score Card ── */}
      <View className="bg-[#fcf9f5] rounded-3xl p-6 border border-[#e4dbd1] shadow-sm mb-6">
        <View className="items-center mb-3">
          {/* Circular Score Gauge */}
          <View className="w-28 h-28 rounded-full border-[7px] border-[#3c2a1e] items-center justify-center bg-white shadow-xs mb-3">
            <Text
              style={{ includeFontPadding: false }}
              className="text-4xl font-black text-[#3c2a1e] leading-tight"
            >
              {trustScore}
            </Text>
            <Text className="text-[10px] font-bold text-[#8a7a6a]">out of 100</Text>
          </View>

          {/* Trusted Pro Pill */}
          <View className="bg-[#3c2a1e] px-4 py-1 rounded-full mb-1 shadow-xs">
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Trusted Pro
            </Text>
          </View>

          <Text className="text-xl font-black text-[#3c2a1e] mt-1">Overall Trust Score</Text>
          <Text className="text-xs text-[#8a7a6a] mt-0.5 text-center">
            Based on your recent platform activity
          </Text>
        </View>

        {/* Highlight Banner */}
        <View className="flex-row items-center gap-2 bg-white p-3 rounded-2xl border border-[#e4dbd1] mb-3">
          <TrendingUp size={15} color="#3c2a1e" />
          <Text className="text-xs font-bold text-[#3c2a1e]">
            You're in the top tier of mentors
          </Text>
        </View>

        {/* Target Points to Elite Progress Bar */}
        <View className="bg-white p-3.5 rounded-2xl border border-[#e4dbd1] mb-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Target size={13} color="#7a5c3e" />
              <Text className="text-xs font-bold text-[#3c2a1e]">4 points to Elite Mentor</Text>
            </View>
            <Text className="text-[11px] font-bold text-[#8a7a6a]">{trustScore}/90</Text>
          </View>
          <View className="h-2.5 rounded-full bg-[#f0e8e0] overflow-hidden">
            <View
              style={{ width: `${Math.min(100, (trustScore / 90) * 100)}%` }}
              className="h-full bg-[#3c2a1e] rounded-full"
            />
          </View>
        </View>

        <Text className="text-[11px] text-[#8a7a6a] leading-relaxed">
          ⓘ Trust Score updates weekly based on your latest sessions, reviews, and activity.
        </Text>
      </View>

      {/* ── 3. Score Breakdown Card ── */}
      <View className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-sm mb-6">
        <Text className="text-base font-black text-[#3c2a1e] mb-4">Score Breakdown</Text>

        <View className="space-y-4">
          {breakdownMetrics.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View key={idx} className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                    <View className="w-8 h-8 rounded-xl bg-white border border-[#e4dbd1] items-center justify-center shrink-0">
                      <IconComp size={15} color="#7a5c3e" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-black text-[#3c2a1e]">{item.title}</Text>
                      <Text className="text-[10px] text-[#8a7a6a] mt-0.5">{item.desc}</Text>
                    </View>
                  </View>
                  <Text className="text-xs font-black text-[#3c2a1e] shrink-0">{item.score}%</Text>
                </View>

                {/* Progress bar */}
                <View className="h-2 rounded-full bg-[#e4dbd1] overflow-hidden mt-1">
                  <View
                    style={{ width: `${item.score}%` }}
                    className="h-full bg-[#3c2a1e] rounded-full"
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 4. How to Improve Card ── */}
      <View className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-sm mb-6">
        <Text className="text-base font-black text-[#3c2a1e] mb-4">How to Improve</Text>

        <View className="space-y-3">
          {improvementTips.map((tip, idx) => {
            const IconComp = tip.icon;
            return (
              <View
                key={idx}
                className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc] flex-row items-center gap-3 mb-2.5"
              >
                <View className="w-8 h-8 rounded-xl bg-white border border-[#e4dbd1] items-center justify-center shrink-0">
                  <IconComp size={15} color="#7a5c3e" />
                </View>
                <Text className="text-xs font-bold text-[#3c2a1e] flex-1">{tip.text}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 5. Achievements Card ── */}
      <View className="bg-white rounded-3xl p-6 border border-[#e4dbd1] shadow-sm mb-8">
        <View className="flex-row items-center gap-2 mb-3.5">
          <Award size={18} color="#3c2a1e" />
          <Text className="text-base font-black text-[#3c2a1e]">Achievements</Text>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          <View className="bg-[#FAF8F5] border border-[#e4dbd1] px-4 py-2.5 rounded-2xl flex-row items-center gap-2">
            <ShieldCheck size={16} color="#059669" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Highly Reliable</Text>
          </View>

          <View className="bg-[#FAF8F5] border border-[#e4dbd1] px-4 py-2.5 rounded-2xl flex-row items-center gap-2">
            <Star size={16} color="#d97706" fill="#d97706" />
            <Text className="text-xs font-bold text-[#3c2a1e]">Top Rated</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─── COMMUNITY PAGE ───────────────────────────────────────────────────────────

const DISCUSSION_CATEGORIES = ['All', 'Best Practices', 'Student Engagement', 'Pricing & Earnings', 'Technical', 'General'];



const CommunityPage: React.FC<{
  mentorData?: any;
  setActivePage?: (p: string) => void;
}> = ({ mentorData, setActivePage }) => {
  const navigation = useNavigation<any>();
  const [topMentors, setTopMentors] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'discussions' | 'mentors' | 'events'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Discussion Modal State
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  const [discussionComments, setDiscussionComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newReplyText, setNewReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likedDiscussionIds, setLikedDiscussionIds] = useState<Record<string, boolean>>({});

  // Post Discussion Modal State
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Best Practices');
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  const fetchCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      const [mentorsRes, eventsRes, feedRes] = await Promise.allSettled([
        MentorshipSearchService.searchMentors({ sortBy: 'rating', limit: 50 }),
        MentorshipService.getAllGroupSessions({ limit: 20 }),
        FeedService.getChronologicalFeed(1, 30).catch(() => null),
      ]);

      if (mentorsRes.status === 'fulfilled' && mentorsRes.value?.data) {
        let mList = Array.isArray(mentorsRes.value.data)
          ? mentorsRes.value.data
          : mentorsRes.value.data?.mentors || [];
        try {
          mList = await FeedService.enrichPostsWithAuthorData(mList);
        } catch {
          // keep original
        }
        setTopMentors(mList);
      } else {
        const allM = await MentorshipService.getAllMentors({ limit: 50 }).catch(() => null);
        if (allM?.data) {
          let list = Array.isArray(allM.data) ? allM.data : (allM.data as any)?.mentors || [];
          try {
            list = await FeedService.enrichPostsWithAuthorData(list);
          } catch {
            // keep
          }
          setTopMentors(list);
        }
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        const evData = eventsRes.value?.data || eventsRes.value || [];
        setEvents(Array.isArray(evData) ? evData : evData?.data || []);
      }

      if (feedRes.status === 'fulfilled' && feedRes.value?.data) {
        let rawPosts = Array.isArray(feedRes.value.data)
          ? feedRes.value.data
          : feedRes.value.data?.posts || feedRes.value.data?.data || [];
        if (Array.isArray(rawPosts) && rawPosts.length > 0) {
          try {
            rawPosts = await FeedService.enrichPostsWithAuthorData(rawPosts);
          } catch (e) {
            // fallback
          }
          const currentUserId = mentorData?.userId || mentorData?._id;
          const initialLikes: Record<string, boolean> = {};
          rawPosts = rawPosts.map((p: any) => {
            const pId = String(p.postId || p._id || p.id || p.entryId || '');
            const isLiked = Boolean(
              p.isLikedByCurrentUser ||
              p.isLiked ||
              p.hasLiked ||
              p.currentUserReaction ||
              (currentUserId && Array.isArray(p.likedBy) && p.likedBy.includes(currentUserId)) ||
              (currentUserId && Array.isArray(p.likes) && p.likes.includes(currentUserId))
            );
            if (isLiked && pId) {
              initialLikes[pId] = true;
            }
            return {
              ...p,
              _id: pId,
              id: pId,
              postId: pId,
              entryId: pId,
              isLiked,
            };
          });
          setLikedDiscussionIds((prev) => ({ ...initialLikes, ...prev }));
          setDiscussions(rawPosts);
        } else {
          setDiscussions([]);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [mentorData]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // ── Like / Unlike Discussion ─────────────────────────────────────────────
  const handleToggleLikeDiscussion = async (threadId: string) => {
    if (!threadId) return;
    const isCurrentlyLiked = !!likedDiscussionIds[threadId];
    const newLikedState = !isCurrentlyLiked;

    // Optimistic UI state update immediately
    setLikedDiscussionIds((prev) => ({ ...prev, [threadId]: newLikedState }));

    setDiscussions((prev) =>
      prev.map((d) => {
        const dId = String(d._id || d.id || d.entryId || d.postId);
        if (dId === threadId) {
          const currentCount = Number(d.likesCount ?? (Array.isArray(d.likedBy) ? d.likedBy.length : 0));
          const nextCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);
          return { ...d, likesCount: nextCount, isLiked: newLikedState, isLikedByCurrentUser: newLikedState };
        }
        return d;
      })
    );

    setSelectedDiscussion((prev: any) => {
      if (!prev || prev.id !== threadId) return prev;
      const nextCount = newLikedState ? (prev.likesCount || 0) + 1 : Math.max(0, (prev.likesCount || 0) - 1);
      return { ...prev, likesCount: nextCount, isLiked: newLikedState };
    });

    try {
      if (newLikedState) {
        await FeedService.likePost(threadId).catch(async (e) => {
          const msg = String(e?.message || '');
          if (!msg.toLowerCase().includes('already liked')) {
            await FeedService.reactToPost(threadId, 'like').catch(() => null);
          }
        });
      } else {
        await FeedService.unlikePost(threadId).catch(() => null);
      }
    } catch (e: any) {
      const msg = String(e?.response?.data?.message || e?.message || '');
      if (msg.toLowerCase().includes('already liked')) {
        setLikedDiscussionIds((prev) => ({ ...prev, [threadId]: true }));
      }
    }
  };

  // ── Fetch Comments for a Discussion ──────────────────────────────────────
  const fetchCommentsForDiscussion = async (threadId: string) => {
    try {
      setLoadingComments(true);
      const res = await FeedService.getComments(threadId);
      const list = res?.comments || (Array.isArray(res?.data?.comments) ? res.data.comments : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])));
      const sorted = (list || []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDiscussionComments(sorted);
    } catch {
      setDiscussionComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // ── Navigate to Mentor Profile ──────────────────────────────────────────
  const handleNavigateToMentorProfile = (mentorIdOrUserId?: string) => {
    if (!mentorIdOrUserId) return;
    setSelectedDiscussion(null);
    navigation.navigate('MentorProfile', { mentorId: mentorIdOrUserId });
  };

  // ── Submit Reply to Discussion ───────────────────────────────────────────
  const handleSubmitReply = async () => {
    const trimmed = newReplyText.trim();
    if (!trimmed || !selectedDiscussion?.id) return;

    setSubmittingReply(true);
    const threadId = selectedDiscussion.id;
    const currentAvatar =
      mentorData?.profilePic ||
      mentorData?.profilePhotoUrl ||
      mentorData?.profileImage ||
      mentorData?.avatar ||
      mentorData?.user?.profileImage ||
      mentorData?.user?.profilePhoto ||
      mentorData?.user?.avatar ||
      mentorData?.user?.profilePhotoUrl;
    const currentName =
      mentorData?.user?.fullName ||
      `${mentorData?.user?.firstName || ''} ${mentorData?.user?.lastName || ''}`.trim() ||
      mentorData?.name ||
      mentorData?.title ||
      'You';
    const currentMentorId = mentorData?.mentorId || mentorData?._id || mentorData?.userId || mentorData?.user?._id;

    try {
      const replyRes = await FeedService.addComment(threadId, trimmed);
      const replyId = replyRes?.data?._id || replyRes?._id || `reply_${Date.now()}`;

      const newComment = {
        _id: replyId,
        id: replyId,
        content: trimmed,
        createdAt: new Date().toISOString(),
        avatar: currentAvatar,
        authorAvatar: currentAvatar,
        profileImage: currentAvatar,
        profilePhoto: currentAvatar,
        mentorId: currentMentorId,
        userId: currentMentorId,
        authorName: currentName,
        commenter: {
          fullName: currentName,
          firstName: mentorData?.user?.firstName || currentName,
          avatar: currentAvatar,
          profileImage: currentAvatar,
          profilePhoto: currentAvatar,
          mentorId: currentMentorId,
          userId: currentMentorId,
        },
      };

      // Always show newly posted reply on the very top
      setDiscussionComments((prev) => [newComment, ...prev]);
      setNewReplyText('');

      // Increment comments count seamlessly without reloading
      setSelectedDiscussion((prev: any) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null));
      setDiscussions((prev) =>
        prev.map((d) => {
          const dId = String(d._id || d.id || d.entryId || d.postId);
          if (dId === threadId) {
            const currentC = Number(d.commentsCount ?? 0);
            return { ...d, commentsCount: currentC + 1 };
          }
          return d;
        })
      );
    } catch (e: any) {
      Alert.alert('Reply Failed', e?.response?.data?.message || e?.message || 'Could not post reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // ── Create Discussion Post ────────────────────────────────────────────────
  const handleCreateDiscussion = async () => {
    const rawTitle = postTitle.trim();
    const rawContent = postContent.trim();
    if (!rawTitle && !rawContent) {
      Alert.alert('Required', 'Please enter a title or discussion topic.');
      return;
    }

    setPosting(true);
    try {
      let finalTitle = rawTitle || `Discussion on ${postCategory}`;
      finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);

      const categoryTag = `[${postCategory}]`;
      const finalContent = rawContent
        ? `${categoryTag} ${rawContent}`
        : `${categoryTag} Discussion initiated by mentor.`;

      const currentAvatar =
        mentorData?.profilePic ||
        mentorData?.profilePhotoUrl ||
        mentorData?.profileImage ||
        mentorData?.avatar ||
        mentorData?.user?.profileImage ||
        mentorData?.user?.profilePhoto ||
        mentorData?.user?.avatar ||
        mentorData?.user?.profilePhotoUrl;
      const currentName =
        mentorData?.user?.fullName ||
        `${mentorData?.user?.firstName || ''} ${mentorData?.user?.lastName || ''}`.trim() ||
        mentorData?.name ||
        mentorData?.title ||
        'You';
      const currentUserId = mentorData?.userId || mentorData?._id || mentorData?.mentorId || mentorData?.user?._id;

      const res = await FeedService.createPost({
        title: finalTitle,
        content: finalContent,
        mood: 'thoughtful',
        isPublic: true,
      });

      const newPostId = res?.data?._id || res?._id || res?.data?.postId || `post_${Date.now()}`;

      const newDiscussionItem = {
        _id: newPostId,
        id: newPostId,
        title: finalTitle,
        content: finalContent,
        authorName: currentName,
        authorAvatar: currentAvatar,
        avatar: currentAvatar,
        profileImage: currentAvatar,
        profilePhoto: currentAvatar,
        authorId: currentUserId,
        userId: currentUserId,
        mentorId: currentUserId,
        category: postCategory,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        user: {
          _id: currentUserId,
          fullName: currentName,
          profileImage: currentAvatar,
          avatar: currentAvatar,
        },
      };

      // Seamless X/Twitter-like instant update: prepend to feed without full-page reload
      setDiscussions((prev) => [newDiscussionItem, ...prev]);

      Alert.alert('Discussion Published 🎉', 'Your post is now live in the community feed.');
      setNewPostVisible(false);
      setPostTitle('');
      setPostContent('');
    } catch (err: any) {
      console.error('Create discussion failed:', err);
      Alert.alert('Publish Failed', err?.message || 'Could not publish discussion. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // ── Join / RSVP to Group Masterclass Event ────────────────────────────────
  const handleJoinEvent = async (event: any) => {
    const eventId = event._id || event.sessionId || event.id;
    if (!eventId) return;
    setJoiningEventId(eventId);
    try {
      await MentorshipService.joinGroupSession(eventId);
      Alert.alert('Registered! 🎉', `You have RSVP'd for "${event.title || 'Community Event'}".`);
      fetchCommunityData();
    } catch (err: any) {
      Alert.alert('Session Notice', err?.response?.data?.message || err?.message || 'Successfully recorded your RSVP!');
    } finally {
      setJoiningEventId(null);
    }
  };

  // ── Defensive String Extractor ─────────────────────────────────────────────
  const safeStr = (val: any, fallback = ''): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (val && typeof val.text === 'string') return val.text;
    if (val && typeof val.title === 'string') return val.title;
    if (val && typeof val.name === 'string') return val.name;
    return fallback;
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredDiscussions = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

    return (discussions || []).filter((d: any) => {
      if (!d) return false;
      const titleStr = safeStr(d.title);
      const contentStr = safeStr(d.content);
      const textStr = safeStr(d.text);
      const author = getResolvedAuthorName(d);
      const category = safeStr(d.category || d.topic);
      const fullText = `${titleStr} ${contentStr} ${textStr} ${author} ${category}`.toLowerCase();

      const matchesSearch = queryTokens.length === 0 || queryTokens.every(token => fullText.includes(token));
      const matchesCat = selectedCategory === 'All' || fullText.includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [discussions, searchQuery, selectedCategory]);

  const filteredMentors = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    if (!rawQuery) return topMentors || [];
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

    return (topMentors || []).filter((m: any) => {
      if (!m) return false;
      const resolvedName = getResolvedAuthorName(m);
      const userFullName = safeStr(m.user?.fullName || m.fullName || m.name);
      const userFirstLast = `${safeStr(m.user?.firstName || m.firstName)} ${safeStr(m.user?.lastName || m.lastName)}`.trim();
      const username = safeStr(m.username || m.user?.username || m.userName);
      const domains = Array.isArray(m.domains) ? m.domains.join(' ') : safeStr(m.domains || m.domain);
      const specializations = Array.isArray(m.specializations) ? m.specializations.join(' ') : safeStr(m.specializations || m.specialization);
      const skills = Array.isArray(m.skills) ? m.skills.join(' ') : safeStr(m.skills);
      const expertise = Array.isArray(m.expertise) ? m.expertise.join(' ') : safeStr(m.expertise);
      const tags = Array.isArray(m.tags) ? m.tags.join(' ') : safeStr(m.tags);
      const topics = Array.isArray(m.topics) ? m.topics.join(' ') : safeStr(m.topics);
      const company = safeStr(m.experience?.company || m.company || m.organization || m.workplace);
      const role = safeStr(m.experience?.currentRole || m.currentRole || m.role || m.title || m.position);
      const headline = safeStr(m.headline || m.bio || m.aboutMe || m.about || m.description);
      const location = safeStr(m.location || m.city || m.country);

      const searchableText = `${resolvedName} ${userFullName} ${userFirstLast} ${username} ${domains} ${specializations} ${skills} ${expertise} ${tags} ${topics} ${company} ${role} ${headline} ${location}`.toLowerCase();

      return queryTokens.every(token => searchableText.includes(token));
    });
  }, [topMentors, searchQuery]);

  const filteredEvents = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    if (!rawQuery) return events || [];
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

    return (events || []).filter((e: any) => {
      if (!e) return false;
      const title = safeStr(e.title || e.topic);
      const desc = safeStr(e.description || e.summary);
      const host = safeStr(e.hostName || e.mentorName || e.user?.fullName);
      const tags = Array.isArray(e.tags) ? e.tags.join(' ') : safeStr(e.tags);
      const fullText = `${title} ${desc} ${host} ${tags}`.toLowerCase();

      return queryTokens.every(token => fullText.includes(token));
    });
  }, [events, searchQuery]);

  const handleOpenDiscussion = (thread: any) => {
    if (!thread) return;
    const threadId = String(thread._id || thread.id || thread.entryId || Date.now());
    const author = getResolvedAuthorName(thread);
    const authorAvatar = getResolvedAuthorPic(thread);
    const authorId = thread.mentorId || thread.authorMentorId || thread.userId || thread.authorId || thread.user?._id || thread.user?.id;
    const rawTitle = safeStr(thread.title);
    const rawContent = safeStr(thread.content || thread.text);
    const title = rawTitle || rawContent || 'Discussion Topic';
    const content = rawContent || 'No additional details provided.';
    const createdAt = thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'Recent discussion';
    const likesCount = Number(thread.likesCount ?? (Array.isArray(thread.likedBy) ? thread.likedBy.length : 0));
    const commentsCount = Number(thread.commentsCount ?? (Array.isArray(thread.comments) ? thread.comments.length : 0));
    const isLiked = !!likedDiscussionIds[threadId] || !!thread.isLiked;

    setSelectedDiscussion({
      id: threadId,
      author,
      authorAvatar,
      authorId,
      title,
      content,
      createdAt,
      likesCount,
      commentsCount,
      isLiked,
    });
    setNewReplyText('');
    fetchCommentsForDiscussion(threadId);
  };

  return (
    <View className="w-full pb-6">
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-[#4a3728] items-center justify-center shadow-xs">
            <Users size={22} color="#ffffff" />
          </View>
          <View>
            <Text className="text-xl font-black text-[#4a3728]">Community Hub</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium">Connect, share & grow with peers</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setNewPostVisible(true)}
          activeOpacity={0.85}
          className="flex-row items-center gap-1.5 bg-[#4a3728] px-4 py-2.5 rounded-2xl shadow-xs shrink-0"
        >
          <Plus size={15} color="#fff" />
          <Text className="text-xs font-black text-white">New Post</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. Search & Tab Filter Row ── */}
      <View className="bg-white border border-[#e4dbd1] rounded-2xl px-4 py-3 flex-row items-center shadow-xs mb-3.5">
        <Search size={18} color="#8a7a6a" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search discussions, mentors or topics..."
          placeholderTextColor="#b0a090"
          className="flex-1 ml-3 text-xs sm:text-sm text-[#3c2a1e] py-0 font-medium"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
            <X size={16} color="#8a7a6a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Section Navigation Tabs */}
      <View className="flex-row bg-[#f3ece4] p-1.5 rounded-2xl border border-[#e4dbd1] mb-4">
        {[
          { id: 'all', label: 'All' },
          { id: 'discussions', label: 'Discussions' },
          { id: 'mentors', label: 'Top Mentors' },
          { id: 'events', label: 'Live Events' },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id as any)}
              style={isActive ? { backgroundColor: '#4a3728' } : { backgroundColor: 'transparent' }}
              className="flex-1 py-2.5 items-center rounded-xl"
            >
              <Text style={{ color: isActive ? '#ffffff' : '#7a5c3e' }} className="text-xs font-black">
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Tab Return Banner when filtered */}
      {activeTab !== 'all' && (
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          activeOpacity={0.7}
          className="flex-row items-center justify-between bg-[#f8f5f0] border border-[#e0d8cf] rounded-2xl px-4 py-3 mb-4 shadow-xs"
        >
          <View className="flex-row items-center gap-2.5">
            <ChevronLeft size={18} color="#4a3728" />
            <Text className="text-xs sm:text-sm font-black text-[#4a3728]">
              {activeTab === 'discussions' ? 'Viewing All Discussions' : activeTab === 'mentors' ? 'Viewing All Top Mentors' : 'Viewing Live Events'}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-[#4a3728] px-3 py-1.5 rounded-full">
            <X size={12} color="#ffffff" />
            <Text className="text-xs font-bold text-white">Close View All</Text>
          </View>
        </TouchableOpacity>
      )}

      {loading ? (
        <View className="py-14 items-center justify-center">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-xs font-bold text-[#8a7a6a] mt-3">Loading community activity...</Text>
        </View>
      ) : (
        <>
          {/* ── 3. Discussion Forums Section ── */}
          {(activeTab === 'all' || activeTab === 'discussions') && (
            <View className="bg-white rounded-3xl border border-[#e4dbd1] mb-5 overflow-hidden shadow-xs">
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#f0ebe4]">
                <View className="flex-row items-center gap-2.5">
                  <MessageSquare size={18} color="#7a5c3e" />
                  <Text className="text-base font-black text-[#4a3728]">Discussion Forums</Text>
                  <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <Text className="text-xs font-bold text-emerald-800">
                      {filteredDiscussions.length > 0 ? `${filteredDiscussions.length} active` : 'Active'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveTab(activeTab === 'discussions' ? 'all' : 'discussions')}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    activeTab === 'discussions' ? 'bg-[#4a3728]' : 'bg-[#f5ede4] border border-[#e0d8cf]'
                  }`}
                >
                  {activeTab === 'discussions' ? (
                    <>
                      <X size={12} color="#ffffff" />
                      <Text className="text-xs font-bold text-white">Close View All</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-xs font-bold text-[#7a5c3e]">View All</Text>
                      <ArrowUpRight size={12} color="#7a5c3e" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Category Pills */}
              <View className="border-b border-[#f0ebe4] py-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}
                >
                  {DISCUSSION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={
                          isSelected
                            ? { backgroundColor: '#4a3728', borderColor: '#4a3728' }
                            : { backgroundColor: '#FAF8F5', borderColor: '#e4dbd1' }
                        }
                        className="px-4 py-2 rounded-2xl mr-2.5 border"
                      >
                        <Text style={{ color: isSelected ? '#ffffff' : '#7a5c3e' }} className="text-xs font-black">
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {filteredDiscussions.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <MessageSquare size={28} color="#8a7a6a" />
                  <Text className="text-sm font-black text-[#4a3728] mt-2.5">No discussions found in this category</Text>
                  <Text className="text-xs text-[#8a7a6a] mt-1 text-center max-w-[280px]">
                    Be the first to share an insight or ask a question with your peers!
                  </Text>
                  <TouchableOpacity
                    onPress={() => setNewPostVisible(true)}
                    className="mt-4 bg-[#FAF8F5] border border-[#d4c4b5] px-4 py-2.5 rounded-2xl"
                  >
                    <Text className="text-xs font-black text-[#7a5c3e]">Start Discussion</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {(activeTab === 'discussions' ? filteredDiscussions : filteredDiscussions.slice(0, 6)).map((thread: any, idx: number) => {
                    const author = getResolvedAuthorName(thread);
                    const authorAvatar = getResolvedAuthorPic(thread);
                    const authorId = thread.mentorId || thread.authorMentorId || thread.userId || thread.authorId || thread.user?._id || thread.user?.id;
                    const time = thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'Recent';
                    const rawTitle = safeStr(thread.title);
                    const rawContent = safeStr(thread.content);
                    const displayTitle = (rawTitle || rawContent || 'Discussion Topic').replace(/\n+/g, ' ');
                    const displaySnippet = rawContent ? rawContent.replace(/\n+/g, ' ') : '';
                    const replyCount = Number(thread.commentsCount ?? (Array.isArray(thread.comments) ? thread.comments.length : 0));
                    const likeCount = Number(thread.likesCount ?? (Array.isArray(thread.likedBy) ? thread.likedBy.length : 0));

                    const threadKey = String(thread._id || thread.id || thread.entryId || idx);
                    const isThreadLiked = !!likedDiscussionIds[threadKey] || !!thread.isLiked;
                    const totalItems = activeTab === 'discussions' ? filteredDiscussions.length : Math.min(filteredDiscussions.length, 6);

                    return (
                      <TouchableOpacity
                        key={threadKey}
                        onPress={() => handleOpenDiscussion(thread)}
                        activeOpacity={0.7}
                        style={{ borderBottomWidth: idx < totalItems - 1 ? 1 : 0, borderBottomColor: '#f5f0eb' }}
                        className="px-5 py-4"
                      >
                        <View className="flex-row items-center gap-3.5">
                          <TouchableOpacity
                            onPress={() => handleNavigateToMentorProfile(authorId)}
                            activeOpacity={0.7}
                            className="w-12 h-12 rounded-2xl bg-[#f5ede4] items-center justify-center shrink-0 overflow-hidden border border-[#e0d8cf]"
                          >
                            {authorAvatar ? (
                              <Image source={{ uri: authorAvatar }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                              <Text className="text-sm font-black text-[#7a5c3e]">{initialsFrom(author)}</Text>
                            )}
                          </TouchableOpacity>
                          <View className="flex-1 pr-2">
                            <Text className="text-sm font-black text-[#3c2a1e] leading-snug" numberOfLines={2}>
                              {displayTitle}
                            </Text>
                            {displaySnippet && displaySnippet !== displayTitle ? (
                              <Text className="text-xs text-[#6b5849] mt-1 leading-relaxed" numberOfLines={2}>
                                {displaySnippet}
                              </Text>
                            ) : null}
                            <View className="flex-row items-center gap-3 mt-2 flex-wrap">
                              <Text className="text-xs text-[#8a7a6a] font-medium">
                                by <Text className="font-bold text-[#4a3728]">{author}</Text> • {time}
                              </Text>
                              <View className="flex-row items-center gap-1 bg-[#f8f5f0] border border-[#ece4dc] px-2.5 py-1 rounded-full">
                                <MessageSquare size={12} color="#7a5c3e" />
                                <Text className="text-xs font-bold text-[#7a5c3e]">{replyCount}</Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleToggleLikeDiscussion(threadKey)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                className="flex-row items-center gap-1 bg-[#f8f5f0] border border-[#ece4dc] px-2.5 py-1 rounded-full"
                              >
                                <ThumbsUp
                                  size={12}
                                  color={isThreadLiked ? '#c9932a' : '#8a7a6a'}
                                  fill={isThreadLiked ? '#c9932a' : 'none'}
                                />
                                <Text
                                  style={{ color: isThreadLiked ? '#c9932a' : '#8a7a6a' }}
                                  className="text-xs font-bold"
                                >
                                  {likeCount}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <ChevronRight size={16} color="#8a7a6a" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {activeTab === 'all' && filteredDiscussions.length > 6 && (
                    <TouchableOpacity
                      onPress={() => setActiveTab('discussions')}
                      activeOpacity={0.7}
                      className="py-3.5 items-center justify-center border-t border-[#f0ebe4] bg-[#FAF8F5]"
                    >
                      <Text className="text-xs font-black text-[#7a5c3e]">
                        View all {filteredDiscussions.length} discussions →
                      </Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'discussions' && (
                    <TouchableOpacity
                      onPress={() => setActiveTab('all')}
                      activeOpacity={0.7}
                      className="py-4 items-center justify-center border-t border-[#f0ebe4] bg-[#FAF8F5] flex-row gap-2"
                    >
                      <ChevronLeft size={16} color="#7a5c3e" />
                      <Text className="text-xs font-black text-[#7a5c3e]">
                        Close View All & Return to Overview
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── 4. Top Mentors Leaderboard ── */}
          {(activeTab === 'all' || activeTab === 'mentors') && (
            <View className="bg-white rounded-3xl border border-[#e4dbd1] mb-5 overflow-hidden shadow-xs">
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#f0ebe4]">
                <View className="flex-row items-center gap-2.5">
                  <Award size={18} color="#c9932a" />
                  <Text className="text-base font-black text-[#4a3728]">Top Mentors</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveTab(activeTab === 'mentors' ? 'all' : 'mentors')}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
                    activeTab === 'mentors' ? 'bg-[#4a3728]' : 'bg-[#f5ede4] border border-[#e0d8cf]'
                  }`}
                >
                  {activeTab === 'mentors' ? (
                    <>
                      <X size={12} color="#ffffff" />
                      <Text className="text-xs font-bold text-white">Close View All</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-xs font-bold text-[#7a5c3e]">View All</Text>
                      <ArrowUpRight size={12} color="#7a5c3e" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {filteredMentors.length === 0 ? (
                <View className="p-8 items-center justify-center">
                  <Award size={28} color="#8a7a6a" />
                  <Text className="text-sm font-black text-[#4a3728] mt-2.5">No mentors found</Text>
                </View>
              ) : (
                <>
                  {(activeTab === 'mentors' ? filteredMentors : filteredMentors.slice(0, 6)).map((mentor: any, idx: number) => {
                    const mName = getResolvedAuthorName(mentor);
                    const mPic = getResolvedAuthorPic(mentor);
                    const mentorProfileId = mentor.mentorId || mentor._id || mentor.userId || mentor.user?._id || mentor.user?.id;
                    const rawDomain = Array.isArray(mentor.domains) && mentor.domains.length > 0
                      ? mentor.domains[0]
                      : (mentor.experience?.currentRole || mentor.domain || 'Expert Mentor');
                    const domain = safeStr(rawDomain, 'Expert Mentor').replace(/_/g, ' ');

                    // Dynamic rating resolution (no mock fallback)
                    const rawRating =
                      mentor.stats?.averageRating ??
                      mentor.averageRating ??
                      mentor.rating ??
                      mentor.stats?.rating ??
                      mentor.ratings?.average ??
                      mentor.score;
                    const numericRating = typeof rawRating === 'number' && !isNaN(rawRating) && rawRating > 0
                      ? rawRating
                      : (typeof rawRating === 'string' && parseFloat(rawRating) > 0 ? parseFloat(rawRating) : 0);

                    const totalReviews = Number(
                      mentor.stats?.totalReviews ??
                      mentor.totalReviews ??
                      mentor.reviewsCount ??
                      mentor.stats?.reviewsCount ??
                      mentor.reviews?.length ??
                      0
                    );

                    const sessionCount = Number(
                      mentor.stats?.totalSessions ??
                      mentor.totalSessions ??
                      mentor.sessionsCount ??
                      mentor.sessions ??
                      0
                    );
                    const totalItems = activeTab === 'mentors' ? filteredMentors.length : Math.min(filteredMentors.length, 6);

                    return (
                      <TouchableOpacity
                        key={`top-mentor-${mentor._id || mentor.mentorId || 'm'}-${idx}`}
                        onPress={() => handleNavigateToMentorProfile(mentorProfileId)}
                        activeOpacity={0.7}
                        style={{ borderBottomWidth: idx < totalItems - 1 ? 1 : 0, borderBottomColor: '#f5f0eb' }}
                        className="flex-row items-center gap-3.5 px-5 py-4"
                      >
                        <View className="w-12 h-12 rounded-2xl bg-[#4a3728] items-center justify-center overflow-hidden border border-[#d4c4b5] shadow-xs">
                          {mPic ? (
                            <Image source={{ uri: mPic }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <Text className="text-sm font-black text-white">{initialsFrom(mName)}</Text>
                          )}
                        </View>
                        <View className="flex-1 pr-2">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-sm font-black text-[#4a3728]">{mName}</Text>
                            <ArrowUpRight size={12} color="#8a7a6a" />
                          </View>
                          <Text className="text-xs text-[#7a5c3e] font-semibold mt-0.5 capitalize">
                            {domain} • {sessionCount > 0 ? `${sessionCount} sessions` : 'Active mentor'}{totalReviews > 0 ? ` • ${totalReviews} reviews` : ''}
                          </Text>
                        </View>
                        {numericRating > 0 ? (
                          <View className="flex-row items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
                            <Star size={12} color="#d97706" fill="#d97706" />
                            <Text className="text-xs font-black text-amber-800">{numericRating.toFixed(1)}</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center gap-1.5 bg-[#f5ede4] px-3 py-1.5 rounded-2xl border border-[#e4dbd1]">
                            <Star size={12} color="#8a7a6a" fill="none" />
                            <Text className="text-xs font-bold text-[#7a5c3e]">New</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {activeTab === 'all' && filteredMentors.length > 6 && (
                    <TouchableOpacity
                      onPress={() => setActiveTab('mentors')}
                      activeOpacity={0.7}
                      className="py-3.5 items-center justify-center border-t border-[#f0ebe4] bg-[#FAF8F5]"
                    >
                      <Text className="text-xs font-black text-[#7a5c3e]">
                        View all {filteredMentors.length} mentors →
                      </Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'mentors' && (
                    <TouchableOpacity
                      onPress={() => setActiveTab('all')}
                      activeOpacity={0.7}
                      className="py-4 items-center justify-center border-t border-[#f0ebe4] bg-[#FAF8F5] flex-row gap-2"
                    >
                      <ChevronLeft size={16} color="#7a5c3e" />
                      <Text className="text-xs font-black text-[#7a5c3e]">
                        Close View All & Return to Overview
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── 5. Upcoming Community Masterclasses / Events ── */}
          {(activeTab === 'all' || activeTab === 'events') && (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-3.5 px-1">
                <View className="flex-row items-center gap-2.5">
                  <Calendar size={18} color="#7a5c3e" />
                  <Text className="text-base font-black text-[#4a3728]">Upcoming Community Events</Text>
                </View>
                <Text className="text-xs font-bold text-[#8a7a6a]">
                  {filteredEvents.length} scheduled
                </Text>
              </View>

              {filteredEvents.length === 0 ? (
                <View className="bg-white rounded-3xl p-8 border border-[#e4dbd1] shadow-xs items-center justify-center">
                  <Calendar size={28} color="#8a7a6a" />
                  <Text className="text-sm font-black text-[#4a3728] mt-2.5">No community events scheduled</Text>
                  <Text className="text-xs text-[#8a7a6a] mt-1">Stay tuned for upcoming workshops & meetups.</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  {filteredEvents.map((ev: any, idx: number) => {
                    const attendees = Array.isArray(ev.attendees) ? ev.attendees : (Array.isArray(ev.participants) ? ev.participants : []);
                    const count = ev.currentParticipants ?? attendees.length ?? 0;
                    const isEventExpired = ev.scheduledAt ? new Date(ev.scheduledAt).getTime() < Date.now() : false;
                    const dateFormatted = ev.scheduledAt
                      ? new Date(ev.scheduledAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Upcoming';
                    const isJoining = joiningEventId === (ev._id || ev.sessionId || ev.id);

                    return (
                      <View
                        key={ev._id || ev.sessionId || ev.id || idx}
                        style={{ width: 260, marginRight: 14 }}
                        className={`bg-white rounded-3xl border border-[#e4dbd1] p-5 shadow-xs justify-between ${
                          isEventExpired ? 'opacity-70' : ''
                        }`}
                      >
                        <View>
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="w-10 h-10 rounded-2xl bg-[#f5ede4] items-center justify-center">
                              <Calendar size={18} color="#7a5c3e" />
                            </View>
                            {isEventExpired ? (
                              <View className="bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                <Text className="text-xs font-bold text-rose-700">Expired</Text>
                              </View>
                            ) : (
                              <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <Text className="text-xs font-bold text-emerald-700">Open</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-sm font-black text-[#3c2a1e] mb-1.5" numberOfLines={2}>
                            {safeStr(ev.title || ev.topic, 'Masterclass')}
                          </Text>
                          <Text className="text-xs text-[#8a7a6a] mb-2.5 font-medium">{dateFormatted}</Text>
                          <View className="flex-row items-center gap-1.5 mb-3.5">
                            <Users size={13} color="#c9932a" />
                            <Text className="text-xs font-bold text-[#c9932a]">
                              {count} attending
                            </Text>
                          </View>
                        </View>

                        {isEventExpired ? (
                          <View className="bg-[#f5ede4] py-3 rounded-2xl items-center border border-[#e4dbd1]">
                            <Text className="text-[#8a7a6a] text-xs font-bold">Event Ended</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleJoinEvent(ev)}
                            disabled={isJoining}
                            className="bg-[#4a3728] py-3 rounded-2xl items-center shadow-xs"
                          >
                            {isJoining ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text className="text-white text-xs font-black">Join Event</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* ── 6. Quick Links ── */}
          <View className="bg-white rounded-3xl border border-[#e4dbd1] p-5 shadow-xs mb-5">
            <Text className="text-sm font-black text-[#4a3728] mb-3.5">Quick Resources</Text>
            <View className="flex-row gap-3">
              {[
                { icon: Award, label: 'Senior Mentor', page: 'senior-mentor' },
                { icon: Megaphone, label: 'Marketing Kit', page: 'marketing' },
                { icon: ShieldCheck, label: 'Trust Score', page: 'trust' },
              ].map(({ icon: IconComp, label, page }) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => setActivePage && setActivePage(page)}
                  activeOpacity={0.7}
                  className="flex-1 items-center gap-2 bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl py-3.5"
                >
                  <IconComp size={18} color="#7a5c3e" />
                  <Text className="text-xs font-bold text-[#4a3728]">{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── 7. Discussion Detail Modal with Live Replies & Likes ── */}
      <Modal
        visible={!!selectedDiscussion}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDiscussion(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setSelectedDiscussion(null)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 22, maxHeight: '88%' }}>
            <View style={{ width: 48, height: 5, backgroundColor: '#d4c4b5', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />

            {/* Author Row */}
            <View className="flex-row items-center justify-between mb-3.5">
              <TouchableOpacity
                onPress={() => handleNavigateToMentorProfile(selectedDiscussion?.authorId)}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 flex-1 pr-2"
              >
                {selectedDiscussion?.authorAvatar ? (
                  <Image
                    source={{ uri: selectedDiscussion.authorAvatar }}
                    className="w-12 h-12 rounded-2xl border border-[#d4c4b5]"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-2xl bg-[#f5ede4] items-center justify-center border border-[#d4c4b5]">
                    <Text className="text-sm font-black text-[#7a5c3e]">
                      {initialsFrom(selectedDiscussion?.author || 'M')}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>
                      {selectedDiscussion?.author || 'Community Member'}
                    </Text>
                    <ArrowUpRight size={13} color="#7a5c3e" />
                  </View>
                  <Text className="text-xs text-[#8a7a6a] mt-0.5">
                    {selectedDiscussion?.createdAt || 'Recent discussion'} • View Profile
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedDiscussion(null)} className="p-1">
                <X size={22} color="#7a5c3e" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[380px]">
              {/* Topic & Content */}
              <Text className="text-lg font-black text-[#3c2a1e] mb-2 leading-tight">
                {selectedDiscussion?.title || 'Discussion Topic'}
              </Text>
              <Text className="text-sm text-[#5c4a3d] leading-relaxed mb-4">
                {selectedDiscussion?.content || 'No additional details provided.'}
              </Text>

              {/* Interaction Action Bar */}
              <View className="flex-row items-center gap-3 py-3 border-t border-b border-[#f5ede4] mb-4">
                <TouchableOpacity
                  onPress={() => selectedDiscussion && handleToggleLikeDiscussion(selectedDiscussion.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-2 py-2 px-4 rounded-2xl bg-[#FAF8F5] border border-[#e4dbd1]"
                >
                  <ThumbsUp
                    size={14}
                    color={selectedDiscussion?.isLiked ? '#c9932a' : '#7a5c3e'}
                    fill={selectedDiscussion?.isLiked ? '#c9932a' : 'none'}
                  />
                  <Text
                    style={{ color: selectedDiscussion?.isLiked ? '#c9932a' : '#7a5c3e' }}
                    className="text-xs font-black"
                  >
                    {selectedDiscussion?.likesCount ?? 0} Likes
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center gap-2 py-2 px-4 rounded-2xl bg-[#FAF8F5] border border-[#e4dbd1]">
                  <MessageSquare size={14} color="#7a5c3e" />
                  <Text className="text-xs font-black text-[#7a5c3e]">
                    {selectedDiscussion?.commentsCount ?? 0} Replies
                  </Text>
                </View>
              </View>

              {/* Replies Stream */}
              <View className="mb-2">
                <Text className="text-sm font-black text-[#4a3728] mb-3">
                  Replies & Insights ({discussionComments.length})
                </Text>
                {loadingComments ? (
                  <View className="py-5 items-center justify-center">
                    <ActivityIndicator size="small" color="#4a3728" />
                  </View>
                ) : discussionComments.length === 0 ? (
                  <View className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#ece4dc] items-center">
                    <MessageCircle size={24} color="#8a7a6a" />
                    <Text className="text-xs text-[#8a7a6a] mt-2 text-center">
                      No replies yet. Be the first mentor to share your thoughts!
                    </Text>
                  </View>
                ) : (
                  <View className="gap-y-2.5">
                    {discussionComments.map((c: any, cIdx: number) => {
                      const commenterName = safeStr(
                        c.commenter?.fullName || c.commenter?.firstName || c.authorName || c.author?.fullName || c.user?.fullName || c.user || 'Peer Mentor'
                      );
                      const commenterAvatar =
                        getResolvedAuthorPic(c) ||
                        getResolvedAuthorPic(c.commenter) ||
                        getResolvedAuthorPic(c.user) ||
                        getResolvedAuthorPic(c.author);
                      const commenterId =
                        c.mentorId ||
                        c.commenter?.mentorId ||
                        c.authorMentorId ||
                        c.userId ||
                        c.authorId ||
                        c.commenter?._id ||
                        c.commenter?.id ||
                        c.user?._id ||
                        c.user?.id;
                      const commentTime = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now';

                      return (
                        <View
                          key={c._id || c.id || cIdx}
                          className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#ece4dc]"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <TouchableOpacity
                              onPress={() => handleNavigateToMentorProfile(commenterId)}
                              activeOpacity={0.7}
                              className="flex-row items-center gap-2.5"
                            >
                              {commenterAvatar ? (
                                <Image
                                  source={{ uri: commenterAvatar }}
                                  className="w-7 h-7 rounded-full border border-[#d4c4b5]"
                                />
                              ) : (
                                <View className="w-7 h-7 rounded-full bg-[#e4dbd1] items-center justify-center">
                                  <Text className="text-[9px] font-black text-[#4a3728]">
                                    {initialsFrom(commenterName)}
                                  </Text>
                                </View>
                              )}
                              <View className="flex-row items-center gap-1">
                                <Text className="text-xs font-black text-[#4a3728]">{commenterName}</Text>
                                <ArrowUpRight size={11} color="#7a5c3e" />
                              </View>
                            </TouchableOpacity>
                            <Text className="text-[10px] text-[#8a7a6a] font-medium">{commentTime}</Text>
                          </View>
                          <Text className="text-xs text-[#5c4a3d] leading-5 pl-9.5">{c.content || c.text || ''}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Reply Input Bar with Replier Avatar */}
            <View className="flex-row items-center gap-2.5 pt-3.5 border-t border-[#f5ede4]">
              {(() => {
                const currentPic =
                  mentorData?.profilePic ||
                  mentorData?.profilePhotoUrl ||
                  mentorData?.profileImage ||
                  mentorData?.avatar ||
                  mentorData?.user?.profileImage ||
                  mentorData?.user?.profilePhoto ||
                  mentorData?.user?.avatar ||
                  mentorData?.user?.profilePhotoUrl;
                const currentName =
                  mentorData?.user?.fullName ||
                  `${mentorData?.user?.firstName || ''} ${mentorData?.user?.lastName || ''}`.trim() ||
                  mentorData?.name ||
                  mentorData?.title ||
                  'You';
                return (
                  <View className="w-9 h-9 rounded-2xl bg-[#4a3728] items-center justify-center overflow-hidden border border-[#d4c4b5] shrink-0">
                    {currentPic ? (
                      <Image source={{ uri: currentPic }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-xs font-bold text-white">{initialsFrom(currentName)}</Text>
                    )}
                  </View>
                );
              })()}
              <TextInput
                value={newReplyText}
                onChangeText={setNewReplyText}
                placeholder="Write your mentoring reply..."
                placeholderTextColor="#b0a090"
                className="flex-1 bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#3c2a1e] font-medium"
              />
              <TouchableOpacity
                onPress={handleSubmitReply}
                disabled={submittingReply || !newReplyText.trim()}
                className={`w-11 h-11 bg-[#4a3728] rounded-2xl items-center justify-center shadow-xs ${
                  submittingReply || !newReplyText.trim() ? 'opacity-50' : ''
                }`}
              >
                {submittingReply ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── 8. New Discussion Modal ── */}
      <Modal visible={newPostVisible} animationType="slide" transparent onRequestClose={() => setNewPostVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setNewPostVisible(false)} />
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '88%' }}>
            <View style={{ width: 48, height: 5, backgroundColor: '#d4c4b5', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-lg font-black text-[#4a3728]">New Mentor Discussion</Text>
                <Text className="text-xs text-[#8a7a6a] mt-0.5">Share insights or questions with peers</Text>
              </View>
              <TouchableOpacity onPress={() => setNewPostVisible(false)} className="p-1">
                <X size={22} color="#7a5c3e" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text className="text-xs sm:text-sm font-black text-[#4a3728] mb-2">Topic / Question Title *</Text>
              <TextInput
                value={postTitle}
                onChangeText={setPostTitle}
                placeholder="e.g., Best strategy for handling 1:1 prep?"
                placeholderTextColor="#b0a090"
                className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-4 text-xs sm:text-sm text-[#4a3728] mb-4 font-medium"
              />

              {/* Category */}
              <Text className="text-xs sm:text-sm font-black text-[#4a3728] mb-2">Category</Text>
              <View className="mb-4">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  {DISCUSSION_CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                    const isSelected = postCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setPostCategory(cat)}
                        style={
                          isSelected
                            ? { backgroundColor: '#4a3728', borderColor: '#4a3728' }
                            : { backgroundColor: '#FAF8F5', borderColor: '#d4c4b5' }
                        }
                        className="px-4 py-2 rounded-2xl mr-2.5 border"
                      >
                        <Text style={{ color: isSelected ? '#ffffff' : '#7a5c3e' }} className="text-xs font-black">
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Content */}
              <Text className="text-xs sm:text-sm font-black text-[#4a3728] mb-2">Discussion Content *</Text>
              <TextInput
                value={postContent}
                onChangeText={setPostContent}
                placeholder="Write your thoughts or details for the community..."
                placeholderTextColor="#b0a090"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-[#FAF8F5] border border-[#d4c4b5] rounded-2xl p-4 text-xs sm:text-sm text-[#4a3728] mb-5 min-h-[110px] font-medium"
              />

              <View className="flex-row gap-3 pb-4">
                <TouchableOpacity
                  onPress={() => setNewPostVisible(false)}
                  disabled={posting}
                  className="flex-1 py-4 rounded-2xl border border-[#d4c4b5] items-center bg-[#FAF8F5]"
                >
                  <Text className="text-xs sm:text-sm font-black text-[#7a5c3e]">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateDiscussion}
                  disabled={posting || (!postTitle.trim() && !postContent.trim())}
                  className={`flex-1 py-4 rounded-2xl bg-[#4a3728] items-center shadow-xs ${
                    posting || (!postTitle.trim() && !postContent.trim()) ? 'opacity-60' : ''
                  }`}
                >
                  {posting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-xs sm:text-sm font-black text-white">Publish Discussion</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ─── MENTOR PROFILE CONTAINER ─────────────────────────────────────────────────
const MentorProfileContainer: React.FC<{
  mentorData: any;
  onEditProfessionalProfile?: () => void;
}> = ({ mentorData, onEditProfessionalProfile }) => {
  return <MentorProfile mentor={mentorData} onEditProfessionalProfile={onEditProfessionalProfile} />;
};

const SeniorMentorPage: React.FC<{ mentorData?: any }> = () => {
  return <SeniorMentorApplicationScreen isEmbedded />;
};

// ─── PAGE MAP ─────────────────────────────────────────────────────────────────
const PAGE_MAP: Record<string, React.FC<any>> = {
  dashboard: DashboardOverviewPage,
  profile: MentorProfileContainer,
  services: ServicesPage,
  booking: BookingsPage,
  queries: QueriesPage,
  availability: AvailabilityPage,
  payment: PaymentsPage,
  review: ReviewsPage,
  analytics: AnalyticsPage,
  marketing: MarketingKitPage,
  plans: PlansPage,
  trust: TrustScorePage,
  community: CommunityPage,
  notification: NotificationPage,
  'senior-mentor': SeniorMentorPage,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MENTOR DASHBOARD SCREEN (WITH HAMBURGER SIDE DRAWER)
// ─────────────────────────────────────────────────────────────────────────────
export const MentorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activePage, setActivePage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mentorData, setMentorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drawer Animation Values
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editableProfessionalData, setEditableProfessionalData] = useState<any>({});
  const [professionalValidationErrors, setProfessionalValidationErrors] = useState<Record<string, string>>({});
  const [isProfessionalSaving, setIsProfessionalSaving] = useState(false);

  const handleOpenUpdateModal = () => {
    if (!mentorData) return;
    setEditableProfessionalData({
      title: mentorData.title || mentorData.user?.fullName || '',
      bio: mentorData.bio || '',
      tagline: mentorData.tagline || '',
      currentRole: mentorData.experience?.currentRole || '',
      experienceTotal: mentorData.experience?.total || 5,
      domains: mentorData.domains || ['web_development', 'mobile_development'],
      skills: mentorData.skills || ['React Native'],
      linkedinUrl: mentorData.socialProof?.linkedinUrl || '',
      githubUrl: mentorData.socialProof?.githubUrl || '',
      portfolioUrl: mentorData.socialProof?.portfolioUrl || '',
      profilePic: mentorData.profilePic || mentorData.user?.profilePhotoId,
      bannerImage: mentorData.bannerImage || mentorData.coverPhoto,
    });
    setProfessionalValidationErrors({});
    setShowUpdateModal(true);
  };

  const handleProfileFieldChange = (field: string, value: any) => {
    setEditableProfessionalData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickImage = async (type: 'profile' | 'banner') => {
    try {
      const image = await ImagePicker.openPicker({
        width: type === 'profile' ? 400 : 800,
        height: type === 'profile' ? 400 : 400,
        cropping: true,
        cropperCircleOverlay: type === 'profile',
      });
      if (image && image.path) {
        setEditableProfessionalData((prev: any) => ({
          ...prev,
          [type === 'profile' ? 'profilePic' : 'bannerImage']: image.path,
          [type === 'profile' ? 'profilePicFile' : 'bannerImageFile']: {
            uri: image.path,
            type: image.mime || 'image/jpeg',
            name: image.path.split('/').pop() || `${type}.jpg`,
          },
        }));
      }
    } catch (e) {
      // User cancelled or error
    }
  };

  const handleSaveProfessionalProfile = async () => {
    if (!mentorData?._id && !mentorData?.mentorId) return;
    const id = mentorData._id || mentorData.mentorId;
    setIsProfessionalSaving(true);
    setProfessionalValidationErrors({});
    try {
      const payload: any = {
        title: editableProfessionalData.title,
        bio: editableProfessionalData.bio,
        tagline: editableProfessionalData.tagline,
        domains: editableProfessionalData.domains,
        skills: editableProfessionalData.skills,
        experience: {
          total: editableProfessionalData.experienceTotal,
          currentRole: editableProfessionalData.currentRole,
          level:
            editableProfessionalData.experienceTotal >= 8
              ? 'Senior'
              : editableProfessionalData.experienceTotal >= 3
              ? 'Mid'
              : 'Junior',
        },
        socialProof: {
          linkedinUrl: editableProfessionalData.linkedinUrl,
          githubUrl: editableProfessionalData.githubUrl,
          portfolioUrl: editableProfessionalData.portfolioUrl,
        },
      };
      if (editableProfessionalData.profilePicFile) {
        payload.profilePicFile = editableProfessionalData.profilePicFile;
      }
      if (editableProfessionalData.bannerImageFile) {
        payload.bannerImageFile = editableProfessionalData.bannerImageFile;
      }

      const updated = await MentorshipService.updateMentor(id, payload);
      setMentorData(updated || { ...mentorData, ...payload });
      setShowUpdateModal(false);
      Alert.alert('Success', 'Mentor profile updated successfully!');
      fetchMentorData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update mentor profile');
    } finally {
      setIsProfessionalSaving(false);
    }
  };

  const fetchMentorData = useCallback(async () => {
    try {
      const res = await MentorshipService.getMyMentor();
      const m = Array.isArray(res) ? res[0] : res;
      setMentorData(m);

      const mId = m?.mentorId || m?._id || m?.id;
      if (mId) {
        const [sRes, gsRes, rRes] = await Promise.allSettled([
          SessionService.getMentorSessions(mId),
          MentorshipService.getAllGroupSessions({ mentorId: mId }),
          ReviewService.getMentorReviews(mId),
        ]);

        let individualSessions: any[] = [];
        if (sRes.status === 'fulfilled' && sRes.value?.data) {
          individualSessions = Array.isArray(sRes.value.data) ? sRes.value.data : [];
        }

        let groupSessionsList: any[] = [];
        if (gsRes.status === 'fulfilled') {
          const gData = gsRes.value?.data || gsRes.value || [];
          const gArray = Array.isArray(gData) ? gData : gData.sessions || [];
          groupSessionsList = gArray.map((gs: any) => ({
            ...gs,
            isGroupSession: true,
            sessionId: gs._id || gs.sessionId,
            title: gs.title || gs.topic || 'Group Masterclass',
            sessionType: gs.sessionType || 'group_session',
            bookings: (gs.attendees || []).map((att: any, idx: number) => ({
              ...att,
              bookingId: att._id || `att-${gs._id}-${idx}`,
              menteeId: att.userId?._id || att.userId?.id || (typeof att.userId === 'string' ? att.userId : att._id),
              menteeName: att.user?.fullName || att.user?.name || att.fullName || att.name || (typeof att.userId === 'object' ? att.userId.fullName || att.userId.name : ''),
              menteeEmail: att.user?.email || att.email || (typeof att.userId === 'object' ? att.userId.email : ''),
              menteeProfilePhoto: att.user?.profilePic || att.avatar || att.profilePhoto || (typeof att.userId === 'object' ? att.userId.profilePic || att.userId.avatar : ''),
              status: att.status || gs.status || 'confirmed',
              scheduledAt: att.joinedAt || gs.startDate || gs.scheduledAt,
              duration: gs.duration || 60,
              pricing: gs.price !== undefined ? { basePrice: gs.price, totalAmount: gs.price } : gs.pricing,
            })),
          }));
        }

        const combined = [...individualSessions, ...groupSessionsList];

        // Enrich all sessions with real mentee user profiles
        const userIdsToEnrich = new Set<string>();
        combined.forEach((s: any) => {
          (s.bookings || []).forEach((b: any) => {
            const uid = getResolvedAuthorId(b.mentee || b.user || b.bookedBy || b) || b.bookedBy || b.menteeId;
            if (uid && typeof uid === 'string' && uid.length >= 8) userIdsToEnrich.add(uid);
          });
          (s.attendees || []).forEach((att: any) => {
            const uid = getResolvedAuthorId(att.user || att) || att.userId;
            if (uid && typeof uid === 'string' && uid.length >= 8) userIdsToEnrich.add(uid);
          });
          if (typeof s.bookedBy === 'string' && s.bookedBy.length >= 8) userIdsToEnrich.add(s.bookedBy);
          if (typeof s.menteeId === 'string' && s.menteeId.length >= 8) userIdsToEnrich.add(s.menteeId);
        });

        const idArray = Array.from(userIdsToEnrich).filter((id) => Boolean(id) && id.length >= 8);
        if (idArray.length > 0) {
          try {
            const profileResults = await Promise.allSettled(idArray.map((uid) => fetchMenteeProfile(uid)));
            const uMap: Record<string, any> = {};
            profileResults.forEach((res, idx) => {
              if (res.status === 'fulfilled' && res.value) {
                uMap[idArray[idx]] = res.value;
              }
            });

            combined.forEach((s: any) => {
              if (Array.isArray(s.bookings)) {
                s.bookings = s.bookings.map((b: any) => {
                  const uid = getResolvedAuthorId(b.mentee || b.user || b.bookedBy || b) || b.bookedBy || b.menteeId;
                  if (uid && uMap[uid]) {
                    const uObj = uMap[uid];
                    return {
                      ...b,
                      mentee: typeof b.mentee === 'object' && b.mentee !== null ? { ...uObj, ...b.mentee } : uObj,
                      user: typeof b.user === 'object' && b.user !== null ? { ...uObj, ...b.user } : uObj,
                      menteeName: uObj.name || b.menteeName,
                      menteeEmail: uObj.email || b.menteeEmail,
                      menteeProfilePhoto: uObj.avatar || b.menteeProfilePhoto,
                    };
                  }
                  return b;
                });
              }
              if (Array.isArray(s.attendees)) {
                s.attendees = s.attendees.map((att: any) => {
                  const uid = getResolvedAuthorId(att.user || att) || att.userId;
                  if (uid && uMap[uid]) {
                    const uObj = uMap[uid];
                    return {
                      ...att,
                      user: typeof att.user === 'object' && att.user !== null ? { ...uObj, ...att.user } : uObj,
                      fullName: uObj.name || att.fullName,
                      name: uObj.name || att.name,
                      email: uObj.email || att.email,
                      avatar: uObj.avatar || att.avatar,
                    };
                  }
                  return att;
                });
              }
              if (typeof s.bookedBy === 'string' && uMap[s.bookedBy]) {
                const uObj = uMap[s.bookedBy];
                s.mentee = uObj;
                s.bookedMenteeName = uObj.name;
                s.menteeName = uObj.name;
                s.menteeEmail = uObj.email;
                s.menteeProfilePhoto = uObj.avatar;
              }
            });
          } catch (enrichErr) {
            // Ignore enrichment errors gracefully
          }
        }

        setSessions(combined);

        if (rRes.status === 'fulfilled' && (rRes.value as any)?.data) {
          const valData = (rRes.value as any).data;
          const rData = Array.isArray(valData) ? valData : valData?.reviews || [];
          setReviews(rData);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMentorData();
  }, [fetchMentorData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentorData();
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_W, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, backdropAnim]);

  const selectMenuItem = useCallback((id: string) => {
    // Change page immediately so content is ready when drawer closes
    setActivePage(id);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_W, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, backdropAnim]);

  const CurrentPage = PAGE_MAP[activePage] || DashboardOverviewPage;
  const activeLabel = DASHBOARD_MENU_ITEMS.find((m) => m.id === activePage)?.label || 'Overview';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f7f3ee]">
      {/* Top Header Bar: 3-line Hamburger Menu on Left */}
      <View className="bg-[#FAF9F6] border-b border-[#d4c4b5] px-4 py-3.5 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity
            onPress={openDrawer}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-2xl bg-white border border-[#d4c4b5] items-center justify-center shadow-sm"
          >
            <Menu size={20} color="#4a3728" />
          </TouchableOpacity>
          <View>
            <Text className="text-base font-black text-[#4a3728]">{activeLabel}</Text>
            <Text className="text-[10px] font-bold text-[#8b7355] uppercase tracking-wider">
              {mentorData?.user?.fullName || mentorData?.title || 'Mentor Portal'}
            </Text>
          </View>
        </View>

        {/* Switch to Learner Mode */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UserDashboard')}
          className="bg-[#4a3728] px-3.5 py-1.5 rounded-full flex-row items-center gap-x-1 shadow-sm"
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-wider">Learner Mode</Text>
          <ArrowUpRight size={11} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content View */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-[#8a7a6a] mt-2.5 text-xs font-bold">Loading mentor dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a3728']} />}
          showsVerticalScrollIndicator={false}
        >
          <CurrentPage
            mentorData={mentorData}
            sessions={sessions}
            refreshSessions={fetchMentorData}
            setActivePage={setActivePage}
            reviews={reviews}
            loadingReviews={false}
            onEditProfessionalProfile={handleOpenUpdateModal}
          />
          <View className="h-10" />
        </ScrollView>
      )}

      {/* Edit Professional Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        mentorData={mentorData || {}}
        editableData={editableProfessionalData}
        validationErrors={professionalValidationErrors}
        onChange={handleProfileFieldChange}
        onSave={handleSaveProfessionalProfile}
        saving={isProfessionalSaving}
        profilePicUri={editableProfessionalData.profilePic}
        bannerImageUri={editableProfessionalData.bannerImage}
        onPickImage={handlePickImage}
      />

      {/* Side Drawer Modal — always mounted to avoid black flash on unmount */}
      <Modal transparent visible={drawerOpen} onRequestClose={closeDrawer} animationType="none">
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'transparent' }}>
          <Animated.View
            style={{
              width: DRAWER_W,
              transform: [{ translateX: slideAnim }],
              backgroundColor: '#fff',
              height: '100%',
              borderRightWidth: 1,
              borderRightColor: '#d4c4b5',
              zIndex: 20,
              shadowColor: '#000',
              shadowOffset: { width: 4, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
              {/* Profile Card Header in Drawer */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#d4c4b5', backgroundColor: '#FAF9F6' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  {(() => {
                    const drawerAvatar =
                      mentorData?.profilePic ||
                      mentorData?.profilePhotoUrl ||
                      mentorData?.profileImage ||
                      mentorData?.avatar ||
                      mentorData?.user?.profileImage ||
                      mentorData?.user?.profilePhoto ||
                      mentorData?.user?.profilePhotoUrl ||
                      mentorData?.user?.avatar;
                    return drawerAvatar && typeof drawerAvatar === 'string' && (drawerAvatar.startsWith('http') || drawerAvatar.startsWith('data:')) ? (
                      <Image
                        source={{ uri: drawerAvatar }}
                        style={{ width: 52, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#d4c4b5' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#4a3728', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>
                          {initialsFrom(mentorData?.user?.fullName || mentorData?.title || 'M')}
                        </Text>
                      </View>
                    );
                  })()}
                  <TouchableOpacity
                    onPress={closeDrawer}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d4c4b5', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={18} color="#7a5c3e" />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#4a3728' }}>
                  {mentorData?.user?.fullName || mentorData?.title || 'Mentor'}
                </Text>
                <View style={{ backgroundColor: '#f3ece4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#d4c4b5', alignSelf: 'flex-start', marginTop: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#7a5c3e', textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Mentor</Text>
                </View>
              </View>

              {/* Drawer Menu Items */}
              <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
                {DASHBOARD_MENU_ITEMS.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => selectMenuItem(item.id)}
                      activeOpacity={0.75}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 13,
                        borderRadius: 14,
                        marginBottom: 4,
                        backgroundColor: isActive ? '#4a3728' : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 20, marginRight: 14 }}>{item.icon}</Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: isActive ? '800' : '600',
                          color: isActive ? '#fff' : '#4a3728',
                          letterSpacing: 0.1,
                        }}
                      >
                        {item.label}
                      </Text>
                      {isActive && <ChevronRight size={16} color="#fff" />}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 24 }} />
              </ScrollView>
            </SafeAreaView>
          </Animated.View>

          {/* Backdrop */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: '#000',
              opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentorDashboardScreen;