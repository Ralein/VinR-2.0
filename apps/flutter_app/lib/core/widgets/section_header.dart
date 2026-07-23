import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final Widget? action;

  const SectionHeader({
    super.key,
    required this.title,
    required this.icon,
    this.iconColor = VinRColors.gold,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 18),
              const SizedBox(width: 8),
              Text(
                title,
                style: VinRTypography.label.copyWith(
                  letterSpacing: 0.8,
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
