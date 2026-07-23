import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';

class AmbientBackground extends StatelessWidget {
  final Widget child;

  const AmbientBackground({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base Void Background
        Container(
          decoration: const BoxDecoration(
            color: VinRColors.voidBg,
          ),
        ),
        // Top Right Gold Radial Glow Blob
        Positioned(
          top: -80,
          right: -80,
          child: Container(
            width: 320,
            height: 320,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  VinRColors.gold.withValues(alpha: 0.12),
                  VinRColors.gold.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),
        // Bottom Left Emerald Radial Glow Blob
        Positioned(
          bottom: 100,
          left: -100,
          child: Container(
            width: 360,
            height: 360,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  VinRColors.emerald.withValues(alpha: 0.08),
                  VinRColors.emerald.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ),
        child,
      ],
    );
  }
}
