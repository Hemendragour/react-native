import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { createTaskAsync, toggleTaskAsync, deleteTaskAsync, Todo } from '../store/todosSlice';
import { colors } from '../../../theme/colors';

interface Props {
  selectedDate: Date | null;
  visible: boolean;
  onClose: () => void;
  formatDate: (date: Date) => string;
}

const PRIORITY_OPTIONS: { value: Todo['priority']; label: string; color: string }[] = [
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'high',   label: 'High',   color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const priorityColor = (p: Todo['priority']) =>
  PRIORITY_OPTIONS.find(o => o.value === p)?.color ?? '#f59e0b';

export function TodoModal({ selectedDate, visible, onClose, formatDate }: Props) {
  const dispatch = useAppDispatch();
  const [newTodo, setNewTodo]     = useState('');
  const [priority, setPriority]   = useState<Todo['priority']>('medium');
  const saving = useAppSelector(s => s.todos.saving);

  const dateStr    = selectedDate ? formatDate(selectedDate) : '';
  const dateTodos  = useAppSelector(s => dateStr ? s.todos.items[dateStr] ?? [] : []);
  const isComplete = dateTodos.length > 0 && dateTodos.every(t => t.completed);
  const completedCount = dateTodos.filter(t => t.completed).length;
  const progress   = dateTodos.length > 0 ? completedCount / dateTodos.length : 0;

  const handleAdd = async () => {
    const trimmed = newTodo.trim();
    if (!trimmed || trimmed.length < 3 || !dateStr) {
      Alert.alert('Invalid Title', 'Task title must be at least 3 characters long!');
      return;
    }
    await dispatch(createTaskAsync({ dateStr, text: trimmed, priority }));
    setNewTodo('');
  };

  if (!selectedDate) return null;

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerDate} numberOfLines={2}>{dateLabel}</Text>
                {isComplete && (
                  <Text style={styles.allDone}>🏅 All tasks completed!</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar (shown at top if tasks exist) */}
          {dateTodos.length > 0 && (
            <View style={styles.topProgress}>
              <View style={styles.topProgressRow}>
                <Text style={styles.topProgressLabel}>
                  {completedCount}/{dateTodos.length} done
                </Text>
                <Text style={styles.topProgressPct}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
              </View>
            </View>
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Priority selector */}
            <View style={styles.priorityRow}>
              {PRIORITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.priorityBtn,
                    { borderColor: opt.color },
                    priority === opt.value && { backgroundColor: opt.color },
                  ]}
                  onPress={() => setPriority(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.priorityBtnTxt,
                    { color: priority === opt.value ? '#fff' : opt.color },
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add a new task..."
                placeholderTextColor={colors.textMuted}
                value={newTodo}
                onChangeText={setNewTodo}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
                editable={!saving}
              />
              <TouchableOpacity
                style={[styles.addBtn, saving && styles.addBtnDisabled]}
                onPress={handleAdd}
                activeOpacity={0.8}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.addBtnTxt}>+ Add</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Todo list */}
            {dateTodos.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTxt}>No tasks for this day</Text>
                <Text style={styles.emptyHint}>Add your first task above</Text>
              </View>
            ) : (
              dateTodos.map(todo => (
                <View
                  key={todo.id}
                  style={[styles.todoRow, todo.completed && styles.todoRowDone]}
                >
                  {/* Priority dot */}
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor(todo.priority) }]} />

                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[styles.circle, todo.completed && styles.circleDone]}
                    onPress={() =>
                      dispatch(toggleTaskAsync({ todoId: todo.id, isCompleted: !todo.completed, dateStr }))
                    }
                    hitSlop={8}
                  >
                    {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  {/* Task text */}
                  <Text
                    style={[styles.todoTxt, todo.completed && styles.todoTxtDone]}
                    numberOfLines={3}
                  >
                    {todo.text}
                  </Text>

                  {/* Delete */}
                  <TouchableOpacity
                    onPress={() => dispatch(deleteTaskAsync({ todoId: todo.id, dateStr }))}
                    hitSlop={8}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteTxt}>🗑</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    minHeight: 320,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: colors.backgroundDeep,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDeep,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1, paddingRight: 8 },
  headerIcon: { fontSize: 18, marginTop: 2 },
  headerDate: { fontSize: 15, fontWeight: '700', color: colors.text, flexShrink: 1 },
  allDone: { fontSize: 12, color: '#f59e0b', fontWeight: '600', marginTop: 2 },
  closeBtn: { padding: 4 },
  closeTxt: { fontSize: 16, color: colors.textMuted, fontWeight: '700' },

  topProgress: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDeep,
  },
  topProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  topProgressLabel: { fontSize: 12, fontWeight: '600', color: colors.textMid },
  topProgressPct: { fontSize: 12, fontWeight: '700', color: colors.primary },
  progressTrack: { height: 6, backgroundColor: colors.backgroundDeep, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primaryLight, borderRadius: 3 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },

  priorityRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityBtnTxt: { fontSize: 11, fontWeight: '700' },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.backgroundDeep,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceWarm,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    minWidth: 64,
    alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  empty: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt: { fontSize: 15, fontWeight: '700', color: colors.textMid, marginBottom: 4 },
  emptyHint: { fontSize: 12, color: colors.textMuted },

  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.backgroundDeep,
    backgroundColor: colors.surface,
  },
  todoRowDone: { backgroundColor: colors.background, borderColor: colors.primaryLight, opacity: 0.85 },

  priorityDot: { width: 8, height: 8, borderRadius: 4 },

  circle: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '800' },

  todoTxt: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '500' },
  todoTxtDone: { textDecorationLine: 'line-through', color: colors.textMid },

  deleteBtn: { padding: 4 },
  deleteTxt: { fontSize: 14 },
});