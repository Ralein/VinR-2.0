import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';

class ImmediateReliefScreen extends StatelessWidget {
  const ImmediateReliefScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Immediate Relief & Crisis SOS', style: VinRTypography.h3),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                // Panic SOS Alert Center
                GlassContainer(
                  color: VinRColors.crimsonGlow,
                  border: Border.all(color: VinRColors.crimson, width: 1.5),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      const Icon(LucideIcons.shieldAlert, color: VinRColors.crimson, size: 54),
                      const SizedBox(height: 12),
                      Text('Feeling Overwhelmed?', style: VinRTypography.h2.copyWith(color: VinRColors.textPrimary)),
                      const SizedBox(height: 8),
                      Text(
                        'Tap the panic button for immediate step-by-step calming protocols or crisis contact.',
                        textAlign: TextAlign.center,
                        style: VinRTypography.bodySm,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => context.push('/grounding'),
                        icon: const Icon(LucideIcons.anchor),
                        label: const Text('ACTIVATE SOS GROUNDING NOW'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: VinRColors.crimson,
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Text('INSTANT CALMING PROTOCOLS', style: VinRTypography.label),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView(
                    children: [
                      GlassContainer(
                        onTap: () => context.push('/breathing'),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: const BoxDecoration(
                                color: VinRColors.emeraldGlow,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.wind, color: VinRColors.emerald),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('4-7-8 Deep Breathing', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                  Text('Rapidly lowers heart rate and vagal tone.', style: VinRTypography.caption),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios_rounded, color: VinRColors.textMuted, size: 16),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      GlassContainer(
                        onTap: () => context.push('/grounding'),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: const BoxDecoration(
                                color: VinRColors.sapphireGlow,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.eye, color: VinRColors.sapphire),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('5-4-3-2-1 Sensory Grounding', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                  Text('Anchors awareness back to the physical room.', style: VinRTypography.caption),
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
