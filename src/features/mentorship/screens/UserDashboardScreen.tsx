import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Bookmark,
  History,
  Clock,
  Star,
  Receipt,
  Bell,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Search,
  ArrowUpRight,
  CheckCircle,
  Video,
  CreditCard,
  Plus,
  ArrowRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import SessionService from '../../../services/session.service';
import MentorshipService from '../../../services/mentorship.service';
import NotificationService from '../../../services/notification.service';
import AIMentorshipService from '../../../services/ai-mentorship.service';
import ReviewService from '../../../services/review.service';
import WaitlistService from '../../../services/waitlist.service';
import { useAppSelector } from '../../../store/hooks';
import { useDispatch } from 'react-redux';
import { fetchMyProfile } from '../../../store/slices/profileSlice';
import WriteReviewModal from '../components/WriteReviewModal';

const { width: SW } = Dimensions.get('window');
const DRAWER_W = Math.min(SW * 0.82, 320);


const C = {
  primary: '#4a3728',
  primaryMid: '#6b5847',
  accent: '#d4a574',
  pageBg: '#f7f3ee',
  cardBg: '#FAF9F6',
  cardSurface: '#ffffff',
  border: '#e0d8cf',
  text: '#4a3728',
  textMuted: '#7a6756',
  textSubtle: '#9a8775',
  gold: '#c9932a',
};

const USER_MENU_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'recommended', label: 'Recommended Mentors', icon: Sparkles },
  { id: 'upcoming', label: 'Upcoming Sessions', icon: CalendarClock },
  { id: 'my-mentors', label: 'My Mentors', icon: Users },
  { id: 'bookings', label: 'My Bookings', icon: Bookmark },
  { id: 'payments', label: 'Payments & Transactions', icon: Receipt },
  { id: 'history', label: 'Session History', icon: History },
  { id: 'masterclasses', label: 'Group Masterclasses', icon: Users },
  { id: 'waitlist', label: 'Waitlist', icon: Clock },
  { id: 'reviews', label: 'Reviews & Feedback', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

function formatDateStr(iso?: string) {
  if (!iso) return 'Date not set';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Date not set';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTimeStr(iso?: string) {
  if (!iso) return 'Time not set';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Time not set';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function initialsFrom(name: string) {
  const parts = (name || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. OVERVIEW VIEW
// ─────────────────────────────────────────────────────────────────────────────
const OverviewView: React.FC<{
  sessions: any[];
  setActivePage: (p: string) => void;
  onExploreMentors: () => void;
  user: any;
}> = ({ sessions, setActivePage, onExploreMentors, user }) => {
  const upcoming = sessions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled');
  const completed = sessions.filter((s) => s.status === 'completed');
  const totalInvested = sessions.reduce((acc, s) => acc + (s.pricing?.totalAmount || s.price || 0), 0);

  const nextSession = upcoming[0] || null;

  return (
    <View style={{ gap: 22 }} className="pb-6">
      {/* 1. Learner Greeting Card */}
      <View className="bg-[#4a3728] rounded-3xl p-5 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 pr-2">
            <Text className="text-white text-xl font-black tracking-tight">
              Hi, {user?.firstName || 'Learner'} 👋
            </Text>
            <Text className="text-white/80 text-xs font-medium mt-1 leading-4">
              Welcome to your 1:1 learning and mentorship dashboard.
            </Text>
          </View>
          <View className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
            <Sparkles size={22} color="#d4a574" />
          </View>
        </View>

        {/* 3-Column Metrics */}
        <View className="flex-row gap-2.5 mt-2 pt-3.5 border-t border-white/15">
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <Text className="text-white text-lg font-black">{upcoming.length}</Text>
            <Text className="text-white/70 text-[10px] font-bold uppercase mt-0.5">Upcoming</Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <Text className="text-white text-lg font-black">{completed.length}</Text>
            <Text className="text-white/70 text-[10px] font-bold uppercase mt-0.5">Completed</Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-2xl p-3 items-center">
            <Text className="text-[#d4a574] text-lg font-black">₹{totalInvested.toLocaleString()}</Text>
            <Text className="text-white/70 text-[10px] font-bold uppercase mt-0.5">Invested</Text>
          </View>
        </View>
      </View>

      {/* 2. Featured Next Session (Schedule Section) */}
      {nextSession && (
        <View className="bg-white rounded-3xl p-5 border border-[#e0d8cf] shadow-sm">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-x-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <Text className="text-xs font-black uppercase tracking-wider text-[#4a3728]">
                Next Scheduled Call
              </Text>
            </View>
            <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Text className="text-[10px] font-bold text-emerald-700">Confirmed</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-x-3 mb-4">
            <View className="w-12 h-12 rounded-2xl bg-[#4a3728] items-center justify-center">
              <Text className="text-white font-black text-sm">
                {initialsFrom(nextSession.mentorName || 'Mentor')}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-[#4a3728]">
                {nextSession.mentorName || 'Mentor Call'}
              </Text>
              <Text className="text-xs text-[#7a6756] mt-0.5" numberOfLines={1}>
                {nextSession.title || nextSession.sessionType || '1:1 Mentorship'}
              </Text>
            </View>
          </View>

          <View className="bg-[#fbf7f3] p-3.5 rounded-2xl border border-[#e0d8cf] flex-row justify-between mb-4">
            <View className="flex-row items-center gap-x-1.5">
              <Clock size={14} color="#7a5c3e" />
              <Text className="text-xs font-bold text-[#4a3728]">
                {formatDateStr(nextSession.startTime || nextSession.scheduledAt)}
              </Text>
            </View>
            <View className="flex-row items-center gap-x-1.5">
              <Clock size={14} color="#7a5c3e" />
              <Text className="text-xs font-bold text-[#4a3728]">
                {formatTimeStr(nextSession.startTime || nextSession.scheduledAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Join Call', 'Launching video room...')}
            activeOpacity={0.85}
            className="w-full bg-[#4a3728] py-3.5 rounded-2xl flex-row items-center justify-center gap-x-2 shadow-sm"
          >
            <Video size={16} color="#fff" />
            <Text className="text-white font-bold text-xs">Join Video Call</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Quick Action Chips */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onExploreMentors}
          activeOpacity={0.8}
          className="flex-1 bg-white p-4 rounded-3xl border border-[#e0d8cf] items-center shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-[#f3ece4] items-center justify-center mb-2.5">
            <Search size={20} color="#4a3728" />
          </View>
          <Text className="text-xs font-black text-[#4a3728]">Find Mentor</Text>
          <Text className="text-[10px] text-[#8a7a6a] mt-0.5">Explore 1:1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActivePage('masterclasses')}
          activeOpacity={0.8}
          className="flex-1 bg-white p-4 rounded-3xl border border-[#e0d8cf] items-center shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-[#f3ece4] items-center justify-center mb-2.5">
            <Users size={20} color="#7a5c3e" />
          </View>
          <Text className="text-xs font-black text-[#4a3728]">Masterclasses</Text>
          <Text className="text-[10px] text-[#8a7a6a] mt-0.5">Live Cohorts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActivePage('recommended')}
          activeOpacity={0.8}
          className="flex-1 bg-white p-4 rounded-3xl border border-[#e0d8cf] items-center shadow-sm"
        >
          <View className="w-11 h-11 rounded-2xl bg-[#f3ece4] items-center justify-center mb-2.5">
            <Sparkles size={20} color="#d4a574" />
          </View>
          <Text className="text-xs font-black text-[#4a3728]">Matches</Text>
          <Text className="text-[10px] text-[#8a7a6a] mt-0.5">AI Top Picks</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Recent Sessions List Preview */}
      <View className="bg-white rounded-3xl p-5 border border-[#e0d8cf] shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sm font-black text-[#4a3728]">Your Sessions</Text>
          <TouchableOpacity onPress={() => setActivePage('upcoming')}>
            <Text className="text-xs font-bold text-[#7a5c3e]">View All →</Text>
          </TouchableOpacity>
        </View>

        {sessions.length === 0 ? (
          <View className="bg-[#fbf7f3] p-6 rounded-2xl border border-[#e0d8cf] items-center">
            <CalendarClock size={28} color="#c0b0a0" />
            <Text className="text-xs font-bold text-[#8a7a6a] mt-2">No booked sessions yet</Text>
            <TouchableOpacity
              onPress={onExploreMentors}
              className="mt-3 bg-[#4a3728] px-5 py-2.5 rounded-full"
            >
              <Text className="text-white text-xs font-bold">Book Your First Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-y-3">
            {sessions.slice(0, 3).map((s, idx) => (
              <View
                key={`overview-${s.isGroup ? 'grp' : 'ses'}-${s._id || s.sessionId || idx}`}
                className="bg-[#fbf7f3] p-3.5 rounded-2xl border border-[#e0d8cf] flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-x-3 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-[#4a3728] items-center justify-center">
                    <Text className="text-white font-bold text-xs">
                      {initialsFrom(s.mentorName || 'M')}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-black text-[#4a3728]" numberOfLines={1}>
                      {s.mentorName || 'Mentor Call'}
                    </Text>
                    <Text className="text-[10px] text-[#8a7a6a] mt-0.5" numberOfLines={1}>
                      {formatDateStr(s.startTime || s.scheduledAt)} • {s.title || '1:1 Call'}
                    </Text>
                  </View>
                </View>
                <View className="bg-[#f3ece4] px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-[#7a5c3e] uppercase">
                    {s.status || 'Active'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. RECOMMENDED MENTORS VIEW (AI & VERIFIED DISCOVERY)
// ─────────────────────────────────────────────────────────────────────────────
const RecommendedMentorsView: React.FC<{
  onSelectMentor: (mentorId: string) => void;
}> = ({ onSelectMentor }) => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await MentorshipService.getAllMentors({ limit: 20 }).catch(async () => {
          return await AIMentorshipService.getTopRated(15);
        });
        const data = res?.data || res || [];
        const rawList = Array.isArray(data) ? data : (Array.isArray(data?.mentors) ? data.mentors : []);
        const seenIds = new Set<string>();
        const list = rawList.filter((m: any) => {
          const id = String(m.mentorId || m._id || m.id || '');
          if (!id) return true;
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });
        if (isMounted) setMentors(list);
      } catch (e) {
        if (isMounted) setMentors([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="py-16 items-center justify-center">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-xs text-[#8a7a6a] mt-3 font-bold">Curating top AI-matched mentors...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Recommended Mentors</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Verified industry experts matched to accelerate your career
        </Text>
      </View>

      {mentors.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Sparkles size={36} color="#c0b0a0" />
          <Text className="text-base font-bold text-[#4a3728] mt-3">No mentors found</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1">Please check back soon for new mentor additions.</Text>
        </View>
      ) : (
        mentors.map((m, idx) => {
          const name = m.name || m.user?.fullName || (m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}`.trim() : '') || 'Mentor';
          const role = m.experience?.currentRole || m.title || 'Senior Software Engineer';
          const company = m.experience?.company || m.company || '';
          const rating = m.stats?.averageRating || m.rating || 5.0;
          const sessionsCount = m.stats?.totalSessions || m.totalSessions || 0;
          const photo = m.profilePic || m.user?.profileImage || m.profilePhoto;
          const mentorId = m.mentorId || m._id || m.id;
          const matchScore = m.matchScore || (m.trustScore ? Math.min(99, Math.round(m.trustScore * 10)) : Math.min(99, 98 - (idx % 6)));

          return (
            <View
              key={`rec-mentor-${mentorId || 'item'}-${idx}`}
              className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm"
            >
              <View className="flex-row items-center gap-x-3.5 mb-3.5">
                {photo ? (
                  <Image source={{ uri: photo }} className="w-14 h-14 rounded-2xl border border-[#e0d8cf]" />
                ) : (
                  <View className="w-14 h-14 rounded-2xl bg-[#4a3728] items-center justify-center">
                    <Text className="text-white font-black text-lg">{initialsFrom(name)}</Text>
                  </View>
                )}
                <View className="flex-1 min-w-0 pr-1">
                  <View className="flex-row items-center justify-between gap-x-2">
                    <Text className="text-base font-black text-[#4a3728] flex-1" numberOfLines={1}>{name}</Text>
                    <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex-row items-center gap-1 flex-shrink-0">
                      <Sparkles size={10} color="#15803d" />
                      <Text className="text-[10px] font-black text-emerald-800">{matchScore}% Match</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#7a5c3e] font-semibold mt-0.5" numberOfLines={1}>
                    {role}{company ? ` @ ${company}` : ''}
                  </Text>
                  <View className="flex-row items-center gap-x-1.5 mt-1.5">
                    <Star size={12} color="#c9932a" fill="#c9932a" />
                    <Text className="text-xs font-bold text-[#4a3728]">{Number(rating).toFixed(1)}</Text>
                    <Text className="text-xs text-[#8a7a6a]">({sessionsCount} sessions)</Text>
                  </View>
                </View>
              </View>

              {Array.isArray(m.skills) && m.skills.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mb-4">
                  {m.skills.slice(0, 4).map((sk: string, i: number) => (
                    <View key={i} className="bg-[#f3ece4] px-3 py-1 rounded-full">
                      <Text className="text-[11px] font-bold text-[#7a5c3e]">{sk}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={() => onSelectMentor(mentorId)}
                activeOpacity={0.85}
                className="w-full bg-[#4a3728] py-3.5 rounded-2xl flex-row items-center justify-center gap-x-2 shadow-sm"
              >
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Book 1:1 Session</Text>
                <ArrowRight size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 3. UPCOMING SESSIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const UpcomingSessionsView: React.FC<{
  sessions: any[];
  onJoinSession: (sessionId: string) => void;
}> = ({ sessions, onJoinSession }) => {
  const upcoming = sessions.filter((s) => s.status !== 'completed' && s.status !== 'cancelled');

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Upcoming Sessions</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Your scheduled calls and live cohort masterclasses
        </Text>
      </View>

      {upcoming.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <CalendarClock size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">No upcoming sessions</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1 max-w-xs leading-5">
            You don't have any pending or confirmed sessions right now. Book a 1:1 call with a mentor to get started!
          </Text>
        </View>
      ) : (
        upcoming.map((s, idx) => {
          const name = s.mentorName || s.mentor?.fullName || (s.mentor?.user?.firstName ? `${s.mentor.user.firstName} ${s.mentor.user.lastName || ''}`.trim() : '') || 'Mentor Call';
          const sid = s.sessionId || s._id || s.id;
          const status = s.status || 'confirmed';

          return (
            <View key={`upcoming-${s.isGroup ? 'grp' : 'ses'}-${sid || idx}`} className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
              <View className="flex-row justify-between items-start mb-3.5 gap-x-2">
                <View className="flex-1 min-w-0 pr-2">
                  <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>{name}</Text>
                  <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>
                    {s.title || s.sessionType || '1:1 Mentorship Session'}
                  </Text>
                </View>
                <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                  <Text className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                    {status}
                  </Text>
                </View>
              </View>

              <View className="bg-[#fbf7f3] p-3.5 rounded-2xl border border-[#e0d8cf] flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-x-2">
                  <Clock size={15} color="#7a5c3e" />
                  <Text className="text-xs font-bold text-[#4a3728]">
                    {formatDateStr(s.startTime || s.scheduledAt)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <Clock size={15} color="#7a5c3e" />
                  <Text className="text-xs font-bold text-[#4a3728]">
                    {formatTimeStr(s.startTime || s.scheduledAt)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => onJoinSession(sid)}
                activeOpacity={0.85}
                className="w-full bg-[#4a3728] py-3.5 rounded-2xl flex-row items-center justify-center gap-x-2 shadow-sm"
              >
                <Video size={16} color="#fff" />
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Join Video Session</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MY MENTORS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const MyMentorsView: React.FC<{
  sessions: any[];
  onSelectMentor: (mentorId: string) => void;
}> = ({ sessions, onSelectMentor }) => {
  const mentorsMap = useMemo(() => {
    const map: Record<string, any> = {};
    sessions.forEach((s) => {
      const mid = s.mentorId || s.mentor?.mentorId || s.mentor?._id;
      if (mid && !map[mid]) {
        map[mid] = {
          mentorId: mid,
          name: s.mentorName || s.mentor?.fullName || (s.mentor?.user?.firstName ? `${s.mentor.user.firstName} ${s.mentor.user.lastName || ''}`.trim() : '') || 'Mentor',
          photo: s.mentorProfilePhoto || s.mentor?.profilePic || s.mentor?.user?.profileImage,
          role: s.mentorJobTitle || s.mentor?.experience?.currentRole || s.mentor?.title || 'Verified Mentor',
          totalSessions: 1,
        };
      } else if (mid && map[mid]) {
        map[mid].totalSessions += 1;
      }
    });
    return Object.values(map);
  }, [sessions]);

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">My Mentors ({mentorsMap.length})</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Mentors you have booked sessions with
        </Text>
      </View>

      {mentorsMap.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Users size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">No mentors connected yet</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1 max-w-xs leading-5">
            When you book sessions, your mentors will be saved here for easy 1-tap rebooking.
          </Text>
        </View>
      ) : (
        mentorsMap.map((m, idx) => (
          <View key={`my-mentor-${m.mentorId || 'item'}-${idx}`} className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
            <View className="flex-row items-center gap-x-3.5 mb-3.5">
              {m.photo ? (
                <Image source={{ uri: m.photo }} className="w-14 h-14 rounded-2xl border border-[#e0d8cf]" />
              ) : (
                <View className="w-14 h-14 rounded-2xl bg-[#4a3728] items-center justify-center">
                  <Text className="text-white font-black text-lg">{initialsFrom(m.name)}</Text>
                </View>
              )}
              <View className="flex-1 min-w-0">
                <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>{m.name}</Text>
                <Text className="text-xs text-[#7a5c3e] font-semibold mt-0.5" numberOfLines={1}>{m.role}</Text>
                <Text className="text-[11px] text-[#8a7a6a] mt-1 font-medium">{m.totalSessions} session(s) booked</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onSelectMentor(m.mentorId)}
              activeOpacity={0.85}
              className="w-full bg-[#4a3728] py-3 rounded-2xl items-center flex-row justify-center gap-x-1.5 shadow-sm"
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">Book Another Session</Text>
              <ArrowRight size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOOKINGS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const BookingsView: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter((s) => (s.status || '').toLowerCase() === filter);
  }, [sessions, filter]);

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">My Bookings</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Filter and manage all your 1:1 and group bookings
        </Text>
      </View>

      {/* Segmented Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
        <View className="flex-row gap-x-2">
          {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border ${
                  active ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
                }`}
              >
                <Text className={`text-xs font-bold capitalize ${active ? 'text-white' : 'text-[#7a5c3e]'}`}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {filtered.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Bookmark size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">No bookings matching this filter</Text>
        </View>
      ) : (
        filtered.map((s, idx) => (
          <View key={`booking-${s.isGroup ? 'grp' : 'ses'}-${s._id || s.sessionId || idx}`} className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
            <View className="flex-row justify-between items-start mb-3 gap-x-2">
              <View className="flex-1 min-w-0 pr-2">
                <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>{s.mentorName || 'Mentor'}</Text>
                <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>
                  {s.title || s.sessionType || '1:1 Session'}
                </Text>
              </View>
              <View className="bg-[#f3ece4] px-3 py-1 rounded-full flex-shrink-0">
                <Text className="text-[10px] font-black text-[#7a5c3e] uppercase tracking-wider">{s.status || 'Confirmed'}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center pt-3 border-t border-[#e0d8cf]/70">
              <Text className="text-xs font-semibold text-[#7a5c3e]">
                {formatDateStr(s.startTime || s.scheduledAt)} • {formatTimeStr(s.startTime || s.scheduledAt)}
              </Text>
              <Text className="text-sm font-black text-[#4a3728]">
                ₹{(s.pricing?.totalAmount || s.price || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. PAYMENTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const PaymentsView: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const totalPaid = sessions.reduce((acc, s) => acc + (s.pricing?.totalAmount || s.price || 0), 0);

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Payments & Billing</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Track your mentorship investments and receipts
        </Text>
      </View>

      <View className="bg-[#4a3728] p-5 rounded-3xl shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-bold text-white/70 uppercase tracking-wider">Total Investment</Text>
          <CreditCard size={18} color="#d4a574" />
        </View>
        <Text className="text-3xl font-black text-white">₹{totalPaid.toLocaleString()}</Text>
        <Text className="text-[11px] text-white/70 mt-1">{sessions.length} total transaction(s) recorded</Text>
      </View>

      <View className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
        <Text className="text-base font-black text-[#4a3728] mb-3.5">Transaction History</Text>
        {sessions.length === 0 ? (
          <View className="py-8 items-center">
            <Receipt size={36} color="#c0b0a0" />
            <Text className="text-xs font-bold text-[#8a7a6a] mt-2">No transactions recorded</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {sessions.map((s, idx) => (
              <View
                key={`payment-${s.isGroup ? 'grp' : 'ses'}-${s._id || s.sessionId || idx}`}
                className="bg-[#fbf7f3] p-4 rounded-2xl border border-[#e0d8cf] flex-row justify-between items-center"
              >
                <View className="flex-1 min-w-0 pr-2">
                  <Text className="text-xs font-black text-[#4a3728]" numberOfLines={1}>
                    {s.mentorName || 'Mentor Session'}
                  </Text>
                  <Text className="text-[11px] text-[#8a7a6a] mt-0.5">
                    {formatDateStr(s.startTime || s.scheduledAt)} • {s.sessionType || '1:1 Session'}
                  </Text>
                </View>
                <View className="items-end flex-shrink-0">
                  <Text className="text-sm font-black text-[#4a3728]">
                    ₹{(s.pricing?.totalAmount || s.price || 0).toLocaleString()}
                  </Text>
                  <View className="bg-[#dcfce7] px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                    <Text className="text-[9px] font-black text-[#15803d] uppercase">Paid</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. SESSION HISTORY & REVIEWS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const SessionHistoryView: React.FC<{
  sessions: any[];
  onOpenReview: (sessionId: string, mentorId: string, mentorName: string) => void;
}> = ({ sessions, onOpenReview }) => {
  const completed = sessions.filter((s) => s.status === 'completed' || s.status === 'confirmed');

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Session History</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Past sessions you have attended and completed
        </Text>
      </View>

      {completed.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <History size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">No completed sessions yet</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1 max-w-xs leading-5">
            Your completed sessions and feedback prompts will show up here.
          </Text>
        </View>
      ) : (
        completed.map((s, idx) => {
          const name = s.mentorName || s.mentor?.fullName || (s.mentor?.user?.firstName ? `${s.mentor.user.firstName} ${s.mentor.user.lastName || ''}`.trim() : '') || 'Mentor';
          const sid = s.sessionId || s._id || s.id;
          const mid = s.mentorId || s.mentor?.mentorId || s.mentor?._id;

          return (
            <View key={`history-${s.isGroup ? 'grp' : 'ses'}-${sid || idx}`} className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
              <View className="flex-row justify-between items-start mb-2.5 gap-x-2">
                <View className="flex-1 min-w-0 pr-2">
                  <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>{name}</Text>
                  <Text className="text-xs text-[#8a7a6a] font-medium mt-0.5" numberOfLines={1}>
                    {s.title || s.sessionType || '1:1 Call'}
                  </Text>
                </View>
                <View className="bg-[#f3ece4] px-3 py-1 rounded-full flex-shrink-0">
                  <Text className="text-[10px] font-bold text-[#7a5c3e]">
                    {formatDateStr(s.startTime || s.scheduledAt)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => onOpenReview(sid, mid, name)}
                activeOpacity={0.85}
                className="mt-3 bg-[#FAF9F6] border border-[#e0d8cf] py-3 rounded-2xl items-center flex-row justify-center gap-x-2"
              >
                <Star size={15} color="#c9932a" fill="#c9932a" />
                <Text className="text-xs font-black text-[#4a3728] uppercase tracking-wider">Rate & Leave Review</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. GROUP MASTERCLASSES VIEW
// ─────────────────────────────────────────────────────────────────────────────
const MasterclassesView: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MentorshipService.getAllGroupSessions()
      .then((res) => setClasses(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Group Masterclasses & Cohorts</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Join interactive live group sessions hosted by industry mentors
        </Text>
      </View>

      {loading ? (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-xs text-[#8a7a6a] mt-2 font-bold">Loading masterclasses...</Text>
        </View>
      ) : classes.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Users size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">No upcoming group masterclasses</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1 max-w-xs leading-5">
            New masterclasses are added regularly. Check back soon for upcoming cohorts.
          </Text>
        </View>
      ) : (
        classes.map((gs, idx) => {
          const isExpired = gs.scheduledAt ? new Date(gs.scheduledAt).getTime() < Date.now() : false;
          return (
            <View key={gs._id || idx} className={`bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm ${isExpired ? 'opacity-70' : ''}`}>
              <View className="flex-row items-center justify-between mb-2 gap-x-2">
                <Text className="text-base font-black text-[#4a3728] flex-1" numberOfLines={1}>
                  {gs.title || 'Live Masterclass'}
                </Text>
                {isExpired ? (
                  <View className="bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex-shrink-0">
                    <Text className="text-[10px] font-bold text-rose-700">Expired</Text>
                  </View>
                ) : (
                  <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                    <Text className="text-[10px] font-black text-emerald-800 uppercase">Live Cohort</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-[#7a6756] leading-5 mb-4" numberOfLines={2}>
                {gs.description || 'Interactive live cohort mentorship.'}
              </Text>
              <View className="flex-row justify-between items-center pt-3 border-t border-[#e0d8cf]">
                <View className="flex-row items-center gap-x-1.5">
                  <Clock size={13} color="#7a5c3e" />
                  <Text className="text-xs font-bold text-[#7a5c3e]">{formatDateStr(gs.scheduledAt)}</Text>
                </View>
                <Text className="text-sm font-black text-[#4a3728]">
                  ₹{(gs.pricing?.totalAmount || gs.price || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. LEARNER WAITLIST VIEW (LIVE BACKEND INTEGRATION)
// ─────────────────────────────────────────────────────────────────────────────
const LearnerWaitlistView: React.FC = () => {
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWaitlists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await WaitlistService.getMyWaitlists();
      const data = res?.data || res || [];
      setWaitlists(Array.isArray(data) ? data : []);
    } catch (e) {
      setWaitlists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWaitlists();
  }, [loadWaitlists]);

  const handleLeaveWaitlist = (id: string) => {
    Alert.alert('Leave Waitlist', 'Are you sure you want to leave this waitlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await WaitlistService.leaveWaitlist(id);
            setWaitlists((prev) => prev.filter((w) => (w._id || w.id) !== id));
            Alert.alert('Success', 'Removed from waitlist.');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to leave waitlist.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-xs text-[#8a7a6a] mt-3 font-bold">Checking waitlist queues...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }} className="pb-8">
      <View className="mb-1">
        <Text className="text-base font-black text-[#4a3728]">Waitlist Positions</Text>
        <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
          Live queue updates for fully booked mentors
        </Text>
      </View>

      {waitlists.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Clock size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">You are not on any waitlist</Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1 max-w-xs leading-5">
            When you join a waitlist for a booked-out mentor or cohort, your live queue position will appear here.
          </Text>
        </View>
      ) : (
        waitlists.map((w, idx) => {
          const wid = w._id || w.id || idx;
          const mentorName = w.mentor?.user?.fullName || (w.mentor?.user?.firstName ? `${w.mentor.user.firstName} ${w.mentor.user.lastName || ''}`.trim() : '') || w.mentorName || 'Mentor';
          const pos = w.position || w.queuePosition || idx + 1;

          return (
            <View key={wid} className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
              <View className="flex-row justify-between items-start mb-2.5 gap-x-2">
                <View className="flex-1 min-w-0 pr-2">
                  <Text className="text-base font-black text-[#4a3728]" numberOfLines={1}>{mentorName}</Text>
                  <Text className="text-xs text-[#8a7a6a] mt-0.5">Joined on {formatDateStr(w.createdAt || w.joinedAt)}</Text>
                </View>
                <View className="bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex-shrink-0">
                  <Text className="text-[11px] font-black text-amber-800 uppercase">Queue #{pos}</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center pt-3 border-t border-[#e0d8cf] mt-2">
                <Text className="text-xs text-[#7a5c3e] font-semibold">Status: Waiting for opening</Text>
                <TouchableOpacity
                  onPress={() => handleLeaveWaitlist(wid)}
                  className="bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl"
                >
                  <Text className="text-red-700 text-xs font-bold">Leave Queue</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. LEARNER REVIEWS VIEW (MY REVIEWS & FEEDBACK)
// ─────────────────────────────────────────────────────────────────────────────
const LearnerReviewsView: React.FC<{
  sessions: any[];
  onOpenReview: (sessionId: string, mentorId: string, mentorName: string) => void;
}> = ({ sessions, onOpenReview }) => {
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ReviewService.getMyReviews();
      const list = res?.data || res || [];
      setMyReviews(Array.isArray(list) ? list : []);
    } catch (e) {
      setMyReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const completedWithoutReview = useMemo(() => {
    return sessions.filter((s) => s.status === 'completed');
  }, [sessions]);

  if (loading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-xs text-[#8a7a6a] mt-3 font-bold">Loading your feedback history...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 18 }} className="pb-8">
      {/* Pending Reviews Prompt */}
      {completedWithoutReview.length > 0 && (
        <View className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
          <Text className="text-base font-black text-[#4a3728] mb-3">Completed Sessions Awaiting Feedback</Text>
          <View style={{ gap: 10 }}>
            {completedWithoutReview.slice(0, 3).map((s, idx) => {
              const name = s.mentorName || s.mentor?.fullName || (s.mentor?.user?.firstName ? `${s.mentor.user.firstName} ${s.mentor.user.lastName || ''}`.trim() : '') || 'Mentor';
              const sid = s.sessionId || s._id || s.id;
              const mid = s.mentorId || s.mentor?.mentorId || s.mentor?._id;
              return (
                <View
                  key={`review-pending-${s.isGroup ? 'grp' : 'ses'}-${sid || idx}`}
                  className="bg-[#fbf7f3] p-3.5 rounded-2xl border border-[#e0d8cf] flex-row items-center justify-between gap-x-2"
                >
                  <View className="flex-1 min-w-0 pr-2">
                    <Text className="text-xs font-black text-[#4a3728]" numberOfLines={1}>{name}</Text>
                    <Text className="text-[11px] text-[#8a7a6a] mt-0.5">{formatDateStr(s.startTime || s.scheduledAt)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onOpenReview(sid, mid, name)}
                    activeOpacity={0.85}
                    className="bg-[#4a3728] px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 flex-shrink-0"
                  >
                    <Star size={12} color="#c9932a" fill="#c9932a" />
                    <Text className="text-white text-xs font-bold">Write Review</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Reviews I've Written */}
      <View className="bg-white p-5 rounded-3xl border border-[#e0d8cf] shadow-sm">
        <Text className="text-base font-black text-[#4a3728] mb-3.5">Reviews I've Written</Text>
        {myReviews.length === 0 ? (
          <View className="py-8 items-center">
            <Star size={36} color="#c0b0a0" />
            <Text className="text-xs font-bold text-[#8a7a6a] mt-2">No reviews written yet</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {myReviews.map((r, idx) => (
              <View key={r._id || r.reviewId || idx} className="bg-[#fbf7f3] p-4 rounded-2xl border border-[#e0d8cf]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-black text-[#4a3728]">
                    {r.mentor?.user?.fullName || r.mentorName || 'Mentor'}
                  </Text>
                  <View className="flex-row items-center gap-0.5">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} color="#c9932a" fill="#c9932a" />
                    ))}
                  </View>
                </View>
                <Text className="text-xs text-[#4a3728] mt-0.5 leading-5">{r.comment}</Text>
                {r.mentorResponse?.response && (
                  <View className="bg-white p-3 rounded-xl border border-[#e0d8cf] mt-2.5">
                    <Text className="text-[11px] font-black text-[#7a5c3e]">Mentor Reply:</Text>
                    <Text className="text-xs text-[#4a3728] mt-0.5 leading-4">{r.mentorResponse.response}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. NOTIFICATIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const NotificationsView: React.FC<{
  notifications: any[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}> = ({ notifications, onMarkRead, onMarkAllRead }) => {
  return (
    <View style={{ gap: 14 }} className="pb-8">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-black text-[#4a3728]">Alerts & Updates</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={onMarkAllRead} className="bg-white border border-[#e0d8cf] px-3.5 py-1.5 rounded-full shadow-xs">
            <Text className="text-xs font-bold text-[#7a5c3e]">Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View className="bg-white p-8 rounded-3xl border border-[#e0d8cf] items-center">
          <Bell size={36} color="#c0b0a0" />
          <Text className="text-base font-black text-[#4a3728] mt-3">All caught up!</Text>
          <Text className="text-xs text-[#8a7a6a] mt-1">You have no new alerts or notifications.</Text>
        </View>
      ) : (
        notifications.map((n, idx) => (
          <TouchableOpacity
            key={`notif-${n._id || idx}`}
            onPress={() => onMarkRead(n._id)}
            activeOpacity={0.85}
            className={`p-4 rounded-3xl border shadow-sm ${
              n.isRead ? 'bg-white border-[#e0d8cf]' : 'bg-[#fbf7f3] border-[#7a5c3e]'
            }`}
          >
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className="text-sm font-black text-[#4a3728] flex-1 pr-3" numberOfLines={2}>{n.title || 'Alert'}</Text>
              {!n.isRead && <View className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 flex-shrink-0" />}
            </View>
            <Text className="text-xs text-[#7a6756] leading-5" numberOfLines={4}>{n.message || ''}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN LEARNER / USER DASHBOARD SCREEN (WITH HAMBURGER SIDE DRAWER)
// ─────────────────────────────────────────────────────────────────────────────
export const UserDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [activePage, setActivePage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  // Drawer Animation Values
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    sessionId: string;
    mentorId: string;
    mentorName: string;
  }>({
    isOpen: false,
    sessionId: '',
    mentorId: '',
    mentorName: '',
  });

  // ── Real user data from profile Redux slice (has firstName, lastName, profileImage, email) ──
  const profileData = useAppSelector((state: any) => state.profile?.data);
  const authUser = profileData;

  const fetchDashboardData = useCallback(async () => {
    try {
      const [mentorCheck, sessionRes, groupRes, notifRes] = await Promise.all([
        MentorshipService.getMyMentor().catch(() => null),
        SessionService.getAllSessions({ role: 'mentee', limit: 50 }).catch(() => null),
        MentorshipService.getMyGroupSessions().catch(() => null),
        NotificationService.getMentorshipNotifications({ limit: 50 }).catch(() => null),
      ]);

      if (mentorCheck?._id || mentorCheck?.mentorId) {
        setIsMentor(true);
      }

      const rawSessions = sessionRes?.data || [];
      const rawGroup = groupRes?.data || [];

      // Format enrolled group sessions to fit unified session list
      const formattedGroupSessions = Array.isArray(rawGroup)
        ? rawGroup.map((gs: any) => ({
            _id: gs._id || gs.id,
            sessionId: gs._id || gs.id,
            title: gs.title || 'Group Masterclass',
            sessionType: 'group_masterclass',
            mentorName: gs.mentor?.user?.fullName || gs.mentor?.name || 'Masterclass Mentor',
            mentorProfilePhoto: gs.mentor?.profilePic || gs.mentor?.user?.profileImage,
            mentorId: gs.mentorId || gs.mentor?._id,
            startTime: gs.scheduledAt,
            scheduledAt: gs.scheduledAt,
            status: gs.status || 'confirmed',
            price: gs.pricing?.totalAmount || gs.price || 0,
            pricing: { totalAmount: gs.pricing?.totalAmount || gs.price || 0 },
            isGroup: true,
          }))
        : [];

      const combined = [...rawSessions, ...formattedGroupSessions].sort((a, b) => {
        const timeA = new Date(a.startTime || a.scheduledAt || 0).getTime();
        const timeB = new Date(b.startTime || b.scheduledAt || 0).getTime();
        return timeB - timeA;
      });

      setSessions(combined);
      setNotifications(notifRes?.data || []);
    } catch (e) {
      console.error('Error loading mentee dashboard data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Ensure profile data is loaded so the drawer shows real name/avatar
    if (!profileData) {
      dispatch(fetchMyProfile());
    }
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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
    setActivePage(id);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_W, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, backdropAnim]);

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationService.markMentorshipNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllMentorshipNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const activeLabel = USER_MENU_ITEMS.find((m) => m.id === activePage)?.label || 'Overview';

  return (
    <SafeAreaView className="flex-1 bg-[#f7f3ee]" edges={['top', 'left', 'right']}>
      {/* Top Header Bar: Hamburger 3-line Menu on Left */}
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
            <Text className="text-[10px] font-bold text-[#8b7355] uppercase tracking-wider">Learner Dashboard</Text>
          </View>
        </View>

        {/* Role Switcher */}
        {isMentor ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('MentorDashboard')}
            className="bg-[#4a3728] px-3.5 py-1.5 rounded-full flex-row items-center gap-x-1 shadow-sm"
          >
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">Mentor Mode</Text>
            <ArrowUpRight size={11} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Mentorship')}
            className="bg-white border border-[#d4c4b5] px-3.5 py-1.5 rounded-full flex-row items-center gap-x-1 shadow-sm"
          >
            <Search size={11} color="#7a5c3e" />
            <Text className="text-[#7a5c3e] text-[10px] font-bold uppercase tracking-wider">Explore</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a3728" />
          <Text className="text-[#8a7a6a] mt-2.5 text-xs font-bold">Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a3728']} />}
          showsVerticalScrollIndicator={false}
        >
          {activePage === 'dashboard' && (
            <OverviewView
              sessions={sessions}
              setActivePage={setActivePage}
              onExploreMentors={() => navigation.navigate('Mentorship')}
              user={authUser}
            />
          )}
          {activePage === 'recommended' && (
            <RecommendedMentorsView
              onSelectMentor={(mentorId) => navigation.navigate('MentorProfile', { mentorId })}
            />
          )}
          {activePage === 'upcoming' && (
            <UpcomingSessionsView
              sessions={sessions}
              onJoinSession={() => Alert.alert('Join Call', 'Opening live mentorship video room...')}
            />
          )}
          {activePage === 'my-mentors' && (
            <MyMentorsView
              sessions={sessions}
              onSelectMentor={(mentorId) => navigation.navigate('MentorProfile', { mentorId })}
            />
          )}
          {activePage === 'bookings' && <BookingsView sessions={sessions} />}
          {activePage === 'payments' && <PaymentsView sessions={sessions} />}
          {activePage === 'history' && (
            <SessionHistoryView
              sessions={sessions}
              onOpenReview={(sid, mid, name) =>
                setReviewModalState({ isOpen: true, sessionId: sid, mentorId: mid, mentorName: name })
              }
            />
          )}
          {activePage === 'masterclasses' && <MasterclassesView />}
          {activePage === 'waitlist' && <LearnerWaitlistView />}
          {activePage === 'reviews' && (
            <LearnerReviewsView
              sessions={sessions}
              onOpenReview={(sid, mid, name) =>
                setReviewModalState({ isOpen: true, sessionId: sid, mentorId: mid, mentorName: name })
              }
            />
          )}

          {activePage === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          )}
          <View className="h-10" />
        </ScrollView>
      )}

      {/* Side Drawer Modal */}
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
              {/* Drawer Profile Card Header */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#d4c4b5', backgroundColor: '#FAF9F6' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  {(() => {
                    const avatar =
                      authUser?.profilePic ||
                      authUser?.profileImage ||
                      authUser?.profilePhotoUrl ||
                      authUser?.avatar ||
                      authUser?.user?.profileImage;
                    return avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
                      <Image
                        source={{ uri: avatar }}
                        style={{ width: 54, height: 54, borderRadius: 18, borderWidth: 1.5, borderColor: '#d4c4b5' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: '#4a3728', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 20 }}>
                          {initialsFrom(authUser?.fullName || `${authUser?.firstName || 'U'} ${authUser?.lastName || ''}`)}
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
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#4a3728' }} numberOfLines={1}>
                  {authUser?.fullName || (authUser?.firstName ? `${authUser.firstName} ${authUser.lastName || ''}`.trim() : 'Learner')}
                </Text>
                {authUser?.email ? (
                  <Text style={{ fontSize: 12, color: '#7a6756', marginTop: 2 }} numberOfLines={1}>
                    {authUser.email}
                  </Text>
                ) : null}
                <View style={{ backgroundColor: '#f3ece4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#d4c4b5', alignSelf: 'flex-start', marginTop: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#7a5c3e', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {authUser?.userType === 'mentor' ? 'Mentor' : 'Learner / Mentee'}
                  </Text>
                </View>
              </View>

              {/* Drawer Menu Items List */}
              <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 10 }} showsVerticalScrollIndicator={false}>
                {USER_MENU_ITEMS.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activePage === item.id;
                  const isNotif = item.id === 'notifications';
                  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#FAF9F6',
                          borderWidth: isActive ? 0 : 1,
                          borderColor: '#d4c4b5',
                        }}
                      >
                        <IconComp size={18} color={isActive ? '#fff' : '#7a5c3e'} />
                      </View>
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
                      {isNotif && unreadCount > 0 && !isActive && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc2626', marginRight: 6 }} />
                      )}
                      {isActive && <ChevronRight size={16} color="#fff" />}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 24 }} />
              </ScrollView>
            </SafeAreaView>
          </Animated.View>

          {/* Backdrop with animated opacity */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: '#000',
              opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>

      {/* Review Bottom Sheet */}
      <WriteReviewModal
        isOpen={reviewModalState.isOpen}
        sessionId={reviewModalState.sessionId}
        mentorId={reviewModalState.mentorId}
        mentorName={reviewModalState.mentorName}
        onClose={() => setReviewModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          setReviewModalState((prev) => ({ ...prev, isOpen: false }));
          fetchDashboardData();
        }}
      />
    </SafeAreaView>
  );
};

export default UserDashboardScreen;
