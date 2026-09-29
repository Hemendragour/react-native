import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { createSelector } from '@reduxjs/toolkit';
import { SafeScreen } from '../../../shared/components/layout/SafeScreen';
import { TodoModal } from '../components/TodoModal';
import BottomBar from '../../../../../shared/components/BottomBar';
import { useAppSelector, useAppDispatch } from '../../../store';
import { fetchTasks } from '../store/todosSlice';
import { RootState } from '../../../store';
import { colors } from '../../../theme/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Memoized selectors ────────────────────────────────────────────────────────
const selectTodoItems = createSelector(
  (state: RootState) => state.todos.items,
  items => items
);

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ─── Month View ──────────────────────────────────────────────────────────────
function MonthView({
  currentDate,
  onDateClick,
}: {
  currentDate: Date;
  onDateClick: (day: number) => void;
}) {
  const todos = useAppSelector(selectTodoItems);
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();
  const today = new Date();

  // Responsive sizing
  const isTablet = screenWidth >= 768;
  const PADDING = isTablet ? 16 : 10;
  const GAP = isTablet ? 6 : 4;

  // Cell width: (containerWidth - padding*2 - gap*7) / 7
  const effectiveWidth = containerWidth > 0 ? containerWidth : screenWidth - 32;
  const cellWidth = Math.floor((effectiveWidth - PADDING * 2 - GAP * 7) / 7);
  // Height: taller on tablets, slightly taller than wide on phones
  const cellHeight = isTablet
    ? Math.floor(cellWidth * 1.25)
    : Math.floor(cellWidth * 1.3);

  const cells = useMemo(() => {
    if (cellWidth <= 0) return [];
    const result: React.ReactElement[] = [];

    // Empty leading cells
    for (let i = 0; i < startDow; i++) {
      result.push(
        <View
          key={`e-${i}`}
          style={{
            width: cellWidth,
            height: cellHeight,
            margin: GAP / 2,
          }}
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const d = todos[dateStr] ?? [];
      const total = d.length;
      const completed = d.filter(t => t.completed).length;
      const isToday = today.toDateString() === date.toDateString();
      const allDone = total > 0 && completed === total;
      const progress = total > 0 ? completed / total : 0;

      const fontSize = isTablet ? 14 : cellWidth < 42 ? 10 : 12;
      const statFontSize = isTablet ? 10 : 8;

      result.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isToday && styles.dayCellToday,
            {
              width: cellWidth,
              height: cellHeight,
              margin: GAP / 2,
              borderRadius: isTablet ? 12 : 8,
              padding: isTablet ? 8 : 5,
            },
          ]}
          onPress={() => onDateClick(day)}
          activeOpacity={0.7}
        >
          <View style={styles.dayCellTop}>
            <Text style={[styles.dayNum, { fontSize }, isToday && styles.dayNumToday]}>
              {day}
            </Text>
            {allDone && (
              <Text style={{ fontSize: isTablet ? 11 : 9 }}>🏅</Text>
            )}
          </View>

          {total > 0 && (
            <>
              <Text style={[styles.dayStats, { fontSize: statFontSize }]}>
                {completed}/{total}
              </Text>
              <View style={styles.miniTrack}>
                <View style={[styles.miniFill, { width: `${progress * 100}%` as any }]} />
              </View>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return result;
  }, [todos, year, month, daysInMonth, startDow, cellWidth, cellHeight, GAP, isTablet]);

  return (
    <View style={[styles.calendarBox, { padding: PADDING }]} onLayout={onLayout}>
      {/* Week day headers */}
      <View style={[styles.weekRow, { marginBottom: isTablet ? 8 : 5 }]}>
        {WEEK_DAYS.map(d => (
          <Text
            key={d}
            style={[
              styles.weekDay,
              {
                width: cellWidth,
                margin: GAP / 2,
                fontSize: isTablet ? 13 : cellWidth < 42 ? 9 : 11,
              },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Day cells grid */}
      <View style={styles.daysGrid}>{cells}</View>
    </View>
  );
}

// ─── Year View ───────────────────────────────────────────────────────────────
function YearView({ onYearClick }: { onYearClick: (year: number) => void }) {
  const todos = useAppSelector(selectTodoItems);
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = 2019; y <= currentYear; y++) result.push(y);
    return result;
  }, [currentYear]);

  const yearStats = useMemo(() => {
    return years.map(year => {
      let completedDays = 0;
      let totalTaskDays = 0;
      for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = formatDate(new Date(year, m, d));
          const items = todos[dateStr] ?? [];
          if (items.length > 0) {
            totalTaskDays++;
            if (items.every(t => t.completed)) completedDays++;
          }
        }
      }
      return { year, completedDays, totalTaskDays };
    });
  }, [todos, years]);

  // 3 columns on tablet, 2 on phone
  const numCols = isTablet ? 3 : 2;
  const cardWidth = `${Math.floor(100 / numCols) - 2}%` as any;

  return (
    <View style={[styles.yearGrid, { gap: isTablet ? 12 : 8 }]}>
      {yearStats.map(({ year, completedDays, totalTaskDays }) => {
        const progress = totalTaskDays > 0 ? completedDays / totalTaskDays : 0;
        return (
          <TouchableOpacity
            key={year}
            style={[styles.yearCard, { width: cardWidth, padding: isTablet ? 16 : 12 }]}
            onPress={() => onYearClick(year)}
            activeOpacity={0.75}
          >
            <Text style={[styles.yearLabel, { fontSize: isTablet ? 24 : 20 }]}>
              {year}
            </Text>
            {totalTaskDays > 0 ? (
              <>
                <Text style={styles.yearStats}>{completedDays}/{totalTaskDays} days done</Text>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${progress * 100}%` as any }]} />
                </View>
              </>
            ) : (
              <Text style={styles.yearEmpty}>No tasks</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function TodoScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());

  React.useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  const [view, setView] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;

  const changeMonth = useCallback((inc: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + inc, 1));
  }, []);

  const handleDateClick = useCallback((day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setShowModal(true);
  }, [currentDate]);

  const handleYearClick = useCallback((year: number) => {
    setCurrentDate(new Date(year, 0, 1));
    setView('month');
  }, []);

  return (
    <BottomBar activeTabOverride="Study">
      <SafeScreen>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { padding: isTablet ? 24 : 16, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ width: 40 }} /> 
          </View>

          {/* ── Page Header ── */}
          <View
            style={[
              styles.pageHeader,
              isTablet && styles.pageHeaderTablet,
              { marginBottom: isTablet ? 20 : 14 },
            ]}
          >
            <View>
              <Text style={[styles.pageTitle, { fontSize: isTablet ? 30 : 24 }]}>
                Calendar & Todos
              </Text>
              <Text style={[styles.pageSubtitle, { fontSize: isTablet ? 16 : 13 }]}>
                {view === 'month'
                  ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : 'All Years'}
              </Text>
            </View>

            <View style={[styles.controls, isTablet && styles.controlsTablet]}>
              {/* Month / Year toggle */}
              <View style={styles.toggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, view === 'month' && styles.toggleBtnActive]}
                  onPress={() => setView('month')}
                >
                  <Text style={[styles.toggleTxt, view === 'month' && styles.toggleTxtActive]}>
                    Month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, view === 'year' && styles.toggleBtnActive]}
                  onPress={() => setView('year')}
                >
                  <Text style={[styles.toggleTxt, view === 'year' && styles.toggleTxtActive]}>
                    Years
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month nav */}
              {view === 'month' && (
                <View style={styles.navRow}>
                  <TouchableOpacity
                    style={[styles.navBtn, isTablet && styles.navBtnTablet]}
                    onPress={() => changeMonth(-1)}
                  >
                    <Text style={[styles.navBtnTxt, { fontSize: isTablet ? 22 : 18 }]}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navBtn, isTablet && styles.navBtnTablet]}
                    onPress={() => setCurrentDate(new Date())}
                  >
                    <Text style={[styles.navBtnTxt, { fontSize: isTablet ? 14 : 12 }]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.navBtn, isTablet && styles.navBtnTablet]}
                    onPress={() => changeMonth(1)}
                  >
                    <Text style={[styles.navBtnTxt, { fontSize: isTablet ? 22 : 18 }]}>›</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ── Calendar / Year grid ── */}
          {view === 'month' ? (
            <MonthView currentDate={currentDate} onDateClick={handleDateClick} />
          ) : (
            <YearView onYearClick={handleYearClick} />
          )}
        </ScrollView>

        <TodoModal
          selectedDate={selectedDate}
          visible={showModal}
          onClose={() => setShowModal(false)}
          formatDate={formatDate}
        />
      </View>
    </SafeScreen>
    </BottomBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  pageHeader: { gap: 8 },
  pageHeaderTablet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageTitle: { fontWeight: '800', color: colors.text },
  pageSubtitle: { color: colors.textMid, marginTop: 2 },

  controls: { gap: 8 },
  controlsTablet: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.backgroundDeep,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleTxt: { fontSize: 13, fontWeight: '700', color: colors.textMid },
  toggleTxtActive: { color: '#fff' },

  navRow: { flexDirection: 'row', gap: 8 },
  navBtn: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.backgroundDeep,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  navBtnTablet: { paddingHorizontal: 16, paddingVertical: 8, minWidth: 52 },
  navBtnTxt: { fontWeight: '700', color: colors.text },

  // Calendar box
  calendarBox: {
    backgroundColor: '#e0d8cf',
    borderRadius: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    textAlign: 'center',
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Day cell
  dayCell: {
    borderWidth: 1.5,
    borderColor: colors.backgroundDeep,
    backgroundColor: '#f7f3ee',
  },
  dayCellToday: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.background,
  },
  dayCellTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  dayNum: { fontWeight: '700', color: colors.text },
  dayNumToday: { color: colors.primaryLight },
  dayStats: { color: colors.textMid, marginBottom: 3 },

  miniTrack: {
    height: 3,
    backgroundColor: colors.backgroundDeep,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniFill: {
    height: 3,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
  },

  // Year view
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearCard: {
    backgroundColor: '#e0d8cf',
    borderWidth: 1.5,
    borderColor: colors.backgroundDeep,
    marginBottom: 8,
  },
  yearLabel: { fontWeight: '800', color: colors.text, marginBottom: 4 },
  yearStats: { fontSize: 11, color: colors.textMid, marginBottom: 6 },
  yearEmpty: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
});