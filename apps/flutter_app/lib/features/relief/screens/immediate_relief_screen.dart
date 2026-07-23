import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';

class ImmediateReliefScreen extends StatefulWidget {
  const ImmediateReliefScreen({super.key});

  @override
  State<ImmediateReliefScreen> createState() => _ImmediateReliefScreenState();
}

class _ImmediateReliefScreenState extends State<ImmediateReliefScreen> {
  int? _activeGuideStep;
  String? _activeGuideTitle;
  List<String>? _activeGuideItems;

  final List<Map<String, dynamic>> _techniques = [
    {
      'name': 'Box Breathing',
      'desc': 'Equal 4-count inhale, hold, exhale, hold pattern',
      'icon': LucideIcons.wind,
      'color': const Color(0xFF4A90D9),
      'duration': '1–5 min',
      'difficulty': 'Easy',
      'route': '/breathing',
    },
    {
      'name': '4-7-8 Sleep Breath',
      'desc': 'Tranquilizer for your nervous system',
      'icon': LucideIcons.wind,
      'color': const Color(0xFF4A90D9),
      'duration': '2–5 min',
      'difficulty': 'Easy',
      'route': '/breathing',
    },
    {
      'name': '5-4-3-2-1 Grounding',
      'desc': 'Engage all five senses to reconnect',
      'icon': LucideIcons.layers,
      'color': VinRColors.emerald,
      'duration': '3–5 min',
      'difficulty': 'Easy',
      'route': '/grounding',
    },
    {
      'name': 'Progressive Muscle Relaxation',
      'desc': 'Systematic tension and release through muscle groups',
      'icon': LucideIcons.dumbbell,
      'color': VinRColors.gold,
      'duration': '8–12 min',
      'difficulty': 'Medium',
      'steps': [
        'Curl your toes tightly for 5 seconds, then release.',
        'Point your toes up toward your shins. Hold, then let go.',
        'Squeeze your thigh muscles tightly. Hold, then release.',
        'Tighten your stomach as if bracing for a punch. Hold, then relax.',
        'Make tight fists. Squeeze hard for 5 seconds, then open.',
        'Flex your biceps hard. Hold tension, then let arms go limp.',
        'Raise shoulders up to your ears. Hold tightly, then drop down.',
      ],
    },
    {
      'name': 'Guided Visualization',
      'desc': 'Imagine a peaceful safe place in vivid detail',
      'icon': LucideIcons.eye,
      'color': VinRColors.lavender,
      'duration': '5–10 min',
      'difficulty': 'Medium',
      'steps': [
        'Close your eyes and take three slow breaths.',
        'Imagine yourself walking toward a peaceful place — beach, forest, or warm room.',
        'Look around this place. Notice the colors. What do you see?',
        'Listen carefully. What sounds are here? Birds, water, wind?',
        'Feel the ground beneath your feet. Soft sand or cool grass?',
        'Breathe in deeply. Find a comfortable spot to rest.',
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    if (_activeGuideItems != null) {
      final isLast = _activeGuideStep! == _activeGuideItems!.length - 1;
      return Scaffold(
        body: AmbientBackground(
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.x, color: VinRColors.textPrimary),
                        onPressed: () => setState(() => _activeGuideItems = null),
                      ),
                      Text(_activeGuideTitle!, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                      Text('${_activeGuideStep! + 1}/${_activeGuideItems!.length}', style: VinRTypography.label),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: (_activeGuideStep! + 1) / _activeGuideItems!.length.toDouble(),
                    backgroundColor: VinRColors.surface,
                    valueColor: const AlwaysStoppedAnimation<Color>(VinRColors.gold),
                  ),
                  const Spacer(),
                  GlassContainer(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      _activeGuideItems![_activeGuideStep!],
                      textAlign: TextAlign.center,
                      style: VinRTypography.h3.copyWith(height: 1.4),
                    ),
                  ),
                  const Spacer(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (_activeGuideStep! > 0)
                        OutlinedButton(
                          onPressed: () => setState(() => _activeGuideStep = _activeGuideStep! - 1),
                          child: const Text('Back'),
                        )
                      else
                        const SizedBox(),
                      ElevatedButton(
                        onPressed: () {
                          if (isLast) {
                            setState(() => _activeGuideItems = null);
                          } else {
                            setState(() => _activeGuideStep = _activeGuideStep! + 1);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: VinRColors.gold,
                          foregroundColor: Colors.black,
                        ),
                        child: Text(isLast ? 'Done' : 'Next Step'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Column(
              children: [
                // Hero Header
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: VinRColors.goldMuted,
                          border: Border.all(color: VinRColors.borderGold),
                        ),
                        child: const Icon(LucideIcons.zap, color: VinRColors.goldLight, size: 28),
                      ),
                      const SizedBox(height: 12),
                      Text('Immediate Relief', style: VinRTypography.h1.copyWith(fontSize: 28)),
                      const SizedBox(height: 6),
                      Text(
                        'Evidence-based techniques to help you feel better right now.',
                        textAlign: TextAlign.center,
                        style: VinRTypography.bodySm.copyWith(color: VinRColors.textMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Techniques Section
                const SectionHeader(
                  title: 'CHOOSE A TECHNIQUE',
                  icon: LucideIcons.sparkles,
                  iconColor: VinRColors.goldLight,
                ),
                ..._techniques.map((tech) {
                  final color = tech['color'] as Color;
                  final icon = tech['icon'] as IconData;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GlassContainer(
                      onTap: () {
                        if (tech.containsKey('route')) {
                          context.push(tech['route'] as String);
                        } else if (tech.containsKey('steps')) {
                          setState(() {
                            _activeGuideTitle = tech['name'] as String;
                            _activeGuideItems = tech['steps'] as List<String>;
                            _activeGuideStep = 0;
                          });
                        }
                      },
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: color.withValues(alpha: 0.3)),
                            ),
                            child: Icon(icon, color: color, size: 22),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tech['name'] as String, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                const SizedBox(height: 2),
                                Text(tech['desc'] as String, style: VinRTypography.caption, maxLines: 1),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(LucideIcons.clock, color: VinRColors.textMuted, size: 11),
                                    const SizedBox(width: 4),
                                    Text(tech['duration'] as String, style: VinRTypography.caption.copyWith(fontSize: 11)),
                                    const SizedBox(width: 12),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(tech['difficulty'] as String, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: color.withValues(alpha: 0.12),
                            ),
                            child: Icon(LucideIcons.play, color: color, size: 14),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
