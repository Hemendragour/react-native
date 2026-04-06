import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Svg, { Image, Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
 

const dummyProfile={
    profileImage:'https://img.freepik.com/premium-photo/sculpture-shield-with-shield-it_1309810-11832.jpg?semt=ais_hybrid&w=740&q=80',
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
  headlineId?: string;
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
      stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);
  
const ProfileHeader :React.FC<ProfileHeaderProps>= (
    {
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
  headlineId = '',
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

const educationName=displayEducationList[0]?.schoolcollegename || '' || educationData?.collegeName ;

const companyName=displayExperienceList.find((exp:any)=>exp.current)?.company || currentPosition || company || ''

const formatNumber = (n: number) => n?.toLocaleString() ?? '0';

const eduCompanyLine=[educationName, companyName].filter(Boolean).join(' • ');
 

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarWrapper} 
        onPress={()=>setIsImageModalOpen(true)}
        activeOpacity={0.8}>

        <Image 
        source={{ uri: currentProfileImage }}
        style={styles.avatar}
        resizeMode='cover'
        ></Image>
 

        <View style={styles.cameraBadge}>
          <Text style={styles.cameraBadgeText}>+</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoCard}> 
        <TouchableOpacity style={styles.editButton}
        onPress={()=> setIsEditModalOpen(true)}
        activeOpacity={0.8}>
            <EditIcon />
        </TouchableOpacity>

        <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.pronounsPill}>
                <Text style={styles.pronounsText}>{displayPronouns}</Text>
            </View>
        </View>


        <Text style={styles.headline} numberOfLines={2}>{displayHeadline}</Text>
        {eduCompanyLine ? <Text style={styles.eduCompany}>{eduCompanyLine}</Text> : null}

        <View style={styles.locationRow}>
            <Text style={styles.locationText}>
                Location: {displayLocation}
            </Text>
        </View>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statPill} 
          onPress={()=>setIsConnectionsModalOpen(true)} 
          activeOpacity={0.8}>
            <FollowersIcon/>
            <Text style={styles.statNumber}>{formatNumber(displayFollowers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>  
          
          <TouchableOpacity
              style={styles.statPill}
              onPress={() => setIsConnectionsModalOpen(true)}
              activeOpacity={0.8}
            >
              <ConnectionsIcon />
              <Text style={styles.statNumber}>{displayConnections}</Text>
              <Text style={styles.statLabel}>connections</Text>
            </TouchableOpacity>
        </View>
      </View> 
      <Modal visible={isImageModalOpen}
      transparent
      animationType='slide'
      onRequestClose={()=> setIsImageModalOpen(false)}> 
      <Pressable style={styles.modalBackdrop}
      onPress={()=> setIsConnectionsModalOpen(false)}>
        <Pressable style={styles.modalCard} 
        onPress={()=>{}}>
          <Text style={styles.modalTitle}>Update Profile photo</Text>
          <Image 
          source={{ uri: currentProfileImage }} 
          style={styles.modalPreviewImage}
          resizeMode="cover" />
          <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={handlePickProfileImage}
              activeOpacity={0.8}
            >
               <Text style={styles.modalPrimaryBtnText}>Choose from gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setIsImageModalOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
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
        <Pressable style={styles.modalBackdrop} onPress={() => setIsEditModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit intro</Text>
            <Text style={styles.modalSubtitle}>
              EditIntroModal will be built here — name, headline, location, etc.
            </Text>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setIsEditModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
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
        <Pressable style={styles.modalBackdrop} onPress={() => setIsConnectionsModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Connections</Text>
            <Text style={styles.modalSubtitle}>
              ConnectionsModal will be built here — followers and following list.
            </Text>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setIsConnectionsModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>  

  )
}

export default ProfileHeader

const styles = StyleSheet.create({
    container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -40,           // pulls up to overlap the banner
  },
 
  // Avatar
  avatarWrapper: {
    width: 96,
    height: 96,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a3728',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
 
  // Info card
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0d8cf',
    padding: 16,
    gap: 8,
  },
 
  // Edit button
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4a3728',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  // Name row
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    paddingRight: 40,         // don't overlap edit button
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4a3728',
  },
  pronounsPill: {
    backgroundColor: '#f6ede8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0d8cf',
  },
  pronounsText: {
    fontSize: 12,
    color: 'rgba(74,55,40,0.7)',
    fontWeight: '400',
  },
 
  // Headline
  headline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a3728',
    lineHeight: 18,
  },
 
  // Education • Company
  eduCompany: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a3728',
  },
 
  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(224,216,207,0.5)',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 13,
    color: '#4a3728',
  },
  locationLabel: {
    fontWeight: '600',
  },
 
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0d8cf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a3728',
  },
  statLabel: {
    fontSize: 12,
    color: '#7a5c3e',
  },
 
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#f6ede8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4a3728',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#7a5c3e',
    textAlign: 'center',
  },
  modalPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  modalPrimaryBtn: {
    backgroundColor: '#4a3728',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#7a5c3e',
    fontSize: 14,
    fontWeight: '500',
  },
})