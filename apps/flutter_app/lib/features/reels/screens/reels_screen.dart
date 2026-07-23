import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Wellness Shorts & Reels', style: VinRTypography.h3),
        centerTitle: true,
      ),
      body: PageView.builder(
        scrollDirection: Axis.vertical,
        itemCount: 3,
        itemBuilder: (context, index) {
          final titles = [
            'How 4-7-8 Breathing Resets Your Nervous System in 60 Seconds',
            'Breaking the 3-Day Habit Slump on Your 21-Day Streak',
            'Stoic Mindset Tricks for Emotional Resilience',
          ];

          return Container(
            decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: VinRColors.goldMuted,
                          shape: BoxShape.circle,
                          border: Border.all(color: VinRColors.borderGold, width: 2),
                        ),
                        child: const Icon(LucideIcons.play, color: VinRColors.goldLight, size: 54),
                      ),
                    ),
                    const Spacer(),
                    GlassContainer(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('SHORT REEL #${index + 1}', style: VinRTypography.label.copyWith(color: VinRColors.goldLight)),
                          const SizedBox(height: 8),
                          Text(titles[index], style: VinRTypography.h3),
                          const SizedBox(height: 12),
                          Row(
                            children: const [
                              Icon(LucideIcons.heart, color: VinRColors.crimson, size: 20),
                              SizedBox(width: 6),
                              Text('1.4k Wins', style: TextStyle(color: VinRColors.textSecondary)),
                              SizedBox(width: 20),
                              Icon(LucideIcons.share2, color: VinRColors.textSecondary, size: 20),
                              SizedBox(width: 6),
                              Text('Share', style: TextStyle(color: VinRColors.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
