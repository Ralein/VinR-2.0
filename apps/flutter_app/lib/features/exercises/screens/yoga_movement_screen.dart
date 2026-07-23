import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/vinr_toast.dart';

class VisualYogaPose {
  final String id;
  final String name;
  final String sanskritName;
  final String durationText;
  final String category;
  final String difficulty;
  final IconData icon;
  final Color color;
  final List<String> benefits;
  final List<String> instructions;

  VisualYogaPose({
    required this.id,
    required this.name,
    required this.sanskritName,
    required this.durationText,
    required this.category,
    required this.difficulty,
    required this.icon,
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

  final List<VisualYogaPose> _allPoses = [
    VisualYogaPose(
      id: 'child_pose',
      name: 'Child\'s Pose',
      sanskritName: 'Balasana',
      durationText: '60 Secs',
      category: 'Restorative',
      difficulty: 'Beginner',
      icon: LucideIcons.heart,
      color: VinRColors.sapphire,
      benefits: ['Calms Nervous System', 'Lower Back Stretch', 'Hip Opener'],
      instructions: [
        'Kneel on mat, knees wide, big toes touching.',
        'Sit hips back onto heels and fold torso forward.',
        'Extend arms out long in front, resting forehead on mat.',
        'Breathe deeply into back ribs and relax your shoulders.',
      ],
    ),
    VisualYogaPose(
      id: 'cat_cow',
      name: 'Cat-Cow Flow',
      sanskritName: 'Marjaryasana-Bitilasana',
      durationText: '45 Secs',
      category: 'Spine Reset',
      difficulty: 'Beginner',
      icon: LucideIcons.repeat,
      color: VinRColors.gold,
      benefits: ['Spine Mobility', 'Neck Relief', 'Posture Alignment'],
      instructions: [
        'Start on hands and knees with wrists under shoulders.',
        'Inhale: Arch your back, drop belly, lift head and chest (Cow).',
        'Exhale: Round your spine up toward ceiling, tuck chin (Cat).',
        'Continue flowing smoothly with your natural breathing rhythm.',
      ],
    ),
    VisualYogaPose(
      id: 'downward_dog',
      name: 'Downward-Facing Dog',
      sanskritName: 'Adho Mukha Svanasana',
      durationText: '45 Secs',
      category: 'Morning Flow',
      difficulty: 'Intermediate',
      icon: LucideIcons.triangle,
      color: VinRColors.emerald,
      benefits: ['Hamstrings Stretch', 'Calf Flexibility', 'Full Body Energy'],
      instructions: [
        'Press palms firmly into mat and push hips up and back.',
        'Create an inverted V-shape with your body.',
        'Pedal feet gently to stretch hamstrings and calves.',
        'Keep neck relaxed and head aligned between upper arms.',
      ],
    ),
    VisualYogaPose(
      id: 'warrior_2',
      name: 'Warrior II Pose',
      sanskritName: 'Virabhadrasana II',
      durationText: '45 Secs',
      category: 'Morning Flow',
      difficulty: 'Intermediate',
      icon: LucideIcons.shield,
      color: VinRColors.gold,
      benefits: ['Leg Power', 'Hip Opener', 'Unshakable Focus'],
      instructions: [
        'Step feet wide apart. Turn right foot out 90 degrees.',
        'Bend right knee directly over ankle.',
        'Extend arms parallel to floor, gaze over right fingertips.',
        'Ground down firmly through outer edge of back foot.',
      ],
    ),
    VisualYogaPose(
      id: 'cobra_pose',
      name: 'Cobra Pose',
      sanskritName: 'Bhujangasana',
      durationText: '30 Secs',
      category: 'Spine Reset',
      difficulty: 'Beginner',
      icon: LucideIcons.sparkles,
      color: VinRColors.lavender,
      benefits: ['Chest Expansion', 'Strengthens Spine', 'Lungs Energy'],
      instructions: [
        'Lie face down with palms under shoulders.',
        'Press tops of feet firm into floor.',
        'Inhale and gently lift chest up while keeping elbows bent.',
        'Keep shoulders relaxed away from ears.',
      ],
    ),
    VisualYogaPose(
      id: 'legs_up_wall',
      name: 'Legs-Up-The-Wall',
      sanskritName: 'Viparita Karani',
      durationText: '90 Secs',
      category: 'Restorative',
      difficulty: 'Restorative',
      icon: LucideIcons.feather,
      color: VinRColors.lavender,
      benefits: ['Lymphatic Drainage', 'Lowers Heart Rate', 'Insomnia Relief'],
      instructions: [
        'Sit close to a wall and swing legs up against wall.',
        'Rest back and head flat on floor or cushion.',
        'Rest arms comfortably by your sides, palms facing up.',
        'Close your eyes and take slow 4-7-8 calming breaths.',
      ],
    ),
    VisualYogaPose(
      id: 'forward_fold',
      name: 'Seated Forward Fold',
      sanskritName: 'Paschimottanasana',
      durationText: '60 Secs',
      category: 'Restorative',
      difficulty: 'Beginner',
      icon: LucideIcons.arrowDown,
      color: VinRColors.sapphire,
      benefits: ['Calms Brain', 'Stretches Back', 'Reduces Fatigue'],
      instructions: [
        'Sit with legs extended straight in front.',
        'Inhale to reach arms up overhead.',
        'Exhale and hinge forward from hips toward feet.',
        'Rest hands on shins, ankles, or feet. Relax head down.',
      ],
    ),
  ];

  void _showPoseDetailsModal(VisualYogaPose pose) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
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

                // Visual Hero Badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: pose.color.withValues(alpha: 0.18),
                        border: Border.all(color: pose.color, width: 2),
                      ),
                      child: Icon(pose.icon, color: pose.color, size: 36),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(pose.name, style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                          Text(pose.sanskritName, style: TextStyle(color: mutedTextColor, fontStyle: FontStyle.italic, fontSize: 13)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(LucideIcons.clock, size: 12, color: mutedTextColor),
                              const SizedBox(width: 4),
                              Text(pose.durationText, style: TextStyle(color: mutedTextColor, fontSize: 11)),
                              const SizedBox(width: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: pose.color.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(pose.difficulty, style: TextStyle(color: pose.color, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Targeted Benefits Chips
                Text('TARGETED BENEFITS', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: pose.benefits.map((b) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: pose.color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: pose.color.withValues(alpha: 0.25)),
                      ),
                      child: Text(b, style: TextStyle(color: pose.color, fontSize: 11, fontWeight: FontWeight.bold)),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Step-by-Step Instructions
                Text('STEP-BY-STEP ALIGNMENT', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Column(
                  children: pose.instructions.map((inst) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(LucideIcons.checkCircle2, size: 16, color: pose.color),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(inst, style: TextStyle(color: primaryTextColor, fontSize: 13, height: 1.4)),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                ElevatedButton.icon(
                  icon: const Icon(LucideIcons.check, size: 18),
                  label: const Text('Log Pose Practice Complete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    Navigator.pop(context);
                    VinRToast.show(
                      context,
                      message: 'Practiced ${pose.name}! Winning streak updated.',
                      icon: LucideIcons.flame,
                      iconColor: VinRColors.gold,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: pose.color,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    final categories = ['All', 'Spine Reset', 'Morning Flow', 'Restorative'];

    final filteredPoses = _selectedCategory == 'All'
        ? _allPoses
        : _allPoses.where((p) => p.category == _selectedCategory).toList();

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
                    Text('Guided Yoga Poses', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                  ],
                ),
                const SizedBox(height: 16),

                // Category Filter Chips Bar
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
                  'FEATURED POSES (${filteredPoses.length})',
                  style: VinRTypography.label.copyWith(color: mutedTextColor),
                ),
                const SizedBox(height: 12),

                // Visual Yoga Pose Cards Grid List
                ...filteredPoses.map((pose) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: GlassContainer(
                      onTap: () => _showPoseDetailsModal(pose),
                      child: Row(
                        children: [
                          // Visual Pose Badge / Icon Graphic Container
                          Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              color: pose.color.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: pose.color.withValues(alpha: 0.35), width: 1.5),
                            ),
                            child: Center(
                              child: Icon(pose.icon, color: pose.color, size: 32),
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
                                        pose.name,
                                        style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: pose.color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(pose.durationText, style: TextStyle(color: pose.color, fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(pose.sanskritName, style: TextStyle(color: mutedTextColor, fontStyle: FontStyle.italic, fontSize: 11.5)),
                                const SizedBox(height: 8),

                                Wrap(
                                  spacing: 4,
                                  children: pose.benefits.take(2).map((b) {
                                    return Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: context.surfaceColor,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: context.borderColor),
                                      ),
                                      child: Text('#$b', style: TextStyle(color: mutedTextColor, fontSize: 9.5)),
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
