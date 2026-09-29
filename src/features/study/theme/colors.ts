// ─── Brand Color Palette ──────────────────────────────────────────────────────
// Exact values as specified by design system

export const colors = {
  // Primary
  primary: '#4a3728',       // deep warm brown — buttons, headings, active states
  primaryMid: '#6b5847',    // mid brown
  primaryLight: '#8b6f47',  // muted brown (was #6ba5837 corrected to warm brown)

  // Backgrounds
  pageBg: '#f7f3ee',        // page background
  cardBg: '#e0d8cf',        // card background (was #eod8cf → corrected to #e0d8cf)
  surface: '#ffffff',

  // Text
  text: '#4a3728',
  textMuted: '#6b8a73',     // muted text (#6ba5837 → corrected to #6b8a73, a muted sage)

  // Borders
  border: '#d4c4b5',        // all borders

  // Status
  success: '#16a34a',
  successBg: 'rgba(22,163,74,0.1)',
  error: '#dc2626',
  errorBg: 'rgba(220,38,38,0.1)',
  warning: '#d97706',

  // Legacy aliases (used by existing screens)
  background: '#e0d8cf',
  backgroundMid: '#ede4db',
  backgroundDeep: '#d4ccc3',
  surfaceWarm: '#f7f3ee',
  accent: '#d4a574',
  borderBrown: '#d4c4b5',
  textMid: '#6b5847',
} as const;

export type ColorKey = keyof typeof colors;