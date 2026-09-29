import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { 
  toggleTimer, resetTimer, startStudySession, stopStudySession,
  pauseStudySession, resumeStudySession, cancelStudySession, fetchActiveTimer
} from '../store/timerSlice';
import { colors } from '../../../theme/colors';

export function TimerControls() {
  const dispatch = useAppDispatch();
  const isActive = useAppSelector(s => s.timer.isActive);
  const sessionStartTime = useAppSelector(s => s.timer.sessionStartTime);

  return (
    <View style={styles.row}>
      {/* Reset */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => {
          dispatch(cancelStudySession());
          dispatch(resetTimer());
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryText}>↺  Reset</Text>
      </TouchableOpacity>

      {/* Start / Pause */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={async () => {
          try {
            if (!isActive) {
              if (sessionStartTime) {
                await dispatch(resumeStudySession()).unwrap();
              } else {
                await dispatch(startStudySession()).unwrap();
              }
            } else {
              await dispatch(pauseStudySession()).unwrap();
            }
            dispatch(toggleTimer());
          } catch (err: any) {
            let errorMsg = typeof err === 'string' ? err : 'Could not communicate with the server.';
            if (errorMsg.includes('400') || errorMsg.includes('active timer')) {
              errorMsg = 'You already have an active timer running. Syncing with server...';
              dispatch(fetchActiveTimer());
            }
            Alert.alert('Action Failed', errorMsg);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryText}>
          {isActive ? '⏸  Pause' : '▶  Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.backgroundMid,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderBrown,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});