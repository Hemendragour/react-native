export interface Group {
  id: string | number;
  title: string;
  description: string;
  category: string;
  rank: number;
  visibility: 'public' | 'private';
  cameraOn: boolean;
  members: number;
  capacity: number;
  leader: string;
  goalHours: number;
  attendanceAvg: number;
  section?: 'university' | 'dsa' | 'jee';
}

export interface PublicGroup {
  id: string | number;
  title: string;
  members: number;
}

