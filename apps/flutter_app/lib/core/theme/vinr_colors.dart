import 'package:flutter/material.dart';

/// VinR Midnight Gold Design System — Color Tokens
class VinRColors {
  VinRColors._();

  // Backgrounds
  static const Color voidBg = Color(0xFF07090F);
  static const Color surface = Color(0xFF0F1320);
  static const Color elevated = Color(0xFF161C2E);

  // Brand Accents
  static const Color gold = Color(0xFFD4A853);
  static const Color goldLight = Color(0xFFF0C96B);
  static const Color goldGlow = Color(0x26D4A853); // 15%
  static const Color goldMuted = Color(0x14D4A853); // 8%

  // Semantics
  static const Color emerald = Color(0xFF4ECBA0);
  static const Color emeraldGlow = Color(0x1F4ECBA0); // 12%
  static const Color sapphire = Color(0xFF4A90D9);
  static const Color sapphireGlow = Color(0x1A4A90D9); // 10%
  static const Color crimson = Color(0xFFE85D5D);
  static const Color crimsonGlow = Color(0x1AE85D5D); // 10%
  static const Color lavender = Color(0xFF8B7EC8);
  static const Color lavenderGlow = Color(0x1A8B7EC8); // 10%

  // Text Tokens
  static const Color textPrimary = Color(0xFFEEF0F7);
  static const Color textSecondary = Color(0xFFB0B8D4);
  static const Color textMuted = Color(0xFF7A8099);
  static const Color textGhost = Color(0xFF3D4560);

  // Borders
  static const Color border = Color(0x12FFFFFF); // 7% white
  static const Color borderLight = Color(0x1FFFFFFF); // 12% white
  static const Color borderGold = Color(0x40D4A853); // 25% gold

  // Gradients
  static const LinearGradient voidGradient = LinearGradient(
    colors: [Color(0xFF0A0E1A), Color(0xFF07090F), Color(0xFF070B14)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFD4A853), Color(0xFFF0C96B), Color(0xFFD4A853)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient sunriseGradient = LinearGradient(
    colors: [Color(0xFF1A150F), Color(0xFF0F1320), Color(0xFF07090F)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
