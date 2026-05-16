import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  SafeAreaView, StatusBar, Modal, Pressable, ActivityIndicator,
  Dimensions, TextInput,
} from 'react-native';
import {
  Globe, Users, UserCheck, Building2, Star, Eye,
  ChevronDown, ChevronUp, X, Check, Search,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import BottomBar from '../../../shared/components/BottomBar';

// TODO: import { useNetworkConnections } from '@/hooks/network/useNetworkConnections';
// TODO: import { useNetworkUsers } from '@/hooks/network/useNetworkUsers';
// TODO: import { useConnectionRequests } from '@/hooks/network/useConnectionRequests';
// TODO: import { useNetworkCompanies } from '@/hooks/network/useNetworkCompanies';
// TODO: import { useAuth } from '@/hooks/useAuth';

const { width: SW } = Dimensions.get('window');
const C = {
  dark: '#4a3728', mid: '#7a5c3e', light: '#8b7355',
  bg: '#f6ede8', surface: '#f6ede8', card: '#e0d8cf', border: '#4a3728',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = 'grow' | 'catchup';
type RequestTabType = 'received' | 'sent';

interface Person {
  id: string;
  name: string;
  title: string;
  location: string;
  mutuals: string;
  image: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: string;
  followersCount?: number;
  image: string;
}

interface ConnectionRequest {
  id: string;
  name: string;
  title: string;
  mutuals: string;
  image: string;
}

interface SentRequest {
  id: string;
  name: string;
  title: string;
  image: string;
}

interface PremiumUser {
  name: string;
  title: string;
  stats: string;
  badge: string;
  achievements: string[];
  img: string;
}

// ─── Mock Data (replace with real hooks) ──────────────────────────────────────
const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'Riya Sharma', title: 'Frontend Developer @ Swiggy', location: 'Bengaluru, India', mutuals: '12 mutual connections', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400' },
  { id: '2', name: 'Aman Gupta', title: 'Product Manager @ Razorpay', location: 'Mumbai, India', mutuals: '8 mutual connections', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
  { id: '3', name: 'Priya Nair', title: 'Data Scientist @ Flipkart', location: 'Hyderabad, India', mutuals: '5 mutual connections', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400' },
  { id: '4', name: 'Vikram Singh', title: 'Backend Engineer @ CRED', location: 'Pune, India', mutuals: '3 mutual connections', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' },
  { id: '5', name: 'Neha Joshi', title: 'UX Designer @ Zomato', location: 'Delhi, India', mutuals: '6 mutual connections', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400' },
  { id: '6', name: 'Karan Mehta', title: 'SDE-2 @ Paytm', location: 'Noida, India', mutuals: '9 mutual connections', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400' },
];

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Google', industry: 'Technology · Software', location: 'Mountain View, CA', employees: '100K+ employees', followersCount: 28000000, image: 'https://logo.clearbit.com/google.com' },
  { id: '2', name: 'Microsoft', industry: 'Technology · Cloud', location: 'Redmond, WA', employees: '200K+ employees', followersCount: 21000000, image: 'https://logo.clearbit.com/microsoft.com' },
  { id: '3', name: 'Flipkart', industry: 'E-commerce', location: 'Bengaluru, India', employees: '30K+ employees', followersCount: 4500000, image: 'https://logo.clearbit.com/flipkart.com' },
  { id: '4', name: 'Razorpay', industry: 'Fintech · Payments', location: 'Bengaluru, India', employees: '5K+ employees', followersCount: 1200000, image: 'https://logo.clearbit.com/razorpay.com' },
  { id: '5', name: 'Swiggy', industry: 'Food Tech', location: 'Bengaluru, India', employees: '8K+ employees', followersCount: 2100000, image: 'https://logo.clearbit.com/swiggy.in' },
];

const MOCK_REQUESTS: ConnectionRequest[] = [
  { id: 'r1', name: 'Ananya Kapoor', title: 'SDE @ Amazon', mutuals: '4 mutual connections', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400' },
  { id: 'r2', name: 'Rohan Verma', title: 'PM @ Meesho', mutuals: '7 mutual connections', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
];

const MOCK_SENT: SentRequest[] = [
  { id: 's1', name: 'Deepika Shah', title: 'Designer @ Notion', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400' },
];

const MOCK_PREMIUM: PremiumUser[] = [
  { name: 'Sanjay Kumar', title: 'CTO @ TechCorp', stats: '500+ connections', badge: 'Top Voice', achievements: ['Speaker', 'Mentor'], img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
  { name: 'Meera Patel', title: 'VP Engineering @ Infosys', stats: '1K+ connections', badge: 'Influencer', achievements: ['Author', 'Coach'], img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400' },
  { name: 'Rahul Das', title: 'Founder @ StartupX', stats: '2K+ connections', badge: 'Entrepreneur', achievements: ['Investor', 'Advisor'], img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400' },
];

const NETWORK_STATS = [
  { label: 'Connections', icon: '🤝', count: 0 },
  { label: 'Following',   icon: '👁️', count: 12 },
  { label: 'Followers',   icon: '👥', count: 24 },
  { label: 'Groups',      icon: '🏘️', count: 3 },
];

// ─── Person Card ──────────────────────────────────────────────────────────────
const PersonCard: React.FC<{
  person: Person;
  isConnected: boolean;
  onConnect: (id: string) => void;
}> = ({ person, isConnected, onConnect }) => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 items-center w-full">
    <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
      <Image source={{ uri: person.image }} className="w-full h-full" resizeMode="cover"
        defaultSource={{ uri: 'https://via.placeholder.com/56' }} />
    </View>
    <Text className="font-bold text-sm text-[#4a3728] text-center mb-0.5" numberOfLines={1}>{person.name}</Text>
    <Text className="text-[10px] text-[#4a3728]/75 font-medium text-center mb-1 leading-3" numberOfLines={2}>{person.title}</Text>
    <View className="flex-row items-center gap-x-1 mb-1">
      <View className="w-1.5 h-1.5 rounded-full bg-[#4a3728]" />
      <Text className="text-[9px] text-[#4a3728]/60 font-medium" numberOfLines={1}>{person.location}</Text>
    </View>
    <Text className="text-[9px] text-[#4a3728]/50 font-medium mb-3 text-center" numberOfLines={1}>{person.mutuals}</Text>
    <TouchableOpacity onPress={() => !isConnected && onConnect(person.id)}
      disabled={isConnected} activeOpacity={0.85}
      className={`w-full py-2 rounded-xl items-center ${isConnected ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'}`}>
      <Text className={`text-xs font-bold ${isConnected ? 'text-white' : 'text-[#4a3728]'}`}>
        {isConnected ? '✓ Pending...' : '✨ Connect'}
      </Text>
    </TouchableOpacity>
  </View>
);

// ─── Person Card Loader (skeleton) ────────────────────────────────────────────
const PersonCardLoader: React.FC = () => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 items-center ">
    <View className="w-14 h-14 rounded-full bg-[#e0d8cf] mb-3" />
    <View className="w-20 h-4 bg-[#e0d8cf] rounded mb-2" />
    <View className="w-full h-3 bg-[#e0d8cf] rounded mb-1" />
    <View className="w-4/5 h-3 bg-[#e0d8cf] rounded mb-3" />
    <View className="w-full h-8 bg-[#e0d8cf] rounded-xl" />
  </View>
);

// ─── Company Card ─────────────────────────────────────────────────────────────
const CompanyCard: React.FC<{
  company: Company;
  isFollowing: boolean;
  onFollow: (id: string) => void;
}> = ({ company, isFollowing, onFollow }) => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 items-center"
    >
    <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md mb-3 bg-white">
      <Image source={{ uri: company.image }} className="w-full h-full" resizeMode="contain"
        defaultSource={{ uri: 'https://via.placeholder.com/56' }} />
    </View>
    <Text className="font-bold text-sm text-[#4a3728] text-center mb-0.5" numberOfLines={1}>{company.name}</Text>
    <Text className="text-[10px] text-[#4a3728]/75 font-medium text-center mb-1 leading-3" numberOfLines={2}>{company.industry}</Text>
    <View className="flex-row items-center gap-x-1 mb-1">
      <View className="w-1.5 h-1.5 rounded-full bg-[#4a3728]" />
      <Text className="text-[9px] text-[#4a3728]/60 font-medium" numberOfLines={1}>{company.location}</Text>
    </View>
    <Text className="text-[9px] text-[#4a3728]/50 font-medium mb-1">{company.employees}</Text>
    {company.followersCount !== undefined && (
      <Text className="text-[9px] text-[#4a3728]/50 font-medium mb-3">
        {(company.followersCount / 1000000).toFixed(1)}M followers
      </Text>
    )}
    <TouchableOpacity onPress={() => !isFollowing && onFollow(company.id)}
      disabled={isFollowing} activeOpacity={0.85}
      className={`w-full py-2 rounded-xl items-center ${isFollowing ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'}`}>
      <Text className={`text-xs font-bold ${isFollowing ? 'text-white' : 'text-[#4a3728]'}`}>
        {isFollowing ? '✓ Following' : '⭐ Follow'}
      </Text>
    </TouchableOpacity>
  </View>
);

// ─── Connection Request Card ───────────────────────────────────────────────────
const ConnectionRequestCard: React.FC<{
  user: ConnectionRequest;
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
  showActions?: boolean;
}> = ({ user, onAccept, onIgnore, showActions = true }) => (
  <View className="flex-row items-center justify-between p-4 rounded-2xl shadow-md bg-[#f6ede8] mb-3">
    <View className="flex-row items-center gap-x-3 flex-1">
      <Image source={{ uri: user.image }} className="w-12 h-12 rounded-full" resizeMode="cover" />
      <View className="flex-1">
        <Text className="font-bold text-sm text-[#4a3728]" numberOfLines={1}>{user.name}</Text>
        <Text className="text-xs text-[#4a3728]/70 font-medium" numberOfLines={1}>{user.title}</Text>
        <Text className="text-[10px] text-[#4a3728]/50" numberOfLines={1}>{user.mutuals}</Text>
      </View>
    </View>
    {showActions && (
      <View className="flex-row gap-x-2 ml-2">
        <TouchableOpacity onPress={() => onIgnore(user.id)} activeOpacity={0.8}
          className="px-3 py-1.5 rounded-xl border border-[#4a3728]">
          <Text className="text-xs font-bold text-[#4a3728]">Ignore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onAccept(user.id)} activeOpacity={0.85}
          className="px-3 py-1.5 rounded-xl bg-[#4a3728]">
          <Text className="text-xs font-bold text-white">Accept</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// ─── Requests Modal ───────────────────────────────────────────────────────────
const RequestsModal: React.FC<{
  show: boolean;
  activeTab: RequestTabType;
  setActiveTab: (t: RequestTabType) => void;
  receivedRequests: ConnectionRequest[];
  sentRequests: SentRequest[];
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
  onWithdraw: (id: string) => void;
}> = ({ show, activeTab, setActiveTab, receivedRequests, sentRequests, onAccept, onIgnore, onWithdraw }) => {
  if (!show) return null;
  return (
    <View className="mt-4 rounded-3xl p-5 border-2 border-[#4a3728] bg-[#f6ede8]">
      {/* Tabs */}
      <View className="flex-row gap-x-6 mb-5 border-b border-[#4a3728]/20 pb-3">
        {(['received', 'sent'] as RequestTabType[]).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
            <Text className={`font-black text-sm text-[#4a3728] pb-2 ${activeTab === tab ? 'border-b-4 border-[#4a3728]' : 'opacity-50'}`}>
              {tab === 'received' ? 'Received' : 'Sent'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'received' ? (
        receivedRequests.length === 0 ? (
          <View className="py-6 items-center">
            <Text className="text-base font-semibold text-[#4a3728]">No Pending Requests</Text>
            <Text className="text-xs text-[#4a3728]/60 mt-1 text-center">You're all caught up!</Text>
          </View>
        ) : receivedRequests.map(u => (
          <ConnectionRequestCard key={u.id} user={u} onAccept={onAccept} onIgnore={onIgnore} showActions />
        ))
      ) : (
        sentRequests.length === 0 ? (
          <View className="py-6 items-center">
            <Text className="text-base font-semibold text-[#4a3728]">No Sent Requests</Text>
          </View>
        ) : sentRequests.map(u => (
          <View key={u.id} className="flex-row items-center justify-between p-4 rounded-2xl bg-[#e0d8cf] mb-3 shadow-sm">
            <View className="flex-row items-center gap-x-3 flex-1">
              <Image source={{ uri: u.image }} className="w-12 h-12 rounded-full" resizeMode="cover" />
              <View>
                <Text className="font-bold text-sm text-[#4a3728]">{u.name}</Text>
                <Text className="text-xs text-[#4a3728]/70">{u.title}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => onWithdraw(u.id)} activeOpacity={0.85}
              className="px-3 py-1.5 rounded-xl bg-[#4a3728]">
              <Text className="text-xs font-bold text-white">Withdraw</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

// ─── Connection Requests List ─────────────────────────────────────────────────
const ConnectionRequestsList: React.FC<{
  requests: ConnectionRequest[];
  sentRequests: SentRequest[];
  isLoading: boolean;
  showRequestsPanel: boolean;
  activeReqTab: RequestTabType;
  setActiveReqTab: (t: RequestTabType) => void;
  onTogglePanel: () => void;
  onAccept: (id: string) => void;
  onIgnore: (id: string) => void;
  onWithdraw: (id: string) => void;
}> = ({ requests, sentRequests, isLoading, showRequestsPanel, activeReqTab, setActiveReqTab, onTogglePanel, onAccept, onIgnore, onWithdraw }) => {
  if (isLoading) {
    return (
      <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-6 mb-4">
        <ActivityIndicator size="small" color={C.dark} />
        <Text className="text-center text-[#4a3728] text-sm mt-2">Loading requests...</Text>
      </View>
    );
  }
  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center mr-3">
          <UserCheck size={22} color={C.dark} />
        </View>
        <Text className="text-xl font-black text-[#4a3728] flex-1">Connection Requests</Text>
        <TouchableOpacity onPress={onTogglePanel} activeOpacity={0.8}
          className="bg-[#f6ede8] px-3 py-1.5 rounded-xl">
          <Text className="text-xs font-bold text-[#4a3728]">
            {showRequestsPanel ? 'Hide ▲' : 'Show more →'}
          </Text>
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <View className="py-4 items-center">
          <Text className="text-base font-semibold text-[#4a3728]">No Pending Requests</Text>
          <Text className="text-xs text-[#4a3728]/60 mt-1 text-center">You're all caught up! Check back later.</Text>
        </View>
      ) : requests.map(u => (
        <ConnectionRequestCard key={u.id} user={u} onAccept={onAccept} onIgnore={onIgnore} />
      ))}

      <RequestsModal
        show={showRequestsPanel}
        activeTab={activeReqTab}
        setActiveTab={setActiveReqTab}
        receivedRequests={requests}
        sentRequests={sentRequests}
        onAccept={onAccept}
        onIgnore={onIgnore}
        onWithdraw={onWithdraw}
      />
    </View>
  );
};

// ─── Network Tab ──────────────────────────────────────────────────────────────
const NetworkTabBar: React.FC<{ activeTab: TabType; setActiveTab: (t: TabType) => void }> = ({ activeTab, setActiveTab }) => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
    <View className="flex-row gap-x-8">
      {(['grow', 'catchup'] as TabType[]).map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
          <Text className={`font-black text-lg text-[#4a3728] pb-3 ${activeTab !== tab ? 'opacity-50' : ''}`}>
            {tab === 'grow' ? 'Grow' : 'Catch Up'}
          </Text>
          {activeTab === tab && (
            <View className="h-1 rounded-full bg-[#4a3728] -mt-1" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Profile Viewer Card ──────────────────────────────────────────────────────
const ProfileViewerCard: React.FC = () => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#f6ede8] p-5 mb-4">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-x-3 flex-1">
        <View className="w-13 h-13 rounded-full bg-[#e0d8cf] w-12 h-12 items-center justify-center">
          <Eye size={24} color={C.dark} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="font-black text-base text-[#4a3728] mb-0.5">Who's Viewed Your Profile?</Text>
          <Text className="text-xs text-[#4a3728]/70 leading-4">Discover who's interested in your professional journey</Text>
        </View>
      </View>
      <TouchableOpacity activeOpacity={0.85}
        className="ml-3 bg-[#e0d8cf] px-4 py-2.5 rounded-2xl">
        <Text className="text-xs font-black text-[#4a3728]">🌟 Premium</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Profile Completion Card ──────────────────────────────────────────────────
const ProfileCompletionCard: React.FC<{ completionPercentage?: number }> = ({ completionPercentage = 12 }) => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-6 mb-4 overflow-hidden">
    <View className="flex-row items-start justify-between">
      <View className="flex-1">
        <View className="flex-row items-center gap-x-3 mb-4">
          <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
            <Text className="text-xl">🎯</Text>
          </View>
          <View>
            <Text className="text-lg font-black text-[#4a3728]">Complete Your Profile!</Text>
            <Text className="text-xs text-[#4a3728]/70">Unlock more networking opportunities</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View className="w-full h-3 rounded-full bg-[#f6ede8] mb-5 overflow-hidden">
          <View className="h-full rounded-full bg-green-500" style={{ width: `${completionPercentage}%` }} />
        </View>
        <TouchableOpacity activeOpacity={0.85}
          className="self-start bg-[#4a3728] px-6 py-3 rounded-2xl shadow-md">
          <Text className="text-white font-black text-sm">🎯 Boost My Profile</Text>
        </TouchableOpacity>
      </View>
      <View className="items-center ml-4">
        <View className="w-16 h-16 rounded-full bg-[#f6ede8] items-center justify-center shadow-md">
          <Text className="text-xl font-black text-[#4a3728]">{completionPercentage}%</Text>
        </View>
        <Text className="text-[10px] font-bold text-[#4a3728]/60 mt-1">Profile Score</Text>
      </View>
    </View>
  </View>
);

// ─── Premium Profile Card ─────────────────────────────────────────────────────
const PremiumProfileCard: React.FC<{ user: PremiumUser }> = ({ user }) => (
  <View className="bg-[#f6ede8] rounded-2xl shadow-md p-4 w-full">
    <View className="flex-row items-center justify-between mb-3">
      <Image source={{ uri: user.img }} className="w-12 h-12 rounded-full border-2 border-amber-300" resizeMode="cover" />
      <View className="bg-amber-100 px-2 py-0.5 rounded-full">
        <Text className="text-[9px] font-bold text-amber-800">⭐ {user.badge}</Text>
      </View>
    </View>
    <Text className="font-bold text-sm text-[#4a3728] mb-0.5" numberOfLines={1}>{user.name}</Text>
    <Text className="text-[10px] text-[#4a3728]/80 font-medium mb-1" numberOfLines={2}>{user.title}</Text>
    <Text className="text-[9px] text-[#4a3728]/60 mb-2">{user.stats}</Text>
    <View className="flex-row flex-wrap gap-1 mb-3">
      {user.achievements.slice(0, 2).map((a, i) => (
        <View key={i} className="bg-[#e0d8cf] px-2 py-0.5 rounded-full">
          <Text className="text-[9px] font-medium text-[#4a3728]">{a}</Text>
        </View>
      ))}
    </View>
    <TouchableOpacity activeOpacity={0.85} className="w-full py-2 rounded-xl bg-[#4a3728] items-center">
      <Text className="text-white text-[10px] font-bold">⭐ View Profile</Text>
    </TouchableOpacity>
  </View>
);

// ─── Premium Spotlight ────────────────────────────────────────────────────────
const PremiumSpotlight: React.FC<{ profiles: PremiumUser[] }> = ({ profiles }) => (
  <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
    <View className="flex-row items-center gap-x-3 mb-5">
      <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
        <Star size={22} color={C.dark} />
      </View>
      <Text className="text-2xl font-black text-[#4a3728]">Premium Spotlight</Text>
    </View>
    <View className="flex-row flex-wrap justify-between gap-3">
      {profiles.map((u, i) => (
    <View key={i} className="w-[48%] mb-3">
      <PremiumProfileCard user={u} />
    </View>
  ))}
    </View>
  </View>
);

// ─── Suggestions Section (People) ────────────────────────────────────────────
const SuggestionsSection: React.FC<{
  title?: string;
  people: Person[];
  connectedUsers: Set<string>;
  onConnect: (id: string) => void;
  isLoading?: boolean;
}> = ({ title = 'People You May Know', people, connectedUsers, onConnect, isLoading = false }) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? people : people.slice(0, 4);

  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-x-3">
          <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
            <Users size={22} color={C.dark} />
          </View>
          <Text className="text-xl font-black text-[#4a3728]">{title}</Text>
        </View>
        {people.length > 4 && (
          <TouchableOpacity onPress={() => setShowAll(p => !p)} activeOpacity={0.8}
            className="bg-[#f6ede8] px-3 py-1.5 rounded-xl">
            <Text className="text-xs font-bold text-[#4a3728]">
              {showAll ? 'Hide ▲' : 'Show more →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap gap-3">
          {[0, 1, 2, 3].map(i => 
          <PersonCardLoader key={i} />)}
        </View>
      ) : people.length === 0 ? (
        <Text className="text-center text-[#4a3728]/70 py-6 font-medium">No users to show at the moment</Text>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {displayed.map(p => (
            <View key={p.id} className='w-[48%] mb-3'>
            <PersonCard person={p} isConnected={connectedUsers.has(p.id)} onConnect={onConnect} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Suggestions For Companies ────────────────────────────────────────────────
const SuggestionsForCompaniesSection: React.FC<{
  companies: Company[];
  followingCompanies: Set<string>;
  onFollow: (id: string) => void;
  isLoading?: boolean;
}> = ({ companies, followingCompanies, onFollow, isLoading = false }) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? companies : companies.slice(0, 4);

  return (
    <View className="rounded-3xl border-2 border-[#4a3728] bg-[#e0d8cf] p-5 mb-4">
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center gap-x-3">
          <View className="w-11 h-11 rounded-2xl bg-[#f6ede8] items-center justify-center">
            <Building2 size={22} color={C.dark} />
          </View>
          <Text className="text-xl font-black text-[#4a3728]">Suggestions for Companies</Text>
        </View>
        {companies.length > 4 && (
          <TouchableOpacity onPress={() => setShowAll(p => !p)} activeOpacity={0.8}
            className="bg-[#f6ede8] px-3 py-1.5 rounded-xl">
            <Text className="text-xs font-bold text-[#4a3728]">
              {showAll ? 'Hide ▲' : 'See all →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-row flex-wrap gap-3">
          {[0, 1, 2, 3].map(i => <PersonCardLoader key={i} />)}
        </View>
      ) : companies.length === 0 ? (
        <Text className="text-center text-[#4a3728]/70 py-6 font-medium">No companies to show at the moment</Text>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {displayed.map(c => (
            <View key={c.id} className='w-[48%] mb-3'>
            <CompanyCard  company={c} isFollowing={followingCompanies.has(c.id)} onFollow={onFollow} />
          </View>
          ))}
          
        </View>
      )}
    </View>
  );
};

// ─── Network Sidebar (as bottom sheet modal) ──────────────────────────────────
const NetworkSidebarModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  pendingCount: number;
}> = ({ visible, onClose, pendingCount }) => {
  const stats = NETWORK_STATS.map(s =>
    s.label === 'Connections' ? { ...s, count: pendingCount } : s
  );
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-[#e0d8cf] rounded-t-3xl p-6 border-t-2 border-[#4a3728]"
          onPress={e => e.stopPropagation()}>
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-x-3">
              <View className="w-12 h-12 rounded-2xl bg-[#f6ede8] items-center justify-center">
                <Globe size={24} color={C.dark} />
              </View>
              <View>
                <Text className="text-xl font-black text-[#4a3728]">My Network</Text>
                <Text className="text-xs text-[#4a3728]/70">Build meaningful connections</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          <View className="gap-y-3 pb-4">
            {stats.map((item, i) => (
              <View key={i} className="flex-row items-center justify-between bg-[#f6ede8] p-4 rounded-2xl shadow-sm">
                <View className="flex-row items-center gap-x-3">
                  <View className="w-10 h-10 rounded-xl bg-[#e0d8cf] items-center justify-center">
                    <Text className="text-lg">{item.icon}</Text>
                  </View>
                  <Text className="font-bold text-sm text-[#4a3728]">{item.label}</Text>
                </View>
                {item.count !== undefined && (
                  <View className="bg-[#e0d8cf] px-3 py-1 rounded-full">
                    <Text className="text-xs font-black text-[#4a3728]">{item.count}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── MAIN NETWORK SCREEN ──────────────────────────────────────────────────────
const NetworkScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('grow');
  const [activeReqTab, setActiveReqTab] = useState<RequestTabType>('received');
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Data state (replace with real hooks)
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [requests, setRequests] = useState<ConnectionRequest[]>(MOCK_REQUESTS);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>(MOCK_SENT);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [followingCompanies, setFollowingCompanies] = useState<Set<string>>(new Set());
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // TODO: Replace mock handlers with real hook calls
  const handleConnect = (userId: string) => {
    setConnectedUsers(prev => new Set([...prev, userId]));
    // TODO: ConnectionService.sendRequest(userId)
  };

  const handleFollow = (companyId: string) => {
    setFollowingCompanies(prev => new Set([...prev, companyId]));
    // TODO: CompanyService.follow(companyId)
  };

  const handleAccept = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    // TODO: ConnectionService.accept(id)
  };

  const handleIgnore = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    // TODO: ConnectionService.ignore(id)
  };

  const handleWithdraw = (id: string) => {
    setSentRequests(prev => prev.filter(r => r.id !== id));
    // TODO: ConnectionService.withdraw(id)
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6ede8]">
      <BottomBar>
      <StatusBar barStyle="dark-content" backgroundColor="#f6ede8" />

      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-5 bg-[#f6ede8] border-b border-[#e0d8cf]">
        <TouchableOpacity onPress={() => setShowSidebar(true)} activeOpacity={0.8}
          className="flex-row items-center gap-x-2 bg-[#e0d8cf] px-4 py-2 mt-5 rounded-2xl border border-[#4a3728]">
          <Globe size={18} color={C.dark} />
          <Text className="font-black text-sm text-[#4a3728]">My Network</Text>
          {requests.length > 0 && (
            <View className="w-5 h-5 rounded-full bg-[#4a3728] items-center justify-center ml-1">
              <Text className="text-white text-[9px] font-black">
                {requests.length > 9 ? '9+' : requests.length}
              </Text>
            </View>
          )}q
        </TouchableOpacity>
        <View className="w-24" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4">

        {/* Network Tab */}
        <NetworkTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Connection Requests */}
        <ConnectionRequestsList
          requests={requests}
          sentRequests={sentRequests}
          isLoading={isLoadingRequests}
          showRequestsPanel={showRequestsPanel}
          activeReqTab={activeReqTab}
          setActiveReqTab={setActiveReqTab}
          onTogglePanel={() => setShowRequestsPanel(p => !p)}
          onAccept={handleAccept}
          onIgnore={handleIgnore}
          onWithdraw={handleWithdraw}
        />

        {/* Profile Viewer Card */}
        <ProfileViewerCard />

        {/* People You May Know */}
        <SuggestionsSection
          people={people}
          connectedUsers={connectedUsers}
          onConnect={handleConnect}
          isLoading={isLoadingUsers}
        />

        {/* Company Suggestions */}
        <SuggestionsForCompaniesSection
          companies={companies}
          followingCompanies={followingCompanies}
          onFollow={handleFollow}
          isLoading={isLoadingCompanies}
        />

        {/* Premium Spotlight */}
        <PremiumSpotlight profiles={MOCK_PREMIUM} />

        {/* Profile Completion */}
        <ProfileCompletionCard completionPercentage={12} />

        <View className="h-10" />
      </ScrollView>

      {/* Network Stats Sidebar (as bottom sheet) */}
      <NetworkSidebarModal
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        pendingCount={requests.length}
      />
      </BottomBar>
    </SafeAreaView>
  );
};

export default NetworkScreen;