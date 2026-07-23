import 'package:flutter/material.dart';
import '../theme/theme_context.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';

class AvatarRing extends StatelessWidget {
  final String initials;
  final double size;

  const AvatarRing({
    super.key,
    this.initials = 'VR',
    this.size = 48,
  });

  @override
  Widget build(BuildContext context) {
    final isLight = context.isLight;
    final innerBg = isLight ? Colors.white : VinRColors.surface;
    final textCol = isLight ? const Color(0xFFB8832A) : VinRColors.goldLight;
    final shadowCol = isLight ? const Color(0xFFB8832A) : VinRColors.gold;

    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(2.5),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: VinRColors.goldGradient,
        boxShadow: [
          BoxShadow(
            color: shadowCol.withValues(alpha: isLight ? 0.25 : 0.35),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: innerBg,
        ),
        child: Center(
          child: Text(
            initials,
            style: VinRTypography.bodySm.copyWith(
              fontWeight: FontWeight.bold,
              color: textCol,
              fontSize: size * 0.36,
            ),
          ),
        ),
      ),
    );
  }
}
