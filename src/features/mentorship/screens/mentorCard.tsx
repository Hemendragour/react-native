import React, { useEffect, useState } from 'react';
import {
  View, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Text,
} from 'react-native';
import { C } from '../data/mentorData';
import type { BookingStep, Service, CalendarData, FormData } from '../data/mentortypes';
import MentorSidebar from '../components/mentorSidebar';
import ServicesSection from '../components/ServiceSection';
import ReviewsSection from '../components/revierSession';
import CalendarStep from '../components/calender';
import DetailsStep from '../components/detailStep';
import PaymentStep from '../components/paymentStep';
import ConfirmationStep from '../components/confirmationStep';
import BottomBar from '../../../shared/components/BottomBar';

// TODO: import MentorService from '@/lib/api/mentorship.service';
// TODO: import { useAuth } from '@/hooks/useAuth';

interface MentorProfileScreenProps {
  mentorId: string;
}

const MentorProfileScreen: React.FC<MentorProfileScreenProps> = ({ mentorId }) => {
  // TODO: const { user } = useAuth();
  const [bookingStep, setBookingStep] = useState<BookingStep>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [bookedSessionIds, setBookedSessionIds] = useState<string[]>([]);

  useEffect(() => {
    // TODO: MentorService.getAllMentors()
    //   .then(res => { const found = res?.data?.find(m => m.mentorId === mentorId) ?? null; setMentorData(found); })
    //   .finally(() => setLoadingMentor(false));
    setLoadingMentor(false); // stub
  }, [mentorId]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setBookingStep(
      service.type === 'Resource' || service.price === 'Free' ? 'confirmation' : 'calendar'
    );
  };

  const resetBooking = () => {
    setBookingStep(null);
    setSelectedService(null);
    setCalendarData(null);
    setFormData(null);
  };

  // ── Booking Steps ──────────────────────────────────────────────────────────
  if (bookingStep === 'calendar') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <CalendarStep
          mentorId={mentorData?.mentorId || ''}
          selectedService={selectedService}
          onBack={() => setBookingStep(null)}
          onContinue={(d) => { setCalendarData(d); setBookingStep('details'); }}
        />
      </SafeAreaView>
    );
  }

  if (bookingStep === 'details') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <DetailsStep
          selectedService={selectedService}
          calendarData={calendarData!}
          onBack={() => setBookingStep('calendar')}
          onContinue={(d) => { setFormData(d); setBookingStep('payment'); }}
        />
      </SafeAreaView>
    );
  }

  if (bookingStep === 'payment') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <PaymentStep
          selectedService={selectedService}
          calendarData={calendarData!}
          formData={formData!}
          mentorId={mentorData?.mentorId || ''}
          onBack={() => setBookingStep('details')}
          onConfirm={() => setBookingStep('confirmation')}
          onBookingSuccess={() => {
            if (selectedService?.id) {
              setBookedSessionIds((prev) => [...prev, String(selectedService.id)]);
            }
            resetBooking();
          }}
        />
      </SafeAreaView>
    );
  }

  if (bookingStep === 'confirmation') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <ConfirmationStep
          selectedService={selectedService}
          calendarData={calendarData}
          formData={formData}
          onReset={resetBooking}
        />
      </SafeAreaView>
    );
  }

  // ── Main Profile View ──────────────────────────────────────────────────────
  return (
    <BottomBar>
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {loadingMentor ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={C.dark} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Sidebar (full-width on mobile — same content, stacked) */}
          <MentorSidebar mentorData={mentorData} />

          {/* Services */}
          <ServicesSection
            onServiceClick={handleServiceClick}
            mentorId={mentorData?.mentorId || ''}
            bookedSessionIds={bookedSessionIds}
            currentUserId={''}  // TODO: replace with user?.userId
          />

          {/* Reviews */}
          <ReviewsSection />
        </ScrollView>
      )}
    </SafeAreaView>
    </BottomBar>
  );
};

export default MentorProfileScreen;