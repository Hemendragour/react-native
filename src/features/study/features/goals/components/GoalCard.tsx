import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Goal } from '../store/goalsSlice';
import { colors } from '../../../theme/colors';

interface Props {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string | number) => void;
  onToggleWeek: (goalId: string | number, weekIndex: number) => void;
}

const WEEKS = ['W1', 'W2', 'W3', 'W4'];

export function GoalCard({ goal, onEdit, onDelete, onToggleWeek }: Props) {
  return (
    <View style={[s.card, { borderColor: goal.color, backgroundColor: goal.color + '20' }]}>
      {/* Top row */}
      <View style={s.topRow}>
        <View style={[s.dot, { backgroundColor: goal.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={2}>{goal.title}</Text>
          {goal.labels && goal.labels.length > 0 && (
            <View style={s.labelsRow}>
              {goal.labels.slice(0, 2).map((l, i) => (
                <View key={i} style={[s.labelChip, { borderColor: goal.color + '88', backgroundColor: goal.color + '22' }]}>
                  <Text style={s.labelText}>{l.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Week toggles */}
      <View style={s.weeksRow}>
        {WEEKS.map((w, i) => {
          const done = goal.progress?.[i] ?? false;
          return (
            <TouchableOpacity
              key={i}
              style={[s.weekBtn, { borderColor: goal.color, backgroundColor: done ? goal.color : 'transparent' }]}
              onPress={() => onToggleWeek(goal.id, i)}
            >
              <Text style={[s.weekTxt, { color: done ? '#fff' : goal.color }]}>{w}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onEdit(goal)}>
          <Text style={s.actionTxt}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={() => onDelete(goal.id)}>
          <Text style={[s.actionTxt, { color: '#ef4444' }]}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1.5, borderRadius: 16,
    padding: 14, marginBottom: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  title: { fontSize: 14, fontWeight: '700', color: '#3b2a1e', flexShrink: 1 },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  labelChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  labelText: { fontSize: 10, fontWeight: '600', color: '#3b2a1e' },
  weeksRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  weekBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  weekTxt: { fontSize: 10, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center',
  },
  deleteBtn: {},
  actionTxt: { fontSize: 12, fontWeight: '700', color: '#4a3728' },
});