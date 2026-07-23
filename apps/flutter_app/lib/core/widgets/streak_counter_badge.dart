import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/theme_context.dart';
import '../theme/vinr_typography.dart';

class StreakCounterBadge extends StatelessWidget {
  final int streakDays;
  final bool isWinner;

  const StreakCounterBadge({
    super.key,
    required this.streakDays,
    this.isWinner = false,
  });

  @override
  Widget build(BuildContext context) {
    final goldCol = context.goldColor;
    final bgCol = context.goldMutedColor;
    final borderCol = context.borderGoldColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderCol),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isWinner ? LucideIcons.trophy : LucideIcons.flame,
            color: goldCol,
            size: 18,
          ),
          const SizedBox(width: 6),
          Text(
            '$streakDays/21 DAYS WINNER',
            style: VinRTypography.label.copyWith(
              color: goldCol,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
