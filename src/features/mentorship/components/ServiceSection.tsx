import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image
} from 'react-native';
import { C, SESSION_TYPE_FILTER, SESSION_TYPE_LABEL } from '../data/mentorData';
import type { Service } from '../data/mentortypes';

import SessionService from '../../../services/session.service';

interface ServicesSectionProps {
  onServiceClick: (service: Service) => void;
  mentorId: string;
  bookedSessionIds: string[];
  currentUserId: string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  onServiceClick, mentorId, bookedSessionIds, currentUserId,
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mentorId) { setLoading(false); return; }
    SessionService.getMentorSessions(mentorId)
      .then(res => setSessions((res.data || []).filter((s: any) => s.status !== 'deleted' && s.status !== 'cancelled')))
      .catch(err => console.error("Failed to fetch services", err))
      .finally(() => setLoading(false));
  }, [mentorId]);

  const uniqueTypes = Array.from(new Set(sessions.map((s) => s.sessionType)));
  const dynamicFilters = ['All', ...uniqueTypes.map((t) => SESSION_TYPE_FILTER[t] || t)];

  const filtered = activeFilter === 'All'
    ? sessions
    : sessions.filter((s) => (SESSION_TYPE_FILTER[s.sessionType] || s.sessionType) === activeFilter);

  const getServiceFromSession = (session: any): Service => ({
    id: session.sessionId || session._id || session.id || '',
    type: SESSION_TYPE_LABEL[session.sessionType] || '1:1 Call',
    title: session.title,
    duration: `${session.duration || 30} Min`,
    originalPrice: null,
    price: session.pricing?.basePrice === 0 ? 'Free' : (session.pricing?.basePrice ?? session.price ?? 0),
    pricing: session.pricing,
    popular: false,
  });

  return (
    <View className="bg-[#f3ece4] rounded-3xl p-5 mb-4 border border-[#e0d8cf]">
      <Text className="text-lg font-black text-[#4a3728] mb-0.5">Available Services</Text>
      <Text className="text-xs text-[#7a5c3e] mb-4">Discover our mentorship offerings designed for your success</Text>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-x-2 pr-2">
          {dynamicFilters.map((f, i) => (
            <TouchableOpacity
              key={`filter-${f}-${i}`}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-full ${activeFilter === f ? 'bg-[#4a3728]' : 'bg-[#e0d8cf]'}`}
            >
              <Text className={`text-xs font-semibold ${activeFilter === f ? 'text-white' : 'text-[#4a3728]'}`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Loading */}
      {loading && (
        <View className="items-center py-10 gap-y-3">
          <ActivityIndicator size="large" color={C.dark} />
          <Text className="text-xs text-[#7a5c3e]">Fetching sessions...</Text>
        </View>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <View className="items-center py-8">
          <Text className="text-sm text-[#7a5c3e]">No sessions available for this filter.</Text>
        </View>
      )}

      {/* Session Cards — 2-column grid */}
      {!loading && filtered.length > 0 && (
        <View className="flex-row flex-wrap gap-3">
          {filtered.map((session, idx) => {
            const svc = getServiceFromSession(session);
            const myBooking = session.bookings?.find((b: any) => b.menteeId === currentUserId);
            const isPending   = myBooking?.status === 'pending';
            const isConfirmed = myBooking?.status === 'confirmed';
            const isBooked    = isPending || isConfirmed;
            const isGroup     = session.sessionType === 'group_session';

            return (
              <View
                key={`svc-session-${session.sessionId || session._id || session.id || idx}-${idx}`}
                className={`w-[47%] bg-[#fbf7f3] border border-[#e0d8cf] rounded-2xl p-4 ${isBooked ? 'opacity-70' : ''}`}
              >
                {/* Thumbnail */}
                {session.thumbnailImage && (
                  <View className="w-full h-24 rounded-xl overflow-hidden mb-3 border border-[#e0d8cf]">
                    <Image source={{ uri: session.thumbnailImage }} className="w-full h-full" resizeMode="cover" />
                  </View>
                )}

                {/* Type badge */}
                <View className="flex-row items-center gap-x-1.5 mb-2">
                  <Text className="text-base">{isGroup ? '👥' : '📞'}</Text>
                  <View className="bg-[#e0d8cf] px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-semibold text-[#4a3728]">
                      {SESSION_TYPE_FILTER[session.sessionType] || session.sessionType}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text className="font-bold text-[#4a3728] text-xs mb-1.5 leading-4" numberOfLines={2}>
                  {session.title}
                </Text>

                {/* Description */}
                {session.description && (
                  <Text className="text-[11px] text-[#7a5c3e] mb-1.5 leading-4" numberOfLines={2}>
                    {session.description}
                  </Text>
                )}

                {/* Duration */}
                <View className="flex-row items-center gap-x-1 mb-3">
                  <Text className="text-[10px]">🕐</Text>
                  <Text className="text-[11px] text-[#7a5c3e]">
                    {session.duration || 30} Min
                  </Text>
                </View>

                {/* Price + Action */}
                <View className="flex-row items-center justify-between">
                  <Text className={`font-bold text-sm ${session.pricing?.basePrice === 0 ? 'text-green-600' : 'text-[#4a3728]'}`}>
                    {session.pricing?.basePrice === 0 ? 'Free' : `₹${session.pricing?.basePrice ?? session.price ?? 0}`}
                  </Text>

                  {isBooked ? (
                    <View>
                      <Text className="text-[10px] font-bold text-green-600">
                        {isConfirmed ? '✅ Confirmed' : '✅ Booked'}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onServiceClick(svc)}
                      activeOpacity={0.85}
                      className="bg-[#4a3728] px-3.5 py-1.5 rounded-xl shadow-xs"
                    >
                      <Text className="text-white text-xs font-bold">Book</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ServicesSection;