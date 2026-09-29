import { Group, PublicGroup } from './types';

export const universityGroups: Group[] = [
  { id: 1, title: 'Focus JEE Warriors', description: 'A disciplined study group for serious JEE aspirants. Daily problem-solving sessions.', cameraOn: true, goalHours: 12, attendanceAvg: 82, leader: 'Aman Sharma', visibility: 'public', category: 'JEE Aspirant', capacity: 30, members: 15, rank: 1, section: 'university' },
  { id: 2, title: 'Night Study Club', description: 'Late-night study group designed for NEET aspirants. Calm environment.', cameraOn: false, goalHours: 10, attendanceAvg: 74, leader: 'Riya Verma', visibility: 'private', category: 'College', capacity: 25, members: 20, rank: 2, section: 'university' },
  { id: 3, title: 'DSA Placement Prep', description: 'Focused group for students preparing for technical placements.', cameraOn: true, goalHours: 8, attendanceAvg: 68, leader: 'Kunal Mehta', visibility: 'public', category: 'Placement Prep', capacity: 40, members: 32, rank: 3, section: 'university' },
  { id: 4, title: 'Language Skills Booster', description: 'Improve your spoken and professional language skills. Daily practice sessions.', cameraOn: false, goalHours: 6, attendanceAvg: 91, leader: 'Neha Singh', visibility: 'public', category: 'College', capacity: 20, members: 10, rank: 4, section: 'university' },
  { id: 5, title: 'Morning Momentum', description: 'Early morning study sessions for serious aspirants.', cameraOn: true, goalHours: 4, attendanceAvg: 88, leader: 'Priya Patel', visibility: 'public', category: 'General', capacity: 15, members: 12, rank: 5, section: 'university' },
];

export const DSAGroups: Group[] = [
  { id: 10, title: 'LeetCode Daily Grind', description: 'Solve 2 problems every day. Weekly contests and peer reviews.', cameraOn: false, goalHours: 6, attendanceAvg: 79, leader: 'Arjun Singh', visibility: 'public', category: 'Placement Prep', capacity: 50, members: 38, rank: 6, section: 'dsa' },
  { id: 11, title: 'System Design Pro', description: 'High-level design discussions and mock interviews for SDE roles.', cameraOn: true, goalHours: 8, attendanceAvg: 84, leader: 'Vikram Joshi', visibility: 'public', category: 'Placement Prep', capacity: 25, members: 18, rank: 7, section: 'dsa' },
  { id: 12, title: 'FAANG Interview Club', description: 'Targeted prep for top-tier tech company interviews.', cameraOn: true, goalHours: 10, attendanceAvg: 90, leader: 'Sneha Reddy', visibility: 'private', category: 'Placement Prep', capacity: 20, members: 19, rank: 8, section: 'dsa' },
  { id: 13, title: 'Competitive Coding Squad', description: 'Codeforces, Codechef and competitive programming every day.', cameraOn: false, goalHours: 5, attendanceAvg: 72, leader: 'Rohit Das', visibility: 'public', category: 'Placement Prep', capacity: 35, members: 22, rank: 9, section: 'dsa' },
];

export const JEEGroups: Group[] = [
  { id: 20, title: 'JEE Advanced Elite', description: 'Top 1% preparation. Intense mock tests and analysis sessions.', cameraOn: true, goalHours: 14, attendanceAvg: 93, leader: 'Harshit Agarwal', visibility: 'private', category: 'JEE Aspirant', capacity: 15, members: 14, rank: 1, section: 'jee' },
  { id: 21, title: 'Physics Mastery Group', description: 'Deep dive into JEE Physics concepts with problem-solving.', cameraOn: true, goalHours: 10, attendanceAvg: 85, leader: 'Ananya Soni', visibility: 'public', category: 'JEE Aspirant', capacity: 30, members: 21, rank: 2, section: 'jee' },
  { id: 22, title: 'Chemistry Scholars', description: 'Organic, inorganic and physical chemistry with daily quizzes.', cameraOn: false, goalHours: 8, attendanceAvg: 78, leader: 'Raj Kapoor', visibility: 'public', category: 'JEE Aspirant', capacity: 25, members: 17, rank: 3, section: 'jee' },
  { id: 23, title: 'Maths Warriors JEE', description: 'Calculus, algebra and coordinate geometry group.', cameraOn: true, goalHours: 12, attendanceAvg: 87, leader: 'Meera Gupta', visibility: 'public', category: 'JEE Aspirant', capacity: 20, members: 16, rank: 4, section: 'jee' },
];

export const publicGroupsData: PublicGroup[] = [
  { id: 101, title: 'Delhi University Placement Prep', members: 214 },
  { id: 102, title: 'Mumbai Web Development Circle', members: 168 },
  { id: 103, title: 'Chennai Aptitude Masters', members: 142 },
  { id: 104, title: 'Pune Core CS Study Group', members: 196 },
  { id: 105, title: 'Bangalore Interview Practice Hub', members: 233 },
  { id: 106, title: 'Hyderabad DSA Daily Practice', members: 187 },
];

export const topRankedGroups = [
  { id: 1, title: 'Focus JEE Warriors', leader: 'Aman Sharma', members: 15, capacity: 30, attendanceAvg: 82, rank: 1, imgUrl: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, title: 'NEET Night Study Club', leader: 'Riya Verma', members: 20, capacity: 25, attendanceAvg: 74, rank: 2, imgUrl: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, title: 'DSA Placement Prep', leader: 'Kunal Mehta', members: 32, capacity: 40, attendanceAvg: 68, rank: 3, imgUrl: 'https://i.pravatar.cc/150?img=12' },
];
