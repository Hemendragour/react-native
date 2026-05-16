import React from 'react';
import { View, Text } from 'react-native';
import { MENTOR, REVIEWS } from '../data/mentorData';

const ReviewsSection: React.FC = () => {
  const starBars: [number, number][] = [[5, 80], [4, 15], [3, 5], [2, 0], [1, 0]];

  return (
    <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf] mb-4">
      <Text className="text-lg font-black text-[#4a3728] mb-5">Ratings & Reviews</Text>

      {/* Summary Row */}
      <View className="flex-row gap-x-6 items-center mb-6">
        {/* Big number */}
        <View className="items-center">
          <Text className="text-4xl font-black text-[#4a3728]">{MENTOR.rating}</Text>
          <Text className="text-amber-400 text-base mb-0.5">★★★★★</Text>
          <Text className="text-[11px] text-[#7a5c3e]">Based on {REVIEWS.length} reviews</Text>
        </View>

        {/* Star bars */}
        <View className="flex-1 gap-y-1.5">
          {starBars.map(([stars, pct]) => (
            <View key={stars} className="flex-row items-center gap-x-2">
              <Text className="text-[11px] text-[#7a5c3e] w-5">{stars}★</Text>
              <View className="flex-1 h-2 rounded-full bg-[#e0d8cf] overflow-hidden">
                <View className="h-full bg-[#7a5c3e] rounded-full" style={{ width: `${pct}%` }} />
              </View>
              <Text className="text-[11px] text-[#7a5c3e] w-7">{pct}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Review Cards */}
      <Text className="font-bold text-[#4a3728] mb-3 text-sm">Recent Reviews</Text>
      <View className="gap-y-3">
        {REVIEWS.map((review) => (
          <View key={review.id} className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4">
            {/* Header */}
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-row items-center gap-x-2">
                {/* Avatar initial */}
                <View className="w-9 h-9 rounded-full bg-[#4a3728] items-center justify-center">
                  <Text className="text-white font-bold text-sm">{review.name.charAt(0)}</Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-x-1.5">
                    <Text className="font-bold text-[#4a3728] text-xs">{review.name}</Text>
                    {review.verified && (
                      <View className="bg-blue-50 px-1.5 py-0.5 rounded-full">
                        <Text className="text-[10px] text-blue-600 font-medium">✓ Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <Text className="text-[11px] text-[#7a5c3e]">{review.date}</Text>
            </View>

            {/* Stars */}
            <Text className="text-amber-400 text-xs mb-1.5">
              {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
            </Text>

            {/* Comment */}
            <Text className="text-xs text-[#4a3728] leading-5 mb-2">{review.comment}</Text>

            {/* Service tag */}
            <View className="bg-[#e0d8cf] self-start px-2.5 py-0.5 rounded-full">
              <Text className="text-[10px] text-[#4a3728]">📌 {review.service}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ReviewsSection;