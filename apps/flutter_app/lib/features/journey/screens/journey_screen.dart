import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../streak/providers/streak_provider.dart';

class DayRoadmapItem {
  final int dayNumber;
  final String title;
  final String category;
  final String actionPrompt;
  final IconData icon;

  DayRoadmapItem({
    required this.dayNumber,
    required this.title,
    required this.category,
    required this.actionPrompt,
    required this.icon,
  });
}

class JourneyScreen extends ConsumerStatefulWidget {
  const JourneyScreen({super.key});

  @override
  ConsumerState<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends ConsumerState<JourneyScreen> {
  int _selectedDay = 1;

  static final List<DayRoadmapItem> _roadmap = [
    DayRoadmapItem(dayNumber: 1, title: 'Intention & Reset', category: 'Mindset Foundation', actionPrompt: 'Set your core 21-day goal and log your first gratitude entry.', icon: LucideIcons.compass),
    DayRoadmapItem(dayNumber: 2, title: 'Gratitude Anchor', category: 'Positive Framing', actionPrompt: 'Write 3 things that brought light to your day.', icon: LucideIcons.smile),
    DayRoadmapItem(dayNumber: 3, title: '4-7-8 Calm Breath', category: 'Nervous System', actionPrompt: 'Complete a 2-minute rhythmic breathing session.', icon: LucideIcons.wind),
    DayRoadmapItem(dayNumber: 4, title: 'Stoic Perception', category: 'Emotional Control', actionPrompt: 'Separate what is in your control from what is not.', icon: LucideIcons.sparkles),
    DayRoadmapItem(dayNumber: 5, title: 'Body Alignment', category: 'Physical Synergy', actionPrompt: 'Do 10 minutes of bodyweight movement or stretching.', icon: LucideIcons.activity),
    DayRoadmapItem(dayNumber: 6, title: 'Digital Detox', category: 'Focus & Clarity', actionPrompt: 'Take 30 minutes of undisturbed quiet reflection.', icon: LucideIcons.shieldCheck),
    DayRoadmapItem(dayNumber: 7, title: 'Week 1 Warrior', category: 'Milestone Celebration', actionPrompt: 'Reflect on 7 days of growth. Unlock your 7-Day Warrior trophy!', icon: LucideIcons.award),
    DayRoadmapItem(dayNumber: 8, title: 'Somatic Grounding', category: 'Stress Relief', actionPrompt: 'Use the 5-4-3-2-1 sensory technique to anchor present moment.', icon: LucideIcons.heartPulse),
    DayRoadmapItem(dayNumber: 9, title: 'Reframing Obstacles', category: 'Resilience', actionPrompt: 'Turn one recent challenge into a learning opportunity.', icon: LucideIcons.target),
    DayRoadmapItem(dayNumber: 10, title: 'Mid-Journey Energy', category: 'Habit Reinforcement', actionPrompt: 'Double down on your daily consistency routine.', icon: LucideIcons.zap),
    DayRoadmapItem(dayNumber: 11, title: 'Empathetic Connection', category: 'Relationships', actionPrompt: 'Express genuine appreciation to a mentor or friend.', icon: LucideIcons.heartHandshake),
    DayRoadmapItem(dayNumber: 12, title: 'Strength Exercise', category: 'Physical Power', actionPrompt: 'Complete a strength workout set to build energy.', icon: LucideIcons.dumbbell),
    DayRoadmapItem(dayNumber: 13, title: 'Mindful Soundscape', category: 'Rest & Recovery', actionPrompt: 'Listen to a soothing ambient wind-down track before sleep.', icon: LucideIcons.volume2),
    DayRoadmapItem(dayNumber: 14, title: '14-Day Fortitude', category: 'Milestone Celebration', actionPrompt: '2 full weeks completed! You are building deep mental toughness.', icon: LucideIcons.trophy),
    DayRoadmapItem(dayNumber: 15, title: 'Self-Compassion', category: 'Inner Peace', actionPrompt: 'Acknowledge your progress without harsh self-criticism.', icon: LucideIcons.heart),
    DayRoadmapItem(dayNumber: 16, title: 'Core Focus Flow', category: 'Productivity', actionPrompt: 'Execute 45 minutes of deep focus work without distraction.', icon: LucideIcons.flame),
    DayRoadmapItem(dayNumber: 17, title: 'Postural Reset', category: 'Physical Health', actionPrompt: 'Perform spine & neck mobility movements during work breaks.', icon: LucideIcons.userCheck),
    DayRoadmapItem(dayNumber: 18, title: 'Gratitude Reflection', category: 'Perspective Shift', actionPrompt: 'Log 3 personal wins achieved over the past 2 weeks.', icon: LucideIcons.penTool),
    DayRoadmapItem(dayNumber: 19, title: 'Evening Wind-Down', category: 'Sleep Quality', actionPrompt: 'Disconnect 1 hour before bed for restorative sleep.', icon: LucideIcons.moon),
    DayRoadmapItem(dayNumber: 20, title: 'Unshakable Mindset', category: 'Mastery Preparation', actionPrompt: 'Prepare your personal manifesto for lifelong consistency.', icon: LucideIcons.shield),
    DayRoadmapItem(dayNumber: 21, title: '21-Day VinR Winner', category: 'Identity Mastery', actionPrompt: 'CONGRATULATIONS! You have completed the 21-Day Transformation!', icon: LucideIcons.crown),
  ];

  @override
  Widget build(BuildContext context) {
    final streak = ref.watch(streakProvider);
    final notifier = ref.read(streakProvider.notifier);

    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    final activeRoadmapItem = _roadmap.firstWhere(
      (r) => r.dayNumber == _selectedDay,
      orElse: () => _roadmap.first,
    );

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 16.0, bottom: 140.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Banner
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '21-Day Growth Plan',
                            style: VinRTypography.h1.copyWith(fontSize: 26, color: primaryTextColor),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Master daily habits & identity transformation.',
                            style: VinRTypography.bodySm.copyWith(color: mutedTextColor),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: activeGold.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: activeGold.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        'Day ${streak.totalDaysCompleted}/21',
                        style: VinRTypography.label.copyWith(color: activeGold, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Today Check-in Hero Card
                GlassContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            streak.isCompletedToday ? LucideIcons.checkCircle2 : LucideIcons.target,
                            color: streak.isCompletedToday ? VinRColors.emerald : activeGold,
                            size: 22,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            streak.isCompletedToday ? 'TODAY\'S CHECK-IN COMPLETED!' : 'TODAY\'S ACTION NUDGE',
                            style: VinRTypography.label.copyWith(
                              color: streak.isCompletedToday ? VinRColors.emerald : activeGold,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        streak.isCompletedToday
                            ? 'Awesome work! You maintained your streak for today. Keep building your daily momentum.'
                            : 'Take 60 seconds to execute today\'s roadmap focus and lock in your daily winning point.',
                        style: VinRTypography.bodySm.copyWith(color: primaryTextColor, height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      if (!streak.isCompletedToday)
                        GoldButton(
                          text: 'Mark Today Complete →',
                          onPressed: () {
                            notifier.markDayComplete();
                            VinRToast.show(
                              context,
                              message: 'Winning Streak Updated for Today!',
                              icon: LucideIcons.flame,
                              iconColor: VinRColors.gold,
                            );
                          },
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Interactive 21-Day Matrix Grid
                const SectionHeader(
                  title: '21-DAY ROADMAP MATRIX',
                  icon: LucideIcons.calendar,
                ),
                GlassContainer(
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: 21,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemBuilder: (context, index) {
                      final dayNum = index + 1;
                      final isCompleted = dayNum <= streak.totalDaysCompleted;
                      final isSelected = dayNum == _selectedDay;
                      final isToday = dayNum == streak.totalDaysCompleted + 1 && !streak.isCompletedToday;

                      IconData? milestoneIcon;
                      if (dayNum == 7) milestoneIcon = LucideIcons.shieldCheck;
                      if (dayNum == 14) milestoneIcon = LucideIcons.award;
                      if (dayNum == 21) milestoneIcon = LucideIcons.trophy;

                      return GestureDetector(
                        onTap: () => setState(() => _selectedDay = dayNum),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? activeGold.withValues(alpha: 0.3)
                                : (isCompleted
                                    ? activeGold.withValues(alpha: 0.18)
                                    : (isToday ? activeGold.withValues(alpha: 0.1) : (isLight ? const Color(0xFFF5F2EC) : VinRColors.surface))),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected
                                  ? activeGold
                                  : (isCompleted
                                      ? activeGold.withValues(alpha: 0.4)
                                      : (isToday ? activeGold : context.borderColor)),
                              width: isSelected || isToday ? 2 : 1,
                            ),
                          ),
                          child: Center(
                            child: isCompleted
                                ? Icon(LucideIcons.check, color: activeGold, size: 16)
                                : (milestoneIcon != null
                                    ? Icon(milestoneIcon, color: isSelected ? activeGold : mutedTextColor, size: 14)
                                    : Text(
                                        '$dayNum',
                                        style: TextStyle(
                                          color: isSelected ? activeGold : mutedTextColor,
                                          fontSize: 11,
                                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        ),
                                      )),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // Selected Day Focus Details Card
                const SectionHeader(
                  title: 'DAY ROADMAP ACTION DETAILS',
                  icon: LucideIcons.target,
                  iconColor: VinRColors.goldLight,
                ),
                GlassContainer(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: activeGold.withValues(alpha: 0.18),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(activeRoadmapItem.icon, color: activeGold, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'DAY ${activeRoadmapItem.dayNumber}: ${activeRoadmapItem.title.toUpperCase()}',
                                    style: TextStyle(fontWeight: FontWeight.bold, color: activeGold, fontSize: 13, letterSpacing: 0.5),
                                  ),
                                  Text(
                                    activeRoadmapItem.category,
                                    style: TextStyle(color: mutedTextColor, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          if (_selectedDay <= streak.totalDaysCompleted)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: VinRColors.emeraldGlow,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('COMPLETED', style: TextStyle(color: VinRColors.emerald, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Text(
                        activeRoadmapItem.actionPrompt,
                        style: TextStyle(color: primaryTextColor, fontSize: 14, height: 1.45),
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
