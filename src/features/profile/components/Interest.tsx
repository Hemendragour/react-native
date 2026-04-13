import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { Users, Check } from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Interest {
  name: string;
  connection: string;
  title: string;
  followers: string;
  image: string;
  growth: string;
  expertise: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TABS = ['Top Voices', 'Companies', 'Groups', 'Newsletters', 'Schools'] as const;
type Tab = (typeof TABS)[number];

const INTERESTS: Interest[] = [
  {
    name: 'Anushree Jain',
    connection: '• 2nd',
    title:
      'Co-founder, SocialTAG | Helping brands with Strategy-led influencer marketing campaigns',
    followers: '159,847 followers',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b2cd96c4?w=150&h=150&fit=crop&crop=face',
    growth: '+12%',
    expertise: ['Marketing', 'Strategy', 'Branding'],
  },
  {
    name: 'Ayush Wadhwa',
    connection: '• 2nd',
    title:
      'Founder, OWLED | Forbes 30u30 | Mastering Content Creation + Influencer Marketing, Ad Films & AI/AR | Angel Investor',
    followers: '58,018 followers',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    growth: '+8%',
    expertise: ['AI/AR', 'Content', 'Investment'],
  },
];

// ─── Interest Card ─────────────────────────────────────────────────────────────
const InterestCard: React.FC<{ item: Interest }> = ({ item }) => {
  const [following, setFollowing] = useState(true);

  return (
    <View className="bg-[#e0d8cf]/50 rounded-3xl p-4 border border-[#e0d8cf] mb-4 overflow-hidden">
      {/* Growth Badge */}
      <View className="absolute top-4 right-4 bg-[#4a3728] px-2.5 py-1 rounded-full z-10">
        <Text className="text-[#f6ede8] text-xs font-bold">{item.growth}</Text>
      </View>

      <View className="flex-row items-start gap-x-4">
        {/* Avatar */}
        <View className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#e0d8cf] shadow-md flex-shrink-0">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View className="flex-1 pr-8">
          {/* Name + Connection */}
          <View className="flex-row items-center gap-x-1.5 mb-1">
            <Text className="text-base font-bold text-[#4a3728]">{item.name}</Text>
            <Text className="text-xs text-[#4a3728]/60 font-medium">{item.connection}</Text>
          </View>

          {/* Title */}
          <Text className="text-xs text-[#4a3728]/70 leading-4 mb-3" numberOfLines={2}>
            {item.title}
          </Text>

          {/* Expertise Tags */}
          <View className="flex-row flex-wrap gap-1.5 mb-3">
            {item.expertise.map((tag, i) => (
              <View key={i} className="px-2 py-0.5 bg-[#4a3728]/10 rounded-lg">
                <Text className="text-[#4a3728] text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>

          {/* Followers */}
          <View className="flex-row items-center gap-x-1 mb-3">
            <Users size={11} color="#4a3728" opacity={0.6} />
            <Text className="text-xs text-[#4a3728]/60 font-medium">{item.followers}</Text>
          </View>

          {/* Following Button */}
          <TouchableOpacity
            onPress={() => setFollowing((f) => !f)}
            activeOpacity={0.85}
            className={`self-start flex-row items-center gap-x-1.5 px-4 py-2 rounded-2xl ${
              following ? 'bg-[#4a3728]' : 'bg-[#e0d8cf] border border-[#4a3728]'
            }`}
          >
            {following && <Check size={13} color="#f6ede8" />}
            <Text
              className={`text-xs font-semibold ${
                following ? 'text-[#f6ede8]' : 'text-[#4a3728]'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const InterestsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Top Voices');

  return (
    <View className="bg-[#f6ede8]/95 rounded-3xl px-5 py-6 shadow-xl border border-[#e0d8cf]/60 mx-3 mb-6">

      {/* ── Header ── */}
      <View className="flex-row items-center justify-between mb-6">
        {/* Icon + Title */}
        <View className="flex-row items-center gap-x-3">
          
          <Text className="text-xl font-bold text-[#4a3728] tracking-tight">Interests</Text>
        </View>

        {/* Following Count */}
        <View className="bg-[#4a3728]/10 px-4 py-2 rounded-2xl border border-[#e0d8cf]/50">
          <Text className="text-base font-bold text-[#4a3728] text-center">127</Text>
          <Text className="text-[10px] text-[#4a3728]/70 font-medium text-center">Following</Text>
        </View>
      </View>

      {/* ── Tab Bar ── */}
      <View className="bg-[#e0d8cf]/40 rounded-2xl p-1.5 mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4 }}
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                className={`py-2.5 px-4 rounded-xl ${
                  isActive ? 'bg-[#4a3728] shadow-md' : ''
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-[#f6ede8]' : 'text-[#4a3728]/60'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Interest Cards ── */}
      <View>
        {INTERESTS.map((item, idx) => (
          <InterestCard key={idx} item={item} />
        ))}
      </View>

      {/* ── Show All Button ── */}
      <View className="items-center mt-2">
        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-row items-center gap-x-3 border-2 border-[#4a3728]/20 rounded-2xl px-6 py-3"
        >
          <Text className="text-[#4a3728] font-bold text-sm">
            Show all {activeTab}
          </Text>
          {/* Arrow circle */}
          <View className="w-7 h-7 bg-[#4a3728] rounded-full items-center justify-center">
            <Text className="text-[#f6ede8] text-s font-extrabold items-center justify-center">→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InterestsSection;