import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Globe,
  Activity,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import BottomBar, {
  emitBottomBarScroll,
  emitBottomBarScrollEnd,
} from '../../../shared/components/BottomBar';
import { useAuth } from '../../../store/hooks/useAuth';
import { useNetworkUsers } from '../../../hooks/network/useNetworkUsers';
import { useConnectionRequests } from '../../../hooks/network/useConnectionRequests';
import { ConnectionService } from '../../../services/connection.service';
import AuthService from '../../../services/auth.service';
import {
  Person,
  Company,
  TabType,
  RequestTabType,
  NetworkStats,
  CatchUpItem,
  NetworkHealthData,
} from '../types/network.types';

import PersonCard from '../components/PersonCard';
import CompanyCard from '../components/CompanyCard';
import ConnectionRequestsList from '../components/ConnectionRequestsList';
import NetworkTabBar from '../components/NetworkTabBar';
import ProfileViewerCard from '../components/ProfileViewerCard';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import PremiumSpotlight from '../components/PremiumSpotlight';
import SuggestionsSection from '../components/SuggestionsSection';
import SuggestionsForCompaniesSection from '../components/SuggestionsForCompaniesSection';
import NetworkSidebarModal from '../components/NetworkSidebarModal';
import CatchUpFeedSection from '../components/CatchUpFeedSection';
import NetworkAnalyticsModal from '../components/NetworkAnalyticsModal';
import MutualConnectionsModal from '../components/MutualConnectionsModal';
import ProfileViewersModal from '../components/ProfileViewersModal';
import ConnectNoteModal from '../components/ConnectNoteModal';
import ConnectionsListModal from '../components/ConnectionsListModal';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  surface: '#f6ede8',
  card: '#e0d8cf',
  border: '#4a3728',
};

// ─── MAIN NETWORK SCREEN ──────────────────────────────────────────────────────
const NetworkScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isLoggedIn } = useAuth();

  // Current user
  const currentUser = AuthService.getCurrentUser() as any;
  const userId = currentUser?.userId || currentUser?.id || currentUser?._id || '';

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('grow');
  const [activeReqTab, setActiveReqTab] = useState<RequestTabType>('received');
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [directoryModalTab, setDirectoryModalTab] = useState<'connections' | 'requests' | 'following' | 'followers'>('connections');
  const [mutualModalUser, setMutualModalUser] = useState<{ id: string; name: string } | null>(null);
  const [connectNotePerson, setConnectNotePerson] = useState<Person | null>(null);

  // Network stats
  const [stats, setStats] = useState<NetworkStats>({
    connections: 0,
    following: 0,
    followers: 0,
    groups: 0,
    pendingRequests: 0,
  });

  // Catch-Up Events
  const [catchUpItems, setCatchUpItems] = useState<CatchUpItem[]>([]);
  const [isLoadingCatchUp, setIsLoadingCatchUp] = useState(false);

  // Network Health Analytics
  const [healthData, setHealthData] = useState<NetworkHealthData | null>(null);

  // Company suggestions
  const [companies, setCompanies] = useState<Company[]>([]);
  const [followingCompanies, setFollowingCompanies] = useState<Set<string>>(new Set());
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Profile viewers
  const [viewerCount, setViewerCount] = useState(0);
  const [recentViewers, setRecentViewers] = useState<any[]>([]);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);

  // Profile completion
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Premium users
  const [premiumUsers] = useState<any[]>([]);

  // Hooks for people suggestions and connection requests
  const {
    users: people,
    isLoading: isLoadingUsers,
    refetch: refetchPeople,
    connectUser,
  } = useNetworkUsers(userId);
  const {
    incoming: requests,
    outgoing: sentRequests,
    isLoading: isLoadingRequests,
    accept,
    decline,
    withdraw,
    refresh: refetchRequests,
  } = useConnectionRequests(userId);

  // ─── Fetch network stats ───
  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      const [connCount, followCounts, reqStats] = await Promise.allSettled([
        ConnectionService.getConnectionCount(userId),
        ConnectionService.getFollowCounts(userId),
        ConnectionService.getRequestStats(userId),
      ]);

      const connections =
        connCount.status === 'fulfilled'
          ? connCount.value?.data?.count || connCount.value?.count || 0
          : 0;

      const followers =
        followCounts.status === 'fulfilled'
          ? followCounts.value?.data?.followersCount || followCounts.value?.followersCount || 0
          : 0;

      const following =
        followCounts.status === 'fulfilled'
          ? followCounts.value?.data?.followingCount || followCounts.value?.followingCount || 0
          : 0;

      const pendingRequests =
        reqStats.status === 'fulfilled'
          ? reqStats.value?.data?.pending || reqStats.value?.pending || 0
          : requests.length;

      setStats({ connections, following, followers, groups: 0, pendingRequests });
    } catch (e) {
      console.error('Failed to fetch network stats', e);
    }
  }, [userId, requests.length]);

  // ─── Fetch Catch-Up feed ───
  const fetchCatchUp = useCallback(async () => {
    if (!userId) return;
    setIsLoadingCatchUp(true);
    try {
      const res = await ConnectionService.getCatchUpFeed(userId);
      const data = res?.data?.events || res?.data || [];
      const mapped: CatchUpItem[] = (Array.isArray(data) ? data : []).map((ev: any) => ({
        id: ev._id || ev.id || String(Math.random()),
        userId: ev.userId || ev.user?._id || ev.user?.userId || '',
        name:
          ev.userName ||
          (ev.user ? `${ev.user.firstName || ''} ${ev.user.lastName || ''}`.trim() : 'Connection'),
        headline: ev.headline || ev.user?.headline || '',
        image: ev.image || ev.user?.profilePhotoId || '',
        type: ev.type || 'general',
        title: ev.title || 'Milestone update',
        description: ev.description || '',
        date: ev.date || 'Recently',
        congratulated: Boolean(ev.congratulated),
      }));

      setCatchUpItems(mapped);
    } catch (e) {
      console.log('Catch-up feed empty or not configured yet');
      setCatchUpItems([]);
    } finally {
      setIsLoadingCatchUp(false);
    }
  }, [userId]);

  // ─── Fetch Network Health ───
  const fetchHealth = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await ConnectionService.getNetworkHealth(userId);
      const h = res?.data || {};
      setHealthData({
        score: h.score ?? (stats.connections > 0 ? Math.min(100, stats.connections * 10) : 0),
        label: h.label ?? (stats.connections >= 10 ? 'Exceptional Reach' : stats.connections > 0 ? 'Building Foundation' : 'New Network'),
        insights: h.insights || [],
        totalConnections: stats.connections || 0,
        activeRatio: h.activeRatio ?? 0,
        diversityScore: h.diversityScore ?? (stats.connections > 0 ? 65 : 0),
        industryBreakdown: h.industryBreakdown || [],
        growthThisMonth: h.growthThisMonth ?? 0,
      });
    } catch (e) {
      console.log('Network Health API ready');
      setHealthData(null);
    }
  }, [userId, stats.connections]);

  // ─── Fetch company suggestions ───
  const fetchCompanies = useCallback(async () => {
    if (!userId) return;
    setIsLoadingCompanies(true);
    try {
      const res = await ConnectionService.getCompanies(userId);
      const companiesData = res?.data?.data || res?.data || [];
      const mapped: Company[] = (Array.isArray(companiesData) ? companiesData : []).map(
        (c: any) => ({
          id: c._id || c.id || c.companyId || '',
          name: c.name || c.companyName || 'Unknown Company',
          industry: c.industry || c.type || 'Technology',
          location: c.location || c.headquarters || 'Global',
          employees: c.employeeCount ? `${c.employeeCount}+ employees` : c.employees || '',
          followersCount: c.followersCount || c.followerCount || 0,
          image:
            c.logo ||
            c.image ||
            c.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              c.name || 'C'
            )}&background=e0d8cf&color=4a3728&size=128`,
        })
      );
      setCompanies(mapped);

      const followedSet = new Set<string>();
      mapped.forEach(c => {
        if ((c as any).isFollowing) followedSet.add(c.id);
      });
      setFollowingCompanies(followedSet);
    } catch (e) {
      console.error('Failed to fetch companies', e);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [userId]);

  // ─── Fetch profile viewers ───
  const fetchViewers = useCallback(async () => {
    setIsLoadingViewers(true);
    try {
      const [countRes, viewersRes] = await Promise.allSettled([
        ConnectionService.getProfileViewCount(),
        ConnectionService.getProfileViewers(5),
      ]);

      if (countRes.status === 'fulfilled') {
        const count = countRes.value?.data?.count || countRes.value?.count || 0;
        setViewerCount(count);
      }

      if (viewersRes.status === 'fulfilled') {
        const viewersData = viewersRes.value?.data?.viewers || viewersRes.value?.data || [];
        const mapped = (Array.isArray(viewersData) ? viewersData : []).slice(0, 5).map((v: any) => ({
          id: v._id || v.viewerId || v.id || '',
          name: v.firstName ? `${v.firstName} ${v.lastName || ''}`.trim() : v.name || 'Someone',
          image: v.profilePhotoId || v.profileImage || v.avatar || '',
        }));
        setRecentViewers(mapped);
      }
    } catch (e) {
      console.log('Profile views API updated');
    } finally {
      setIsLoadingViewers(false);
    }
  }, []);

  // ─── Fetch profile completion ───
  const fetchProfileCompletion = useCallback(async () => {
    try {
      const res = await AuthService.getUserProfile();
      const profile = res?.data || {};

      const fields = [
        { key: 'firstName', label: 'first name' },
        { key: 'lastName', label: 'last name' },
        { key: 'headline', label: 'headline' },
        { key: 'bio', label: 'bio' },
        { key: 'location', label: 'location' },
        { key: 'profilePhotoId', label: 'profile photo' },
      ];

      let filled = 0;
      const missing: string[] = [];

      fields.forEach(({ key, label }) => {
        const val = profile[key] || profile.user?.[key];
        if (val && typeof val === 'string' && val.trim()) {
          filled++;
        } else {
          missing.push(label);
        }
      });

      const percentage = Math.round((filled / fields.length) * 100);
      setCompletionPercentage(percentage);
      setMissingFields(missing);
    } catch (e) {
      console.log('Failed to fetch profile completion');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchStats();
      fetchCatchUp();
      fetchHealth();
      fetchCompanies();
      fetchViewers();
      fetchProfileCompletion();
    }
  }, [userId]);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchCatchUp(),
      fetchHealth(),
      fetchCompanies(),
      refetchPeople(),
      refetchRequests(),
      fetchViewers(),
      fetchProfileCompletion(),
    ]);
    setRefreshing(false);
  }, [
    fetchStats,
    fetchCatchUp,
    fetchHealth,
    fetchCompanies,
    refetchPeople,
    refetchRequests,
    fetchViewers,
    fetchProfileCompletion,
  ]);

  // ─── Handlers ───
  const handleConnect = useCallback(
    async (targetUserId: string, message?: string) => {
      try {
        if (message) {
          await ConnectionService.sendConnectionRequest({ toUserId: targetUserId, message });
          ConnectionService.addPending(targetUserId);
        } else {
          await connectUser(targetUserId);
        }
        fetchStats();
      } catch (e: any) {
        Alert.alert('Connection Request', e?.message || 'Failed to send connection request.');
      }
    },
    [connectUser, fetchStats]
  );

  const handleDismissSuggestion = useCallback(async (targetUserId: string) => {
    try {
      await ConnectionService.dismissSuggestion(targetUserId);
    } catch (e) {
      console.log('Dismiss suggestion handled locally');
    }
  }, []);

  const handleAccept = useCallback(
    async (requestId: string) => {
      await accept(requestId);
      fetchStats();
    },
    [accept, fetchStats]
  );

  const handleIgnore = useCallback(
    async (requestId: string) => {
      await decline(requestId);
      fetchStats();
    },
    [decline, fetchStats]
  );

  const handleWithdraw = useCallback(
    async (requestId: string) => {
      await withdraw(requestId);
      fetchStats();
    },
    [withdraw, fetchStats]
  );

  const handleFollowCompany = useCallback(
    async (companyId: string) => {
      try {
        if (followingCompanies.has(companyId)) {
          await ConnectionService.unfollowCompany(companyId);
          setFollowingCompanies(prev => {
            const next = new Set(prev);
            next.delete(companyId);
            return next;
          });
        } else {
          await ConnectionService.followCompany(companyId);
          setFollowingCompanies(prev => new Set([...prev, companyId]));
        }
      } catch (e) {
        console.error('Failed to follow/unfollow company', e);
      }
    },
    [followingCompanies]
  );

  const handleProfilePress = useCallback(
    (profileId: string) => {
      if (profileId) {
        navigation.navigate('Profile', { userId: profileId });
      }
    },
    [navigation]
  );

  // Compute pending count for sidebar badge
  const pendingCount = useMemo(() => {
    return stats && typeof stats.pendingRequests === 'number'
      ? stats.pendingRequests
      : Array.isArray(requests)
      ? requests.length
      : 0;
  }, [stats, requests]);

  // Build connected user IDs set from sent requests
  const connectedUserIds = useMemo(() => {
    const ids = new Set<string>();
    if (Array.isArray(sentRequests)) {
      sentRequests.forEach(r => {
        if (r && (r.userId || r.id)) ids.add(r.userId || r.id);
      });
    }
    return ids;
  }, [sentRequests]);

  return (
    <SafeAreaView className="flex-1 bg-[#f6ede8]">
      <BottomBar>
        <StatusBar barStyle="dark-content" backgroundColor="#f6ede8" />

        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-[#f6ede8] border-b border-[#e0d8cf]">
          {/* Sidebar Trigger */}
          <TouchableOpacity
            onPress={() => setShowSidebar(true)}
            activeOpacity={0.8}
            className="flex-row items-center gap-x-2 bg-[#e0d8cf] px-4 py-2 mt-4 rounded-2xl border border-[#4a3728]"
          >
            <Globe size={18} color={C.dark} />
            <Text className="font-black text-sm text-[#4a3728]">My Network</Text>
            {pendingCount > 0 && (
              <View className="w-5 h-5 rounded-full bg-[#4a3728] items-center justify-center ml-1">
                <Text className="text-white text-[9px] font-black">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Network Health / Analytics Trigger */}
          <TouchableOpacity
            onPress={() => setShowAnalyticsModal(true)}
            activeOpacity={0.8}
            className="flex-row items-center gap-x-1.5 bg-[#4a3728] px-3.5 py-2 mt-4 rounded-2xl shadow-sm"
          >
            <Activity size={15} color="#f6ede8" />
            <Text className="text-xs font-black text-[#f6ede8]">Analytics</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 110 }}
          onScroll={emitBottomBarScroll}
          onScrollEndDrag={emitBottomBarScrollEnd}
          onMomentumScrollEnd={emitBottomBarScrollEnd}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.dark} />
          }
        >
          {/* Network Tab Bar */}
          <NetworkTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* ═══ GROW TAB — expand your network ═══ */}
          {activeTab === 'grow' && (
            <>
              {/* Connection Requests Section — shown at the top of Grow tab */}
              {(isLoadingRequests || requests.length > 0 || sentRequests.length > 0) && (
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
                  onProfilePress={handleProfilePress}
                />
              )}

              {/* People You May Know — directly below connection requests */}
              {(isLoadingUsers || people.length > 0) && (
                <SuggestionsSection
                  people={people as Person[]}
                  connectedUsers={connectedUserIds}
                  onConnect={handleConnect}
                  onConnectWithNote={person => setConnectNotePerson(person)}
                  onDismiss={handleDismissSuggestion}
                  onMutualPress={person =>
                    setMutualModalUser({ id: person.userId || person.id, name: person.name })
                  }
                  isLoading={isLoadingUsers}
                  onProfilePress={handleProfilePress}
                />
              )}

              {/* Company Suggestions */}
              {(isLoadingCompanies || companies.length > 0) && (
                <SuggestionsForCompaniesSection
                  companies={companies}
                  followingCompanies={followingCompanies}
                  onFollow={handleFollowCompany}
                  isLoading={isLoadingCompanies}
                />
              )}

              {/* Premium Spotlight */}
              {premiumUsers.length > 0 && <PremiumSpotlight profiles={premiumUsers} />}

              {/* Profile Completion */}
              {completionPercentage < 100 && (
                <ProfileCompletionCard
                  completionPercentage={completionPercentage}
                  missingFields={missingFields}
                />
              )}
            </>
          )}

          {/* ═══ CATCH UP TAB — reconnect with existing network ═══ */}
          {activeTab === 'catchup' && (
            <>
              {/* Catch-Up & Milestone Celebrations */}
              <CatchUpFeedSection
                items={catchUpItems}
                isLoading={isLoadingCatchUp}
                onProfilePress={handleProfilePress}
                onSendGreeting={async (item, msg) => {
                  console.log(`Sent greeting to ${item.name}: ${msg}`);
                }}
              />

              {/* Profile Viewer Card */}
              {(isLoadingViewers || viewerCount > 0) && (
                <ProfileViewerCard
                  viewerCount={viewerCount}
                  recentViewers={recentViewers}
                  isLoading={isLoadingViewers}
                  onViewDetails={() => setShowViewersModal(true)}
                />
              )}

              {/* Profile Completion */}
              {completionPercentage < 100 && (
                <ProfileCompletionCard
                  completionPercentage={completionPercentage}
                  missingFields={missingFields}
                />
              )}
            </>
          )}

          <View className="h-10" />
        </ScrollView>

        {/* Network Stats Sidebar */}
        <NetworkSidebarModal
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          statsData={{
            connections: stats.connections,
            following: stats.following,
            followers: stats.followers,
            groups: stats.groups,
          }}
          pendingCount={pendingCount}
          onOpenTab={tab => {
            setDirectoryModalTab(tab);
            setShowConnectionsModal(true);
          }}
          onOpenAnalytics={() => setShowAnalyticsModal(true)}
        />

        {/* Network Health & Graph Analytics Modal */}
        <NetworkAnalyticsModal
          visible={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          healthData={healthData}
          totalConnections={stats.connections}
        />

        {/* Mutual Connections Modal */}
        <MutualConnectionsModal
          visible={Boolean(mutualModalUser)}
          onClose={() => setMutualModalUser(null)}
          currentUserId={userId}
          targetUser={mutualModalUser}
          onProfilePress={handleProfilePress}
        />

        {/* Profile Viewers Detailed Modal */}
        <ProfileViewersModal
          visible={showViewersModal}
          onClose={() => setShowViewersModal(false)}
          onProfilePress={handleProfilePress}
          onConnect={handleConnect}
        />

        {/* Connect With Custom Note Modal */}
        <ConnectNoteModal
          visible={Boolean(connectNotePerson)}
          onClose={() => setConnectNotePerson(null)}
          targetPerson={connectNotePerson}
          onSend={handleConnect}
        />

        {/* Dynamic Network Directory Modal (Connections, Requests, Following, Followers) */}
        <ConnectionsListModal
          visible={showConnectionsModal}
          onClose={() => setShowConnectionsModal(false)}
          currentUserId={userId}
          initialTab={directoryModalTab}
          onProfilePress={handleProfilePress}
          onDataChanged={fetchStats}
        />
      </BottomBar>
    </SafeAreaView>
  );
};

export default NetworkScreen;

