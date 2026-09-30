import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MONTHS } from '../data/mentorData';
import type { Service, CalendarData, FormData } from '../data/mentortypes';

interface ConfirmationStepProps {
  selectedService: Service | null;
  calendarData: CalendarData | null;
  formData: FormData | null;
  onReset: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedService, calendarData, formData, onReset,
}) => {
  const isRes  = selectedService?.type === 'Resource';
  const month  = calendarData?.currentMonth.getMonth();
  const year   = calendarData?.currentMonth.getFullYear();

  const rows: [string, string][] = [
    [isRes ? 'Resource:' : 'Service:', selectedService?.title ?? ''],
    ...(selectedService?.duration ? [['Duration:', selectedService.duration] as [string, string]] : []),
    ...(calendarData?.selectedDate
      ? [
          ['Date:', `${calendarData.selectedDate} ${month !== undefined ? MONTHS[month] : ''} ${year}`],
          ['Time:', calendarData.selectedTime],
        ] as [string, string][]
      : []),
    ...(formData?.email ? [['Email:', formData.email]] as [string, string][] : []),
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#fbf7f3]"
      contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      <View className="bg-[#f3ece4] rounded-3xl p-8 border border-[#e0d8cf] items-center">
        {/* Icon */}
        <Text className="text-6xl mb-4">{isRes ? '📥' : '✅'}</Text>

        {/* Title */}
        <Text className="text-xl font-black text-[#4a3728] mb-2 text-center">
          {isRes ? 'Download Ready! 🎉' : 'Booking Confirmed! 🎉'}
        </Text>
        <Text className="text-sm text-[#7a5c3e] mb-6 text-center">
          {isRes ? 'Your resource is ready to download' : 'Your session has been successfully booked'}
        </Text>

        {/* Details Card */}
        <View className="w-full bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-5 mb-4">
          <Text className="font-bold text-[#4a3728] mb-3 text-sm">
            {isRes ? 'Resource Details' : 'Booking Details'}
          </Text>
          {rows.map(([k, v]) => (
            <View key={k} className="flex-row justify-between mb-2">
              <Text className="text-xs text-[#7a5c3e]">{k}</Text>
              <Text className="text-xs font-semibold text-[#4a3728] flex-shrink ml-4 text-right" numberOfLines={2}>
                {v}
              </Text>
            </View>
          ))}
        </View>

        {/* Info Banner */}
        <View className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          {isRes ? (
            <Text className="text-xs text-green-700">📥 Your download will begin shortly</Text>
          ) : (
            <>
              <Text className="text-xs text-green-700 mb-1">
                📧 A confirmation email has been sent to {formData?.email}
              </Text>
              <Text className="text-xs text-green-700">
                📅 Add this session to your calendar to get reminded
              </Text>
            </>
          )}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={onReset}
          activeOpacity={0.85}
          className="w-full py-4 bg-[#4a3728] rounded-2xl items-center mb-3 shadow-md"
        >
          <Text className="text-white font-bold text-sm">
            {isRes ? 'Get Another Resource' : 'Book Another Session'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onReset}
          activeOpacity={0.8}
          className="w-full py-4 bg-[#e0d8cf] rounded-2xl items-center"
        >
          <Text className="text-[#4a3728] font-semibold text-sm">Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ConfirmationStep;