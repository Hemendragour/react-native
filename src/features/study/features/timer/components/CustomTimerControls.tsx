import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setCustomMinutes } from '../store/timerSlice';
import { colors } from '../../../theme/colors';

export function CustomTimerControls() {
  const dispatch = useAppDispatch();
  const { customMinutes, isActive } = useAppSelector(s => s.timer);

  const adjust = (delta: number) => {
    const next = customMinutes + delta;
    if (next >= 1 && next <= 180) dispatch(setCustomMinutes(next));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Duration (Minutes)</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, isActive && styles.btnDisabled]}
          onPress={() => adjust(-5)}
          disabled={isActive}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.valueBox}>
          <Text style={styles.value}>{customMinutes}</Text>
          <Text style={styles.valueLabel}>minutes</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, isActive && styles.btnDisabled]}
          onPress={() => adjust(5)}
          disabled={isActive}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  btn: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundMid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  valueBox: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 90,
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
});