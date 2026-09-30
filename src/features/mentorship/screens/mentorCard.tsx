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

import MentorshipService from '../../../services/mentorship.service';
import { api } from '../../../services/auth.service';
import { useAppSelector } from '../../../store/hooks';

interface MentorProfileScreenProps {
  mentorId?: string;
  route?: any;
}

const MentorProfileScreen: React.FC<MentorProfileScreenProps> = ({ mentorId: directMentorId, route }) => {
  const mentorId = directMentorId || route?.params?.mentorId;
  const currentUserId = useAppSelector(state => state.profile.data?.userId || (state.profile.data as any)?._id || (state.profile.data as any)?.id);
  const currentAuthUser = useAppSelector(state => (state as any).auth?.user);
  const authUserId = currentAuthUser?.userId || currentAuthUser?._id || currentAuthUser?.id;
  const effectiveUserId = currentUserId || authUserId;

  const [bookingStep, setBookingStep] = useState<BookingStep>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [bookedSessionIds, setBookedSessionIds] = useState<string[]>([]);

  const isOwner = Boolean(
    effectiveUserId && (
      mentorData?.userId === effectiveUserId ||
      mentorData?.mentorId === effectiveUserId ||
      mentorData?._id === effectiveUserId ||
      mentorData?.user?._id === effectiveUserId ||
      mentorData?.user?.userId === effectiveUserId ||
      mentorData?.user?.id === effectiveUserId ||
      mentorId === effectiveUserId
    )
  );

  useEffect(() => {
    if (!mentorId) {
      setLoadingMentor(false);
      return;
    }
    setLoadingMentor(true);
    MentorshipService.getMentorProfile(mentorId)
      .then(res => {
        if (res) {
          setMentorData(res);
        }
      })
      .catch(async (err) => {
        try {
          // Fallback: Fetch user details if not yet a registered mentor
          const userRes = await api.get(`/api/v1/auth/get-user/${mentorId}`).catch(() => null);
          const userData = userRes?.data?.data || userRes?.data;
          if (userData) {
            setMentorData({
              mentorId,
              userId: userData.userId || userData._id || mentorId,
              title: userData.headline || 'Community Member',
              bio: userData.bio || 'Active peer in Throne8 mentorship and discussions community.',
              profilePic: userData.profileImage || userData.avatar || null,
              rating: 5.0,
              stats: {
                averageRating: 5.0,
                totalSessions: 0,
                completionRate: 100,
                responseTime: 1,
              },
              user: {
                fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username || 'Community Peer',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                profileImage: userData.profileImage || userData.avatar || null,
              },
              domains: ['Community Peer'],
              skills: ['Mentee & Collaborator'],
              isPeerProfile: true,
            });
            return;
          }
        } catch {
          // ignore
        }
        console.warn("Failed to load mentor profile:", err?.message || err);
      })
      .finally(() => {
        setLoadingMentor(false);
      });
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
          mentorId={mentorData?.mentorId || mentorId || ''}
          mentorData={mentorData}
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
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          >
            {/* Sidebar (full-width on mobile — same content, stacked) */}
            <MentorSidebar mentorData={mentorData} isOwner={isOwner} />

            {/* Services */}
            <ServicesSection
              onServiceClick={handleServiceClick}
              mentorId={mentorData?.mentorId || ''}
              bookedSessionIds={bookedSessionIds}
              currentUserId={currentUserId || ''}
            />

            {/* Reviews */}
            <ReviewsSection mentorData={mentorData} mentorId={mentorId} />
          </ScrollView>
        )}
      </SafeAreaView>
    </BottomBar>
  );
};

export default MentorProfileScreen;