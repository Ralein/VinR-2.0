import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';

class GlintScreen extends StatelessWidget {
  const GlintScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Glint — AI Mood & Reflection', style: VinRTypography.h3),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('EMOTIONAL SENTIMENT ANALYTICS', style: VinRTypography.label),
                const SizedBox(height: 12),
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: const BoxDecoration(
                          color: VinRColors.emeraldGlow,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.smile, color: VinRColors.emerald, size: 36),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Overall State: Calibrated & Confident', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('84% Positive sentiment over the last 7 days.', style: VinRTypography.bodySm),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text('AI REFLECTION INSIGHTS FEED', style: VinRTypography.label),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView(
                    children: [
                      _buildInsightCard(
                        title: 'Morning Focus Peak',
                        time: 'Today, 9:30 AM',
                        content: 'Your reflection log showed high clarity after completing the 4-7-8 breathing exercise.',
                        tag: 'Focus',
                        tagColor: VinRColors.emerald,
                      ),
                      const SizedBox(height: 12),
                      _buildInsightCard(
                        title: 'Anxiety Pattern Intercepted',
                        time: 'Yesterday, 8:15 PM',
                        content: 'You utilized the 5-4-3-2-1 grounding protocol when feeling overwhelmed and restored calm within 4 minutes.',
                        tag: 'Resilience',
                        tagColor: VinRColors.sapphire,
                      ),
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

  Widget _buildInsightCard({
    required String title,
    required String time,
    required String content,
    required String tag,
    required Color tagColor,
  }) {
    return GlassContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: tagColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: tagColor.withValues(alpha: 0.4)),
                ),
                child: Text(tag, style: TextStyle(color: tagColor, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(time, style: VinRTypography.caption),
          const SizedBox(height: 12),
          Text(content, style: VinRTypography.bodySm),
        ],
      ),
    );
  }
}
