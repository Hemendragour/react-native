// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface Course {
  id: number;
  name: string;
  instructor: string;
  progress: number;
  duration: string;
  enrolled: string;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  lastAccessed: string;
  estimatedCompletion: string;
  assignments: { completed: number; total: number };
  quizzes: { completed: number; total: number };
  watchTime: string;
}

export interface CompletedCourse {
  id: number;
  name: string;
  instructor: string;
  completedDate: string;
  score: number;
  duration: string;
  certificateId: string;
  thumbnail: string;
  totalStudents: number;
  finalProject: string;
  skills: string[];
  certificateUrl: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  category: string;
  members: number;
  progress: number;
  nextSession: string;
  sessionTopic: string;
  active: boolean;
  meetingLink: string;
  leader: string;
  weeklyHours: number;
  description: string;
  achievements: string[];
  studyStreak: number;
  totalSessions: number;
  attendanceRate: number;
}

export interface UpcomingSession {
  id: number;
  group: string;
  time: string;
  topic: string;
}

export interface UpcomingCourseSession {
  id: number;
  course: string;
  time: string;
  topic: string;
}

export interface StudyTrendPoint {
  day: string;
  hours: number;
}

export interface SubjectShare {
  name: string;
  value: number;
  color: string;
}

export interface StudentData {
  name: string;
  email: string;
  studentId: string;
  avatar: string;
  totalHours: number;
  groupsJoined: number;
  completedCoursesCount: number;
  currentStreak: number;
  joinedDate: string;
  totalPoints: number;
  rank: string;
  averageScore: number;
  weeklyGoal: number;
  weeklyProgress: number;
  myCourses: Course[];
  completedCourses: CompletedCourse[];
  myGroups: StudyGroup[];
  upcomingSessions: UpcomingSession[];
  upcomingCourseSessions: UpcomingCourseSession[];
  studyTrend: StudyTrendPoint[];
  subjectShare: SubjectShare[];
}

export type MainTab = 'courses' | 'groups';
export type CourseTab = 'enrolled' | 'completed' | 'certificates';