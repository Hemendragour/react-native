import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, ShieldCheck, TrendingUp, Users, PieChart, Sparkles, X, ChevronRight, Check } from 'lucide-react-native';
import { NetworkHealthData } from '../types/network.types';

const C = {
  dark: '#4a3728',
  mid: '#7a5c3e',
  light: '#8b7355',
  bg: '#f6ede8',
  card: '#e0d8cf',
};

interface NetworkAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  healthData?: NetworkHealthData | null;
  totalConnections?: number;
}

const NetworkAnalyticsModal: React.FC<NetworkAnalyticsModalProps> = ({
  visible,
  onClose,
  healthData,
  totalConnections = 0,
}) => {
  const hasConnections = totalConnections > 0;
  
  // Calculate dynamic score from live connections & metrics
  const score = healthData?.score ?? (hasConnections ? Math.min(100, Math.max(10, totalConnections * 10)) : 0);
  const label =
    score >= 80 ? 'Exceptional Reach' : score >= 50 ? 'Strong Network' : score > 0 ? 'Building Foundation' : 'New Network';

  const industryBreakdown = healthData?.industryBreakdown || [];
  const insights = healthData?.insights || [];
  const growthThisMonth = healthData?.growthThisMonth ?? 0;
  const diversityScore = healthData?.diversityScore ?? (hasConnections ? 75 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <Pressable
          className="bg-[#f6ede8] rounded-t-3xl border-t-2 border-[#4a3728] max-h-[85%]"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-[#e0d8cf]">
            <View className="flex-row items-center gap-x-2.5">
              <View className="w-9 h-9 rounded-xl bg-[#e0d8cf] items-center justify-center">
                <Activity size={20} color={C.dark} />
              </View>
              <View>
                <Text className="text-lg font-black text-[#4a3728]">Network Health & Insights</Text>
                <Text className="text-xs text-[#4a3728]/70">AI-powered graph analytics</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1">
              <X size={20} color={C.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="p-6">
            {/* Health Score Banner */}
            <View className="bg-[#e0d8cf] p-5 rounded-3xl border border-[#4a3728]/30 mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-x-2">
                  <ShieldCheck size={20} color="#2d6a4f" />
                  <Text className="font-black text-sm text-[#4a3728]">Network Health Index</Text>
                </View>
                <View className="bg-[#4a3728] px-3 py-1 rounded-full">
                  <Text className="text-xs font-black text-[#f6ede8]">{score}/100</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-3 w-full bg-[#f6ede8] rounded-full overflow-hidden mb-2">
                <View
                  className="h-full bg-[#4a3728] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                />
              </View>

              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-xs font-black text-[#4a3728]">{label}</Text>
                <Text className="text-[11px] font-semibold text-[#7a5c3e]">Top 15% active peers</Text>
              </View>
            </View>

            {/* Quick Metrics Grid */}
            <View className="flex-row gap-x-3 mb-5">
              <View className="flex-1 bg-[#e0d8cf] p-4 rounded-2xl border border-[#4a3728]/20">
                <View className="flex-row items-center gap-x-1.5 mb-1">
                  <TrendingUp size={15} color="#2d6a4f" />
                  <Text className="text-[11px] font-bold text-[#7a5c3e]">Monthly Growth</Text>
                </View>
                <Text className="text-lg font-black text-[#4a3728]">
                  +{growthThisMonth}%
                </Text>
              </View>

              <View className="flex-1 bg-[#e0d8cf] p-4 rounded-2xl border border-[#4a3728]/20">
                <View className="flex-row items-center gap-x-1.5 mb-1">
                  <Users size={15} color={C.dark} />
                  <Text className="text-[11px] font-bold text-[#7a5c3e]">Reach Diversity</Text>
                </View>
                <Text className="text-lg font-black text-[#4a3728]">
                  {diversityScore}%
                </Text>
              </View>
            </View>

            {/* Industry Composition */}
            {industryBreakdown.length > 0 && (
              <View className="bg-[#e0d8cf] p-5 rounded-3xl border border-[#4a3728]/20 mb-5">
                <View className="flex-row items-center gap-x-2 mb-3">
                  <PieChart size={18} color={C.dark} />
                  <Text className="font-black text-sm text-[#4a3728]">Industry Composition</Text>
                </View>

                <View className="gap-y-3">
                  {industryBreakdown.map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-xs font-bold text-[#4a3728]">{item.industry}</Text>
                        <Text className="text-xs font-black text-[#7a5c3e]">{item.percentage}%</Text>
                      </View>
                      <View className="h-2 w-full bg-[#f6ede8] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-[#4a3728] rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Strategic Insights */}
            {insights.length > 0 && (
              <View className="bg-[#e0d8cf] p-5 rounded-3xl border border-[#4a3728]/20 mb-6">
                <View className="flex-row items-center gap-x-2 mb-3">
                  <Sparkles size={18} color={C.dark} />
                  <Text className="font-black text-sm text-[#4a3728]">Graph Recommendations</Text>
                </View>

                <View className="gap-y-2.5">
                  {insights.map((insight, idx) => (
                    <View key={idx} className="flex-row items-start gap-x-2.5">
                      <View className="w-5 h-5 rounded-full bg-[#f6ede8] items-center justify-center mt-0.5">
                        <Check size={12} color="#2d6a4f" />
                      </View>
                      <Text className="flex-1 text-xs font-medium text-[#4a3728] leading-4">
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Empty state when no insights or industry data yet */}
            {industryBreakdown.length === 0 && insights.length === 0 && (
              <View className="bg-[#e0d8cf] p-5 rounded-3xl border border-[#4a3728]/20 mb-6 items-center">
                <Sparkles size={24} color={C.mid} />
                <Text className="font-black text-sm text-[#4a3728] mt-2 mb-1">
                  Build Your Network Graph
                </Text>
                <Text className="text-xs text-center text-[#4a3728]/70 leading-4">
                  As you connect with colleagues and join study groups, your industry breakdown and recommendations will dynamically populate here.
                </Text>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="bg-[#4a3728] py-3.5 rounded-2xl items-center mb-6"
            >
              <Text className="font-black text-sm text-[#f6ede8]">Close Analytics</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NetworkAnalyticsModal;
