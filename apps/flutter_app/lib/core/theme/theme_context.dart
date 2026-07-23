import 'package:flutter/material.dart';
import 'vinr_colors.dart';

extension ThemeContextX on BuildContext {
  bool get isLight => Theme.of(this).brightness == Brightness.light;

  Color get textColor => isLight ? const Color(0xFF1A1208) : VinRColors.textPrimary;
  Color get textSecondaryColor => isLight ? const Color(0xFF4A3F2F) : VinRColors.textSecondary;
  Color get textMutedColor => isLight ? const Color(0xFF5C5446) : VinRColors.textMuted;
  Color get textGhostColor => isLight ? const Color(0xFF8B8272) : VinRColors.textGhost;

  Color get surfaceColor => isLight ? Colors.white : VinRColors.surface;
  Color get elevatedColor => isLight ? const Color(0xFFEDE9E1) : VinRColors.elevated;
  Color get voidBgColor => isLight ? const Color(0xFFF5F2EC) : VinRColors.voidBg;

  Color get goldColor => isLight ? const Color(0xFFB8832A) : VinRColors.gold;
  Color get goldLightColor => isLight ? const Color(0xFFD4A853) : VinRColors.goldLight;
  Color get goldMutedColor => isLight ? const Color(0x18B8832A) : VinRColors.goldMuted;

  Color get emeraldColor => isLight ? const Color(0xFF2EA87E) : VinRColors.emerald;
  Color get sapphireColor => isLight ? const Color(0xFF2C6DB3) : VinRColors.sapphire;
  Color get crimsonColor => isLight ? const Color(0xFFC94040) : VinRColors.crimson;

  Color get borderColor => isLight ? const Color(0x18000000) : VinRColors.border;
  Color get borderGoldColor => isLight ? const Color(0x40B8832A) : VinRColors.borderGold;
}
