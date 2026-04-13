import { Alert, Modal, Pressable, Text, TouchableOpacity, View,Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';

const dummyProfile={
    profileImage: 'https://img.freepik.com/premium-photo/sculpture-shield-with-shield-it_1309810-11832.jpg?semt=ais_hybrid&w=740&q=80',
    name:'Honey Sharma',
    pronouns:'he/him',
    company:'Throne8',
    location:'India',
    headline:'Co-Founder @Throne8 | Empowering Professional Networking for Millions with AI, Security, and Scalable Innovation',
    followers:1200,
    connections:500,
    educationlist:[{schoolcollegename:'oriental college of technology'}],
    experiencelist:[{companyname:'Throne8', position:'Co-Founder', current:true}]
}

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
  
const ProfileHeader :React.FC<ProfileHeaderProps>= ({
  currentUserId,
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
  education = '',
  contactInfo = '',
  educationData,
  educationList = [],
  experienceList = [],
  onDataRefresh,
  onProfileImageUpdate,
  onHeadlineCreated,
    }
) => {

const displayimage=profileImage||dummyProfile.profileImage
const displayName= name || dummyProfile.name
  const displayPronouns = pronouns || dummyProfile.pronouns;
  const displayHeadline = headline || dummyProfile.headline;
  const displayLocation = location || dummyProfile.location;
  const displayFollowers = followers ?? dummyProfile.followers;
  const displayConnections = connections || dummyProfile.connections;
  const displayEducationList = educationList.length > 0 ? educationList : dummyProfile.educationList;
  const displayExperienceList = experienceList.length > 0 ? experienceList : dummyProfile.experienceList;


   const [currentProfileImage, setCurrentProfileImage] = useState(displayimage);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

  useEffect(() => {
    if (profileImage) 
        setCurrentProfileImage(profileImage);
  }, [profileImage]);

const handleProfileImageUpdate = (newUrl: string)=>{
    setCurrentProfileImage(newUrl);
    onProfileImageUpdate?.(newUrl);
    onDataRefresh?.();
    setIsImageModalOpen(false);
}

const handlePickProfileImage = () =>{
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
            Alert.alert('Error', 'Failed to pick image: ' );
            return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) {
            handleProfileImageUpdate(uri);
        }
    }
    ); 
}

const educationName= Array.isArray(displayEducationList) && displayEducationList.length > 0 
  ? (displayEducationList[0] as any)?.schoolcollegename || educationData?.collegeName || ''
  : educationData?.collegeName || '';

const companyName=Array.isArray(displayExperienceList) 
  ? displayExperienceList.find((exp: any) => exp.current)?.company || currentPosition || company || ''
  : currentPosition || company || '';

const formatNumber = (n: number) => n?.toLocaleString() ?? '0';

const eduCompanyLine=[educationName, companyName].filter(Boolean).join(' • ');
 

  return (
    <View className="px-4 pb-4 -mt-10 ">
      <TouchableOpacity 
      className="w-24 h-24 mb-3" 
        onPress={()=>setIsImageModalOpen(true)}
        activeOpacity={0.8}>

        <Image 
        source={{ uri: currentProfileImage }}
        className="w-24 h-24 rounded-2xl border-4 border-white"
        resizeMode='cover'
        ></Image>
 

        <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-dark items-center justify-center border-2 border-x-black">
          <Text className="text-black text-base font-bold" style={ {lineHeight: 18} }>+</Text>
        </View>
      </TouchableOpacity>

      <View className="bg-[#f6ede8]/80 rounded-3xl border border-[#e0d8cf]/50 p-4 gap-2 "> 
        <TouchableOpacity className="absolute top-3 right-3 bg-brand-dark w-8 h-8 rounded-full items-center justify-center"
        onPress={()=> setIsEditModalOpen(true)}
        activeOpacity={0.8}>
          <EditIcon/>
            {/* <Text className="text-black text-sm">✏</Text> */}
        </TouchableOpacity>

        <View className="flex-row items-center flex-wrap gap-2 pr-10 mt-1 ">
            <Text className="text-[#4a3728] text-2xl font-bold">{displayName}</Text>
            <View className="bg-brand-light px-2 py-0.5 rounded-full border border-[#4a3728]">
                <Text className="text-[#4a3728] text-xs">{displayPronouns}</Text>
            </View>
        </View>


        <Text className="text-[#6b4e3d] text-sm font-semibold leading-5" numberOfLines={2}>{displayHeadline}</Text>
        {eduCompanyLine ? <Text className="text-brand-dark text-sm font-bold">{eduCompanyLine}</Text> : null}

        <View className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-1.5 rounded-full border border-[#8b6f47]/20 self-start">
            <LocationIcon />
            <Text className="text-[#8b6f47] text-xs">
              <Text className="text-[#8b6f47] font-semibold">Location: </Text>
              {displayLocation}
            </Text>
        </View>
        <View className="flex-row gap-2 mt-1">
          <TouchableOpacity className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20" 
          onPress={()=>setIsConnectionsModalOpen(true)} 
          activeOpacity={0.8}>
            <FollowersIcon/>
            <Text className="text-[#8b6f47] text-xs font-bold">{formatNumber(displayFollowers)}</Text>
            <Text className="text-[#8b6f47] text-xs">Followers</Text>
          </TouchableOpacity>  
          
          <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-[#4a3728]/5 px-3 py-2 rounded-full border border-[#8b6f47]/20"
              onPress={() => setIsConnectionsModalOpen(true)}
              activeOpacity={0.8}
            >
              <ConnectionsIcon />
              <Text className="text-[#8b6f47] text-xs font-bold">{displayConnections}</Text>
              <Text className="text-[#8b6f47] text-xs">connections</Text>
            </TouchableOpacity>
        </View>
      </View> 


      <Modal visible={isImageModalOpen}
      transparent
      animationType='slide'
      onRequestClose={()=> setIsImageModalOpen(false)}> 

      <Pressable className="flex-1 bg-black/75 justify-end"
      onPress={()=> setIsConnectionsModalOpen(false)}>
        <Pressable className="bg-brand-light rounded-t-3xl p-6 pb-10" 
        onPress={()=>{}}>
          <Text className="text-white text-base font-semibold text-center mb-3">Update Profile photo</Text>
          
          <Image 
          source={{ uri: currentProfileImage }} 
          className="w-full h-48 rounded-xl mb-4"
          resizeMode="cover" />
          <TouchableOpacity
              className="bg-brand-dark py-4 rounded-xl items-center mb-3"
              onPress={handlePickProfileImage}
              activeOpacity={0.8}
            >
               <Text className="text-white text-base font-semibold">Choose from gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => setIsImageModalOpen(false)}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
        </Pressable>
      </Pressable>
      </Modal>  


      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <Pressable className="flex-1 bg-black/75 justify-end" 
        onPress={() => setIsEditModalOpen(false)}>

          <Pressable className="bg-brand-light rounded-t-3xl p-6 pb-10" 
          onPress={() => {}}>
            <Text className="text-white text-base font-semibold text-center mb-2">Edit intro</Text>
            <Text className="text-white text-brand-medium text-sm text-center mb-4">
              EditIntroModal will be built here — name, headline, location, etc.
            </Text>
            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => setIsEditModalOpen(false)}
            >
              <Text className="text-white text-brand-medium text-sm font-medium">Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

       <Modal
        visible={isConnectionsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConnectionsModalOpen(false)}
      >
        <Pressable className="flex-1 bg-black/75 justify-end" onPress={() => setIsConnectionsModalOpen(false)}>
          <Pressable className="bg-brand-light rounded-t-3xl p-6 pb-10" onPress={() => {}}>
            <Text className="text-white text-brand-dark text-lg font-semibold text-center mb-2">Connections</Text>
            <Text className="text-white text-brand-medium text-sm text-center mb-4">
              ConnectionsModal will be built here — followers and following list.
            </Text>
            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => setIsConnectionsModalOpen(false)}
            >
              <Text className="text-white text-brand-medium text-sm font-medium">Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>  

  )
}

export default ProfileHeader
