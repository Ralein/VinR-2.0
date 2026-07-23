import 'package:flutter/material.dart';
import '../theme/theme_context.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color? iconColor;
  final Widget? action;

  const SectionHeader({
    super.key,
    required this.title,
    required this.icon,
    this.iconColor,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveIconColor = iconColor ?? context.goldColor;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: effectiveIconColor, size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: VinRTypography.label.copyWith(
                  letterSpacing: 0.8,
                  color: context.textMutedColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          if (action != null) action as Widget,
        ],
      ),
    );
  }
}
