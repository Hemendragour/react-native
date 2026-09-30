// === OLD CODE (Original type definitions without userId fields) ===
// export type TabType = 'grow' | 'catchup';
// export type RequestTabType = 'received' | 'sent';
//
// export interface Person {
//   id: string;
//   name: string;
//   title: string;
//   location: string;
//   mutuals: string;
//   image: string;
// }
//
// export interface Company {
//   id: string;
//   name: string;
//   industry: string;
//   location: string;
//   employees: string;
//   followersCount?: number;
//   image: string;
// }
//
// export interface ConnectionRequest {
//   id: string;
//   name: string;
//   title: string;
//   mutuals: string;
//   image: string;
//   userId: string;
// }
//
// export interface SentRequest {
//   id: string;
//   name: string;
//   title: string;
//   image: string;
//   userId: string;
// }
//
// export interface PremiumUser {
//   name: string;
//   title: string;
//   stats: string;
//   badge: string;
//   achievements: string[];
//   img: string;
// }

// === NEW CODE (Extended types with userId for navigation, network stats) ===
export type TabType = 'grow' | 'catchup';
export type RequestTabType = 'received' | 'sent';

export interface Person {
  id: string;
  userId?: string;
  name: string;
  title: string;
  location: string;
  mutuals: string;
  image: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: string;
  followersCount?: number;
  image: string;
}

export interface ConnectionRequest {
  id: string;
  userId: string;
  name: string;
  title: string;
  mutuals: string;
  image: string;
}

export interface SentRequest {
  id: string;
  userId: string;
  name: string;
  title: string;
  image: string;
}

export interface PremiumUser {
  name: string;
  title: string;
  stats: string;
  badge: string;
  achievements: string[];
  img: string;
}

export interface NetworkStats {
  connections: number;
  following: number;
  followers: number;
  groups: number;
  pendingRequests: number;
}

export type CatchUpType = 'birthday' | 'work_anniversary' | 'job_change' | 'milestone' | 'general';

export interface CatchUpItem {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  image?: string;
  type: CatchUpType;
  title: string;
  description: string;
  date?: string;
  congratulated?: boolean;
}

export interface NetworkHealthData {
  score: number; // 0-100
  label: string; // 'Exceptional' | 'Strong' | 'Growing' | 'Needs Attention'
  insights: string[];
  totalConnections: number;
  activeRatio: number;
  diversityScore: number;
  industryBreakdown: { industry: string; percentage: number }[];
  growthThisMonth: number;
}

export interface MutualConnectionUser {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  image?: string;
  mutualCount?: number;
}

export interface ProfileViewerDetail {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  image?: string;
  viewedAt: string;
  timeAgo?: string;
}

