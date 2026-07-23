import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:vibration/vibration.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';

class BreathingExerciseScreen extends StatefulWidget {
  const BreathingExerciseScreen({super.key});

  @override
  State<BreathingExerciseScreen> createState() => _BreathingExerciseScreenState();
}

class _BreathingExerciseScreenState extends State<BreathingExerciseScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  Timer? _timer;
  String _phase = 'Inhale';
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
    return Scaffold(
      appBar: AppBar(
        title: Text('4-7-8 Breathing Exercise', style: VinRTypography.h3),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_phase, style: VinRTypography.h1.copyWith(color: VinRColors.emerald)),
              const SizedBox(height: 12),
              Text(
                _isRunning ? 'Follow the expanding and contracting aura' : 'Tap start to begin calming sequence',
                style: VinRTypography.bodySm,
              ),
              const SizedBox(height: 48),
              Center(
                child: AnimatedBuilder(
                  animation: _animController,
                  builder: (context, child) {
                    final scale = 1.0 + (_animController.value * 0.5);
                    return Container(
                      width: 200 * scale,
                      height: 200 * scale,
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
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(LucideIcons.wind, color: VinRColors.emerald, size: 64),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 64),
              ElevatedButton.icon(
                onPressed: _toggleExercise,
                icon: Icon(_isRunning ? LucideIcons.pause : LucideIcons.play),
                label: Text(_isRunning ? 'Pause Session' : 'Start 4-7-8 Session'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: VinRColors.emerald,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
