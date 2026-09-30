import React from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, Switch, StyleSheet, Pressable,
  Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { CATEGORIES, Visibility } from '../types/createGroup.types';
import { SuccessSheet } from './SuccessSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ visible, onClose }: Props) {
  const { step, form, patch, groupLink, handleSubmit, handleClose, resetToForm } =
    useCreateGroup(onClose);

  if (step === 'success') {
    return (
      <SuccessSheet
        visible={visible}
        groupTitle={form.title}
        groupLink={groupLink}
        formData={form}
        onClose={handleClose}
        onCreateAnother={resetToForm}
      />
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>Create Study Group</Text>
              <Text style={s.headerSub}>Set up your study group</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Text style={s.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Field label="Group Title *">
              <TextInput
                style={s.input}
                placeholder="e.g., Focus JEE Warriors"
                placeholderTextColor={colors.textMuted}
                value={form.title}
                onChangeText={t => patch({ title: t })}
              />
            </Field>

            {/* Description */}
            <Field label="Description *">
              <TextInput
                style={[s.input, s.textarea]}
                placeholder="Daily sessions, rules, target audience…"
                placeholderTextColor={colors.textMuted}
                value={form.description}
                onChangeText={t => patch({ description: t })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={s.tip}>💡 Mention rules, active times, prerequisites</Text>
            </Field>


            {/* old logic */}
            {/* <View style={s.row}>
              <Field label="Category *" style={s.half}>
                <View style={s.pickerWrap}> */}

            {/* Category */}
            <Field label="Category *">
              <View style={[s.pickerWrap, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[s.pill, form.category === cat && s.pillActive]}
                    onPress={() => patch({ category: cat })}
                  >
                    <Text style={[s.pillText, form.category === cat && s.pillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Leader */}
            <Field label="Leader *">
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                value={form.leader}
                onChangeText={t => patch({ leader: t })}
              />
            </Field>

            {/* Goal Hours + Capacity row */}
            <View style={s.row}>
              <Field label="Daily Goal (hrs)" style={s.half}>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={String(form.goalHours)}
                  onChangeText={t => patch({ goalHours: parseInt(t) || 8 })}
                />
              </Field>
              <Field label="Capacity" style={s.half}>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  value={String(form.capacity)}
                  onChangeText={t => patch({ capacity: parseInt(t) || 20 })}
                />
              </Field>
            </View>

            {/* Visibility */}
            <Field label="Visibility">
              <View style={s.row}>
                {(['public', 'private'] as Visibility[]).map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[s.visBtn, form.visibility === v && s.visBtnActive]}
                    onPress={() => patch({ visibility: v })}
                  >
                    <Text style={s.visIcon}>{v === 'public' ? '🌐' : '🔒'}</Text>
                    <Text style={[s.visLabel, form.visibility === v && s.visLabelActive]}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Camera toggle */}
            <ToggleRow
              icon="📷"
              label="Camera Required"
              sub="Members must turn on camera"
              value={form.cameraOn}
              onChange={v => patch({ cameraOn: v })}
            />

            {/* Attendance toggle */}
            <ToggleRow
              icon="✅"
              label="Attendance Required"
              sub="Track member attendance"
              value={form.attendanceRequired}
              onChange={v => patch({ attendanceRequired: v })}
            />

            {/* Submit */}
            <TouchableOpacity style={s.submit} onPress={handleSubmit}>
              <Text style={s.submitText}>Create Study Group</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ── small internal helpers ───────────────────────────── */

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ marginBottom: 18 }, style]}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  icon, label, sub, value, onChange,
}: {
  icon: string; label: string; sub: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        <Text style={s.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderBrown, true: colors.primaryLight }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

/* ── styles ───────────────────────────────────────────── */

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Math.min(SCREEN_HEIGHT * 0.92, 680),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBrown,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textMid, marginTop: 2 },
  closeX: { fontSize: 18, color: colors.textMuted, padding: 4 },
  scroll: { flex: 1 },
  body: { padding: 20, paddingBottom: 48 },

  label: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textarea: { minHeight: 88 },
  tip: { fontSize: 11, color: '#3b82f6', marginTop: 4 },

  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  pickerWrap: { gap: 6 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
  },
  pillActive: { borderColor: colors.primaryLight, backgroundColor: `${colors.primaryLight}18` },
  pillText: { fontSize: 12, color: colors.textMid },
  pillTextActive: { color: colors.text, fontWeight: '700' },

  visBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderBrown,
    gap: 4,
  },
  visBtnActive: { borderColor: colors.primaryLight, backgroundColor: `${colors.primaryLight}15` },
  visIcon: { fontSize: 20 },
  visLabel: { fontSize: 13, color: colors.textMid, fontWeight: '600' },
  visLabelActive: { color: colors.text },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundMid,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  toggleIcon: { fontSize: 18 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  toggleSub: { fontSize: 11, color: colors.textMid, marginTop: 1 },

  submit: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});