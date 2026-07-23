import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/streak_counter_badge.dart';
import '../../streak/providers/streak_provider.dart';

class HomeDashboardScreen extends ConsumerWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streak = ref.watch(streakProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Welcome Winner,', style: VinRTypography.label),
                        Text('Daily Dashboard', style: VinRTypography.h2),
                      ],
                    ),
                    StreakCounterBadge(
                      streakDays: streak.totalDaysCompleted,
                      isWinner: streak.isWinner,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Daily Quote Banner
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  border: Border.all(color: VinRColors.borderGold),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.quote, color: VinRColors.goldLight, size: 20),
                          const SizedBox(width: 8),
                          Text('DAILY REFLECTION', style: VinRTypography.label.copyWith(color: VinRColors.goldLight)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '"Winning is not a single event; it is a 21-day continuous commitment to master your mind."',
                        style: VinRTypography.italic.copyWith(fontSize: 17),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text('21-DAY WINNING STREAK PROGRESS', style: VinRTypography.label),
                const SizedBox(height: 12),
                GlassContainer(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Day ${streak.totalDaysCompleted} of 21', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                          Text('${((streak.totalDaysCompleted / 21.0) * 100).toInt()}%', style: VinRTypography.bodySm.copyWith(color: VinRColors.goldLight)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: streak.totalDaysCompleted / 21.0,
                          minHeight: 10,
                          backgroundColor: VinRColors.surface,
                          valueColor: const AlwaysStoppedAnimation<Color>(VinRColors.gold),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: streak.isCompletedToday
                            ? null
                            : () => ref.read(streakProvider.notifier).markDayComplete(note: 'Completed daily streak task'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: VinRColors.gold,
                          foregroundColor: Colors.black,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          streak.isCompletedToday ? '✔ Day Completed Today' : 'Complete Today\'s Habit',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Text('DAILY ROUTINES & EXERCISES', style: VinRTypography.label),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: GlassContainer(
                        onTap: () => context.push('/breathing'),
                        child: Column(
                          children: [
                            const Icon(LucideIcons.wind, color: VinRColors.emerald, size: 32),
                            const SizedBox(height: 8),
                            Text('Breathing', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold)),
                            Text('4-7-8 Calm', style: VinRTypography.caption),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GlassContainer(
                        onTap: () => context.push('/grounding'),
                        child: Column(
                          children: [
                            const Icon(LucideIcons.anchor, color: VinRColors.sapphire, size: 32),
                            const SizedBox(height: 8),
                            Text('Grounding', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold)),
                            Text('5-4-3-2-1 Sensory', style: VinRTypography.caption),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GlassContainer(
                        onTap: () => context.push('/yoga'),
                        child: Column(
                          children: [
                            const Icon(LucideIcons.activity, color: VinRColors.lavender, size: 32),
                            const SizedBox(height: 8),
                            Text('Movement', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold)),
                            Text('Yoga Poses', style: VinRTypography.caption),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
