import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  User,
  ArrowRight,
  Star,
  Award,
  Users,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
  Clock,
  AlertCircle,
  Briefcase,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BecomeMentorModal from '../components/BecomeMentorModal';
import BottomBar, { emitBottomBarScroll, emitBottomBarScrollEnd } from '../../../shared/components/BottomBar';

// Dynamic Imports & Services
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loadMentors, selectMentors, selectMentorLoading } from '../../../store/slices/mentorSlice';
import MentorshipService from '../../../services/mentorship.service';
import SeniorMentorService from '../../../services/senior-mentor.service';
import FeedService from '../../../services/feed.service';

const { width: SW } = Dimensions.get('window');

// Brand Color Palette
const C = {
  primary: '#4a3728',      // deep warm espresso
  primaryMid: '#6b5847',   // mid brown
  primaryLight: '#8b7355', // muted warm brown
  accent: '#d4a574',       // warm golden accent
  pageBg: '#f7f3ee',       // page background
  cardBg: '#e0d8cf',       // warm card background
  cardSurface: '#FAF9F6',  // soft cream surface
  surface: '#ffffff',
  border: '#d4c4b5',       // warm border
  borderLight: '#ece7e2',
  text: '#4a3728',
  textMuted: '#7a6756',
  textSubtle: '#9a8775',
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

const getMentorName = (m: any): string => {
  if (!m) return 'Mentor';
  const candidates = [
    m.authorName,
    m.user?.fullName,
    m.user?.name,
    m.fullName,
    m.name,
    (m.user?.firstName || m.user?.lastName) ? `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim() : null,
    (m.firstName || m.lastName) ? `${m.firstName || ''} ${m.lastName || ''}`.trim() : null,
    m.author?.fullName,
    m.author?.name,
    m.userName,
    m.username,
    m.user?.username,
    m.account?.fullName,
    m.account?.name,
    m.title,
  ];

  for (const n of candidates) {
    if (typeof n === 'string' && n.trim().length > 0 && n !== 'Community Mentor' && n !== 'Unknown User' && n !== 'Throne8 User' && n !== 'Senior Mentor' && n !== 'Mentor') {
      return n.trim();
    }
  }
  return m.name || m.fullName || m.title || 'Expert Mentor';
};

const getMentorAvatar = (m: any): string | null => {
  if (!m) return null;
  const candidates = [
    m.profilePic,
    m.profilePhotoUrl,
    m.profileImage,
    m.profilePhoto,
    m.avatar,
    m.photo,
    m.authorAvatar,
    m.user?.profileImage,
    m.user?.profilePhoto,
    m.user?.profilePhotoUrl,
    m.user?.avatar,
    m.user?.photo,
    m.author?.avatar,
    m.author?.profileImage,
    m.author?.profilePhoto,
  ];

  for (const pic of candidates) {
    if (!pic) continue;
    if (typeof pic === 'string' && pic.trim().length > 0) {
      if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') || pic.startsWith('file:')) {
        return pic;
      }
    }
    if (typeof pic === 'object' && pic !== null) {
      const nested = (pic as any).cloudinarySecureUrl || (pic as any).url || (pic as any).secure_url || (pic as any).uri;
      if (typeof nested === 'string' && nested.trim().length > 0) return nested;
    }
  }
  return null;
};

const getMentorRoleAndCompany = (m: any): { role: string; company: string } => {
  if (!m) return { role: 'Expert Mentor', company: 'Verified' };
  const rawRole = m.experience?.currentRole || m.currentRole || m.role || m.title || 'Expert Mentor';
  const rawCompany = typeof m.company === 'object' ? m.company?.companyName : (m.company || m.organization || m.experience?.company);
  
  let role = String(rawRole);
  let company = rawCompany ? String(rawCompany) : '';

  if (role.includes('@')) {
    const parts = role.split('@');
    role = parts[0].trim();
    if (!company) company = parts[1].trim();
  }

  if (!company) company = 'Verified Mentor';
  return { role, company };
};

const getMentorTags = (m: any): string[] => {
  if (!m) return [];
  const tags = m.domains || m.skills || m.specializations || m.expertise || m.tags || [];
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).replace(/_/g, ' ')).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return [tags.replace(/_/g, ' ')];
  }
  return [];
};

const getMentorStats = (m: any) => {
  const rawRating =
    m?.stats?.averageRating ??
    m?.averageRating ??
    m?.rating ??
    m?.stats?.rating ??
    m?.ratings?.average ??
    m?.score;
  const rating = typeof rawRating === 'number' && !isNaN(rawRating) && rawRating > 0
    ? rawRating
    : (typeof rawRating === 'string' && parseFloat(rawRating) > 0 ? parseFloat(rawRating) : 0);

  const sessions = Number(
    m?.stats?.totalSessions ??
    m?.totalSessions ??
    m?.sessionsCount ??
    m?.sessions ??
    0
  );

  const reviews = Number(
    m?.stats?.totalReviews ??
    m?.totalReviews ??
    m?.reviewsCount ??
    m?.stats?.reviewsCount ??
    m?.reviews?.length ??
    0
  );

  const expTotal = m?.experienceTotal ?? m?.experience?.total ?? (parseInt(m?.exp || '0', 10) || 5);

  return { rating, sessions, reviews, expTotal };
};

const initialsFrom = (name: string): string => {
  if (!name) return 'M';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── MENTOR CARD (FEATURED / CAROUSEL) ─────────────────────────────────────────
const MentorCard: React.FC<{ mentor: any; onPress?: () => void }> = ({ mentor, onPress }) => {
  const avatarUrl = getMentorAvatar(mentor);
  const name = getMentorName(mentor);
  const { role, company } = getMentorRoleAndCompany(mentor);
  const tags = getMentorTags(mentor);
  const { rating, sessions, reviews, expTotal } = getMentorStats(mentor);
  const cardW = Math.min(Math.max(SW * 0.68, 230), 270);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{ width: cardW }}
      className="bg-white border border-[#d4c4b5] rounded-3xl p-4 sm:p-5 shadow-xs justify-between"
    >
      <View>
        <View className="items-center mb-3">
          <View className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#d4a574] shadow-xs bg-[#4a3728] items-center justify-center">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-white font-black text-lg">{initialsFrom(name)}</Text>
            )}
          </View>
        </View>

        <Text className="font-black text-sm text-center text-[#4a3728] mb-0.5" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-[#7a6756] font-semibold text-center mb-2.5 capitalize" numberOfLines={1}>
          {role} • {company}
        </Text>

        <View className="flex-row items-center justify-center gap-x-1.5 mb-3">
          {rating > 0 ? (
            <View className="flex-row items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Star size={12} color="#d97706" fill="#d97706" />
              <Text className="text-xs font-black text-amber-800">{rating.toFixed(1)}</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 bg-[#f5ede4] px-2.5 py-1 rounded-full border border-[#e4dbd1]">
              <Star size={12} color="#8a7a6a" fill="none" />
              <Text className="text-xs font-bold text-[#7a5c3e]">New</Text>
            </View>
          )}
          <Text className="text-xs text-[#7a6756] font-medium">
            ({sessions > 0 ? `${sessions} sessions` : 'Active'}{reviews > 0 ? ` • ${reviews} reviews` : ''})
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-1.5 justify-center mb-3">
          {tags.slice(0, 3).map((tag: string, idx: number) => (
            <View key={`tag-${tag}-${idx}`} className="bg-[#f0ebe4] px-2.5 py-1 rounded-full border border-[#d4c4b5]">
              <Text className="text-[10px] font-bold text-[#4a3728] capitalize">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row items-center justify-center gap-x-1.5 pt-3 border-t border-[#d4c4b5]/50">
        <Award size={14} color={C.primaryLight} />
        <Text className="text-xs font-bold text-[#4a3728]">
          {expTotal}+ Years Experience
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar: React.FC<{ isMentor: boolean; onDashboard: () => void }> = ({ isMentor, onDashboard }) => (
  <View className="bg-[#FAF9F6] border-b border-[#d4c4b5] px-5 py-3.5 flex-row items-center justify-between shadow-xs">
    <View className="flex-row items-center gap-x-3">
      <View className="w-10 h-10 bg-[#4a3728] rounded-2xl items-center justify-center shadow-xs">
        <Sparkles size={18} color="#d4a574" />
      </View>
      <View>
        <Text className="text-base font-black tracking-tight text-[#4a3728]">THRONE</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-[#8b7355]">Mentorship</Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={onDashboard}
      activeOpacity={0.85}
      className="bg-[#4a3728] px-4 py-2 rounded-2xl flex-row items-center gap-x-1.5 shadow-xs"
    >
      <Text className="text-white text-xs font-black uppercase tracking-wider">Dashboard</Text>
      <User size={13} color="#fff" />
    </TouchableOpacity>
  </View>
);

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => (
  <View className="pt-6 pb-4 px-5 items-center bg-[#f7f3ee]">
    <View className="flex-row items-center gap-1.5 bg-[#FAF9F6] border border-[#d4c4b5] px-3.5 py-1 rounded-full mb-3 shadow-xs">
      <Sparkles size={12} color="#c9932a" />
      <Text className="text-[10px] font-black text-[#7a5c3e] uppercase tracking-wider">
        Verified 1:1 Mentorship Platform
      </Text>
    </View>
    <Text className="text-2xl sm:text-3xl font-black tracking-tight text-[#4a3728] text-center mb-1.5">
      Find Your Ideal Mentor
    </Text>
    <Text className="text-xs sm:text-sm text-[#7a6756] font-medium text-center max-w-sm leading-5">
      Connect with verified industry leaders for 1:1 sessions, career guidance, code reviews & interview prep.
    </Text>
  </View>
);

// ─── ACTION CARDS ─────────────────────────────────────────────────────────────
const ActionCards: React.FC<{
  onFindMentor: () => void;
  onBecomeMentor: () => void;
  onSeniorMentor: () => void;
  isMentor: boolean;
  checkingMentor: boolean;
}> = ({ onFindMentor, onBecomeMentor, onSeniorMentor, isMentor }) => {
  const [seniorApp, setSeniorApp] = useState<any>(null);
  const [seniorLoading, setSeniorLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkSeniorStatus = async () => {
      try {
        const res = await SeniorMentorService.getMyApplication();
        if (isMounted) setSeniorApp(res?.data ?? res ?? null);
      } catch {
        if (isMounted) setSeniorApp(null);
      } finally {
        if (isMounted) setSeniorLoading(false);
      }
    };
    checkSeniorStatus();
    return () => { isMounted = false; };
  }, []);

  const resolveSeniorCard = () => {
    if (seniorLoading) {
      return {
        title: 'Senior Mentor App',
        description: 'Checking application status...',
        cta: 'Loading...',
        statusBadge: null,
      };
    }
    const status = seniorApp?.verificationStatus || seniorApp?.status;
    if (status === 'pending') {
      return {
        title: 'Senior Mentor App',
        description: 'Your application has been submitted and is awaiting review.',
        cta: 'View Application',
        statusBadge: (
          <View className="flex-row items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-full self-start mb-2">
            <Clock size={11} color="#b45309" />
            <Text className="text-[10px] font-black text-amber-800">PENDING</Text>
          </View>
        ),
      };
    }
    if (status === 'under_review') {
      return {
        title: 'Senior Mentor App',
        description: 'Great news — your application is currently under review by our team.',
        cta: 'View Status',
        statusBadge: (
          <View className="flex-row items-center gap-1 bg-blue-100 px-2.5 py-1 rounded-full self-start mb-2">
            <Clock size={11} color="#1d4ed8" />
            <Text className="text-[10px] font-black text-blue-800">UNDER REVIEW</Text>
          </View>
        ),
      };
    }
    if (status === 'verified' || status === 'approved') {
      return {
        title: 'Senior Mentor',
        description: 'Congratulations! Your application is verified. Welcome to the Senior Mentor tier.',
        cta: 'View Status',
        statusBadge: (
          <View className="flex-row items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-full self-start mb-2">
            <CheckCircle2 size={11} color="#15803d" />
            <Text className="text-[10px] font-black text-emerald-800">VERIFIED</Text>
          </View>
        ),
      };
    }
    if (status === 'rejected') {
      return {
        title: 'Senior Mentor App',
        description: seniorApp?.rejectionReason || 'Your previous application needs attention. Please update and re-submit.',
        cta: 'Update Application',
        statusBadge: (
          <View className="flex-row items-center gap-1 bg-rose-100 px-2.5 py-1 rounded-full self-start mb-2">
            <AlertCircle size={11} color="#b91c1c" />
            <Text className="text-[10px] font-black text-rose-800">REVISION NEEDED</Text>
          </View>
        ),
      };
    }
    return {
      title: 'Become Senior Mentor',
      description: 'Share your industry experience, guide aspiring professionals, and shape the next generation.',
      cta: 'Apply Now',
      statusBadge: null,
    };
  };

  const seniorCard = resolveSeniorCard();
  const cardWidth = isMentor ? Math.max((SW - 46) / 2, 160) : Math.min(Math.max(SW * 0.72, 230), 280);

  return (
    <View className="px-4 pb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 8 }}
      >
        {/* Find Mentor Card */}
        <TouchableOpacity
          onPress={onFindMentor}
          activeOpacity={0.88}
          style={{ width: cardWidth }}
          className="bg-[#FAF9F6] rounded-3xl p-5 border border-[#d4c4b5] shadow-xs justify-between"
        >
          <View>
            <View className="w-11 h-11 bg-[#4a3728] rounded-2xl items-center justify-center mb-3 shadow-xs">
              <Search size={20} color="#d4a574" />
            </View>
            <Text className="text-base font-black text-[#4a3728] mb-1.5">Find Mentor</Text>
            <Text numberOfLines={3} className="text-xs text-[#7a6756] leading-5 mb-3 font-medium">
              Explore 500+ verified mentors across web, mobile, AI & system design.
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-[#8b7355]">Explore Mentors</Text>
            <ArrowRight size={14} color="#8b7355" />
          </View>
        </TouchableOpacity>

        {/* Become Mentor Card */}
        {!isMentor && (
          <TouchableOpacity
            onPress={onBecomeMentor}
            activeOpacity={0.88}
            style={{ width: cardWidth }}
            className="bg-[#FAF9F6] rounded-3xl p-5 border border-[#d4c4b5] shadow-xs justify-between"
          >
            <View>
              <View className="w-11 h-11 bg-[#8b7355] rounded-2xl items-center justify-center mb-3 shadow-xs">
                <Users size={20} color="#fff" />
              </View>
              <Text className="text-base font-black text-[#4a3728] mb-1.5">Become Mentor</Text>
              <Text numberOfLines={3} className="text-xs text-[#7a6756] leading-5 mb-3 font-medium">
                Share your expertise, guide aspiring developers, and build your brand.
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-bold text-[#4a3728]">Apply Now</Text>
              <ArrowRight size={14} color="#4a3728" />
            </View>
          </TouchableOpacity>
        )}

        {/* Senior Mentor Tier Card */}
        <TouchableOpacity
          onPress={onSeniorMentor}
          activeOpacity={0.88}
          style={{ width: cardWidth }}
          className="bg-[#FAF9F6] rounded-3xl p-5 border border-[#d4c4b5] shadow-xs justify-between"
        >
          <View>
            <View className="w-11 h-11 bg-[#4a3728] rounded-2xl items-center justify-center mb-3 shadow-xs">
              <Award size={20} color="#c9932a" />
            </View>
            {seniorCard.statusBadge}
            <Text className="text-base font-black text-[#4a3728] mb-1.5">{seniorCard.title}</Text>
            <Text numberOfLines={3} className="text-xs text-[#7a6756] leading-5 mb-3 font-medium">
              {seniorCard.description}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-[#c9932a]">{seniorCard.cta}</Text>
            <ArrowRight size={14} color="#c9932a" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── TOP MENTORS MARQUEE ──────────────────────────────────────────────────────
const TopMentorsMarquee: React.FC<{ mentors: any[]; onMentorPress: (m: any) => void }> = ({
  mentors,
  onMentorPress,
}) => {
  if (!mentors || mentors.length === 0) return null;

  return (
    <View className="py-6 bg-[#FAF9F6] border-y border-[#d4c4b5] my-2">
      <View className="px-5 mb-3.5 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-black tracking-tight text-[#4a3728]">
            🏆 Top Mentors
          </Text>
          <Text className="text-xs text-[#7a6756] font-medium mt-0.5">
            Handpicked experts with highest student ratings
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
      >
        {mentors.map((m, i) => (
          <MentorCard
            key={`top-${m?.mentorId || m?._id || m?.id || i}`}
            mentor={m}
            onPress={() => onMentorPress(m)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── COMPARE MODAL ────────────────────────────────────────────────────────────
const CompareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedMentors: any[];
  onMentorPress: (m: any) => void;
}> = ({ isOpen, onClose, selectedMentors, onMentorPress }) => (
  <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
      <Pressable className="bg-[#FAF9F6] border-t border-[#d4c4b5] rounded-t-3xl p-6 max-h-[85%]" onPress={e => e.stopPropagation()}>
        <View className="w-12 h-1.5 rounded-full bg-[#d4c4b5] self-center mb-4" />
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-black text-[#4a3728]">Compare Mentors ({selectedMentors.length})</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
            <X size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
          {selectedMentors.map((m, i) => {
            const avatar = getMentorAvatar(m);
            const name = getMentorName(m);
            const { role, company } = getMentorRoleAndCompany(m);
            const { rating, sessions, expTotal } = getMentorStats(m);

            return (
              <View
                key={`cmp-${m?.mentorId || m?._id || m?.id || i}`}
                className="w-60 bg-white border border-[#d4c4b5] rounded-3xl p-5 items-center shadow-xs"
              >
                <View className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#d4a574] shadow-xs mb-3 bg-[#4a3728] items-center justify-center">
                  {avatar ? (
                    <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Text className="text-white font-black text-lg">{initialsFrom(name)}</Text>
                  )}
                </View>
                <Text className="font-black text-sm text-[#4a3728] text-center mb-0.5" numberOfLines={1}>
                  {name}
                </Text>
                <Text className="text-xs text-[#7a6756] font-semibold text-center mb-3.5 capitalize" numberOfLines={1}>
                  {role} • {company}
                </Text>

                <View className="w-full bg-[#f7f3ee] rounded-2xl p-3.5 mb-4 border border-[#d4c4b5]/60 gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-semibold text-[#7a6756]">Rating</Text>
                    <Text className="text-xs font-black text-[#4a3728]">
                      ⭐ {rating > 0 ? rating.toFixed(1) : 'New'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-semibold text-[#7a6756]">Sessions</Text>
                    <Text className="text-xs font-black text-[#4a3728]">{sessions}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-semibold text-[#7a6756]">Experience</Text>
                    <Text className="text-xs font-black text-[#4a3728]">{expTotal}+ Yrs</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onMentorPress(m);
                  }}
                  activeOpacity={0.85}
                  className="w-full py-3 bg-[#4a3728] rounded-2xl items-center shadow-xs"
                >
                  <Text className="text-white text-xs font-black uppercase tracking-wider">Book Session</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── MENTOR DISCOVERY + FILTER ────────────────────────────────────────────────
const DOMAINS = ['Web Development', 'Mobile Development', 'System Design', 'AI & Machine Learning', 'Product Management', 'DevOps & Cloud'];
const EXPERIENCES = ['0-3 Yrs', '3-7 Yrs', '7-12 Yrs', '12+ Yrs'];

const MentorDiscovery: React.FC<{
  mentors: any[];
  loading: boolean;
  onMentorPress: (m: any) => void;
}> = ({ mentors, loading, onMentorPress }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExps, setSelectedExps] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);

  const toggleDomain = (d: string) => setSelectedDomains(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const toggleExp = (e: string) => setSelectedExps(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);
  const toggleCompare = (id: string) => setCompareList(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);

  const filteredMentors = useMemo(() => {
    let r = [...mentors];
    const rawSearch = searchQuery.trim().toLowerCase();
    const queryTokens = rawSearch.split(/\s+/).filter(Boolean);

    if (queryTokens.length > 0) {
      r = r.filter(m => {
        const name = getMentorName(m);
        const { role, company } = getMentorRoleAndCompany(m);
        const tags = getMentorTags(m).join(' ');
        const bio = String(m.bio || m.aboutMe || m.headline || '');
        const searchable = `${name} ${role} ${company} ${tags} ${bio}`.toLowerCase();
        return queryTokens.every(token => searchable.includes(token));
      });
    }

    if (selectedDomains.length > 0) {
      r = r.filter(m => {
        const mentorTags = getMentorTags(m).map((t: string) => t.toLowerCase());
        const { role } = getMentorRoleAndCompany(m);
        const roleLower = role.toLowerCase();
        return selectedDomains.some(d => {
          const dLower = d.toLowerCase();
          const cleanDom = dLower.replace(/development|management|&|engineering/g, '').trim();
          return mentorTags.some(t => t.includes(cleanDom) || dLower.includes(t)) || roleLower.includes(cleanDom);
        });
      });
    }

    if (selectedExps.length > 0) {
      r = r.filter(m => {
        const totalYears = m.experienceTotal ?? m.experience?.total ?? (parseInt(m.exp || '0', 10) || 0);
        return selectedExps.some(e => {
          if (e === '0-3 Yrs') return totalYears >= 0 && totalYears <= 3;
          if (e === '3-7 Yrs') return totalYears > 3 && totalYears <= 7;
          if (e === '7-12 Yrs') return totalYears > 7 && totalYears <= 12;
          if (e === '12+ Yrs') return totalYears > 12;
          return true;
        });
      });
    }

    return r;
  }, [mentors, searchQuery, selectedDomains, selectedExps]);

  const clearFilters = () => {
    setSelectedDomains([]);
    setSelectedExps([]);
    setSearchQuery('');
    setFilterOpen(false);
  };

  const activeCompareMentors = mentors.filter(m => {
    const mId = String(m.mentorId || m._id || m.id || '');
    return compareList.includes(mId);
  });

  const hasActiveFilters = selectedDomains.length > 0 || selectedExps.length > 0 || searchQuery.length > 0;
  const cardWidth = Math.floor((SW - 44) / 2);

  return (
    <View className="py-5 px-4">
      {/* Header with Title & Filter Button */}
      <View className="flex-row items-center justify-between mb-3.5">
        <View>
          <Text className="text-xl font-black text-[#4a3728]">Discover Mentors</Text>
          <Text className="text-xs text-[#8a7a6a] font-medium">
            {filteredMentors.length} expert{filteredMentors.length === 1 ? '' : 's'} available
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setFilterOpen(true)}
          activeOpacity={0.8}
          className={`flex-row items-center gap-x-1.5 px-3.5 py-2 rounded-2xl shadow-xs ${
            hasActiveFilters ? 'bg-[#4a3728]' : 'bg-[#FAF9F6] border border-[#d4c4b5]'
          }`}
        >
          <Filter size={14} color={hasActiveFilters ? '#ffffff' : '#4a3728'} />
          <Text className={`text-xs font-black uppercase tracking-wider ${hasActiveFilters ? 'text-white' : 'text-[#4a3728]'}`}>
            Filter {hasActiveFilters ? `(${selectedDomains.length + selectedExps.length + (searchQuery ? 1 : 0)})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instant Search Bar */}
      <View className="bg-white border border-[#e4dbd1] rounded-2xl px-4 py-3 flex-row items-center shadow-xs mb-3">
        <Search size={18} color="#8a7a6a" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by mentor name, skill, company or role..."
          placeholderTextColor="#b0a090"
          className="flex-1 ml-3 text-xs sm:text-sm text-[#3c2a1e] py-0 font-medium"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
            <X size={16} color="#8a7a6a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Domain Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2 py-0.5">
          <TouchableOpacity
            onPress={() => setSelectedDomains([])}
            activeOpacity={0.8}
            className={`px-3.5 py-2 rounded-full border shadow-xs ${
              selectedDomains.length === 0
                ? 'bg-[#4a3728] border-[#4a3728]'
                : 'bg-white border-[#d4c4b5]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedDomains.length === 0 ? 'text-white' : 'text-[#4a3728]'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {DOMAINS.map((d) => {
            const isSelected = selectedDomains.includes(d);
            return (
              <TouchableOpacity
                key={d}
                onPress={() => toggleDomain(d)}
                activeOpacity={0.8}
                className={`px-3.5 py-2 rounded-full border shadow-xs ${
                  isSelected
                    ? 'bg-[#4a3728] border-[#4a3728]'
                    : 'bg-white border-[#d4c4b5]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-[#4a3728]'
                  }`}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Loading state */}
      {loading ? (
        <View className="py-14 items-center justify-center">
          <ActivityIndicator size="large" color={C.primary} />
          <Text className="text-xs text-[#7a6756] mt-3 font-semibold">Finding mentors...</Text>
        </View>
      ) : filteredMentors.length === 0 ? (
        /* Empty State */
        <View className="bg-[#FAF9F6] rounded-3xl p-8 border border-[#d4c4b5] items-center justify-center my-4">
          <Briefcase size={36} color="#8a7a6a" />
          <Text className="text-base font-black text-[#4a3728] mt-3 mb-1">No mentors found</Text>
          <Text className="text-xs text-[#7a6756] text-center mb-5 max-w-xs leading-5">
            We couldn't find any mentors matching your criteria. Try resetting your search filters.
          </Text>
          <TouchableOpacity onPress={clearFilters} activeOpacity={0.85} className="px-5 py-3 bg-[#4a3728] rounded-2xl">
            <Text className="text-white text-xs font-black uppercase tracking-wider">Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Mentor Grid */
        <View className="flex-row flex-wrap justify-between">
          {filteredMentors.map((m, i) => {
            const mId = String(m.mentorId || m._id || m.id || i);
            const isComparing = compareList.includes(mId);
            const avatar = getMentorAvatar(m);
            const name = getMentorName(m);
            const { role, company } = getMentorRoleAndCompany(m);
            const tags = getMentorTags(m);
            const { rating, sessions, expTotal } = getMentorStats(m);

            return (
              <TouchableOpacity
                key={`disc-${mId}-${i}`}
                onPress={() => onMentorPress(m)}
                activeOpacity={0.88}
                style={{ width: cardWidth }}
                className="bg-[#FAF9F6] rounded-3xl p-4 border border-[#d4c4b5] shadow-xs mb-3.5 justify-between"
              >
                {/* Compare Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleCompare(mId)}
                  activeOpacity={0.7}
                  className="absolute top-3 right-3 z-10 p-1"
                >
                  <View className={`w-5 h-5 rounded-lg border items-center justify-center ${isComparing ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#d4c4b5]'}`}>
                    {isComparing && <Text className="text-[10px] text-white font-black">✓</Text>}
                  </View>
                </TouchableOpacity>

                <View>
                  <View className="items-center mb-2.5">
                    <View className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#d4a574] shadow-xs mb-2 bg-[#4a3728] items-center justify-center">
                      {avatar ? (
                        <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <Text className="text-white font-black text-sm">{initialsFrom(name)}</Text>
                      )}
                    </View>
                    <Text className="font-black text-xs sm:text-sm text-[#4a3728] text-center" numberOfLines={1}>
                      {name}
                    </Text>
                    <Text className="text-[10px] text-[#7a6756] font-semibold text-center uppercase tracking-tight" numberOfLines={1}>
                      {role} • {company}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-center gap-x-1.5 mb-2.5">
                    {rating > 0 ? (
                      <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star size={10} color="#d97706" fill="#d97706" />
                        <Text className="text-[10px] font-black text-amber-800">{rating.toFixed(1)}</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-1 bg-[#f5ede4] px-2 py-0.5 rounded-full border border-[#e4dbd1]">
                        <Star size={10} color="#8a7a6a" fill="none" />
                        <Text className="text-[10px] font-bold text-[#7a5c3e]">New</Text>
                      </View>
                    )}
                    <Text className="text-[10px] text-[#7a6756] font-medium">({sessions} sessions)</Text>
                  </View>

                  <View className="flex-row flex-wrap gap-1 justify-center mb-3">
                    {tags.slice(0, 2).map((t: string, idx: number) => (
                      <View key={`disc-tag-${t}-${idx}`} className="bg-[#e0d8cf]/50 px-2 py-0.5 rounded-full border border-[#d4c4b5]/60">
                        <Text className="text-[9px] font-bold text-[#4a3728] capitalize">{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="pt-2.5 border-t border-[#d4c4b5]/40 flex-row items-center justify-between">
                  <Text className="text-[10px] font-bold text-[#7a6756]">{expTotal}+ Yrs</Text>
                  <TouchableOpacity
                    onPress={() => onMentorPress(m)}
                    activeOpacity={0.85}
                    className="px-3.5 py-1.5 bg-[#4a3728] rounded-xl items-center"
                  >
                    <Text className="text-white text-[10px] font-black uppercase tracking-wider">Book</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Compare Floating Bar */}
      {compareList.length > 0 && (
        <View className="mt-4 bg-[#4a3728] rounded-3xl px-5 py-4 flex-row items-center justify-between shadow-lg border border-[#d4a574]/30">
          <View className="flex-row items-center gap-x-2.5">
            <Text className="text-xs font-black text-[#d4a574] uppercase tracking-wider">Compare ({compareList.length})</Text>
            <View className="flex-row">
              {compareList.map((id: string, i: number) => {
                const m = mentors.find((x: any) => String(x.mentorId || x._id || x.id) === id);
                const avatar = getMentorAvatar(m);
                const name = getMentorName(m);
                return (
                  <View key={`cmp-bar-${id}-${i}`} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#4a3728] -ml-1 bg-[#8b7355] items-center justify-center">
                    {avatar ? (
                      <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-white font-bold text-[10px]">{initialsFrom(name)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setCompareModalOpen(true)}
            className="bg-[#d4a574] px-4 py-2 rounded-2xl shadow-xs"
            activeOpacity={0.8}
          >
            <Text className="text-[#4a3728] text-xs font-black uppercase">Compare Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedMentors={activeCompareMentors}
        onMentorPress={onMentorPress}
      />

      {/* Filter Modal */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setFilterOpen(false)}>
          <Pressable className="bg-[#FAF9F6] border-t border-[#d4c4b5] rounded-t-3xl px-5 py-6 max-h-[85%]" onPress={e => e.stopPropagation()}>
            <View className="w-12 h-1.5 rounded-full bg-[#d4c4b5] self-center mb-4" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#4a3728]">Refine Search & Filters</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)} className="p-1">
                <X size={22} color={C.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Domain Filter */}
              <Text className="text-xs font-black text-[#8b7355] uppercase tracking-widest mb-3">Domain / Discipline</Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {DOMAINS.map((d, i) => (
                  <TouchableOpacity
                    key={`filter-domain-${d}-${i}`}
                    onPress={() => toggleDomain(d)}
                    activeOpacity={0.8}
                    className={`px-4 py-2 rounded-2xl border ${
                      selectedDomains.includes(d) ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#d4c4b5]'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedDomains.includes(d) ? 'text-white' : 'text-[#4a3728]'}`}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Experience Filter */}
              <Text className="text-xs font-black text-[#8b7355] uppercase tracking-widest mb-3">Experience Level</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {EXPERIENCES.map((e, i) => (
                  <TouchableOpacity
                    key={`filter-exp-${e}-${i}`}
                    onPress={() => toggleExp(e)}
                    activeOpacity={0.8}
                    className={`px-4 py-2 rounded-2xl border ${
                      selectedExps.includes(e) ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#d4c4b5]'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${selectedExps.includes(e) ? 'text-white' : 'text-[#4a3728]'}`}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-x-3 pt-2 pb-4">
                <TouchableOpacity
                  onPress={clearFilters}
                  activeOpacity={0.85}
                  className="flex-1 py-3.5 bg-white rounded-2xl items-center border border-[#d4c4b5]"
                >
                  <Text className="text-[#4a3728] font-black text-xs uppercase">Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterOpen(false)}
                  activeOpacity={0.85}
                  className="flex-1 py-3.5 bg-[#4a3728] rounded-2xl items-center shadow-xs"
                >
                  <Text className="text-white font-black text-xs uppercase">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── FIND MENTOR MODAL (QUICK POPUP) ──────────────────────────────────────────
interface FindMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMentor: (m: any) => void;
  mentors: any[];
}

const FindMentorModal: React.FC<FindMentorModalProps> = ({ isOpen, onClose, onSelectMentor, mentors }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return mentors;
    const tokens = raw.split(/\s+/).filter(Boolean);

    return mentors.filter((m: any) => {
      const name = getMentorName(m);
      const { role, company } = getMentorRoleAndCompany(m);
      const tags = getMentorTags(m).join(' ');
      const searchStr = `${name} ${role} ${company} ${tags} ${m.expertise?.join(' ') || ''}`.toLowerCase();
      return tokens.every(t => searchStr.includes(t));
    });
  }, [mentors, query]);

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-[#FAF9F6] border-t border-[#d4c4b5] rounded-t-3xl max-h-[88%]" onPress={e => e.stopPropagation()}>
          <View className="px-5 pt-4 pb-3">
            <View className="w-12 h-1.5 rounded-full bg-[#d4c4b5] self-center mb-3" />
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-black text-[#4a3728]">Find a Mentor</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
                <X size={22} color={C.primary} />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#d4c4b5] mb-2 shadow-xs">
              <Search size={18} color="#8b7355" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, skill, role, or company..."
                placeholderTextColor="#9a8775"
                className="flex-1 ml-3 text-sm text-[#4a3728] font-medium"
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <X size={16} color="#8a7a6a" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false} className="px-5 pb-8">
            {filtered.length === 0 ? (
              <View className="py-10 items-center justify-center">
                <Text className="text-xs font-bold text-[#8a7a6a]">No mentors matching "{query}"</Text>
              </View>
            ) : (
              filtered.map((m: any, i: number) => {
                const avatar = getMentorAvatar(m);
                const name = getMentorName(m);
                const { role, company } = getMentorRoleAndCompany(m);
                const { rating } = getMentorStats(m);

                return (
                  <TouchableOpacity
                    key={`find-mentor-${m.mentorId || m._id || m.id || i}`}
                    onPress={() => {
                      onSelectMentor(m);
                      onClose();
                    }}
                    activeOpacity={0.85}
                    className="flex-row items-center gap-x-3.5 py-3.5 border-b border-[#d4c4b5]/40"
                  >
                    <View className="w-12 h-12 rounded-2xl overflow-hidden border border-[#d4a574] bg-[#4a3728] items-center justify-center">
                      {avatar ? (
                        <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <Text className="text-white font-black text-sm">{initialsFrom(name)}</Text>
                      )}
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="font-black text-sm text-[#4a3728]">{name}</Text>
                      <Text className="text-xs text-[#7a6756] font-semibold">{role} • {company}</Text>
                      <View className="flex-row items-center gap-x-1 mt-0.5">
                        {rating > 0 ? (
                          <>
                            <Star size={11} color="#d97706" fill="#d97706" />
                            <Text className="text-xs font-black text-amber-800">{rating.toFixed(1)}</Text>
                          </>
                        ) : (
                          <Text className="text-[10px] font-bold text-[#7a5c3e]">New Mentor</Text>
                        )}
                      </View>
                    </View>
                    <ArrowRight size={16} color={C.primaryLight} />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── MAIN MENTOR LANDING SCREEN ───────────────────────────────────────────────
export const MentorLandingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const apiMentors = useAppSelector(selectMentors);
  const loading = useAppSelector(selectMentorLoading);

  const [isMentor, setIsMentor] = useState<boolean>(MentorshipService.cachedIsMentor === true);
  const [checkingMentor, setCheckingMentor] = useState<boolean>(MentorshipService.cachedIsMentor === null);
  const [findMentorOpen, setFindMentorOpen] = useState(false);
  const [becomeMentorOpen, setBecomeMentorOpen] = useState(false);
  const [enrichedMentors, setEnrichedMentors] = useState<any[]>([]);

  // Deduplicate and enrich mentors with user data
  useEffect(() => {
    let isMounted = true;
    const processMentors = async () => {
      const seen = new Set<string>();
      const unique = (apiMentors || []).filter(m => {
        const id = m.mentorId || m._id || (m as any).id || (m as any).userId;
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      try {
        const enriched = await FeedService.enrichPostsWithAuthorData(unique);
        if (isMounted) setEnrichedMentors(enriched);
      } catch {
        if (isMounted) setEnrichedMentors(unique);
      }
    };

    processMentors();
    return () => { isMounted = false; };
  }, [apiMentors]);

  const checkMentorStatus = useCallback(async () => {
    try {
      const profile = await MentorshipService.getMyMentor();
      if (profile && (profile._id || profile.mentorId || profile.id)) {
        setIsMentor(true);
      } else {
        setIsMentor(false);
      }
    } catch (err) {
      setIsMentor(false);
    } finally {
      setCheckingMentor(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadMentors());
      checkMentorStatus();
    }, [dispatch, checkMentorStatus])
  );

  const handleMentorPress = (m: any) => {
    const mentorId = m.id || m.mentorId || m._id || m.userId;
    if (mentorId) {
      navigation.navigate('MentorProfile', { mentorId });
    }
  };

  const handleDashboardClick = async () => {
    if (isMentor) {
      navigation.navigate('MentorDashboard');
      return;
    }

    setCheckingMentor(true);
    try {
      const profile = await MentorshipService.getMyMentor();
      if (profile && (profile._id || profile.mentorId || profile.id)) {
        setIsMentor(true);
        navigation.navigate('MentorDashboard');
        return;
      }
    } catch (e) {
      // ignore
    } finally {
      setCheckingMentor(false);
    }

    // Default to Mentee / User Dashboard
    navigation.navigate('UserDashboard');
  };

  return (
    <BottomBar activeTabOverride="Mentorship">
      <SafeAreaView className="flex-1 bg-[#f7f3ee]" edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" translucent={false} />

        {/* Sticky Navbar */}
        <Navbar isMentor={isMentor} onDashboard={handleDashboardClick} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 110 }}
          onScroll={emitBottomBarScroll}
          onScrollEndDrag={emitBottomBarScrollEnd}
          onMomentumScrollEnd={emitBottomBarScrollEnd}
          scrollEventThrottle={16}
        >
          <HeroSection />
          <ActionCards
            onFindMentor={() => setFindMentorOpen(true)}
            onBecomeMentor={() => setBecomeMentorOpen(true)}
            onSeniorMentor={() => {
              navigation.navigate('SeniorMentorApplication');
            }}
            isMentor={isMentor}
            checkingMentor={checkingMentor}
          />
          <TopMentorsMarquee
            mentors={enrichedMentors.length > 0 ? enrichedMentors : apiMentors}
            onMentorPress={handleMentorPress}
          />
          <MentorDiscovery
            mentors={enrichedMentors.length > 0 ? enrichedMentors : apiMentors}
            loading={loading && enrichedMentors.length === 0}
            onMentorPress={handleMentorPress}
          />
          <View className="h-10" />
        </ScrollView>

        <FindMentorModal
          isOpen={findMentorOpen}
          onClose={() => setFindMentorOpen(false)}
          mentors={enrichedMentors.length > 0 ? enrichedMentors : apiMentors}
          onSelectMentor={handleMentorPress}
        />
        <BecomeMentorModal
          isOpen={becomeMentorOpen}
          onClose={() => setBecomeMentorOpen(false)}
          onSuccess={() => {
            setIsMentor(true);
            dispatch(loadMentors());
            navigation.navigate('MentorDashboard');
          }}
        />
      </SafeAreaView>
    </BottomBar>
  );
};

export default MentorLandingScreen;