import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/progress_ring.dart';
import '../../streak/providers/streak_provider.dart';

class JourneyScreen extends ConsumerWidget {
  const JourneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streak = ref.watch(streakProvider);
    const totalDays = 21;
    final progress = (streak.totalDaysCompleted / totalDays).clamp(0.0, 1.0);

    final milestones = [
      {'day': 5, 'label': 'Day 5', 'icon': LucideIcons.leaf, 'color': VinRColors.emerald},
      {'day': 10, 'label': 'Day 10', 'icon': LucideIcons.flower2, 'color': VinRColors.lavender},
      {'day': 15, 'label': 'Day 15', 'icon': LucideIcons.flame, 'color': VinRColors.gold},
      {'day': 21, 'label': 'Day 21', 'icon': LucideIcons.trophy, 'color': const Color(0xFFF5C842)},
    ];

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '21-Day Growth Journey',
                  style: VinRTypography.h1.copyWith(fontSize: 26),
                ),
                const SizedBox(height: 16),

                // Streak Progress Card
                GlassContainer(
                  border: Border.all(color: VinRColors.borderGold),
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${streak.currentStreak}',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 64,
                              fontWeight: FontWeight.w900,
                              height: 1.0,
                              color: VinRColors.gold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: const [
                              Text('day streak', style: TextStyle(color: VinRColors.textMuted, fontSize: 14)),
                              SizedBox(width: 6),
                              Icon(LucideIcons.flame, color: VinRColors.gold, size: 16),
                            ],
                          ),
                        ],
                      ),
                      ProgressRing(
                        progress: progress,
                        size: 88,
                        strokeWidth: 7,
                        variant: RingVariant.gold,
                        label: '${streak.totalDaysCompleted}/$totalDays',
                        sublabel: 'days done',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // 21-Day Grid Section
                Text(
                  '21-DAY PROGRESS',
                  style: VinRTypography.label.copyWith(letterSpacing: 0.8),
                ),
                const SizedBox(height: 14),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: totalDays,
                  itemBuilder: (context, index) {
                    final dayNum = index + 1;
                    final isCompleted = dayNum <= streak.totalDaysCompleted;
                    final isToday = dayNum == streak.totalDaysCompleted + 1 && !streak.isCompletedToday;

                    return Container(
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? VinRColors.gold.withValues(alpha: 0.15)
                            : (isToday ? VinRColors.goldMuted : Colors.transparent),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isCompleted
                              ? VinRColors.gold
                              : (isToday ? VinRColors.goldLight : VinRColors.border),
                          width: isToday ? 2 : 1,
                        ),
                      ),
                      child: Center(
                        child: isCompleted
                            ? const Icon(LucideIcons.check, color: VinRColors.gold, size: 16)
                            : Text(
                                '$dayNum',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                                  color: isToday ? VinRColors.goldLight : VinRColors.textMuted,
                                ),
                              ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 28),

                // Milestone Badges Row
                Text(
                  'MILESTONE BADGES',
                  style: VinRTypography.label.copyWith(letterSpacing: 0.8),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: milestones.map((m) {
                    final unlocked = streak.totalDaysCompleted >= (m['day'] as int);
                    final color = m['color'] as Color;
                    final icon = m['icon'] as IconData;

                    return Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: unlocked ? color.withValues(alpha: 0.1) : VinRColors.elevated,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: unlocked ? color : VinRColors.border,
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: color.withValues(alpha: unlocked ? 0.2 : 0.05),
                              ),
                              child: Icon(
                                icon,
                                color: unlocked ? color : VinRColors.textGhost,
                                size: 18,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              m['label'] as String,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: unlocked ? FontWeight.bold : FontWeight.normal,
                                color: unlocked ? color : VinRColors.textGhost,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 32),

                // Mark Complete CTA
                if (!streak.isCompletedToday) ...[
                  ElevatedButton.icon(
                    onPressed: () {
                      ref.read(streakProvider.notifier).markDayComplete(note: 'Completed 21-day streak item');
                    },
                    icon: const Icon(LucideIcons.checkCircle2, color: Colors.white),
                    label: const Text('Mark Today Complete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: VinRColors.emerald,
                      minimumSize: const Size.fromHeight(54),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 6,
                    ),
                  ),
                ] else ...[
                  GlassContainer(
                    color: VinRColors.emeraldGlow,
                    border: Border.all(color: VinRColors.emerald),
                    child: Row(
                      children: const [
                        Icon(LucideIcons.checkCircle2, color: VinRColors.emerald, size: 24),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            "Today's check-in complete! Great job maintaining momentum.",
                            style: TextStyle(color: VinRColors.emerald, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
