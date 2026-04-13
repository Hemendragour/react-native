import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BarChart2, Eye, TrendingUp, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
// import AnalyticsService from '@/lib/api/analytics.service';
// import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalyticsData {
  total: number;
  last7Days: number;
  last30Days: number;
}

interface Analytics {
  profileViews: AnalyticsData;
  postImpressions: AnalyticsData;
  searchAppearances: AnalyticsData;
}

interface AnalyticsDashboardProps {
 userId: string;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  growth: string;
  value: number;
  total: number;
  label: string;
  description: string;
  progressWidth: string;
  progressColor: string;
  onPress: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  growth,
  value,
  total,
  label,
  description,
  progressWidth,
  progressColor,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="bg-[#e0d8cf] rounded-2xl p-5 border border-[#c9bfb4] shadow-md flex-1"
  >
    {/* Top Row: Icon + Growth */}
    <View className="flex-row items-start justify-between mb-5">
      <View className={`w-12 h-12 ${iconBg} rounded-xl items-center justify-center shadow-md`}>
        {icon}
      </View>
      <Text className="text-xs font-bold text-green-600">{growth}</Text>
    </View>

    {/* Value */}
    <Text className="text-3xl font-bold text-[#4a3728]">
      {value.toLocaleString()}
    </Text>
    <Text className="text-[10px] text-[#7a5c3e] mt-0.5 mb-2">
      out of {total.toLocaleString()} total
    </Text>

    {/* Label */}
    <Text className="text-sm font-semibold text-[#4a3728]/80">{label}</Text>

    {/* Progress Bar */}
    <View className="mt-3 w-full h-1.5 bg-[#d1c5b9] rounded-full overflow-hidden">
      <View className={`h-1.5 ${progressColor} rounded-full ${progressWidth}`} />
    </View>

    {/* Description */}
    <Text className="text-[10px] text-[#4a3728]/70 mt-2">{description}</Text>

    {/* Footer */}
    <View className="mt-4 pt-3 border-t border-[#c9bfb4]/60">
      <Text className="text-[10px] text-[#4a3728]/60 font-medium">Last 7 days</Text>
    </View>
  </TouchableOpacity>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <View className="bg-white/60 rounded-3xl p-5 border border-[#4a3728]/20">
    <View className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
    <View className="flex-row gap-x-3">
      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-1 h-40 bg-gray-200 rounded-2xl" />
      ))}
    </View>
    <View className="items-center mt-4">
      <ActivityIndicator size="small" color="#4a3728" />
    </View>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const navigation = useNavigation<any>();
  const { user: currentUser } = useAuth();

  const [analytics, setAnalytics] = useState<Analytics>({
    profileViews: { total: 0, last7Days: 0, last30Days: 0 },
    postImpressions: { total: 0, last7Days: 0, last30Days: 0 },
    searchAppearances: { total: 0, last7Days: 0, last30Days: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [profileViews, postImpressions, searchAppearances] = await Promise.all([
          AnalyticsService.getProfileViewsCount(30),
          AnalyticsService.getPostImpressionsCount(20),
          AnalyticsService.getSearchAppearancesCount(),
        ]);
        setAnalytics({
          profileViews: profileViews.data || { total: 0, last7Days: 0, last30Days: 0 },
          postImpressions: postImpressions.data || { total: 0, last7Days: 0, last30Days: 0 },
          searchAppearances: searchAppearances.data || { total: 0, last7Days: 0, last30Days: 0 },
        });
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [userId]);

  const handleInsights = () => {
    navigation.navigate('ProfileAnalytics', { userId: currentUser?.userId });
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <View className="bg-white/60 rounded-3xl p-5 border border-[#4a3728]/20 shadow-md mb-4">

      {/* ── Header ── */}
      <View className="flex-row items-center gap-x-2 mb-5">
        <BarChart2 size={18} color="#4a3728" />
        <Text className="text-lg font-bold text-[#4a3728]">Analytics Dashboard</Text>
      </View>

      {/* ── Cards Row ── */}
      <View className="flex-row gap-x-3">
        {/* Profile Views */}
        <StatCard
          onPress={handleInsights}
          iconBg="bg-blue-500"
          icon={<Eye size={22} color="#ffffff" />}
          growth="+12%"
          value={analytics.profileViews.last30Days}
          total={analytics.profileViews.total}
          label="Profile Views"
          description="People visiting your profile."
          progressWidth="w-[70%]"
          progressColor="bg-blue-500"
        />

        {/* Post Impressions */}
        <StatCard
          onPress={handleInsights}
          iconBg="bg-purple-500"
          icon={<TrendingUp size={22} color="#ffffff" />}
          growth="+60%"
          value={analytics.postImpressions.last30Days}
          total={analytics.postImpressions.total}
          label="Post Impressions"
          description="Engagement on your posts."
          progressWidth="w-[85%]"
          progressColor="bg-purple-500"
        />

        {/* Search Appearances */}
        <StatCard
          onPress={handleInsights}
          iconBg="bg-green-500"
          icon={<Search size={22} color="#ffffff" />}
          growth="+40%"
          value={analytics.searchAppearances.last30Days}
          total={analytics.searchAppearances.total}
          label="Search Appearances"
          description="Times you appeared in searches."
          progressWidth="w-[60%]"
          progressColor="bg-green-500"
        />
      </View>
    </View>
  );
};

export default AnalyticsDashboard;