import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../streak/providers/streak_provider.dart';

class JourneyScreen extends ConsumerWidget {
  const JourneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streak = ref.watch(streakProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('21-Day Growth Roadmap', style: VinRTypography.h3),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: 21,
            itemBuilder: (context, index) {
              final dayNum = index + 1;
              final isDone = dayNum <= streak.totalDaysCompleted;
              final isCurrent = dayNum == streak.totalDaysCompleted + 1;

              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: GlassContainer(
                  color: isDone
                      ? VinRColors.goldMuted
                      : (isCurrent ? VinRColors.surface : VinRColors.voidBg),
                  border: Border.all(
                    color: isDone
                        ? VinRColors.gold
                        : (isCurrent ? VinRColors.goldLight : VinRColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDone ? VinRColors.gold : VinRColors.surface,
                        ),
                        child: Center(
                          child: isDone
                              ? const Icon(LucideIcons.check, color: Colors.black)
                              : Text(
                                  '$dayNum',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isCurrent ? VinRColors.goldLight : VinRColors.textMuted,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Day $dayNum: ${_getDayTitle(dayNum)}',
                              style: VinRTypography.body.copyWith(
                                fontWeight: isDone || isCurrent ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isDone ? 'Completed • Winner Badge Unlocked' : 'Pending Habit Task',
                              style: VinRTypography.caption,
                            ),
                          ],
                        ),
                      ),
                      if (dayNum == 7 || dayNum == 14 || dayNum == 21)
                        const Icon(LucideIcons.award, color: VinRColors.goldLight),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  String _getDayTitle(int day) {
    switch (day) {
      case 1: return 'Setting Your Foundation';
      case 2: return 'Breath Awareness & Control';
      case 3: return 'Mindful Emotional Auditing';
      case 4: return 'Reframing Negative Self-Talk';
      case 5: return 'Building Core Resilience';
      case 7: return 'Milestone 1: First Week Victory';
      case 14: return 'Milestone 2: Fortitude Champion';
      case 21: return '21-Day Winner Trophy';
      default: return 'Daily Mindset Practice';
    }
  }
}
