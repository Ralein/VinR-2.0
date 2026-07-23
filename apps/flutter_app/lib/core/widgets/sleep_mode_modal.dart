import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';
import 'glass_container.dart';

class SleepModeModal extends StatefulWidget {
  final bool visible;
  final VoidCallback onClose;

  const SleepModeModal({
    super.key,
    required this.visible,
    required this.onClose,
  });

  @override
  State<SleepModeModal> createState() => _SleepModeModalState();
}

class _SleepModeModalState extends State<SleepModeModal> {
  bool _isPlaying = false;
  int _selectedTimer = 15;

  @override
  Widget build(BuildContext context) {
    if (!widget.visible) return const SizedBox.shrink();

    return Stack(
      children: [
        ModalBarrier(
          color: Colors.black.withValues(alpha: 0.85),
          dismissible: true,
          onDismiss: widget.onClose,
        ),
        Center(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            child: GlassContainer(
              color: const Color(0xFF0A0E1A).withValues(alpha: 0.95),
              border: Border.all(color: VinRColors.sapphire.withValues(alpha: 0.4)),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.moon, color: VinRColors.sapphire),
                          const SizedBox(width: 10),
                          Text('Sleep Mode', style: VinRTypography.h3),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.x, color: VinRColors.textMuted),
                        onPressed: widget.onClose,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Dimmed lighting, soft ambient wind-down audio, and auto-sleep timer.',
                    style: VinRTypography.bodySm.copyWith(color: VinRColors.textSecondary),
                  ),
                  const SizedBox(height: 24),
                  Text('AUTO-STOP TIMER', style: VinRTypography.label),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [15, 30, 45, 60].map((mins) {
                      final isSel = _selectedTimer == mins;
                      return ChoiceChip(
                        selected: isSel,
                        label: Text('${mins}m', style: TextStyle(color: isSel ? Colors.black : VinRColors.textPrimary)),
                        selectedColor: VinRColors.sapphire,
                        backgroundColor: VinRColors.surface,
                        onSelected: (_) => setState(() => _selectedTimer = mins),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() => _isPlaying = !_isPlaying);
                    },
                    icon: Icon(_isPlaying ? LucideIcons.pause : LucideIcons.play),
                    label: Text(_isPlaying ? 'Pause Sleep Audio' : 'Start Night Wind-Down'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: VinRColors.sapphire,
                      foregroundColor: Colors.black,
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
