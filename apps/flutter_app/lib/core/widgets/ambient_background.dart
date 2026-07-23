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
    final isLight = Theme.of(context).brightness == Brightness.light;

    final bgColor = isLight ? const Color(0xFFF5F2EC) : VinRColors.voidBg;
    final goldColor = isLight ? const Color(0xFFB8832A) : VinRColors.gold;
    final emeraldColor = isLight ? const Color(0xFF2EA87E) : VinRColors.emerald;

    return Stack(
      children: [
        // Base Void/Parchment Background
        Container(
          color: bgColor,
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
                  goldColor.withValues(alpha: isLight ? 0.08 : 0.12),
                  goldColor.withValues(alpha: 0.0),
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
                  emeraldColor.withValues(alpha: isLight ? 0.06 : 0.08),
                  emeraldColor.withValues(alpha: 0.0),
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
