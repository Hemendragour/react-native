import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS: { label: string; icon: string }[] = [
  { label: 'Home',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Network',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Study',      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { label: 'Mentorship', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Jobs',       icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

// Global pointers for scroll handling to bypass context hierarchy limits
let globalScrollHandler: ((event: any) => void) | null = null;
let globalScrollEndHandler: (() => void) | null = null;

export const emitBottomBarScroll = (event: any) => {
  if (globalScrollHandler) {
    globalScrollHandler(event);
  }
};

export const emitBottomBarScrollEnd = () => {
  if (globalScrollEndHandler) {
    globalScrollEndHandler();
  }
};

export default function BottomBar({ children, activeTabOverride }: { children: React.ReactNode; activeTabOverride?: string }) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 14 : 22;

  const lastY = React.useRef(0);
  const isHidden = React.useRef(false);
  const translateY = React.useRef(new Animated.Value(0)).current;
  const scrollTimeout = React.useRef<any>(null);

  const hideBar = () => {
    if (!isHidden.current) {
      isHidden.current = true;
      Animated.timing(translateY, {
        toValue: 120, // push it down below screen
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const showBar = () => {
    if (isHidden.current) {
      isHidden.current = false;
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleScroll = (event: any) => {
    if (!event || !event.nativeEvent || !event.nativeEvent.contentOffset) return;
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastY.current;

    // Reset timeout on scroll event
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // If scrolling down, hide bar. If scrolling up, show bar.
    if (diff > 5 && currentY > 50) {
      hideBar();
    } else if (diff < -5) {
      showBar();
    }

    lastY.current = currentY;

    // Set timeout to detect when user stops scrolling
    scrollTimeout.current = setTimeout(() => {
      showBar();
    }, 150); // Small threshold to detect scroll stop
  };

  const handleScrollEnd = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    showBar();
  };

  // Register global handlers
  React.useEffect(() => {
    globalScrollHandler = handleScroll;
    globalScrollEndHandler = handleScrollEnd;
    return () => {
      globalScrollHandler = null;
      globalScrollEndHandler = null;
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.outerContainer}>
      {/* Screen content wrapper - NO bottom padding block so content is full screen */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Floating Bottom Bar */}
      <Animated.View 
        style={[
          styles.floatingBar, 
          { 
            bottom: bottomOffset,
            transform: [{ translateY }]
          }
        ]}
      >
        {TABS.map(tab => {
          const isActive = activeTabOverride
            ? activeTabOverride === tab.label
            : route.name === tab.label;

          return (
            <TouchableOpacity
              key={tab.label}
              style={styles.tabButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(tab.label)}
            >
              <View style={[styles.tabContent, isActive && styles.activeTabBg]}>
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Path
                    d={tab.icon}
                    fill="none"
                    stroke={isActive ? '#f6ede8' : 'rgba(246, 237, 232, 0.45)'}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? '#f6ede8' : 'rgba(246, 237, 232, 0.45)',
                      fontWeight: isActive ? '700' : '500',
                      marginTop: 1,
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 56, // Compact height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(74, 55, 40, 0.82)', // Translucent dark chocolate brown from theme
    borderRadius: 28, // Perfect pill
    borderWidth: 1,
    borderColor: 'rgba(246, 237, 232, 0.15)',
    paddingHorizontal: 4,
    // Shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4, // Compact padding to ensure fit
    borderRadius: 14,
    backgroundColor: 'transparent',
    minWidth: 54,
  },
  activeTabBg: {
    backgroundColor: 'rgba(246, 237, 232, 0.15)', // Frost active indicator using theme light cream
  },
  tabLabel: {
    fontSize: 7.8, // Smaller font
    textAlign: 'center',
  },
});
