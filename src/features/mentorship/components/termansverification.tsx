import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, Pressable,
} from 'react-native';
import { X, CheckCircle } from 'lucide-react-native';

// ─── Terms & Conditions Modal ─────────────────────────────────────────────────
interface TermsProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TERMS_CONTENT=[
    { title: 'Acceptance of Terms', content: 'By accessing and using the Throne8 platform, you agree to be bound by these Terms and Conditions.' },
    { title: 'User Responsibilities', content: 'You are responsible for maintaining the confidentiality of your Throne8 account credentials. All activities performed under your account are your sole responsibility.' },
    { title: 'Privacy Policy', content: 'Thronet Technology Private Limited collects and processes your personal data in accordance with our Privacy Policy. We do not sell or share your personal data with third parties without your consent.' },
    { title: 'Payment Terms', content: 'All payments made on the Throne8 platform are final and non-refundable unless stated otherwise. You agree to provide accurate billing information.' },
     { title: 'Community Guidelines', content: 'All users must engage respectfully. Any form of harassment, abuse, hate speech, or illegal activity is strictly prohibited and may result in immediate account termination.' },
     { title: 'Platform Rules', content: 'You agree not to misuse the Throne8 platform or engage in any activity that disrupts platform services. Thronet Technology Private Limited reserves the right to suspend or terminate accounts that violate these rules.' },
    { title: 'Changes to Terms', content: 'Thronet Technology Private Limited reserves the right to modify these Terms & Conditions at any time. Continued use constitutes your acceptance of the updated terms.' },
    { title: 'Contact Us', content: 'For any questions regarding these Terms & Conditions, please contact our support team.', contact: true },

];

export const termsandcondificonsModal:React.FC<TermsProps>=(
    { isOpen, onClose, onAccept }
)=>(
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable className="flex-1 bg-black/50 justify-center items-center px-4" onPress={onClose}>
      <Pressable className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e0d8cf] max-h-[90%]"
        onPress={e => e.stopPropagation()}>
        {/* Header */}
        <View className="flex-row items-start justify-between px-6 py-5 border-b-2 border-[#e0d8cf]">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#4a3728]">Terms & Conditions</Text>
            <Text className="text-xs text-[#8a7a6a] mt-0.5">Throne8 (Thronet Technology Private Limited)</Text>
            <Text className="text-xs text-[#9a8a7a] mt-0.5">Last Updated: February 21, 2026</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="p-1.5">
            <X size={20} color="#4a3728" />
          </TouchableOpacity>
        </View>
 
        {/* Scrollable Content */}
        <ScrollView className="px-6 py-5" showsVerticalScrollIndicator={false}>
          {TERMS_CONTENT.map((section, idx) => (
            <View key={idx} className="mb-5">
              <View className="flex-row items-center gap-x-2 mb-2">
                <View className="w-6 h-6 rounded-full bg-[#7a5c3e] items-center justify-center">
                  <Text className="text-white text-xs font-bold">{idx + 1}</Text>
                </View>
                <Text className="text-base font-bold text-[#4a3728]">{section.title}</Text>
              </View>
              <Text className="text-sm leading-5 text-[#7a5c3e] ml-8">{section.content}</Text>
              {section.contact && (
                <View className="mt-3 ml-8 p-4 rounded-xl bg-[#fbf7f3] border-l-4 border-[#7a5c3e]">
                  <Text className="text-sm font-semibold text-[#4a3728] mb-1">📧 support@throne8.com</Text>
                  <Text className="text-sm text-[#7a5c3e]">🏢 Thronet Technology Private Limited, Bhopal, Madhya Pradesh, India</Text>
                </View>
              )}
            </View>
          ))}
 
          {/* Notice */}
          <View className="p-4 rounded-2xl border-2 border-[#e0d8cf] bg-[#fbf7f3] mb-4">
            <Text className="text-xs leading-5 text-[#8a7a6a]">
              By using the Throne8 platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </Text>
          </View>
          <View className="h-4" />
        </ScrollView>
 
        {/* Footer */}
        <View className="px-6 py-4 border-t-2 border-[#e0d8cf]">
          <TouchableOpacity onPress={() => { onAccept(); onClose(); }} activeOpacity={0.85}
            className="w-full py-3.5 rounded-2xl bg-[#4a3728] items-center shadow-md">
            <Text className="text-white font-semibold text-sm">I Understand & Accept</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
)

// ─── Verification Modal ───────────────────────────────────────────────────────
interface VerificationProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified: boolean;
  agreedToTerms: boolean;
  agreedToCode: boolean;
  setAgreedToTerms: (v: boolean) => void;
  setAgreedToCode: (v: boolean) => void;
  onVerify: () => void;
}

export const verificationModal:React.FC<VerificationProps>=({
    isOpen, onClose, isVerified, agreedToTerms, agreedToCode,
  setAgreedToTerms, setAgreedToCode, onVerify, 
})=>{
    const checks = [
      { label: 'Real professional identity', done: true },
    { label: 'LinkedIn profile reviewed', done: true },
    { label: 'Expertise validated',       done: false },
    { label: 'Background check complete', done: false },
  ];
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-4" onPress={onClose}>
        <Pressable className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e0d8cf]"
          onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b-2 border-[#e0d8cf]">
            <Text className="text-lg font-black text-[#4a3728]">🛡️ Verification</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}><X size={20} color="#4a3728" /></TouchableOpacity>
          </View>
 
          <ScrollView className="px-5 py-5" showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View className={`p-4 rounded-2xl mb-5 border-2 ${isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <Text className={`font-bold text-sm ${isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                {isVerified ? '✅ Your account is verified!' : '⏳ Verification pending review'}
              </Text>
              <Text className={`text-xs mt-1 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {isVerified ? 'You have full access to all mentor features.' : 'Our team will review your profile within 2-3 business days.'}
              </Text>
            </View>
 
            {/* Checklist */}
            <Text className="font-bold text-[#4a3728] mb-3 text-sm">Verification Checklist</Text>
            <View className="gap-y-2 mb-5">
              {checks.map((c, i) => (
                <View key={i} className="flex-row items-center gap-x-3 p-3 bg-[#fbf7f3] border border-[#e0d8cf] rounded-xl">
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${c.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {c.done && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <Text className={`text-sm ${c.done ? 'text-[#4a3728] font-semibold' : 'text-gray-400'}`}>{c.label}</Text>
                </View>
              ))}
            </View>
 
            {/* Agreements */}
            <Text className="font-bold text-[#4a3728] mb-3 text-sm">Required Agreements</Text>
            {[
              { val: agreedToTerms, set: setAgreedToTerms, label: 'I agree to the Mentor Terms of Service and Community Guidelines.' },
              { val: agreedToCode, set: setAgreedToCode, label: 'I commit to the Mentor Code of Conduct and professional standards.' },
            ].map(({ val, set, label }, i) => (
              <TouchableOpacity key={i} onPress={() => set(!val)} activeOpacity={0.8}
                className="flex-row items-start gap-x-3 p-4 border-2 border-[#e0d8cf] rounded-2xl bg-[#fbf7f3] mb-3">
                <View className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 flex-shrink-0 ${val ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-gray-300'}`}>
                  {val && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
                <Text className="text-xs text-slate-600 font-medium flex-1 leading-4">{label}</Text>
              </TouchableOpacity>
            ))}
 
            {agreedToTerms && agreedToCode && !isVerified && (
              <TouchableOpacity onPress={onVerify} activeOpacity={0.85}
                className="w-full py-4 bg-[#4a3728] rounded-2xl items-center shadow-md mt-2">
                <Text className="text-white font-bold text-sm">Submit for Verification</Text>
              </TouchableOpacity>
            )}
            <View className="h-4" />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}