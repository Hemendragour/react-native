import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { C, MONTHS, DAYS } from '../data/mentorData';
import type { Service, CalendarData } from '../data/mentortypes';

// TODO: import AvailabilityService from '@/lib/api/availability.service';

interface CalendarStepProps {
  selectedService: Service | null;
  onBack: () => void;
  onContinue: (data: CalendarData) => void;
  mentorId: string;
}

const CalendarStep: React.FC<CalendarStepProps> = ({
  selectedService, onBack, onContinue, mentorId,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
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

  useEffect(() => {
    if (!mentorId) return;
    setLoadingAvail(true);
    // TODO: AvailabilityService.getAllAvailabilityFromDB({ limit: 100 })
    //   .then(res => { const all = res?.data ?? []; setAvailability(all.filter(a => a.mentorId === mentorId)); })
    //   .finally(() => setLoadingAvail(false));
    setLoadingAvail(false); // stub
  }, [mentorId]);

  useEffect(() => {
    if (!selectedDate) return;
    const d = new Date(year, month, selectedDate);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const matched = availability.find((a: any) => a.date.substring(0,10) === dateStr);
    if (matched) {
      setDaySlots(matched.slots);
      setSelectedAvailabilityId(matched.availabilityId);
      setNoAvailability(false);
    } else {
      setDaySlots([]); setSelectedAvailabilityId(''); setNoAvailability(true);
    }
  }, [selectedDate, availability, year, month]);

  useEffect(() => {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    setSelectedDate(isCurrentMonth ? today.getDate() : null);
    setSelectedTime(null);
  }, [year, month]);

  const availableSlots = daySlots.filter((s) => !s.isBooked && !s.isBlocked);

  return (
    <View className="flex-1 bg-[#fbf7f3]">
      {/* Back */}
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="flex-row items-center gap-x-2 px-5 py-4">
        <ChevronLeft size={18} color={C.mid} />
        <Text className="text-sm text-[#7a5c3e] font-medium">Back to Profile</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View className="bg-[#f3ece4] rounded-3xl p-5 border border-[#e0d8cf]">
          <Text className="text-lg font-black text-[#4a3728] mb-0.5">Select Date & Time</Text>
          <Text className="text-xs text-[#7a5c3e] mb-5">Booking: {selectedService?.title}</Text>

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
            {DAYS.map((d) => (
              <View key={d} className="flex-1 items-center">
                <Text className="text-[11px] font-semibold text-[#7a5c3e]">{d}</Text>
              </View>
            ))}
          </View>

          {/* Day Grid */}
          <View className="flex-row flex-wrap mb-5">
            {Array.from({ length: startingDay }).map((_, i) => (
              <View key={`e${i}`} style={{ width: `${100/7}%` }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(year, month, day); cellDate.setHours(0,0,0,0);
              const isPast = cellDate < todayStart;
              const isTd   = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSel  = selectedDate === day;
              return (
                <View key={day} style={{ width: `${100/7}%` }} className="p-0.5">
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

          {/* Time Slots */}
          {!selectedDate && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center mb-4">
              <Text className="text-sm font-bold text-[#4a3728] text-center">
                Please select a date to see available slots
              </Text>
            </View>
          )}

          {selectedDate && noAvailability && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center mb-4">
              <Text className="text-sm font-bold text-[#4a3728] text-center">
                No availability set for {MONTHS[month]} {selectedDate}, {year} by the mentor.
              </Text>
            </View>
          )}

          {selectedDate && !noAvailability && availableSlots.length === 0 && daySlots.length > 0 && (
            <View className="bg-[#fbf7f3] rounded-xl p-4 items-center mb-4">
              <Text className="text-sm font-bold text-[#4a3728] text-center">
                All slots for {MONTHS[month]} {selectedDate}, {year} are booked or blocked.
              </Text>
            </View>
          )}

          {selectedDate && !noAvailability && daySlots.length > 0 && (
            <>
              <Text className="font-bold text-[#4a3728] mb-1 text-sm">
                Available Slots: {availableSlots.length}
              </Text>
              {daySlots[0] && (
                <Text className="text-xs text-[#7a5c3e] mb-3">
                  {daySlots[0].startTime} – {daySlots[daySlots.length-1].endTime}
                </Text>
              )}
              <View className="flex-row flex-wrap gap-2 mb-4">
                {daySlots.map((slot) => {
                  const time = `${slot.startTime} - ${slot.endTime}`;
                  const isDisabled = slot.isBooked || slot.isBlocked;
                  const isSel = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => !isDisabled && setSelectedTime(time)}
                      disabled={isDisabled}
                      activeOpacity={0.8}
                      className={`px-3 py-2.5 rounded-xl border ${
                        isDisabled ? 'bg-gray-100 border-gray-200 opacity-50' :
                        isSel      ? 'bg-[#7a5c3e] border-[#7a5c3e]' :
                                     'bg-[#e0d8cf] border-[#e0d8cf]'
                      }`}
                    >
                      <Text className={`text-xs font-medium ${
                        isDisabled ? 'text-gray-400' :
                        isSel      ? 'text-white' :
                                     'text-[#4a3728]'
                      }`}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Continue */}
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