import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';

class YogaMovementScreen extends StatelessWidget {
  const YogaMovementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Guided Yoga & Movement', style: VinRTypography.h3),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('5-MINUTE DESK RELEASE', style: VinRTypography.label),
                const SizedBox(height: 12),
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.activity, color: VinRColors.lavender, size: 54),
                      const SizedBox(height: 12),
                      Text('Seated Spine Twist & Neck Release', style: VinRTypography.h3, textAlign: TextAlign.center),
                      const SizedBox(height: 8),
                      Text('Release muscle tension stored in shoulders and upper back.', style: VinRTypography.bodySm, textAlign: TextAlign.center),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text('POSE STEPS', style: VinRTypography.label),
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
          Expanded(child: Text(title, style: VinRTypography.bodySm)),
        ],
      ),
    );
  }
}
