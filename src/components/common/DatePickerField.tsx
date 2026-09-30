import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Svg, { Path, Rect } from 'react-native-svg';

const CalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="4" stroke="#6b5038" strokeWidth={1.8} />
    <Path d="M3 10h18" stroke="#6b5038" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M8 2v4M16 2v4" stroke="#6b5038" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseISODate = (dateStr?: string | null): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export interface DatePickerFieldProps {
  label?: string;
  value?: string | null;
  onChange: (dateString: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  containerClassName?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  disabledMessage,
  error,
  maximumDate,
  minimumDate,
  containerClassName = '',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => parseISODate(value));

  const handleOpen = () => {
    if (disabled) return;
    setTempDate(parseISODate(value));
    setShowPicker(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      onChange(formatDateToISO(selectedDate));
    }
  };

  const handleIOSConfirm = () => {
    setShowPicker(false);
    onChange(formatDateToISO(tempDate));
  };

  const formattedDisplay = value
    ? (() => {
        try {
          const d = parseISODate(value);
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          return value;
        }
      })()
    : '';

  return (
    <View className={`mb-3.5 ${containerClassName}`}>
      {label && (
        <Text className="text-xs font-semibold text-[#6b5038] mb-1.5">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between px-3.5 py-3 rounded-xl border bg-white ${
          error
            ? 'border-red-400'
            : disabled
            ? 'border-[#d4c4b5]/40 bg-[#f7f4f0]/60 opacity-60'
            : 'border-[#d4c4b5]'
        }`}
      >
        <Text
          className={`text-sm ${
            value ? 'text-[#4a3728] font-medium' : 'text-[#a08060]'
          }`}
        >
          {formattedDisplay || placeholder}
        </Text>
        <CalendarIcon />
      </TouchableOpacity>

      {disabled && disabledMessage ? (
        <Text className="text-gray-400 text-xs mt-1">{disabledMessage}</Text>
      ) : null}

      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}

      {/* Android Picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={parseISODate(value)}
          mode="date"
          display="calendar"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS Modal Picker */}
      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showPicker}>
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-3xl p-5 pb-8 border-t border-[#d4c4b5]">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text className="text-sm font-semibold text-gray-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-base font-bold text-[#4a3728]">
                  {label || 'Select Date'}
                </Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text className="text-sm font-bold text-[#8b6914]">Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={(_event, date) => date && setTempDate(date)}
                textColor="#4a3728"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DatePickerField;
