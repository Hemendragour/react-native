import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Star, X, CheckCircle, Sparkles } from 'lucide-react-native';
import ReviewService from '../../../services/review.service';
import MentorshipService from '../../../services/mentorship.service';

const COLORS = {
  ink: '#4a3728',
  accent: '#7a5c3e',
  hairline: '#e0d8cf',
  wash: '#f6ede8',
  gold: '#c9932a',
  muted: '#8a7a6a',
};

const REVIEW_TAGS = [
  { key: 'helpful', label: 'Helpful' },
  { key: 'knowledgeable', label: 'Knowledgeable' },
  { key: 'patient', label: 'Patient' },
  { key: 'prepared', label: 'Prepared' },
  { key: 'punctual', label: 'Punctual' },
  { key: 'friendly', label: 'Friendly' },
  { key: 'professional', label: 'Professional' },
  { key: 'insightful', label: 'Insightful' },
  { key: 'responsive', label: 'Responsive' },
  { key: 'exceeded_expectations', label: 'Exceeded expectations' },
];

const MIN_COMMENT = 10;
const MAX_COMMENT = 1000;

interface WriteReviewModalProps {
  isOpen: boolean;
  sessionId: string;
  mentorId: string;
  mentorName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  sessionId,
  mentorId,
  mentorName,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tagKey: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey) ? prev.filter((t) => t !== tagKey) : [...prev, tagKey]
    );
  };

  const canSubmit = rating >= 1 && comment.trim().length >= MIN_COMMENT && comment.length <= MAX_COMMENT;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (ReviewService?.submitReview) {
        await ReviewService.submitReview({
          sessionId,
          mentorId,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
        });
      } else {
        await MentorshipService.submitReview({
          sessionId,
          mentorId,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
        });
      }
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-[#e0d8cf] max-h-[85%]">
          {/* Bottom sheet drag indicator */}
          <View className="w-12 h-1.5 bg-[#d4c4b5] rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-black text-[#4a3728]">
                {submitted ? 'Review Submitted!' : 'Rate Your Session'}
              </Text>
              {!submitted && mentorName && (
                <Text className="text-xs text-[#8a7a6a] mt-0.5">
                  How was your experience with <Text className="font-bold text-[#4a3728]">{mentorName}</Text>?
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-[#f6ede8] items-center justify-center">
              <X size={16} color="#7a5c3e" />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View className="items-center py-6">
              <View className="w-16 h-16 rounded-full bg-[#dcfce7] items-center justify-center mb-3">
                <CheckCircle size={36} color="#15803d" />
              </View>
              <Text className="text-sm font-bold text-[#4a3728] text-center mb-1">
                Thank You for Your Feedback!
              </Text>
              <Text className="text-xs text-[#8a7a6a] text-center mb-6 max-w-xs">
                Your review helps other mentees find the best guidance and mentors.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-full bg-[#4a3728] py-3.5 rounded-2xl items-center shadow-sm"
              >
                <Text className="text-white font-bold text-sm">Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Star Rating Selector */}
              <View className="flex-row justify-center items-center gap-x-2 py-4 mb-4 bg-[#fbf7f3] rounded-2xl border border-[#e0d8cf]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    className="p-1.5"
                  >
                    <Star
                      size={32}
                      color={star <= rating ? COLORS.gold : COLORS.hairline}
                      fill={star <= rating ? COLORS.gold : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tag Selection Chips */}
              <Text className="text-xs font-black text-[#4a3728] mb-2 uppercase tracking-wider">
                What went well?
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {REVIEW_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag.key);
                  return (
                    <TouchableOpacity
                      key={tag.key}
                      onPress={() => toggleTag(tag.key)}
                      className={`px-3 py-1.5 rounded-full border ${
                        active
                          ? 'bg-[#4a3728] border-[#4a3728]'
                          : 'bg-[#FAF9F6] border-[#e0d8cf]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          active ? 'text-white' : 'text-[#7a5c3e]'
                        }`}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Feedback Comment */}
              <Text className="text-xs font-black text-[#4a3728] mb-1 uppercase tracking-wider">
                Detailed Feedback
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                maxLength={MAX_COMMENT}
                multiline
                numberOfLines={4}
                placeholder="Share your experience... What was most helpful?"
                placeholderTextColor="#a08070"
                className="bg-[#FAF9F6] border border-[#e0d8cf] rounded-2xl p-3.5 text-xs text-[#4a3728] min-h-[95px] textAlignVertical-top"
              />
              <View className="flex-row justify-between mt-1 mb-4">
                <Text className="text-[10px] text-[#8a7a6a]">
                  Min {MIN_COMMENT} characters
                </Text>
                <Text className="text-[10px] text-[#8a7a6a]">
                  {comment.length}/{MAX_COMMENT}
                </Text>
              </View>

              {error ? (
                <Text className="text-xs text-red-600 mb-3 text-center">{error}</Text>
              ) : null}

              {/* Mobile CTA Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full py-4 rounded-2xl items-center justify-center shadow-sm mb-2 ${
                  !canSubmit || isSubmitting ? 'bg-[#7a5c3e]/40' : 'bg-[#4a3728]'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-sm">Submit Feedback</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WriteReviewModal;
