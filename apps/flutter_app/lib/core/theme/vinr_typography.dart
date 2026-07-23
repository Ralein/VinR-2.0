import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'vinr_colors.dart';

/// VinR Midnight Gold Design System — Typography
class VinRTypography {
  VinRTypography._();

  static TextStyle get h1 => GoogleFonts.playfairDisplay(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        height: 1.25,
        color: VinRColors.textPrimary,
      );

  static TextStyle get h2 => GoogleFonts.playfairDisplay(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        height: 1.33,
        color: VinRColors.textPrimary,
      );

  static TextStyle get h3 => GoogleFonts.playfairDisplay(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: VinRColors.textPrimary,
      );

  static TextStyle get body => GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        height: 1.5,
        color: VinRColors.textPrimary,
      );

  static TextStyle get bodySm => GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        height: 1.4,
        color: VinRColors.textSecondary,
      );

  static TextStyle get caption => GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w300,
        height: 1.33,
        color: VinRColors.textMuted,
      );

  static TextStyle get label => GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        height: 1.33,
        color: VinRColors.textMuted,
      );

  static TextStyle get italic => GoogleFonts.cormorantGaramond(
        fontSize: 18,
        fontStyle: FontStyle.italic,
        color: VinRColors.goldLight,
      );
}
