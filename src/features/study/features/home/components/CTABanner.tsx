import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';
import { useAppSelector } from '../../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function CTABanner({ onCreatePress }: { onCreatePress?: () => void }) {
  const browseItems = useAppSelector(s => s.groups.browseItems);
  const totalGroups = browseItems.length;
  const totalMembers = browseItems.reduce((sum, g) => sum + (g.members || 0), 0);
  
  // Calculate average attendance for success rate
  const validAttendances = browseItems.map(g => g.attendanceAvg || 0).filter(Boolean);
  const avgAttendance = validAttendances.length > 0
    ? Math.round(validAttendances.reduce((sum, val) => sum + val, 0) / validAttendances.length)
    : 85;

  const stats = [
    { value: totalGroups > 0 ? `${totalGroups}` : '0', label: 'Groups Created' },
    { value: totalMembers > 0 ? `${totalMembers}` : '0', label: 'Active Members' },
    { value: `${avgAttendance}%`, label: 'Success Rate' },
  ];

  return (
    <View style={styles.card}>
      {/* Icon + heading */}
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>➕</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>Can't Find the{'\n'}Perfect Group?</Text>
      <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
        Create your own study group and invite friends to join you!
      </Text>

      {/* Checklist */}
      <View style={styles.checks}>
        {['Set your own rules', 'Build your community', 'Study together'].map(item => (
          <View key={item} style={styles.checkRow}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={onCreatePress}>
        <Text style={styles.btnText}>➕  Create Your Group  →</Text>
      </TouchableOpacity>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e0d8cf',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f6ede8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: { fontSize: 22 },
  title: {
    fontSize: Math.min(20, SCREEN_WIDTH * 0.052),
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    lineHeight: Math.min(26, SCREEN_WIDTH * 0.067),
  },
  subtitle: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.031),
    color: colors.textMid,
    lineHeight: 18,
    marginBottom: 14,
  },

  checks: { gap: 6, marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkIcon: { fontSize: 12 },
  checkText: { fontSize: 12, color: colors.textMid, fontWeight: '500' },

  btn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  statsStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0d8cf',
    paddingTop: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});
