import {
  View,
  Text,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCard from './ProfileCard';
import MyGroups from './MyGroups';

const Drawer_width = Dimensions.get('window').width;

export const HamburgerIcon = () => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="#4a3728"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ─── Close icon ───────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 18L18 6M6 6l12 12"
      stroke="#4a3728"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

interface LeftSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeftSideDrawer: React.FC<LeftSideDrawerProps> = ({ isOpen, onClose }) => (
  <Modal
    visible={isOpen}
    transparent
    animationType="slide"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View className="flex-1 flex-row bg-[#f6ede8]/90" style={{ width: Drawer_width }}>
      <SafeAreaView className="flex-1">
        {/* Drawer header */}
        <View className="flex-row items-center  justify-between px-4 py-3 border-b border-[#4a3728]">
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-brand-border/60 items-center justify-center"
            onPress={onClose}
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
          {/* Profile card — top of drawer */}
          <ProfileCard />

          {/* Divider */}
          <View className="h-px bg-[#4a3728] mx-4 my-3" />

          {/* My Groups */}
          <MyGroups />
        </ScrollView>
      </SafeAreaView>

      {/* ── Backdrop (remaining 25%) — tap to close ─────────────────── */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
    </View>
  </Modal>
);

export default LeftSideDrawer;
