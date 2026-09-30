// src/features/home/types/feed.types.ts

export type ReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny';

export type ReportReason =
  | 'spam_or_misleading'
  | 'harassment_or_bullying'
  | 'hate_speech'
  | 'nudity_or_sexual_content'
  | 'false_information'
  | 'something_else';

export interface PollOption {
  optionId: string;
  text: string;
  votes: number;
  votedBy?: string[];
}

export interface PollData {
  question: string;
  options: PollOption[];
  duration: number; // 1, 3, 7, 14
  endsAt: string;
  totalVotes: number;
  isActive: boolean;
  userVotedOptionId?: string | null;
}

export interface EventData {
  eventType?: 'online' | 'in-person' | 'hybrid';
  eventFormat?: 'conference' | 'webinar' | 'workshop' | 'meetup' | 'seminar' | 'other';
  eventName: string;
  timezone?: string;
  startDate?: string;
  startTime?: string;
  description?: string;
  registrationLink?: string;
}

export interface FeedMedia {
  mediaId?: string;
  type: 'image' | 'video' | 'document';
  cloudinarySecureUrl?: string;
  url?: string;
  uri?: string;
  width?: number;
  height?: number;
  name?: string;
}

export interface ConnectionSocialProof {
  userId: string;
  name: string;
  avatar: string | null;
}

export interface FeedPost {
  entryId: string;
  postId?: string;
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  content: string;
  mood?: 'happy' | 'thoughtful' | 'excited' | 'reflective' | 'grateful' | string;
  isPublic: boolean;
  postUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sendsCount: number;
  likedBy?: string[];
  isLikedByCurrentUser: boolean;
  currentUserReaction?: ReactionType | null;
  images: (FeedMedia | string)[];
  videos: (FeedMedia | string)[];
  documents: (FeedMedia | string)[];
  pollData?: PollData | null;
  eventData?: EventData | null;
  feedItemType?: 'post' | 'repost' | string;
  repostId?: string;
  repostType?: 'repost' | 'quote';
  thoughtText?: string;
  originalPost?: FeedPost | null;
  connectionStatus?: 'self' | 'none' | 'pending' | 'connected' | string;
  connectionDegree?: 1 | 2 | 3 | null;
  degreeLabel?: string | null;
  matchedInterests?: string[];
  feedScore?: number;
  likedByConnections?: string[];
  likedByConnectionsAvatars?: string[];
  likedByConnectionsFull?: ConnectionSocialProof[];
  commentedByConnections?: string[];
  commentedByConnectionsAvatars?: string[];
  commentedByConnectionsFull?: ConnectionSocialProof[];
  createdAt: string;
  user?: string;
  avatar?: string;
  role?: string;
  time?: string;
  currentUserHasReposted?: boolean;
  isSaved?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface FeedPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FeedResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    posts: FeedPost[];
    pagination?: FeedPagination;
  };
  timestamp?: string;
}

export interface PostReactor {
  userId: string;
  name: string;
  avatar?: string | null;
  role?: string | null;
  headline?: string | null;
  reactionType: ReactionType;
  reactedAt?: string;
}
