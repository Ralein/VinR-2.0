import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/glass_container.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: VinRColors.voidGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: VinRColors.goldMuted,
                      shape: BoxShape.circle,
                      border: Border.all(color: VinRColors.borderGold, width: 1.5),
                    ),
                    child: const Icon(
                      Icons.military_tech_rounded,
                      size: 64,
                      color: VinRColors.goldLight,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'VinR 2.0',
                  textAlign: TextAlign.center,
                  style: VinRTypography.h1.copyWith(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '"We don\'t just support you.\nWe make you a WINNER."',
                  textAlign: TextAlign.center,
                  style: VinRTypography.italic.copyWith(
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 24),
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    'Turn your emotional wellness into a 21-day winning streak. Science-backed growth, AI reflection, and instant relief when you need it.',
                    textAlign: TextAlign.center,
                    style: VinRTypography.bodySm.copyWith(
                      color: VinRColors.textSecondary,
                      height: 1.5,
                    ),
                  ),
                ),
                const Spacer(),
                GoldButton(
                  text: 'Get Started',
                  onPressed: () => context.push('/sign-up'),
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () => context.push('/sign-in'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: VinRColors.borderLight),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    minimumSize: const Size.fromHeight(56),
                  ),
                  child: Text(
                    'I Already Have an Account',
                    style: VinRTypography.body.copyWith(
                      fontWeight: FontWeight.w600,
                      color: VinRColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
