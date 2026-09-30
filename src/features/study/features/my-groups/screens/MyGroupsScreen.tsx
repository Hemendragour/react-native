import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { updateGroup, deleteGroup, leaveGroup, fetchMyGroups, leaveStudyGroup, updateStudyGroup, deleteStudyGroup } from '../../../store/groupsSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import BottomBar from '../../../../../shared/components/BottomBar';
import { SettingsModal, Group } from '../components/SettingsModal';
import { colors } from '../../../theme/colors';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['all', 'created', 'joined'] as const;
type Tab = typeof TABS[number];

export function MyGroupsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const groups = useAppSelector(s => s.groups.items) as Group[];

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [settingsGroup, setSettingsGroup] = useState<Group | null>(null);

  React.useEffect(() => {
    dispatch(fetchMyGroups());
  }, [dispatch]);

  const filtered = groups.filter(g => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'created' && g.isCreator) ||
      (activeTab === 'joined' && !g.isCreator);
    return matchSearch && matchTab;
  });

  const stats = {
    total: groups.length,
    created: groups.filter(g => g.isCreator).length,
    joined: groups.filter(g => !g.isCreator).length,
    hours: groups.reduce((a, g) => a + (g.studyTime ?? 0), 0),
    attendance: groups.length > 0
      ? Math.round(groups.reduce((a, g) => a + (g.attendance ?? 0), 0) / groups.length)
      : 0,
  };

  const handleUpdate = async (id: string | number, data: Partial<Group>) => {
    try {
      await dispatch(updateStudyGroup({ id, data })).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to update group');
    }
  };

  const handleDelete = (id: string | number) => {
    Alert.alert('Delete Group', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { 
          try {
            await dispatch(deleteStudyGroup(id)).unwrap();
            setSettingsGroup(null);
          } catch (err) {
            Alert.alert('Error', 'Failed to delete group');
          }
      } },
    ]);
  };

  const handleLeave = (id: string | number) => {
    Alert.alert('Leave Group', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { dispatch(leaveStudyGroup(id)); setSettingsGroup(null); } },
    ]);
  };


  return (
    <BottomBar activeTabOverride="Study">
      <SafeScreen>
      <View style={s.container}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Header with Back Button */}
          <View style={s.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={s.backBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ width: 40 }} /> 
          </View>

          {/* Header */}
          <Text style={s.title}>My Study Groups</Text>
          <Text style={s.sub}>Manage and track your study groups</Text>

          {/* Stats */}
          <View style={s.statsGrid}>
            {[
              { label: 'Total', value: stats.total, icon: '👥' },
              { label: 'Created', value: stats.created, icon: '👑' },
              { label: 'Joined', value: stats.joined, icon: '➕' },
              { label: 'Hours', value: `${stats.hours}h`, icon: '⏱' },
              { label: 'Attendance', value: `${stats.attendance}%`, icon: '🏅' },
            ].map(({ label, value, icon }) => (
              <View key={label} style={s.statCard}>
                <Text style={s.statIcon}>{icon}</Text>
                <Text style={s.statValue}>{value}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Filter tabs */}
          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]}
                onPress={() => setActiveTab(t)}>
                <Text style={[s.tabTxt, activeTab === t && s.tabTxtActive]}>
                  {t === 'all' ? `All (${stats.total})` : t === 'created' ? `Created (${stats.created})` : `Joined (${stats.joined})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search */}
          <View style={s.searchRow}>
            <TextInput
              style={s.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search groups..."
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Group cards */}
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyTitle}>No groups found</Text>
              <Text style={s.emptySub}>{search ? 'Try a different search' : `You haven't ${activeTab === 'created' ? 'created' : 'joined'} any groups yet`}</Text>
            </View>
          ) : (
            filtered.map(group => (
              <GroupCard
                key={group.id}
                group={group}
              onOpen={() => navigation.navigate('GroupLobby', { groupId: group.id, groupName: group.title })}
                onSettings={() => setSettingsGroup(group)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <SettingsModal
        group={settingsGroup}
        onClose={() => setSettingsGroup(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onLeave={handleLeave}
      />
    </SafeScreen>
    </BottomBar>
  );
}

function GroupCard({ group, onOpen, onSettings }: { group: Group; onOpen: () => void; onSettings: () => void }) {
  return (
    <TouchableOpacity style={s.card} onPress={onOpen} activeOpacity={0.85}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle} numberOfLines={1}>{group.title}</Text>
            {group.isCreator && (
              <View style={s.creatorBadge}><Text style={s.creatorTxt}>👑 Creator</Text></View>
            )}
          </View>
          <Text style={s.cardDesc} numberOfLines={2}>{group.description}</Text>
          <View style={s.tagsRow}>
            <View style={s.tag}><Text style={s.tagTxt}>{group.category}</Text></View>
            <View style={s.tag}><Text style={s.tagTxt}>{group.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</Text></View>
            <View style={s.tag}><Text style={s.tagTxt}>{group.cameraRequired ? '📷 On' : '📷 Off'}</Text></View>
          </View>
        </View>
      </View>

      <View style={s.cardStats}>
        {[
          { icon: '👥', v: group.members, l: 'Members' },
          { icon: '🎯', v: `${group.goalHours}h`, l: 'Goal' },
          { icon: '🔥', v: group.streak ?? 0, l: 'Streak' },
          { icon: '🏅', v: `#${group.rank ?? '-'}`, l: 'Rank' },
        ].map(({ icon, v, l }) => (
          <View key={l} style={s.cardStat}>
            <Text style={s.cardStatIcon}>{icon}</Text>
            <Text style={s.cardStatVal}>{v}</Text>
            <Text style={s.cardStatLbl}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={s.cardProgress}>
        <View style={s.progressRow}>
          <Text style={s.progressLbl}>Study Time</Text>
          <Text style={s.progressVal}>{group.studyTime ?? 0}h</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${Math.min(((group.studyTime ?? 0) / (group.goalHours * 30)) * 100, 100)}%` as any }]} />
        </View>
        <View style={[s.progressRow, { marginTop: 8 }]}>
          <Text style={s.progressLbl}>Attendance</Text>
          <Text style={s.progressVal}>{group.attendance ?? 0}%</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${group.attendance ?? 0}%` as any }]} />
        </View>
      </View>

      <View style={s.cardFooter}>
        <Text style={s.lastActive}>⏰ Active {group.lastActive ?? 'recently'}</Text>
        <TouchableOpacity style={s.settingsBtn} onPress={onSettings}>
          <Text style={s.settingsTxt}>⚙️ {group.isCreator ? 'Manage' : 'Info'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '18%', backgroundColor: colors.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderBrown },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderBrown },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabTxt: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  tabTxtActive: { color: '#fff' },
  searchRow: { marginBottom: 16 },
  searchInput: { borderWidth: 2, borderColor: colors.borderBrown, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.primary, backgroundColor: colors.surface },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1.5, borderColor: colors.borderBrown, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { padding: 14, backgroundColor: '#f6ede8', borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.primary, flex: 1 },
  creatorBadge: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  creatorTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt: { fontSize: 10, fontWeight: '600', color: colors.primary },
  cardStats: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  cardStat: { flex: 1, alignItems: 'center', gap: 2 },
  cardStatIcon: { fontSize: 14 },
  cardStatVal: { fontSize: 15, fontWeight: '800', color: colors.primary },
  cardStatLbl: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },
  cardProgress: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLbl: { fontSize: 11, fontWeight: '700', color: colors.primary },
  progressVal: { fontSize: 11, fontWeight: '700', color: colors.primaryLight },
  track: { height: 6, backgroundColor: colors.borderBrown, borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.primaryLight, borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  lastActive: { fontSize: 11, color: colors.textMuted },
  settingsBtn: { backgroundColor: '#f6ede8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  settingsTxt: { fontSize: 11, fontWeight: '700', color: colors.primary },
});