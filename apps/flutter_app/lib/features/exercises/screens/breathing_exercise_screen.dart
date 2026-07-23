import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:vibration/vibration.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';

class BreathingExerciseScreen extends StatefulWidget {
  const BreathingExerciseScreen({super.key});

  @override
  State<BreathingExerciseScreen> createState() => _BreathingExerciseScreenState();
}

class _BreathingExerciseScreenState extends State<BreathingExerciseScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  Timer? _timer;
  String _phase = 'Inhale deeply';
  bool _isRunning = false;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _toggleExercise() {
    if (_isRunning) {
      _timer?.cancel();
      _animController.stop();
      setState(() => _isRunning = false);
    } else {
      setState(() => _isRunning = true);
      _runPhaseLoop();
    }
  }

  void _runPhaseLoop() async {
    while (_isRunning) {
      if (!mounted) break;
      // Inhale 4s
      setState(() => _phase = 'Inhale deeply');
      Vibration.hasVibrator().then((hasVib) {
        if (hasVib == true) Vibration.vibrate(duration: 100);
      });
      await _animController.forward();
      if (!_isRunning || !mounted) break;

      // Hold 7s
      setState(() => _phase = 'Hold breath');
      await Future.delayed(const Duration(seconds: 7));
      if (!_isRunning || !mounted) break;

      // Exhale 8s
      setState(() => _phase = 'Exhale slowly');
      Vibration.hasVibrator().then((hasVib) {
        if (hasVib == true) Vibration.vibrate(duration: 150);
      });
      await _animController.reverse();
      if (!_isRunning || !mounted) break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor, size: 20),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Text('4-7-8 Breathing Exercise', style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                  ],
                ),
              ),

              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_phase, style: VinRTypography.h1.copyWith(color: VinRColors.emerald, fontSize: 28)),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        _isRunning ? 'Follow the expanding and contracting aura' : 'Tap start to begin calming sequence',
                        style: VinRTypography.bodySm.copyWith(color: mutedTextColor),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 48),
                    Center(
                      child: AnimatedBuilder(
                        animation: _animController,
                        builder: (context, child) {
                          final scale = 1.0 + (_animController.value * 0.4);
                          return Container(
                            width: 180 * scale,
                            height: 180 * scale,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: VinRColors.emeraldGlow,
                              border: Border.all(
                                color: VinRColors.emerald.withValues(alpha: 0.6),
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: VinRColors.emerald.withValues(alpha: 0.3 * _animController.value),
                                  blurRadius: 30 * scale,
                                  spreadRadius: 8,
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(LucideIcons.wind, color: VinRColors.emerald, size: 56),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 56),
                    ElevatedButton.icon(
                      onPressed: _toggleExercise,
                      icon: Icon(_isRunning ? LucideIcons.pause : LucideIcons.play),
                      label: Text(_isRunning ? 'Pause Session' : 'Start 4-7-8 Session'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: VinRColors.emerald,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        elevation: 4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
