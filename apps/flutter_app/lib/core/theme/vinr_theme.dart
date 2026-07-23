import 'package:flutter/material.dart';
import 'vinr_colors.dart';

/// VinR ThemeData configuration supporting Dark & Light mode
class VinRTheme {
  VinRTheme._();

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: VinRColors.voidBg,
      colorScheme: const ColorScheme.dark(
        surface: VinRColors.surface,
        primary: VinRColors.gold,
        secondary: VinRColors.emerald,
        tertiary: VinRColors.sapphire,
        error: VinRColors.crimson,
        onSurface: VinRColors.textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: VinRColors.textPrimary),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: VinRColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: VinRColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: VinRColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: VinRColors.gold, width: 1.5),
        ),
        hintStyle: const TextStyle(color: VinRColors.textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: VinRColors.gold,
        inactiveTrackColor: VinRColors.surface,
        thumbColor: VinRColors.goldLight,
        overlayColor: VinRColors.goldGlow,
        trackHeight: 6,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF5F2EC), // Warm parchment
      colorScheme: const ColorScheme.light(
        surface: Colors.white,
        primary: Color(0xFFB8832A), // Deeper contrast gold
        secondary: Color(0xFF2EA87E),
        tertiary: Color(0xFF2C6DB3),
        error: Color(0xFFC94040),
        onSurface: Color(0xFF1A1208),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Color(0xFF1A1208)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0x22000000)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0x22000000)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFB8832A), width: 1.5),
        ),
        hintStyle: const TextStyle(color: Color(0xFF5C5446)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      ),
      sliderTheme: const SliderThemeData(
        activeTrackColor: Color(0xFFB8832A),
        inactiveTrackColor: Color(0xFFE8E1D0),
        thumbColor: Color(0xFFB8832A),
        overlayColor: Color(0x22B8832A),
        trackHeight: 6,
      ),
    );
  }
}
