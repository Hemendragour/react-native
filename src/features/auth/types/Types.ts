export type AuthStackParamList = {
  Login: undefined;
  Signup: {
    isGoogleOnboarding?: boolean;
    idToken?: string;
    initialData?: {
      email?: string;
      firstName?: string;
      lastName?: string;
    };
  } | undefined;
};

export type AppStackParamlist = {
  Home: undefined;
  Dashboard: undefined;
  Profile: { userId?: string } | undefined;
  Network: undefined;
  Study: undefined;
  Mentorship: undefined;
  MentorDashboard: { initialPage?: string } | undefined;
  UserDashboard: undefined;
  MentorProfile: { mentorId?: string } | undefined;
  SeniorMentorApplication: undefined;
  Notifs: undefined;
  Jobs: undefined;
  Search: { query: string };
  MessagesList: undefined;
  Chat: { userId: string, userName: string, userAvatar?: string, userRole?: string };
  PostDetail: { postId: string; openComments?: boolean };
  ProfileAnalytics: { userId?: string } | undefined;
};
