import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/vinr_colors.dart';

class AudioWaveformVisualizer extends StatefulWidget {
  final bool isPlaying;
  final Color barColor;
  final double progress;
  final int barCount;
  final double maxHeight;

  const AudioWaveformVisualizer({
    super.key,
    required this.isPlaying,
    this.barColor = VinRColors.gold,
    this.progress = 0.0,
    this.barCount = 12,
    this.maxHeight = 22.0,
  });

  @override
  State<AudioWaveformVisualizer> createState() => _AudioWaveformVisualizerState();
}

class _AudioWaveformVisualizerState extends State<AudioWaveformVisualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // Fixed deterministic bar height profiles matching standard audio waveforms
  static const List<double> _baseHeights = [
    0.35, 0.65, 0.45, 0.90, 0.55, 0.80, 0.40, 0.70, 0.50, 0.75, 0.40, 0.60,
    0.30, 0.85, 0.50, 0.95, 0.45, 0.65, 0.35
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    if (widget.isPlaying) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(AudioWaveformVisualizer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPlaying != oldWidget.isPlaying) {
      if (widget.isPlaying) {
        _controller.repeat();
      } else {
        _controller.stop();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bars = min(widget.barCount, _baseHeights.length);

    return SizedBox(
      height: widget.maxHeight,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final animValue = _controller.value;

          return Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(bars, (index) {
              final baseRatio = _baseHeights[index];

              // Smooth deterministic sine modulation for audio animation without layout reflow
              final wave = widget.isPlaying
                  ? 0.7 + 0.3 * sin((animValue * 2 * pi) + (index * 0.5))
                  : 1.0;

              final calculatedHeight = (widget.maxHeight * baseRatio * wave).clamp(4.0, widget.maxHeight);
              final barProgress = index / bars.toDouble();
              final isActive = widget.progress > 0 ? (barProgress <= widget.progress) : widget.isPlaying;

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 1.5),
                width: 3.0,
                height: calculatedHeight,
                decoration: BoxDecoration(
                  color: isActive ? widget.barColor : widget.barColor.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(2),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
