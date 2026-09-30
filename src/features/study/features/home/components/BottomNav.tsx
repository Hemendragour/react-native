import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../../theme/colors';

const NAV = [
  { label: 'Home',    icon: '🏠' },
  { label: 'Network', icon: '👥' },
  { label: 'Message', icon: '💬' },
  { label: 'Jobs',    icon: '💼' },
  { label: 'Study',   icon: '📚' },
];

export function BottomNav() {
  const route = useRoute();
  // Home screen = Study tab active, Timer screen = Study tab active
  const activeLabel = 'Study';

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {NAV.map(item => {
          const isActive = item.label === activeLabel;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.tab}
              activeOpacity={isActive ? 1 : 0.6}
              disabled={!isActive}
            >
              {isActive && <View style={styles.activeIndicator} />}
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Text style={[styles.icon, !isActive && styles.iconDim]}>{item.icon}</Text>
              </View>
              <Text style={[styles.label, isActive && styles.labelActive, !isActive && styles.labelDim]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#pf7f3ee',
    borderTopWidth: 1,
    borderTopColor: colors.borderBrown,
  },
  bar: { flexDirection: 'row', height: 60, alignItems: 'stretch' },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 2, position: 'relative',
  },
  activeIndicator: {
    position: 'absolute', top: 0,
    width: 24, height: 2,
    borderRadius: 2, backgroundColor: colors.text,
  },
  iconWrap: { padding: 4, borderRadius: 8 },
  iconWrapActive: { backgroundColor: '#e8ddd4' },
  icon: { fontSize: 18 },
  iconDim: { opacity: 0.25 },
  label: { fontSize: 9, fontWeight: '700', color: colors.textMuted },
  labelActive: { color: colors.text },
  labelDim: { opacity: 0.3 },
});