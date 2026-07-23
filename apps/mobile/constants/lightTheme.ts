/**
 * VinR Light Mode — Warm Parchment Design System
 *
 * Warm cream-white palette that keeps brand gold/emerald/sapphire vivid.
 * Every token mirrors the dark theme structure so useTheme() is a
 * drop-in replacement — just swap the color set.
 */

export const lightColors = {
    // ── Backgrounds ──
    void: '#F5F2EC',       // warm parchment — replaces deep black
    surface: '#FFFFFF',    // pure white cards
    elevated: '#EDE9E1',   // slightly warm elevated layer

    // ── Brand (unchanged — vivid on light backgrounds) ──
    gold: '#B8832A',       // slightly deeper gold for light bg contrast
    goldLight: '#D4A853',
    goldGlow: 'rgba(184,131,42,0.12)',
    goldMuted: 'rgba(184,131,42,0.06)',

    // ── Semantic ──
    emerald: '#2EA87E',        // deeper green for contrast on white
    emeraldGlow: 'rgba(46,168,126,0.10)',
    sapphire: '#2C6DB3',       // deeper blue for legibility
    sapphireGlow: 'rgba(44,109,179,0.08)',
    crimson: '#C94040',
    crimsonGlow: 'rgba(201,64,64,0.08)',
    lavender: '#6B5FB5',
    lavenderGlow: 'rgba(107,95,181,0.08)',

    // ── Text ──
    textPrimary: '#1A1208',    // near-black warm
    textSecondary: '#4A3F2F',  // deep brown
    textMuted: '#5C5446',      // Darker muted brown for accessibility
    textGhost: '#8B8272',      // Darker ghost grey for visibility on parchment

    // ── Borders ──
    border: 'rgba(0,0,0,0.08)',
    borderLight: 'rgba(0,0,0,0.14)',
    borderGold: 'rgba(184,131,42,0.25)',
} as const;

export const lightGradients = {
    void: ['#F5F2EC', '#F0EDE6', '#EDE9E0'] as const,
    voidReversed: ['#EDE9E0', '#F0EDE6', '#F5F2EC'] as const,
    sleep: ['#E8E4DE', '#EDE9E2', '#E5E1DA'] as const,
    sunrise: ['#FDF6EC', '#F5F2EC', '#EDE9E1'] as const,
    goldShimmer: ['#B8832A', '#D4A853', '#B8832A'] as const,
} as const;

export const lightGlass = {
    background: 'rgba(255,255,255,0.88)',
    backgroundLight: 'rgba(255,255,255,0.65)',
    border: 'rgba(0,0,0,0.07)',
    borderHover: 'rgba(0,0,0,0.12)',
} as const;
