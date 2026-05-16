import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../auth/navigation/AppNavigation';

import { useNavigation } from '@react-navigation/native';
import {dummyProfile} from '..//..//profile/components/ProfileHeader'

// ── TODO: Uncomment when hooks are ready ──────────────────────────────────────
// import { useAuth } from '@/hooks/useAuth';
// import { useProfileData } from '@/hooks/data/useProfileData';
// import { useHeadlineData } from '@/hooks/data/useHeadlineData';
// import { useProfile } from '@/store/hooks';
// import { useConnectionsData } from '@/hooks/data/useConnectionsData';
// import { transformToProfileData } from '@/utils/profileTransformers';
// import StatsCards from '../Right/StatsCards';

// interface ProfileCardProps {
//   currentUserId: string;
// }

const ProfileCard = () => {
  type NavProp = NativeStackNavigationProp<AppStackParamList>;
const navigation = useNavigation<NavProp>();
return(
  // ── TODO: Replace stub data with real hooks when ready ─────────────────────
  // const { user } = useAuth();
  // const { userProfileData, profileImageUrl, headlineId, fetchUserProfile } = useProfileData();
  // const { userPosts, loadProfile, loadPosts } = useProfile();
  // const { headlineData, isLoadingHeadline, fetchHeadlineData } = useHeadlineData(headlineId);
  // const { totalConnections, fetchConnectionsData } = useConnectionsData();
  // const profileData = transformToProfileData(userProfileData, profileImageUrl, headlineData);
  // const fullName = userProfileData ? `${userProfileData.firstName} ${userProfileData.lastName}`.trim() : 'Loading...';
  // ── Stub data (remove when hooks are wired) ────────────────────────────────
  <View className="bg-white/40 rounded-2xl p-4 border-2 border-dashed border-[#d4c4b5] mx-3 mt-3">
 
      {/* Avatar + Name + Headline */}
      <View className="items-center mb-3">
        <Image
          source={{ uri: dummyProfile.profileImage }}
          className="w-20 h-20 rounded-2xl border-4 border-brand-border"
          resizeMode="cover"
        />
        <Text className="text-[#4a3728] text-lg font-black mt-2 text-center">
          {dummyProfile.name}
        </Text>
        <Text
          className="text-xs font-medium text-center mt-1"
          style={{ color: '#6b5643' }}
          numberOfLines={2}
        >
          {dummyProfile.headline}
        </Text>
      </View>
 
      {/* Stats */}
      <View className="flex-row gap-2 mb-3">
        <View className="flex-1 bg-[#4a3728]/5 rounded-xl p-2.5 items-center border border-[#8b6f47]/20">
          <Text className="text-[#6b5038] text-lg font-black">{dummyProfile.connections}</Text>
          <Text className="text-[#6b5038] text-xs font-medium">Connections</Text>
        </View>
        <View className="flex-1 bg-[#4a3728]/5 rounded-xl p-2.5 items-center border border-[#8b6f47]/20">
          <Text className="text-[#6b5038] text-lg font-black">{dummyProfile.followers}</Text>
          <Text className="text-[#6b5038] text-xs font-medium">Followers</Text>
        </View>
      </View>
 
      {/* View Profile Button */}
      <TouchableOpacity
        className="bg-brand-dark py-3 rounded-xl items-center"
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.85}
      >
        <Text className="text-[#4a3728] text-sm font-bold">View Full Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;