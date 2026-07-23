import 'package:flutter/material.dart';
import 'vinr_colors.dart';

/// VinR ThemeData configuration
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
        scaffoldColorScheme: ColorScheme.dark(),
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
      sliderTheme: SliderThemeData(
        activeTrackColor: VinRColors.gold,
        inactiveTrackColor: VinRColors.surface,
        thumbColor: VinRColors.goldLight,
        overlayColor: VinRColors.goldGlow,
        trackHeight: 6,
      ),
    );
  }
}
