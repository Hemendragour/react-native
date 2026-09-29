import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Goal } from '../store/goalsSlice';
import { colors } from '../../../theme/colors';

interface Props {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#ec4899','#f97316','#ef4444','#14b8a6'];
const DAYS = [
  { short: 'M', full: 'Monday' }, { short: 'T', full: 'Tuesday' },
  { short: 'W', full: 'Wednesday' }, { short: 'T', full: 'Thursday' },
  { short: 'F', full: 'Friday' }, { short: 'S', full: 'Saturday' },
  { short: 'S', full: 'Sunday' },
];

export function EditGoalModal({ visible, goal, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    if (goal) {
      setName(goal.title || '');
      setLabel(goal.labels?.[0]?.name || '');
      setColor(goal.color || '#3b82f6');
      setDays(goal.days || []);
    }
  }, [goal]);

  const toggleDay = (d: string) =>
    setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Please enter a goal name'); return; }
    if (!goal) return;
    onSave({
      ...goal,
      title: name.trim(),
      labels: label.trim() ? [{ name: label.trim() }] : [],
      color,
      days,
    });
  };

  if (!goal) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.box}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.topRow}>
              <Text style={s.title}>✏️ Edit Goal</Text>
              <TouchableOpacity onPress={onClose}><Text style={s.x}>✕</Text></TouchableOpacity>
            </View>

            <Text style={s.label}>Goal Name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName}
              placeholder="e.g., Morning Exercise" placeholderTextColor={colors.textMuted} />

            <Text style={s.label}>Label (Optional)</Text>
            <TextInput style={s.input} value={label} onChangeText={setLabel}
              placeholder="e.g., Health, Work" placeholderTextColor={colors.textMuted} maxLength={15} />

            <Text style={s.label}>Choose Color</Text>
            <View style={s.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)}
                  style={[s.colorDot, { backgroundColor: c }, color === c && s.colorSelected]} />
              ))}
            </View>

            <Text style={s.label}>Select Days</Text>
            <View style={s.daysRow}>
              {DAYS.map((d, i) => {
                const active = days.includes(d.full);
                return (
                  <TouchableOpacity key={i} onPress={() => toggleDay(d.full)}
                    style={[s.dayBtn, active && { backgroundColor: color }]}>
                    <Text style={[s.dayTxt, active && { color: '#fff' }]}>{d.short}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {goal.progress && (
              <View style={s.progressInfo}>
                <Text style={s.progressTxt}>📊 Progress: {goal.progress.filter(Boolean).length}/4 weeks completed</Text>
              </View>
            )}

            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveTxt}>💾 Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  box: { backgroundColor: '#f6ede8', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#4a3728' },
  x: { fontSize: 22, color: '#6b5847' },
  label: { fontSize: 13, fontWeight: '700', color: '#4a3728', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 2, borderColor: '#d4c4b0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#4a3728', backgroundColor: '#fff' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#4a3728' },
  daysRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dayBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#d4c4b0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dayTxt: { fontSize: 12, fontWeight: '800', color: '#6b5847' },
  progressInfo: { marginTop: 16, padding: 12, backgroundColor: '#d1fae5', borderRadius: 10 },
  progressTxt: { fontSize: 12, color: '#065f46', fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#d4c4b0', alignItems: 'center' },
  cancelTxt: { fontWeight: '700', color: '#4a3728' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#4a3728', alignItems: 'center' },
  saveTxt: { fontWeight: '700', color: '#fff' },
});