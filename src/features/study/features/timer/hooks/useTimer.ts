import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  decrementTime, completeSession, startBreak, endBreak, stopStudySession,
} from '../store/timerSlice';

export function useTimer() {
  const dispatch = useAppDispatch();
  const { isActive, minutes, seconds, isBreakMode, activeTab, completedSessions } =
    useAppSelector(s => s.timer);

  const justCompleted = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (minutes === 0 && seconds === 0) {
        if (!justCompleted.current) {
          justCompleted.current = true;
          handleComplete();
        }
        return;
      }

      if (minutes === 0 && seconds === 1) {
        dispatch(decrementTime());
        if (!justCompleted.current) {
          justCompleted.current = true;
          setTimeout(() => handleComplete(), 100);
        }
        return;
      }

      justCompleted.current = false;
      dispatch(decrementTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleComplete = () => {
    if (activeTab === 'pomodoro') {
      if (isBreakMode) {
        dispatch(endBreak());
      } else {
        dispatch(completeSession());
        dispatch(stopStudySession({ notes: 'Pomodoro completed' }));
        const isLong = (completedSessions + 1) % 4 === 0;
        dispatch(startBreak(isLong ? 'long' : 'short'));
      }
    } else {
      dispatch(completeSession());
      dispatch(stopStudySession({ notes: 'Timer completed' }));
      dispatch({ type: 'timer/resetTimer' });
    }
  };
}