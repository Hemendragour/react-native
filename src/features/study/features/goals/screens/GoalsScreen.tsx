import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchGoals,
  createGoalAsync,
  updateGoalAsync,
  deleteGoalAsync,
  toggleWeekProgressAsync,
  addGoalToDayAsync,
  toggleDayGoalCompletionAsync,
  removeGoalFromDayAsync,
  Goal,
  WeeklyGoals
} from '../store/goalsSlice';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import BottomBar from '../../../../../shared/components/BottomBar';
import { CircularProgress } from '../components/CircularProgress';
import { GoalCard } from '../components/GoalCard';
import { CreateGoalModal } from '../components/CreateGoalModal';
import { EditGoalModal } from '../components/EditGoalModal';
import { colors } from '../../../theme/colors';

type DayName = keyof WeeklyGoals;
const DAYS: DayName[] = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export function GoalsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const goals = useAppSelector(s => s.goals.items);
  const weeklyGoals = useAppSelector(s => s.goals.weeklyGoals);

  const [createVisible, setCreateVisible] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [currentDay, setCurrentDay] = useState(getTodayIndex());

  React.useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  // Progress stats
  const totalWeeks = goals.reduce((a, g) => a + (g.progress?.length || 0), 0);
  const completedWeeks = goals.reduce((a, g) => a + (g.progress?.filter(Boolean).length || 0), 0);
  const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;
  const completedGoals = goals.filter(g => g.progress?.every(Boolean)).length;

  const handleDelete = (id: string | number) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        dispatch(deleteGoalAsync(id));
      } },
    ]);
  };

  const activeDayName = DAYS[currentDay];

  const dayGoals = weeklyGoals[activeDayName] || [];

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
          <Text style={s.pageTitle}>Your Weekly Routine</Text>
          <Text style={s.pageSub}>Monitor your goals and stay consistent every week</Text>

          {/* Stats + Create */}
          <View style={s.statsRow}>
            <View style={s.statsLeft}>
              <CircularProgress progress={progress} size={72} color="#4a3728" />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.statsTitle}>Progress This Week</Text>
                <Text style={s.statsSub}>
                  {goals.length === 0 ? 'Add goals to track' : `${completedGoals} of ${goals.length} completed`}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={s.createBtn} onPress={() => setCreateVisible(true)}>
              <Text style={s.createBtnTxt}>+ New</Text>
            </TouchableOpacity>
          </View>

          {/* Goal Cards */}
          {goals.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No goals yet</Text>
              <Text style={s.emptySub}>Create your first goal to get started</Text>
            </View>
          ) : (
            <>
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={g => setEditGoal(g)}
                  onDelete={handleDelete}
                  onToggleWeek={(gId, wi) => dispatch(toggleWeekProgressAsync({ goalId: gId, weekIndex: wi }))}
                />
              ))}
              <View style={s.tip}>
                <Text style={s.tipTxt}>💡 Tap a day below to add goals to that day's schedule</Text>
              </View>
            </>
          )}

          {/* Weekly Tracker */}
          <Text style={s.sectionTitle}>Weekly Schedule</Text>

          {/* Day tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dayTabs}>
            {DAYS.map((day, i) => {
              const isToday = i === getTodayIndex();
              const active = i === currentDay;
              return (
                <TouchableOpacity key={day} onPress={() => setCurrentDay(i)}
                  style={[s.dayTab, active && s.dayTabActive]}>
                  <Text style={[s.dayTabTxt, active && s.dayTabTxtActive]}>{day.slice(0, 3)}</Text>
                  {isToday && <View style={s.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Day column */}
          <View style={s.dayColumn}>
            <Text style={s.dayLabel}>
              {activeDayName}{getTodayIndex() === currentDay ? ' (Today)' : ''}
            </Text>

            {/* Add goals from goals list to this day */}
            {goals.length > 0 && (
              <View style={s.addGoalsRow}>
                <Text style={s.addGoalsHint}>Tap to add to {activeDayName}:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {goals.map(g => {
                    const alreadyAdded = dayGoals.some(dg => dg.id === g.id);
                    return (
                      <TouchableOpacity
                        key={g.id}
                        disabled={alreadyAdded}
                        onPress={() => dispatch(addGoalToDayAsync({ goal: g, day: activeDayName }))}
                        style={[s.addChip, { borderColor: g.color, backgroundColor: alreadyAdded ? g.color : g.color + '20' }]}
                      >
                        <Text style={[s.addChipTxt, { color: alreadyAdded ? '#fff' : g.color }]}>
                          {alreadyAdded ? '✓ ' : '+ '}{g.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Day goals */}
            {dayGoals.length === 0 ? (
              <View style={s.dayEmpty}>
                <Text style={s.dayEmptyTxt}>No goals scheduled for {activeDayName}</Text>
              </View>
            ) : (
              dayGoals.map((goal, gIdx) => (
                <View key={`${goal.id}-${activeDayName}-${gIdx}`} style={[s.dayGoalRow, { borderColor: goal.color, backgroundColor: goal.color + '18' }]}>
                  <View style={[s.dayGoalDot, { backgroundColor: goal.color }]} />
                  <Text style={s.dayGoalTitle} numberOfLines={1}>{goal.title}</Text>
                  <TouchableOpacity
                    style={[s.checkBtn, { borderColor: goal.color, backgroundColor: goal.completed ? goal.color : 'transparent' }]}
                    onPress={() => dispatch(toggleDayGoalCompletionAsync({ day: activeDayName, goalId: goal.id, completed: !goal.completed }))}
                  >
                    {goal.completed && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => dispatch(removeGoalFromDayAsync({ day: activeDayName, goalId: goal.id }))}>
                    <Text style={s.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

        </ScrollView>
      </View>

      <CreateGoalModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSave={data => {
          dispatch(createGoalAsync({
            title: data.title,
            color: data.color || '#4A90E2',
            days: data.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }));
          setCreateVisible(false);
        }}
      />
      <EditGoalModal
        visible={!!editGoal}
        goal={editGoal}
        onClose={() => setEditGoal(null)}
        onSave={g => { dispatch(updateGoalAsync(g)); setEditGoal(null); }}
      />
    </SafeScreen>
    </BottomBar>
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
  pageTitle: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  pageSub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  statsLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, flex: 1 },
  statsTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, flexShrink: 1 },
  statsSub: { fontSize: 11, color: colors.textMuted, marginTop: 2, flexShrink: 1 },
  createBtn: { backgroundColor: '#4a3728', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  createBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  tip: { backgroundColor: '#f6ede8', borderRadius: 10, padding: 12, marginBottom: 20 },
  tipTxt: { fontSize: 12, color: '#4a3728', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  dayTabs: { marginBottom: 16 },
  dayTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1.5, borderColor: colors.borderBrown, alignItems: 'center' },
  dayTabActive: { backgroundColor: '#4a3728', borderColor: '#4a3728' },
  dayTabTxt: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  dayTabTxtActive: { color: '#fff' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10b981', marginTop: 3 },
  dayColumn: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: colors.borderBrown },
  dayLabel: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 12 },
  addGoalsRow: { marginBottom: 12 },
  addGoalsHint: { fontSize: 11, color: colors.textMuted, marginBottom: 6, fontWeight: '600' },
  addChip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  addChipTxt: { fontSize: 12, fontWeight: '700' },
  dayEmpty: { paddingVertical: 32, alignItems: 'center' },
  dayEmptyTxt: { color: colors.textMuted, fontSize: 13 },
  dayGoalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8 },
  dayGoalDot: { width: 8, height: 8, borderRadius: 4 },
  dayGoalTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: '#3b2a1e' },
  checkBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  removeBtn: { fontSize: 14, color: colors.textMuted, paddingHorizontal: 4 },
});