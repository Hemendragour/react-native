import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Group } from '../types';
import { GroupCard } from './GroupCard';
import { colors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { toggleSectionExpanded } from '../../../store/groupsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Each column gets ~47% of usable width (after 16px horizontal padding on both sides)
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2; // 32 = paddingHorizontal * 2, 12 = gap

type SectionKey = 'university' | 'dsa' | 'jee';

interface Props {
  title: string;
  subtitle?: string;
  sectionKey: SectionKey;
  allGroups: Group[];
}

const INITIAL_COUNT = 2;

export function GroupGrid({ title, subtitle, sectionKey, allGroups }: Props) {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(s => s.groups.browseSearchQuery);
  const expanded = useAppSelector(s => s.groups.expandedSections[sectionKey]);

  // Filter by section + search
  const filtered = allGroups
    .filter(g => g.section === sectionKey)
    .filter(g =>
      !searchQuery ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const displayed = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT;

  if (filtered.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">{subtitle}</Text> : null}
      </View>

      {/* Cards - 2 column grid */}
      <View style={styles.grid}>
        {displayed.map((group, index) => (
          <View key={group.id || `group-grid-${index}`} style={[styles.col, { width: CARD_WIDTH }]}>
            <GroupCard group={group} />
          </View>
        ))}
      </View>

      {/* Show more / less */}
      {hasMore && (
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => dispatch(toggleSectionExpanded(sectionKey))}
          activeOpacity={0.8}
        >
          <Text style={styles.moreBtnText}>
            {expanded ? 'Show Less ↑' : `Show More (${filtered.length - INITIAL_COUNT} more) ↓`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  header: { marginBottom: 14, alignItems: 'center', paddingHorizontal: 4 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  col: { maxWidth: '48%' },
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
