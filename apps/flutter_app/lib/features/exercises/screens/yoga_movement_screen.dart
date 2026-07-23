import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';

class YogaMovementScreen extends StatelessWidget {
  const YogaMovementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor, size: 20),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Text('Guided Yoga & Movement', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                  ],
                ),
                const SizedBox(height: 16),

                Text('5-MINUTE DESK RELEASE', style: VinRTypography.label.copyWith(color: mutedTextColor)),
                const SizedBox(height: 12),
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.activity, color: VinRColors.lavender, size: 48),
                      const SizedBox(height: 12),
                      Text(
                        'Seated Spine Twist & Neck Release',
                        style: VinRTypography.h3.copyWith(color: primaryTextColor),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Release muscle tension stored in shoulders and upper back.',
                        style: VinRTypography.bodySm.copyWith(color: mutedTextColor),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text('POSE STEPS', style: VinRTypography.label.copyWith(color: mutedTextColor)),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView(
                    children: const [
                      _PoseStepTile(step: '1', title: 'Sit tall with feet flat on the floor.'),
                      SizedBox(height: 10),
                      _PoseStepTile(step: '2', title: 'Inhale and reach right arm to left knee.'),
                      SizedBox(height: 10),
                      _PoseStepTile(step: '3', title: 'Exhale and twist upper torso gently.'),
                      SizedBox(height: 10),
                      _PoseStepTile(step: '4', title: 'Hold for 5 deep breaths per side.'),
                    ],
                  ),
                ),
                GoldButton(
                  text: 'Finish Pose Sequence',
                  onPressed: () => context.pop(),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PoseStepTile extends StatelessWidget {
  final String step;
  final String title;

  const _PoseStepTile({required this.step, required this.title});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: VinRColors.lavenderGlow,
            child: Text(step, style: const TextStyle(color: VinRColors.lavender, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: VinRTypography.bodySm.copyWith(color: context.textColor),
            ),
          ),
        ],
      ),
    );
  }
}
