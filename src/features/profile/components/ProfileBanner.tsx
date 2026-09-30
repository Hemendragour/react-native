import { Alert, Image, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import * as React from 'react'
import { useEffect, useState } from 'react'
import AuthService, { api } from '../../../services/auth.service';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const bannerDummy = '';

interface ProfileBannerProps {
  bannerImage?: string;
  onBannerUpdate?: (newUrl: string) => void;
  onDataRefresh?: () => void;
  coverId?: string;
  isOwnProfile?: boolean;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  bannerImage,
  onBannerUpdate,
  onDataRefresh,
  coverId,
  isOwnProfile = true,
}: ProfileBannerProps) => {

  const [curentBanner, setCurrentBanner] = useState(bannerImage || bannerDummy)
  const [isEditing, setIsEditing] = useState(false)
  const navigation = useNavigation();

  useEffect(() => {
    setCurrentBanner(bannerImage || bannerDummy);
  }, [bannerImage]);

  // const handleEdit=()=>{
  //     setIsEditing(true)
  // }
  // --- OLD CODE (Original Local State Only) ---
  // const handleCoverUpdate=(newUrl:string)=>{
  //     setCurrentBanner(newUrl)
  //     onBannerUpdate?.(newUrl)
  //     onDataRefresh?.()
  //     setIsEditing(false)
  // }

  // --- NEW CODE (Backend Integrated) ---
  const handleCoverUpdate = async (asset: any) => {
    setCurrentBanner(asset.uri);
    setIsEditing(false);

    console.log('📸 [ProfileBanner] Starting cover upload...', {
      uri: asset.uri,
      type: asset.type,
      fileName: asset.fileName,
    });

    try {
      const result = await AuthService.uploadCoverPhoto({
        uri: asset.uri,
        name: asset.fileName || 'cover.jpg',
        mimeType: asset.type || 'image/jpeg',
      });
      console.log('✅ [ProfileBanner] Cover upload SUCCESS:', JSON.stringify(result));
      onBannerUpdate?.(asset.uri);
      onDataRefresh?.();
    } catch (error: any) {
      console.error('❌ [ProfileBanner] Cover upload FAILED:', error?.message);
      console.error('❌ [ProfileBanner] Full error:', JSON.stringify(error?.response?.data));
      Alert.alert('Upload Failed', error?.message || 'Failed to upload cover photo.');
    }
  }

  // --- OLD CODE (Without Crop) ---
  // const handlePickImage = () => {
  //     launchImageLibrary({ mediaType: 'photo' }, (response) => {
  //         if (response.didCancel) return;
  //         if (response.errorCode) {
  //             Alert.alert('Error', 'Failed to pick image');
  //             return;
  //         }
  //         const asset = response.assets?.[0];
  //         if (asset && asset.uri) {
  //             handleCoverUpdate(asset);
  //         }
  //     });
  // };

  // --- NEW CODE (With Crop & Compression for large images) ---
  const handlePickImage = async () => {
    const ImagePicker = require('react-native-image-crop-picker').default;

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
        const asset = {
          uri: image.path,
          type: image.mime || 'image/jpeg',
          fileName: image.filename || image.path.split('/').pop() || `cover_${Date.now()}.jpg`,
        };
        handleCoverUpdate(asset);
      }
    } catch (err: any) {
      const isCancelled =
        err?.code === 'E_PICKER_CANCELLED' ||
        err?.message?.toLowerCase().includes('cancel') ||
        err?.message?.includes('User cancelled');

      if (isCancelled) return;

      console.warn('⚠️ Cropping failed, attempting direct image pick fallback...', err?.message);

      // Graceful fallback: pick without cropping if native cropper had memory/size issue
      try {
        const fallbackImage = await ImagePicker.openPicker({
          mediaType: 'photo',
          compressImageQuality: 0.85,
          compressImageMaxWidth: 1920,
          compressImageMaxHeight: 1080,
          cropping: false,
        });

        if (fallbackImage && fallbackImage.path) {
          const asset = {
            uri: fallbackImage.path,
            type: fallbackImage.mime || 'image/jpeg',
            fileName: fallbackImage.filename || fallbackImage.path.split('/').pop() || `cover_${Date.now()}.jpg`,
          };
          handleCoverUpdate(asset);
          return;
        }
      } catch (fallbackErr: any) {
        const fallbackCancelled =
          fallbackErr?.code === 'E_PICKER_CANCELLED' ||
          fallbackErr?.message?.toLowerCase().includes('cancel') ||
          fallbackErr?.message?.includes('User cancelled');

        if (!fallbackCancelled) {
          Alert.alert('Error', fallbackErr?.message || 'Failed to select image. Please try a smaller image.');
        }
      }
    }
  };

  return (
    <>
      <View className="w-full h-44 overflow-hidden">
        {curentBanner ? (
          <Image
            source={{ uri: curentBanner }}
            className="w-full h-full py-10 "
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full py-10 bg-[#e0d8cf]" />
        )}
        <View className="absolute bottom-0  h-40 bg-brand-dark/40" />
        <View className="absolute bottom-3 right-7 bg-black/25 px-3 py-1 rounded-xl border border-white/30">
          <Text className="text-white/90 text-xs font-medium">✨ Professional Networker</Text>
        </View>

        {/* --- NEW CODE: Back Button --- */}
        <TouchableOpacity
          className="absolute top-4 left-4 bg-black/30 w-9 h-9 rounded-full items-center justify-center border border-white/40"
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        {/* ----------------------------- */}

        {isOwnProfile && (
          <TouchableOpacity
            className="absolute top-3 right-9 bg-black/25 px-3 py-1 rounded-full border border-white/30"
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Text className="text-white text-xs font-bold">✏ Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal visible={isEditing} transparent animationType="slide" onRequestClose={() => setIsEditing(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setIsEditing(false)}>
          <Pressable className="bg-[#f6ede8] rounded-t-[36px] p-6 pb-12 border-t-2 border-[#e0d8cf]/40" onPress={() => { }}>
            {/* Top Grab Handle */}
            <View className="w-12 h-1.5 bg-[#4a3728]/25 rounded-full self-center mb-5" />

            <Text className="text-[#4a3728] text-xl font-extrabold text-center mb-1">Update Cover Banner</Text>
            <Text className="text-[#8b6f47] text-xs font-semibold text-center mb-6">Choose a new background header for your profile</Text>

            {/* Banner Aspect Ratio Preview Card */}
            <View className="mb-8 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-[#e0d8cf]">
              {curentBanner ? (
                <Image
                  source={{ uri: curentBanner }}
                  className="w-full h-28"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-28 bg-[#e0d8cf]" />
              )}
            </View>

            {/* Premium Button Actions */}
            <View className="gap-3">
              <TouchableOpacity
                className="bg-[#4a3728] py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-bold">🖼️  Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#faebe8] py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-[#f5c6be]"
                onPress={async () => {
                  try {
                    // 1. Fetch active cover ID if not directly supplied
                    let targetCoverId = coverId;
                    if (!targetCoverId) {
                      const res = await api.get('/api/v1/profile/cover/get-all-covers');
                      const covers = res?.data?.data || res?.data?.covers || (Array.isArray(res?.data) ? res.data : []);
                      const activeCover = Array.isArray(covers)
                        ? covers.find((c: any) => c.isActive || c.active) || covers[0]
                        : null;
                      targetCoverId = activeCover?.coverId || activeCover?._id || activeCover?.id;
                    }

                    if (targetCoverId) {
                      await AuthService.deleteCoverPhoto(targetCoverId);
                    }

                    setCurrentBanner(bannerDummy);
                    setIsEditing(false);
                    onBannerUpdate?.('');
                    onDataRefresh?.();
                    Alert.alert('Success', 'Cover banner removed.');
                  } catch (err: any) {
                    console.error('Delete cover photo failed:', err);
                    Alert.alert('Error', err?.message || 'Failed to remove cover banner.');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text className="text-red-600 text-base font-bold">🗑️  Remove Cover Banner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-4 rounded-2xl items-center bg-[#4a3728]/5 border border-[#8b6f47]/10 mt-1"
                onPress={() => setIsEditing(false)}
                activeOpacity={0.8}
              >
                <Text className="text-[#4a3728] text-base font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

export default ProfileBanner
