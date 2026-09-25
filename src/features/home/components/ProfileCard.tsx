import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../../../store/hooks/useProfile';
import AuthService, { api } from '../../../services/auth.service';

interface ProfileCardProps {
  onNavigate?: (screen: string, params?: any) => void;
}

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

const ProfileCard: React.FC<ProfileCardProps> = ({ onNavigate }) => {
  const navigation = useNavigation<any>();

  const {
    profile,
    fetchProfile,
    profilePhotos,
    coverPhotos,
    fetchAllProfilePhotos,
    fetchAllCovers,
    loading,
  } = useProfile();

  const [dynamicFollowers, setDynamicFollowers] = useState<number | null>(null);
  const [dynamicConnections, setDynamicConnections] = useState<number | null>(null);
  const [dynamicViews, setDynamicViews] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchAllProfilePhotos();
    fetchAllCovers();

    const currentUser = AuthService.getCurrentUser() as any;
    const targetUserId = currentUser?.userId || currentUser?.id || currentUser?._id;

    if (targetUserId) {
      const fetchCounts = async () => {
        try {
          const [followRes, connRes, viewsRes] = await Promise.all([
            api.get(`/api/v1/connections/follow/counts/${targetUserId}`).catch(() => null),
            api.get(`/api/v1/connections/connection/user/${targetUserId}/count`).catch(() => null),
            api.get('/api/v1/profile/analytics/profile-views/count?dateRange=30').catch(() => null),
          ]);

          if (followRes?.data) {
            const fData = followRes.data.data || followRes.data;
            setDynamicFollowers(
              fData.followers !== undefined
                ? fData.followers
                : (fData.followersCount !== undefined ? fData.followersCount : 0)
            );
          } else {
            setDynamicFollowers(0);
          }

          if (connRes?.data) {
            const cData = connRes.data.data || connRes.data;
            setDynamicConnections(
              cData.count !== undefined
                ? cData.count
                : (cData.totalCount !== undefined
                    ? cData.totalCount
                    : (cData.total !== undefined ? cData.total : 0))
            );
          } else {
            setDynamicConnections(0);
          }

          if (viewsRes?.data) {
            const vData = viewsRes.data.data || viewsRes.data;
            setDynamicViews(
              vData.last30Days !== undefined
                ? vData.last30Days
                : (vData.total !== undefined ? vData.total : 0)
            );
          } else {
            setDynamicViews(0);
          }
        } catch (err) {
          setDynamicFollowers(0);
          setDynamicConnections(0);
          setDynamicViews(0);
        }
      };
      fetchCounts();
    }
  }, []);

  const currentUser = (AuthService.getCurrentUser() as any) || {};
  const p = (profile as any) || {};

  // Resolve active profile image
  let finalProfileImage =
    p.profileImage ||
    p.avatar ||
    currentUser?.avatar ||
    currentUser?.profileImage;

  if (profilePhotos && profilePhotos.length > 0) {
    const activePhoto =
      profilePhotos.find((item: any) => item.isActive || item.active) || profilePhotos[0];
    if (activePhoto) {
      finalProfileImage =
        activePhoto.cloudinarySecureUrl ||
        activePhoto.cloudinaryUrl ||
        activePhoto.url ||
        activePhoto.imageUrl ||
        activePhoto.photoUrl ||
        finalProfileImage;
    }
  }

  // Resolve active cover banner
  let finalCoverImage =
    p.coverImage ||
    p.banner ||
    currentUser?.coverImage;

  if (coverPhotos && coverPhotos.length > 0) {
    const activeCover =
      coverPhotos.find((c: any) => c.isActive || c.active) || coverPhotos[0];
    if (activeCover) {
      finalCoverImage =
        activeCover.cloudinarySecureUrl ||
        activeCover.cloudinaryUrl ||
        activeCover.url ||
        activeCover.imageUrl ||
        activeCover.coverUrl ||
        finalCoverImage;
    }
  }

  const firstName =
    p.firstName ||
    currentUser?.firstName ||
    (p.name ? p.name.split(' ')[0] : '') ||
    (currentUser?.name ? currentUser.name.split(' ')[0] : '');

  const lastName =
    p.lastName ||
    currentUser?.lastName ||
    (p.name ? p.name.split(' ').slice(1).join(' ') : '') ||
    (currentUser?.name ? currentUser.name.split(' ').slice(1).join(' ') : '');

  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : (p.username || currentUser?.username || 'Throne8 User');

  const isValidHeadline = (val: any): boolean => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim().toLowerCase();
    return (
      trimmed.length > 0 &&
      trimmed !== 'user' &&
      trimmed !== 'admin' &&
      trimmed !== 'member' &&
      trimmed !== 'null' &&
      trimmed !== 'undefined' &&
      trimmed !== 'new user' &&
      trimmed !== 'unknown'
    );
  };

  let candidateHl = p.headline || currentUser?.headline;
  if (typeof candidateHl === 'object' && candidateHl !== null) {
    candidateHl = candidateHl.title || candidateHl.headlineText || candidateHl.text;
  }
  let headline = isValidHeadline(candidateHl) ? candidateHl.trim() : '';

  if (!headline) {
    const obHl = p.onboarding?.headline || p.onboarding?.professionalHeadline || currentUser?.onboarding?.headline;
    if (isValidHeadline(obHl)) headline = obHl.trim();
  }
  if (!headline) {
    const wp = p.onboarding?.workingProfile || p.workingProfile || currentUser?.workingProfile;
    if (wp?.jobTitle) {
      headline = wp.companyName ? `${wp.jobTitle} at ${wp.companyName}` : wp.jobTitle;
    }
  }
  if (!headline) {
    const sp = p.onboarding?.studentProfile || p.studentProfile || currentUser?.studentProfile;
    if (sp?.degree) {
      headline = sp.collegeName ? `${sp.degree} Student at ${sp.collegeName}` : `${sp.degree} Student`;
    }
  }
  if (!headline && isValidHeadline(p.bio || p.about)) {
    headline = (p.bio || p.about).trim();
  }
  if (!headline && isValidHeadline(p.role)) {
    headline = p.role.trim();
  }
  if (!headline) {
    headline = 'Professional on Throne8';
  }

  const avatarUri =
    finalProfileImage && typeof finalProfileImage === 'string' && finalProfileImage.trim()
      ? (finalProfileImage.startsWith('http')
          ? finalProfileImage
          : `${api.defaults.baseURL}/api/v1/profile/profile-photo/get-photo/${finalProfileImage}`)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0d8cf&color=4a3728&size=128`;

  const handleGoToProfile = () => {
    if (onNavigate) {
      onNavigate('Profile');
    } else {
      navigation.navigate('Profile');
    }
  };

  const handleGoToNetwork = () => {
    if (onNavigate) {
      onNavigate('Network');
    } else {
      navigation.navigate('Network');
    }
  };

  const handleGoToAnalytics = () => {
    const targetUserId = currentUser?.userId || currentUser?.id || currentUser?._id;
    if (onNavigate) {
      onNavigate('ProfileAnalytics', { userId: targetUserId });
    } else {
      navigation.navigate('ProfileAnalytics', { userId: targetUserId });
    }
  };

  if (loading && !profile && !currentUser?.firstName) {
    return (
      <View className="bg-white/80 rounded-3xl p-8 border border-[#4a3728]/10 mx-3 mt-3 items-center justify-center">
        <ActivityIndicator size="large" color="#4a3728" />
      </View>
    );
  }

  return (
    <View className="bg-white/90 rounded-3xl overflow-hidden border border-[#4a3728]/12 shadow-sm mx-3 mt-3">
      {/* Cover Banner Backdrop */}
      <TouchableOpacity
        className="h-16 w-full bg-[#4a3728]/20 relative"
        onPress={handleGoToProfile}
        activeOpacity={0.85}
      >
        {finalCoverImage ? (
          <Image
            source={{ uri: finalCoverImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-[#4a3728]/15" />
        )}
      </TouchableOpacity>

      <View className="px-4 pb-4 pt-0">
        {/* Avatar + Name + Headline */}
        <TouchableOpacity
          className="items-center -mt-9 mb-3"
          onPress={handleGoToProfile}
          activeOpacity={0.7}
        >
          <View className="relative mb-2 shadow-md">
            <Image
              source={{ uri: avatarUri || DEFAULT_AVATAR }}
              className="w-16 h-16 rounded-full border-2 border-white bg-[#e0d8cf]"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </View>

          <Text className="text-[#2c1d11] text-base font-black text-center tracking-tight" numberOfLines={1}>
            {fullName}
          </Text>

          <Text
            className="text-[11px] font-medium text-center mt-0.5 px-2"
            style={{ color: '#6b5643' }}
            numberOfLines={2}
          >
            {headline}
          </Text>
        </TouchableOpacity>

        {/* Stats Row (3 Columns: Connections, Followers, Views) */}
        <View className="flex-row gap-1.5 mb-3.5">
          <TouchableOpacity
            onPress={handleGoToNetwork}
            activeOpacity={0.75}
            className="flex-1 bg-[#4a3728]/5 rounded-2xl py-2 px-1 items-center border border-[#4a3728]/10"
          >
            <Text className="text-[#2c1d11] text-sm font-black">
              {dynamicConnections ?? profile?.connections ?? 0}
            </Text>
            <Text className="text-[#6b5643] text-[10px] font-semibold">Connections</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoToProfile}
            activeOpacity={0.75}
            className="flex-1 bg-[#4a3728]/5 rounded-2xl py-2 px-1 items-center border border-[#4a3728]/10"
          >
            <Text className="text-[#2c1d11] text-sm font-black">
              {dynamicFollowers ?? profile?.followers ?? 0}
            </Text>
            <Text className="text-[#6b5643] text-[10px] font-semibold">Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoToAnalytics}
            activeOpacity={0.75}
            className="flex-1 bg-[#4a3728]/5 rounded-2xl py-2 px-1 items-center border border-[#4a3728]/10"
          >
            <Text className="text-[#2c1d11] text-sm font-black">
              {dynamicViews ?? 0}
            </Text>
            <Text className="text-[#6b5643] text-[10px] font-semibold">Views</Text>
          </TouchableOpacity>
        </View>

        {/* View Profile Button */}
        <TouchableOpacity
          className="bg-[#4a3728] py-2.5 rounded-2xl items-center shadow-xs active:opacity-90"
          onPress={handleGoToProfile}
          activeOpacity={0.85}
        >
          <Text className="text-white text-xs font-bold tracking-wide uppercase">
            View Full Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(ProfileCard);