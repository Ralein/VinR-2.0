import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';
import 'app_animations.dart';

class GoldButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final double? width;

  const GoldButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedPressable(
      onTap: onPressed == null || isLoading ? null : onPressed,
      pressedScale: 0.97,
      child: SizedBox(
        width: width ?? double.infinity,
        height: 56,
        child: Container(
          decoration: BoxDecoration(
            gradient: onPressed == null
                ? null
                : VinRColors.goldGradient,
            color: onPressed == null ? VinRColors.surface : null,
            borderRadius: BorderRadius.circular(16),
            boxShadow: onPressed == null
                ? []
                : [
                    BoxShadow(
                      color: VinRColors.gold.withValues(alpha: 0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
          ),
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, color: Colors.black, size: 20),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: VinRTypography.body.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
