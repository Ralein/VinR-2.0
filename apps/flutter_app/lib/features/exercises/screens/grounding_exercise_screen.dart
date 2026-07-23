import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';

class GroundingExerciseScreen extends StatefulWidget {
  const GroundingExerciseScreen({super.key});

  @override
  State<GroundingExerciseScreen> createState() => _GroundingExerciseScreenState();
}

class _GroundingExerciseScreenState extends State<GroundingExerciseScreen> {
  int _currentStep = 5;

  final Map<int, Map<String, dynamic>> _steps = {
    5: {
      'title': '5 Things You Can SEE',
      'desc': 'Look around your room. Acknowledge 5 items you can see clearly.',
      'icon': LucideIcons.eye,
      'color': VinRColors.sapphire,
    },
    4: {
      'title': '4 Things You Can TOUCH',
      'desc': 'Feel your feet on the ground, clothing texture, or desk surface.',
      'icon': LucideIcons.hand,
      'color': VinRColors.emerald,
    },
    3: {
      'title': '3 Things You Can HEAR',
      'desc': 'Listen closely to ambient sounds (fan noise, distant birds, air).',
      'icon': LucideIcons.volume2,
      'color': VinRColors.gold,
    },
    2: {
      'title': '2 Things You Can SMELL',
      'desc': 'Notice scents around you or imagine calming lavender or coffee.',
      'icon': LucideIcons.flower2,
      'color': VinRColors.lavender,
    },
    1: {
      'title': '1 Thing You Can TASTE',
      'desc': 'Take a sip of water or notice the current taste in your mouth.',
      'icon': LucideIcons.smile,
      'color': VinRColors.goldLight,
    },
  };

  @override
  Widget build(BuildContext context) {
    final stepInfo = _steps[_currentStep]!;
    final primaryTextColor = context.textColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              children: [
                // Top Header Row
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor, size: 20),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Text('5-4-3-2-1 Grounding', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                  ],
                ),
                const SizedBox(height: 12),

                LinearProgressIndicator(
                  value: (6 - _currentStep) / 5.0,
                  backgroundColor: context.borderColor,
                  valueColor: AlwaysStoppedAnimation<Color>(stepInfo['color'] as Color),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: (stepInfo['color'] as Color).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: stepInfo['color'] as Color, width: 2),
                  ),
                  child: Icon(stepInfo['icon'] as IconData, color: stepInfo['color'] as Color, size: 56),
                ),
                const SizedBox(height: 24),
                Text(
                  stepInfo['title'] as String,
                  style: VinRTypography.h2.copyWith(color: primaryTextColor),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    stepInfo['desc'] as String,
                    textAlign: TextAlign.center,
                    style: VinRTypography.body.copyWith(color: primaryTextColor, height: 1.45),
                  ),
                ),
                const Spacer(),
                GoldButton(
                  text: _currentStep == 1 ? 'Complete Grounding' : 'Next Step (${_currentStep - 1} Left)',
                  onPressed: () {
                    if (_currentStep > 1) {
                      setState(() => _currentStep--);
                    } else {
                      context.pop();
                    }
                  },
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
