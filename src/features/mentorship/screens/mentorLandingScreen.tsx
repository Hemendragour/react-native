import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, TextInput,
  SafeAreaView, StatusBar, Modal, Pressable, Animated,
  Dimensions, FlatList, ActivityIndicator,
} from 'react-native';
import {
  Search, Globe, User, ArrowRight, Star, Award, Users,
  Clock, Briefcase, ShieldCheck, Zap, Filter,
  MessageSquare, ChevronDown, Rocket, CheckCircle2, X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MENTORS, MASTERCLASSES, UPCOMING_MASTERCLASSES, TOP_COMPANIES,
  TOP_COMPANIES_ROW2, FAQS, NEXT_7_DAYS, GRADIENT_COLORS,
} from '../data/mentorMockdata';

// TODO: import MentorService from '@/lib/api/mentorship.service';
// TODO: import { useAuth } from '@/hooks/useAuth';
// TODO: import { useProfile } from '@/store/hooks';

const { width: SW } = Dimensions.get('window');
const C = { dark: '#4a3728', mid: '#7a5c3e', light: '#8b7355', bg: '#FAF9F6', border: '#ece7e2', surface: '#f8f6f4' };

// ─── Mentor Card ──────────────────────────────────────────────────────────────
const MentorCard: React.FC<{ mentor: any; onPress?: () => void }> = ({ mentor, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="w-64 bg-[#FAF9F6] border border-[#ece7e2] rounded-3xl p-5 shadow-md mr-4"
  >
    <View className="items-center mb-3">
      <View className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
        {mentor.image
          ? <Image source={{ uri: mentor.image }} className="w-full h-full" resizeMode="cover" />
          : <View className="w-full h-full bg-[#4a3728] items-center justify-center">
              <Text className="text-white font-black text-xl">{mentor.name?.[0] ?? '?'}</Text>
            </View>
        }
      </View>
    </View>
    <Text className="font-black text-sm text-center text-[#4a3728] mb-0.5" numberOfLines={1}>{mentor.isDummy ? 'Coming Soon' : mentor.name}</Text>
    <Text className="text-[10px] text-slate-500 font-bold text-center mb-2 uppercase" numberOfLines={1}>
      {mentor.role} @ {mentor.company}
    </Text>
    {!mentor.isDummy && (
      <View className="flex-row items-center justify-center gap-x-1 mb-2">
        <Star size={13} color={C.light} fill={C.light} />
        <Text className="text-xs font-black text-[#4a3728]">{mentor.rating}</Text>
        <Text className="text-xs text-gray-500">({mentor.sessions} sessions)</Text>
      </View>
    )}
    <View className="flex-row flex-wrap gap-1 justify-center mb-2">
      {mentor.tags?.map((tag: string) => (
        <View key={tag} className="bg-white px-2 py-0.5 rounded-full border border-[#ece7e2]">
          <Text className="text-[9px] font-black text-[#4a3728] uppercase">{tag}</Text>
        </View>
      ))}
    </View>
    <View className="flex-row items-center justify-center gap-x-1 pt-2 border-t border-[#f0edea]">
      <Award size={13} color={C.light} />
      <Text className="text-xs font-bold text-[#4a3728]">{mentor.exp} Experience</Text>
    </View>
  </TouchableOpacity>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar: React.FC<{ isMentor: boolean; onDashboard: () => void }> = ({ isMentor, onDashboard }) => (
  <View className="bg-white/90 border-b border-[#ece7e2] px-4 py-7 flex-row items-center justify-between">
    <View className="flex-row items-center gap-x-2 mt-2">
      <View className="w-7 h-7 bg-[#4a3728] rounded-lg" />
      <Text className="text-base font-black tracking-tighter text-[#4a3728]">THRONE</Text>
    </View>
    <TouchableOpacity onPress={onDashboard} activeOpacity={0.85}
      className="bg-[#4a3728] px-4 py-2 rounded-full flex-row items-center gap-x-1.5 mt-2">
      <Text className="text-white text-[10px] font-black uppercase tracking-wider">Dashboard</Text>
      <User size={13} color="#fff" />
    </TouchableOpacity>
  </View>
);

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => (
  <View className="py-14 px-6 items-center bg-[#FAF9F6]">
    <Text className="text-5xl font-black tracking-tighter text-[#4a3728] text-center leading-tight mb-2">
      LEVEL UP{'\n'}
      <Text className="text-[#8b7355] italic">Faster.</Text>
    </Text>
    <Text className="text-sm text-slate-500 font-medium text-center max-w-xs leading-5 mt-2">
      Direct access to the world's most successful tech leaders. Built for serious builders.
    </Text>
  </View>
);

// ─── Action Cards ─────────────────────────────────────────────────────────────
const ActionCards: React.FC<{
  onFindMentor: () => void;
  onBecomeMentor: () => void;
  isMentor: boolean;
}> = ({ onFindMentor, onBecomeMentor, isMentor }) => (
  <View className="px-4 pb-8 gap-y-4">
    <TouchableOpacity onPress={onFindMentor} activeOpacity={0.85}
      className="bg-white rounded-3xl p-5 border border-[#ece7e2] shadow-md">
      <View className="w-11 h-11 bg-[#4a3728] rounded-2xl items-center justify-center mb-3 shadow-md">
        <Search size={22} color="#fff" />
      </View>
      <Text className="text-lg font-black text-[#4a3728] mb-1">Find Mentor</Text>
      <Text className="text-xs text-slate-500 font-medium mb-3 leading-4">
        Connect with 500+ industry experts. Get personalized 1:1 guidance.
      </Text>
      <View className="flex-row items-center gap-x-2">
        <Text className="text-xs font-bold text-[#8b7355]">Explore Mentors</Text>
        <ArrowRight size={14} color={C.light} />
      </View>
    </TouchableOpacity>

    {!isMentor && (
      <TouchableOpacity onPress={onBecomeMentor} activeOpacity={0.85}
        className="bg-white rounded-3xl p-5 border border-[#ece7e2] shadow-md">
        <View className="w-11 h-11 bg-[#8b7355] rounded-2xl items-center justify-center mb-3 shadow-md">
          <Users size={22} color="#fff" />
        </View>
        <Text className="text-lg font-black text-[#4a3728] mb-1">Become Mentor</Text>
        <Text className="text-xs text-slate-500 font-medium mb-3 leading-4">
          Share your expertise with aspiring professionals. Build your brand and earn.
        </Text>
        <View className="flex-row items-center gap-x-2">
          <Text className="text-xs font-bold text-[#4a3728]">Apply Now</Text>
          <ArrowRight size={14} color={C.dark} />
        </View>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Top Mentors Marquee ──────────────────────────────────────────────────────
const TopMentorsMarquee: React.FC<{ mentors: any[] }> = ({ mentors }) => (
  <View className="py-10 bg-white border-y border-[#f0edea]">
    <Text className="text-3xl font-black tracking-tighter text-center mb-1">
      <Text className="text-[#8b7355]">TOP</Text> MENTORS
    </Text>
    <Text className="text-xs text-slate-500 font-medium text-center mb-6">
      Handpicked experts from leading tech companies
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
      {[...mentors, ...mentors].map((m, i) => (
        <MentorCard key={i} mentor={m} />
      ))}
    </ScrollView>
  </View>
);

// ─── Mentor Discovery + Filter ────────────────────────────────────────────────
const DOMAINS = ['Tech/Engineering', 'Product/Design', 'Marketing/Growth', 'Data Science/AI'];
const EXPERIENCES = ['0-3 Yrs', '3-7 Yrs', '7-12 Yrs', '12+ Yrs'];

const MentorDiscovery: React.FC<{ mentors: any[]; onMentorPress: (m: any) => void }> = ({ mentors, onMentorPress }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExps, setSelectedExps] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [filtered, setFiltered] = useState(mentors);
  const [compareList, setCompareList] = useState<number[]>([]);

  const toggleDomain = (d: string) => setSelectedDomains(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const toggleExp = (e: string) => setSelectedExps(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);
  const toggleCompare = (id: number) => setCompareList(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);

  const applyFilters = () => {
    let r = [...mentors];
    if (companySearch.trim()) r = r.filter(m => m.company?.toLowerCase().includes(companySearch.toLowerCase()) || m.name?.toLowerCase().includes(companySearch.toLowerCase()));
    setFiltered(r);
    setFilterOpen(false);
  };
  const clearFilters = () => { setSelectedDomains([]); setSelectedExps([]); setCompanySearch(''); setFiltered(mentors); setFilterOpen(false); };

  return (
    <View className="py-8 px-4">
      {/* Filter button */}
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-xl font-black text-[#4a3728]">Find Your Mentor</Text>
        <TouchableOpacity onPress={() => setFilterOpen(true)} activeOpacity={0.8}
          className="flex-row items-center gap-x-2 bg-[#4a3728] px-4 py-2 rounded-full">
          <Filter size={14} color="#fff" />
          <Text className="text-[10px] font-black text-white uppercase tracking-wider">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Mentor Grid */}
      <View className="flex-row flex-wrap gap-3">
        {filtered.map((m) => (
          <TouchableOpacity key={m.id} onPress={() => onMentorPress(m)} activeOpacity={0.85}
            className="bg-white rounded-3xl p-4 border border-[#ece7e2] shadow-md"
            style={{ width: (SW - 40) / 2 - 6 }}>
            <View className="items-center mb-2">
              <View className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-sm mb-2">
                {m.image
                  ? <Image source={{ uri: m.image }} className="w-full h-full" resizeMode="cover" />
                  : <View className="w-full h-full bg-[#4a3728] items-center justify-center">
                      <Text className="text-white font-bold">{m.name?.[0]}</Text>
                    </View>
                }
              </View>
              <Text className="font-black text-xs text-[#4a3728] text-center" numberOfLines={1}>{m.name}</Text>
              <Text className="text-[9px] text-slate-500 font-bold text-center uppercase" numberOfLines={1}>{m.role} @ {m.company}</Text>
            </View>
            <View className="flex-row items-center justify-center gap-x-1 mb-2">
              <Star size={11} color={C.light} fill={C.light} />
              <Text className="text-[11px] font-black text-[#4a3728]">{m.rating}</Text>
              <Text className="text-[10px] text-gray-400">({m.sessions})</Text>
            </View>
            <View className="flex-row flex-wrap gap-1 justify-center mb-2">
              {m.tags?.slice(0,2).map((t: string) => (
                <View key={t} className="bg-[#f8f6f4] px-1.5 py-0.5 rounded-full">
                  <Text className="text-[8px] font-black text-[#4a3728] uppercase">{t}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => onMentorPress(m)} activeOpacity={0.85}
              className="w-full py-2 bg-[#4a3728] rounded-2xl items-center mt-1">
              <Text className="text-white text-[9px] font-black uppercase tracking-wider">Book</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <View className="mt-6 bg-[#4a3728] rounded-3xl px-5 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2">
            <Text className="text-[10px] font-black text-[#8b7355] uppercase tracking-wider">Compare</Text>
            <View className="flex-row">
              {compareList.map(id => {
                const m = mentors.find(x => x.id === id);
                return m ? (
                  <View key={id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#4a3728] -ml-1">
                    <Image source={{ uri: m.image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                ) : null;
              })}
            </View>
          </View>
          <TouchableOpacity className="bg-[#8b7355] px-4 py-2 rounded-full" activeOpacity={0.8}>
            <Text className="text-white text-[10px] font-black">Compare Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setFilterOpen(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 py-6" onPress={e => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-black text-[#4a3728]">Refine Search</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)}><X size={20} color={C.dark} /></TouchableOpacity>
            </View>

            {/* Company Search */}
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company / Name</Text>
            <TextInput value={companySearch} onChangeText={setCompanySearch} placeholder="Search..."
              placeholderTextColor="#b0a090" className="w-full px-4 py-3 bg-[#f8f6f4] border border-[#ece7e2] rounded-2xl text-sm text-[#4a3728] mb-5" />

            {/* Domain Filter */}
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Domain</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {DOMAINS.map(d => (
                <TouchableOpacity key={d} onPress={() => toggleDomain(d)} activeOpacity={0.8}
                  className={`px-3 py-1.5 rounded-full border ${selectedDomains.includes(d) ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#ece7e2]'}`}>
                  <Text className={`text-xs font-bold ${selectedDomains.includes(d) ? 'text-white' : 'text-[#4a3728]'}`}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Experience Filter */}
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Experience</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {EXPERIENCES.map(e => (
                <TouchableOpacity key={e} onPress={() => toggleExp(e)} activeOpacity={0.8}
                  className={`px-3 py-1.5 rounded-full border ${selectedExps.includes(e) ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#ece7e2]'}`}>
                  <Text className={`text-xs font-bold ${selectedExps.includes(e) ? 'text-white' : 'text-[#4a3728]'}`}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-x-3">
              <TouchableOpacity onPress={clearFilters} activeOpacity={0.85}
                className="flex-1 py-3 bg-[#f8f6f4] rounded-2xl items-center border border-[#ece7e2]">
                <Text className="text-[#4a3728] font-black text-xs uppercase">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} activeOpacity={0.85}
                className="flex-1 py-3 bg-[#4a3728] rounded-2xl items-center">
                <Text className="text-white font-black text-xs uppercase">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── Company Logos ────────────────────────────────────────────────────────────
const CompanyLogos: React.FC = () => (
  <View className="py-10 bg-[#FAF9F6] border-y border-[#ece7e2]">
    <Text className="text-[10px] font-black uppercase tracking-[5px] text-[#8b7355] text-center mb-2">Trusted Partners</Text>
    <Text className="text-2xl font-black tracking-tighter text-[#4a3728] text-center mb-6">World-Class Companies</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
      {[...TOP_COMPANIES, ...TOP_COMPANIES_ROW2].map((c, i) => (
        <View key={i} className="w-32 h-16 bg-white border border-[#ece7e2] rounded-2xl items-center justify-center">
          <Text className="font-black text-xs" style={{ color: c.color }}>{c.name}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

// ─── Slot Picker ──────────────────────────────────────────────────────────────
const SlotPicker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(0);
  const TIMES = ['12:30 PM', '02:00 PM', '06:00 PM', '07:30 PM'];
  return (
    <View className="px-4 py-10">
      <View className="bg-white rounded-[32px] p-6 border border-[#ece7e2] shadow-md">
        <Text className="text-[10px] font-black text-[#8b7355] uppercase tracking-[5px] mb-2">Scheduling v2.0</Text>
        <Text className="text-2xl font-black tracking-tighter text-[#4a3728] mb-1">PICK A TIME.</Text>
        <Text className="text-[#8b7355] italic font-black text-lg mb-4">Zero Friction.</Text>
        <Text className="text-xs text-slate-500 font-medium mb-5">No calendars, just simplicity. Choose your date and get started.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-x-2">
            {NEXT_7_DAYS.map((d, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedDate(i)} activeOpacity={0.8}
                className={`w-14 h-18 rounded-2xl items-center justify-center py-3 px-1 ${selectedDate === i ? 'bg-[#4a3728]' : 'bg-[#f8f6f4]'}`}>
                <Text className={`text-[9px] font-black uppercase mb-1 ${selectedDate === i ? 'text-white' : 'text-slate-500'}`}>{d.day}</Text>
                <Text className={`text-base font-black ${selectedDate === i ? 'text-white' : 'text-[#4a3728]'}`}>{d.date.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {TIMES.map(t => (
            <TouchableOpacity key={t} activeOpacity={0.8}
              className="flex-1 py-3 rounded-2xl border border-[#ece7e2] items-center" style={{ minWidth: '45%' }}>
              <Text className="text-xs font-black text-[#4a3728]">{t}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity activeOpacity={0.8} className="w-full py-3 rounded-2xl bg-[#8b7355]/10 items-center">
            <Text className="text-xs font-black text-[#8b7355]">Join Waitlist</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.85} className="w-full py-4 bg-[#4a3728] rounded-2xl items-center">
          <Text className="text-white font-black text-[11px] uppercase tracking-[4px]">Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Masterclasses ────────────────────────────────────────────────────────────
const MasterclassesSection: React.FC = () => (
  <View className="py-10 px-4 bg-white">
    <Text className="text-2xl font-black tracking-tighter text-[#4a3728] text-center mb-1">
      Master<Text className="text-[#8b7355]">classes</Text>
    </Text>
    <Text className="text-xs text-slate-500 font-medium text-center mb-6">Learn from industry experts</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-x-4 pr-4">
        {MASTERCLASSES.map((mc, i) => (
          <View key={i} className="w-64 rounded-3xl overflow-hidden border border-[#ece7e2] shadow-md bg-white">
            <Image source={{ uri: mc.image }} className="w-full h-40" resizeMode="cover" />
            <View className="p-4">
              <View className="flex-row items-center gap-x-1 mb-2">
                <View className="bg-[#f8f6f4] px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-black text-[#4a3728] uppercase">{mc.badge}</Text>
                </View>
                <View className="flex-row items-center gap-x-1 ml-auto">
                  <Clock size={11} color={C.mid} />
                  <Text className="text-[9px] font-bold text-[#7a5c3e]">{mc.duration}</Text>
                </View>
              </View>
              <Text className="font-black text-sm text-[#4a3728] mb-2 leading-4" numberOfLines={2}>{mc.title}</Text>
              <View className="flex-row items-center gap-x-2 mb-2">
                <Image source={{ uri: mc.mentorImage }} className="w-6 h-6 rounded-full" />
                <View>
                  <Text className="text-[10px] font-bold text-[#4a3728]">{mc.mentorName}</Text>
                  <Text className="text-[8px] text-slate-500">{mc.mentorRole}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-x-2">
                  <View className="flex-row items-center gap-x-0.5">
                    <Users size={11} color={C.light} />
                    <Text className="text-[10px] font-bold text-[#4a3728]">{mc.enrolled}</Text>
                  </View>
                  <View className="flex-row items-center gap-x-0.5">
                    <Star size={11} color={C.light} fill={C.light} />
                    <Text className="text-[10px] font-bold text-[#4a3728]">{mc.rating}</Text>
                  </View>
                </View>
                <Text className="font-black text-sm text-[#4a3728]">₹{mc.price}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} className="w-full py-2.5 bg-[#4a3728] rounded-2xl items-center">
                <Text className="text-white text-[9px] font-black uppercase tracking-[3px]">Enroll Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

// ─── Upcoming Masterclasses ───────────────────────────────────────────────────
const UpcomingMasterclassesSection: React.FC = () => (
  <View className="py-10 px-4 bg-[#FAF9F6]">
    <Text className="text-2xl font-black tracking-tighter text-[#4a3728] mb-1">
      Upcoming <Text className="text-[#8b7355]">Masterclasses</Text>
    </Text>
    <Text className="text-xs text-slate-500 font-medium mb-6">Reserve your spot for live sessions</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-x-4 pr-4">
        {UPCOMING_MASTERCLASSES.map((umc, i) => (
          <View key={i} className="w-60 rounded-3xl overflow-hidden border border-[#ece7e2] shadow-md bg-white">
            <View className="relative">
              <Image source={{ uri: umc.image }} className="w-full h-36" resizeMode="cover" />
              <View className="absolute bottom-3 left-3 gap-y-1.5">
                <View className="flex-row items-center gap-x-1 bg-white/95 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#4a3728]">📅 {umc.date}</Text>
                </View>
                <View className="flex-row items-center gap-x-1 bg-white/95 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#4a3728]">🕐 {umc.time}</Text>
                </View>
              </View>
            </View>
            <View className="p-4">
              <Text className="font-black text-sm text-[#4a3728] mb-2 leading-4" numberOfLines={2}>{umc.title}</Text>
              <Text className="text-[9px] text-slate-500 font-bold uppercase mb-3" numberOfLines={1}>
                By {umc.mentorName} • {umc.mentorRole}
              </Text>
              <TouchableOpacity activeOpacity={0.85} className="w-full py-2.5 bg-[#4a3728] rounded-2xl items-center">
                <Text className="text-white text-[9px] font-black uppercase tracking-[3px]">Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
);

// ─── Impact Stats ─────────────────────────────────────────────────────────────
const ImpactStats: React.FC = () => {
  const stats = [
    { icon: <Users size={24} color="#fff" />, value: '3000+', label: 'Expert Members' },
    { icon: <Clock size={24} color="#fff" />, value: '350K+', label: 'Mentorship Minutes' },
    { icon: <Briefcase size={24} color="#fff" />, value: '70+', label: 'Career Domains' },
  ];
  return (
    <View className="py-10 px-4 bg-[#FAF9F6]">
      <Text className="text-2xl font-black tracking-tighter text-[#4a3728] text-center mb-1">
        Our <Text className="text-[#8b7355]">Impact</Text>
      </Text>
      <Text className="text-xs text-slate-500 font-medium text-center mb-8">
        Transforming careers through meaningful connections
      </Text>
      <View className="gap-y-4">
        {stats.map((s, i) => (
          <View key={i} className="bg-white rounded-3xl p-6 border-2 border-[#ece7e2] shadow-lg flex-row items-center gap-x-5">
            <View className="w-14 h-14 bg-[#4a3728] rounded-2xl items-center justify-center shadow-md">
              {s.icon}
            </View>
            <View>
              <Text className="text-4xl font-black text-[#4a3728]">{s.value}</Text>
              <Text className="text-sm font-bold text-slate-600 uppercase tracking-wider">{s.label}</Text>
              <View className="w-10 h-1 bg-[#4a3728] rounded-full mt-2" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Advantage Cards ──────────────────────────────────────────────────────────
const AdvantageCards: React.FC = () => {
  const cards = [
    { icon: <ShieldCheck size={22} color="#fff" />, label: 'Verified Experts', desc: 'Industry-vetted professionals', bg: '#4a3728' },
    { icon: <Zap size={22} color="#fff" />, label: 'Instant Booking', desc: 'Book sessions in seconds', bg: '#8b7355' },
    { icon: <Star size={22} color="#fff" />, label: 'Best Value', desc: 'Premium quality, fair pricing', bg: '#4a3728' },
    { icon: <Globe size={22} color="#fff" />, label: 'Global Reach', desc: 'Connect across time zones', bg: '#8b7355' },
  ];
  return (
    <View className="py-10 px-4 bg-[#FAF9F6]">
      <Text className="text-2xl font-black tracking-tighter text-[#4a3728] text-center mb-1">
        The <Text className="text-[#8b7355]">Unstoppable</Text> Advantage
      </Text>
      <Text className="text-xs text-slate-500 text-center font-medium mb-8">Why thousands choose us for their career growth</Text>
      <View className="flex-row flex-wrap gap-3">
        {cards.map((c, i) => (
          <View key={i} className="bg-white rounded-3xl p-5 border-2 border-[#ece7e2] shadow-md items-center"
            style={{ width: (SW - 40) / 2 - 6 }}>
            <View className="w-11 h-11 rounded-xl items-center justify-center mb-3 shadow-md" style={{ backgroundColor: c.bg }}>
              {c.icon}
            </View>
            <Text className="text-xs font-black text-[#4a3728] text-center uppercase tracking-wide mb-1">{c.label}</Text>
            <Text className="text-[10px] text-slate-500 text-center font-medium">{c.desc}</Text>
            <View className="w-6 h-0.5 bg-[#4a3728] mt-3 rounded-full" />
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── FAQ Section ──────────────────────────────────────────────────────────────
const FAQSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <View className="py-10 px-4">
      <View className="flex-row items-center justify-center gap-x-2 mb-2">
        <MessageSquare size={14} color={C.mid} />
        <Text className="text-sm font-semibold text-[#4a3728]">Help Center</Text>
      </View>
      <Text className="text-3xl font-black text-[#4a3728] text-center mb-1">FAQs</Text>
      <Text className="text-xs text-slate-500 text-center mb-6">Quick answers to common questions</Text>
      <View className="gap-y-3">
        {FAQS.map((f, i) => (
          <TouchableOpacity key={i} onPress={() => setOpenFaq(openFaq === i ? null : i)}
            activeOpacity={0.85} className="bg-white border-2 border-[#e0d8cf] rounded-2xl px-5 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-black text-[#4a3728] flex-1 pr-4 text-sm" numberOfLines={openFaq === i ? undefined : 2}>{f.q}</Text>
              <View className={`w-8 h-8 rounded-full bg-[#f6ede8] border-2 border-[#e0d8cf] items-center justify-center`}>
                <ChevronDown size={16} color={C.dark} style={{ transform: [{ rotate: openFaq === i ? '180deg' : '0deg' }] }} />
              </View>
            </View>
            {openFaq === i && (
              <Text className="text-xs text-slate-500 font-semibold mt-3 leading-5">{f.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ─── CTA Section ─────────────────────────────────────────────────────────────
const CTASection: React.FC = () => (
  <View className="px-4 py-10">
    <View className="bg-[#4a3728] rounded-3xl p-10 items-center shadow-2xl">
      <View className="flex-row items-center gap-x-2 bg-white/20 px-4 py-2 rounded-full mb-5 border border-white/30">
        <Rocket size={14} color="#fff" />
        <Text className="text-sm font-bold text-white">Start Your Journey</Text>
      </View>
      <Text className="text-3xl font-black text-white mb-3 text-center">Ready to Level Up?</Text>
      <Text className="text-white/90 text-sm font-semibold text-center mb-7 max-w-xs leading-5">
        Join thousands transforming their careers with world-class mentorship
      </Text>
      <TouchableOpacity activeOpacity={0.85}
        className="bg-white px-8 py-4 rounded-full flex-row items-center gap-x-3 shadow-xl">
        <Users size={20} color={C.dark} />
        <Text className="text-[#4a3728] font-black text-sm">Get Started Now</Text>
        <ArrowRight size={20} color={C.dark} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Become Mentor Modal ──────────────────────────────────────────────────────
const BecomeMentorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [formStep, setFormStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [motivation, setMotivation] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const navigation = useNavigation<any>();

  const inputCls = "w-full px-4 py-3 bg-[#f8f6f4] border border-[#ece7e2] rounded-2xl text-sm text-[#4a3728] mb-3";

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 items-center justify-center px-4" onPress={onClose}>
        <Pressable className="w-full bg-white rounded-[32px] overflow-hidden shadow-2xl max-h-[90%]"
          onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View className="bg-[#4a3728] p-8 relative">
            <TouchableOpacity onPress={onClose} className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-full items-center justify-center" activeOpacity={0.7}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mb-3">
              <Users size={28} color="#fff" />
            </View>
            <Text className="text-2xl font-black text-white mb-1">Become a Mentor</Text>
            <Text className="text-white/80 font-medium text-sm">Share your expertise and inspire the next generation</Text>
            {/* Step dots */}
            <View className="flex-row gap-x-2 mt-5">
              {[1, 2, 3].map(s => (
                <View key={s} className={`h-1.5 rounded-full flex-1 ${formStep >= s ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </View>
          </View>

          <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
            {formStep === 1 && (
              <View>
                <Text className="text-xl font-black text-[#4a3728] mb-5">Personal Information</Text>
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Full Name *</Text>
                <TextInput value={fullName} onChangeText={setFullName} placeholder="John Doe" placeholderTextColor="#b0a090" className={inputCls} />
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Email Address *</Text>
                <TextInput value={email} onChangeText={setEmail} placeholder="john@example.com" placeholderTextColor="#b0a090" keyboardType="email-address" autoCapitalize="none" className={inputCls} />
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Location *</Text>
                <TextInput value={location} onChangeText={setLocation} placeholder="City, Country" placeholderTextColor="#b0a090" className={inputCls} />
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Current Role *</Text>
                <TextInput value={currentRole} onChangeText={setCurrentRole} placeholder="Software Engineer @ Company" placeholderTextColor="#b0a090" className={inputCls} />
              </View>
            )}

            {formStep === 2 && (
              <View>
                <Text className="text-xl font-black text-[#4a3728] mb-5">Professional Details</Text>
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Expertise Areas *</Text>
                <TextInput value={expertise} onChangeText={setExpertise} placeholder="Past Experience, Skills, and Interests..." placeholderTextColor="#b0a090" multiline numberOfLines={4} textAlignVertical="top" className={`${inputCls} h-24`} />
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Bio / About You *</Text>
                <TextInput value={bio} onChangeText={setBio} placeholder="Tell us about your journey, achievements, and passion..." placeholderTextColor="#b0a090" multiline numberOfLines={4} textAlignVertical="top" className={`${inputCls} h-24`} />
              </View>
            )}

            {formStep === 3 && (
              <View>
                <Text className="text-xl font-black text-[#4a3728] mb-5">Terms & Conditions</Text>
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">Why do you want to become a mentor?</Text>
                <TextInput value={motivation} onChangeText={setMotivation} placeholder="Share your motivation and goals..." placeholderTextColor="#b0a090" multiline numberOfLines={4} textAlignVertical="top" className={`${inputCls} h-24`} />
                {[{ val: agree1, set: setAgree1 }, { val: agree2, set: setAgree2 }].map(({ val, set }, i) => (
                  <TouchableOpacity key={i} onPress={() => set(!val)} activeOpacity={0.8}
                    className="flex-row items-start gap-x-3 bg-[#f8f6f4] border border-[#ece7e2] rounded-2xl p-4 mb-3">
                    <View className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${val ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-gray-300'}`}>
                      {val && <Text className="text-white text-xs font-bold">✓</Text>}
                    </View>
                    <Text className="text-xs text-slate-600 font-medium flex-1 leading-4">
                      I agree to the terms and conditions and confirm that all information provided is accurate.
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Footer */}
            <View className="flex-row items-center justify-between pt-4 border-t border-[#ece7e2] mt-4 mb-2">
              <View className="flex-row gap-x-2">
                {formStep > 1 && (
                  <TouchableOpacity onPress={() => setFormStep(s => s - 1)} activeOpacity={0.8}
                    className="px-5 py-3 bg-[#f8f6f4] rounded-2xl">
                    <Text className="text-[#4a3728] font-bold text-sm">Back</Text>
                  </TouchableOpacity>
                )}
              </View>
              {formStep < 3 ? (
                <TouchableOpacity onPress={() => setFormStep(s => s + 1)} activeOpacity={0.85}
                  className="px-6 py-3 bg-[#4a3728] rounded-2xl flex-row items-center gap-x-2">
                  <Text className="text-white font-bold text-sm">Next Step</Text>
                  <ArrowRight size={14} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { navigation.navigate('MentorProfile'); onClose(); setFormStep(1); }}
                  activeOpacity={0.85} className="px-6 py-3 bg-[#4a3728] rounded-2xl flex-row items-center gap-x-2">
                  <Text className="text-white font-bold text-sm">Submit Application</Text>
                  <CheckCircle2 size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Find Mentor Modal ────────────────────────────────────────────────────────
const FindMentorModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelectMentor: (m: any) => void }> = ({ isOpen, onClose, onSelectMentor }) => {
  const [query, setQuery] = useState('');
  const filtered = MENTORS.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.company.toLowerCase().includes(query.toLowerCase()) ||
    m.tags.some((t: string) => t.toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-t-3xl" onPress={e => e.stopPropagation()}>
          <View className="px-5 pt-5 pb-3">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-[#4a3728]">Find a Mentor</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}><X size={20} color={C.dark} /></TouchableOpacity>
            </View>
            <View className="flex-row items-center bg-[#f8f6f4] rounded-2xl px-4 py-3 border border-[#ece7e2] mb-3">
              <Search size={16} color="#8b7355" />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search by name, skill, or company..."
                placeholderTextColor="#b0a090" className="flex-1 ml-3 text-sm text-[#4a3728]" autoFocus />
            </View>
          </View>
          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false} className="px-5 pb-6">
            {filtered.map(m => (
              <TouchableOpacity key={m.id} onPress={() => { onSelectMentor(m); onClose(); }}
                activeOpacity={0.85} className="flex-row items-center gap-x-4 py-3 border-b border-[#f0edea]">
                <Image source={{ uri: m.image }} className="w-12 h-12 rounded-full" resizeMode="cover" />
                <View className="flex-1">
                  <Text className="font-black text-sm text-[#4a3728]">{m.name}</Text>
                  <Text className="text-xs text-slate-500 font-bold">{m.role} @ {m.company}</Text>
                  <View className="flex-row items-center gap-x-1 mt-0.5">
                    <Star size={11} color={C.light} fill={C.light} />
                    <Text className="text-xs font-bold text-[#4a3728]">{m.rating}</Text>
                  </View>
                </View>
                <ArrowRight size={16} color={C.mid} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
const MentorLandingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isMentor, setIsMentor] = useState(false);
  const [findMentorOpen, setFindMentorOpen] = useState(false);
  const [becomeMentorOpen, setBecomeMentorOpen] = useState(false);
  const [apiMentors, setApiMentors] = useState(MENTORS); // stub — replace with MentorService call

  // TODO: Check isMentor from MentorService.getMentorByUserId(user.userId)

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9F6]">
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Sticky Navbar */}
      <Navbar isMentor={isMentor} onDashboard={() => navigation.navigate('MentorDashboard')} />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HeroSection />
        <ActionCards onFindMentor={() => setFindMentorOpen(true)} onBecomeMentor={() => setBecomeMentorOpen(true)} isMentor={isMentor} />
        <TopMentorsMarquee mentors={apiMentors} />
        <MentorDiscovery mentors={apiMentors} onMentorPress={(m) => navigation.navigate('MentorProfile', { mentorId: m.id })} />
        <CompanyLogos />
        <SlotPicker />
        <MasterclassesSection />
        <UpcomingMasterclassesSection />
        <ImpactStats />
        <AdvantageCards />
        <CTASection />
        <FAQSection />
        <View className="h-10" />
      </ScrollView>

      <FindMentorModal isOpen={findMentorOpen} onClose={() => setFindMentorOpen(false)}
        onSelectMentor={(m) => navigation.navigate('MentorProfile', { mentorId: m.id })} />
      <BecomeMentorModal isOpen={becomeMentorOpen} onClose={() => setBecomeMentorOpen(false)} />
    </SafeAreaView>
  );
};

export default MentorLandingScreen;