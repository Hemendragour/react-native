export type RootStackParamList = {
  StudyHome: undefined;
  Dashboard: undefined;
  Timer: undefined;
  Todo: undefined;
  Goals: undefined;
  Leaderboard: undefined;
  Profile: { userId?: string } | undefined;
  UserProfile: { userId?: string } | undefined;
  MyGroups: undefined;
  GroupLobby: { groupId: string | number; groupName?: string };
  GroupRoom: { groupId: string | number; groupName?: string; isAdmin?: boolean; isCreator?: boolean };
  GroupChat: { groupId: string | number; groupName?: string };
  StudySearch: { query?: string };
};