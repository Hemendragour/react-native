// mentorMockData.ts  — mirrors web mock_data.tsx
export const MENTORS = [
  { id: 1, name: 'Sarah Chen',     role: 'Product Lead',   company: 'Google',   rating: 4.9, sessions: 1240, price: 1500, match: 98, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400', tags: ['Strategy','PM'],      exp: '8 Yrs',  expTotal: 8,  isDummy: false },
  { id: 2, name: 'David Miller',   role: 'Staff Engineer', company: 'Netflix',  rating: 5.0, sessions: 850,  price: 2500, match: 94, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', tags: ['Backend','Systems'], exp: '12 Yrs', expTotal: 12, isDummy: false },
  { id: 3, name: 'Arjun Mehta',    role: 'SDE-3',          company: 'Amazon',   rating: 4.8, sessions: 2100, price: 1200, match: 89, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400', tags: ['DSA','Java'],        exp: '5 Yrs',  expTotal: 5,  isDummy: false },
  { id: 4, name: 'Elena Rodriguez',role: 'Design Head',    company: 'Airbnb',   rating: 4.9, sessions: 430,  price: 1800, match: 91, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400', tags: ['UI/UX','Branding'],  exp: '10 Yrs', expTotal: 10, isDummy: false },
  { id: 5, name: 'Marcus Thorne',  role: 'Growth Lead',    company: 'Meta',     rating: 4.7, sessions: 920,  price: 2000, match: 85, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400', tags: ['Marketing','Ads'],   exp: '7 Yrs',  expTotal: 7,  isDummy: false },
  { id: 6, name: 'Sophia Kim',     role: 'Data Scientist', company: 'Spotify',  rating: 5.0, sessions: 640,  price: 2200, match: 96, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400', tags: ['AI/ML','Python'],    exp: '6 Yrs',  expTotal: 6,  isDummy: false },
];

export const MASTERCLASSES = [
  { id: 1, title: 'System Design Mastery for FAANG Interviews', mentorName: 'David Miller', mentorRole: 'Staff Engineer @ Netflix', mentorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800', description: 'Master distributed systems, scalability patterns, and architectural decisions.', duration: '6 Weeks', badge: 'Advanced', enrolled: '2.4K', rating: '4.9', price: '12,999' },
  { id: 2, title: 'Product Management: Zero to PM at Google', mentorName: 'Sarah Chen', mentorRole: 'Product Lead @ Google', mentorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800', description: 'Learn product strategy, roadmapping, and frameworks used by Google\'s top PMs.', duration: '8 Weeks', badge: 'Beginner Friendly', enrolled: '3.1K', rating: '5.0', price: '14,999' },
  { id: 3, title: 'UI/UX Design Systems & Prototyping', mentorName: 'Elena Rodriguez', mentorRole: 'Design Head @ Airbnb', mentorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800', description: 'Build world-class design systems using Figma advanced techniques.', duration: '5 Weeks', badge: 'Pro Level', enrolled: '1.8K', rating: '4.8', price: '9,999' },
];

export const UPCOMING_MASTERCLASSES = [
  { id: 1, title: 'Advanced React Patterns & Performance', mentorName: 'Alex Rivera', mentorRole: 'Senior Frontend @ Meta', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800', date: '15 Jan', time: '6:00 PM IST' },
  { id: 2, title: 'Building Scalable APIs with Node.js', mentorName: 'Priya Sharma', mentorRole: 'Backend Lead @ Amazon', image: 'https://images.unsplash.com/photo-1629904853716-f0bc54eea481?q=80&w=800', date: '18 Jan', time: '7:30 PM IST' },
  { id: 3, title: 'Data Analytics for Product Decisions', mentorName: 'Michael Chen', mentorRole: 'Data PM @ Google', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800', date: '22 Jan', time: '5:00 PM IST' },
];

export const TOP_COMPANIES = [
  { name: 'Google',  color: '#4285F4' },
  { name: 'Meta',    color: '#0668E1' },
  { name: 'Amazon',  color: '#FF9900' },
  { name: 'Netflix', color: '#E50914' },
];
export const TOP_COMPANIES_ROW2 = [
  { name: 'Apple',     color: '#000000' },
  { name: 'Tesla',     color: '#E82127' },
  { name: 'Microsoft', color: '#00A4EF' },
  { name: 'Adobe',     color: '#FF0000' },
];

export const GRADIENT_COLORS = [
  { start: '#e8dfd6', end: '#d4c4b5' },
  { start: '#f5e6d8', end: '#e8d4c1' },
  { start: '#e0d5ca', end: '#cbbfb0' },
];

export const FAQS = [
  { q: 'How do I book a session with a mentor?', a: 'Simply browse mentors, click \'Book\', select your preferred time slot, and complete the payment.' },
  { q: 'What if I need to cancel or reschedule?', a: 'You can cancel or reschedule up to 24 hours before the session for a full refund.' },
  { q: 'Are the mentors verified?', a: 'Yes! All mentors go through a rigorous verification process including background checks and interview assessments.' },
  { q: 'How do masterclasses work?', a: 'Masterclasses are structured multi-week courses with live sessions, recorded content, assignments, and direct mentor interaction.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets.' },
];

export const NEXT_7_DAYS = [
  { day: 'Mon', date: '06 Jan' }, { day: 'Tue', date: '07 Jan' },
  { day: 'Wed', date: '08 Jan' }, { day: 'Thu', date: '09 Jan' },
  { day: 'Fri', date: '10 Jan' }, { day: 'Sat', date: '11 Jan' },
  { day: 'Sun', date: '12 Jan' },
];

export const DASHBOARD_MENU_ITEMS = [
  { id: 'profile',      label: 'Profile',       icon: '👤' },
  { id: 'dashboard',    label: 'Overview',      icon: '📊' },
  { id: 'services',     label: 'Services',      icon: '🛠️' },
  { id: 'booking',      label: 'Bookings',      icon: '📅' },
  { id: 'queries',      label: 'Queries',       icon: '❓' },
  { id: 'availability', label: 'Availability',  icon: '🕐' },
  { id: 'payment',      label: 'Payments',      icon: '💳' },
  { id: 'review',       label: 'Reviews',       icon: '⭐' },
  { id: 'analytics',    label: 'Analytics',     icon: '📈' },
  { id: 'marketing',    label: 'Marketing Kit', icon: '📦' },
  { id: 'plans',        label: 'Plans',         icon: '🏆' },
  { id: 'trust',        label: 'Trust Score',   icon: '🛡️' },
  { id: 'community',    label: 'Community',     icon: '👥' },
  { id: 'notification', label: 'Notification',  icon: '🔔' },
];