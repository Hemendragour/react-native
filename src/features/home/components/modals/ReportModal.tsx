// src/features/home/components/modals/ReportModal.tsx

import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ReportReason } from '../../types/feed.types';
import FeedService from '../../../../services/feed.service';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postOwnerId?: string;
  onReportSuccess?: () => void;
}

const REPORT_REASONS: { label: string; value: ReportReason; description: string }[] = [
  {
    label: 'Spam or misleading',
    value: 'spam_or_misleading',
    description: 'Commercial spam, repetitive content, or fraudulent schemes',
  },
  {
    label: 'Harassment or bullying',
    value: 'harassment_or_bullying',
    description: 'Targeting, intimidation, or hostility toward individuals',
  },
  {
    label: 'Hate speech',
    value: 'hate_speech',
    description: 'Attacking people based on race, religion, gender, or identity',
  },
  {
    label: 'Nudity or sexual content',
    value: 'nudity_or_sexual_content',
    description: 'Explicit images, pornography, or sexually provocative content',
  },
  {
    label: 'False information',
    value: 'false_information',
    description: 'Misinformation or misleading scientific/medical claims',
  },
  {
    label: 'Something else',
    value: 'something_else',
    description: 'Other issues not listed above',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  postId,
  postOwnerId,
  onReportSuccess,
}: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam_or_misleading');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setSelectedReason('spam_or_misleading');
    setDetails('');
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!postId) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await FeedService.reportPost({
        postId,
        reason: selectedReason,
        details: details.trim() || undefined,
        postOwnerId,
      });

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
        onReportSuccess?.();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#fdfbf9] rounded-t-3xl p-5 max-h-[85%] border-t border-[#e0d8cf]">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-[#e0d8cf]">
              <Text className="text-lg font-bold text-[#4a3728]">Report Post</Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 18L18 6M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {isSuccess ? (
              <View className="py-10 items-center justify-center">
                <Text className="text-3xl mb-2">✅</Text>
                <Text className="text-base font-bold text-[#4a3728]">Thank you for letting us know</Text>
                <Text className="text-xs text-[#6b5643] text-center mt-1">
                  We'll review this post against our community guidelines.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className="mt-3">
                <Text className="text-xs font-semibold text-[#6b5643] uppercase tracking-wider mb-2">
                  Select a reason
                </Text>

                {REPORT_REASONS.map((r) => {
                  const isSelected = selectedReason === r.value;
                  return (
                    <TouchableOpacity
                      key={r.value}
                      onPress={() => setSelectedReason(r.value)}
                      activeOpacity={0.7}
                      className={`flex-row items-start p-3 mb-2 rounded-2xl border ${
                        isSelected ? 'bg-[#f6ede8] border-[#8b6914]' : 'bg-white/60 border-[#e0d8cf]'
                      }`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center mr-3 mt-0.5 ${
                          isSelected ? 'border-[#8b6914] bg-[#8b6914]' : 'border-[#b5a89b]'
                        }`}
                      >
                        {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                      </View>
                      <View className="flex-1">
                        <Text className={`text-sm font-bold ${isSelected ? 'text-[#8b6914]' : 'text-[#4a3728]'}`}>
                          {r.label}
                        </Text>
                        <Text className="text-xs text-[#6b5643] mt-0.5">{r.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Additional Details */}
                <Text className="text-xs font-semibold text-[#6b5643] uppercase tracking-wider mt-3 mb-1.5">
                  Additional Details (Optional)
                </Text>
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Provide more context about why you're reporting this..."
                  placeholderTextColor="#a09487"
                  multiline
                  numberOfLines={3}
                  className="bg-white/80 border border-[#e0d8cf] rounded-2xl p-3 text-sm text-[#4a3728] mb-3 text-start min-h-[70px]"
                />

                {errorMessage && (
                  <Text className="text-red-500 text-xs font-semibold mb-3">{errorMessage}</Text>
                )}

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#4a3728] py-3.5 rounded-full items-center justify-center mb-6"
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-sm font-bold">Submit Report</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReportModal;
