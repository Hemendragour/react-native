import React from 'react';
import { View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

const TABS: { label: string; icon: string }[] = [
  { label: 'Home',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Network',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Notifs',     icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { label: 'Study',      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { label: 'Mentorship', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Jobs',       icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];
export default function BottomBar({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View className="flex-1">
      {/* Screen ka content */}
      <View className="flex-1">{children}</View>

      {/*  Permanent Bottom Bar */}
      <SafeAreaView className="bg-white border-t border-[#6b4e3d]">
        <View className="flex-row justify-around py-1.5">
          {TABS.map(tab => {
            const isActive = route.name === tab.label;
            return (
              <TouchableOpacity
                key={tab.label}
                className="items-center flex-1"
                onPress={() => navigation.navigate(tab.label)}
              >
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    d={tab.icon}
                    fill="none"
                    stroke={isActive ? '#4a3728' : 'rgba(74,55,40,0.4)'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>

                <Text
                  style={{
                    color: isActive ? '#4a3728' : 'rgba(74,55,40,0.4)',
                    fontWeight: isActive ? '800' : '400',
                    fontSize: isActive ? 13 : 11,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
