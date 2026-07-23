import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';
import 'progress_ring.dart';

class StreakHero extends StatefulWidget {
  final int streak;
  final bool todayDone;
  final List<bool> weeklyDays;

  const StreakHero({
    super.key,
    required this.streak,
    this.todayDone = false,
    this.weeklyDays = const [true, true, true, true, true, false, false],
  });

  @override
  State<StreakHero> createState() => _StreakHeroState();
}

class _StreakHeroState extends State<StreakHero> with SingleTickerProviderStateMixin {
  late AnimationController _flameController;
  late Animation<double> _flameScale;

  @override
  void initState() {
    super.initState();
    _flameController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _flameScale = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _flameController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _flameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = widget.weeklyDays.where((b) => b).length;
    final weeklyProgress = completedCount / 7.0;
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return Column(
      children: [
        // Hero Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Streak Number Block
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${widget.streak}',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 64,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                      color: VinRColors.gold,
                    ),
                  ),
                  Text(
                    'DAY${widget.streak != 1 ? 'S' : ''}',
                    style: VinRTypography.label.copyWith(
                      color: VinRColors.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ),
            // Pulsing Flame
            ScaleTransition(
              scale: _flameScale,
              child: const Icon(
                LucideIcons.flame,
                color: VinRColors.gold,
                size: 48,
              ),
            ),
            // Progress Ring
            Expanded(
              child: Align(
                alignment: Alignment.centerRight,
                child: ProgressRing(
                  progress: weeklyProgress,
                  size: 68,
                  strokeWidth: 5,
                  variant: RingVariant.gold,
                  label: '$completedCount/7',
                  sublabel: 'this week',
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Today Status
        Row(
          children: [
            Icon(
              widget.todayDone ? LucideIcons.checkCircle2 : LucideIcons.circle,
              size: 16,
              color: widget.todayDone ? VinRColors.emerald : VinRColors.textGhost,
            ),
            const SizedBox(width: 8),
            Text(
              widget.todayDone
                  ? "Today's check-in complete"
                  : 'Complete a check-in to continue',
              style: VinRTypography.bodySm.copyWith(
                color: widget.todayDone ? VinRColors.emerald : VinRColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Weekly Day Dots Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(7, (index) {
            final isDone = widget.weeklyDays[index];
            return Column(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isDone ? VinRColors.gold : VinRColors.elevated,
                    border: isDone
                        ? null
                        : Border.all(color: VinRColors.border, width: 1),
                    boxShadow: isDone
                        ? [
                            BoxShadow(
                              color: VinRColors.gold.withValues(alpha: 0.5),
                              blurRadius: 6,
                              spreadRadius: 1,
                            ),
                          ]
                        : [],
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  dayLabels[index],
                  style: VinRTypography.caption.copyWith(
                    color: VinRColors.textGhost,
                    fontSize: 10,
                  ),
                ),
              ],
            );
          }),
        ),
      ],
    );
  }
}
