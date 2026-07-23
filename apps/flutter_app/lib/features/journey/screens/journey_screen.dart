import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../streak/providers/streak_provider.dart';

class JourneyScreen extends ConsumerWidget {
  const JourneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streak = ref.watch(streakProvider);
    final notifier = ref.read(streakProvider.notifier);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 16.0, bottom: 140.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('21-Day Winning Journey', style: VinRTypography.h1.copyWith(fontSize: 26, color: context.textColor)),
                          const SizedBox(height: 2),
                          Text('Daily check-in for habit & identity transformation.', style: VinRTypography.bodySm.copyWith(color: context.textMutedColor)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: context.goldMutedColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderGoldColor),
                      ),
                      child: Text(
                        'Day ${streak.totalDaysCompleted}/21',
                        style: VinRTypography.label.copyWith(color: context.goldLightColor, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Today Check-in Hero Card
                GlassContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            streak.isCompletedToday ? LucideIcons.checkCircle2 : LucideIcons.target,
                            color: streak.isCompletedToday ? context.emeraldColor : context.goldColor,
                            size: 22,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            streak.isCompletedToday ? 'TODAY\'S CHECK-IN COMPLETED!' : 'TODAY\'S ACTION NUDGE',
                            style: VinRTypography.label.copyWith(
                              color: streak.isCompletedToday ? context.emeraldColor : context.goldColor,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        streak.isCompletedToday
                            ? 'Awesome work! You maintained your streak for today. Keep building your daily momentum.'
                            : 'Take 60 seconds to reflect on your progress and lock in today\'s winning point.',
                        style: VinRTypography.bodySm.copyWith(color: context.textColor, height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      if (!streak.isCompletedToday)
                        GoldButton(
                          text: 'Mark Today Complete ✓',
                          onPressed: () {
                            notifier.markDayComplete();
                            VinRToast.show(
                              context,
                              message: 'Winning Streak Updated for Today!',
                              icon: LucideIcons.flame,
                              iconColor: VinRColors.gold,
                            );
                          },
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 21-Day Growth Grid Matrix
                const SectionHeader(
                  title: '21-DAY MATRIX',
                  icon: LucideIcons.calendar,
                ),
                GlassContainer(
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: 21,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemBuilder: (context, index) {
                      final dayNum = index + 1;
                      final isCompleted = dayNum <= streak.totalDaysCompleted;
                      final isToday = dayNum == streak.totalDaysCompleted + 1 && !streak.isCompletedToday;

                      // Milestone icons
                      IconData? milestoneIcon;
                      if (dayNum == 5) milestoneIcon = LucideIcons.sprout;
                      if (dayNum == 10) milestoneIcon = LucideIcons.flower2;
                      if (dayNum == 15) milestoneIcon = LucideIcons.flame;
                      if (dayNum == 21) milestoneIcon = LucideIcons.trophy;

                      return Container(
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? context.goldColor.withValues(alpha: 0.2)
                              : (isToday ? context.goldMutedColor : (context.isLight ? const Color(0xFFF5F2EC) : VinRColors.elevated)),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isCompleted
                                ? context.goldColor
                                : (isToday ? context.goldColor : context.borderColor),
                            width: isToday ? 2 : 1,
                          ),
                        ),
                        child: Center(
                          child: isCompleted
                              ? Icon(LucideIcons.check, color: context.goldColor, size: 16)
                              : (milestoneIcon != null
                                  ? Icon(milestoneIcon, color: context.textMutedColor, size: 14)
                                  : Text('$dayNum', style: TextStyle(color: context.textMutedColor, fontSize: 11, fontWeight: FontWeight.bold))),
                        ),
                      );
                    },
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
