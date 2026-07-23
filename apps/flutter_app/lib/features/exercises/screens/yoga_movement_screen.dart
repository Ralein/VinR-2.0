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
  final String imagePath;
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

  final List<VisualYogaPose> _allPoses = [
    VisualYogaPose(
      id: 'bhujangasana',
      name: 'Cobra Pose',
      sanskritName: 'Bhujangasana',
      durationText: '30 Secs',
      category: 'Spine Reset',
      difficulty: 'Beginner',
      imagePath: 'assets/poses/Bhujangasana.png',
      color: VinRColors.gold,
      benefits: ['Chest Expansion', 'Strengthens Spine', 'Lungs Energy'],
      instructions: [
        'Lie face down with palms under shoulders.',
        'Press tops of feet firm into floor.',
        'Inhale and gently lift chest up while keeping elbows bent.',
        'Keep shoulders relaxed away from ears.',
      ],
    ),
    VisualYogaPose(
      id: 'vrikshasana',
      name: 'Tree Pose',
      sanskritName: 'Vrikshasana',
      durationText: '45 Secs',
      category: 'Balance & Focus',
      difficulty: 'Beginner',
      imagePath: 'assets/poses/Vrikshasana.png',
      color: VinRColors.emerald,
      benefits: ['Balance & Stability', 'Ankle Strength', 'Mental Focus'],
      instructions: [
        'Stand tall and shift weight onto left leg.',
        'Place right foot on inner left thigh or calf (avoid knee).',
        'Bring palms together at heart center or reach arms overhead.',
        'Fix gaze on a steady point in front of you.',
      ],
    ),
    VisualYogaPose(
      id: 'virbhadrasana',
      name: 'Warrior Pose',
      sanskritName: 'Virbhadrasana',
      durationText: '45 Secs',
      category: 'Morning Flow',
      difficulty: 'Intermediate',
      imagePath: 'assets/poses/Virbhadrasana.png',
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
      id: 'trikonasana',
      name: 'Triangle Pose',
      sanskritName: 'Trikonasana',
      durationText: '45 Secs',
      category: 'Morning Flow',
      difficulty: 'Intermediate',
      imagePath: 'assets/poses/Trikonasana.png',
      color: VinRColors.sapphire,
      benefits: ['Hamstring Stretch', 'Side Body Opening', 'Digestion Stimulant'],
      instructions: [
        'Stand wide, reach arms out to sides.',
        'Hinge from right hip and lower right hand to shin or ankle.',
        'Extend left arm straight up toward ceiling.',
        'Keep chest open and gaze toward top thumb.',
      ],
    ),
    VisualYogaPose(
      id: 'sukhasana',
      name: 'Easy Seated Pose',
      sanskritName: 'Sukhasana',
      durationText: '60 Secs',
      category: 'Restorative',
      difficulty: 'Beginner',
      imagePath: 'assets/poses/Sukhasana.png',
      color: VinRColors.lavender,
      benefits: ['Calms Brain', 'Spine Alignment', 'Stress Relief'],
      instructions: [
        'Sit cross-legged comfortably on a mat or cushion.',
        'Lengthen spine upward, resting hands on knees.',
        'Close eyes softly and focus on smooth breathing.',
        'Relax facial muscles and drop shoulders down.',
      ],
    ),
    VisualYogaPose(
      id: 'dhanurasana',
      name: 'Bow Pose',
      sanskritName: 'Dhanurasana',
      durationText: '45 Secs',
      category: 'Spine Reset',
      difficulty: 'Intermediate',
      imagePath: 'assets/poses/Dhanurasana.png',
      color: VinRColors.gold,
      benefits: ['Full Front Opening', 'Core Activation', 'Energy Boost'],
      instructions: [
        'Lie on belly, bend knees and reach back to grip ankles.',
        'Inhale and kick feet back into hands to lift chest and thighs.',
        'Keep gaze forward and breathe into ribcage.',
        'Exhale to gently release back down.',
      ],
    ),
    VisualYogaPose(
      id: 'ustrasana',
      name: 'Camel Pose',
      sanskritName: 'Ustrasana',
      durationText: '30 Secs',
      category: 'Spine Reset',
      difficulty: 'Intermediate',
      imagePath: 'assets/poses/Ustrasana.png',
      color: VinRColors.crimson,
      benefits: ['Heart Opening', 'Shoulder Relief', 'Posture Correction'],
      instructions: [
        'Kneel hip-width apart, place hands on lower back.',
        'Inhale and lift chest, gently arching backward.',
        'Option to reach hands down to hold heels.',
        'Keep neck long without collapsing head back.',
      ],
    ),
    VisualYogaPose(
      id: 'tadasana',
      name: 'Mountain Pose',
      sanskritName: 'Tadasana',
      durationText: '45 Secs',
      category: 'Morning Flow',
      difficulty: 'Beginner',
      imagePath: 'assets/poses/Tadasana.png',
      color: VinRColors.emerald,
      benefits: ['Posture Alignment', 'Core Grounding', 'Thigh Firming'],
      instructions: [
        'Stand with big toes touching, heels slightly apart.',
        'Engage quad muscles, tuck pelvis slightly.',
        'Roll shoulders back and down, palms facing forward.',
        'Breathe deeply while feeling grounded through feet.',
      ],
    ),
    VisualYogaPose(
      id: 'bakasana',
      name: 'Crow Pose',
      sanskritName: 'Bakasana',
      durationText: '30 Secs',
      category: 'Balance & Focus',
      difficulty: 'Advanced',
      imagePath: 'assets/poses/Bakasana.png',
      color: VinRColors.gold,
      benefits: ['Arm Strength', 'Core Mastery', 'Courage & Balance'],
      instructions: [
        'Squat down, place hands flat on floor shoulder-width apart.',
        'Place knees against backs of upper arms near armpits.',
        'Lean forward, shift weight into fingertips, lift feet off floor.',
        'Balance on hands and pull belly button to spine.',
      ],
    ),
    VisualYogaPose(
      id: 'halasana',
      name: 'Plow Pose',
      sanskritName: 'Halasana',
      durationText: '45 Secs',
      category: 'Restorative',
      difficulty: 'Intermediate',
      imagePath: 'assets/poses/Halasana.png',
      color: VinRColors.sapphire,
      benefits: ['Thyroid Stimulation', 'Neck & Back Stretch', 'Insomnia Relief'],
      instructions: [
        'Lie flat on back with arms alongside body.',
        'Lift legs up 90 degrees, then press hips up over shoulders.',
        'Lower toes over head to reach floor behind you.',
        'Support lower back with hands or interlace fingers on floor.',
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

                  // Visual Pose Illustration Header
                  Center(
                    child: Container(
                      width: 140,
                      height: 140,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: pose.color.withValues(alpha: 0.4), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: pose.color.withValues(alpha: 0.25),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Image.asset(
                        pose.imagePath,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return Icon(LucideIcons.activity, color: pose.color, size: 48);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Text(pose.name, style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                  Text(pose.sanskritName, style: TextStyle(color: mutedTextColor, fontStyle: FontStyle.italic, fontSize: 13)),
                  const SizedBox(height: 6),
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

    final categories = ['All', 'Spine Reset', 'Morning Flow', 'Balance & Focus', 'Restorative'];

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
                          // Visual Pose Illustration PNG Container
                          Container(
                            width: 68,
                            height: 68,
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: pose.color.withValues(alpha: 0.4), width: 1.5),
                            ),
                            child: Image.asset(
                              pose.imagePath,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(LucideIcons.activity, color: pose.color, size: 32);
                              },
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
