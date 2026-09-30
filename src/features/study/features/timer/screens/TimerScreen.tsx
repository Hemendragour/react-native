import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchStudyStats, fetchActiveTimer } from '../store/timerSlice';
import { useTimer } from '../hooks/useTimer';
import { TimerTabs } from '../components/TimerTabs';
import { TimerDisplay } from '../components/TimerDisplay';
import { CustomTimerControls } from '../components/CustomTimerControls';
import { SubjectInput } from '../components/SubjectInput';
import { TimerControls } from '../components/TimerControls';
import { TimerStats } from '../components/TimerStats';
import { MotivationalQuote } from '../components/MotivationalQuote';
import { StudyProgress } from '../components/StudyProgress';
import { colors } from '../../../theme/colors';

export function TimerScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  // Hook handles the countdown interval
  useTimer();

  React.useEffect(() => {
    dispatch(fetchStudyStats());
    dispatch(fetchActiveTimer());
  }, [dispatch]);

  const { activeTab, customMinutes, minutes, seconds } = useAppSelector(s => s.timer);

  // Calculate progress 0–100
  const tabDuration = activeTab === 'timer' ? customMinutes
    : activeTab === 'pomodoro' ? 25 : 45;
  const totalSeconds = tabDuration * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  return (
    <SafeScreen>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timer</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Timer panel */}
        <View style={styles.timerPanel}>
          <TimerTabs />
          <TimerDisplay progress={progress} />
          {activeTab === 'timer' && <CustomTimerControls />}
          <SubjectInput />
          <TimerControls />
          <TimerStats />
        </View>

        {/* Info panel */}
        <View style={styles.infoPanel}>
          <MotivationalQuote />
          <StudyProgress />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  timerPanel: {
    gap: 0, // children use their own marginBottom
  },
  infoPanel: {
    gap: 0,
  },
});