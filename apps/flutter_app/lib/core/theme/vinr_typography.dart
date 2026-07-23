import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'vinr_colors.dart';

/// VinR Midnight Gold & Warm Parchment Typography System
class VinRTypography {
  VinRTypography._();

  static Color primaryText(BuildContext context) =>
      Theme.of(context).brightness == Brightness.light
          ? const Color(0xFF1A1208)
          : VinRColors.textPrimary;

  static Color secondaryText(BuildContext context) =>
      Theme.of(context).brightness == Brightness.light
          ? const Color(0xFF4A3F2F)
          : VinRColors.textSecondary;

  static Color mutedText(BuildContext context) =>
      Theme.of(context).brightness == Brightness.light
          ? const Color(0xFF5C5446)
          : VinRColors.textMuted;

  static TextStyle get h1 => GoogleFonts.playfairDisplay(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        height: 1.25,
      );

  static TextStyle get h2 => GoogleFonts.playfairDisplay(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        height: 1.33,
      );

  static TextStyle get h3 => GoogleFonts.playfairDisplay(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
      );

  static TextStyle get body => GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        height: 1.5,
      );

  static TextStyle get bodySm => GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        height: 1.4,
      );

  static TextStyle get caption => GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w300,
        height: 1.33,
      );

  static TextStyle get label => GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        height: 1.33,
      );

  static TextStyle get italic => GoogleFonts.cormorantGaramond(
        fontSize: 18,
        fontStyle: FontStyle.italic,
        color: VinRColors.goldLight,
      );
}
