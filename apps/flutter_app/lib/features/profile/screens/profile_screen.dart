import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/streak_counter_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../../streak/providers/streak_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final streak = ref.watch(streakProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Profile & Stats', style: VinRTypography.h3),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.settings),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 44,
                      backgroundColor: VinRColors.goldMuted,
                      child: Text(
                        auth.user?.name?.substring(0, 1).toUpperCase() ?? 'W',
                        style: VinRTypography.h1.copyWith(color: VinRColors.goldLight),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(auth.user?.name ?? 'Winner Champion', style: VinRTypography.h2),
                    Text(auth.user?.email ?? 'champion@vinr.app', style: VinRTypography.bodySm),
                    const SizedBox(height: 16),
                    StreakCounterBadge(streakDays: streak.totalDaysCompleted, isWinner: streak.isWinner),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              Text('MY TROPHY ROOM', style: VinRTypography.label),
              const SizedBox(height: 12),
              GlassContainer(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildTrophyItem('7 Days', 'Streak Master', LucideIcons.flame, true),
                    _buildTrophyItem('14 Days', 'Fortitude', LucideIcons.shieldCheck, true),
                    _buildTrophyItem('21 Days', 'VinR Winner', LucideIcons.trophy, streak.isWinner),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text('QUICK ACCESS', style: VinRTypography.label),
              const SizedBox(height: 12),
              GlassContainer(
                onTap: () => context.push('/therapist'),
                child: Row(
                  children: [
                    const Icon(LucideIcons.userCheck, color: VinRColors.goldLight),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Therapist Directory & Booking', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                          Text('Connect with certified growth therapists.', style: VinRTypography.caption),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded, color: VinRColors.textMuted, size: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrophyItem(String title, String subtitle, IconData icon, bool isUnlocked) {
    return Column(
      children: [
        Icon(icon, color: isUnlocked ? VinRColors.goldLight : VinRColors.textGhost, size: 36),
        const SizedBox(height: 6),
        Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isUnlocked ? VinRColors.textPrimary : VinRColors.textMuted)),
        Text(subtitle, style: VinRTypography.caption),
      ],
    );
  }
}
