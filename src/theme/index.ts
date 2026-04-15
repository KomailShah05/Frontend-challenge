/**
 * Two-tone colour palette keyed to semantic roles.
 *
 * Rule: components never reference raw hex values — they use a token name
 * from this file so a theme swap is a one-line change.
 *
 * Palette source: Tailwind CSS slate + red + green scales.
 */

export interface ThemeColors {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  readonly bg: string;
  readonly cardBg: string;
  readonly inputBg: string;
  readonly skeletonBg: string;

  // ── Text ──────────────────────────────────────────────────────────────────
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;

  // ── Borders ───────────────────────────────────────────────────────────────
  readonly border: string;
  readonly borderDashed: string;

  // ── Primary action button ─────────────────────────────────────────────────
  readonly btnPrimary: string;
  readonly btnPrimaryText: string;
  readonly btnDisabled: string;
  readonly btnDisabledText: string;

  // ── Error / validation ────────────────────────────────────────────────────
  readonly errorBg: string;
  readonly errorText: string;
  readonly errorBorder: string;

  // ── Favourite button ──────────────────────────────────────────────────────
  readonly heartFilled: string;
  readonly heartEmpty: string;
  readonly heartBadgeBg: string;

  // ── Vote buttons ──────────────────────────────────────────────────────────
  readonly voteDefault: string;
  readonly voteUpBg: string;
  readonly voteDownBg: string;
  readonly voteUpText: string;
  readonly voteDownText: string;
  readonly voteArrowDefault: string;

  // ── Score ─────────────────────────────────────────────────────────────────
  readonly scorePositive: string;
  readonly scoreNegative: string;
  readonly scoreNeutral: string;

  // ── Navigation ────────────────────────────────────────────────────────────
  readonly headerBg: string;
  readonly headerText: string;
  readonly headerTint: string;
  readonly statusBarStyle: 'dark-content' | 'light-content';
}

export const lightTheme: ThemeColors = {
  bg: '#f9fafb',
  cardBg: '#ffffff',
  inputBg: '#f3f4f6',
  skeletonBg: '#e5e7eb',

  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',

  border: '#e5e7eb',
  borderDashed: '#d1d5db',

  btnPrimary: '#111827',
  btnPrimaryText: '#ffffff',
  btnDisabled: '#d1d5db',
  btnDisabledText: '#9ca3af',

  errorBg: '#fef2f2',
  errorText: '#dc2626',
  errorBorder: '#ef4444',

  heartFilled: '#ef4444',
  heartEmpty: '#d1d5db',
  heartBadgeBg: 'rgba(255,255,255,0.92)',

  voteDefault: '#f3f4f6',
  voteUpBg: '#dcfce7',
  voteDownBg: '#fee2e2',
  voteUpText: '#16a34a',
  voteDownText: '#dc2626',
  voteArrowDefault: '#9ca3af',

  scorePositive: '#16a34a',
  scoreNegative: '#dc2626',
  scoreNeutral: '#374151',

  headerBg: '#ffffff',
  headerText: '#111827',
  headerTint: '#111827',
  statusBarStyle: 'dark-content',
};

export const darkTheme: ThemeColors = {
  bg: '#0f172a',
  cardBg: '#1e293b',
  inputBg: '#1e293b',
  skeletonBg: '#334155',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',

  border: '#334155',
  borderDashed: '#475569',

  btnPrimary: '#f1f5f9',
  btnPrimaryText: '#0f172a',
  btnDisabled: '#334155',
  btnDisabledText: '#64748b',

  errorBg: '#450a0a',
  errorText: '#fca5a5',
  errorBorder: '#ef4444',

  heartFilled: '#f87171',
  heartEmpty: '#475569',
  heartBadgeBg: 'rgba(15,23,42,0.88)',

  voteDefault: '#1e293b',
  voteUpBg: '#052e16',
  voteDownBg: '#450a0a',
  voteUpText: '#86efac',
  voteDownText: '#fca5a5',
  voteArrowDefault: '#64748b',

  scorePositive: '#86efac',
  scoreNegative: '#fca5a5',
  scoreNeutral: '#cbd5e1',

  headerBg: '#0f172a',
  headerText: '#f1f5f9',
  headerTint: '#f1f5f9',
  statusBarStyle: 'light-content',
};
