import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/avatar_ring.dart';
import '../../../core/widgets/streak_counter_badge.dart';
import '../../../core/widgets/section_header.dart';
import '../../auth/providers/auth_provider.dart';
import '../../streak/providers/streak_provider.dart';

class TrophyDefinition {
  final String id;
  final String title;
  final String description;
  final int requiredDays;
  final IconData icon;

  TrophyDefinition({
    required this.id,
    required this.title,
    required this.description,
    required this.requiredDays,
    required this.icon,
  });
}

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  static final List<TrophyDefinition> _allTrophies = [
    TrophyDefinition(
      id: 'day1',
      title: 'First Spark',
      description: 'Completed your first daily check-in',
      requiredDays: 1,
      icon: LucideIcons.zap,
    ),
    TrophyDefinition(
      id: 'day3',
      title: '3-Day Flame',
      description: 'Maintained 3 consecutive days of growth',
      requiredDays: 3,
      icon: LucideIcons.flame,
    ),
    TrophyDefinition(
      id: 'day7',
      title: '7-Day Warrior',
      description: 'Conquered 1 full week streak milestone',
      requiredDays: 7,
      icon: LucideIcons.shieldCheck,
    ),
    TrophyDefinition(
      id: 'day14',
      title: '14-Day Fortitude',
      description: 'Built 2 weeks of unshakable momentum',
      requiredDays: 14,
      icon: LucideIcons.award,
    ),
    TrophyDefinition(
      id: 'day21',
      title: '21-Day VinR Winner',
      description: 'Mastered the 21-Day Habit & Mindset Transformation',
      requiredDays: 21,
      icon: LucideIcons.trophy,
    ),
    TrophyDefinition(
      id: 'day30',
      title: 'Sovereign Legend',
      description: 'Reached 30 days of daily habit mastery',
      requiredDays: 30,
      icon: LucideIcons.crown,
    ),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final streak = ref.watch(streakProvider);

    final currentDays = streak.totalDaysCompleted;

    // Filter unlocked trophies
    final unlockedTrophies = _allTrophies.where((t) => currentDays >= t.requiredDays).toList();
    final lockedTrophies = _allTrophies.where((t) => currentDays < t.requiredDays).toList();

    // Next trophy target
    final nextTrophy = lockedTrophies.isNotEmpty ? lockedTrophies.first : null;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Profile & Achievements',
                      style: VinRTypography.h1.copyWith(fontSize: 24, color: context.textColor),
                    ),
                  ),
                  IconButton(
                    icon: Icon(LucideIcons.settings, color: context.textMutedColor),
                    onPressed: () => context.push('/settings'),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // User Info Hero Card
              Center(
                child: Column(
                  children: [
                    AvatarRing(
                      initials: auth.user?.name != null && auth.user!.name!.isNotEmpty
                          ? auth.user!.name!.substring(0, 1).toUpperCase()
                          : 'VR',
                      size: 64,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      auth.user?.name ?? 'Winner Champion',
                      style: VinRTypography.h2.copyWith(color: context.textColor),
                    ),
                    Text(
                      auth.user?.email ?? 'champion@vinr.app',
                      style: VinRTypography.bodySm.copyWith(color: context.textMutedColor),
                    ),
                    const SizedBox(height: 14),
                    StreakCounterBadge(
                      streakDays: streak.totalDaysCompleted,
                      isWinner: streak.isWinner,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Achievements & Trophy Room Header
              SectionHeader(
                title: 'MY TROPHY ROOM (${unlockedTrophies.length}/${_allTrophies.length})',
                icon: LucideIcons.trophy,
                iconColor: VinRColors.gold,
              ),

              // Next Milestone Progress Nudge Card
              if (nextTrophy != null) ...[
                GlassContainer(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.target, size: 16, color: context.goldColor),
                              const SizedBox(width: 8),
                              Text(
                                'Next Trophy Target: ${nextTrophy.title}',
                                style: TextStyle(fontWeight: FontWeight.bold, color: context.textColor, fontSize: 13),
                              ),
                            ],
                          ),
                          Text(
                            '$currentDays / ${nextTrophy.requiredDays} Days',
                            style: TextStyle(color: context.goldColor, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: (currentDays / nextTrophy.requiredDays).clamp(0.0, 1.0),
                          backgroundColor: context.borderColor,
                          color: context.goldColor,
                          minHeight: 8,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Complete ${nextTrophy.requiredDays - currentDays} more daily check-in(s) to unlock this trophy!',
                        style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Unlocked Trophies Showcase Grid
              if (unlockedTrophies.isEmpty) ...[
                GlassContainer(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Icon(LucideIcons.lock, size: 40, color: context.textMutedColor.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      Text(
                        'No Trophies Unlocked Yet',
                        style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Complete your daily check-in to unlock your first trophy badge!',
                        style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ] else ...[
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: unlockedTrophies.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.25,
                  ),
                  itemBuilder: (context, index) {
                    final trophy = unlockedTrophies[index];
                    return GlassContainer(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: context.goldColor.withValues(alpha: 0.18),
                              shape: BoxShape.circle,
                              border: Border.all(color: context.goldColor.withValues(alpha: 0.4)),
                              boxShadow: [
                                BoxShadow(
                                  color: context.goldColor.withValues(alpha: 0.2),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: Icon(trophy.icon, color: context.goldColor, size: 24),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            trophy.title,
                            style: TextStyle(fontWeight: FontWeight.bold, color: context.textColor, fontSize: 13),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'UNLOCKED (${trophy.requiredDays}D)',
                            style: TextStyle(color: context.goldColor, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
              const SizedBox(height: 24),

              // Directory & Navigation Links
              const SectionHeader(
                title: 'DIRECTORY & CARE',
                icon: LucideIcons.sliders,
              ),

              GlassContainer(
                onTap: () => context.push('/therapists'),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: VinRColors.emeraldGlow,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.userCheck, color: VinRColors.emerald),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Therapist Directory & Booking', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor)),
                          Text('Connect with certified growth therapists.', style: VinRTypography.caption.copyWith(color: context.textMutedColor)),
                        ],
                      ),
                    ),
                    Icon(LucideIcons.chevronRight, color: context.textMutedColor, size: 18),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
