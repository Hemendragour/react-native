import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, Image, Alert, ActivityIndicator, DeviceEventEmitter
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import ImagePicker from 'react-native-image-crop-picker';
import AuthService from '../../../../services/auth.service';
import { FeedService } from '../../../../services/feed.service';

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PollState {
  question: string;
  options: string[];
  durationDays: number;
}

interface EventState {
  title: string;
  description: string;
  eventDate: string;
  eventType: 'online' | 'in_person';
  meetingLink: string;
  location: string;
}

interface PostFormData {
  title: string;
  content: string;
  images: any[];
  videos: any[];
  documents: any[];
  mood?: string;
  poll?: {
    question: string;
    options: string[];
    durationDays: number;
  } | null;
  event?: {
    title: string;
    description: string;
    eventDate: string;
    eventType: 'online' | 'in_person';
    meetingLink?: string;
    location?: string;
  } | null;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialPostImages?: any[];
  initialPostVideos?: any[];
  initialPostDocuments?: any[];
  authorAvatar?: string;
  authorName?: string;
}

// ─── Mood Data ────────────────────────────────────────────────────────────────

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'celebrating', label: 'Celebrating', emoji: '🎉' },
  { id: 'proud', label: 'Proud', emoji: '🏆' },
  { id: 'inspired', label: 'Inspired', emoji: '💡' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
  { id: 'motivated', label: 'Motivated', emoji: '💪' },
  { id: 'curious', label: 'Curious', emoji: '🧐' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'focused', label: 'Focused', emoji: '🎯' },
  { id: 'accomplished', label: 'Accomplished', emoji: '✨' },
  { id: 'optimistic', label: 'Optimistic', emoji: '☀️' },
  { id: 'blessed', label: 'Blessed', emoji: '😇' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'chill', label: 'Chill', emoji: '☕' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ImageIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VideoIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DocumentIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PollIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19h16M7 15V9m5 6V5m5 10v-6" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#4a3728" strokeWidth={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const SmileyIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22a10 10 0 100-20 10 10 0 000 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RemoveIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 18L18 6M6 6l12 12" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const AttachButton = ({ label, icon, onPress, active = false }: { label: string; icon: React.ReactNode; onPress: () => void; active?: boolean }) => (
  <TouchableOpacity
    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
      active ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-[#fdfbf9] border-[#e0d8cf]'
    }`}
    onPress={onPress}
    activeOpacity={0.7}
    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
  >
    <View pointerEvents="none" className="flex-row items-center gap-1.5">
      {icon}
      <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-[#4a3728]'}`}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const EMPTY_ARRAY: any[] = [];

// ─── Main Component ───────────────────────────────────────────────────────────

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen, onClose, onSubmit,
  initialPostImages = EMPTY_ARRAY,
  initialPostVideos = EMPTY_ARRAY,
  initialPostDocuments = EMPTY_ARRAY,
  authorAvatar, authorName
}: CreatePostModalProps) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '', content: '', images: [], videos: [], documents: [],
  });
  const [errors, setErrors] = useState({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Mood State
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState<PollState>({
    question: '',
    options: ['', ''],
    durationDays: 7,
  });

  // Event State
  const [showEvent, setShowEvent] = useState(false);
  const [eventData, setEventData] = useState<EventState>({
    title: '',
    description: '',
    eventDate: '',
    eventType: 'online',
    meetingLink: '',
    location: '',
  });

  const currentUser = AuthService.getCurrentUser() as any;
  const currentUserId = currentUser?.userId || currentUser?.id || currentUser?._id;
  const displayAvatar = authorAvatar || (currentUserId ? FeedService.getUserFromCache(currentUserId)?.avatar : null) || currentUser?.profileImage || currentUser?.avatar || DEFAULT_AVATAR;
  const displayName = authorName || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : null) || (currentUserId ? FeedService.getUserFromCache(currentUserId)?.name : null) || currentUser?.name || currentUser?.username || 'You';

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => {
        const hasNewImages = initialPostImages && initialPostImages.length > 0 && initialPostImages !== prev.images;
        const hasNewVideos = initialPostVideos && initialPostVideos.length > 0 && initialPostVideos !== prev.videos;
        const hasNewDocs = initialPostDocuments && initialPostDocuments.length > 0 && initialPostDocuments !== prev.documents;

        if (!hasNewImages && !hasNewVideos && !hasNewDocs) {
          return prev;
        }

        return {
          ...prev,
          images: hasNewImages ? initialPostImages : prev.images,
          videos: hasNewVideos ? initialPostVideos : prev.videos,
          documents: hasNewDocs ? initialPostDocuments : prev.documents,
        };
      });
    }
  }, [isOpen, initialPostImages, initialPostVideos, initialPostDocuments]);

  const reset = () => {
    setFormData({ title: '', content: '', images: [], videos: [], documents: [] });
    setErrors({ title: '', content: '' });
    setSelectedMood(null);
    setShowMoodSelector(false);
    setShowPoll(false);
    setPollData({ question: '', options: ['', ''], durationDays: 7 });
    setShowEvent(false);
    setEventData({
      title: '',
      description: '',
      eventDate: '',
      eventType: 'online',
      meetingLink: '',
      location: '',
    });
  };

  const handleClose = () => { reset(); onClose(); };

  const validate = () => {
    const errs = { title: '', content: '' };
    const trimmedTitle = formData.title.trim();

    if (!trimmedTitle) {
      errs.title = 'Title is required';
    } else if (!/^[A-Z]/.test(trimmedTitle)) {
      errs.title = 'Title must start with a capital letter (A-Z)';
    } else if (trimmedTitle.length > 100) {
      errs.title = 'Title must be 100 characters or less';
    }

    if (!formData.content.trim() && !showPoll && !showEvent && formData.images.length === 0 && formData.videos.length === 0 && formData.documents.length === 0) {
      errs.content = 'Post content or attachment is required';
    }

    // Poll validation
    if (showPoll) {
      if (!pollData.question.trim()) {
        Alert.alert('Poll Error', 'Please enter a poll question.');
        return false;
      }
      const validOptions = pollData.options.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        Alert.alert('Poll Error', 'Please provide at least 2 poll options.');
        return false;
      }
    }

    // Event validation
    if (showEvent) {
      if (!eventData.title.trim()) {
        Alert.alert('Event Error', 'Please enter an event title.');
        return false;
      }
    }

    setErrors(errs);
    return !errs.title && !errs.content;
  };

  const handlePickImage = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      maxFiles: 5,
    }).then(images => {
      const formatted = images.map(img => {
        const imgUri = img.path.startsWith('file://') || img.path.startsWith('content://') ? img.path : 'file://' + img.path;
        return { uri: imgUri, type: img.mime || 'image/jpeg', fileName: img.filename || `image_${Date.now()}.jpg` };
      });
      setFormData(prev => ({ ...prev, images: [...prev.images, ...formatted] }));
    }).catch(e => {
      if (e.message !== 'User cancelled image selection') {
        Alert.alert('Error', 'Failed to pick image');
      }
    });
  };

  const handlePickVideo = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      maxFiles: 2,
    }).then(videos => {
      const formatted = videos.map(vid => {
        const vidUri = vid.path.startsWith('file://') || vid.path.startsWith('content://') ? vid.path : 'file://' + vid.path;
        return { uri: vidUri, type: vid.mime || 'video/mp4', fileName: vid.filename || `video_${Date.now()}.mp4` };
      });
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...formatted] }));
    }).catch(e => {
      if (e.message !== 'User cancelled video selection') {
        Alert.alert('Error', 'Failed to pick video');
      }
    });
  };

  const handlePickDocument = async () => {
    try {
      const DocumentPicker = require('react-native-document-picker').default;
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
        allowMultiSelection: true,
      });
      if (results && results.length > 0) {
        const formatted = results.map((doc: any) => ({
          uri: doc.uri,
          type: doc.type || 'application/pdf',
          fileName: doc.name || 'document.pdf',
          size: doc.size,
        }));
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...formatted] }));
      }
    } catch (err: any) {
      const DocumentPicker = require('react-native-document-picker').default;
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document: ' + (err.message || ''));
      }
    }
  };

  const handleCropImage = (imageUri: string, idx: number) => {
    ImagePicker.openCropper({
      path: imageUri,
      freeStyleCropEnabled: true,
    } as any).then(image => {
      const imageUriStr = image.path.startsWith('file://') || image.path.startsWith('content://') ? image.path : 'file://' + image.path;
      const formatted = { uri: imageUriStr, type: image.mime || 'image/jpeg', fileName: image.filename || 'cropped.jpg' };
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[idx] = formatted;
        return { ...prev, images: newImages };
      });
    }).catch(e => {
      console.log('Crop cancelled', e);
    });
  };

  const removeImage = (idx: number) =>
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const removeVideo = (idx: number) =>
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));

  const removeDocument = (idx: number) =>
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));

  // Poll option helpers
  const handleAddPollOption = () => {
    if (pollData.options.length < 4) {
      setPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const handlePollOptionChange = (text: string, index: number) => {
    setPollData(prev => {
      const updated = [...prev.options];
      updated[index] = text;
      return { ...prev, options: updated };
    });
  };

  const handleRemovePollOption = (index: number) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: any = {
      ...formData,
      mood: selectedMood || undefined,
      poll: showPoll ? {
        question: pollData.question.trim(),
        options: pollData.options.map(o => o.trim()).filter(Boolean),
        durationDays: pollData.durationDays,
      } : undefined,
      event: showEvent ? {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        eventDate: eventData.eventDate.trim() || new Date(Date.now() + 86400000).toISOString(),
        eventType: eventData.eventType,
        meetingLink: eventData.eventType === 'online' ? eventData.meetingLink.trim() : undefined,
        location: eventData.eventType === 'in_person' ? eventData.location.trim() : undefined,
      } : undefined,
    };

    DeviceEventEmitter.emit('start_post_upload', payload);
    onSubmit(payload);
    reset();
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#f6ede8] rounded-t-3xl max-h-[92%]">

          {/* Header */}
          <View className="flex-row items-center justify-between p-5 bg-[#f6ede8] border-b border-[#e0d8cf] rounded-t-3xl">
            <View>
              <Text className="text-[#4a3728] text-lg font-bold">Create Post</Text>
              <Text className="text-[#8b6f47] text-xs mt-0.5">Share with your professional network</Text>
            </View>
            <TouchableOpacity className="p-2 rounded-full bg-[#e0d8cf]/60" onPress={handleClose} activeOpacity={0.7}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Author info row */}
          <View className="flex-row items-center gap-3 px-5 py-3 border-b border-[#e0d8cf]/40 bg-white/30">
            <Image
              source={{ uri: displayAvatar }}
              className="w-10 h-10 rounded-full border border-[#4a3728]/30"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-[#4a3728] text-sm font-bold" numberOfLines={1}>{displayName}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <View className="bg-[#4a3728]/10 px-2 py-0.5 rounded-full border border-[#4a3728]/20 flex-row items-center gap-1">
                  <Text className="text-[#4a3728] text-[10px] font-semibold">🌐 Anyone</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>

            {/* Title */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider">
                  Title <Text className="text-red-500">* (Starts with capital letter)</Text>
                </Text>
                <Text className="text-[#8b6f47] text-[10px]">Max 100</Text>
              </View>
              <TextInput
                value={formData.title}
                onChangeText={(v) => {
                  setFormData(p => ({ ...p, title: v }));
                  if (errors.title) setErrors(p => ({ ...p, title: '' }));
                }}
                placeholder="e.g., Excited to announce our new project"
                placeholderTextColor="rgba(74,55,40,0.4)"
                maxLength={100}
                className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white/70 text-[#4a3728] text-sm ${
                  errors.title ? 'border-red-400' : 'border-[#e0d8cf]'
                }`}
              />
              {errors.title ? <Text className="text-red-500 text-xs mt-1 font-medium">{errors.title}</Text> : null}
            </View>

            {/* Active Mood Pill */}
            {selectedMood && (
              <View className="flex-row items-center mb-3">
                <View className="flex-row items-center bg-[#4a3728] px-3 py-1.5 rounded-full gap-1.5">
                  <Text className="text-xs text-[#f6ede8] font-medium">
                    Feeling {MOODS.find(m => m.id === selectedMood)?.emoji} {MOODS.find(m => m.id === selectedMood)?.label}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedMood(null)}>
                    <Text className="text-white text-xs font-bold ml-1">✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Content */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider">
                  Content <Text className="text-red-500">*</Text>
                </Text>
                <Text className="text-[#8b6f47] text-[10px]">Max 3000</Text>
              </View>
              <TextInput
                value={formData.content}
                onChangeText={(v) => {
                  setFormData(p => ({ ...p, content: v }));
                  if (errors.content) setErrors(p => ({ ...p, content: '' }));
                }}
                placeholder="What do you want to talk about?"
                placeholderTextColor="rgba(74,55,40,0.4)"
                multiline
                maxLength={3000}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white/70 text-[#4a3728] text-sm ${
                  errors.content ? 'border-red-400' : 'border-[#e0d8cf]'
                }`}
                style={{ height: 110, textAlignVertical: 'top' }}
              />
              {errors.content ? <Text className="text-red-500 text-xs mt-1 font-medium">{errors.content}</Text> : null}
            </View>

            {/* Action Buttons Row (Images, Videos, Documents, Poll, Event, Mood) */}
            <View className="mb-4">
              <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider mb-2">Add to your post</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                <AttachButton label="Photo" icon={<ImageIcon />} onPress={handlePickImage} />
                <AttachButton label="Video" icon={<VideoIcon />} onPress={handlePickVideo} />
                <AttachButton label="Article / Doc" icon={<DocumentIcon />} onPress={handlePickDocument} />
                <AttachButton
                  label={showPoll ? "Poll Added" : "Poll"}
                  icon={<PollIcon />}
                  active={showPoll}
                  onPress={() => setShowPoll(!showPoll)}
                />
                <AttachButton
                  label={showEvent ? "Event Added" : "Event"}
                  icon={<CalendarIcon />}
                  active={showEvent}
                  onPress={() => setShowEvent(!showEvent)}
                />
                <AttachButton
                  label="Mood"
                  icon={<SmileyIcon />}
                  active={Boolean(selectedMood)}
                  onPress={() => setShowMoodSelector(!showMoodSelector)}
                />
              </ScrollView>
            </View>

            {/* Mood Selector Dropdown */}
            {showMoodSelector && (
              <View className="bg-white/80 p-3 rounded-2xl border border-[#e0d8cf] mb-4">
                <Text className="text-[#4a3728] text-xs font-bold mb-2">How are you feeling?</Text>
                <View className="flex-row flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <TouchableOpacity
                      key={mood.id}
                      className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1 ${
                        selectedMood === mood.id
                          ? 'bg-[#4a3728] border-[#4a3728]'
                          : 'bg-[#fdfbf9] border-[#e0d8cf]'
                      }`}
                      onPress={() => {
                        setSelectedMood(selectedMood === mood.id ? null : mood.id);
                        setShowMoodSelector(false);
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{mood.emoji}</Text>
                      <Text className={`text-xs font-medium ${selectedMood === mood.id ? 'text-white' : 'text-[#4a3728]'}`}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Poll Builder Card */}
            {showPoll && (
              <View className="bg-white/90 p-4 rounded-2xl border-2 border-[#8b6f47]/30 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <PollIcon />
                    <Text className="text-[#4a3728] font-bold text-sm">Create a Poll</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPoll(false)}
                    className="px-2 py-1 bg-red-100 rounded-lg"
                  >
                    <Text className="text-red-600 text-xs font-bold">Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* Poll Question */}
                <TextInput
                  value={pollData.question}
                  onChangeText={v => setPollData(p => ({ ...p, question: v }))}
                  placeholder="Ask a question..."
                  placeholderTextColor="rgba(74,55,40,0.4)"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm mb-3"
                />

                {/* Poll Options */}
                {pollData.options.map((option, idx) => (
                  <View key={`poll_opt_${idx}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      value={option}
                      onChangeText={t => handlePollOptionChange(t, idx)}
                      placeholder={`Option ${idx + 1}`}
                      placeholderTextColor="rgba(74,55,40,0.4)"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm"
                    />
                    {pollData.options.length > 2 && (
                      <TouchableOpacity
                        onPress={() => handleRemovePollOption(idx)}
                        className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-200"
                      >
                        <Text className="text-red-500 font-bold text-xs">✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Add option button */}
                {pollData.options.length < 4 && (
                  <TouchableOpacity
                    onPress={handleAddPollOption}
                    className="py-2 border border-dashed border-[#8b6f47] rounded-xl items-center mb-3 bg-[#fdfbf9]"
                  >
                    <Text className="text-[#8b6f47] text-xs font-semibold">+ Add Option ({pollData.options.length}/4)</Text>
                  </TouchableOpacity>
                )}

                {/* Duration */}
                <View className="flex-row items-center justify-between pt-2 border-t border-[#e0d8cf]">
                  <Text className="text-[#4a3728] text-xs font-medium">Poll Duration:</Text>
                  <View className="flex-row gap-1.5">
                    {[1, 3, 7, 14].map(days => (
                      <TouchableOpacity
                        key={days}
                        className={`px-2.5 py-1 rounded-lg border ${
                          pollData.durationDays === days
                            ? 'bg-[#4a3728] border-[#4a3728]'
                            : 'bg-white border-[#e0d8cf]'
                        }`}
                        onPress={() => setPollData(p => ({ ...p, durationDays: days }))}
                      >
                        <Text className={`text-xs ${pollData.durationDays === days ? 'text-white font-bold' : 'text-[#4a3728]'}`}>
                          {days}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Event Builder Card */}
            {showEvent && (
              <View className="bg-white/90 p-4 rounded-2xl border-2 border-[#8b6f47]/30 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <CalendarIcon />
                    <Text className="text-[#4a3728] font-bold text-sm">Create an Event</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowEvent(false)}
                    className="px-2 py-1 bg-red-100 rounded-lg"
                  >
                    <Text className="text-red-600 text-xs font-bold">Remove</Text>
                  </TouchableOpacity>
                </View>

                {/* Event Title */}
                <TextInput
                  value={eventData.title}
                  onChangeText={v => setEventData(p => ({ ...p, title: v }))}
                  placeholder="Event Title..."
                  placeholderTextColor="rgba(74,55,40,0.4)"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm mb-2"
                />

                {/* Event Description */}
                <TextInput
                  value={eventData.description}
                  onChangeText={v => setEventData(p => ({ ...p, description: v }))}
                  placeholder="Event Description..."
                  placeholderTextColor="rgba(74,55,40,0.4)"
                  className="w-full px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm mb-2"
                />

                {/* Event Type Toggle */}
                <View className="flex-row gap-2 mb-2">
                  <TouchableOpacity
                    className={`flex-1 py-1.5 rounded-lg border items-center ${
                      eventData.eventType === 'online' ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
                    }`}
                    onPress={() => setEventData(p => ({ ...p, eventType: 'online' }))}
                  >
                    <Text className={`text-xs font-semibold ${eventData.eventType === 'online' ? 'text-white' : 'text-[#4a3728]'}`}>
                      Online
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-1.5 rounded-lg border items-center ${
                      eventData.eventType === 'in_person' ? 'bg-[#4a3728] border-[#4a3728]' : 'bg-white border-[#e0d8cf]'
                    }`}
                    onPress={() => setEventData(p => ({ ...p, eventType: 'in_person' }))}
                  >
                    <Text className={`text-xs font-semibold ${eventData.eventType === 'in_person' ? 'text-white' : 'text-[#4a3728]'}`}>
                      In-person
                    </Text>
                  </TouchableOpacity>
                </View>

                {eventData.eventType === 'online' ? (
                  <TextInput
                    value={eventData.meetingLink}
                    onChangeText={v => setEventData(p => ({ ...p, meetingLink: v }))}
                    placeholder="Meeting Link (https://...)"
                    placeholderTextColor="rgba(74,55,40,0.4)"
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm mb-2"
                  />
                ) : (
                  <TextInput
                    value={eventData.location}
                    onChangeText={v => setEventData(p => ({ ...p, location: v }))}
                    placeholder="Location / Venue"
                    placeholderTextColor="rgba(74,55,40,0.4)"
                    className="w-full px-3 py-2 rounded-xl border border-[#e0d8cf] bg-white text-[#4a3728] text-sm mb-2"
                  />
                )}
              </View>
            )}

            {/* Images Preview */}
            {formData.images.length > 0 && (
              <View className="mb-4">
                <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider mb-2">Photos ({formData.images.length}/5)</Text>
                <View className="flex-row flex-wrap gap-2">
                  {formData.images.map((img, idx) => (
                    <View key={`img_prev_${idx}`} style={{ position: 'relative' }}>
                      <TouchableOpacity activeOpacity={0.8} onPress={() => handleCropImage(img.uri, idx)}>
                        <Image source={{ uri: img.uri }} className="w-24 h-24 rounded-xl" resizeMode="cover" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center shadow"
                        onPress={() => removeImage(idx)}
                      >
                        <RemoveIcon />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Videos Preview */}
            {formData.videos.length > 0 && (
              <View className="mb-4">
                <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider mb-2">Videos ({formData.videos.length}/2)</Text>
                {formData.videos.map((vid, idx) => (
                  <View key={`vid_prev_${idx}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#e0d8cf', padding: 12, borderRadius: 12, marginBottom: 8 }}>
                    <Text className="text-[#4a3728] text-sm flex-1 font-medium" numberOfLines={1}>{vid.fileName || 'Video'}</Text>
                    <TouchableOpacity onPress={() => removeVideo(idx)}>
                      <Text className="text-red-500 text-xs font-bold ml-2">Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Documents Preview */}
            {formData.documents.length > 0 && (
              <View className="mb-4">
                <Text className="text-[#4a3728] text-xs font-bold uppercase tracking-wider mb-2">Documents / Articles ({formData.documents.length})</Text>
                {formData.documents.map((doc, idx) => (
                  <View
                    key={`doc_prev_${idx}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderWidth: 1,
                      borderColor: '#e0d8cf',
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View className="flex-row items-center gap-2.5 flex-1">
                      <DocumentIcon />
                      <Text className="text-[#4a3728] text-sm flex-1 font-medium" numberOfLines={1}>
                        {doc.fileName || 'Document.pdf'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeDocument(idx)}>
                      <Text className="text-red-500 text-xs font-bold ml-2">Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View className="h-6" />
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 px-5 py-4 bg-[#f6ede8] border-t border-[#e0d8cf]">
            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-[#e0d8cf] items-center"
              onPress={handleClose}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text className="text-[#4a3728] text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-full bg-[#4a3728] items-center shadow-sm"
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving
                ? <ActivityIndicator color="#f6ede8" />
                : <Text className="text-[#f6ede8] text-sm font-semibold">Post</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default CreatePostModal;