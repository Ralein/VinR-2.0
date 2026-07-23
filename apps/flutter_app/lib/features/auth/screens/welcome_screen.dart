import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),

                // Center Gyroscope Logo Bed
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: VinRColors.goldMuted,
                      border: Border.all(color: VinRColors.borderGold, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: VinRColors.gold.withValues(alpha: 0.3),
                          blurRadius: 24,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(
                        LucideIcons.flame,
                        size: 48,
                        color: VinRColors.goldLight,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                Text(
                  'vinR 2.0',
                  textAlign: TextAlign.center,
                  style: VinRTypography.h1.copyWith(
                    fontSize: 44,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 12),

                Text(
                  'Win your life back.',
                  textAlign: TextAlign.center,
                  style: VinRTypography.h2.copyWith(
                    fontSize: 24,
                    color: VinRColors.goldLight,
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  'The science-based system that rebuilds\nyour habits, identity & momentum.',
                  textAlign: TextAlign.center,
                  style: VinRTypography.bodySm.copyWith(
                    color: VinRColors.textMuted,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),

                GlassContainer(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: const [
                      _TrustPill(icon: LucideIcons.zap, label: 'Science-backed'),
                      _TrustPill(icon: LucideIcons.sparkles, label: 'AI-powered'),
                      _TrustPill(icon: LucideIcons.target, label: '21-day engine'),
                    ],
                  ),
                ),

                const Spacer(),

                GoldButton(
                  text: 'Begin your winning journey →',
                  onPressed: () => context.push('/sign-up'),
                ),
                const SizedBox(height: 14),

                OutlinedButton(
                  onPressed: () => context.push('/sign-in'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: VinRColors.borderLight),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    minimumSize: const Size.fromHeight(52),
                  ),
                  child: Text(
                    'Already winning? Sign in →',
                    style: VinRTypography.body.copyWith(
                      fontWeight: FontWeight.w600,
                      color: VinRColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TrustPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TrustPill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: VinRColors.goldLight, size: 14),
        const SizedBox(width: 4),
        Text(label, style: VinRTypography.caption.copyWith(fontSize: 11)),
      ],
    );
  }
}
