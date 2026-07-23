/**
 * ThemeContext — Global theme provider for VinR
 *
 * Reads settingsStore.theme ('light' | 'dark' | 'system')
 * and provides the correct color palette via useTheme().
 *
 * Usage:
 *   const { colors, gradients, glass, isDark } = useTheme();
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import {
    colors as darkColors,
    gradients as darkGradients,
    glass as darkGlass,
    fonts,
    spacing,
    borderRadius,
    animation,
    shadows,
} from '../constants/theme';
import { lightColors, lightGradients, lightGlass } from '../constants/lightTheme';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeColors = typeof darkColors;
export type ThemeGradients = typeof darkGradients;
export type ThemeGlass = typeof darkGlass;

export interface ThemeContextValue {
    isDark: boolean;
    colors: ThemeColors;
    gradients: ThemeGradients;
    glass: ThemeGlass;
    fonts: typeof fonts;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    animation: typeof animation;
    shadows: typeof shadows;
    /** Tab bar / overlay background — semi-transparent, theme-aware */
    tabBarBg: string;
    /** Card background for light/dark — slightly different from surface */
    cardBg: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ 
    children, 
    forceIsDark 
}: { 
    children: React.ReactNode;
    forceIsDark?: boolean;
}) {
    const systemScheme = useColorScheme();
    const themeSetting = useSettingsStore((s) => s.settings.theme);

    const isDark = useMemo(() => {
        if (forceIsDark !== undefined) return forceIsDark;
        if (themeSetting === 'dark') return true;
        if (themeSetting === 'light') return false;
        return systemScheme === 'dark'; // 'system'
    }, [themeSetting, systemScheme, forceIsDark]);

    const value = useMemo<ThemeContextValue>(() => ({
        isDark,
        colors: isDark ? darkColors : (lightColors as unknown as ThemeColors),
        gradients: isDark ? darkGradients : (lightGradients as unknown as ThemeGradients),
        glass: isDark ? darkGlass : (lightGlass as unknown as ThemeGlass),
        fonts,
        spacing,
        borderRadius,
        animation,
        shadows,
        tabBarBg: isDark
            ? 'rgba(9,12,22,0.96)'
            : 'rgba(245,242,236,0.96)',
        cardBg: isDark ? darkColors.surface : '#FFFFFF',
    }), [isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        // Fallback to dark theme when used outside provider (e.g. during tests)
        return {
            isDark: true,
            colors: darkColors,
            gradients: darkGradients,
            glass: darkGlass,
            fonts,
            spacing,
            borderRadius,
            animation,
            shadows,
            tabBarBg: 'rgba(9,12,22,0.96)',
            cardBg: darkColors.surface,
        };
    }
    return ctx;
}
