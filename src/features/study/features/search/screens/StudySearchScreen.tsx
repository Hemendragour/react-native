import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { colors } from '../../../theme/colors';
import { useAppSelector } from '../../../store';
import { GroupCard } from '../../home/components/GroupCard';
import { Group } from '../../home/types';
import { StudyService } from '../../../../../services/study.service';

type SearchScreenRouteProp = RouteProp<RootStackParamList, 'StudySearch'>;
type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StudySearch'>;

export function StudySearchScreen() {
  const route = useRoute<SearchScreenRouteProp>();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const initialQuery = route.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [apiResults, setApiResults] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const browseItems = useAppSelector(s => s.groups.browseItems);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setApiResults(null);
      return;
    }

    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await StudyService.searchGroups(trimmed);
        const rawGroups = res?.data?.groups || res?.groups || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        if (active) {
          if (Array.isArray(rawGroups) && rawGroups.length > 0) {
            const mapped: Group[] = rawGroups.map((g: any) => ({
              id: g.groupId || g.id || g._id || String(Math.random()),
              title: g.title || '',
              description: g.description || '',
              category: g.category || 'Other',
              rank: g.groupScore || 0,
              visibility: g.visibility || 'public',
              cameraOn: g.cameraRequired ?? false,
              members: g.currentMemberCount || g.members || 1,
              capacity: g.capacity || 50,
              leader: 'Group Leader',
              goalHours: g.goalHours || 0,
              attendanceAvg: g.minAttendancePercent || 75,
            }));
            setApiResults(mapped);
          } else {
            const localFiltered = browseItems.filter(g =>
              g.title.toLowerCase().includes(trimmed.toLowerCase()) ||
              g.category.toLowerCase().includes(trimmed.toLowerCase()) ||
              g.description.toLowerCase().includes(trimmed.toLowerCase())
            );
            setApiResults(localFiltered);
          }
        }
      } catch (err) {
        console.log('Backend search error, falling back to local browseItems:', err);
        if (active) {
          const localFiltered = browseItems.filter(g =>
            g.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            g.category.toLowerCase().includes(trimmed.toLowerCase()) ||
            g.description.toLowerCase().includes(trimmed.toLowerCase())
          );
          setApiResults(localFiltered);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, browseItems]);

  const displayGroups = apiResults !== null
    ? apiResults
    : (searchQuery.trim()
        ? browseItems.filter(g =>
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : browseItems);

  return (
    <SafeScreen>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backTxt}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search study groups..."
              placeholderTextColor={colors.textMid}
              style={styles.searchInput}
              autoFocus={!initialQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
              >
                <Text style={styles.clearTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List of Results */}
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primaryLight} />
            </View>
          ) : displayGroups.length > 0 ? (
            <FlatList
              data={displayGroups}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <GroupCard group={item} />
                </View>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {displayGroups.length} {displayGroups.length === 1 ? 'Study Group' : 'Study Groups'} Found
                  </Text>
                </View>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>🎓</Text>
              </View>
              <Text style={styles.emptyTitle}>No Study Groups Found</Text>
              <Text style={styles.emptySubtitle}>
                We couldn't find any groups matching "{searchQuery}". Try searching for categories like "JEE", "DSA", or "Placement".
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderBrown,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f3ee',
  },
  backTxt: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: 'bold',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pageBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderWidth: 1,
    borderColor: colors.borderBrown,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearTxt: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 16,
  },
  resultsHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    shadowColor: '#4a3728',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
