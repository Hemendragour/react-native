// Mentor screen shared constants — mirrors data.ts from web

export const C = {
  bg: '#fbf7f3',
  surface: '#f3ece4',
  border: '#e0d8cf',
  muted: '#d8cec4',
  dark: '#4a3728',
  mid: '#7a5c3e',
  white: '#ffffff',
  disabled: '#b5a79a',
} as const;

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const PAY_METHODS = [
  { id: 'upi',        icon: '📱', label: 'UPI',               sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'netbanking', icon: '🏦', label: 'Net Banking',       sub: 'All major banks supported' },
  { id: 'card',       icon: '💳', label: 'Credit/Debit Card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'wallet',     icon: '👛', label: 'Wallets',           sub: 'Paytm, Amazon Pay, more' },
];

export const BANKS = [
  'State Bank of India','HDFC Bank','ICICI Bank',
  'Axis Bank','Punjab National Bank','Bank of Baroda',
];
export const WALLETS = ['Paytm','Amazon Pay','PhonePe','Mobikwik'];

export const MENTOR = {
  name: 'Dhananjay Sharma',
  rating: 4.9,
  title: 'Corporate Finance Manager @ Somany Impresa Group',
  education: 'IIM Ranchi MBA\'24',
  achievement: '(Director\'s Merit List) | Ex-J.P. Morgan Chase & Co. Intern',
  experience: '4 years of Experience',
  totalEngagements: 2313,
  attendance: '93%',
  responseTime: '< 2 hours',
  successRate: '97%',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
  verified: true,
  about: 'Experienced Corporate Finance Manager with expertise in financial planning, analysis, and strategic decision-making.',
  workExperience: [
    { company: 'Somany Impresa Group', position: 'Corporate Finance Manager', duration: '2022 - Present', location: 'Mumbai, India', description: 'Leading financial planning and analysis for the organization' },
    { company: 'J.P. Morgan Chase & Co.', position: 'Finance Intern', duration: '2021 - 2022', location: 'Mumbai, India', description: 'Worked on financial modeling and investment analysis' },
  ],
};

export const REVIEWS = [
  { id: 1, name: 'Priya Sharma',   rating: 5,   date: '2 days ago',  comment: 'Excellent guidance on CV preparation. Very actionable!', service: 'Quick CV/Resume Review', verified: true },
  { id: 2, name: 'Rahul Kumar',    rating: 5,   date: '5 days ago',  comment: 'Amazing mentor! Got recruiter messages within a week.', service: 'LinkedIn Zero to Hero', verified: true },
  { id: 3, name: 'Ananya Reddy',   rating: 4.5, date: '1 week ago',  comment: 'Very knowledgeable and patient. Highly recommend.', service: 'GD/PI Prep', verified: true },
  { id: 4, name: 'Vikram Singh',   rating: 5,   date: '1 week ago',  comment: 'Quick and to the point. Great value for money!', service: 'Quick Call', verified: false },
  { id: 5, name: 'Sneha Patel',    rating: 5,   date: '2 weeks ago', comment: 'The resume template is fantastic and really ATS-friendly.', service: 'ATS Friendly Resume-Template', verified: true },
];

export const SESSION_TYPE_LABEL: Record<string, string> = {
  quick_call: '1:1 Call', mock_interview: '1:1 Call', resume_review: '1:1 Call',
  career_planning: '1:1 Call', group_session: 'Group', deep_dive: '1:1 Call',
  portfolio_review: '1:1 Call',
};

export const SESSION_TYPE_FILTER: Record<string, string> = {
  quick_call: 'Quick Call', mock_interview: 'Mock Interview', resume_review: 'Resume Review',
  career_planning: 'Career Planning', group_session: 'Group Session',
  deep_dive: 'Deep Dive', portfolio_review: 'Portfolio Review',
};