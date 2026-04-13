import { Alert,  Image, Modal, Pressable,  Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { launchImageLibrary } from 'react-native-image-picker';

const bannerDummy='https://jasfoundation.org.in/wp-content/uploads/2023/10/vision-jas-scaled.jpg'

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
  isOwnProfile = true,
}) => {

    const[curentBanner, setCurrentBanner]=useState(bannerImage || bannerDummy)
    const[isEditing, setIsEditing] = useState(false)

    useEffect(()=>{
        if(bannerImage){
            setCurrentBanner(bannerImage)
        }
    },[bannerImage])

    // const handleEdit=()=>{
    //     setIsEditing(true)
    // }
    const handleCoverUpdate=(newUrl:string)=>{
        setCurrentBanner(newUrl)
        onBannerUpdate?.(newUrl)
        onDataRefresh?.()
        setIsEditing(false)

    }
    const handlePickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
        
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', 'Failed to pick image: ' );
                return;
            }
            const uri = response.assets?.[0]?.uri;
            if (uri) {
                handleCoverUpdate(uri);
            }
        }
    )
  };

    return (
      <>
        <View className="w-full h-44 overflow-hidden">
        <Image
          source={{ uri: curentBanner }}
          className="w-full h-full py-10 "
          resizeMode="cover"
        />
        <View className="absolute bottom-0  h-40 bg-brand-dark/40" />
        <View className="absolute bottom-3 right-7 bg-black/25 px-3 py-1 rounded-xl border border-white/30">
          <Text className="text-white/90 text-xs font-medium">✨ Professional Networker</Text>
        </View>
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
        <Pressable className="flex-1 bg-black/75 justify-end" onPress={() => setIsEditing(false)}>
          <Pressable className="bg-brand-light rounded-t-3xl p-6 pb-10" onPress={() => {}}>
            <Text className="text-white text-base font-semibold text-center mb-1">Update cover photo</Text>
            <Text className="text-white text-base font-semibold text-center mb-4">Choose a new banner for your profile</Text>
            <TouchableOpacity className="bg-brand-dark py-4 rounded-xl items-center mb-3" onPress={handlePickImage} activeOpacity={0.8}>
              <Text className="text-white text-base font-semibold">Choose from gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 items-center" onPress={() => setIsEditing(false)}>
              <Text className="text-white text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
        </>
    )
}

export default ProfileBanner
