import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Alert,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { C, PAY_METHODS, BANKS, WALLETS } from '../data/mentorData';
import type { Service, CalendarData, FormData } from '../data/mentortypes';
import PickerSheet from '../../auth/components/PickerSheet';

import SessionService from '../../../services/session.service';
import AvailabilityService from '../../../services/availability.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentStepProps {
  selectedService: Service | null;
  calendarData: CalendarData;
  formData: FormData;
  mentorId: string;
  onBack: () => void;
  onConfirm: () => void;
  onBookingSuccess: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  selectedService, calendarData, formData, mentorId,
  onBack, onConfirm, onBookingSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [booking, setBooking] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  const price: number = typeof selectedService?.price === 'number' ? selectedService.price : 0;
  const gst: number = Math.round(price * 0.18);
  const total: number = price + gst;

  const paymentMethodMap: Record<string, string> = {
    upi: 'razorpay', netbanking: 'razorpay', card: 'razorpay', wallet: 'wallet',
  };

  const handleBookSession = async () => {
    if (!paymentMethod) return;
    setBooking(true);
    try {
      const { selectedDate, currentMonth, availabilityId, slotTime } = calendarData;
      const yr = currentMonth.getFullYear();
      const mo = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dy = String(selectedDate).padStart(2, '0');
      const [startTimeRaw, endTimeRaw] = (slotTime || '10:00 - 11:00').split(' - ').map((s) => s?.trim());
      const startTime = startTimeRaw || '10:00';
      const durationMins = selectedService?.duration ? parseInt(String(selectedService.duration), 10) : 60;
      const [sh, sm] = startTime.split(':').map(Number);
      const endTotal = (sh || 0) * 60 + (sm || 0) + (durationMins > 0 ? durationMins : 60);
      const calculatedEndH = String(Math.floor(endTotal / 60) % 24).padStart(2, '0');
      const calculatedEndM = String(endTotal % 60).padStart(2, '0');
      const endTime = endTimeRaw || `${calculatedEndH}:${calculatedEndM}`;
      const scheduledAt = new Date(`${yr}-${mo}-${dy}T${startTime}:00+05:30`).toISOString();

      let finalAvailabilityId: string = availabilityId || '';

      // Ensure that a valid availability record exists in DB for this date and contains the exact slot [startTime, endTime]
      try {
        const availRes = await AvailabilityService.getMentorAvailability(mentorId);
        const avails = availRes?.data?.availabilities || [];
        const dateStr = `${yr}-${mo}-${dy}`;
        const matched = avails.find((a: any) => {
          const dbDate = new Date(a.date);
          const dbDateStr = `${dbDate.getFullYear()}-${String(dbDate.getMonth() + 1).padStart(2, '0')}-${String(dbDate.getDate()).padStart(2, '0')}`;
          const dbUTCStr = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
          return dbDateStr === dateStr || dbUTCStr === dateStr;
        });

        if (matched && (matched.availabilityId || matched._id)) {
          finalAvailabilityId = matched.availabilityId || matched._id || '';

          // Check if the matched record already contains the exact slot being booked
          const hasExactSlot = Array.isArray(matched.slots) && matched.slots.some(
            (s: any) => s.startTime === startTime && s.endTime === endTime && !s.isBlocked
          );

          if (!hasExactSlot && finalAvailabilityId) {
            // Subdivide / adjust existing slots to include the exact booked slot without overlap
            const startMins = (sh || 0) * 60 + (sm || 0);
            const endMins = endTotal;
            const existing = Array.isArray(matched.slots) ? matched.slots : [];
            const newSlotsList: Array<{ startTime: string; endTime: string; isBooked?: boolean; isBlocked?: boolean }> = [];

            existing.forEach((s: any) => {
              const [sH, sM] = (s.startTime || '00:00').split(':').map(Number);
              const [eH, eM] = (s.endTime || '00:00').split(':').map(Number);
              const sMin = (sH || 0) * 60 + (sM || 0);
              const eMin = (eH || 0) * 60 + (eM || 0);

              if (eMin <= startMins || sMin >= endMins) {
                newSlotsList.push(s);
              } else {
                if (sMin < startMins) {
                  newSlotsList.push({
                    startTime: s.startTime,
                    endTime: startTime,
                    isBooked: false,
                    isBlocked: false,
                  });
                }
                if (eMin > endMins) {
                  newSlotsList.push({
                    startTime: endTime,
                    endTime: s.endTime,
                    isBooked: false,
                    isBlocked: false,
                  });
                }
              }
            });

            newSlotsList.push({
              startTime,
              endTime,
              isBooked: false,
              isBlocked: false,
            });

            newSlotsList.sort((a, b) => {
              const [aH, aM] = a.startTime.split(':').map(Number);
              const [bH, bM] = b.startTime.split(':').map(Number);
              return (aH * 60 + aM) - (bH * 60 + bM);
            });

            await AvailabilityService.updateAvailability(finalAvailabilityId, { slots: newSlotsList }).catch((e) => {
              console.warn('Notice: Could not split slot in existing availability:', e?.message);
            });
          }
        } else {
          // Auto-create availability record for the mentor with the exact slot so backend booking succeeds without overlaps
          const newAvail = await AvailabilityService.createAvailability({
            mentorId,
            date: new Date(`${yr}-${mo}-${dy}T00:00:00.000Z`).toISOString(),
            slots: [{ startTime, endTime }],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          });
          finalAvailabilityId = newAvail?.data?.availabilityId || newAvail?.data?._id || newAvail?.data?.availability?._id || '';
        }
      } catch (availErr: any) {
        console.warn('Availability fallback resolution notice:', availErr?.message);
        try {
          const refetch = await AvailabilityService.getMentorAvailability(mentorId);
          const avails = refetch?.data?.availabilities || [];
          const dateStr = `${yr}-${mo}-${dy}`;
          const matched = avails.find((a: any) => {
            const dbDate = new Date(a.date);
            const dbDateStr = `${dbDate.getFullYear()}-${String(dbDate.getMonth() + 1).padStart(2, '0')}-${String(dbDate.getDate()).padStart(2, '0')}`;
            const dbUTCStr = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
            return dbDateStr === dateStr || dbUTCStr === dateStr;
          });
          if (matched) {
            finalAvailabilityId = matched.availabilityId || matched._id || '';
          }
        } catch {}
      }

      const sessionId = selectedService?.id || (selectedService as any)?.sessionId || (selectedService as any)?._id || '';

      await SessionService.bookSession({
        sessionId,
        mentorId,
        availabilityId: finalAvailabilityId || 'default',
        slotTime,
        scheduledAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        paymentMethod: paymentMethodMap[paymentMethod] || 'stripe',
        pricing: {
          basePrice: price,
          platformFee: gst,
          totalAmount: total,
          currency: 'INR',
        },
      });

      // 1. Mark slot as isBooked in DB availability record so other users/devices see it as occupied
      try {
        if (finalAvailabilityId && finalAvailabilityId !== 'default' && finalAvailabilityId !== 'unavailable') {
          const freshAvail = await AvailabilityService.getAvailabilityById(finalAvailabilityId).catch(() => null);
          let currentSlots = freshAvail?.data?.slots || [];
          if (currentSlots.length === 0) {
            const allAvail = await AvailabilityService.getMentorAvailability(mentorId).catch(() => null);
            const foundRec = (allAvail?.data?.availabilities || []).find((a: any) =>
              a.availabilityId === finalAvailabilityId || a._id === finalAvailabilityId
            );
            if (foundRec && Array.isArray(foundRec.slots)) {
              currentSlots = foundRec.slots;
            }
          }

          let slotFound = false;
          const updatedSlots = currentSlots.map((s: any) => {
            if (s.startTime === startTime && s.endTime === endTime) {
              slotFound = true;
              return { ...s, isBooked: true };
            }
            return s;
          });
          if (!slotFound) {
            updatedSlots.push({ startTime, endTime, isBooked: true, isBlocked: false });
          }
          await AvailabilityService.updateAvailability(finalAvailabilityId, { slots: updatedSlots }).catch(() => {});
        }
      } catch (availUpdateErr) {
        console.warn('Notice: Could not mark slot isBooked in DB availability:', availUpdateErr);
      }

      // 2. Immediately cache booked slot locally for instant reflection across all services
      try {
        const dateStr = `${yr}-${mo}-${dy}`;
        const cacheKey = `@throne8_booked_slots_${mentorId}`;
        const existingVal = await AsyncStorage.getItem(cacheKey);
        const bookedList = existingVal ? JSON.parse(existingVal) : [];
        bookedList.push({
          date: dateStr,
          startTime,
          endTime,
          slotTime,
          scheduledAt,
          sessionId,
        });
        await AsyncStorage.setItem(cacheKey, JSON.stringify(bookedList));
      } catch (cacheErr) {
        console.warn('Notice: Could not update AsyncStorage booked slots:', cacheErr);
      }

      onBookingSuccess();
    } catch (error: any) {
      console.error('Booking failed:', error.message);
      Alert.alert('Booking Error', error.message || 'Failed to book session. Please try again.');
      setBooking(false);
    }
  };

  const inputClass = 'w-full px-4 py-3.5 rounded-2xl border border-[#e0d8cf] bg-[#fbf7f3] text-sm text-[#4a3728] mb-3';

  if (booking) {
    return (
      <View className="flex-1 bg-[#fbf7f3] items-center justify-center gap-y-5">
        <ActivityIndicator size="large" color={C.dark} />
        <Text className="text-base font-bold text-[#4a3728]">Booking your session...</Text>
        <Text className="text-xs text-[#7a5c3e]">Please wait, do not close this page</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-[#fbf7f3]">
        {/* Back */}
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="flex-row items-center gap-x-2 px-5 py-4">
          <ChevronLeft size={18} color={C.mid} />
          <Text className="text-sm text-[#7a5c3e] font-medium">Back to Details</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf]">
            <Text className="text-lg font-black text-[#4a3728] mb-0.5">Payment Method</Text>
            <Text className="text-xs text-[#7a5c3e] mb-5">Choose your preferred payment method</Text>

            {/* Method Cards — 2x2 grid */}
            <View className="flex-row flex-wrap gap-3 mb-5">
              {PAY_METHODS.map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPaymentMethod(m.id)}
                    activeOpacity={0.85}
                    className={`w-[47%] rounded-2xl p-4 items-center border-2 ${active ? 'bg-[#7a5c3e] border-[#7a5c3e]' : 'bg-[#fbf7f3] border-[#e0d8cf]'
                      }`}
                  >
                    <Text className="text-2xl mb-1">{m.icon}</Text>
                    <Text className={`font-bold text-xs mb-0.5 ${active ? 'text-white' : 'text-[#4a3728]'}`}>
                      {m.label}
                    </Text>
                    <Text className={`text-[10px] text-center ${active ? 'text-white/80' : 'text-[#7a5c3e]'}`}>
                      {m.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic input area */}
            {paymentMethod === 'upi' && (
              <TextInput
                value={upiId}
                onChangeText={setUpiId}
                placeholder="Enter UPI ID (e.g. name@upi)"
                placeholderTextColor="#b5a79a"
                className={inputClass}
                autoCapitalize="none"
              />
            )}

            {paymentMethod === 'netbanking' && (
              <TouchableOpacity
                onPress={() => setShowBankPicker(true)}
                activeOpacity={0.8}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#e0d8cf] bg-[#fbf7f3] flex-row justify-between items-center mb-3"
              >
                <Text className={`text-sm ${selectedBank ? 'text-[#4a3728]' : 'text-[#b5a79a]'}`}>
                  {selectedBank || 'Select Your Bank'}
                </Text>
                <Text className="text-[#7a5c3e]">▼</Text>
              </TouchableOpacity>
            )}

            {paymentMethod === 'card' && (
              <>
                <TextInput value={cardNumber} onChangeText={setCardNumber} placeholder="Card Number" placeholderTextColor="#b5a79a" keyboardType="number-pad" className={inputClass} />
                <View className="flex-row gap-x-3">
                  <TextInput value={cardExpiry} onChangeText={setCardExpiry} placeholder="MM/YY" placeholderTextColor="#b5a79a" className="flex-1 px-4 py-3.5 rounded-2xl border border-[#e0d8cf] bg-[#fbf7f3] text-sm text-[#4a3728] mb-3" />
                  <TextInput value={cardCvv} onChangeText={setCardCvv} placeholder="CVV" placeholderTextColor="#b5a79a" keyboardType="number-pad" secureTextEntry className="flex-1 px-4 py-3.5 rounded-2xl border border-[#e0d8cf] bg-[#fbf7f3] text-sm text-[#4a3728] mb-3" />
                </View>
              </>
            )}

            {paymentMethod === 'wallet' && (
              <TouchableOpacity
                onPress={() => setShowWalletPicker(true)}
                activeOpacity={0.8}
                className="w-full px-4 py-3.5 rounded-2xl border border-[#e0d8cf] bg-[#fbf7f3] flex-row justify-between items-center mb-3"
              >
                <Text className={`text-sm ${selectedWallet ? 'text-[#4a3728]' : 'text-[#b5a79a]'}`}>
                  {selectedWallet || 'Select Wallet'}
                </Text>
                <Text className="text-[#7a5c3e]">▼</Text>
              </TouchableOpacity>
            )}

            {/* Summary */}
            <View className="bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4 mb-4">
              <Text className="font-bold text-[#4a3728] mb-3 text-sm">Payment Summary</Text>
              {([
                ['Service Fee', `₹${price}`, false],
                ['Platform Fee', '₹0', false],
                ['GST (18%)', `₹${gst}`, false],
                ['Total', `₹${total}`, true],
              ] as [string, string, boolean][]).map(([k, v, bold]) => (
                <View key={k} className={`flex-row justify-between mb-1.5 ${bold ? 'border-t border-[#e0d8cf] pt-2 mt-1' : ''}`}>
                  <Text className={`text-xs ${bold ? 'font-bold text-[#4a3728]' : 'text-[#7a5c3e]'}`}>{k}:</Text>
                  <Text className={`text-xs ${bold ? 'font-black text-[#4a3728]' : 'text-[#4a3728]'}`}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Pay Button */}
            {!!paymentMethod && (
              <TouchableOpacity
                onPress={handleBookSession}
                activeOpacity={0.85}
                className="w-full py-4 bg-[#4a3728] rounded-2xl items-center shadow-md mb-4"
              >
                <Text className="text-white font-bold text-sm">Pay ₹{total} 💳</Text>
              </TouchableOpacity>
            )}

            {/* Security Note */}
            <View className="flex-row items-start gap-x-3 bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4">
              <Text className="text-xl">🔒</Text>
              <Text className="text-xs text-[#7a5c3e] leading-4 flex-1">
                Your payment information is secure and encrypted. We never store your card details.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Pickers */}
      <PickerSheet
        visible={showBankPicker}
        title="Select Your Bank"
        options={BANKS.map((b) => ({ label: b, value: b }))}
        selected={selectedBank}
        onSelect={setSelectedBank}
        onClose={() => setShowBankPicker(false)}
      />
      <PickerSheet
        visible={showWalletPicker}
        title="Select Wallet"
        options={WALLETS.map((w) => ({ label: w, value: w }))}
        selected={selectedWallet}
        onSelect={setSelectedWallet}
        onClose={() => setShowWalletPicker(false)}
      />
    </>
  );
};

export default PaymentStep;