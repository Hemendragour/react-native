import {
  View,
  Text,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  Alert,
} from 'react-native';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ProfileCard from './ProfileCard';
import MyGroups from './MyGroups';
import { useAuth } from '../../../store/hooks/useAuth';
import AuthService from '../../../services/auth.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

// ─── Icons ────────────────────────────────────────────────────────────────────

export const HamburgerIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="#4a3728"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 18L18 6M6 6l12 12"
      stroke="#4a3728"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
      stroke="#dc2626"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HomeIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NetworkIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StudyIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14l9-5-9-5-9 5 9 5z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MentorIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const JobsIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MessageIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NotifIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AnalyticsIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      stroke="#4a3728"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke="#8b6f47"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface LeftSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemoizedProfileCard = React.memo(ProfileCard);
const MemoizedMyGroups = React.memo(MyGroups);

const LeftSideDrawer = ({ isOpen, onClose }: LeftSideDrawerProps) => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(isOpen);

  // Sync state with props instantly during render
  if (isOpen && !modalVisible) {
    setModalVisible(true);
  }

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Reset values to start positions instantly
      slideAnim.setValue(-DRAWER_WIDTH);
      backdropAnim.setValue(0);
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 180,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleShow = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigateTo = (screenName: string, params?: any) => {
    handleClose();
    setTimeout(() => {
      navigation.navigate(screenName, params);
    }, 150);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Throne8?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          handleClose();
        },
      },
    ]);
  };

  if (!modalVisible) return null;

  const currentUser = AuthService.getCurrentUser() as any;
  const targetUserId = currentUser?.userId || currentUser?.id || currentUser?._id;

  const NAV_ITEMS = [
    { label: 'Home Feed', icon: HomeIcon, action: () => navigateTo('Home') },
    { label: 'My Network', icon: NetworkIcon, action: () => navigateTo('Network') },
    { label: 'Messages', icon: MessageIcon, action: () => navigateTo('MessagesList') },
    { label: 'Notifications', icon: NotifIcon, action: () => navigateTo('Notifs') },
    { label: 'Study Groups', icon: StudyIcon, action: () => navigateTo('Study', { screen: 'MyGroups' }) },
    { label: 'Mentorship Hub', icon: MentorIcon, action: () => navigateTo('Mentorship') },
    { label: 'Jobs & Careers', icon: JobsIcon, action: () => navigateTo('Jobs') },
    { label: 'Analytics & Views', icon: AnalyticsIcon, action: () => navigateTo('ProfileAnalytics', { userId: targetUserId }) },
    { label: 'My Profile', icon: ProfileIcon, action: () => navigateTo('Profile') },
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
      onShow={handleShow}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Animated semi-transparent backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Animated drawer panel with hardware GPU acceleration */}
        <Animated.View
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Drawer header */}
            <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-[#4a3728]/10 bg-white/40">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-[#4a3728] items-center justify-center">
                  <Text className="text-white font-black text-sm">T8</Text>
                </View>
                <Text className="font-black tracking-widest text-base text-[#4a3728]">
                  THRONE8
                </Text>
              </View>

              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-[#4a3728]/10 items-center justify-center active:bg-[#4a3728]/20"
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Profile Card Header */}
              <MemoizedProfileCard onNavigate={navigateTo} />

              {/* Navigation Menu Links */}
              <View className="mx-3 mt-4 bg-white/70 rounded-3xl p-2 border border-[#4a3728]/10 shadow-xs">
                {NAV_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      className="flex-row items-center justify-between px-3 py-2.5 rounded-2xl active:bg-[#4a3728]/10"
                      onPress={item.action}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-xl bg-[#4a3728]/5 items-center justify-center border border-[#4a3728]/10">
                          <Icon />
                        </View>
                        <Text className="text-[#2c1d11] font-bold text-sm">
                          {item.label}
                        </Text>
                      </View>
                      <ChevronRight />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="h-px bg-[#4a3728]/10 mx-5 my-4" />

              {/* My Groups Section */}
              <MemoizedMyGroups />
            </ScrollView>

            {/* Logout Button anchored at bottom */}
            <View className="px-4 py-3 border-t border-[#4a3728]/10 bg-white/60">
              <TouchableOpacity
                className="flex-row items-center justify-center gap-x-2 bg-red-500/10 px-5 py-3 rounded-2xl border border-red-500/20 active:bg-red-500/20 shadow-xs"
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LogoutIcon />
                <Text className="text-red-600 font-extrabold text-sm tracking-wide">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 20, 14, 0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#f8f3ee',
    shadowColor: '#2c1d11',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 24,
  },
  safeArea: {
    flex: 1,
  },
});

export default React.memo(LeftSideDrawer);
