import { ApplicationStatus } from './jobs';

export const LOGO_BG: Record<string, string> = {
  T8: '#4a3728', NL: '#2d4a6b', OR: '#7a3d1a',
  DC: '#1a5c3a', FM: '#6b1a3a', PL: '#1a4a6b',
  LC: '#6b4a1a', ST: '#3a3a3a',
};

export const WORK_MODE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  remote: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }, // emerald
  hybrid: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }, // amber
  onsite: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' }, // rose
};

export const TYPE_LABEL: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
};

export const formatSalary = (min: number, max: number): string =>
  `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;

export const timeAgo = (dateStr: string): string => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};
