import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setSubject } from '../store/timerSlice';
import { colors } from '../../../theme/colors';

export function SubjectInput() {
  const dispatch = useAppDispatch();
  const { subject, isActive, isBreakMode, completedSessions } = useAppSelector(s => s.timer);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isBreakMode ? 'Break Time' : 'Subject'}
      </Text>
      {isBreakMode ? (
        <View style={styles.breakBox}>
          <Text style={styles.breakText}>
            {completedSessions % 4 === 0 ? 'Take a long break! 🎉' : 'Take a short break! ☕'}
          </Text>
        </View>
      ) : (
        <TextInput
          style={[styles.input, isActive && styles.inputDisabled]}
          value={subject}
          onChangeText={t => dispatch(setSubject(t))}
          placeholder="What are you working on?"
          placeholderTextColor={colors.textMuted}
          editable={!isActive}
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundMid,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  breakBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  breakText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});