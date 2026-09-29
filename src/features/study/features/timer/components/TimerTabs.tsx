import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setActiveTab } from '../store/timerSlice';
import { colors } from '../../../theme/colors';

const TABS: { id: 'pomodoro' | 'focus' | 'timer'; label: string }[] = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'focus',    label: 'Focus'    },
  { id: 'timer',    label: 'Timer'    },
];

export function TimerTabs() {
  const dispatch = useAppDispatch();
  const { activeTab, isActive, sessionStartTime, isBreakMode, minutes, seconds, settings, customMinutes } = useAppSelector(s => s.timer);

  const handleTabPress = (tabId: 'pomodoro' | 'focus' | 'timer') => {
    const isDefaultTime = () => {
      if (activeTab === 'pomodoro') return minutes === settings.pomodoroMinutes && seconds === 0;
      if (activeTab === 'focus') return minutes === settings.focusMinutes && seconds === 0;
      return minutes === customMinutes && seconds === 0;
    };

    if (isActive || sessionStartTime || isBreakMode || !isDefaultTime()) {
      Alert.alert('Session in Progress', 'Please stop and reset your current timer before switching modes.');
      return;
    }
    dispatch(setActiveTab(tabId));
  };

  return (
    <View style={styles.container}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, activeTab === tab.id && styles.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  labelActive: {
    color: '#fff',
  },
});