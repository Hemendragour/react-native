export type Visibility = 'public' | 'private';

export interface CreateGroupFormData {
  title: string;
  description: string;
  category: string;
  leader: string;
  capacity: number;
  goalHours: number;
  visibility: Visibility;
  cameraOn: boolean;
  attendanceRequired: boolean;
  attendanceAvg: number;
}

// export const CATEGORIES = ['School Student', 'College Student', 'Other'] as const;

export const CATEGORIES = [
  'JEE',
  'NEET',
  'Competitive Examinations',
  'College Students',
  'Working Professionals',
  'Language Learning',
  'Placement Preparation',
  'Other'
] as const;

export const DEFAULT_FORM: CreateGroupFormData = {
  title: '',
  description: '',
  category: '',
  leader: '',
  capacity: 20,
  goalHours: 8,
  visibility: 'public',
  cameraOn: false,
  attendanceRequired: false,
  attendanceAvg: 75,
};