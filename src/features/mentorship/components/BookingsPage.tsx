import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {
  Calendar,
  Search,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  ChevronRight,
  FileText,
  TrendingUp,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Card } from './SharedUI';
import SessionService from '../../../services/session.service';

export interface BookingsPageProps {
  sessions: any[];
  currentUserId?: string;
  loadingAction?: string | null;
  onConfirm?: (booking: any) => void;
  onStart?: (booking: any) => void;
  onComplete?: (booking: any, duration: number) => void;
  onCancel?: (booking: any, reason: string) => void;
  onReschedule?: (booking: any, date: Date, reason: string) => void;
}

const BookingsPage: React.FC<BookingsPageProps> = ({
  sessions = [],
  currentUserId,
  loadingAction = null,
  onConfirm,
  onStart,
  onComplete,
  onCancel,
  onReschedule,
}) => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState<'complete' | 'cancel' | 'reschedule' | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [refundEstimate, setRefundEstimate] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time' | 'datetime'>(Platform.OS === 'ios' ? 'datetime' : 'date');


  const allBookings = useMemo(() => {
    return sessions.flatMap((s: any) => {
      // 1. Group session attendees
      if (s.attendees && s.attendees.length > 0) {
        return s.attendees.map((att: any, attIdx: number) => {
          const menteeId = att.userId?._id || att.userId?.id || (typeof att.userId === 'string' ? att.userId : att._id || `att-${attIdx}`);
          const menteeName = att.user?.fullName || att.user?.name || att.fullName || att.name || (typeof att.userId === 'object' ? att.userId.fullName || att.userId.name : '') || 'Student';
          const menteeProfilePhoto = att.user?.profilePic || att.user?.avatar || att.avatar || att.profilePhoto || (typeof att.userId === 'object' ? att.userId.profilePic || att.userId.avatar : '') || '';
          const menteeEmail = att.user?.email || att.email || (typeof att.userId === 'object' ? att.userId.email : '') || '';
          const bookingStatus = att.status || (s.status !== 'available' ? s.status : 'confirmed');
          return {
            ...att,
            bookingId: att._id || `att-${s._id || s.sessionId}-${attIdx}`,
            sessionId: s.sessionId || s._id,
            sessionStatus: s.status,
            sessionTitle: s.title || s.topic || 'Group Masterclass',
            sessionType: s.sessionType || 'group_session',
            duration: s.duration || 60,
            scheduledAt: att.joinedAt || s.startDate || s.scheduledAt,
            sessionScheduledAt: s.startDate || s.scheduledAt,
            slotTime: s.slotTime || '',
            status: bookingStatus,
            menteeId,
            menteeName,
            menteeEmail,
            menteeProfilePhoto,
            mentorName: s.mentorName,
            mentorProfilePhoto: s.mentorProfilePhoto,
            pricing: s.pricing || (s.price !== undefined ? { basePrice: s.price, totalAmount: s.price } : {}),
            payment: att.payment || { status: att.paymentStatus || 'completed' },
            isGroupAttendee: true,
            isDirect: false,
          };
        });
      }

      // 2. Session has booked mentees in the bookings array
      if (s.bookings && s.bookings.length > 0) {
        return s.bookings.map((b: any) => {
          const bookingStatus = b.status || (s.status !== 'available' ? s.status : 'pending');
          return {
            ...b,
            bookingId: b._id || b.bookingId || b.bookedBy,
            sessionId: s.sessionId || s._id,
            sessionStatus: s.status,
            sessionTitle: s.title || s.sessionType || 'Mentorship Session',
            sessionType: s.sessionType,
            duration: b.duration || s.duration || 30,
            scheduledAt: b.scheduledAt || s.scheduledAt,
            sessionScheduledAt: s.scheduledAt,
            slotTime: b.slotTime || s.slotTime,
            status: bookingStatus,
            menteeId: b.menteeId || b.bookedBy || b.mentee?._id,
            menteeName: b.mentee?.fullName || b.menteeName || s.bookedMenteeName || s.menteeName || b.bookedBy || 'Student',
            menteeEmail: b.mentee?.email || b.menteeEmail || s.menteeEmail || '',
            menteeProfilePhoto: b.mentee?.profilePic || b.menteeProfilePhoto || s.menteeProfilePhoto || '',
            mentorName: s.mentorName,
            mentorProfilePhoto: s.mentorProfilePhoto,
            pricing: b.pricing || s.pricing,
            payment: b.payment || s.payment,
            isDirect: false,
          };
        });
      }

      // 3. Direct session booking (only if it has an actual booked mentee and is not a raw unbooked template)
      const hasMentee = Boolean(s.bookedBy || s.menteeId || s.bookedMenteeName || s.mentee);
      const isBookedStatus = s.status && s.status !== 'available' && s.status !== 'open';
      if (hasMentee && isBookedStatus) {
        return [
          {
            bookingId: s.sessionId || s._id,
            sessionId: s.sessionId || s._id,
            sessionStatus: s.status,
            status: s.status,
            menteeId: s.menteeId || s.bookedBy,
            menteeName: s.mentee?.fullName || s.menteeName || s.bookedMenteeName || 'Student',
            menteeEmail: s.mentee?.email || s.menteeEmail || '',
            menteeProfilePhoto: s.mentee?.profilePic || s.menteeProfilePhoto || '',
            mentorName: s.mentorName,
            mentorProfilePhoto: s.mentorProfilePhoto,
            sessionTitle: s.title || s.sessionType || 'Mentorship Session',
            sessionType: s.sessionType,
            duration: s.duration || 30,
            scheduledAt: s.scheduledAt,
            sessionScheduledAt: s.scheduledAt,
            slotTime: s.slotTime,
            pricing: s.pricing,
            payment: s.payment,
            isDirect: true,
          },
        ];
      }

      // Raw unbooked service offering => DO NOT show in Bookings section
      return [];
    });
  }, [sessions]);

  // Tab counts
  const totalAllCount = useMemo(() => allBookings.length, [allBookings]);

  const pendingCount = useMemo(() => {
    return allBookings.filter((b: any) => b.status === 'pending').length;
  }, [allBookings]);

  const upcomingCount = useMemo(() => {
    return allBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'rescheduled' || b.status === 'upcoming').length;
  }, [allBookings]);

  const inProgressCount = useMemo(() => {
    return allBookings.filter((b: any) => b.status === 'in_progress').length;
  }, [allBookings]);

  const completedCount = useMemo(() => {
    return allBookings.filter((b: any) => b.status === 'completed').length;
  }, [allBookings]);

  const cancelledCount = useMemo(() => {
    return allBookings.filter((b: any) => b.status === 'cancelled' || b.status === 'refunded').length;
  }, [allBookings]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b: any) => {
      // Status filter
      let matchesStatus = true;
      switch (activeTab) {
        case 'all':
          matchesStatus = true;
          break;
        case 'pending':
          matchesStatus = b.status === 'pending';
          break;
        case 'upcoming':
          matchesStatus = b.status === 'confirmed' || b.status === 'rescheduled' || b.status === 'upcoming';
          break;
        case 'in_progress':
          matchesStatus = b.status === 'in_progress';
          break;
        case 'completed':
          matchesStatus = b.status === 'completed';
          break;
        case 'cancelled':
          matchesStatus = b.status === 'cancelled' || b.status === 'refunded';
          break;
      }

      if (!matchesStatus) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const mName = (b.menteeName || '').toLowerCase();
      const mEmail = (b.menteeEmail || '').toLowerCase();
      const sTitle = (b.sessionTitle || '').toLowerCase();
      const sType = (b.sessionType || '').toLowerCase();
      return mName.includes(q) || mEmail.includes(q) || sTitle.includes(q) || sType.includes(q);
    });
  }, [allBookings, activeTab, searchQuery]);

  const handleCompleteClick = (b: any) => {
    setSelectedBooking(b);
    setInputValue(b.duration?.toString() || '60');
    setModalType('complete');
  };

  const handleCancelClick = async (b: any) => {
    setSelectedBooking(b);
    setInputValue('');
    setRefundEstimate(null);
    setModalType('cancel');
    try {
      const sId = b.sessionId || b.bookingId;
      if (sId) {
        const res = await SessionService.getRefundEstimate(sId);
        const estimate = res?.data || res;
        setRefundEstimate(estimate);
      }
    } catch (e) {
      // Non-blocking fallback
    }
  };

  const handleViewReceipt = async (b: any) => {
    try {
      const sId = b.sessionId || b.bookingId;
      const res = await SessionService.getSessionReceipt(sId, b.bookingId);
      const receipt = res?.data || res;
      Alert.alert(
        'Session Receipt / Invoice',
        `Invoice: ${receipt?.receiptNumber || 'REC-' + String(sId).slice(-6)}\nMentee: ${b.menteeName || 'Student'}\nAmount: ₹${b.pricing?.totalAmount || b.pricing?.basePrice || 0}\nDate: ${new Date(b.scheduledAt || Date.now()).toLocaleDateString()}\nStatus: Verified & Paid`
      );
    } catch (err: any) {
      Alert.alert(
        'Session Receipt',
        `Mentee: ${b.menteeName || 'Student'}\nAmount: ₹${b.pricing?.totalAmount || b.pricing?.basePrice || 0}\nStatus: Verified`
      );
    }
  };

  const handleViewProgress = async (b: any) => {
    try {
      const sId = b.sessionId || b.bookingId;
      const res = await SessionService.getSessionProgress(sId);
      const prog = res?.data || res;
      Alert.alert(
        'Session Progress & Milestones',
        `Status: ${prog?.status || b.status || 'In Progress'}\nCurrent Stage: ${prog?.currentMilestone || 'Active Session'}\nCompleted Tasks: ${prog?.completedTasks || 0} / ${prog?.totalTasks || 1}\nNotes: ${prog?.notes || 'No active blockers'}`
      );
    } catch (err: any) {
      Alert.alert('Session Progress', `Status: ${b.status || 'Active'}\nScheduled: ${new Date(b.scheduledAt || Date.now()).toLocaleString()}`);
    }
  };

  const handleRescheduleClick = (b: any) => {
    setSelectedBooking(b);
    setInputValue('');
    setSelectedDate(b.scheduledAt ? new Date(b.scheduledAt) : (b.sessionScheduledAt ? new Date(b.sessionScheduledAt) : new Date()));
    setModalType('reschedule');
  };


  const tabs = [
    { id: 'all', label: 'All', icon: Clock, count: totalAllCount },
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, count: upcomingCount },
    { id: 'in_progress', label: 'In Progress', icon: Play, count: inProgressCount },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedCount },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle, count: cancelledCount },
  ];

  const currentTabLabel = tabs.find((t) => t.id === activeTab)?.label || 'All';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* ── 1. Page Header ── */}
      <View className="flex-row items-center gap-3 mb-3.5">
        <View className="w-10 h-10 rounded-xl bg-[#3c2a1e] items-center justify-center shadow-sm">
          <Calendar size={20} color="#ffffff" />
        </View>
        <View>
          <Text className="text-lg font-black text-[#3c2a1e]">Bookings</Text>
          <Text className="text-xs text-[#8a7a6a] font-medium">Manage your sessions</Text>
        </View>
      </View>

      {/* ── 2. Search Option (Below Title) ── */}
      <View className="bg-white border border-[#e4dbd1] rounded-2xl px-3.5 py-2.5 flex-row items-center mb-3.5 shadow-sm">
        <Search size={16} color="#8a7a6a" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student or service..."
          placeholderTextColor="#b0a090"
          className="flex-1 ml-2.5 text-xs text-[#3c2a1e] py-0"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <X size={15} color="#8a7a6a" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── 3. Tabs Pill Bar with Counts (No Big Boxes) ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2 py-0.5">
          {tabs.map((t) => {
            const isSelected = activeTab === t.id;
            const IconComp = t.icon;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveTab(t.id as any)}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-2.5 rounded-full border shadow-xs ${
                  isSelected
                    ? 'bg-[#3c2a1e] border-[#3c2a1e]'
                    : 'bg-white border-[#e4dbd1]'
                }`}
              >
                <IconComp size={13} color={isSelected ? '#ffffff' : '#7a5c3e'} />
                <Text
                  className={`text-xs font-bold ml-1.5 ${
                    isSelected ? 'text-white' : 'text-[#3c2a1e]'
                  }`}
                >
                  {t.label}
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full ml-2 ${
                    isSelected ? 'bg-white/20' : 'bg-[#FAF8F5] border border-[#e4dbd1]'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      isSelected ? 'text-white' : 'text-[#7a5c3e]'
                    }`}
                  >
                    {t.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── 4. Bookings Content List / Empty State ── */}
      {filteredBookings.length === 0 ? (
        <View className="bg-white rounded-3xl p-10 border border-[#e4dbd1] shadow-sm items-center justify-center">
          <View className="w-12 h-12 rounded-2xl bg-[#faf6f0] border border-[#ece4dc] items-center justify-center mb-3">
            <Calendar size={22} color="#8a7a6a" />
          </View>
          <Text className="text-sm font-black text-[#3c2a1e]">
            No {currentTabLabel.toLowerCase()} bookings found
          </Text>
          <Text className="text-xs text-[#8a7a6a] text-center mt-1">
            Bookings will appear here when available
          </Text>
        </View>
      ) : (
        filteredBookings.map((b: any, i: number) => {
          const isMenteeView = currentUserId && currentUserId === b.menteeId;
          const displayPhoto = isMenteeView ? b.mentorProfilePhoto : b.menteeProfilePhoto;
          let displayName = isMenteeView ? (b.mentorName || 'Mentor') : (b.menteeName || b.menteeId?.slice(0, 8));

          if (!displayName && b.isDirect) {
            displayName = 'Available Template';
          } else if (!displayName) {
            displayName = 'Student';
          }

          const initials = displayName ? displayName.slice(0, 2).toUpperCase() : 'ST';

          return (
            <View key={b.bookingId || b.sessionId || i} className="bg-white rounded-3xl p-5 border border-[#e4dbd1] shadow-sm mb-3.5">
              <View className="flex-row items-start justify-between mb-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-start gap-x-3"
                  onPress={() => {
                    const targetUserId = isMenteeView ? null : b.menteeId;
                    if (targetUserId) {
                      navigation.navigate('Profile', { userId: targetUserId });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {displayPhoto ? (
                    <Image source={{ uri: displayPhoto }} className="w-11 h-11 rounded-2xl border border-[#d4c4b5]" resizeMode="cover" />
                  ) : (
                    <View className="w-11 h-11 rounded-2xl bg-[#f5ede4] items-center justify-center border border-[#d4c4b5]">
                      <Text className="text-[#4a3728] font-black text-xs">{initials}</Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-black text-[#3c2a1e] text-sm mb-0.5" numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text className="text-xs font-semibold text-[#8a7a6a] mb-1" numberOfLines={1}>
                      {b.sessionTitle || '1:1 Mentorship'}
                    </Text>
                    <Text className="text-[10px] text-[#8a7a6a] mb-1.5">
                      {b.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : (b.sessionScheduledAt ? new Date(b.sessionScheduledAt).toLocaleString() : 'Today')}
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {(() => {
                        const isPast = b.scheduledAt ? new Date(b.scheduledAt).getTime() < Date.now() : false;
                        const isDone = b.status === 'completed' || b.status === 'cancelled' || b.status === 'refunded';
                        if (isPast && !isDone) {
                          return (
                            <View className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                              <Text className="text-[9px] font-bold text-rose-700 uppercase">Expired</Text>
                            </View>
                          );
                        }
                        return (
                          <View className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <Text className="text-[9px] font-bold text-emerald-800 uppercase">
                              {b.status || b.sessionStatus || 'pending'}
                            </Text>
                          </View>
                        );
                      })()}
                      <View className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        <Text className="text-[9px] font-bold text-blue-800 uppercase">
                          {b.duration || 30} mins
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                <View className="items-end">
                  <Text className="font-black text-sm text-[#3c2a1e]">
                    ₹{(b.pricing?.basePrice || b.pricing?.totalAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row flex-wrap gap-2 pt-3 border-t border-[#f0e8e0]">
                {(b.sessionStatus === 'pending' || b.sessionStatus === 'available' || b.status === 'pending') && (
                  <>
                    {!b.isDirect && onConfirm && (
                      <TouchableOpacity
                        disabled={!!loadingAction}
                        onPress={() => onConfirm(b)}
                        className={`px-3.5 py-2 bg-[#3c2a1e] rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                      >
                        {loadingAction === `confirm-${b.bookingId || b.sessionId}` ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white text-xs font-bold">Confirm</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    {onCancel && (
                      <TouchableOpacity
                        disabled={!!loadingAction}
                        onPress={() => handleCancelClick(b)}
                        className={`px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                      >
                        {loadingAction === `cancel-${b.sessionId}` ? (
                          <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                          <Text className="text-red-700 text-xs font-bold">Cancel</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {(b.sessionStatus === 'confirmed' || b.sessionStatus === 'rescheduled' || b.status === 'confirmed') && (
                  <>
                    {onStart && (
                      <TouchableOpacity
                        disabled={!!loadingAction}
                        onPress={() => onStart(b)}
                        className={`px-3.5 py-2 bg-emerald-600 rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                      >
                        {loadingAction === `start-${b.sessionId}` ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white text-xs font-bold">Start Session</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    {onReschedule && (
                      <TouchableOpacity
                        disabled={!!loadingAction}
                        onPress={() => handleRescheduleClick(b)}
                        className={`px-3.5 py-2 bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                      >
                        {loadingAction === `reschedule-${b.sessionId}` ? (
                          <ActivityIndicator size="small" color="#7a5c3e" />
                        ) : (
                          <Text className="text-[#7a5c3e] text-xs font-bold">Reschedule</Text>
                        )}
                      </TouchableOpacity>
                    )}
                    {onCancel && (
                      <TouchableOpacity
                        disabled={!!loadingAction}
                        onPress={() => handleCancelClick(b)}
                        className={`px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                      >
                        <Text className="text-red-700 text-xs font-bold">Cancel</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleViewProgress(b)}
                      className="px-3 py-2 bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl flex-row items-center gap-1"
                    >
                      <TrendingUp size={12} color="#7a5c3e" />
                      <Text className="text-[#7a5c3e] text-xs font-bold">Progress</Text>
                    </TouchableOpacity>
                  </>
                )}

                {(b.sessionStatus === 'in_progress' || b.status === 'in_progress') && onComplete && (
                  <TouchableOpacity
                    disabled={!!loadingAction}
                    onPress={() => handleCompleteClick(b)}
                    className={`px-3.5 py-2 bg-[#3c2a1e] rounded-xl ${loadingAction ? 'opacity-50' : ''}`}
                  >
                    {loadingAction === `complete-${b.sessionId}` ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-xs font-bold">Complete Session</Text>
                    )}
                  </TouchableOpacity>
                )}

                {(b.sessionStatus === 'completed' || b.sessionStatus === 'cancelled' || b.sessionStatus === 'refunded' || b.status === 'completed' || b.status === 'cancelled') && (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Booking Details',
                          `Session: ${b.sessionTitle || 'Session'}\nDuration: ${b.duration || 60} mins\nAmount: ₹${
                            b.pricing?.totalAmount ?? b.pricing?.basePrice ?? 0
                          }\nStatus: ${b.sessionStatus || b.status || 'completed'}`
                        )
                      }
                      className="px-3.5 py-2 bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl"
                    >
                      <Text className="text-[#7a5c3e] text-xs font-bold">View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleViewReceipt(b)}
                      className="px-3 py-2 bg-[#FAF8F5] border border-[#e4dbd1] rounded-xl flex-row items-center gap-1"
                    >
                      <FileText size={12} color="#7a5c3e" />
                      <Text className="text-[#7a5c3e] text-xs font-bold">Receipt</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* ── 5. Lifecycle Action Modal ── */}
      <Modal visible={!!modalType} transparent animationType="fade" onRequestClose={() => setModalType(null)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl border border-[#d4c4b5]">
            <Text className="text-lg font-black text-[#3c2a1e] mb-4">
              {modalType === 'complete' && 'Complete Session'}
              {modalType === 'cancel' && 'Cancel Session'}
              {modalType === 'reschedule' && 'Reschedule Session'}
            </Text>

            {modalType === 'complete' && (
              <TextInput
                className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-4 py-3 mb-4 text-xs text-[#3c2a1e]"
                placeholder="Actual duration (mins)"
                keyboardType="number-pad"
                value={inputValue}
                onChangeText={setInputValue}
              />
            )}

            {modalType === 'cancel' && (
              <View>
                {refundEstimate && (
                  <View className="bg-[#FAF8F5] border border-[#e4dbd1] p-3 rounded-2xl mb-3">
                    <Text className="text-[11px] font-bold text-[#3c2a1e]">
                      Refund Amount:{' '}
                      <Text className="text-emerald-700 font-black">
                        ₹{refundEstimate.refundAmount ?? refundEstimate.amount ?? 0}
                      </Text>
                    </Text>
                    {refundEstimate.cancellationFee !== undefined && (
                      <Text className="text-[10px] text-[#8a7a6a] mt-0.5">
                        Cancellation Fee: ₹{refundEstimate.cancellationFee}
                      </Text>
                    )}
                    {refundEstimate.policy && (
                      <Text className="text-[10px] text-[#8a7a6a] mt-0.5">{refundEstimate.policy}</Text>
                    )}
                  </View>
                )}
                <TextInput
                  className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-4 py-3 mb-4 text-xs text-[#3c2a1e]"
                  placeholderTextColor="#8a7a6a"
                  placeholder="Cancellation reason..."
                  value={inputValue}
                  onChangeText={setInputValue}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}


            {modalType === 'reschedule' && (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setDatePickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
                    setShowDatePicker(true);
                  }}
                  className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-4 py-3 mb-3"
                >
                  <Text className="text-xs font-bold text-[#3c2a1e]">{selectedDate.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode={datePickerMode as any}
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      if (Platform.OS === 'ios') {
                        if (date) setSelectedDate(date);
                      } else {
                        setShowDatePicker(false);
                        if (event.type === 'set' && date) {
                          setSelectedDate(date);
                          if (datePickerMode === 'date') {
                            setDatePickerMode('time');
                            setTimeout(() => setShowDatePicker(true), 100);
                          }
                        }
                      }
                    }}
                  />
                )}
                <TextInput
                  className="bg-[#FAF8F5] border border-[#e4dbd1] rounded-2xl px-4 py-3 mb-4 text-xs text-[#3c2a1e]"
                  placeholderTextColor="#8a7a6a"
                  placeholder="Reason for reschedule..."
                  value={inputValue}
                  onChangeText={setInputValue}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={() => setModalType(null)}
                className="flex-1 bg-[#FAF8F5] border border-[#e4dbd1] py-3 rounded-2xl items-center"
              >
                <Text className="font-bold text-xs text-[#7a5c3e]">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!!loadingAction}
                onPress={() => {
                  const b = selectedBooking;
                  if (!b) return;
                  if (modalType === 'complete' && onComplete) {
                    const duration = parseInt(inputValue || '60', 10);
                    onComplete(b, isNaN(duration) ? b.duration : duration);
                  } else if (modalType === 'cancel' && onCancel) {
                    onCancel(b, inputValue || 'No reason provided');
                  } else if (modalType === 'reschedule' && onReschedule) {
                    if (selectedDate <= new Date()) {
                      Alert.alert('Invalid Time', 'Please select a future date and time.');
                      return;
                    }
                    const reason = inputValue.trim();
                    if (!reason) {
                      Alert.alert('Reason Required', 'Please provide a reason for rescheduling.');
                      return;
                    }
                    onReschedule(b, selectedDate, reason);
                  }
                  setModalType(null);
                }}
                className={`flex-1 py-3 rounded-2xl items-center ${
                  modalType === 'cancel' ? 'bg-red-600' : 'bg-[#3c2a1e]'
                } ${loadingAction ? 'opacity-50' : ''}`}
              >
                {loadingAction ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-bold text-xs text-white">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default React.memo(BookingsPage);
