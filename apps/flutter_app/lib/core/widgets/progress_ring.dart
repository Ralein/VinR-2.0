import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';

enum RingVariant { gold, emerald, sapphire, lavender }

class ProgressRing extends StatefulWidget {
  final double progress; // 0.0 to 1.0
  final double size;
  final double strokeWidth;
  final RingVariant variant;
  final String? label;
  final String? sublabel;
  final bool showPercent;

  const ProgressRing({
    super.key,
    required this.progress,
    this.size = 80,
    this.strokeWidth = 6,
    this.variant = RingVariant.gold,
    this.label,
    this.sublabel,
    this.showPercent = false,
  });

  @override
  State<ProgressRing> createState() => _ProgressRingState();
}

class _ProgressRingState extends State<ProgressRing> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _animation = Tween<double>(begin: 0.0, end: widget.progress.clamp(0.0, 1.0)).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(ProgressRing oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.progress != widget.progress) {
      _animation = Tween<double>(
        begin: _animation.value,
        end: widget.progress.clamp(0.0, 1.0),
      ).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
      );
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<Color> get _colors {
    switch (widget.variant) {
      case RingVariant.gold:
        return [VinRColors.goldLight, VinRColors.gold];
      case RingVariant.emerald:
        return [const Color(0xFF7EDFC0), VinRColors.emerald];
      case RingVariant.sapphire:
        return [const Color(0xFF7AB5E8), VinRColors.sapphire];
      case RingVariant.lavender:
        return [const Color(0xFFB0A8E0), VinRColors.lavender];
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return CustomPaint(
                size: Size(widget.size, widget.size),
                painter: _RingPainter(
                  progress: _animation.value,
                  strokeWidth: widget.strokeWidth,
                  gradientColors: _colors,
                ),
              );
            },
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.showPercent) ...[
                AnimatedBuilder(
                  animation: _animation,
                  builder: (context, child) {
                    return Text(
                      '${(_animation.value * 100).round()}%',
                      style: VinRTypography.bodySm.copyWith(
                        fontWeight: FontWeight.bold,
                        color: _colors.last,
                      ),
                    );
                  },
                ),
              ],
              if (widget.label != null) ...[
                Text(
                  widget.label!,
                  style: VinRTypography.bodySm.copyWith(
                    fontWeight: FontWeight.bold,
                    color: VinRColors.textPrimary,
                    fontSize: widget.size * 0.18,
                  ),
                ),
              ],
              if (widget.sublabel != null) ...[
                Text(
                  widget.sublabel!,
                  style: VinRTypography.caption.copyWith(
                    color: VinRColors.textMuted,
                    fontSize: widget.size * 0.13,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  final double strokeWidth;
  final List<Color> gradientColors;

  _RingPainter({
    required this.progress,
    required this.strokeWidth,
    required this.gradientColors,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Track circle
    final trackPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.07)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, trackPaint);

    if (progress <= 0) return;

    // Fill arc gradient
    final rect = Rect.fromCircle(center: center, radius: radius);
    final gradient = SweepGradient(
      colors: gradientColors,
      startAngle: -pi / 2,
      endAngle: -pi / 2 + (2 * pi * progress),
    );

    final fillPaint = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    canvas.drawArc(
      rect,
      -pi / 2,
      2 * pi * progress,
      false,
      fillPaint,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
