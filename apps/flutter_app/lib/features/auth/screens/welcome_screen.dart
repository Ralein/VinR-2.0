import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_animations.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),

                // Native-App Cinematic Flame Logo Entrance
                Center(
                  child: Hero(
                    tag: 'vinr_flame_logo',
                    child: CinematicHeroEntrance(
                      child: AnimatedPulse(
                        duration: const Duration(milliseconds: 2200),
                        minScale: 0.96,
                        maxScale: 1.05,
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: context.goldMutedColor.withValues(alpha: 0.8),
                            border: Border.all(color: context.borderGoldColor, width: 2.5),
                            boxShadow: [
                              BoxShadow(
                                color: context.goldColor.withValues(alpha: 0.45),
                                blurRadius: 36,
                                spreadRadius: 8,
                              ),
                              BoxShadow(
                                color: context.goldLightColor.withValues(alpha: 0.2),
                                blurRadius: 60,
                                spreadRadius: 16,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Container(
                              width: 86,
                              height: 86,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: context.goldColor.withValues(alpha: 0.18),
                              ),
                              child: Icon(
                                LucideIcons.flame,
                                size: 56,
                                color: context.goldLightColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // VinR Branding Header
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 200),
                  child: Text(
                    'VinR',
                    textAlign: TextAlign.center,
                    style: VinRTypography.h1.copyWith(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1.2,
                      color: context.textColor,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 300),
                  child: Text(
                    'Win your life back.',
                    textAlign: TextAlign.center,
                    style: VinRTypography.h2.copyWith(
                      fontSize: 22,
                      fontWeight: FontWeight.w600,
                      color: context.goldLightColor,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 400),
                  child: Text(
                    'The science-backed daily system that rebuilds\nyour habits, identity & momentum.',
                    textAlign: TextAlign.center,
                    style: VinRTypography.bodySm.copyWith(
                      color: context.textMutedColor,
                      height: 1.5,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Trust Badges Box
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 500),
                  child: GlassContainer(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    child: Row(
                      children: const [
                        Expanded(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: _TrustPill(icon: LucideIcons.zap, label: 'Science-backed'),
                          ),
                        ),
                        Expanded(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: _TrustPill(icon: LucideIcons.sparkles, label: 'AI-powered'),
                          ),
                        ),
                        Expanded(
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: _TrustPill(icon: LucideIcons.target, label: '21-day engine'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 40),

                // CTA Buttons
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 600),
                  child: Column(
                    children: [
                      GoldButton(
                        text: 'Begin your winning journey →',
                        onPressed: () => context.push('/sign-up'),
                      ),
                      const SizedBox(height: 14),

                      AnimatedPressable(
                        onTap: () => context.push('/sign-in'),
                        child: OutlinedButton(
                          onPressed: () => context.push('/sign-in'),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: context.borderColor, width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            minimumSize: const Size.fromHeight(54),
                          ),
                          child: Text(
                            'Already winning? Sign in →',
                            style: VinRTypography.body.copyWith(
                              fontWeight: FontWeight.w600,
                              color: context.textColor,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ),
                    ],
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
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: context.goldLightColor, size: 15),
        const SizedBox(width: 6),
        Text(
          label,
          style: VinRTypography.caption.copyWith(
            fontSize: 12,
            color: context.textMutedColor,
            fontWeight: FontWeight.w500,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
