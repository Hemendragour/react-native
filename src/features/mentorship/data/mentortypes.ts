export interface Service {
  id: string;
  type: '1:1 Call' | 'Resource' | 'Group' | string;
  title: string;
  duration: string;
  originalPrice: number | null;
  price: number | 'Free';
  pricing?: any;
  popular?: boolean;
  scheduledAt?: string;
}

export interface CalendarData {
  selectedDate: number;
  selectedTime: string;
  currentMonth: Date;
  availabilityId: string;
  slotTime: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  referralCode: string;
}

export type BookingStep = null | 'calendar' | 'details' | 'payment' | 'confirmation';