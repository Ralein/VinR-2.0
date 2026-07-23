import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/avatar_ring.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/streak_hero.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/sleep_mode_modal.dart';
import '../../auth/providers/auth_provider.dart';
import '../../streak/providers/streak_provider.dart';

class HomeDashboardScreen extends ConsumerStatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  ConsumerState<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends ConsumerState<HomeDashboardScreen> {
  bool _showSleepModal = false;

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 5) return 'Late night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _getDateChip() {
    return DateFormat('EEEE, MMMM d').format(DateTime.now());
  }

  String _getDailyQuote() {
    const quotes = [
      'Small steps every day lead to seismic change.',
      'Healing is not linear — every moment counts.',
      'You showed up today. That already matters.',
      'Be patient and gentle with yourself.',
      'Progress, not perfection.',
    ];
    final day = DateTime.now().day;
    return quotes[day % quotes.length];
  }

  @override
  Widget build(BuildContext context) {
    final streak = ref.watch(streakProvider);
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 16.0, bottom: 100.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Date Chip
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: context.goldMutedColor,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: context.borderGoldColor),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(LucideIcons.calendarDays, color: context.goldLightColor, size: 12),
                                  const SizedBox(width: 6),
                                  Text(
                                    _getDateChip(),
                                    style: VinRTypography.label.copyWith(
                                      color: context.goldLightColor,
                                      fontSize: 10.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _getGreeting().toUpperCase(),
                              style: VinRTypography.label.copyWith(
                                color: context.textMutedColor,
                                letterSpacing: 1.5,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Welcome to VinR',
                              style: VinRTypography.h1.copyWith(
                                fontSize: 26,
                                color: context.textColor,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            AvatarRing(
                              initials: auth.user?.name != null && auth.user!.name!.isNotEmpty
                                  ? auth.user!.name!.substring(0, 1).toUpperCase()
                                  : 'VR',
                              size: 48,
                            ),
                            const SizedBox(height: 6),
                            IconButton(
                              icon: Icon(LucideIcons.moon, color: context.textMutedColor, size: 18),
                              onPressed: () => setState(() => _showSleepModal = true),
                              tooltip: 'Sleep Mode',
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Daily Quote Card
                    GlassContainer(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.quote, color: context.goldColor, size: 16),
                              const SizedBox(width: 8),
                              Text(
                                'DAILY REFLECTION',
                                style: VinRTypography.label.copyWith(
                                  color: context.goldColor,
                                  letterSpacing: 1.2,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '"${_getDailyQuote()}"',
                            style: VinRTypography.italic.copyWith(
                              fontSize: 18,
                              color: context.textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Streak Hero Section
                    const SectionHeader(
                      title: 'WINNING STREAK',
                      icon: LucideIcons.flame,
                    ),
                    GlassContainer(
                      child: StreakHero(
                        streak: streak.totalDaysCompleted,
                        todayDone: streak.todayDone,
                        weeklyDays: streak.weeklyDays,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Quick Actions Section
                    const SectionHeader(
                      title: 'QUICK RELIEF & EXERCISES',
                      icon: LucideIcons.zap,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: GlassContainer(
                            onTap: () => context.push('/breathing'),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: VinRColors.sapphireGlow,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: VinRColors.sapphire.withValues(alpha: 0.3)),
                                  ),
                                  child: Icon(LucideIcons.wind, color: context.sapphireColor, size: 22),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  '4-7-8 Breath',
                                  style: VinRTypography.bodySm.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: context.textColor,
                                  ),
                                ),
                                Text(
                                  'Calm Vagus Nerve',
                                  style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                                ),
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
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: VinRColors.emeraldGlow,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: VinRColors.emerald.withValues(alpha: 0.3)),
                                  ),
                                  child: Icon(LucideIcons.layers, color: context.emeraldColor, size: 22),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  '5-4-3-2-1 Sense',
                                  style: VinRTypography.bodySm.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: context.textColor,
                                  ),
                                ),
                                Text(
                                  'Ground Mind',
                                  style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // AI Companion CTA
                    const SectionHeader(
                      title: 'GROWTH PARTNER',
                      icon: LucideIcons.sparkles,
                    ),
                    GlassContainer(
                      onTap: () => context.push('/buddy-chat'),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: context.goldMutedColor,
                              border: Border.all(color: context.borderGoldColor),
                            ),
                            child: Icon(LucideIcons.bot, color: context.goldColor, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Chat with VinR AI',
                                  style: VinRTypography.body.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: context.textColor,
                                  ),
                                ),
                                Text(
                                  'Personalized daily reflection & coach.',
                                  style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                                ),
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

              // Sleep Mode Overlay Modal
              SleepModeModal(
                visible: _showSleepModal,
                onClose: () => setState(() => _showSleepModal = false),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
