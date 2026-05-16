import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, TextInput,
  Modal, Pressable, Animated, Dimensions, 
  StatusBar, ActivityIndicator,
  Platform,StatusBar as RNStatusBar
} from 'react-native';
import {
  Star, BarChart3, ArrowUp, ArrowDown, Users, Calendar,
  Clock, CreditCard, TrendingUp, Shield, Award, CheckCircle,
  Sparkles, MessageSquare, ChevronRight, X, Menu,
  Plus, Trash2, Edit3, Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DASHBOARD_MENU_ITEMS } from '../data/mentorMockdata';
import BottomBar from '../../../shared/components/BottomBar';
 import { SafeAreaView } from 'react-native-safe-area-context';
// TODO: import MentorService from '@/lib/api/mentorship.service';
// TODO: import SessionService from '@/lib/api/session.service';


const { width: SW } = Dimensions.get('window');
const DRAWER_W = SW * 0.8;
const C = { dark: '#4a3728', mid: '#7a5c3e', light: '#8b7355', bg: '#f6ede8', surface: '#fbf7f3', border: '#e0d8cf' };


// ─── Shared helpers ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <View className="flex-row items-center gap-x-3 mb-6">
    <View className="w-11 h-11 rounded-xl items-center justify-center shadow-md" style={{ backgroundColor: C.dark }}>{icon}</View>
    <View>
      <Text className="text-2xl font-bold text-[#4a3728]">{title}</Text>
      <Text className="text-sm text-[#8a7a6a]">{subtitle}</Text>
    </View>
  </View>
);


const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <View className={`bg-white rounded-2xl p-5 shadow-md border-2 border-[#e0d8cf] ${className}`}>{children}</View>
);
 
// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
const AnalyticsPage: React.FC = () => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <SectionHeader icon={<BarChart3 size={22} color="#fff" />} title="Analytics" subtitle="Track your growth" />
    <View className="flex-row flex-wrap gap-3 mb-5">
      {[
        { label: 'Profile Views', value: '1,234', change: '+12%', up: true },
        { label: 'Booking Rate',  value: '68%',   change: '+5%',  up: true },
        { label: 'Avg Duration',  value: '52 min', change: '-2%',  up: false },
      ].map((s, i) => (
        <Card key={i} className="flex-1 min-w-[40%]">
          <Text className="text-xs font-semibold text-[#8a7a6a] mb-2">{s.label}</Text>
          <Text className="text-3xl font-bold text-[#4a3728] mb-2">{s.value}</Text>
          <View className="flex-row items-center gap-x-1">
            {s.up ? <ArrowUp size={14} color="#16a34a" /> : <ArrowDown size={14} color="#dc2626" />}
            <Text className={`text-xs font-semibold ${s.up ? 'text-green-600' : 'text-red-600'}`}>{s.change}</Text>
          </View>
        </Card>
      ))}
    </View>
    <Card className="mb-4">
      <Text className="text-base font-bold text-[#4a3728] mb-4">Popular Services</Text>
      {[
        { name: '1-on-1 Mentoring', bookings: 45, pct: 90 },
        { name: 'Code Review',      bookings: 28, pct: 56 },
        { name: 'Group Sessions',   bookings: 32, pct: 64 },
        { name: 'Career Guidance',  bookings: 43, pct: 86 },
      ].map((s, i) => (
        <View key={i} className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-semibold text-[#4a3728]">{s.name}</Text>
            <Text className="text-xs font-bold text-[#7a5c3e]">{s.bookings} bookings</Text>
          </View>
          <View className="w-full h-2.5 rounded-full bg-[#d8cec4] overflow-hidden">
            <View className="h-full bg-[#4a3728] rounded-full" style={{ width: `${s.pct}%` }} />
          </View>
        </View>
      ))}
    </Card>
    <Card>
      <Text className="text-base font-bold text-[#4a3728] mb-4">Monthly Earnings</Text>
      {[
        { month: 'January',  amount: '₹12,500', change: '+8%' },
        { month: 'December', amount: '₹11,200', change: '+12%' },
        { month: 'November', amount: '₹10,000', change: '+5%' },
        { month: 'October',  amount: '₹9,500',  change: '+15%' },
      ].map((e, i) => (
        <View key={i} className="flex-row items-center justify-between p-3 rounded-xl bg-[#fbf7f3] border border-[#e0d8cf] mb-2">
          <Text className="font-semibold text-[#4a3728] text-sm">{e.month}</Text>
          <View className="items-end">
            <Text className="font-bold text-[#7a5c3e] text-sm">{e.amount}</Text>
            <Text className="text-xs text-green-600">{e.change}</Text>
          </View>
        </View>
      ))}
    </Card>
  </ScrollView>
);

// ─── BOOKINGS PAGE ────────────────────────────────────────────────────────────
const BookingsPage: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const allBookings = sessions.flatMap((s: any) => (s.bookings || []).map((b: any) => ({ ...b, sessionTitle: s.title })));
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Calendar size={22} color="#fff" />} title="Bookings" subtitle="Your upcoming sessions" />
      {allBookings.length === 0 ? (
        <Card><Text className="text-center text-[#8a7a6a] text-sm py-8">No bookings yet</Text></Card>
      ) : allBookings.map((b: any, i: number) => (
        <Card key={i} className="mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-bold text-[#4a3728] text-sm mb-0.5">{b.sessionTitle || 'Session'}</Text>
              <Text className="text-xs text-[#8a7a6a] mb-1">{b.bookedAt ? new Date(b.bookedAt).toLocaleDateString() : '—'}</Text>
              <View className={`self-start px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Text className={`text-[10px] font-semibold capitalize ${b.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>{b.status || 'pending'}</Text>
              </View>
            </View>
            <Text className="font-bold text-green-600">₹{b.pricing?.totalAmount ?? 0}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};


// ─── AVAILABILITY PAGE ────────────────────────────────────────────────────────
const AvailabilityPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const [activeSlots, setActiveSlots] = useState<string[]>([]);
  const toggle = (s: string) => setActiveSlots(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Clock size={22} color="#fff" />} title="Availability" subtitle="Set your schedule" />
      <Card className="mb-4">
        <Text className="font-bold text-[#4a3728] mb-3 text-sm">Select Day</Text>
        <View className="flex-row flex-wrap gap-2">
          {days.map(d => (
            <TouchableOpacity key={d} onPress={() => setSelectedDate(d)} activeOpacity={0.8}
              className={`px-4 py-2 rounded-xl border-2 ${selectedDate === d ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-[#fbf7f3] border-[#e0d8cf]'}`}>
              <Text className={`font-bold text-xs ${selectedDate === d ? 'text-white' : 'text-[#4a3728]'}`}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      {selectedDate && (
        <Card>
          <Text className="font-bold text-[#4a3728] mb-3 text-sm">Time Slots for {selectedDate}</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {slots.map(s => (
              <TouchableOpacity key={s} onPress={() => toggle(s)} activeOpacity={0.8}
                className={`px-4 py-2 rounded-xl border-2 ${activeSlots.includes(s) ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-[#fbf7f3] border-[#e0d8cf]'}`}>
                <Text className={`font-bold text-xs ${activeSlots.includes(s) ? 'text-white' : 'text-[#7a5c3e]'}`}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity activeOpacity={0.85} className="w-full py-3 bg-[#4a3728] rounded-2xl items-center">
            <Text className="text-white font-bold text-sm">Save Availability</Text>
          </TouchableOpacity>
        </Card>
      )}
    </ScrollView>
  );
};

// ─── SERVICES PAGE ────────────────────────────────────────────────────────────
const ServicesPage: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
 
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between mb-5">
        <SectionHeader icon={<Sparkles size={22} color="#fff" />} title="Services" subtitle="Manage your offerings" />
        <TouchableOpacity onPress={() => setShowForm(true)} activeOpacity={0.85}
          className="flex-row items-center gap-x-1 bg-[#4a3728] px-3 py-2 rounded-xl">
          <Plus size={14} color="#fff" />
          <Text className="text-white text-xs font-bold">Add</Text>
        </TouchableOpacity>
      </View>
 
      {sessions.length === 0 ? (
        <Card><Text className="text-center text-[#8a7a6a] text-sm py-8">No services yet. Add your first service!</Text></Card>
      ) : sessions.map((s: any, i: number) => (
        <Card key={i} className="mb-3 flex-row items-start">
          <View className="flex-1">
            <Text className="font-bold text-[#4a3728] text-sm mb-0.5">{s.title}</Text>
            <Text className="text-xs text-[#8a7a6a] mb-1">{s.duration} min · {s.bookings?.length || 0} bookings</Text>
            <Text className="font-bold text-green-600 text-sm">₹{s.pricing?.basePrice ?? 0}</Text>
          </View>
          <View className="flex-row gap-x-2">
            <TouchableOpacity activeOpacity={0.7} className="p-2 bg-[#fbf7f3] rounded-lg border border-[#e0d8cf]">
              <Edit3 size={14} color={C.dark} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} className="p-2 bg-red-50 rounded-lg border border-red-200">
              <Trash2 size={14} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </Card>
      ))}
 
      {/* Add Service Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowForm(false)}>
          <Pressable className="bg-white rounded-t-3xl px-5 py-6" onPress={e => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-black text-[#4a3728]">Add Service</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}><X size={20} color={C.dark} /></TouchableOpacity>
            </View>
            {[
              { label: 'Service Title *', val: title, set: setTitle, ph: 'e.g., Mock Interview' },
              { label: 'Price (₹) *',     val: price, set: setPrice, ph: '1500', kb: 'number-pad' as any },
              { label: 'Duration (min) *',val: duration, set: setDuration, ph: '60', kb: 'number-pad' as any },
              { label: 'Description',     val: description, set: setDescription, ph: 'What will you cover?', multi: true },
            ].map(({ label, val, set, ph, kb, multi }) => (
              <View key={label} className="mb-4">
                <Text className="text-xs font-bold text-[#4a3728] mb-1.5">{label}</Text>
                <TextInput value={val} onChangeText={set} placeholder={ph} placeholderTextColor="#b0a090"
                  keyboardType={kb} multiline={multi} numberOfLines={multi ? 3 : 1}
                  textAlignVertical={multi ? 'top' : 'center'}
                  className={`w-full px-4 py-3 bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl text-sm text-[#4a3728] ${multi ? 'h-20' : ''}`} />
              </View>
            ))}
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowForm(false)}
              className="w-full py-3.5 bg-[#4a3728] rounded-2xl items-center mt-2">
              <Text className="text-white font-bold text-sm">Create Service</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

// ─── PAYMENTS PAGE ────────────────────────────────────────────────────────────
const PaymentsPage: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const allBookings = sessions.flatMap((s: any) => s.bookings || []);
  const confirmed = allBookings.filter((b: any) => b.status === 'confirmed');
  const total = confirmed.reduce((sum: number, b: any) => sum + (b.pricing?.totalAmount || 0), 0);
 
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<CreditCard size={22} color="#fff" />} title="Payments" subtitle="Track your income" />
      <View className="flex-row flex-wrap gap-3 mb-5">
        {[
          { label: 'Total Earnings', amount: `₹${total.toLocaleString('en-IN')}` },
          { label: 'This Month',     amount: '₹0' },
          { label: 'Pending',        amount: '₹0' },
        ].map((s, i) => (
          <View key={i} className="flex-1 min-w-[40%] p-4 rounded-2xl shadow-md" style={{ backgroundColor: C.dark }}>
            <Text className="text-xs text-white/80 font-semibold mb-2">{s.label}</Text>
            <Text className="text-2xl font-bold text-white">{s.amount}</Text>
          </View>
        ))}
      </View>
      <Card>
        <Text className="text-base font-bold text-[#4a3728] mb-4">Transaction History</Text>
        {allBookings.length === 0 ? (
          <Text className="text-center text-[#8a7a6a] text-sm py-4">No transactions yet</Text>
        ) : allBookings.map((b: any, i: number) => (
          <View key={i} className="flex-row items-center justify-between py-3 border-b border-[#e0d8cf]">
            <View className="flex-row items-center gap-x-3">
              <View className="w-9 h-9 rounded-full bg-[#4a3728] items-center justify-center">
                <Text className="text-white font-bold text-xs">{(b.menteeId || 'U')[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text className="font-semibold text-[#4a3728] text-xs">{b.menteeId?.slice(0,8) || 'Unknown'}</Text>
                <Text className="text-[10px] text-[#8a7a6a]">{b.bookedAt ? new Date(b.bookedAt).toLocaleDateString() : '—'}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="font-bold text-green-600 text-sm">₹{b.pricing?.totalAmount ?? 0}</Text>
              <View className={`px-2 py-0.5 rounded-full mt-0.5 ${b.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Text className={`text-[9px] font-semibold capitalize ${b.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>{b.status || 'pending'}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};
 
// ─── REVIEWS PAGE ─────────────────────────────────────────────────────────────
const ReviewsPage: React.FC = () => {
  const stats = [
    { label: 'Overall Rating', value: '4.8', icon: <Star size={20} color={C.mid} /> },
    { label: 'Total Reviews',  value: '156',  icon: <Users size={20} color={C.mid} /> },
    { label: 'Positive',       value: '95%',  icon: <CheckCircle size={20} color={C.mid} /> },
    { label: '5 Star',         value: '142',  icon: <Sparkles size={20} color={C.mid} /> },
  ];
  const reviews = [
    { name: 'Amit Sharma',  rating: 5, comment: 'Excellent mentor! Very knowledgeable and patient.',  time: '2 days ago' },
    { name: 'Priya Singh',  rating: 5, comment: 'Great experience. Learned a lot in just one session.', time: '4 days ago' },
    { name: 'Rahul Verma',  rating: 4, comment: 'Good mentoring, would recommend to others.',           time: '1 week ago' },
    { name: 'Neha Gupta',   rating: 5, comment: 'Best mentor I have worked with.',                     time: '1 week ago' },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Star size={22} color="#fff" />} title="Reviews" subtitle="What students say about you" />
      <View className="flex-row flex-wrap gap-3 mb-5">
        {stats.map((s, i) => (
          <Card key={i} className="flex-1 min-w-[40%] items-center">
            <View className="w-12 h-12 rounded-full bg-[#fbf7f3] border-2 border-[#e0d8cf] items-center justify-center mb-3">{s.icon}</View>
            <Text className="text-3xl font-bold text-[#4a3728] mb-1">{s.value}</Text>
            <Text className="text-xs text-[#8a7a6a] font-semibold text-center">{s.label}</Text>
          </Card>
        ))}
      </View>
      <Card>
        <Text className="text-base font-bold text-[#4a3728] mb-4">Recent Reviews</Text>
        {reviews.map((r, i) => (
          <View key={i} className="p-4 border-2 border-[#e0d8cf] rounded-2xl bg-[#fbf7f3] mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-row items-center gap-x-3">
                <View className="w-10 h-10 rounded-full bg-[#4a3728] items-center justify-center">
                  <Text className="text-white font-bold text-sm">{r.name[0]}</Text>
                </View>
                <View>
                  <Text className="font-bold text-[#4a3728] text-sm">{r.name}</Text>
                  <Text className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</Text>
                </View>
              </View>
              <Text className="text-xs text-[#8a7a6a]">{r.time}</Text>
            </View>
            <Text className="text-xs text-[#8a7a6a] leading-5">{r.comment}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};
 

// ─── PLANS PAGE ───────────────────────────────────────────────────────────────
const PlansPage: React.FC = () => {
  const plans = [
    { name: 'Basic', price: '₹999', popular: false, features: ['Up to 10 sessions/month', 'Basic analytics', 'Email support', 'Profile listing'] },
    { name: 'Pro', price: '₹2,499', popular: true, features: ['Unlimited sessions', 'Advanced analytics', 'Priority support', 'Marketing tools', 'Featured listing'] },
    { name: 'Enterprise', price: '₹4,999', popular: false, features: ['Everything in Pro', 'Custom branding', 'API access', 'Dedicated manager', 'Premium badge'] },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Award size={22} color="#fff" />} title="Plans" subtitle="Choose the best plan for you" />
      {plans.map((p, i) => (
        <Card key={i} className={`mb-4 ${p.popular ? 'border-[#4a3728]' : ''}`}>
          {p.popular && (
            <View className="self-start bg-[#4a3728] px-3 py-1 rounded-full mb-3">
              <Text className="text-white text-xs font-bold">Most Popular</Text>
            </View>
          )}
          <Text className="text-xl font-bold text-[#4a3728] mb-1">{p.name}</Text>
          <Text className="text-3xl font-bold text-[#7a5c3e] mb-4">{p.price}<Text className="text-sm text-[#8a7a6a]">/mo</Text></Text>
          <View className="gap-y-2 mb-5">
            {p.features.map((f, j) => (
              <View key={j} className="flex-row items-center gap-x-2">
                <CheckCircle size={16} color="#16a34a" />
                <Text className="text-sm text-[#8a7a6a]">{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity activeOpacity={0.85}
            className={`w-full py-3 rounded-2xl items-center ${p.popular ? 'bg-[#4a3728]' : 'bg-[#fbf7f3] border-2 border-[#e0d8cf]'}`}>
            <Text className={`font-bold text-sm ${p.popular ? 'text-white' : 'text-[#7a5c3e]'}`}>Choose {p.name}</Text>
          </TouchableOpacity>
        </Card>
      ))}
    </ScrollView>
  );
};
 

// ─── TRUST SCORE PAGE ─────────────────────────────────────────────────────────
const TrustScorePage: React.FC = () => {
  const breakdown = [
    { label: 'Profile Completeness', score: 95 },
    { label: 'Response Rate',        score: 98 },
    { label: 'Session Completion',   score: 88 },
    { label: 'Student Satisfaction', score: 92 },
  ];
  const tips = [
    'Complete 5 more sessions this month',
    'Respond to inquiries within 2 hours',
    'Get 3 more 5-star reviews',
    'Update your profile with recent achievements',
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Shield size={22} color="#fff" />} title="Trust Score" subtitle="Your credibility score" />
      <Card className="items-center mb-5">
        <View className="w-32 h-32 rounded-full bg-[#4a3728] items-center justify-center shadow-2xl mb-4">
          <Text className="text-5xl font-bold text-white">92</Text>
        </View>
        <Text className="text-xl font-bold text-[#4a3728] mb-1">Excellent Trust Score</Text>
        <Text className="text-sm text-[#8a7a6a]">You're in the top 10% of mentors!</Text>
      </Card>
      <Card className="mb-4">
        <Text className="font-bold text-lg text-[#4a3728] mb-4">Score Breakdown</Text>
        {breakdown.map((b, i) => (
          <View key={i} className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs font-semibold text-[#8a7a6a]">{b.label}</Text>
              <Text className="text-xs font-bold text-[#4a3728]">{b.score}%</Text>
            </View>
            <View className="w-full h-2.5 rounded-full bg-[#d8cec4] overflow-hidden">
              <View className="h-full bg-[#4a3728] rounded-full" style={{ width: `${b.score}%` }} />
            </View>
          </View>
        ))}
      </Card>
      <Card>
        <Text className="font-bold text-lg text-[#4a3728] mb-4">How to Improve</Text>
        {tips.map((tip, i) => (
          <View key={i} className="flex-row items-start gap-x-3 p-3 bg-[#fbf7f3] border border-[#e0d8cf] rounded-xl mb-2">
            <View className="w-6 h-6 rounded-full bg-[#7a5c3e] items-center justify-center flex-shrink-0 mt-0.5">
              <Text className="text-white text-[10px] font-bold">{i+1}</Text>
            </View>
            <Text className="text-xs text-[#8a7a6a] flex-1 leading-4">{tip}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

// ─── COMMUNITY PAGE ───────────────────────────────────────────────────────────
const CommunityPage: React.FC = () => {
  const forums = [
    { topic: 'Best Practices for Mentoring',   replies: 12, time: '2 hours ago' },
    { topic: 'How to Handle Difficult Students', replies: 23, time: '5 hours ago' },
    { topic: 'Pricing Strategies',              replies: 18, time: '1 day ago' },
    { topic: 'Building Your Personal Brand',    replies: 31, time: '2 days ago' },
  ];
  const events = [
    { title: 'Mentor Meet & Greet',     date: 'Jan 28, 2026', participants: 45 },
    { title: 'Best Practices Workshop', date: 'Feb 2, 2026',  participants: 32 },
    { title: 'Networking Session',      date: 'Feb 10, 2026', participants: 28 },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Users size={22} color="#fff" />} title="Community" subtitle="Connect with other mentors" />
      <Card className="mb-4">
        <Text className="text-base font-bold text-[#4a3728] mb-4">Discussion Forums</Text>
        {forums.map((f, i) => (
          <TouchableOpacity key={i} activeOpacity={0.85}
            className="p-4 border-2 border-[#e0d8cf] rounded-2xl bg-[#fbf7f3] mb-3">
            <Text className="font-bold text-[#4a3728] text-sm mb-0.5">{f.topic}</Text>
            <Text className="text-xs text-[#8a7a6a]">{f.replies} replies · {f.time}</Text>
          </TouchableOpacity>
        ))}
      </Card>
      <Card>
        <Text className="text-base font-bold text-[#4a3728] mb-4">Upcoming Events</Text>
        {events.map((e, i) => (
          <View key={i} className="p-4 border-2 border-[#e0d8cf] rounded-2xl bg-[#fbf7f3] mb-3">
            <View className="w-10 h-10 bg-[#4a3728] rounded-xl items-center justify-center mb-3">
              <Calendar size={18} color="#fff" />
            </View>
            <Text className="font-bold text-[#4a3728] text-sm mb-1">{e.title}</Text>
            <Text className="text-xs text-[#8a7a6a] mb-2">{e.date}</Text>
            <View className="flex-row items-center gap-x-1">
              <Users size={13} color={C.mid} />
              <Text className="text-xs font-semibold text-[#7a5c3e]">{e.participants} attending</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

// ─── PROFILE PAGE (stub) ──────────────────────────────────────────────────────
const ProfilePage: React.FC<{ mentorData: any }> = ({ mentorData }) => {
  const name = mentorData?.user ? `${mentorData.user.firstName || ''} ${mentorData.user.lastName || ''}`.trim() || 'Your Name' : 'Your Name';
  const bio = mentorData?.bio || 'No bio yet. Update your profile to add a bio.';
  const initials = name !== 'Your Name' ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'M';
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionHeader icon={<Users size={22} color="#fff" />} title="Profile" subtitle="Your mentor profile" />
      <Card className="items-center mb-5">
        <View className="w-20 h-20 rounded-2xl bg-[#4a3728] items-center justify-center mb-4 shadow-xl overflow-hidden">
          {mentorData?.profilePic
            ? <Image source={{ uri: mentorData.profilePic }} className="w-full h-full" resizeMode="cover" />
            : <Text className="text-white text-3xl font-bold">{initials}</Text>
          }
        </View>
        <Text className="text-xl font-black text-[#4a3728] mb-1">{name}</Text>
        <Text className="text-sm font-semibold text-[#7a5c3e] mb-3">{mentorData?.domains?.[0] ?? 'Mentor'}</Text>
        {(mentorData?.stats?.averageRating ?? 0) > 0 ? (
          <View className="flex-row items-center gap-x-1">
            <Text className="text-amber-400 text-base">{'★'.repeat(Math.round(mentorData.stats.averageRating))}</Text>
            <Text className="font-bold text-[#4a3728]">{mentorData.stats.averageRating.toFixed(1)}</Text>
          </View>
        ) : <Text className="text-sm text-[#8a7a6a]">No ratings yet</Text>}
      </Card>
      <Card>
        <Text className="font-bold text-[#4a3728] mb-2 text-sm">About</Text>
        <Text className="text-xs text-[#8a7a6a] leading-5">{bio}</Text>
      </Card>
    </ScrollView>
  );
};
 
// ─── Page registry ────────────────────────────────────────────────────────────
const PAGE_MAP: Record<string, React.FC<any>> = {
  profile:      ProfilePage,
  analytics:    AnalyticsPage,
  booking:      BookingsPage,
  availability: AvailabilityPage,
  services:     ServicesPage,
  payment:      PaymentsPage,
  review:       ReviewsPage,
  plans:        PlansPage,
  trust:        TrustScorePage,
  community:    CommunityPage,
};
 
// ─── COLLAPSIBLE SIDEBAR DRAWER ───────────────────────────────────────────────
const SidebarDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (p: string) => void;
  mentorData: any;
}> = ({ isOpen, onClose, activePage, setActivePage, mentorData }) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: isOpen ? 0 : -DRAWER_W, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: isOpen ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [isOpen]);
 
  const firstName = mentorData?.user?.firstName ?? 'Mentor';
  const lastName  = mentorData?.user?.lastName  ?? '';
  const initials  = `${firstName[0]}${lastName[0] ?? ''}`;
  const rating    = mentorData?.stats?.averageRating ?? 0;
  const domain    = mentorData?.domains?.[0] ?? 'Mentor';
 
  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={{ opacity: backdropAnim }} className="absolute inset-0 bg-black/55">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>
 
      <Animated.View style={{ transform: [{ translateX: slideAnim }], width: DRAWER_W, position: 'absolute', top: 0, bottom: 0, left: 0 }}
        className="bg-white shadow-2xl">
        <SafeAreaView className="flex-1">
          {/* Profile Card */}
          <View className="m-4 p-6 rounded-3xl bg-[#fbf7f3] border-2 border-[#e0d8cf] shadow-xl relative overflow-hidden">
            <View className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 -mr-8 -mt-8 bg-[#e0d8cf]" />
            <View className="items-center">
              <View className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl mb-3 bg-[#4a3728] items-center justify-center">
                {mentorData?.profilePic
                  ? <Image source={{ uri: mentorData.profilePic }} className="w-full h-full" resizeMode="cover" />
                  : <Text className="text-3xl font-bold text-white">{initials}</Text>
                }
              </View>
              <Text className="text-lg font-bold text-[#4a3728] mb-0.5">{firstName} {lastName}</Text>
              <Text className="text-sm font-semibold text-[#7a5c3e] mb-2 capitalize">{domain.replace('_', ' ')}</Text>
              {rating > 0 ? (
                <View className="flex-row items-center gap-x-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={16} color="#f59e0b" fill={i < Math.round(rating) ? '#f59e0b' : 'transparent'} />
                  ))}
                  <Text className="ml-1 font-bold text-[#4a3728] text-sm">{rating.toFixed(1)}</Text>
                </View>
              ) : <Text className="text-xs text-[#8a7a6a]">No ratings yet</Text>}
            </View>
          </View>
 
          {/* Menu Items */}
          <ScrollView className="flex-1 px-4 pb-4" showsVerticalScrollIndicator={false}>
            <View className="gap-y-2">
              {DASHBOARD_MENU_ITEMS.map(item => {
                const isActive = activePage === item.id;
                return (
                  <TouchableOpacity key={item.id} onPress={() => { setActivePage(item.id); onClose(); }}
                    activeOpacity={0.8}
                    className={`flex-row items-center gap-x-4 px-4 py-3.5 rounded-2xl border-2 ${
                      isActive ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-[#fbf7f3] border-[#e0d8cf]'
                    }`}>
                    <Text className="text-lg">{item.icon}</Text>
                    <Text className={`font-semibold text-sm flex-1 ${isActive ? 'text-white' : 'text-[#7a5c3e]'}`}>{item.label}</Text>
                    {isActive && <View className="w-2 h-2 bg-white rounded-full" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};
const MentorDashboardScreen:React.FC<{ userId: string }> = ({ userId }) => {
   const navigation = useNavigation<any>();
  const [activePage, setActivePage] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mentorData, setMentorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    // TODO: MentorService.getMentorByUserId(userId).then(res => setMentorData(res.data)).finally(() => setLoading(false));
    setLoading(false);
  }, [userId]);


  useEffect(() => {
    // TODO: SessionService.getAllSessionsFromDB().then(res => setSessions(res.data || []));
  }, []);

  const CurrentPage = PAGE_MAP[activePage] || ProfilePage;
  const activeLabel = DASHBOARD_MENU_ITEMS.find(m => m.id === activePage)?.label ?? 'Dashboard';


    return (
        
    <SafeAreaView edges={['top']} style={{ flex: 1 }} className="flex-1 bg-[#f6ede8]">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
 
      {/* Top Bar */}
      <View 
      className="flex-row items-center justify-between px-4 py-5 bg-white border-b border-[#e0d8cf] shadow-sm ">
        <TouchableOpacity onPress={() => setSidebarOpen(true)} activeOpacity={0.7}
          className="w-10 h-10 rounded-xl bg-[#fbf7f3] border-2 border-[#e0d8cf] items-center justify-center">
          <Menu size={20} color={C.dark} />
        </TouchableOpacity>
        <Text className="font-black text-base text-[#4a3728]">{activeLabel}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}
          className="w-10 h-10 rounded-xl bg-[#fbf7f3] border-2 border-[#e0d8cf] items-center justify-center">
          <X size={18} color={C.dark} />
        </TouchableOpacity>
      </View>
 
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={C.dark} />
          <Text className="text-[#8a7a6a] mt-3 text-sm">Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-5" showsVerticalScrollIndicator={false}>
          <CurrentPage mentorData={mentorData} sessions={sessions} />
          <View className="h-10" />
        </ScrollView>
      )}
 
      {/* Collapsible Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        setActivePage={setActivePage}
        mentorData={mentorData}
      />
    </SafeAreaView>
    
  )
}

export default MentorDashboardScreen