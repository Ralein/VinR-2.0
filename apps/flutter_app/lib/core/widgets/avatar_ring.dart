import 'package:flutter/material.dart';
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
    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(2.5),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: VinRColors.goldGradient,
        boxShadow: [
          BoxShadow(
            color: VinRColors.gold.withValues(alpha: 0.35),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Container(
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: VinRColors.surface,
        ),
        child: Center(
          child: Text(
            initials,
            style: VinRTypography.bodySm.copyWith(
              fontWeight: FontWeight.bold,
              color: VinRColors.goldLight,
            ),
          ),
        ),
      ),
    );
  }
}
