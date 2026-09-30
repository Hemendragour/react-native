import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, Image
} from 'react-native';
import { Star } from 'lucide-react-native';

export interface ReviewSubmissionModalProps {
  visible: boolean;
  loading: boolean;
  mentorName: string;
  mentorAvatar?: string;
  sessionDate?: string;
  initialRating?: number;
  initialComment?: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  visible,
  loading,
  mentorName,
  mentorAvatar,
  sessionDate,
  initialRating = 0,
  initialComment = '',
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible && !loading) {
      setRating(initialRating);
      setComment(initialComment);
      setValidationError(null);
    }
  }, [visible, initialRating, initialComment, loading]);

  const handleSubmit = () => {
    if (rating === 0) {
      setValidationError('Please select a rating.');
      return;
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 20) {
      setValidationError('Review must be at least 20 characters.');
      return;
    }
    if (trimmedComment.length > 1000) {
      setValidationError('Review cannot exceed 1000 characters.');
      return;
    }

    setValidationError(null);
    onSubmit(rating, trimmedComment);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white w-full rounded-2xl p-5 shadow-xl">
          
          {/* Header */}
          <Text className="text-xl font-bold text-[#4a3728] mb-1">
            ⭐ Leave a Review
          </Text>
          <Text className="text-sm text-[#8a7a6a] mb-4">
            Help others by sharing your experience.
          </Text>

          {/* Divider */}
          <View className="h-px bg-[#e0d8cf] mb-4" />

          {/* Mentor Info */}
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ece7e2] mr-3 bg-[#4a3728] items-center justify-center">
              {mentorAvatar ? (
                <Image source={{ uri: mentorAvatar }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-white font-black text-lg">{mentorName?.[0]?.toUpperCase() ?? 'M'}</Text>
              )}
            </View>
            <View>
              <Text className="font-bold text-[#4a3728] text-base">{mentorName}</Text>
              {sessionDate && <Text className="text-xs text-[#8a7a6a]">{sessionDate}</Text>}
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-[#e0d8cf] mb-4" />

          {/* Star Rating */}
          <View className="items-center mb-4">
            <View className="flex-row gap-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  disabled={loading}
                  onPress={() => {
                    setRating(star);
                    setValidationError(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Star
                    size={32}
                    color={star <= rating ? '#f59e0b' : '#d1d5db'}
                    fill={star <= rating ? '#f59e0b' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-sm font-bold text-[#7a5c3e]">
              {rating > 0 ? RATING_LABELS[rating] : 'Tap a star to rate'}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-[#e0d8cf] mb-4" />

          {/* Comment Input */}
          <View className="mb-4">
            <Text className="font-bold text-[#4a3728] mb-2 text-sm">Share your experience</Text>
            <TextInput
              className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-xl px-4 py-3 text-[#4a3728] h-28"
              placeholderTextColor="#8a7a6a"
              placeholder="Write your review here... (min 20 chars)"
              value={comment}
              onChangeText={(text) => {
                setComment(text);
                setValidationError(null);
              }}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
            <View className="flex-row justify-between mt-1 px-1">
              {validationError ? (
                <Text className="text-xs text-red-600 font-medium">{validationError}</Text>
              ) : (
                <View />
              )}
              <Text className={`text-xs ${comment.length > 1000 ? 'text-red-600' : 'text-[#8a7a6a]'}`}>
                {comment.length} / 1000
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-x-3 pt-2">
            <TouchableOpacity
              disabled={loading}
              onPress={onClose}
              className={`flex-1 px-4 py-3 bg-red-50 border border-red-200 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
            >
              <Text className="text-red-600 font-bold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              className={`flex-1 px-4 py-3 bg-[#4a3728] rounded-xl items-center flex-row justify-center ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" className="mr-2" />
                  <Text className="text-white font-bold">Submitting...</Text>
                </>
              ) : (
                <Text className="text-white font-bold">Submit</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default ReviewSubmissionModal;
