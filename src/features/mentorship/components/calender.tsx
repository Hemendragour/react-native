import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react-native';
import { C, MONTHS, DAYS } from '../data/mentorData';
import type { Service, CalendarData } from '../data/mentortypes';

import AvailabilityService from '../../../services/availability.service';
import SessionService from '../../../services/session.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CalendarStepProps {
  selectedService: Service | null;
  onBack: () => void;
  onContinue: (data: CalendarData) => void;
  mentorId: string;
  mentorData?: any;
}

// ── Helper: Parse Service Duration in Minutes ──────────────────────────────
const parseServiceDuration = (duration: any): number => {
  if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
    return duration;
  }
  if (typeof duration === 'string') {
    const matched = duration.match(/\d+/);
    if (matched) {
      const num = parseInt(matched[0], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return 30; // standard default
};

// ── Helper: Time conversion to/from minutes ─────────────────────────────────
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

const minutesToTime = (totalMinutes: number): string => {
  const norm = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const h = String(Math.floor(norm / 60)).padStart(2, '0');
  const m = String(norm % 60).padStart(2, '0');
  return `${h}:${m}`;
};

// ── Helper: Date Match Check ────────────────────────────────────────────────
const isSameDate = (dateVal: any, targetDateStr: string): boolean => {
  if (!dateVal) return false;
  if (typeof dateVal === 'string') {
    if (dateVal.startsWith(targetDateStr)) return true;
    if (dateVal.substring(0, 10) === targetDateStr) return true;
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (localStr === targetDateStr) return true;
    const utcStr = d.toISOString().substring(0, 10);
    if (utcStr === targetDateStr) return true;
  }
  return false;
};

// ── Helper: Extract All Taken / Booked Intervals for a Date ─────────────────
const getTakenIntervals = (
  dateStr: string,
  matchedRecord: any,
  mentorSessions: any[],
  cachedBookedSlots: any[] = []
): Array<{ start: number; end: number }> => {
  const taken: Array<{ start: number; end: number }> = [];

  const addInterval = (start: number, end: number) => {
    if (typeof start === 'number' && typeof end === 'number' && end > start) {
      if (!taken.some((t) => t.start === start && t.end === end)) {
        taken.push({ start, end });
      }
    }
  };

  const parseSlotTime = (item: any): { start: number; end: number } | null => {
    const slotStr = item?.slotTime || item?.timeSlot || item?.slot || '';
    if (typeof slotStr === 'string' && slotStr.includes('-')) {
      const [sT, eT] = slotStr.split('-').map((t: string) => t.trim());
      const start = timeToMinutes(sT);
      const end = timeToMinutes(eT);
      if (end > start) return { start, end };
    }
    if (item?.startTime && item?.endTime) {
      const start = timeToMinutes(item.startTime);
      const end = timeToMinutes(item.endTime);
      if (end > start) return { start, end };
    }
    if (item?.scheduledAt) {
      const d = new Date(item.scheduledAt);
      if (!isNaN(d.getTime())) {
        const start = d.getHours() * 60 + d.getMinutes();
        const dur = Number(item.duration) || 30;
        return { start, end: start + dur };
      }
    }
    return null;
  };

  // A. From Availability Record in DB (slots explicitly marked booked or blocked)
  if (matchedRecord && Array.isArray(matchedRecord.slots)) {
    matchedRecord.slots.forEach((s: any) => {
      const isBooked = s.isBooked === true || s.isBooked === 'true' || s.status === 'booked';
      const isBlocked = s.isBlocked === true || s.isBlocked === 'true' || s.status === 'blocked';
      if (isBooked || isBlocked || !!s.bookingId) {
        const start = timeToMinutes(s.startTime);
        const end = timeToMinutes(s.endTime);
        addInterval(start, end);
      }
    });
  }

  // B. From Locally Cached Booked Slots in AsyncStorage (instant reflection on same device)
  if (Array.isArray(cachedBookedSlots)) {
    cachedBookedSlots.forEach((c: any) => {
      if (isSameDate(c.date, dateStr)) {
        const parsed = parseSlotTime(c);
        if (parsed) addInterval(parsed.start, parsed.end);
      }
    });
  }

  // C. From all mentor sessions / bookings in DB (any service that booked a slot on this day)
  if (Array.isArray(mentorSessions)) {
    mentorSessions.forEach((s: any) => {
      // 1. Check s.bookings array
      if (Array.isArray(s.bookings)) {
        s.bookings.forEach((b: any) => {
          if (b.status === 'cancelled' || b.status === 'rejected') return;
          if (isSameDate(b.scheduledAt || b.date, dateStr)) {
            const parsed = parseSlotTime(b);
            if (parsed) addInterval(parsed.start, parsed.end);
          }
        });
      }

      // 2. Check s.attendees (group sessions)
      if (Array.isArray(s.attendees) && s.attendees.length > 0) {
        if (s.status !== 'cancelled' && s.status !== 'rejected') {
          if (isSameDate(s.scheduledAt || s.startDate || s.date, dateStr)) {
            const parsed = parseSlotTime(s);
            if (parsed) addInterval(parsed.start, parsed.end);
          }
        }
      }

      // 3. Direct scheduled sessions (when session status is not cancelled/rejected)
      if (s.status !== 'cancelled' && s.status !== 'rejected') {
        const hasBookingIndications =
          s.status === 'confirmed' ||
          s.status === 'scheduled' ||
          s.status === 'booked' ||
          s.status === 'pending' ||
          s.menteeId ||
          s.userId ||
          s.client ||
          s.bookingId ||
          (s.slotTime && s.scheduledAt);

        if (hasBookingIndications && isSameDate(s.scheduledAt || s.date || s.startDate, dateStr)) {
          const parsed = parseSlotTime(s);
          if (parsed) addInterval(parsed.start, parsed.end);
        }
      }
    });
  }

  return taken;
};

// ── Helper: Carve Taken Intervals out of Available Windows ──────────────────
const carveWindows = (
  windows: Array<{ start: number; end: number }>,
  taken: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> => {
  let result = [...windows];

  for (const t of taken) {
    const nextResult: Array<{ start: number; end: number }> = [];
    for (const w of result) {
      if (t.end <= w.start || t.start >= w.end) {
        // No overlap: keep window intact
        nextResult.push(w);
      } else {
        // Overlap: carve out [t.start, t.end] from [w.start, w.end]
        if (w.start < t.start) {
          nextResult.push({ start: w.start, end: t.start });
        }
        if (w.end > t.end) {
          nextResult.push({ start: t.end, end: w.end });
        }
      }
    }
    result = nextResult;
  }

  return result.filter((w) => w.end > w.start);
};

const CalendarStep: React.FC<CalendarStepProps> = ({
  selectedService, onBack, onContinue, mentorId, mentorData,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [mentorSessions, setMentorSessions] = useState<any[]>([]);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [noAvailability, setNoAvailability] = useState(false);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState('');
  const [loadingAvail, setLoadingAvail] = useState(false);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const startingDay  = new Date(year, month, 1).getDay();
  const today        = new Date();
  const todayStart   = new Date(); todayStart.setHours(0, 0, 0, 0);

  const serviceDurationMins = parseServiceDuration(selectedService?.duration);

  const [cachedSchedule, setCachedSchedule] = useState<any[] | null>(null);
  const [cachedBookedSlots, setCachedBookedSlots] = useState<any[]>([]);

  // Load cached weekly schedule from AsyncStorage
  useEffect(() => {
    if (!mentorId) return;
    AsyncStorage.getItem(`@throne8_mentor_schedule_${mentorId}`)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCachedSchedule(parsed);
            }
          } catch (_) {}
        }
      })
      .catch(() => {});
  }, [mentorId]);

  // Load cached booked slots from AsyncStorage for instant multi-service exclusion
  const loadCachedBookedSlots = () => {
    if (!mentorId) return;
    AsyncStorage.getItem(`@throne8_booked_slots_${mentorId}`)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              setCachedBookedSlots(parsed);
            }
          } catch (_) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCachedBookedSlots();
  }, [mentorId, selectedDate]);

  // Fetch Mentor's Availability Records AND Booked Sessions
  useEffect(() => {
    if (!mentorId) return;
    setLoadingAvail(true);

    Promise.all([
      AvailabilityService.getMentorAvailability(mentorId).catch((err) => {
        console.warn('Failed to fetch mentor availability:', err?.message || err);
        return { data: { availabilities: [] } };
      }),
      SessionService.getMentorSessions(mentorId).catch((err) => {
        console.warn('Failed to fetch mentor sessions:', err?.message || err);
        return { data: [] };
      }),
      SessionService.getAllSessions({ role: 'mentor' }).catch(() => ({ data: [] })),
    ])
      .then(([availRes, sessionsRes, allSessionsRes]) => {
        const avails = availRes?.data?.availabilities ?? [];
        setAvailability(avails);

        const extractSessions = (res: any): any[] => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data?.sessions)) return res.data.sessions;
          if (Array.isArray(res.data?.data)) return res.data.data;
          if (Array.isArray(res.sessions)) return res.sessions;
          return [];
        };

        const sess = [
          ...extractSessions(sessionsRes),
          ...extractSessions(allSessionsRes),
        ];
        setMentorSessions(sess);
      })
      .finally(() => setLoadingAvail(false));
  }, [mentorId]);

  // If selectedService has a scheduledAt date, initialize calendar to that date if future
  useEffect(() => {
    if (selectedService?.scheduledAt) {
      const sDate = new Date(selectedService.scheduledAt);
      if (!isNaN(sDate.getTime()) && sDate.getTime() >= todayStart.getTime()) {
        setCurrentMonth(new Date(sDate.getFullYear(), sDate.getMonth(), 1));
        setSelectedDate(sDate.getDate());
      }
    }
  }, [selectedService]);

  // Set default selection to today if current month and none selected
  useEffect(() => {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    if (!selectedDate && isCurrentMonth) {
      setSelectedDate(today.getDate());
    }
  }, [year, month]);

  // Dynamic Time Slots Generation: Connected to Service Duration & Excluding Taken Slots
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime(null);

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const selectedDateObj = new Date(year, month, selectedDate);
    const dayOfWeekName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 1. Check if an explicit AvailabilityRecord exists for this date in DB
    const matched = availability.find((a: any) => {
      const dbDate = new Date(a.date);
      const dbDateStr = `${dbDate.getFullYear()}-${String(dbDate.getMonth() + 1).padStart(2, '0')}-${String(dbDate.getDate()).padStart(2, '0')}`;
      const dbUTCStr = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
      return dbDateStr === dateStr || dbUTCStr === dateStr;
    });

    if (matched?.isDateBlocked) {
      setDaySlots([]);
      setSelectedAvailabilityId(matched.availabilityId || matched._id || '');
      setNoAvailability(true);
      return;
    }

    // 2. Determine base available windows for this date
    let rawWindows: Array<{ start: number; end: number }> = [];

    // A. Resolve mentor profile weekly schedule for this day of week
    const profileAvail = mentorData?.availability;
    const weeklySched = profileAvail?.weeklySchedule || profileAvail?.schedule || cachedSchedule;
    const daySched = Array.isArray(weeklySched)
      ? weeklySched.find((d: any) => d.day?.toLowerCase() === dayOfWeekName)
      : null;

    const daysAvailable = profileAvail?.daysAvailable;
    if (Array.isArray(daysAvailable) && daysAvailable.length > 0) {
      const isDayAvailable = daysAvailable.map((d: string) => d.toLowerCase()).includes(dayOfWeekName);
      if (!isDayAvailable) {
        setDaySlots([]);
        setSelectedAvailabilityId('unavailable');
        setNoAvailability(true);
        return;
      }
    }

    if (daySched && daySched.enabled === false) {
      setDaySlots([]);
      setSelectedAvailabilityId('unavailable');
      setNoAvailability(true);
      return;
    }

    let weeklyWindows: Array<{ start: number; end: number }> = [];
    if (daySched && Array.isArray(daySched.slots) && daySched.slots.length > 0) {
      weeklyWindows = daySched.slots
        .filter((s: any) => !s.isBlocked)
        .map((s: any) => ({
          start: timeToMinutes(s.startTime),
          end: timeToMinutes(s.endTime),
        }))
        .filter((w: any) => w.end > w.start);
    } else {
      const prefStart = profileAvail?.preferredHours?.start || '09:00';
      const prefEnd = profileAvail?.preferredHours?.end || '17:00';
      weeklyWindows = [{
        start: timeToMinutes(prefStart),
        end: timeToMinutes(prefEnd),
      }];
    }

    // B. Include any slots from matched DB record (e.g. from existing custom date availability)
    let matchedWindows: Array<{ start: number; end: number }> = [];
    if (matched && Array.isArray(matched.slots) && matched.slots.length > 0) {
      matchedWindows = matched.slots
        .filter((s: any) => !s.isBlocked && !s.isBooked && !s.bookingId && s.status !== 'booked')
        .map((s: any) => ({
          start: timeToMinutes(s.startTime),
          end: timeToMinutes(s.endTime),
        }))
        .filter((w: any) => w.end > w.start);
      setSelectedAvailabilityId(matched.availabilityId || matched._id || '');
    } else {
      setSelectedAvailabilityId(matched?.availabilityId || 'default');
    }

    // Combine base weekly schedule with matched windows so the mentor's full day hours remain available for all services!
    rawWindows = [...weeklyWindows, ...matchedWindows];

    if (rawWindows.length === 0) {
      setDaySlots([]);
      setNoAvailability(true);
      return;
    }

    // 3. Merge contiguous available windows (e.g. 09:00-10:00 and 10:00-11:00 -> 09:00-11:00)
    rawWindows.sort((a, b) => a.start - b.start);
    const mergedWindows: Array<{ start: number; end: number }> = [];
    for (const win of rawWindows) {
      if (mergedWindows.length === 0) {
        mergedWindows.push({ ...win });
      } else {
        const last = mergedWindows[mergedWindows.length - 1];
        if (win.start <= last.end) {
          last.end = Math.max(last.end, win.end);
        } else {
          mergedWindows.push({ ...win });
        }
      }
    }

    // 4. Get all taken / booked intervals on this date (by ANY service)
    const takenIntervals = getTakenIntervals(dateStr, matched, mentorSessions, cachedBookedSlots);

    // 5. Carve taken intervals out of available windows so occupied times are completely subtracted
    const freeWindows = carveWindows(mergedWindows, takenIntervals);

    // 6. Chunk free windows into slots of service duration (e.g. 15m, 30m, 45m, 60m)
    const generatedSlots: Array<{
      startTime: string;
      endTime: string;
      isBooked: boolean;
      isBlocked: boolean;
    }> = [];

    const isToday =
      today.getDate() === selectedDate &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    mergedWindows.forEach((win) => {
      let cur = win.start;
      while (cur + serviceDurationMins <= win.end) {
        const slotStart = cur;
        const slotEnd = cur + serviceDurationMins;

        // Check if this slot overlaps with any booked/taken slot
        const isTaken = takenIntervals.some((taken) => {
          return slotStart < taken.end && slotEnd > taken.start;
        });

        // Expired check for today
        const isPastToday = isToday && slotStart <= nowMinutes;

        // Show all day's slots, clearly marking booked ones
        if (!isPastToday) {
          generatedSlots.push({
            startTime: minutesToTime(slotStart),
            endTime: minutesToTime(slotEnd),
            isBooked: isTaken,
            isBlocked: false,
          });
        }

        // Advance by service duration (e.g., 15 min, 30 min, 45 min)
        cur += serviceDurationMins;
      }
    });

    setDaySlots(generatedSlots);
    setNoAvailability(generatedSlots.length === 0);
  }, [selectedDate, availability, mentorSessions, cachedBookedSlots, year, month, selectedService, mentorData, serviceDurationMins]);

  return (
    <View className="flex-1 bg-[#fbf7f3]">
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="flex-row items-center gap-x-2 px-5 py-4">
        <ChevronLeft size={18} color={C.mid} />
        <Text className="text-sm text-[#7a5c3e] font-medium">Back to Profile</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf]">
          <Text className="text-lg font-black text-[#4a3728] mb-0.5">Select Date & Time</Text>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xs text-[#7a5c3e] flex-1 mr-2" numberOfLines={1}>
              Booking: {selectedService?.title || 'Mentorship Session'}
            </Text>
            <View className="bg-[#FAF8F5] border border-[#e0d8cf] px-2.5 py-1 rounded-full flex-row items-center gap-1">
              <Clock size={11} color="#7a5c3e" />
              <Text className="text-[10px] font-black text-[#7a5c3e]">{serviceDurationMins} Min</Text>
            </View>
          </View>

          {/* Month Nav */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(year, month - 1))}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-lg bg-[#fbf7f3] border border-[#e0d8cf] items-center justify-center"
            >
              <ChevronLeft size={18} color={C.dark} />
            </TouchableOpacity>
            <Text className="font-bold text-[#4a3728] text-base">{MONTHS[month]} {year}</Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(year, month + 1))}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-lg bg-[#fbf7f3] border border-[#e0d8cf] items-center justify-center"
            >
              <ChevronRight size={18} color={C.dark} />
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View className="flex-row mb-2">
            {DAYS.map((d, i) => (
              <View key={`day-label-${d}-${i}`} className="flex-1 items-center">
                <Text className="text-[11px] font-semibold text-[#7a5c3e]">{d}</Text>
              </View>
            ))}
          </View>

          {/* Day Grid */}
          <View className="flex-row flex-wrap mb-5">
            {Array.from({ length: startingDay }).map((_, i) => (
              <View key={`e${i}`} style={{ width: `${100 / 7}%` }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(year, month, day); cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate < todayStart;
              const isTd   = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSel  = selectedDate === day;
              return (
                <View key={day} style={{ width: `${100 / 7}%` }} className="p-0.5">
                  <TouchableOpacity
                    onPress={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    activeOpacity={0.8}
                    className={`aspect-square rounded-lg items-center justify-center ${
                      isPast ? 'bg-gray-100' :
                      isSel  ? 'bg-[#7a5c3e]' :
                      isTd   ? 'bg-[#e0d8cf]' :
                               'bg-[#fbf7f3]'
                    } border ${isTd && !isSel ? 'border-[#7a5c3e]' : 'border-[#e0d8cf]'}`}
                  >
                    <Text className={`text-xs font-medium ${
                      isPast ? 'text-gray-300' :
                      isSel  ? 'text-white' :
                               'text-[#4a3728]'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Loading Indicator */}
          {loadingAvail && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center justify-center flex-row gap-2 mb-4">
              <ActivityIndicator size="small" color="#7a5c3e" />
              <Text className="text-xs text-[#7a5c3e] font-semibold">Loading available slots...</Text>
            </View>
          )}

          {/* No Date Selected State */}
          {!selectedDate && !loadingAvail && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center mb-4">
              <Text className="text-sm font-bold text-[#4a3728] text-center">
                Please select a date to see available {serviceDurationMins}-min slots
              </Text>
            </View>
          )}

          {/* No Slots Available State */}
          {selectedDate && noAvailability && !loadingAvail && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center mb-4">
              <Text className="text-sm font-bold text-[#4a3728] text-center">
                No slots available for {MONTHS[month]} {selectedDate}, {year} ({serviceDurationMins} min service).
              </Text>
              <Text className="text-xs text-[#8a7a6a] mt-1 text-center">
                All slots are booked, unavailable, or have already passed.
              </Text>
            </View>
          )}

          {/* Time Slots Grid (All day slots shown, booked slots clearly indicated) */}
          {selectedDate && !noAvailability && daySlots.length > 0 && !loadingAvail && (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-[#4a3728] text-sm">
                  {serviceDurationMins}-Min Slots ({daySlots.filter((s) => !s.isBooked).length} Available)
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Text className="text-[10px] text-[#7a5c3e] font-medium">Open</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <View className="w-2 h-2 rounded-full bg-amber-500" />
                    <Text className="text-[10px] text-[#7a5c3e] font-medium">Booked</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2 mb-4">
                {daySlots.map((slot, sIdx) => {
                  const time = `${slot.startTime} - ${slot.endTime}`;
                  const isSel = selectedTime === time;
                  const isBooked = slot.isBooked;

                  return (
                    <TouchableOpacity
                      key={`slot-${time}-${sIdx}`}
                      onPress={() => !isBooked && setSelectedTime(time)}
                      disabled={isBooked}
                      activeOpacity={0.8}
                      className={`px-3 py-2.5 rounded-xl border flex-row items-center gap-1.5 ${
                        isBooked
                          ? 'bg-[#f0ebe4] border-[#dcd1c4] opacity-75'
                          : isSel
                          ? 'bg-[#7a5c3e] border-[#7a5c3e]'
                          : 'bg-[#FAF8F5] border-[#e0d8cf]'
                      }`}
                    >
                      {isBooked && <Lock size={11} color="#92400e" />}
                      <Text
                        className={`text-xs font-bold ${
                          isBooked
                            ? 'text-[#8a7a6a]'
                            : isSel
                            ? 'text-white'
                            : 'text-[#4a3728]'
                        }`}
                      >
                        {time}
                      </Text>
                      {isBooked && (
                        <View className="bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200">
                          <Text className="text-[9px] font-black text-amber-800 uppercase">
                            Booked
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Continue Button */}
          {selectedDate && selectedTime && (
            <TouchableOpacity
              onPress={() => onContinue({
                selectedDate: selectedDate!,
                selectedTime: selectedTime!,
                currentMonth,
                availabilityId: selectedAvailabilityId,
                slotTime: selectedTime!,
              })}
              activeOpacity={0.85}
              className="w-full py-4 bg-[#4a3728] rounded-2xl items-center shadow-md"
            >
              <Text className="text-white font-bold text-sm">Continue to Details →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarStep;