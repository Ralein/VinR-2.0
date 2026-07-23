import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/avatar_ring.dart';
import '../../../core/widgets/streak_counter_badge.dart';
import '../../../core/widgets/section_header.dart';
import '../../auth/providers/auth_provider.dart';
import '../../streak/providers/streak_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final streak = ref.watch(streakProvider);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 100),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text('Profile & Trophy Room', style: VinRTypography.h1.copyWith(fontSize: 24, color: context.textColor)),
                  ),
                  IconButton(
                    icon: Icon(LucideIcons.settings, color: context.textMutedColor),
                    onPressed: () => context.push('/settings'),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // User Info Card
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
                    Text(auth.user?.name ?? 'Winner Champion', style: VinRTypography.h2.copyWith(color: context.textColor)),
                    Text(auth.user?.email ?? 'champion@vinr.app', style: VinRTypography.bodySm.copyWith(color: context.textMutedColor)),
                    const SizedBox(height: 14),
                    StreakCounterBadge(streakDays: streak.totalDaysCompleted, isWinner: streak.isWinner),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              const SectionHeader(
                title: 'MY TROPHY ROOM',
                icon: LucideIcons.trophy,
              ),

              GlassContainer(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildTrophyItem(context, '7 Days', 'Streak Master', LucideIcons.flame, true),
                    _buildTrophyItem(context, '14 Days', 'Fortitude', LucideIcons.shieldCheck, true),
                    _buildTrophyItem(context, '21 Days', 'VinR Winner', LucideIcons.trophy, streak.isWinner),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'DIRECTORY & SETTINGS',
                icon: LucideIcons.sliders,
              ),

              GlassContainer(
                onTap: () => context.push('/therapist'),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: context.goldMutedColor,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.userCheck, color: context.goldLightColor),
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

  Widget _buildTrophyItem(BuildContext context, String title, String subtitle, IconData icon, bool isUnlocked) {
    return Column(
      children: [
        Icon(icon, color: isUnlocked ? context.goldColor : context.textGhostColor, size: 36),
        const SizedBox(height: 6),
        Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isUnlocked ? context.textColor : context.textMutedColor)),
        Text(subtitle, style: VinRTypography.caption.copyWith(color: context.textMutedColor)),
      ],
    );
  }
}
