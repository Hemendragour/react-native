import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { C, MONTHS } from '../data/mentorData';
import type { Service, CalendarData, FormData } from '../data/mentortypes';

// TODO: import { useProfileData } from '@/hooks/data/useProfileData';
// TODO: import { useAuth } from '@/hooks/useAuth';

interface DetailsStepProps {
  selectedService: Service | null;
  calendarData: CalendarData;
  onBack: () => void;
  onContinue: (data: FormData) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  selectedService, calendarData, onBack, onContinue,
}) => {
  const { selectedDate, selectedTime, currentMonth } = calendarData;
  const month = currentMonth.getMonth();
  const year  = currentMonth.getFullYear();

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', referralCode: '',
  });

  // TODO: Replace stub with real hooks:
  // const { user } = useAuth();
  // const { userProfileData, fetchUserProfile } = useProfileData();
  // useEffect(() => { if (user) fetchUserProfile(); }, [user]);
  // useEffect(() => { if (userProfileData) setFormData(prev => ({ ...prev, name: ..., email: ..., phone: ... })); }, [userProfileData]);

  const canProceed = !!(formData.name && formData.email && formData.phone);

  const LOCKED_FIELDS: (keyof FormData)[] = ['name', 'email', 'phone'];

  return (
    <View className="flex-1 bg-[#fbf7f3]">
      {/* Back */}
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="flex-row items-center gap-x-2 px-5 py-4">
        <ChevronLeft size={18} color={C.mid} />
        <Text className="text-sm text-[#7a5c3e] font-medium">Back to Calendar</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf]">
          <Text className="text-lg font-black text-[#4a3728] mb-0.5">Your Details</Text>
          <Text className="text-xs text-[#7a5c3e] mb-5">Fill in your information to complete the booking</Text>

          {/* Fields */}
          <View className="gap-y-4 mb-5">
            {([
              { label: 'Full Name *',            key: 'name',         ph: 'Your full name',       kb: 'default' },
              { label: 'Email Address *',         key: 'email',        ph: 'you@example.com',      kb: 'email-address' },
              { label: 'Phone Number *',          key: 'phone',        ph: '+91 XXXXX XXXXX',      kb: 'phone-pad' },
              { label: 'Referral Code (Optional)',key: 'referralCode', ph: 'Enter code if any',    kb: 'default' },
            ] as { label: string; key: keyof FormData; ph: string; kb: any }[]).map(({ label, key, ph, kb }) => {
              const isLocked = LOCKED_FIELDS.includes(key);
              return (
                <View key={key}>
                  <Text className="text-xs font-semibold text-[#4a3728] mb-1.5">{label}</Text>
                  <TextInput
                    value={formData[key]}
                    onChangeText={(v) => !isLocked && setFormData((p) => ({ ...p, [key]: v }))}
                    placeholder={ph}
                    placeholderTextColor="#b5a79a"
                    keyboardType={kb}
                    editable={!isLocked}
                    autoCapitalize="none"
                    className={`w-full px-4 py-3.5 rounded-2xl border text-sm ${
                      isLocked
                        ? 'bg-gray-100 border-[#e0d8cf] text-gray-500'
                        : 'bg-[#fbf7f3] border-[#e0d8cf] text-[#4a3728]'
                    }`}
                  />
                </View>
              );
            })}
          </View>

          {/* Order Summary */}
          <View className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4 mb-5">
            <Text className="font-bold text-[#4a3728] mb-3 text-sm">Order Summary</Text>
            {([
              ['Service', selectedService?.title ?? ''],
              ['Date',    `${selectedDate} ${MONTHS[month]} ${year}`],
              ['Time',    selectedTime],
              ['Total',   `₹${selectedService?.price}`],
            ] as [string, string][]).map(([k, v], i) => (
              <View key={k} className="flex-row justify-between mb-1.5">
                <Text className="text-xs text-[#7a5c3e]">{k}:</Text>
                <Text className={`text-xs font-medium text-[#4a3728] ${i === 3 ? 'font-bold' : ''}`}>{v}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={() => onContinue(formData)}
            disabled={!canProceed}
            activeOpacity={0.85}
            className={`w-full py-4 rounded-2xl items-center shadow-md ${canProceed ? 'bg-[#4a3728]' : 'bg-gray-300'}`}
          >
            <Text className={`font-bold text-sm ${canProceed ? 'text-white' : 'text-gray-500'}`}>
              Proceed to Payment →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsStep;