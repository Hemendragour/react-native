import * as React from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';
import ImageViewerModal from '../../../shared/components/ImageViewerModal';
import { PollData, EventData } from '../types/feed.types';

interface PostContentProps {
  post: any;
  onVotePoll?: (postKey: string, optionId: string) => void;
  currentUserId?: string;
}

const FileIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" stroke="#4a3728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PostContent: React.FC<PostContentProps> = ({ post, onVotePoll, currentUserId }) => {
  const postKey = post.entryId || post.postId;
  const [expanded, setExpanded] = React.useState(false);
  const combinedText = post.title && post.content && post.title !== post.content
    ? `${post.title}\n\n${post.content}`
    : post.content || post.title || '';
  
  const lines = combinedText.split('\n');
  const isLong = combinedText.length > 120 || lines.length > 3;
  
  let display = combinedText;
  if (isLong && !expanded) {
    if (lines.length > 3) {
      display = lines.slice(0, 3).join('\n');
      if (display.length > 120) {
        display = display.slice(0, 120) + '...';
      } else {
        display += '...';
      }
    } else {
      display = combinedText.slice(0, 120) + '...';
    }
  }

  const getMediaUrl = (item: any): string | null => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    const url = item.cloudinarySecureUrl || item.cloudinaryUrl || item.url || item.uri || item.secure_url || item.path;
    return typeof url === 'string' ? url : null;
  };

  const isValidImageUrl = (url: any): boolean => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    if (lower.includes('unsplash.com') || lower.includes('via.placeholder.com') || lower.includes('placeholder.com') || lower.includes('pravatar.cc')) {
      return false;
    }
    return true;
  };

  const images: string[] = [];
  if (typeof post.image === 'string' && isValidImageUrl(post.image)) {
    images.push(post.image);
  } else if (post.image) {
    const u = getMediaUrl(post.image);
    if (u && isValidImageUrl(u)) images.push(u);
  }
  if (post.images?.length) {
    post.images.forEach((img: any) => {
      const url = getMediaUrl(img);
      if (url && isValidImageUrl(url)) images.push(url);
    });
  }

  const videos: string[] = [];
  if (typeof post.video === 'string') videos.push(post.video);
  else if (post.video) {
    const u = getMediaUrl(post.video);
    if (u) videos.push(u);
  }
  if (post.videos?.length) {
    post.videos.forEach((vid: any) => {
      const url = getMediaUrl(vid);
      if (url) videos.push(url);
    });
  }

  const documents = Array.isArray(post.documents) ? post.documents : [];

  // A poll is only valid if it has a non-empty question and at least 2 options
  const isValidPoll = Boolean(
    post.pollData &&
    typeof post.pollData.question === 'string' &&
    post.pollData.question.trim().length > 0 &&
    Array.isArray(post.pollData.options) &&
    post.pollData.options.length >= 2
  );
  const pollData: PollData | null = isValidPoll ? post.pollData : null;

  // An event is only valid if it has a non-empty title/eventName and actual event details
  const eventTitle = post.eventData?.eventName || post.eventData?.title;
  const isValidEvent = Boolean(
    post.eventData &&
    typeof eventTitle === 'string' &&
    eventTitle.trim().length > 0 &&
    (post.eventData.startDate || post.eventData.eventDate || post.eventData.registrationLink || post.eventData.location)
  );
  const eventData: EventData | null = isValidEvent ? post.eventData : null;

  // Calculate dynamic aspect ratio for single images
  const [aspectRatio, setAspectRatio] = React.useState<number>(4 / 3);
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (images.length === 1 && images[0]) {
      Image.getSize(
        images[0],
        (width, height) => {
          if (width && height) {
            let ratio = width / height;
            if (ratio < 0.75) ratio = 0.75;
            if (ratio > 1.91) ratio = 1.91;
            setAspectRatio(ratio);
          }
        },
        (error) => {
          console.log('Failed to get image dimensions:', error);
        }
      );
    }
  }, [images[0]]);

  return (
    <View className="mb-3">

      {/* Matched Interests Chips */}
      {post.matchedInterests && post.matchedInterests.length > 0 && (
        <View className="flex-row items-center gap-1.5 mb-2 flex-wrap">
          {post.matchedInterests.map((interest: string, idx: number) => (
            <View key={idx} className="bg-[#4a3728]/10 px-2.5 py-0.5 rounded-full">
              <Text className="text-[11px] font-semibold text-[#4a3728]">
                #{interest}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Text content */}
      {combinedText ? (
        <View className="mb-3">
          <Text className="text-[#6b4e3d] text-sm font-medium leading-relaxed">
            {display}
          </Text>
          {isLong && (
            <Text
              className="text-xs font-bold mt-1"
              style={{ color: '#6b4e3d' }}
              onPress={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          )}
        </View>
      ) : null}

      {/* ── Poll Component ── */}
      {pollData && (
        <View className="bg-white/80 border border-[#e0d8cf] rounded-2xl p-4 mb-3">
          <Text className="text-sm font-bold text-[#4a3728] mb-3">
            📊 {pollData.question}
          </Text>

          {pollData.options?.map((opt) => {
            const total = pollData.totalVotes || 0;
            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
            const hasVotedThis =
              pollData.userVotedOptionId === opt.optionId ||
              (currentUserId && opt.votedBy?.includes(currentUserId));
            const hasVotedAny =
              Boolean(pollData.userVotedOptionId) ||
              Boolean(currentUserId && pollData.options.some((o) => o.votedBy?.includes(currentUserId)));

            return (
              <TouchableOpacity
                key={opt.optionId}
                disabled={hasVotedAny}
                onPress={() => onVotePoll?.(postKey, opt.optionId)}
                className={`relative overflow-hidden rounded-xl border p-3 mb-2 flex-row items-center justify-between ${
                  hasVotedThis
                    ? 'border-[#8b6914] bg-[#f6ede8]'
                    : 'border-[#e0d8cf] bg-white'
                }`}
                activeOpacity={0.7}
              >
                {/* Progress bar background fill */}
                {hasVotedAny && (
                  <View
                    className="absolute top-0 bottom-0 left-0 bg-[#4a3728]/15"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <View
                    className={`w-4 h-4 rounded-full border items-center justify-center ${
                      hasVotedThis ? 'border-[#8b6914] bg-[#8b6914]' : 'border-[#a09487]'
                    }`}
                  >
                    {hasVotedThis && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </View>
                  <Text
                    className={`text-xs font-semibold ${
                      hasVotedThis ? 'text-[#8b6914] font-bold' : 'text-[#4a3728]'
                    }`}
                    numberOfLines={2}
                  >
                    {opt.text}
                  </Text>
                </View>
                {hasVotedAny && (
                  <Text className="text-xs font-bold text-[#6b5643]">{pct}%</Text>
                )}
              </TouchableOpacity>
            );
          })}

          <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-[#e0d8cf]/50">
            <Text className="text-[11px] text-[#6b5643]">
              {pollData.totalVotes || 0} votes
            </Text>
            <Text className="text-[11px] font-semibold text-[#8b6914]">
              {pollData.isActive ? 'Active poll' : 'Poll closed'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Event Card ── */}
      {eventData && (
        <View className="bg-[#f6ede8] border border-[#e0d8cf] rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <CalendarIcon />
              <Text className="text-xs font-bold text-[#8b6914] uppercase tracking-wider">
                {eventData.eventFormat || 'Event'} • {eventData.eventType || 'Online'}
              </Text>
            </View>
          </View>
          <Text className="text-base font-bold text-[#4a3728] mb-1">
            {eventData.eventName}
          </Text>
          {(eventData.startDate || eventData.startTime) && (
            <Text className="text-xs text-[#6b5643] mb-2 font-medium">
              📅 {eventData.startDate} {eventData.startTime ? `at ${eventData.startTime}` : ''} {eventData.timezone ? `(${eventData.timezone})` : ''}
            </Text>
          )}
          {eventData.description ? (
            <Text className="text-xs text-[#4a3728]/80 mb-3" numberOfLines={3}>
              {eventData.description}
            </Text>
          ) : null}
          {eventData.registrationLink ? (
            <TouchableOpacity
              onPress={() => {
                if (eventData.registrationLink) Linking.openURL(eventData.registrationLink);
              }}
              className="bg-[#4a3728] py-2 px-4 rounded-full items-center self-start"
              activeOpacity={0.8}
            >
              <Text className="text-white text-xs font-bold">Register / Join</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* ── Document Attachments ── */}
      {documents.length > 0 && (
        <View className="mb-3 gap-2">
          {documents.map((doc: any, idx: number) => {
            const docUrl = getMediaUrl(doc);
            const docName = doc.name || `Document ${idx + 1}.pdf`;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  if (docUrl) Linking.openURL(docUrl);
                }}
                className="flex-row items-center gap-3 p-3 bg-white/70 border border-[#e0d8cf] rounded-2xl"
                activeOpacity={0.7}
              >
                <FileIcon />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#4a3728]" numberOfLines={1}>
                    {docName}
                  </Text>
                  <Text className="text-[10px] text-[#6b5643]">Attachment • Tap to view</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <View className="rounded-2xl overflow-hidden mb-3">
          <Video
            source={{ uri: videos[0] }}
            style={{ width: '100%', height: 224 }}
            resizeMode="cover"
            controls={true}
            paused={true}
          />
        </View>
      )}

      {/* Images */}
      {images.length === 1 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setSelectedImage(images[0]);
            setViewerVisible(true);
          }}
          className="rounded-2xl overflow-hidden bg-brand-border/10"
        >
          <Image
            source={{ uri: images[0] }}
            style={{
              width: '100%',
              aspectRatio: aspectRatio,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {images.length > 1 && (
        <View className="flex-row flex-wrap gap-1 rounded-2xl overflow-hidden">
          {images.slice(0, 4).map((uri, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedImage(uri);
                setViewerVisible(true);
              }}
              style={{
                width: images.length === 2 ? '49%' : '49%',
                aspectRatio: 1,
              }}
              className="overflow-hidden rounded-xl"
            >
              <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {idx === 3 && images.length > 4 && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <Text className="text-white text-xl font-black">
                    +{images.length - 4}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={selectedImage}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

export default PostContent;

