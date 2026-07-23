/**
 * VinR Midnight Gold Design System — Premium Tokens
 *
 * Color palette inspired by Calm + Stripe + Linear aesthetics.
 * Every token serves an emotional purpose: dark backgrounds = safety,
 * gold accents = reward, emerald = growth, sapphire = trust.
 */

export const colors = {
    // ── Backgrounds ──
    void: '#07090F',
    surface: '#0F1320',
    elevated: '#161C2E',

    // ── Brand ──
    gold: '#D4A853',
    goldLight: '#F0C96B',
    goldGlow: 'rgba(212,168,83,0.15)',
    goldMuted: 'rgba(212,168,83,0.08)',

    // ── Semantic ──
    emerald: '#4ECBA0',
    emeraldGlow: 'rgba(78,203,160,0.12)',
    sapphire: '#4A90D9',
    sapphireGlow: 'rgba(74,144,217,0.10)',
    crimson: '#E85D5D',
    crimsonGlow: 'rgba(232,93,93,0.10)',
    lavender: '#8B7EC8',
    lavenderGlow: 'rgba(139,126,200,0.10)',

    // ── Text ──
    textPrimary: '#EEF0F7',
    textSecondary: '#B0B8D4',
    textMuted: '#7A8099',
    textGhost: '#3D4560',

    // ── Borders ──
    border: 'rgba(255,255,255,0.07)',
    borderLight: 'rgba(255,255,255,0.12)',
    borderGold: 'rgba(212,168,83,0.25)',
} as const;

export const gradients = {
    void: ['#0A0E1A', '#07090F', '#070B14'] as const,
    voidReversed: ['#070B14', '#07090F', '#0A0E1A'] as const,
    sleep: ['#0A0E1A', '#0D1428', '#0A1018'] as const,
    sunrise: ['#1A150F', '#0F1320', '#07090F'] as const,
    goldShimmer: ['#D4A853', '#F0C96B', '#D4A853'] as const,
} as const;

export const fonts = {
    display: 'PlayfairDisplay_700Bold',
    displayBlack: 'PlayfairDisplay_900Black',
    body: 'DMSans_400Regular',
    bodyLight: 'DMSans_300Light',
    bodySemiBold: 'DMSans_600SemiBold',
    italic: 'CormorantGaramond_300Light_Italic',
    mono: 'JetBrainsMono_400Regular',
} as const;

export const typography = {
    h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, color: colors.textPrimary },
    h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, color: colors.textPrimary },
    h3: { fontFamily: fonts.display, fontSize: 20, lineHeight: 28, color: colors.textPrimary },
    h4: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.textPrimary },
    body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textPrimary },
    bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textPrimary },
    caption: { fontFamily: fonts.bodyLight, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
    label: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.5, color: colors.textMuted, textTransform: 'uppercase' as const },
    bodySemiBold: { fontFamily: fonts.bodySemiBold, fontSize: 16, lineHeight: 24, color: colors.textPrimary },
} as const;

export const spacing = {
    '2xs': 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
} as const;

export const animation = {
    spring: {
        stiffness: 100,
        damping: 14,
    },
    springBouncy: {
        stiffness: 150,
        damping: 12,
    },
    springStiff: {
        stiffness: 300,
        damping: 20,
    },
    stagger: 80,
    pressScale: 0.96,
} as const;

/** Reusable glassmorphism surface */
export const glass = {
    background: 'rgba(15, 19, 32, 0.85)',
    backgroundLight: 'rgba(15, 19, 32, 0.6)',
    border: 'rgba(255, 255, 255, 0.07)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
} as const;

/** Reusable shadow presets */
export const shadows = {
    gold: {
        shadowColor: '#D4A853',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    goldSubtle: {
        shadowColor: '#D4A853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    emerald: {
        shadowColor: '#4ECBA0',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
} as const;

export type Theme = {
    colors: typeof colors;
    fonts: typeof fonts;
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    animation: typeof animation;
    glass: typeof glass;
    shadows: typeof shadows;
    gradients: typeof gradients;
};

export const theme: Theme = {
    colors,
    fonts,
    typography,
    spacing,
    borderRadius,
    animation,
    glass,
    shadows,
    gradients,
};
export const designSystem = theme;
