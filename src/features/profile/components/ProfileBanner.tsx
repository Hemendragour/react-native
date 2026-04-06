import { Alert, Dimensions, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { launchImageLibrary } from 'react-native-image-picker';

const Screenwidth = Dimensions.get('window').width;
const BannerHeight=180

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

    const handleEdit=()=>{
        setIsEditing(true)
    }
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
        <View style={styles.container}>
            <Image 
            source={{ uri: curentBanner }}
            style={styles.bannerImage}
            resizeMode='cover'
            />
            <View style={styles.gradientOverlay} />
            <View style={styles.pill}>
                <Text style={styles.pillText}>✨ Professional Networker</Text>
            </View>
            {isOwnProfile && (
                <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
                activeOpacity={0.8}>
                    <Text style={styles.editButtonText}>✏ Edit</Text>
                </TouchableOpacity>
            )}
            <Modal
                visible={isEditing}
                onRequestClose={()=>setIsEditing(false)}
                animationType='slide'>
                    <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsEditing(false)}
        >
                    <Pressable style={styles.modalCard}
                        onPress={() => {}}>
                        <Text style={styles.modalTitle}>Update cover photo</Text>
                        <Text style={styles.modalSubtitle}>Choose a new banner image for your profile</Text>


                        <TouchableOpacity
                        style={styles.modalButton}
                            activeOpacity={0.8}
                            onPress={handlePickImage}
                        >
                            <Text style={styles.modalButtonText} >Choose from gallery</Text>

                        </TouchableOpacity>
                        <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
                    </Pressable>
                    </Pressable>
            </Modal>
        </View>
    )
}

export default ProfileBanner

const styles = StyleSheet.create({
     container: {
    width: Screenwidth,
    height: BannerHeight,
    position: 'relative',         // children use absolute positioning inside
  },
 
  bannerImage: {
    width: '100%',
    height: '100%',
  },
 
  // Fakes the CSS gradient-to-top dark overlay
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BannerHeight * 0.5,  // covers bottom half
    backgroundColor: 'rgba(74, 55, 40, 0.4)',  // matches #4a3728 at 40% opacity
  },
 
  // "✨ Professional Networker" pill — bottom left
  pill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
  },
 
  // Edit button — top right
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
  },
 
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',   // slides up from bottom
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
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: '#4a3728',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#7a5c3e',
    fontSize: 14,
    fontWeight: '500',
  },
})