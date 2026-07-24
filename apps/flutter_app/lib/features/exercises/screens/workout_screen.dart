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

class WorkoutExercise {
  final String id;
  final String name;
  final String category;
  final String setsReps;
  final int totalSets;
  final int estCalories;
  final String difficulty;
  final String imagePath;
  final Color color;
  final List<String> muscleTags;
  final List<String> formCues;

  WorkoutExercise({
    required this.id,
    required this.name,
    required this.category,
    required this.setsReps,
    required this.totalSets,
    required this.estCalories,
    required this.difficulty,
    required this.imagePath,
    required this.color,
    required this.muscleTags,
    required this.formCues,
  });
}

class WorkoutScreen extends StatefulWidget {
  const WorkoutScreen({super.key});

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  String _selectedCategory = 'All';
  int _totalCaloriesBurnedToday = 185;

  final List<WorkoutExercise> _allWorkouts = [
    WorkoutExercise(
      id: 'pushups',
      name: 'Explosive Push-Ups',
      category: 'Upper Body',
      setsReps: '3 Sets x 15 Reps',
      totalSets: 3,
      estCalories: 75,
      difficulty: 'Intermediate',
      imagePath: 'assets/workout/pushup.png',
      color: VinRColors.gold,
      muscleTags: ['Pectorals', 'Triceps', 'Anterior Deltoids'],
      formCues: [
        'Place hands slightly wider than shoulder-width.',
        'Keep core engaged and body in a straight plank line.',
        'Lower chest until elbows reach 90 degrees.',
        'Push explosively back up to starting position.',
      ],
    ),
    WorkoutExercise(
      id: 'plank',
      name: 'Isometric Plank Hold',
      category: 'Core & ABS',
      setsReps: '3 Sets x 45 Secs',
      totalSets: 3,
      estCalories: 60,
      difficulty: 'Beginner',
      imagePath: 'assets/workout/plank.png',
      color: VinRColors.emerald,
      muscleTags: ['Rectus Abdominis', 'Obliques', 'Transverse Abs'],
      formCues: [
        'Rest forearms on mat with elbows under shoulders.',
        'Keep hips aligned with shoulders, don\'t let lower back sag.',
        'Squeeze glutes and pull navel toward spine.',
        'Breathe steadily throughout the 45-second hold.',
      ],
    ),
    WorkoutExercise(
      id: 'squats',
      name: 'Bodyweight Deep Squats',
      category: 'Lower Body',
      setsReps: '4 Sets x 20 Reps',
      totalSets: 4,
      estCalories: 95,
      difficulty: 'Beginner',
      imagePath: 'assets/workout/squat.png',
      color: VinRColors.sapphire,
      muscleTags: ['Quadriceps', 'Glutes', 'Hamstrings'],
      formCues: [
        'Stand with feet shoulder-width apart, toes turned out 15 degrees.',
        'Hinge hips back as if sitting into a chair.',
        'Keep chest lifted and knees tracking over toes.',
        'Drive through heels to stand back up tall.',
      ],
    ),
    WorkoutExercise(
      id: 'jumping_jacks',
      name: 'Cardio Jumping Jacks',
      category: 'Full Body Cardio',
      setsReps: '3 Sets x 60 Secs',
      totalSets: 3,
      estCalories: 110,
      difficulty: 'Beginner',
      imagePath: 'assets/workout/jumping_jacks.png',
      color: VinRColors.lavender,
      muscleTags: ['Cardio Burn', 'Calves', 'Shoulder Mobility'],
      formCues: [
        'Start with feet together and hands at your sides.',
        'Jump feet out wide while clapping hands overhead.',
        'Land softly on balls of feet and return to start.',
        'Maintain a quick, rhythmic tempo.',
      ],
    ),
    WorkoutExercise(
      id: 'bicep_curls',
      name: 'Resistance Bicep Curls',
      category: 'Upper Body',
      setsReps: '3 Sets x 12 Reps',
      totalSets: 3,
      estCalories: 50,
      difficulty: 'Intermediate',
      imagePath: 'assets/workout/bicep_curls.png',
      color: VinRColors.gold,
      muscleTags: ['Biceps Brachii', 'Brachialis', 'Forearms'],
      formCues: [
        'Stand tall with elbows pinned close to your torso.',
        'Curl weights up toward shoulders while contracting biceps.',
        'Pause at peak contraction for 1 second.',
        'Lower weights slowly under control for 3 seconds.',
      ],
    ),
    WorkoutExercise(
      id: 'mountain_climbers',
      name: 'Dynamic Mountain Climbers',
      category: 'Core & ABS',
      setsReps: '3 Sets x 40 Secs',
      totalSets: 3,
      estCalories: 85,
      difficulty: 'Intermediate',
      imagePath: 'assets/workout/mountain_climbers.png',
      color: VinRColors.crimson,
      muscleTags: ['Core Abs', 'Hip Flexors', 'Shoulder Endurance'],
      formCues: [
        'Start in a high push-up plank position.',
        'Drive right knee toward chest, then quickly switch to left.',
        'Keep hips low and shoulders steady over wrists.',
        'Drive legs continuously with high speed.',
      ],
    ),
    WorkoutExercise(
      id: 'burpees',
      name: 'Full Body Burpees',
      category: 'Full Body Cardio',
      setsReps: '3 Sets x 12 Reps',
      totalSets: 3,
      estCalories: 130,
      difficulty: 'Advanced',
      imagePath: 'assets/workout/burpees.png',
      color: VinRColors.crimson,
      muscleTags: ['Full Body Power', 'Cardio Conditioning', 'Explosiveness'],
      formCues: [
        'Drop into a squat and place hands flat on floor.',
        'Jump feet back into a push-up position and perform 1 push-up.',
        'Jump feet back to squat and explosively jump straight up.',
        'Reach arms overhead during jump.',
      ],
    ),
  ];

  void _showWorkoutTrackerModal(WorkoutExercise workout) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    List<bool> setsCompleted = List.generate(workout.totalSets, (index) => false);
    int restSecondsRemaining = 0;
    Timer? restTimer;

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
            void startRestTimer() {
              HapticFeedback.mediumImpact();
              restTimer?.cancel();
              setModalState(() => restSecondsRemaining = 30);
              restTimer = Timer.periodic(const Duration(seconds: 1), (t) {
                if (!context.mounted) {
                  t.cancel();
                  return;
                }
                if (restSecondsRemaining > 1) {
                  setModalState(() => restSecondsRemaining--);
                } else {
                  t.cancel();
                  setModalState(() => restSecondsRemaining = 0);
                  HapticFeedback.heavyImpact();
                }
              });
            }

            final completedCount = setsCompleted.where((c) => c).length;

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

                      // Graphic Banner Header
                      Row(
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: workout.color.withValues(alpha: 0.4), width: 1.5),
                            ),
                            child: Image.asset(
                              workout.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(LucideIcons.dumbbell, color: workout.color, size: 36),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(workout.name, style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Text(workout.setsReps, style: TextStyle(color: activeGold, fontWeight: FontWeight.bold, fontSize: 13)),
                                    const SizedBox(width: 10),
                                    Text('•  ~${workout.estCalories} kcal', style: TextStyle(color: mutedTextColor, fontSize: 12)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Set Tracker Checkbox List
                      Text('SET PROGRESS TRACKER ($completedCount/${workout.totalSets})', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(workout.totalSets, (index) {
                          final isDone = setsCompleted[index];
                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: InkWell(
                                onTap: () {
                                  HapticFeedback.lightImpact();
                                  setModalState(() => setsCompleted[index] = !setsCompleted[index]);
                                  if (setsCompleted[index]) startRestTimer();
                                },
                                borderRadius: BorderRadius.circular(14),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: isDone ? workout.color.withValues(alpha: 0.18) : context.surfaceColor,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: isDone ? workout.color : context.borderColor, width: isDone ? 2 : 1),
                                  ),
                                  child: Column(
                                    children: [
                                      Text('Set ${index + 1}', style: TextStyle(color: isDone ? workout.color : primaryTextColor, fontWeight: FontWeight.bold, fontSize: 12)),
                                      const SizedBox(height: 4),
                                      Icon(
                                        isDone ? LucideIcons.checkCircle2 : LucideIcons.circle,
                                        color: isDone ? workout.color : mutedTextColor,
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 16),

                      // Rest Timer Display
                      if (restSecondsRemaining > 0) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: context.goldMutedColor,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: context.borderGoldColor),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.timer, color: activeGold, size: 18),
                              const SizedBox(width: 8),
                              Text('Rest Counter: ${restSecondsRemaining}s', style: TextStyle(color: activeGold, fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Form Cues
                      Text('FORM & TECHNIQUE CUES', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Column(
                        children: workout.formCues.map((cue) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(LucideIcons.checkCircle2, size: 16, color: workout.color),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(cue, style: TextStyle(color: primaryTextColor, fontSize: 13, height: 1.4)),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),

                      ElevatedButton.icon(
                        icon: const Icon(LucideIcons.flame, size: 18),
                        label: const Text('Log Exercise Complete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          restTimer?.cancel();
                          Navigator.pop(context);
                          setState(() {
                            _totalCaloriesBurnedToday += workout.estCalories;
                          });
                          VinRToast.show(
                            context,
                            message: '${workout.name} Logged! +${workout.estCalories} kcal burned.',
                            icon: LucideIcons.flame,
                            iconColor: VinRColors.gold,
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: workout.color,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    final categories = ['All', 'Upper Body', 'Core & ABS', 'Lower Body', 'Full Body Cardio'];

    final filteredWorkouts = _selectedCategory == 'All'
        ? _allWorkouts
        : _allWorkouts.where((w) => w.category == _selectedCategory).toList();

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
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
                    Text('Strength & Workout Hub', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                  ],
                ),
                const SizedBox(height: 16),

                // Daily Calorie Summary Card
                GlassContainer(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: context.goldMutedColor,
                                shape: BoxShape.circle,
                                border: Border.all(color: context.borderGoldColor),
                              ),
                              child: Icon(LucideIcons.flame, color: activeGold, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Daily Active Burn', style: VinRTypography.caption.copyWith(color: mutedTextColor), overflow: TextOverflow.ellipsis),
                                  Text('$_totalCaloriesBurnedToday / 500 kcal', style: VinRTypography.h2.copyWith(color: primaryTextColor, fontSize: 20), overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: VinRColors.emerald.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: VinRColors.emerald.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          '${((_totalCaloriesBurnedToday / 500.0) * 100).toInt()}% Goal',
                          style: TextStyle(color: VinRColors.emerald, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Category Filter Bar
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: categories.map((cat) {
                      final isSel = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          selected: isSel,
                          label: Text(cat, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal, fontSize: 12)),
                          selectedColor: activeGold,
                          backgroundColor: context.surfaceColor,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: isSel ? activeGold : context.borderColor),
                          ),
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),

                Text(
                  'EXERCISE ROUTINES (${filteredWorkouts.length})',
                  style: VinRTypography.label.copyWith(color: mutedTextColor),
                ),
                const SizedBox(height: 12),

                // Workout Cards List
                ...filteredWorkouts.map((workout) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: GlassContainer(
                      onTap: () => _showWorkoutTrackerModal(workout),
                      child: Row(
                        children: [
                          // Exercise PNG Banner Container
                          Container(
                            width: 68,
                            height: 68,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: workout.color.withValues(alpha: 0.4), width: 1.5),
                            ),
                            child: Image.asset(
                              workout.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(LucideIcons.dumbbell, color: workout.color, size: 32),
                            ),
                          ),
                          const SizedBox(width: 14),

                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        workout.name,
                                        style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: workout.color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(workout.setsReps, style: TextStyle(color: workout.color, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(LucideIcons.flame, size: 11, color: activeGold),
                                    const SizedBox(width: 4),
                                    Text('~${workout.estCalories} kcal', style: TextStyle(color: mutedTextColor, fontSize: 11)),
                                    const SizedBox(width: 10),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: context.surfaceColor,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: context.borderColor),
                                      ),
                                      child: Text(workout.difficulty, style: TextStyle(color: mutedTextColor, fontSize: 9.5, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                Wrap(
                                  spacing: 4,
                                  children: workout.muscleTags.take(2).map((m) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: context.surfaceColor,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: context.borderColor),
                                      ),
                                      child: Text('#$m', style: TextStyle(color: mutedTextColor, fontSize: 9.5)),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
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
