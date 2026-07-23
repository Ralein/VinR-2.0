import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/avatar_ring.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/streak_hero.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../auth/providers/auth_provider.dart';
import '../../streak/providers/streak_provider.dart';

class HomeDashboardScreen extends ConsumerStatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  ConsumerState<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends ConsumerState<HomeDashboardScreen> {
  String _selectedMood = 'Calm';
  bool _isPlayingQuoteAudio = false;

  final List<Map<String, dynamic>> _moodOptions = [
    {'label': 'Energized', 'icon': LucideIcons.zap, 'color': VinRColors.gold},
    {'label': 'Calm', 'icon': LucideIcons.waves, 'color': VinRColors.emerald},
    {'label': 'Anxious', 'icon': LucideIcons.wind, 'color': VinRColors.crimson},
    {'label': 'Reflective', 'icon': LucideIcons.sparkles, 'color': VinRColors.sapphire},
  ];

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final streak = ref.watch(streakProvider);
    final streakNotifier = ref.read(streakProvider.notifier);

    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: activeGold.withValues(alpha: isLight ? 0.12 : 0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: activeGold.withValues(alpha: isLight ? 0.3 : 0.4),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.award, size: 12, color: activeGold),
                                const SizedBox(width: 4),
                                Text(
                                  '21-DAY CHAMPION',
                                  style: TextStyle(
                                    color: activeGold,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _getGreeting().toUpperCase(),
                            style: VinRTypography.label.copyWith(
                              color: mutedTextColor,
                              letterSpacing: 1.5,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            auth.user?.name != null && auth.user!.name!.isNotEmpty
                                ? 'Welcome, ${auth.user!.name}'
                                : 'Welcome to VinR',
                            style: VinRTypography.h1.copyWith(
                              fontSize: 24,
                              color: primaryTextColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      children: [
                        GestureDetector(
                          onTap: () => context.go('/profile'),
                          child: AvatarRing(
                            initials: auth.user?.name != null && auth.user!.name!.isNotEmpty
                                ? auth.user!.name!.substring(0, 1).toUpperCase()
                                : 'VR',
                            size: 48,
                          ),
                        ),
                        const SizedBox(height: 6),
                        IconButton(
                          icon: Icon(LucideIcons.settings, color: mutedTextColor, size: 18),
                          onPressed: () => context.push('/settings'),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Streak Hero Component (Dynamic Connection)
                GlassContainer(
                  child: StreakHero(
                    streak: streak.currentStreak,
                    todayDone: streak.isCompletedToday,
                  ),
                ),
                const SizedBox(height: 16),

                // Dynamic One-Tap Check-In Nudge Card
                if (!streak.isCompletedToday) ...[
                  GoldButton(
                    text: 'Record Today\'s Check-in (+1 Day) →',
                    onPressed: () {
                      streakNotifier.checkInToday();
                      VinRToast.show(
                        context,
                        message: 'Daily Check-in Recorded! Winning streak updated.',
                        icon: LucideIcons.flame,
                        iconColor: VinRColors.gold,
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                ],

                // Mood & Energy Pulse Selector (UI/UX Feature)
                const SectionHeader(
                  title: 'DAILY MOOD & ENERGY PULSE',
                  icon: LucideIcons.heartPulse,
                  iconColor: VinRColors.crimson,
                ),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: _moodOptions.map((m) {
                      final isSel = _selectedMood == m['label'];
                      final color = m['color'] as Color;
                      final icon = m['icon'] as IconData;

                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _selectedMood = m['label'] as String);
                            VinRToast.show(
                              context,
                              message: 'Mood updated to ${m['label']}',
                              icon: icon,
                              iconColor: color,
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSel ? color.withValues(alpha: 0.18) : context.surfaceColor,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSel ? color : context.borderColor,
                                width: isSel ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(icon, size: 14, color: isSel ? color : mutedTextColor),
                                const SizedBox(width: 6),
                                Text(
                                  m['label'] as String,
                                  style: TextStyle(
                                    color: isSel ? primaryTextColor : mutedTextColor,
                                    fontSize: 12,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),

                // Quick Mindfulness & Growth Micro-Tools Grid
                const SectionHeader(
                  title: 'MINDFULNESS & RELIEF TOOLS',
                  icon: LucideIcons.compass,
                ),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 1.55,
                  children: [
                    _buildToolCard(
                      context,
                      title: '4-7-8 Breathing',
                      subtitle: 'Calm nervous system',
                      icon: LucideIcons.wind,
                      color: VinRColors.sapphire,
                      onTap: () => context.push('/breathing'),
                    ),
                    _buildToolCard(
                      context,
                      title: '2-Min Grounding',
                      subtitle: '5-4-3-2-1 reset',
                      icon: LucideIcons.compass,
                      color: VinRColors.gold,
                      onTap: () => context.push('/grounding'),
                    ),
                    _buildToolCard(
                      context,
                      title: 'Yoga Movement',
                      subtitle: 'Body alignment flow',
                      icon: LucideIcons.activity,
                      color: VinRColors.emerald,
                      onTap: () => context.push('/yoga'),
                    ),
                    _buildToolCard(
                      context,
                      title: 'Gratitude Journal',
                      subtitle: 'Log daily reflections',
                      icon: LucideIcons.penTool,
                      color: activeGold,
                      onTap: () => context.push('/journal'),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Daily Stoic Quote & Audio Reflection
                const SectionHeader(
                  title: 'DAILY REFLECTION',
                  icon: LucideIcons.quote,
                  iconColor: VinRColors.goldLight,
                ),
                GlassContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.sparkles, size: 16, color: activeGold),
                              const SizedBox(width: 8),
                              Text('Daily Stoic Insight', style: TextStyle(fontWeight: FontWeight.bold, color: activeGold, fontSize: 13)),
                            ],
                          ),
                          IconButton(
                            icon: Icon(_isPlayingQuoteAudio ? LucideIcons.pause : LucideIcons.volume2, color: activeGold, size: 20),
                            onPressed: () {
                              setState(() => _isPlayingQuoteAudio = !_isPlayingQuoteAudio);
                              VinRToast.show(
                                context,
                                message: _isPlayingQuoteAudio ? 'Playing daily audio reflection' : 'Audio paused',
                                icon: LucideIcons.volume2,
                                iconColor: activeGold,
                              );
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '"We suffer more often in imagination than in reality. Master your thoughts, master your day."',
                        style: TextStyle(color: primaryTextColor, fontSize: 14, height: 1.45, fontStyle: FontStyle.italic),
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text('— Seneca', style: TextStyle(color: mutedTextColor, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Therapist Directory Nudge Card
                const SectionHeader(
                  title: 'PROFESSIONAL CARE',
                  icon: LucideIcons.userCheck,
                  iconColor: VinRColors.emerald,
                ),
                GlassContainer(
                  onTap: () => context.push('/therapists'),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(
                          color: VinRColors.emeraldGlow,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.stethoscope, color: VinRColors.emerald, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Certified Therapists & Coaches', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                            const SizedBox(height: 2),
                            Text('Book 1-on-1 private sessions with specialists.', style: VinRTypography.caption.copyWith(color: mutedTextColor)),
                          ],
                        ),
                      ),
                      Icon(LucideIcons.chevronRight, color: mutedTextColor, size: 18),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildToolCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;

    return GestureDetector(
      onTap: onTap,
      child: GlassContainer(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 18),
                ),
                Icon(LucideIcons.arrowUpRight, color: mutedTextColor, size: 16),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 13), maxLines: 1),
                const SizedBox(height: 2),
                Text(subtitle, style: TextStyle(color: mutedTextColor, fontSize: 10.5), maxLines: 1),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
