import { Alert, Modal, Pressable, Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import * as React from 'react'
import { useEffect, useState } from 'react'
import Svg, { Path } from 'react-native-svg';
import ImagePicker from 'react-native-image-crop-picker';
import AuthService, { api } from '../../../services/auth.service';
import ConnectionsModal from './modals/ConnectionsModal';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export const dummyProfile = {
  profileImage: 'https://img.freepik.com/premium-photo/sculpture-shield-with-shield-it_1309810-11832.jpg?semt=ais_hybrid&w=740&q=80',
  name: 'Honey Sharma',
  pronouns: 'he/him',
  company: 'Throne8',
  location: 'India',
  headline: 'Co-Founder @Throne8 | Empowering Professional Networking for Millions with AI, Security, and Scalable Innovation',
  followers: 1200,
  connections: 500,
  educationlist: [{ schoolcollegename: 'oriental college of technology' }],
  experiencelist: [{ companyname: 'Throne8', position: 'Co-Founder', current: true }]
};

interface ProfileHeaderProps {
  currentUserId?: string;
  profileImage?: string;
  name?: string;
  pronouns?: string;
  headline?: string;
  company?: string;
  description?: string;
  location?: string;
  followers?: number;
  connections?: string;
  firstName?: string;
  lastName?: string;
  currentPosition?: string;
  education?: string;
  contactInfo?: string;
  educationData?: {
    collegeName: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: string;
  };
  educationList?: any[];
  experienceList?: any[];
  onDataRefresh?: () => void;
  onProfileImageUpdate?: (newUrl: string) => void;
  onHeadlineCreated?: () => void;
  isOwnProfile?: boolean;
  connectionStatus?: string;
  profileUserId?: string;
}

const LocationIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const FollowersIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const ConnectionsIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUserId: _currentUserId,
  profileImage,
  name,
  pronouns,
  headline,
  company,
  location,
  followers,
  connections,
  firstName = '',
  lastName = '',
  currentPosition = '',
  education: _education = '',
  contactInfo: _contactInfo = '',
  educationData: _educationData,
  educationList: _educationList = [],
  experienceList = [],
  onDataRefresh,
  onProfileImageUpdate,
  onHeadlineCreated: _onHeadlineCreated,
  isOwnProfile = true,
  connectionStatus,
  profileUserId,
}: ProfileHeaderProps) => {

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

  const displayimage = profileImage || DEFAULT_AVATAR;
  const displayName = name?.trim() ? name : 'New User';
  const displayPronouns = pronouns || '';
  const displayHeadline = isValidHeadline(headline) ? (headline as string).trim() : '';
  const displayLocation = location || 'Location not set';
  const displayFollowers = followers ?? 0;
  const displayConnections = connections || 0;

  const canViewNetwork = isOwnProfile || connectionStatus === 'active' || connectionStatus === 'accepted';
  const displayExperienceList = experienceList || [];

  const [currentProfileImage, setCurrentProfileImage] = useState(displayimage);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [initialConnectionsTab, setInitialConnectionsTab] = useState<'Followers' | 'Connections' | 'Following'>('Connections');

  // --- Dynamic Followers and Connections ---
  const [dynamicFollowers, setDynamicFollowers] = useState<number | null>(followers ?? null);
  const [dynamicConnections, setDynamicConnections] = useState<number | null>(
    connections !== undefined ? (typeof connections === 'number' ? connections : parseInt(String(connections), 10) || null) : null
  );

  // Compute resolved user ID for the ConnectionsModal & counts fetching
  const currentUser = AuthService.getCurrentUser() as any;
  const currentUserIdFromAuth = currentUser?.userId || currentUser?.id || currentUser?._id;
  const resolvedUserId = profileUserId || _currentUserId || currentUserIdFromAuth || '';

  useEffect(() => {
    if (followers !== undefined && followers !== null) {
      setDynamicFollowers(followers);
    }
    if (connections !== undefined && connections !== null) {
      setDynamicConnections(typeof connections === 'number' ? connections : parseInt(String(connections), 10) || 0);
    }
  }, [followers, connections]);

  useEffect(() => {
    const targetUserId = resolvedUserId;

    if (!targetUserId) {
      return;
    }

    const fetchCounts = async () => {
      try {
        const [followRes, connRes, followersListRes] = await Promise.allSettled([
          api.get(`/api/v1/connections/follow/counts/${targetUserId}`),
          api.get(`/api/v1/connections/connection/user/${targetUserId}/count`),
          api.get(`/api/v1/connections/follow/followers/${targetUserId}`),
        ]);

        let resolvedFollowers: number | null = null;
        let resolvedConns: number | null = null;

        if (followRes.status === 'fulfilled' && followRes.value?.data) {
          const fData = followRes.value.data?.data || followRes.value.data;
          if (typeof fData.followers === 'number') resolvedFollowers = fData.followers;
          else if (typeof fData.followersCount === 'number') resolvedFollowers = fData.followersCount;
          else if (typeof fData.followerCount === 'number') resolvedFollowers = fData.followerCount;
          else if (typeof fData.count === 'number') resolvedFollowers = fData.count;
          else if (Array.isArray(fData.followers)) resolvedFollowers = fData.followers.length;
          else if (Array.isArray(fData)) resolvedFollowers = fData.length;
        }

        // If counts endpoint didn't provide a count or returned 0, check the followers list
        if (resolvedFollowers === null || resolvedFollowers === 0) {
          if (followersListRes.status === 'fulfilled' && followersListRes.value?.data) {
            const listData = followersListRes.value.data?.data || followersListRes.value.data;
            const arr = Array.isArray(listData) ? listData : (Array.isArray(listData?.followers) ? listData.followers : (Array.isArray(listData?.data) ? listData.data : []));
            if (arr.length > 0) {
              resolvedFollowers = arr.length;
            }
          }
        }

        if (connRes.status === 'fulfilled' && connRes.value?.data) {
          const cData = connRes.value.data?.data || connRes.value.data;
          if (typeof cData.count === 'number') resolvedConns = cData.count;
          else if (typeof cData.totalCount === 'number') resolvedConns = cData.totalCount;
          else if (typeof cData.total === 'number') resolvedConns = cData.total;
        }

        if (resolvedFollowers !== null) {
          setDynamicFollowers(resolvedFollowers);
        } else if (typeof followers === 'number') {
          setDynamicFollowers(followers);
        } else {
          setDynamicFollowers(0);
        }

        if (resolvedConns !== null) {
          setDynamicConnections(resolvedConns);
        } else if (connections !== undefined) {
          setDynamicConnections(typeof connections === 'number' ? connections : (parseInt(String(connections), 10) || 0));
        } else {
          setDynamicConnections(0);
        }
      } catch (err) {
        if (typeof followers === 'number') setDynamicFollowers(followers);
        if (connections !== undefined) setDynamicConnections(typeof connections === 'number' ? connections : (parseInt(String(connections), 10) || 0));
      }
    };

    fetchCounts();
  }, [resolvedUserId, followers, connections]);

  const finalFollowers = dynamicFollowers ?? displayFollowers;
  const finalConnections = dynamicConnections ?? displayConnections;
  // ---------------------------------------------------

  // ── Edit Intro Form State ──
  const [editFirstName, setEditFirstName] = useState(firstName || '');
  const [editLastName, setEditLastName] = useState(lastName || '');
  const [editHeadline, setEditHeadline] = useState(displayHeadline || '');
  const [editLocation, setEditLocation] = useState(displayLocation || '');

  // Reset/sync local state fields when the modal opens or props change
  useEffect(() => {
    if (isEditModalOpen) {
      setEditFirstName(firstName || '');
      setEditLastName(lastName || '');
      setEditHeadline(displayHeadline || '');
      setEditLocation(displayLocation || '');
    }
  }, [isEditModalOpen, firstName, lastName, displayHeadline, displayLocation]);

  // ── Image Upload logic for Cover inside Edit Intro ──
  const handleCoverPhotoUpdate = async (asset: any) => {
    console.log('📸 [ProfileHeader] Starting cover upload...', asset.uri);
    try {
      await AuthService.uploadCoverPhoto({
        uri: asset.uri,
        name: asset.fileName || 'cover.jpg',
        mimeType: asset.type || 'image/jpeg',
      });
      console.log('✅ [ProfileHeader] Cover upload SUCCESS');
      Alert.alert('Success', 'Cover banner updated successfully!');
      onDataRefresh?.();
    } catch (error: any) {
      console.error('❌ [ProfileHeader] Cover upload FAILED:', error?.message);
      Alert.alert('Upload Failed', error?.message || 'Failed to upload cover photo.');
    }
  };

  const handlePickCoverImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 1200,
        height: 400,
        cropping: true,
        freeStyleCropEnabled: true,
        mediaType: 'photo',
        compressImageQuality: 0.85,
        compressImageMaxWidth: 1920,
        compressImageMaxHeight: 1080,
        cropperToolbarTitle: 'Crop Banner Image',
        avoidEmptyTextTitle: true,
      });

      if (image && image.path) {
        handleCoverPhotoUpdate({
          uri: image.path,
          type: image.mime || 'image/jpeg',
          fileName: image.filename || image.path.split('/').pop() || `cover_${Date.now()}.jpg`,
        });
      }
    } catch (err: any) {
      const isCancelled =
        err?.code === 'E_PICKER_CANCELLED' ||
        err?.message?.toLowerCase().includes('cancel') ||
        err?.message?.includes('User cancelled');

      if (isCancelled) return;

      console.warn('⚠️ Cropping cover image failed, trying uncropped fallback...', err?.message);

      try {
        const fallbackImage = await ImagePicker.openPicker({
          mediaType: 'photo',
          compressImageQuality: 0.85,
          compressImageMaxWidth: 1920,
          compressImageMaxHeight: 1080,
          cropping: false,
        });

        if (fallbackImage && fallbackImage.path) {
          handleCoverPhotoUpdate({
            uri: fallbackImage.path,
            type: fallbackImage.mime || 'image/jpeg',
            fileName: fallbackImage.filename || fallbackImage.path.split('/').pop() || `cover_${Date.now()}.jpg`,
          });
        }
      } catch (fallbackErr: any) {
        const fallbackCancelled =
          fallbackErr?.code === 'E_PICKER_CANCELLED' ||
          fallbackErr?.message?.toLowerCase().includes('cancel') ||
          fallbackErr?.message?.includes('User cancelled');

        if (!fallbackCancelled) {
          Alert.alert('Error', fallbackErr?.message || 'Failed to select cover image. Please try a smaller image.');
        }
      }
    }
  };

  // ── Save Profile Updates handler ──
  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      Alert.alert('Validation Error', 'First Name and Last Name are required.');
      return;
    }

    try {
      console.log('📝 [ProfileHeader] Submitting profile updates...', {
        firstName: editFirstName,
        lastName: editLastName,
        headline: editHeadline,
        location: editLocation,
      });

      await AuthService.updateUserProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        location: editLocation.trim(),
      });

      // --- OLD CODE (Local Callback Only) ---
      // if (editHeadline.trim() !== displayHeadline) {
      //   onHeadlineCreated?.(editHeadline.trim());
      // }
      // --- NEW CODE (Direct Backend Integration) ---
      if (editHeadline.trim() !== displayHeadline) {
        console.log('📰 [ProfileHeader] Submitting new headline to backend...');
        await AuthService.createHeadline({ title: editHeadline.trim() });
      }

      console.log('✅ [ProfileHeader] Profile updates saved successfully');
      Alert.alert('Success', 'Profile intro updated successfully!');
      setIsEditModalOpen(false);
      onDataRefresh?.();
    } catch (error: any) {
      console.error('❌ [ProfileHeader] Update profile failed:', error?.message);
      Alert.alert('Update Failed', error?.message || 'Failed to update profile.');
    }
  };

  useEffect(() => {
    setCurrentProfileImage(profileImage || DEFAULT_AVATAR);
  }, [profileImage]);

  // --- OLD CODE (Original Local State Only) ---
  // const handleProfileImageUpdate = (newUrl: string)=>{
  //     setCurrentProfileImage(newUrl);
  //     onProfileImageUpdate?.(newUrl);
  //     onDataRefresh?.();
  //     setIsImageModalOpen(false);
  // }
  // 
  // const handlePickProfileImage = () =>{
  //     launchImageLibrary({ mediaType: 'photo' }, (response) => {
  //         if (response.didCancel) return;
  //         if (response.errorCode) {
  //             Alert.alert('Error', 'Failed to pick image: ' );
  //             return;
  //         }
  //         const uri = response.assets?.[0]?.uri;
  //         if (uri) {
  //             handleProfileImageUpdate(uri);
  //         }
  //     }
  //     ); 
  // }

  // --- NEW CODE (Backend Integrated) ---
  const handleProfileImageUpdate = async (asset: any) => {
    // 1. Instantly update the UI so it feels fast
    setCurrentProfileImage(asset.uri);
    setIsImageModalOpen(false);

    console.log('📸 [ProfileHeader] Starting upload...', {
      uri: asset.uri,
      type: asset.type,
      fileName: asset.fileName,
    });

    try {
      // 2. Actually upload to the backend using AuthService (RNFile format)
      const result = await AuthService.uploadProfilePhoto({
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        mimeType: asset.type || 'image/jpeg',
      });

      console.log('✅ [ProfileHeader] Upload SUCCESS:', JSON.stringify(result));

      // 3. Let the parent know and refresh Redux state
      onProfileImageUpdate?.(asset.uri);
      onDataRefresh?.();
    } catch (error: any) {
      console.error('❌ [ProfileHeader] Upload FAILED:', error?.message);
      Alert.alert('Upload Failed', error?.message || 'There was an issue uploading your photo.');
    }
  };

  const handlePickProfileImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 600,
        height: 600,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageQuality: 0.85,
        compressImageMaxWidth: 1200,
        compressImageMaxHeight: 1200,
        cropperToolbarTitle: 'Crop Profile Photo',
        avoidEmptyTextTitle: true,
      });

      if (image && image.path) {
        handleProfileImageUpdate({
          uri: image.path,
          type: image.mime || 'image/jpeg',
          fileName: image.filename || image.path.split('/').pop() || `profile_${Date.now()}.jpg`,
        });
      }
    } catch (err: any) {
      const isCancelled =
        err?.code === 'E_PICKER_CANCELLED' ||
        err?.message?.toLowerCase().includes('cancel') ||
        err?.message?.includes('User cancelled');

      if (isCancelled) return;

      console.warn('⚠️ Cropping profile photo failed, trying uncropped fallback...', err?.message);

      try {
        const fallbackImage = await ImagePicker.openPicker({
          mediaType: 'photo',
          compressImageQuality: 0.85,
          compressImageMaxWidth: 1200,
          compressImageMaxHeight: 1200,
          cropping: false,
        });

        if (fallbackImage && fallbackImage.path) {
          handleProfileImageUpdate({
            uri: fallbackImage.path,
            type: fallbackImage.mime || 'image/jpeg',
            fileName: fallbackImage.filename || fallbackImage.path.split('/').pop() || `profile_${Date.now()}.jpg`,
          });
        }
      } catch (fallbackErr: any) {
        const fallbackCancelled =
          fallbackErr?.code === 'E_PICKER_CANCELLED' ||
          fallbackErr?.message?.toLowerCase().includes('cancel') ||
          fallbackErr?.message?.includes('User cancelled');

        if (!fallbackCancelled) {
          Alert.alert('Error', fallbackErr?.message || 'Failed to select profile image. Please try a smaller image.');
        }
      }
    }
  };

  // --- OLD CODE (Mock/Dynamic School + Company line) ---
  // const _educationName = Array.isArray(displayEducationList) && displayEducationList.length > 0
  //   ? (displayEducationList[0] as any)?.schoolcollegename || educationData?.collegeName || ''
  //   : educationData?.collegeName || '';

  const companyName = Array.isArray(displayExperienceList)
    ? displayExperienceList.find((exp: any) => exp.current)?.company || currentPosition || company || ''
    : currentPosition || company || '';

  const formatNumber = (n: number) => n?.toLocaleString() ?? '0';

  // --- OLD CODE (Mock/Dynamic School + Company line) ---
  // const eduCompanyLine = [educationName, companyName].filter(Boolean).join(' • ');
  // --- NEW CODE (Show company name only) ---
  const eduCompanyLine = companyName;


  return (
    <View className="px-4 pb-4 -mt-10 ">
      <TouchableOpacity
        className="w-24 h-24 mb-3"
        onPress={() => isOwnProfile && setIsImageModalOpen(true)}
        activeOpacity={0.8}
        disabled={!isOwnProfile}>

        <Image
          source={{ uri: currentProfileImage }}
          className="w-24 h-24 rounded-2xl border-4 border-white"
          resizeMode='cover'
        ></Image>


        {isOwnProfile && (
          <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-dark items-center justify-center border-2 border-x-black">
            <Text className="text-black text-base font-bold" style={{ lineHeight: 18 }}>+</Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="bg-[#f6ede8]/80 rounded-3xl border border-[#e0d8cf]/50 p-4 gap-2 ">
        {isOwnProfile && (
          <TouchableOpacity className="absolute top-3 right-3 bg-brand-dark w-8 h-8 rounded-full items-center justify-center"
            onPress={() => setIsEditModalOpen(true)}
            activeOpacity={0.8}>
            <EditIcon />
            {/* <Text className="text-black text-sm">✏</Text> */}
          </TouchableOpacity>
        )}

        <View className="flex-row items-center flex-wrap gap-2 pr-10 mt-1 ">
          <Text className="text-[#4a3728] text-2xl font-bold">{displayName}</Text>
          {!!displayPronouns && (
            <View className="bg-brand-light px-2 py-0.5 rounded-full border border-[#4a3728]">
              <Text className="text-[#4a3728] text-xs">{displayPronouns}</Text>
            </View>
          )}
        </View>


        {/* --- Dynamic Headline or Placeholder --- */}
        {displayHeadline ? (
          <Text className="text-[#6b4e3d] text-sm font-semibold leading-5" numberOfLines={2}>{displayHeadline}</Text>
        ) : isOwnProfile ? (
          <Text className="text-[#8b6f47]/60 text-sm italic font-medium leading-5">Add professional headline...</Text>
        ) : null}
        {eduCompanyLine ? <Text className="text-brand-dark text-sm font-bold">{eduCompanyLine}</Text> : null}

        <View className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-1.5 rounded-full border border-[#8b6f47]/20 self-start">
          <LocationIcon />
          <Text className="text-[#8b6f47] text-xs">
            <Text className="text-[#8b6f47] font-semibold">Location: </Text>
            {displayLocation}
          </Text>
        </View>
        <View className="flex-row gap-2 mt-1">
          {/* --- OLD CODE ---
          <TouchableOpacity className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20"
            onPress={() => setIsConnectionsModalOpen(true)}
            activeOpacity={0.8}>
            <FollowersIcon />
            <Text className="text-[#8b6f47] text-xs font-bold">{formatNumber(displayFollowers)}</Text>
            <Text className="text-[#8b6f47] text-xs">Followers</Text>
          </TouchableOpacity>
          */}
          {/* --- NEW CODE --- */}
          <TouchableOpacity className={`flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20 ${!canViewNetwork ? 'opacity-40' : ''}`}
            onPress={() => {
              if (!canViewNetwork) return;
              setInitialConnectionsTab('Followers');
              setIsConnectionsModalOpen(true);
            }}
            activeOpacity={0.8}>
            <FollowersIcon />
            <Text className="text-[#8b6f47] text-xs font-bold">{formatNumber(finalFollowers)}</Text>
            <Text className="text-[#8b6f47] text-xs">Followers</Text>
          </TouchableOpacity>

          {/* --- OLD CODE ---
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20"
            onPress={() => setIsConnectionsModalOpen(true)}
            activeOpacity={0.8}
          >
            <ConnectionsIcon />
            <Text className="text-[#8b6f47] text-xs font-bold">{displayConnections}</Text>
            <Text className="text-[#8b6f47] text-xs">connections</Text>
          </TouchableOpacity>
          */}
          {/* --- NEW CODE --- */}
          <TouchableOpacity
            className={`flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20 ${!canViewNetwork ? 'opacity-40' : ''}`}
            onPress={() => {
              if (!canViewNetwork) return;
              setInitialConnectionsTab('Connections');
              setIsConnectionsModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <ConnectionsIcon />
            <Text className="text-[#8b6f47] text-xs font-bold">{finalConnections}</Text>
            <Text className="text-[#8b6f47] text-xs">connections</Text>
          </TouchableOpacity>
        </View>
      </View>


      <Modal visible={isImageModalOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setIsImageModalOpen(false)}>

        <Pressable className="flex-1 bg-black/60 justify-end"
          onPress={() => setIsImageModalOpen(false)}>
          <Pressable className="bg-[#f6ede8] rounded-t-[36px] p-6 pb-12 border-t-2 border-[#e0d8cf]/40"
            onPress={() => { }}>
            {/* Top Grab Handle */}
            <View className="w-12 h-1.5 bg-[#4a3728]/25 rounded-full self-center mb-5" />

            <Text className="text-[#4a3728] text-xl font-extrabold text-center mb-1">Update Profile Picture</Text>
            <Text className="text-[#8b6f47] text-xs font-semibold text-center mb-6">Choose a clear, professional portrait</Text>

            {/* Circular Preview Container */}
            <View className="items-center mb-8">
              <View className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#e0d8cf] justify-center items-center">
                <Image
                  source={{ uri: currentProfileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Premium Button Actions */}
            <View className="gap-3">
              <TouchableOpacity
                className="bg-[#4a3728] py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
                onPress={handlePickProfileImage}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-bold">🖼️  Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#faebe8] py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-[#f5c6be]"
                onPress={async () => {
                  try {
                    // Fetch active profile photo ID
                    const res = await AuthService.getAllProfilePhotos(false);
                    const photos = res?.data?.data || res?.data || [];
                    const photosArray = Array.isArray(photos) ? photos : photos?.photos || [];
                    const activePhoto = Array.isArray(photosArray)
                      ? photosArray.find((p: any) => p.isActive || p.active) || photosArray[0]
                      : null;
                    const targetPhotoId = activePhoto?.photoId || activePhoto?._id || activePhoto?.id;

                    if (targetPhotoId) {
                      await AuthService.deleteProfilePhoto(targetPhotoId);
                    }

                    setCurrentProfileImage(DEFAULT_AVATAR);
                    setIsImageModalOpen(false);
                    onProfileImageUpdate?.(DEFAULT_AVATAR);
                    onDataRefresh?.();
                    Alert.alert('Success', 'Profile photo removed.');
                  } catch (err: any) {
                    console.error('Delete profile photo failed:', err);
                    Alert.alert('Error', err?.message || 'Failed to remove photo.');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text className="text-red-600 text-base font-bold">🗑️  Remove Current Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-4 rounded-2xl items-center bg-[#4a3728]/5 border border-[#8b6f47]/10 mt-1"
                onPress={() => setIsImageModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text className="text-[#4a3728] text-base font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>


      {/* --- OLD CODE (Placeholder Empty Edit Modal) --- */}
      {/* <Modal */}
      {/*   visible={isEditModalOpen} */}
      {/*   transparent */}
      {/*   animationType="slide" */}
      {/*   onRequestClose={() => setIsEditModalOpen(false)} */}
      {/* > */}
      {/*   <Pressable className="flex-1 bg-black/75 justify-end" */}
      {/*     onPress={() => setIsEditModalOpen(false)}> */}
      {/*  */}
      {/*     <Pressable className="bg-brand-light rounded-t-3xl p-6 pb-10" */}
      {/*       onPress={() => { }}> */}
      {/*       <Text className="text-white text-base font-semibold text-center mb-2">Edit intro</Text> */}
      {/*       <Text className="text-white text-brand-medium text-sm text-center mb-4"> */}
      {/*         EditIntroModal will be built here — name, headline, location, etc. */}
      {/*       </Text> */}
      {/*       <TouchableOpacity */}
      {/*         className="py-3 items-center" */}
      {/*         onPress={() => setIsEditModalOpen(false)} */}
      {/*       > */}
      {/*         <Text className="text-white text-brand-medium text-sm font-medium">Close</Text> */}
      {/*       </TouchableOpacity> */}
      {/*     </Pressable> */}
      {/*   </Pressable> */}
      {/* </Modal> */}

      {/* --- NEW CODE (High Fidelity, Fully Integrated Edit Intro Modal) --- */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable
            className="flex-1 bg-black/75 justify-end"
            onPress={() => setIsEditModalOpen(false)}
          >
            <Pressable
              className="bg-[#f6ede8] rounded-t-[32px] p-6 pb-8"
              style={{ maxHeight: '90%' }}
              onPress={() => { }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-[#4a3728]">Edit Intro</Text>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} className="p-1">
                  <Text className="text-sm font-bold text-[#8b6f47]">Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>

                {/* ── IMAGE SECTION (Profile & Cover Photos) ── */}
                <Text className="text-xs font-bold text-[#8b6f47]/80 uppercase tracking-wider">Media Uploads</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-[#4a3728]/5 border border-dashed border-[#8b6f47]/30 rounded-2xl p-4 items-center justify-center gap-y-1.5 active:bg-[#4a3728]/10"
                    onPress={() => {
                      setIsEditModalOpen(false);
                      setIsImageModalOpen(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-[#4a3728]">📷 Profile Photo</Text>
                    <Text className="text-[10px] text-[#8b6f47]">Change Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-[#4a3728]/5 border border-dashed border-[#8b6f47]/30 rounded-2xl p-4 items-center justify-center gap-y-1.5 active:bg-[#4a3728]/10"
                    onPress={handlePickCoverImage}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-bold text-[#4a3728]">🖼️ Cover Photo</Text>
                    <Text className="text-[10px] text-[#8b6f47]">Change Banner</Text>
                  </TouchableOpacity>
                </View>

                <View className="h-[1px] bg-[#4a3728]/10 my-1" />

                {/* ── FORM FIELDS ── */}
                <Text className="text-xs font-bold text-[#8b6f47]/80 uppercase tracking-wider">Personal Details</Text>

                {/* First Name */}
                <View className="gap-y-1.5">
                  <Text className="text-xs font-bold text-[#4a3728]">First Name *</Text>
                  <TextInput
                    className="bg-white rounded-xl px-4 py-3 border border-[#e0d8cf] text-[#4a3728] text-sm"
                    value={editFirstName}
                    onChangeText={setEditFirstName}
                    placeholder="First Name"
                    placeholderTextColor="#a09080"
                  />
                </View>

                {/* Last Name */}
                <View className="gap-y-1.5">
                  <Text className="text-xs font-bold text-[#4a3728]">Last Name *</Text>
                  <TextInput
                    className="bg-white rounded-xl px-4 py-3 border border-[#e0d8cf] text-[#4a3728] text-sm"
                    value={editLastName}
                    onChangeText={setEditLastName}
                    placeholder="Last Name"
                    placeholderTextColor="#a09080"
                  />
                </View>

                {/* Headline */}
                <View className="gap-y-1.5">
                  <Text className="text-xs font-bold text-[#4a3728]">Headline</Text>
                  <TextInput
                    className="bg-white rounded-xl px-4 py-3 border border-[#e0d8cf] text-[#4a3728] text-sm min-h-[60px]"
                    value={editHeadline}
                    onChangeText={setEditHeadline}
                    placeholder="Professional Headline"
                    placeholderTextColor="#a09080"
                    multiline
                  />
                </View>

                {/* Location */}
                <View className="gap-y-1.5">
                  <Text className="text-xs font-bold text-[#4a3728]">Location</Text>
                  <TextInput
                    className="bg-white rounded-xl px-4 py-3 border border-[#e0d8cf] text-[#4a3728] text-sm"
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="Location (e.g. India)"
                    placeholderTextColor="#a09080"
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  className="bg-[#4a3728] rounded-2xl py-3.5 items-center justify-center mt-3 active:bg-[#3d2d21]"
                  onPress={handleSaveProfile}
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-sm font-bold">Save Changes</Text>
                </TouchableOpacity>

              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <ConnectionsModal
        isOpen={isConnectionsModalOpen}
        onClose={() => setIsConnectionsModalOpen(false)}
        userId={resolvedUserId}
        initialTab={initialConnectionsTab}
      />
    </View>

  )
}

export default ProfileHeader
