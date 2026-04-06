// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React, { useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context';

// interface ProfileNavbarProps {
//     profileImage: string;
//     userName: string;
//     currentUserId?: string;
//     companyId?: string;
// }


// const ProfileNavbar = (props: ProfileNavbarProps) => {
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isLoggingOut, setIsLoggingOut] = useState(false);

//   return (
    
//     <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//             <TouchableOpacity
//             onPress={()=>()}>
//                 <Text style={styles.logo}>Throne8</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.profileButton}
//             onPress={()=>isDropdownOpen(true)
//                 activeOpacity={0.8}
//             }>
//                <Image source={{ uri: props.profileImage }} 
//                style={styles.avatar }
//                defaultSource={require('')} /> 
//                 <Text style={styles.userName}numberOfLines={1}>{props.userName}</Text>
//             </TouchableOpacity>
                
//         </View>
//     </SafeAreaView>

//   <SafeAreaView style={styles.bottomSafeArea}>
//     <View style={styles.bottomNav}></View>
//   </SafeAreaView>
    
//   )
// }

// export default ProfileNavbar

// const styles = StyleSheet.create({
//     safeArea: {
//     backgroundColor: '#e0d8cf',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     backgroundColor: '#e0d8cf',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 4,           // Android shadow
//   },
//   logo: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#4a3728',
//     letterSpacing: 0.5,
//   },
//   profileButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#f6ede8',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: '#e0d8cf',
//   },
//   userName: {
//     fontSize: 13,
//     fontWeight: '500',
//     color: '#4a3728',
//     maxWidth: 100,
//   },
 
//   // Bottom tab bar
//   bottomSafeArea: {
//     backgroundColor: '#e0d8cf',
//     position: 'absolute',   // sticks to bottom
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingVertical: 8,
//     backgroundColor: '#e0d8cf',
//     borderTopWidth: 1,
//     borderTopColor: '#cfc5bb',
//   },
//   navItem: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 8,
//     gap: 3,
//   },
//   navLabel: {
//     fontSize: 10,
//     color: '#4a3728',
//     fontWeight: '500',
//   },
 
//   // Dropdown modal
//   backdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-end',
//     paddingTop: 70,         // just below the header
//     paddingRight: 12,
//   },
//   dropdownCard: {
//     width: 220,
//     backgroundColor: '#f6ede8',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e0d8cf',
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   menuHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     gap: 10,
//   },
//   menuAvatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     borderWidth: 2,
//     borderColor: '#e0d8cf',
//   },
//   menuUserInfo: {
//     flex: 1,
//   },
//   menuUserName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#4a3728',
//   },
//   menuUserSub: {
//     fontSize: 11,
//     color: '#7a5c3e',
//     marginTop: 1,
//   },
//   menuDivider: {
//     height: 1,
//     backgroundColor: '#e0d8cf',
//     marginHorizontal: 14,
//   },
//   menuItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   menuItemDanger: {
//     borderTopWidth: 1,
//     borderTopColor: '#e0d8cf',
//     marginTop: 4,
//   },
//   menuItemText: {
//     fontSize: 14,
//     color: '#4a3728',
//     fontWeight: '400',
//   },
//   menuItemTextDanger: {
//     color: '#c0392b',
//     fontWeight: '500',
//   },
//   menuItemTextDisabled: {
//     opacity: 0.5,
//   },
// })