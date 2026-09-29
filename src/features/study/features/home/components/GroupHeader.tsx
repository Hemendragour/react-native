import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setBrowseSearchQuery } from '../../../store/groupsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GroupHeaderProps {
  onCreatePress?: () => void;
}
export function GroupHeader({ onCreatePress }: GroupHeaderProps) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const searchQuery = useAppSelector(s => s.groups.browseSearchQuery);
  const browseItems = useAppSelector(s => s.groups.browseItems);
  const profile = useAppSelector(s => s.studyProfile);
  const mainProfile = useAppSelector(s => s.profile.data);
  const [isFocused, setIsFocused] = useState(false);

  const displayAvatar = mainProfile?.profileImage || profile?.avatar || '🧑‍🎓';

  const filteredSuggestions = browseItems.filter(g =>
    searchQuery.trim().length > 0 &&
    (g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     g.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalGroups = browseItems.length;
  const totalMembers = browseItems.reduce((sum, g) => sum + (g.members || 0), 0);
  const totalCategories = new Set(browseItems.map(g => g.category).filter(Boolean)).size;

  const stats = [
    { value: totalGroups > 0 ? `${totalGroups}` : '0', label: 'Groups' },
    { value: totalMembers > 0 ? `${totalMembers}` : '0', label: 'Members' },
    { value: totalCategories > 0 ? `${totalCategories}` : '0', label: 'Subjects' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎓  Discover & Learn Together</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Find Your{' '}
            <Text style={styles.titleAccent}>Study Group</Text>
          </Text>
        </View>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          {displayAvatar.startsWith('http') ? (
            <Image source={{ uri: displayAvatar }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileBtnIcon}>{displayAvatar}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
        Connect with passionate learners and reach your academic goals together.
      </Text>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={t => dispatch(setBrowseSearchQuery(t))}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={() => {
              if (searchQuery.trim().length > 0) {
                setIsFocused(false);
                Keyboard.dismiss();
                navigation.navigate('StudySearch', { query: searchQuery.trim() });
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {/* Backdrop (to dismiss suggestions when tapping outside) */}
        {isFocused && searchQuery.trim().length > 0 && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => {
              setIsFocused(false);
              Keyboard.dismiss();
            }}
          />
        )}

        {/* Suggestions Dropdown */}
        {isFocused && searchQuery.trim().length > 0 && (
          <View style={styles.suggestionsContainer}>
            {filteredSuggestions.length > 0 ? (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.suggestionScroll}>
                {filteredSuggestions.map((group, idx) => (
                  <TouchableOpacity
                    key={group.id || `suggestion-${idx}`}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setIsFocused(false);
                      dispatch(setBrowseSearchQuery(''));
                      navigation.navigate('GroupLobby', { groupId: group.id, groupName: group.title });
                    }}
                  >
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle} numberOfLines={1}>{group.title}</Text>
                      <Text style={styles.suggestionCategory}>{group.category}</Text>
                    </View>
                    <Text style={styles.suggestionArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noSuggestions}>
                <Text style={styles.noSuggestionsText}>No groups match "{searchQuery}"</Text>
              </View>
            )}

            {/* See all button */}
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => {
                setIsFocused(false);
                navigation.navigate('StudySearch', { query: searchQuery.trim() });
              }}
            >
              <Text style={styles.seeAllBtnText}>See all search results 🔍</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.createBtn} onPress={onCreatePress}>
          <Text style={styles.createBtnText}>+ Create Study Group</Text>
        </TouchableOpacity>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statBox}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Hero image card */}
      <View style={styles.heroCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        {/* Play button */}
        <View style={styles.playBtn}>
          <Text style={styles.playIcon}>▶</Text>
        </View>

        {/* Bottom info */}
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle} numberOfLines={1}>How to Use Study Groups</Text>
          <View style={styles.heroMeta}>
            <View style={styles.liveDot} />
            <Text style={styles.heroSub}>2-minute guide</Text>
          </View>
        </View>

        {/* Live badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDotGreen} />
          <Text style={styles.liveBadgeText}>{totalMembers > 0 ? `${totalMembers} Now` : '0 Now'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topLeft: { flex: 1 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
  },
  profileBtnIcon: { fontSize: 20 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  createBtn: {
    flex: 1.5,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center'
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primaryLight}25`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.text },

  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: '800',
    color: colors.text,
    marginBottom: 5,
    lineHeight: Math.min(30, SCREEN_WIDTH * 0.076),
  },
  titleAccent: { color: colors.primaryLight },
  subtitle: {
    fontSize: Math.min(12, SCREEN_WIDTH * 0.031),
    color: colors.textMid,
    lineHeight: 18,
    marginBottom: 12,
  },

  searchRow: { marginBottom: 12, zIndex: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    gap: 8,
    zIndex: 1001,
  },
  searchIcon: { fontSize: 13 },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, padding: 0 },

  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: 52,
    left: -100,
    right: -100,
    height: 1000,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3ece6',
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  suggestionCategory: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionArrow: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  noSuggestions: {
    padding: 12,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  seeAllBtn: {
    backgroundColor: '#fbf7f3',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: colors.borderBrown,
  },
  seeAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  suggestionScroll: { maxHeight: 200 },
  suggestionContent: { flex: 1 },

  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 14, alignItems: 'stretch' },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 8, fontWeight: '600', color: colors.textMuted, marginTop: 1 },

  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: Math.min(170, SCREEN_WIDTH * 0.44),
    backgroundColor: '#2a1f18',
    marginBottom: 8,
  },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 14, color: colors.text, marginLeft: 3 },
  heroBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
  },
  heroTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f87171' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  liveBadge: {
    position: 'absolute',
    bottom: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  liveBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text },
});