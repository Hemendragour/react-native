import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Eye,
  CheckCircle2,
  FileText,
  Award,
  Check,
  Briefcase,
  Code,
  Globe,
  Languages,
  Clock,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react-native';

export interface MentorProfileProps {
  mentor: any;
  loading?: boolean;
  onEditProfessionalProfile?: () => void;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  mentor,
  loading,
  onEditProfessionalProfile,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(true);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4a3728" />
        <Text className="text-[#8a7a6a] mt-3 font-bold text-xs">Loading mentor profile...</Text>
      </View>
    );
  }

  if (!mentor) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-[#8a7a6a] font-bold text-xs">No mentor data found.</Text>
      </View>
    );
  }

  const name = mentor.title || mentor.user?.fullName || `${mentor.user?.firstName || ''} ${mentor.user?.lastName || ''}`.trim() || 'Mentor';
  const initials = name !== 'Mentor' ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'M';
  const currentRole = mentor.experience?.currentRole || 'Software Engineer';
  const totalExp = mentor.experience?.total || 5;
  const expLevel = mentor.experience?.level || 'Senior';
  const domains = mentor.domains && mentor.domains.length > 0 ? mentor.domains : ['Web Development', 'Mobile Development'];
  const skills = mentor.skills && mentor.skills.length > 0 ? mentor.skills : ['React Native'];
  const bio = mentor.bio || 'Hey hi hello how are you, welcome to my mentorship profile!';
  const getResolvedPic = (data: any): string | null => {
    if (!data) return null;
    const candidates = [
      data.profilePic,
      data.profilePhotoUrl,
      data.profileImage,
      data.profilePhoto,
      data.avatar,
      data.photo,
      data.user?.profileImage,
      data.user?.profilePhoto,
      data.user?.profilePhotoUrl,
      data.user?.avatar,
      data.user?.photo,
    ];

    for (const pic of candidates) {
      if (!pic) continue;
      if (typeof pic === 'string' && pic.trim().length > 0) {
        if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') || pic.startsWith('file:')) {
          return pic;
        }
      }
      if (typeof pic === 'object' && pic !== null) {
        const nested = pic.url || pic.secure_url || pic.uri;
        if (typeof nested === 'string' && nested.trim().length > 0) return nested;
      }
    }
    return null;
  };

  const profilePic = getResolvedPic(mentor);
  const isApproved = mentor.status === 'approved' || mentor.verification?.isVerified || true;
  const viewsCount = mentor.stats?.views || mentor.views || 0;

  const linkedinUrl = mentor.socialProof?.linkedinUrl || '';
  const githubUrl = mentor.socialProof?.githubUrl || '';

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 50 }}>
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-[#3c2a1e] items-center justify-center shadow-sm">
            <User size={20} color="#ffffff" />
          </View>
          <View>
            <Text className="text-lg font-black text-[#3c2a1e]">Create/Edit Profile</Text>
            <Text className="text-xs text-[#8a7a6a] font-medium">Build your professional mentor profile</Text>
          </View>
        </View>

        {/* View Count Badge */}
        <View className="bg-white border border-[#e4dbd1] px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm">
          <Eye size={13} color="#8a7a6a" />
          <Text className="text-xs font-bold text-[#4a3728]">{viewsCount} views</Text>
        </View>
      </View>

      {/* ── 2. Main Profile Card ── */}
      <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-5">
        {/* Top Bar: Avatar, Name, Status, and Update Full Profile Button */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center flex-1 pr-2">
            {/* Avatar */}
            {profilePic ? (
              <Image
                source={{ uri: profilePic }}
                className="w-14 h-14 rounded-2xl border-2 border-[#d4a574] mr-3.5"
                resizeMode="cover"
              />
            ) : (
              <View className="w-14 h-14 rounded-2xl border-2 border-[#d4a574] bg-[#f5ede4] items-center justify-center mr-3.5">
                <Text className="text-[#4a3728] text-xl font-black">{initials}</Text>
              </View>
            )}

            {/* Name & Status */}
            <View className="flex-1">
              <Text className="text-base font-black text-[#3c2a1e]" numberOfLines={1}>
                {name}
              </Text>
              <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-[10px] font-bold text-emerald-800 uppercase">Active</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <ShieldCheck size={12} color="#8a7a6a" />
                  <Text className="text-[10px] text-[#8a7a6a] font-medium" numberOfLines={1}>
                    {mentor.verification?.isVerified ? 'Verified Mentor' : 'Complete verifications to unlock badge'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Update Full Profile Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onEditProfessionalProfile}
            className="bg-[#3c2a1e] px-4 py-2.5 rounded-2xl shadow-sm self-start"
          >
            <Text className="text-white text-xs font-black">Update Full Profile</Text>
          </TouchableOpacity>
        </View>

        {/* MENTOR TITLE */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3">
          <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-1">
            MENTOR TITLE
          </Text>
          <Text className="text-sm font-bold text-[#3c2a1e]">{name}</Text>
        </View>

        {/* CURRENT ROLE & EXPERIENCE ROW */}
        <View className="flex-row gap-3 mb-3">
          {/* CURRENT ROLE */}
          <View className="flex-1 bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc]">
            <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-1">
              CURRENT ROLE
            </Text>
            <Text className="text-sm font-bold text-[#3c2a1e]" numberOfLines={1}>
              {currentRole}
            </Text>
          </View>

          {/* EXPERIENCE */}
          <View className="flex-1 bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc]">
            <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-1">
              EXPERIENCE
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-sm font-bold text-[#3c2a1e]">{totalExp}+ Years</Text>
              <View className="bg-[#e8decb] px-2 py-0.5 rounded-md">
                <Text className="text-[10px] font-bold text-[#4a3728] capitalize">{expLevel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DOMAINS */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3">
          <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-2">
            DOMAINS
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {domains.map((d: string, idx: number) => (
              <View key={idx} className="bg-[#f0e6dc] px-3.5 py-1.5 rounded-xl">
                <Text className="text-xs font-bold text-[#3c2a1e] capitalize">{d.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SKILLS */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-3">
          <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-2">
            SKILLS
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {skills.map((s: string, idx: number) => (
              <View key={idx} className="bg-[#f0e6dc] px-3.5 py-1.5 rounded-xl">
                <Text className="text-xs font-bold text-[#3c2a1e]">{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ABOUT ME */}
        <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc]">
          <Text className="text-[10px] font-bold uppercase text-[#8a7a6a] tracking-wider mb-1">
            ABOUT ME
          </Text>
          <Text className="text-xs font-medium text-[#4a3728] leading-5">{bio}</Text>
        </View>
      </View>

      {/* ── 3. Social Media Integration Section ── */}
      <View className="mb-5">
        <Text className="text-base font-black text-[#3c2a1e] mb-3">Social Media Integration</Text>

        {/* LinkedIn Card */}
        <View className="bg-white p-4 rounded-2xl border border-[#e4dbd1] flex-row items-center justify-between shadow-sm mb-3">
          <View className="flex-row items-center flex-1 pr-3">
            <View className="w-11 h-11 rounded-xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 items-center justify-center mr-3">
              <Text className="text-[#0a66c2] font-black text-base">in</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#3c2a1e]">LinkedIn Profile</Text>
              <Text className="text-xs text-[#8a7a6a] mt-0.5" numberOfLines={1}>
                {linkedinUrl ? linkedinUrl : 'Connect your LinkedIn account'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onEditProfessionalProfile}
            activeOpacity={0.8}
            className="bg-[#3c2a1e] px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">{linkedinUrl ? 'Edit' : 'Connect'}</Text>
          </TouchableOpacity>
        </View>

        {/* GitHub Card */}
        <View className="bg-white p-4 rounded-2xl border border-[#e4dbd1] flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center flex-1 pr-3">
            <View className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-300 items-center justify-center mr-3">
              <Code size={18} color="#24292e" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-[#3c2a1e]">GitHub</Text>
              <Text className="text-xs text-[#8a7a6a] mt-0.5" numberOfLines={1}>
                {githubUrl ? githubUrl : 'Link your GitHub account'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onEditProfessionalProfile}
            activeOpacity={0.8}
            className="bg-[#3c2a1e] px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">{githubUrl ? 'Edit' : 'Connect'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 4. Agreements & Verification Section ── */}
      <View className="mb-5">
        <View className="flex-row items-center gap-2 mb-3">
          <FileText size={18} color="#3c2a1e" />
          <Text className="text-base font-black text-[#3c2a1e]">Agreements & Verification</Text>
        </View>

        <View className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm">
          {/* Verification Process */}
          <View className="flex-row items-center gap-2 mb-3">
            <ShieldCheck size={16} color="#3c2a1e" />
            <Text className="text-sm font-bold text-[#3c2a1e]">Verification Process</Text>
          </View>

          {/* Verification Items List */}
          <View className="space-y-2 mb-4">
            {[
              { label: 'Email Verification', status: mentor.user?.isEmailVerified ? 'Verified' : 'Pending' },
              { label: 'Phone Verification', status: mentor.user?.isPhoneVerified ? 'Verified' : 'Pending' },
              { label: 'Identity Verification', status: mentor.verification?.identityVerified ? 'Verified' : 'Pending' },
              { label: 'Professional Credentials', status: mentor.verification?.credentialsVerified ? 'Verified' : 'Pending' },
            ].map((item, idx) => {
              const isDone = item.status === 'Verified';
              return (
                <View
                  key={idx}
                  className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ece4dc] flex-row items-center justify-between mb-2"
                >
                  <Text className="text-xs font-semibold text-[#4a3728]">{item.label}</Text>
                  <View
                    className={`px-3 py-1 rounded-full border ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase ${
                        isDone ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Platform Rules & Terms Acceptance */}
          <View className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ece4dc] mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTermsAccepted(!termsAccepted)}
              className="flex-row items-start gap-2.5"
            >
              <View
                className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${
                  termsAccepted ? 'bg-[#3c2a1e] border-[#3c2a1e]' : 'border-[#d4c4b5] bg-white'
                }`}
              >
                {termsAccepted && <Check size={14} color="#ffffff" />}
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#3c2a1e]">
                  Platform Rules & Terms Acceptance *
                </Text>
                <Text className="text-[11px] text-[#8a7a6a] mt-1 leading-4">
                  I accept the platform's terms of service, privacy policy, payment terms, and agree to follow all community guidelines and platform rules.
                </Text>
                <TouchableOpacity activeOpacity={0.7} className="mt-1.5 flex-row items-center gap-1">
                  <Text className="text-[11px] font-bold text-[#7a5c3e]">Read Terms & Conditions →</Text>
                </TouchableOpacity>
                {!termsAccepted && (
                  <Text className="text-[10px] text-amber-800 mt-1 font-medium">
                    ⚠️ Please read and accept the Terms & Conditions to enable the checkbox.
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Mentor Account Approved Banner */}
          {isApproved && (
            <>
              <View className="bg-[#5f9c73] py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm mb-3">
                <CheckCircle2 size={16} color="#ffffff" />
                <Text className="text-white text-xs font-black">Mentor Account Approved</Text>
              </View>

              <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <CheckCircle2 size={15} color="#15803d" />
                  <Text className="text-xs font-black text-emerald-800">
                    Your mentor account has been officially approved by Throne8.
                  </Text>
                </View>
                <Text className="text-[11px] text-emerald-700 leading-4 ml-6">
                  You are now fully authorized to conduct mentorship sessions and engage with mentees on the platform. Welcome to the Throne8 Mentor Community!
                </Text>
              </View>
            </>
          )}

          {/* Save as Draft Button */}
          <View className="items-end">
            <TouchableOpacity
              onPress={onEditProfessionalProfile}
              activeOpacity={0.8}
              className="bg-white border border-[#e4dbd1] px-5 py-2.5 rounded-2xl shadow-sm"
            >
              <Text className="text-xs font-bold text-[#3c2a1e]">Save as Draft</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MentorProfile;
