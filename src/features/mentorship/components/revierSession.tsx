import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import ReviewService from '../../../services/review.service';

interface ReviewsSectionProps {
  mentorData?: any;
  mentorId?: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ mentorData, mentorId }) => {
  const [reviews, setReviews] = useState<any[]>(mentorData?.reviews || []);
  const [loading, setLoading] = useState(false);

  const targetMentorId = mentorId || mentorData?.mentorId || mentorData?._id;

  useEffect(() => {
    if (mentorData?.reviews && mentorData.reviews.length > 0) {
      setReviews(mentorData.reviews);
      return;
    }

    if (targetMentorId) {
      setLoading(true);
      ReviewService.getMentorReviews(targetMentorId, 1, 10)
        .then((res) => {
          const fetched = res.data || [];
          setReviews(fetched);
        })
        .catch((err) => {
          console.log('Failed to fetch mentor reviews:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [targetMentorId, mentorData]);

  const starBars: [number, number][] = [
    [5, 80],
    [4, 15],
    [3, 5],
    [2, 0],
    [1, 0],
  ];

  const rating = mentorData?.stats?.averageRating ?? 5.0;
  const totalReviews = mentorData?.stats?.totalReviews ?? reviews.length;

  return (
    <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf] mb-4">
      <Text className="text-lg font-black text-[#4a3728] mb-5">Ratings & Reviews</Text>

      {/* Summary Row */}
      <View className="flex-row gap-x-6 items-center mb-6">
        {/* Big number */}
        <View className="items-center">
          <Text className="text-4xl font-black text-[#4a3728]">{typeof rating === 'number' ? rating.toFixed(1) : rating}</Text>
          <Text className="text-amber-400 text-base mb-0.5">★★★★★</Text>
          <Text className="text-[11px] text-[#7a5c3e]">Based on {totalReviews} reviews</Text>
        </View>

        {/* Star bars */}
        <View className="flex-1 gap-y-1.5">
          {starBars.map(([stars, pct], i) => (
            <View key={`star-bar-${stars}-${i}`} className="flex-row items-center gap-x-2">
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

      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#4a3728" />
        </View>
      ) : reviews.length === 0 ? (
        <View className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4 items-center">
          <Text className="text-sm text-[#7a5c3e]">No reviews yet.</Text>
        </View>
      ) : (
        <View className="gap-y-3">
          {reviews.map((review: any, idx: number) => {
            const reviewerName = review.menteeName || review.name || review.user?.fullName || 'User';
            const reviewRating = review.rating || 5;
            return (
              <View
                key={`review-${review.id || review._id || review.reviewId || idx}-${idx}`}
                className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4"
              >
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center gap-x-2">
                    {/* Avatar initial */}
                    <View className="w-9 h-9 rounded-full bg-[#4a3728] items-center justify-center">
                      <Text className="text-white font-bold text-sm">
                        {reviewerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center gap-x-1.5">
                        <Text className="font-bold text-[#4a3728] text-xs">
                          {reviewerName}
                        </Text>
                        <View className="bg-blue-50 px-1.5 py-0.5 rounded-full">
                          <Text className="text-[10px] text-blue-600 font-medium">
                            ✓ Verified
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text className="text-[11px] text-[#7a5c3e]">
                    {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                  </Text>
                </View>

                {/* Stars */}
                <Text className="text-amber-400 text-xs mb-1.5">
                  {'★'.repeat(Math.floor(reviewRating))}
                  {'☆'.repeat(5 - Math.floor(reviewRating))}
                </Text>

                {/* Comment */}
                <Text className="text-xs text-[#4a3728] leading-5 mb-2">
                  {review.comment || review.feedback || 'Great session!'}
                </Text>

                {/* Service tag */}
                <View className="bg-[#e0d8cf] self-start px-2.5 py-0.5 rounded-full">
                  <Text className="text-[10px] text-[#4a3728]">
                    📌 {review.serviceName || review.service || '1:1 Mentorship'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ReviewsSection;