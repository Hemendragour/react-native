import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { toggleSectionExpanded, joinStudyGroup, leaveStudyGroup } from '../../../store/groupsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2; // 32 = paddingHorizontal * 2, 12 = gap
const INITIAL_COUNT = 3;

export function PublicGroups() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const publicGroups = useAppSelector(s => s.groups.publicGroups);
  const expanded = useAppSelector(s => s.groups.expandedSections.public);
  const joinedGroupIds = useAppSelector(s => s.groups.joinedGroupIds);

  const displayed = expanded ? publicGroups : publicGroups.slice(0, INITIAL_COUNT);
  const hasMore = publicGroups.length > INITIAL_COUNT;

  if (!publicGroups || publicGroups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Public Groups</Text>
        <Text style={styles.subtitle}>Open groups with instant access · No approval required</Text>
      </View>

      <View style={styles.grid}>
        {displayed.map((group, index) => {
          const isJoined = joinedGroupIds.includes(group.id);
          return (
          <View key={group.id || `public-${index}`} style={[styles.card, { width: CARD_WIDTH }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('GroupLobby', { groupId: group.id, groupName: group.title })}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>🌐</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">{group.title}</Text>
              </View>

              <View style={styles.membersRow}>
                <Text style={styles.membersText} numberOfLines={1}>👥 {group.members} active member{group.members !== 1 ? 's' : ''}</Text>
              </View>

              <Text style={styles.publicLabel} numberOfLines={1}>
                {isJoined ? '✓ You are a member' : 'Public group · Join instantly'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.joinBtn, isJoined && styles.leaveBtn]}
              activeOpacity={0.8}
              onPress={() => {
                if (isJoined) {
                  dispatch(leaveStudyGroup(group.id));
                } else {
                  dispatch(joinStudyGroup(group.id));
                }
              }}
            >
              <Text style={styles.joinBtnText}>{isJoined ? 'Leave' : 'Join Now'}</Text>
            </TouchableOpacity>
          </View>
          );
        })}
      </View>

      {hasMore && (
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => dispatch(toggleSectionExpanded('public'))}
          activeOpacity={0.8}
        >
          <Text style={styles.moreBtnText}>
            {expanded ? 'Show Less ↑' : 'Show More ↓'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center', paddingHorizontal: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    maxWidth: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e5ddd5',
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: `${colors.primaryLight}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 14 },
  cardTitle: {
    flex: 1,
    fontSize: Math.min(12, SCREEN_WIDTH * 0.031),
    fontWeight: '700',
    color: colors.text,
    lineHeight: 16,
  },

  membersRow: {
    backgroundColor: '#fdf8f3',
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f0e8df',
  },
  membersText: { fontSize: 10, fontWeight: '600', color: colors.textMid },

  publicLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 10 },

  joinBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveBtn: {
    backgroundColor: '#ef4444',
  },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  moreBtn: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  moreBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
