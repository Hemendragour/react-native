import React, { useState } from 'react';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../theme/colors';
import { StudyService } from '../../../../../services/study.service';
import { ActivityIndicator, Image, Platform } from 'react-native';

export type Group = {
  id: string | number; title: string; description: string; category: string;
  members: number; capacity: number; goalHours: number;
  cameraRequired?: boolean; visibility: 'public' | 'private';
  isCreator?: boolean; joinedDate?: string; lastActive?: string;
  streak?: number; studyTime?: number; rank?: number; attendance?: number;
};

interface Props {
  group: Group | null;
  onClose: () => void;
  onUpdate: (id: string | number, data: Partial<Group>) => void;
  onDelete: (id: string | number) => void;
  onLeave: (id: string | number) => void;
}

type Tab = 'overview' | 'members' | 'settings';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsModal({ group, onClose, onUpdate, onDelete, onLeave }: Props) {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', goalHours: 8, capacity: 20, cameraRequired: false, visibility: 'public' as 'public' | 'private' });

  React.useEffect(() => {
    if (group) {
      setForm({ title: group.title, description: group.description, goalHours: group.goalHours, capacity: group.capacity, cameraRequired: group.cameraRequired ?? false, visibility: group.visibility });
      fetchMembers();
    }
  }, [group]);

  const fetchMembers = async () => {
    if (!group) return;
    setLoadingMembers(true);
    try {
      const res = await StudyService.getGroupMembers(String(group.id));
      const fetched = res.data || res;
      if (Array.isArray(fetched)) {
        // Map backend members to UI expectations
        const mapped = fetched.map(m => ({
          id: m.userId || m.id,
          name: m.name || 'Unknown',
          avatar: m.avatar,
          studyTime: m.studyTime ?? 0,
          attendance: m.attendance ?? 100,
          streak: m.streak ?? 0,
          rank: m.rank ?? 0,
          violations: m.violations ?? 0,
          lastActive: m.lastActive ? new Date(m.lastActive).toLocaleDateString() : 'recently'
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.log('Error fetching members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  if (!group) return null;

  const handleSave = () => { onUpdate(group.id, form); onClose(); };
  const handleKick = (id: string | number, name: string) => {
    Alert.alert('Remove Member', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await StudyService.kickMember(String(group.id), String(id));
            setMembers(m => m.filter(x => String(x.id) !== String(id)));
          } catch (err) {
            try {
              await StudyService.removeMember(String(group.id), String(id));
              setMembers(m => m.filter(x => String(x.id) !== String(id)));
            } catch (removeErr: any) {
              Alert.alert('Error', removeErr?.response?.data?.message || 'Failed to remove member');
            }
          }
        }
      },
    ]);
  };

  const avgStudy = members.length > 0 ? Math.round(members.reduce((a, m) => a + m.studyTime, 0) / members.length) : 0;
  const avgAtt = members.length > 0 ? Math.round(members.reduce((a, m) => a + m.attendance, 0) / members.length) : 0;

  return (
    <Modal visible={!!group} transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.box}>
          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>{group.isCreator ? 'Group Management' : 'Group Info'}</Text>
              <Text style={s.headerSub} numberOfLines={1}>{group.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Text style={s.x}>✕</Text></TouchableOpacity>
          </View>

          {group.isCreator ? (
            <>
              {/* Tabs */}
              <View style={s.tabRow}>
                {(['overview', 'members', 'settings'] as Tab[]).map(t => (
                  <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
                    <Text style={[s.tabTxt, activeTab === t && s.tabTxtActive]}>
                      {t === 'members' ? `Members (${members.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={s.tabContent}>
                {activeTab === 'overview' && (
                  <View style={s.section}>
                    {/* Stats grid */}
                    <View style={s.overviewGrid}>
                      {[
                        { label: 'Members', value: members.length },
                        { label: 'Avg Study', value: `${avgStudy}h` },
                        { label: 'Avg Attend.', value: `${avgAtt}%` },
                        { label: 'Violations', value: members.filter(m => m.violations > 0).length },
                      ].map(({ label, value }) => (
                        <View key={label} style={s.overviewCard}>
                          <Text style={s.overviewVal}>{value}</Text>
                          <Text style={s.overviewLbl}>{label}</Text>
                        </View>
                      ))}
                    </View>
                    {/* Top performers */}
                    <Text style={s.sectionTitle}>🏆 Top Performers</Text>
                    {members.slice(0, 3).map((m, i) => (
                      <TouchableOpacity key={m.id} style={s.memberRow} onPress={() => { onClose(); navigation.navigate('Profile', { userId: m.id } as any); }}>
                        <Text style={s.memberRank}>{i + 1}</Text>
                        <View style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', marginRight: 10, borderWidth: 1, borderColor: colors.borderBrown, alignItems: 'center', justifyContent: 'center' }}>
                          {/* OLD: <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} /> */}
                          <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${ENV_API_BASE_URL}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.memberName}>{m.name}</Text>
                          <Text style={s.memberMeta}>{m.studyTime}h • {m.attendance}%</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {/* Needs attention */}
                    {members.filter(m => m.attendance < 80 || m.violations > 0).length > 0 && (
                      <>
                        <Text style={[s.sectionTitle, { marginTop: 16 }]}>⚠️ Needs Attention</Text>
                        {members.filter(m => m.attendance < 80 || m.violations > 0).map(m => (
                          <TouchableOpacity key={m.id} style={[s.memberRow, { borderWidth: 1, borderColor: colors.borderBrown, borderRadius: 10 }]} onPress={() => { onClose(); navigation.navigate('Profile', { userId: m.id } as any); }}>
                            <View style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', marginRight: 10, borderWidth: 1, borderColor: colors.borderBrown, alignItems: 'center', justifyContent: 'center' }}>
                              {/* <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} /> */}
                              <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${ENV_API_BASE_URL}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={s.memberName}>{m.name}</Text>
                              <Text style={s.memberMeta}>{m.attendance}% attend • {m.violations} violation(s)</Text>
                            </View>
                            <TouchableOpacity style={s.warnBtn} onPress={() => Alert.alert('Warning sent', `Warning sent to ${m.name}`)}>
                              <Text style={s.warnTxt}>Warn</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                )}

                {activeTab === 'members' && (
                  <View style={s.section}>
                    {loadingMembers ? (
                      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : members.map(m => (
                      <TouchableOpacity key={m.id} style={s.memberCard} onPress={() => { onClose(); navigation.navigate('Profile', { userId: m.id } as any); }}>
                        <View style={s.memberCardTop}>
                          <View style={{ width: 34, height: 34, borderRadius: 17, overflow: 'hidden', marginRight: 10, borderWidth: 1, borderColor: colors.borderBrown, alignItems: 'center', justifyContent: 'center' }}>
                            {/* <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000'}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} /> */}
                            <Image source={{ uri: m.avatar && !m.avatar.startsWith('http') ? `${ENV_API_BASE_URL}/api/v1/profile/profile-photo/get-photo/${m.avatar}` : (m.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }} style={{ width: '100%', height: '100%' }} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.memberName}>{m.name}</Text>
                            <Text style={s.memberMeta}>Last active: {m.lastActive}</Text>
                          </View>
                          <TouchableOpacity style={s.kickBtn} onPress={() => handleKick(m.id, m.name)}>
                            <Text style={s.kickTxt}>✕ Remove</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={s.memberStats}>
                          {[['Study', `${m.studyTime}h`], ['Attend.', `${m.attendance}%`], ['Streak', `${m.streak}d`], ['Rank', `#${m.rank}`]].map(([l, v]) => (
                            <View key={l} style={{ alignItems: 'center' }}>
                              <Text style={s.memberStatVal}>{v}</Text>
                              <Text style={s.memberStatLbl}>{l}</Text>
                            </View>
                          ))}
                        </View>
                        {m.violations > 0 && (
                          <View style={s.violationBadge}><Text style={s.violationTxt}>{m.violations} Violation(s)</Text></View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {activeTab === 'settings' && (
                  <View style={s.section}>
                    <Text style={s.fieldLabel}>Group Title</Text>
                    <TextInput style={s.input} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />

                    <Text style={s.fieldLabel}>Description</Text>
                    <TextInput style={[s.input, { height: 80 }]} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} multiline />

                    <Text style={s.fieldLabel}>Daily Goal (hours)</Text>
                    <TextInput style={s.input} value={String(form.goalHours)} onChangeText={t => setForm(f => ({ ...f, goalHours: parseInt(t) || 8 }))} keyboardType="numeric" />

                    <Text style={s.fieldLabel}>Capacity</Text>
                    <TextInput style={s.input} value={String(form.capacity)} onChangeText={t => setForm(f => ({ ...f, capacity: parseInt(t) || 20 }))} keyboardType="numeric" />

                    <Text style={s.fieldLabel}>Visibility</Text>
                    <View style={s.toggleRow}>
                      {(['public', 'private'] as const).map(v => (
                        <TouchableOpacity key={v} style={[s.visBtn, form.visibility === v && s.visBtnActive]} onPress={() => setForm(f => ({ ...f, visibility: v }))}>
                          <Text style={[s.visTxt, form.visibility === v && s.visTxtActive]}>{v === 'public' ? '🌐 Public' : '🔒 Private'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={s.cameraRow}>
                      <Text style={s.fieldLabel}>Camera Required</Text>
                      <TouchableOpacity style={[s.toggle, form.cameraRequired && s.toggleOn]} onPress={() => setForm(f => ({ ...f, cameraRequired: !f.cameraRequired }))}>
                        <View style={[s.toggleThumb, form.cameraRequired && s.toggleThumbOn]} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                      <Text style={s.saveTxt}>✅ Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(group.id)}>
                      <Text style={s.deleteTxt}>🗑 Delete Group</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </>
          ) : (
            // Non-creator view
            <ScrollView contentContainerStyle={s.tabContent}>
              <View style={s.infoCard}>
                <Text style={s.sectionTitle}>Group Information</Text>
                {[
                  ['Category', group.category], ['Daily Goal', `${group.goalHours} hours`],
                  ['Capacity', `${group.members}/${group.capacity}`], ['Visibility', group.visibility],
                  ['Camera', group.cameraRequired ? 'Required' : 'Optional'], ['Joined', group.joinedDate ?? '-'],
                ].map(([l, v]) => (
                  <View key={l} style={s.infoRow}>
                    <Text style={s.infoLbl}>{l}:</Text>
                    <Text style={s.infoVal}>{v}</Text>
                  </View>
                ))}
              </View>
              <View style={[s.infoCard, { marginTop: 12 }]}>
                <Text style={s.sectionTitle}>Your Stats</Text>
                {[
                  ['Study Time', `${group.studyTime ?? 0}h`], ['Attendance', `${group.attendance ?? 0}%`],
                  ['Streak', `${group.streak ?? 0} days`], ['Rank', `#${group.rank ?? '-'}`],
                ].map(([l, v]) => (
                  <View key={l} style={s.infoRow}>
                    <Text style={s.infoLbl}>{l}:</Text>
                    <Text style={s.infoVal}>{v}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={s.leaveBtn} onPress={() => onLeave(group.id)}>
                <Text style={s.leaveTxt}>🚪 Leave Group</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  box: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  headerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  x: { fontSize: 22, color: colors.textMuted, padding: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: '#f6ede8', borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: colors.primary },
  tabTxt: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  tabTxtActive: { color: colors.primary },
  tabContent: { padding: 16, paddingBottom: 40 },
  section: {},
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  overviewCard: { flex: 1, minWidth: '45%', backgroundColor: '#f6ede8', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.borderBrown },
  overviewVal: { fontSize: 22, fontWeight: '800', color: colors.primary },
  overviewLbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: '#f6ede8', borderRadius: 10, marginBottom: 8 },
  memberRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, color: '#fff', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '800' },
  memberAvatar: { fontSize: 28 },
  memberName: { fontSize: 13, fontWeight: '700', color: colors.primary },
  memberMeta: { fontSize: 11, color: colors.textMuted },
  warnBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  warnTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  memberCard: { backgroundColor: '#f6ede8', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.borderBrown },
  memberCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  kickBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  kickTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  memberStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderBrown },
  memberStatVal: { fontSize: 13, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  memberStatLbl: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },
  violationBadge: { marginTop: 8, backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  violationTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 2, borderColor: colors.borderBrown, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.primary, backgroundColor: '#fff' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  visBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: colors.borderBrown, alignItems: 'center', backgroundColor: '#fff' },
  visBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  visTxt: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  visTxtActive: { color: '#fff' },
  cameraRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#d1d5db', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: colors.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  saveBtn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  deleteBtn: { marginTop: 10, backgroundColor: '#6b5847', borderRadius: 12, padding: 14, alignItems: 'center' },
  deleteTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  infoCard: { backgroundColor: '#f6ede8', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.borderBrown },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.borderBrown },
  infoLbl: { fontSize: 13, color: colors.textMuted },
  infoVal: { fontSize: 13, fontWeight: '700', color: colors.primary },
  leaveBtn: { marginTop: 16, backgroundColor: '#ef4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  leaveTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});