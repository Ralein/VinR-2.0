import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';

class AmbientBackground extends StatefulWidget {
  final Widget child;

  const AmbientBackground({
    super.key,
    required this.child,
  });

  @override
  State<AmbientBackground> createState() => _AmbientBackgroundState();
}

class _AmbientBackgroundState extends State<AmbientBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.15).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _opacityAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;

    final bgColor = isLight ? const Color(0xFFF5F2EC) : VinRColors.voidBg;
    final goldColor = isLight ? const Color(0xFFB8832A) : VinRColors.gold;
    final emeraldColor = isLight ? const Color(0xFF2EA87E) : VinRColors.emerald;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, childWidget) {
        return Stack(
          children: [
            // Base Void/Parchment Background
            Container(color: bgColor),

            // Animated Top Right Gold Radial Glow Blob
            Positioned(
              top: -80,
              right: -80,
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: Opacity(
                  opacity: _opacityAnimation.value,
                  child: Container(
                    width: 340,
                    height: 340,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          goldColor.withValues(alpha: isLight ? 0.12 : 0.18),
                          goldColor.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Animated Bottom Left Emerald Radial Glow Blob
            Positioned(
              bottom: 100,
              left: -100,
              child: Transform.scale(
                scale: 2.1 - _scaleAnimation.value,
                child: Opacity(
                  opacity: _opacityAnimation.value,
                  child: Container(
                    width: 380,
                    height: 380,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          emeraldColor.withValues(alpha: isLight ? 0.08 : 0.12),
                          emeraldColor.withValues(alpha: 0.0),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            widget.child,
          ],
        );
      },
    );
  }
}
