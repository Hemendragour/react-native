import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { C, PAY_METHODS, BANKS, WALLETS } from '../data/mentorData';
import type { Service, CalendarData, FormData } from '../data/mentortypes';
import PickerSheet from '../../auth/components/PickerSheet';

// TODO: import SessionService from '@/lib/api/session.service';

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

  const price: number = selectedService?.price as number;
  const gst:   number = Math.round(price * 0.18);
  const total: number = price + gst;

  const paymentMethodMap: Record<string, string> = {
    upi: 'razorpay', netbanking: 'razorpay', card: 'razorpay', wallet: 'wallet',
  };

  const handleBookSession = async () => {
    if (!paymentMethod) return;
    setBooking(true);
    try {
      const { selectedDate, currentMonth, availabilityId, slotTime } = calendarData;
      const yr  = currentMonth.getFullYear();
      const mo  = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dy  = String(selectedDate).padStart(2, '0');
      const startTime   = slotTime.split(' - ')[0];
      const scheduledAt = new Date(`${yr}-${mo}-${dy}T${startTime}:00+05:30`).toISOString();

      // TODO: await SessionService.bookSession({ ... });
      await new Promise((res) => setTimeout(res, 1500)); // stub

      onBookingSuccess();
    } catch (error: any) {
      console.error('Booking failed:', error.message);
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
                    className={`w-[47%] rounded-2xl p-4 items-center border-2 ${
                      active ? 'bg-[#7a5c3e] border-[#7a5c3e]' : 'bg-[#fbf7f3] border-[#e0d8cf]'
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
                ['Service Fee',   `₹${price}`,  false],
                ['Platform Fee',  '₹0',         false],
                ['GST (18%)',     `₹${gst}`,    false],
                ['Total',         `₹${total}`,  true ],
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