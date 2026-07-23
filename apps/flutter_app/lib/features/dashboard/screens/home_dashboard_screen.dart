import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
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
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
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
                                color: VinRColors.goldMuted,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: VinRColors.borderGold),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(LucideIcons.calendarDays, color: VinRColors.goldLight, size: 12),
                                  const SizedBox(width: 6),
                                  Text(
                                    _getDateChip(),
                                    style: VinRTypography.label.copyWith(
                                      color: VinRColors.goldLight,
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
                                color: VinRColors.textMuted,
                                letterSpacing: 1.5,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Welcome to VinR',
                              style: VinRTypography.h1.copyWith(fontSize: 26),
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
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () => ref.read(authProvider.notifier).signOut(),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(LucideIcons.logOut, color: VinRColors.crimson, size: 12),
                                  SizedBox(width: 4),
                                  Text(
                                    'Sign Out',
                                    style: TextStyle(
                                      color: VinRColors.crimson,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Daily Quote Card
                    GlassContainer(
                      color: VinRColors.goldMuted,
                      border: Border.all(color: VinRColors.borderGold),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(LucideIcons.quote, color: VinRColors.goldLight, size: 16),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _getDailyQuote(),
                              style: VinRTypography.italic.copyWith(
                                fontSize: 14,
                                color: VinRColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Streak Hero Card
                    GlassContainer(
                      border: Border.all(color: VinRColors.borderGold),
                      padding: const EdgeInsets.all(20),
                      child: StreakHero(
                        streak: streak.currentStreak,
                        todayDone: streak.isCompletedToday,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Adaptive For You Nudges Section
                    const SectionHeader(
                      title: 'FOR YOU',
                      icon: LucideIcons.sparkles,
                      iconColor: VinRColors.goldLight,
                    ),
                    GlassContainer(
                      onTap: () => context.push('/therapist'),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: const BoxDecoration(
                              color: VinRColors.sapphireGlow,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.brain, color: VinRColors.sapphire),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Connect with a Therapist', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                Text('Book a 1-on-1 growth guidance session.', style: VinRTypography.caption),
                              ],
                            ),
                          ),
                          const Icon(LucideIcons.chevronRight, color: VinRColors.textMuted, size: 18),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // AI Companion Section
                    const SectionHeader(
                      title: 'YOUR AI COMPANION',
                      icon: LucideIcons.messageCircle,
                      iconColor: VinRColors.lavender,
                    ),
                    GlassContainer(
                      onTap: () => context.push('/buddy-chat'),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: const BoxDecoration(
                              color: VinRColors.lavenderGlow,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.sparkles, color: VinRColors.lavender),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Talk to VinR Buddy', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                Text("I'm always here to listen. Share what's on your mind.", style: VinRTypography.caption),
                              ],
                            ),
                          ),
                          const Icon(LucideIcons.chevronRight, color: VinRColors.textMuted, size: 18),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // How are you feeling?
                    const SectionHeader(
                      title: 'HOW ARE YOU FEELING?',
                      icon: LucideIcons.heart,
                      iconColor: VinRColors.crimson,
                    ),
                    GoldButton(
                      text: 'Start a Check-In',
                      onPressed: () => context.push('/home'),
                    ),
                    const SizedBox(height: 24),

                    // Gratitude Journal Section
                    const SectionHeader(
                      title: 'GRATITUDE JOURNAL',
                      icon: LucideIcons.bookOpen,
                      iconColor: VinRColors.goldLight,
                    ),
                    GlassContainer(
                      onTap: () => context.push('/journal'),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: const BoxDecoration(
                              color: VinRColors.goldMuted,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.bookOpen, color: VinRColors.goldLight),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Daily Gratitude', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                Text('Reflect & Grow • Document daily wins', style: VinRTypography.caption),
                              ],
                            ),
                          ),
                          const Icon(LucideIcons.chevronRight, color: VinRColors.goldLight, size: 18),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Sleep Mode Card
                    GlassContainer(
                      onTap: () => setState(() => _showSleepModal = true),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: const BoxDecoration(
                              color: VinRColors.sapphireGlow,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.moon, color: VinRColors.sapphire),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Sleep Mode', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                Text('Dim lights • breathing • auto-stop', style: VinRTypography.caption),
                              ],
                            ),
                          ),
                          const Icon(LucideIcons.chevronRight, color: VinRColors.textMuted, size: 18),
                        ],
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),

              // Sleep Mode Modal Overlay
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
