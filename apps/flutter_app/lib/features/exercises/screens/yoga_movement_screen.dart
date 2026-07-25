import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/vinr_toast.dart';

class FunctionalExercise {
  final String id;
  final String name;
  final String targetArea;
  final String durationText;
  final String category;
  final String difficulty;
  final String imagePath;
  final Color color;
  final List<String> benefits;
  final List<String> instructions;

  FunctionalExercise({
    required this.id,
    required this.name,
    required this.targetArea,
    required this.durationText,
    required this.category,
    required this.difficulty,
    required this.imagePath,
    required this.color,
    required this.benefits,
    required this.instructions,
  });
}

class YogaMovementScreen extends StatefulWidget {
  const YogaMovementScreen({super.key});

  @override
  State<YogaMovementScreen> createState() => _YogaMovementScreenState();
}

class _YogaMovementScreenState extends State<YogaMovementScreen> {
  String _selectedCategory = 'All';

  final List<FunctionalExercise> _allExercises = [
    FunctionalExercise(
      id: 'squats',
      name: 'Bodyweight Deep Squats',
      targetArea: 'Quadriceps & Glutes',
      durationText: '45 Secs',
      category: 'Lower Body',
      difficulty: 'Beginner',
      imagePath: 'assets/workout/squat.png',
      color: VinRColors.gold,
      benefits: ['Leg Power', 'Glute Activation', 'Joint Mobility'],
      instructions: [
        'Stand with feet shoulder-width apart, toes turned out slightly.',
        'Hinge hips back and lower down until thighs are parallel to ground.',
        'Keep chest lifted and knees tracking in line with toes.',
        'Drive through heels to return to standing position.',
      ],
    ),
    FunctionalExercise(
      id: 'plank',
      name: 'Core Isometric Plank',
      targetArea: 'Rectus Abdominis & Core',
      durationText: '45 Secs',
      category: 'Core & Stability',
      difficulty: 'Beginner',
      imagePath: 'assets/workout/plank.png',
      color: VinRColors.emerald,
      benefits: ['Core Endurance', 'Spine Support', 'Postural Alignment'],
      instructions: [
        'Place forearms on floor with elbows directly under shoulders.',
        'Extend legs back and maintain a straight line from head to heels.',
        'Squeeze core and glutes; avoid letting lower back sag.',
        'Breathe deeply and hold position for the full duration.',
      ],
    ),
    FunctionalExercise(
      id: 'pushups',
      name: 'Chest & Upper Body Push-Ups',
      targetArea: 'Pectorals & Triceps',
      durationText: '40 Secs',
      category: 'Upper Body',
      difficulty: 'Intermediate',
      imagePath: 'assets/workout/pushup.png',
      color: VinRColors.sapphire,
      benefits: ['Chest Strength', 'Tricep Endurance', 'Shoulder Power'],
      instructions: [
        'Start in a high plank position with hands slightly wider than shoulders.',
        'Lower chest toward floor until elbows reach a 90-degree angle.',
        'Keep body rigid and elbows tucked back at a 45-degree angle.',
        'Push firmly through palms to press back up.',
      ],
    ),
    FunctionalExercise(
      id: 'mountain_climbers',
      name: 'Dynamic Mountain Climbers',
      targetArea: 'Full Body & Core',
      durationText: '40 Secs',
      category: 'Cardio & Agility',
      difficulty: 'Intermediate',
      imagePath: 'assets/workout/mountain_climbers.png',
      color: VinRColors.crimson,
      benefits: ['Cardio Conditioning', 'Calorie Burn', 'Core Agility'],
      instructions: [
        'Begin in high plank position with shoulders over wrists.',
        'Drive right knee rapidly toward chest, then quickly switch legs.',
        'Keep hips stable and level while driving feet.',
        'Maintain a fast, continuous cadence.',
      ],
    ),
    FunctionalExercise(
      id: 'jumping_jacks',
      name: 'Cardio Jumping Jacks',
      targetArea: 'Full Body Endurance',
      durationText: '60 Secs',
      category: 'Cardio & Agility',
      difficulty: 'Beginner',
      imagePath: 'assets/workout/jumping_jacks.png',
      color: VinRColors.goldLight,
      benefits: ['Heart Rate Elevation', 'Calve Strength', 'Full Body Warmup'],
      instructions: [
        'Stand tall with feet together and hands at sides.',
        'Jump feet outward while sweeping arms overhead.',
        'Land softly on the balls of your feet and return to start position.',
        'Keep a steady, energetic rhythm.',
      ],
    ),
  ];

  void _showExerciseGuideModal(FunctionalExercise exercise) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    int secondsLeft = 45;
    bool isTimerRunning = false;
    Timer? timer;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            void toggleTimer() {
              HapticFeedback.mediumImpact();
              if (isTimerRunning) {
                timer?.cancel();
                setModalState(() => isTimerRunning = false);
              } else {
                setModalState(() => isTimerRunning = true);
                timer = Timer.periodic(const Duration(seconds: 1), (t) {
                  if (!context.mounted) {
                    t.cancel();
                    return;
                  }
                  if (secondsLeft > 1) {
                    setModalState(() => secondsLeft--);
                  } else {
                    t.cancel();
                    setModalState(() {
                      secondsLeft = 0;
                      isTimerRunning = false;
                    });
                    HapticFeedback.heavyImpact();
                  }
                });
              }
            }

            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 36,
                          height: 4,
                          decoration: BoxDecoration(
                            color: context.textGhostColor.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: exercise.color.withValues(alpha: 0.4), width: 1.5),
                            ),
                            child: Image.asset(
                              exercise.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(LucideIcons.activity, color: exercise.color, size: 32),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(exercise.name, style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                                Text(exercise.targetArea, style: TextStyle(color: activeGold, fontWeight: FontWeight.bold, fontSize: 13)),
                                Text('${exercise.category} • ${exercise.difficulty}', style: TextStyle(color: mutedTextColor, fontSize: 12)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Interactive Exercise Timer
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: exercise.color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: exercise.color.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('EXERCISE TIMER', style: TextStyle(color: exercise.color, fontSize: 11, fontWeight: FontWeight.bold)),
                                Text(
                                  '00:${secondsLeft.toString().padLeft(2, '0')}',
                                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: primaryTextColor),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: toggleTimer,
                              icon: Icon(isTimerRunning ? LucideIcons.pause : LucideIcons.play, size: 16),
                              label: Text(isTimerRunning ? 'Pause' : 'Start Timer'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: exercise.color,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Key Target Benefits
                      Text('PRIMARY BENEFITS', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: exercise.benefits.map((benefit) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: exercise.color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: exercise.color.withValues(alpha: 0.2)),
                            ),
                            child: Text(benefit, style: TextStyle(color: exercise.color, fontSize: 11.5, fontWeight: FontWeight.bold)),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 20),

                      // Step-by-step Form Instructions
                      Text('FORM & EXECUTION STEPS', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      ...exercise.instructions.asMap().entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${entry.key + 1}. ', style: TextStyle(fontWeight: FontWeight.bold, color: exercise.color, fontSize: 13)),
                              Expanded(child: Text(entry.value, style: TextStyle(color: primaryTextColor, fontSize: 13, height: 1.35))),
                            ],
                          ),
                        );
                      }),
                      const SizedBox(height: 20),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            timer?.cancel();
                            Navigator.pop(context);
                            VinRToast.show(
                              context,
                              message: '${exercise.name} Completed!',
                              icon: LucideIcons.checkCircle2,
                              iconColor: VinRColors.gold,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: exercise.color,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: const Text('Mark Exercise Complete ✓', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    final categories = ['All', 'Lower Body', 'Upper Body', 'Core & Stability', 'Cardio & Agility'];

    final filteredExercises = _selectedCategory == 'All'
        ? _allExercises
        : _allExercises.where((e) => e.category == _selectedCategory).toList();

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Icon(LucideIcons.arrowLeft, color: primaryTextColor),
                      onPressed: () => context.pop(),
                    ),
                    Text('Functional Movement Hub', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                    const SizedBox(width: 48),
                  ],
                ),
                const SizedBox(height: 16),

                // Top Header Banner
                GlassContainer(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: activeGold.withValues(alpha: 0.18),
                          shape: BoxShape.circle,
                          border: Border.all(color: activeGold.withValues(alpha: 0.4)),
                        ),
                        child: Icon(LucideIcons.activity, color: activeGold, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FUNCTIONAL FITNESS',
                              style: VinRTypography.label.copyWith(
                                color: activeGold,
                                fontSize: 11,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Movement & Mobility',
                              style: VinRTypography.h2.copyWith(fontSize: 22, color: primaryTextColor),
                            ),
                            Text(
                              'Boost physical endurance, joint health & posture',
                              style: VinRTypography.caption.copyWith(color: mutedTextColor),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Category Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: categories.map((cat) {
                      final isSel = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedCategory = cat),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSel ? activeGold.withValues(alpha: 0.18) : (isLight ? Colors.white : VinRColors.surface),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSel ? activeGold : (isLight ? const Color(0x1A000000) : VinRColors.border),
                                width: isSel ? 1.5 : 1,
                              ),
                            ),
                            child: Text(
                              cat,
                              style: TextStyle(
                                color: isSel ? activeGold : mutedTextColor,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                fontSize: 12.5,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 24),

                // Exercise Routines Grid
                ...filteredExercises.map((exercise) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: GlassContainer(
                      onTap: () => _showExerciseGuideModal(exercise),
                      child: Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: exercise.color.withValues(alpha: 0.4), width: 1.5),
                            ),
                            child: Image.asset(
                              exercise.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(LucideIcons.activity, color: exercise.color, size: 32),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(exercise.name, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                                const SizedBox(height: 2),
                                Text(exercise.targetArea, style: TextStyle(color: exercise.color, fontWeight: FontWeight.bold, fontSize: 12)),
                                const SizedBox(height: 2),
                                Text('${exercise.durationText} • ${exercise.difficulty}', style: TextStyle(color: mutedTextColor, fontSize: 11.5)),
                              ],
                            ),
                          ),
                          Icon(LucideIcons.chevronRight, color: mutedTextColor, size: 18),
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
