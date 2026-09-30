import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Linking,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { C, MENTOR } from '../data/mentorData';

interface MentorSidebarProps {
  mentorData: any;
  isOwner?: boolean;
}

const MentorSidebar: React.FC<MentorSidebarProps> = ({ mentorData, isOwner = false }) => {
  const [bannerUri, setBannerUri] = useState<string | null>(null);

  const existingBanner =
    mentorData?.bannerImage ||
    mentorData?.banner ||
    mentorData?.coverImage ||
    mentorData?.coverPhoto ||
    mentorData?.coverPic ||
    mentorData?.user?.coverImage ||
    mentorData?.user?.bannerImage ||
    mentorData?.user?.coverPhoto;

  const displayBanner = bannerUri || existingBanner || null;

  // ── Data with MENTOR fallback (same logic as web) ─────────────────────────
  const firstName = mentorData?.user?.firstName || '';
  const lastName = mentorData?.user?.lastName || '';
  const name = mentorData
    ? (mentorData.user?.fullName || `${firstName} ${lastName}`.trim() || mentorData.title || 'Mentor')
    : MENTOR.name;
  const initials = name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'M';
  const rating = mentorData?.stats?.averageRating ?? MENTOR.rating;
  const currentRole = mentorData?.experience?.currentRole ?? MENTOR.title;
  const experience = mentorData?.experience?.total ? `${mentorData.experience.total} years of Experience` : MENTOR.experience;
  const about = mentorData?.bio ?? MENTOR.about;
  // ── Extract Profile Picture Robustly ──────────────────────────────────────
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

  const image = getResolvedPic(mentorData);
  const verified = mentorData?.verification?.isVerified ?? MENTOR.verified;
  const totalSessions = mentorData?.stats?.totalSessions ?? MENTOR.totalEngagements;
  const completionRate = mentorData?.stats?.completionRate ? `${mentorData.stats.completionRate}%` : MENTOR.attendance;
  const responseTime = mentorData?.stats?.responseTime ? `< ${mentorData.stats.responseTime} hrs` : MENTOR.responseTime;
  const successRate = mentorData?.stats?.completionRate ? `${mentorData.stats.completionRate}%` : MENTOR.successRate;
  const previousRoles = mentorData?.experience?.previousRoles ?? [];
  const linkedinUrl = mentorData?.socialProof?.linkedinUrl ?? '#';
  const githubUrl = mentorData?.socialProof?.githubUrl;
  const skills: string[] = mentorData?.skills ?? [];

  const stats: [string, string | number][] = [
    ['Total Sessions', totalSessions],
    ['Completion Rate', completionRate],
    ['Response Time', responseTime],
    ['Success Rate', successRate],
  ];

  const handleBannerPick = () => {
    launchImageLibrary({ mediaType: 'photo' }, (res) => {
      const uri = res.assets?.[0]?.uri;
      if (uri) setBannerUri(uri);
    });
  };

  return (
    <View className="rounded-3xl overflow-hidden border border-[#e0d8cf] shadow-xl bg-[#fbf7f3] mb-4">

      {/* Banner */}
      <View className="h-28 bg-[#4a3728] relative">
        {displayBanner && (
          <Image source={{ uri: displayBanner }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
        )}
        {isOwner && (
          <TouchableOpacity
            onPress={handleBannerPick}
            activeOpacity={0.8}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-lg items-center justify-center border border-[#e0d8cf]"
          >
            <Text className="text-sm">📷</Text>
          </TouchableOpacity>
        )}

        {/* Avatar — overlaps banner */}
        <View className="absolute -bottom-11 self-center left-0 right-0 items-center">
          <View className="relative">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-22 h-22 rounded-full border-4 border-[#fbf7f3]"
                style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: C.bg }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: C.bg, backgroundColor: '#4a3728' }}
                className="items-center justify-center"
              >
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{initials}</Text>
              </View>
            )}
            {verified && (
              <View className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-green-500 items-center justify-center border-2 border-white">
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Body */}
      <View className="pt-14 px-5 pb-6 items-center">
        {/* Name + Rating */}
        <Text className="text-lg font-black text-[#4a3728] text-center mb-1">{name}</Text>
        <View className="flex-row items-center gap-x-1 mb-2">
          <Text className="text-amber-400 text-sm">★</Text>
          <Text className="font-bold text-[#4a3728] text-sm">{rating}</Text>
        </View>
        <Text className="text-xs text-[#7a5c3e] text-center mb-3" numberOfLines={2}>{currentRole}</Text>

        {/* Experience pill */}
        <View className="flex-row items-center gap-x-1.5 bg-[#e0d8cf] px-4 py-1.5 rounded-full mb-5">
          <Text className="text-xs">💼</Text>
          <Text className="text-xs text-[#4a3728] font-semibold">{experience}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-2 mb-5 w-full">
          {stats.map(([label, val]) => (
            <View key={label} className="flex-1 min-w-[44%] bg-[#f3ece4] border border-[#e0d8cf] rounded-xl p-3 items-center">
              <Text className="text-sm font-bold text-[#4a3728]">{val}</Text>
              <Text className="text-[10px] text-[#7a5c3e] mt-0.5 text-center">{label}</Text>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <View className="flex-row gap-x-2 mb-5">
          <TouchableOpacity
            onPress={() => Linking.openURL(linkedinUrl)}
            activeOpacity={0.8}
            className="px-5 py-2 bg-[#e0d8cf] rounded-xl"
          >
            <Text className="text-[#4a3728] font-bold text-sm">in</Text>
          </TouchableOpacity>
          {githubUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(githubUrl)}
              activeOpacity={0.8}
              className="px-5 py-2 bg-[#e0d8cf] rounded-xl"
            >
              <Text className="text-[#4a3728] font-bold text-sm">GitHub</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View className="w-full mb-5">
            <Text className="font-bold text-[#4a3728] mb-2 text-sm">Skills</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {skills.map((skill) => (
                <View key={skill} className="bg-[#f3ece4] border border-[#e0d8cf] px-3 py-1 rounded-full">
                  <Text className="text-[11px] text-[#4a3728]">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* About */}
        <View className="w-full mb-5">
          <Text className="font-bold text-[#4a3728] mb-2 text-sm">About</Text>
          <Text className="text-xs text-[#7a5c3e] leading-5">{about}</Text>
        </View>

        {/* Work Experience */}
        <View className="w-full">
          <Text className="font-bold text-[#4a3728] mb-3 text-sm">Work Experience</Text>

          {/* Current Role */}
          <View className="bg-[#f3ece4] border border-[#e0d8cf] rounded-xl p-3.5 mb-2.5">
            <Text className="font-bold text-[#4a3728] text-xs mb-1">{currentRole}</Text>
            <Text className="text-[11px] text-[#7a5c3e]">📅 Present</Text>
          </View>

          {/* Previous Roles or MENTOR fallback */}
          {(previousRoles.length > 0 ? previousRoles : MENTOR.workExperience).map((w: any, i: number) => (
            <View key={i} className="bg-[#f3ece4] border border-[#e0d8cf] rounded-xl p-3.5 mb-2.5">
              <Text className="font-bold text-[#4a3728] text-xs mb-1">{w.title || w.position}</Text>
              {w.company ? <Text className="text-xs font-semibold text-[#7a5c3e] mb-1">{w.company}</Text> : null}
              {w.location ? <Text className="text-[11px] text-[#7a5c3e] mb-0.5">📍 {w.location}</Text> : null}
              {w.duration ? <Text className="text-[11px] text-[#7a5c3e] mb-1">📅 {w.duration}</Text> : null}
              {w.description ? <Text className="text-xs text-[#4a3728]">{w.description}</Text> : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MentorSidebar;