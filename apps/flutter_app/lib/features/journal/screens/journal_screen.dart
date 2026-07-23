import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';
import '../models/journal_entry_model.dart';

class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen> {
  final List<JournalEntryModel> _entries = [
    JournalEntryModel(
      id: 'j1',
      title: 'Overcoming Morning Hesitation',
      content: 'Felt a bit sluggish getting out of bed, but after completing my morning 4-7-8 breathing and reviewing my 21-day winning streak target, I gained immediate clarity.',
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      moodTags: ['Focus', 'Victory', 'Resilience'],
      aiReflectionSummary: 'AI Note: Strong self-correction pattern detected.',
    ),
    JournalEntryModel(
      id: 'j2',
      title: 'Evening Calm Reflection',
      content: 'Reflected on the workday victories. Small wins compound every single day.',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      moodTags: ['Gratitude', 'Calm'],
      aiReflectionSummary: 'AI Note: High coherence score.',
    ),
  ];

  bool _isRecording = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Voice & Text Journal', style: VinRTypography.h3),
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          setState(() {
            _isRecording = !_isRecording;
          });
        },
        backgroundColor: _isRecording ? VinRColors.crimson : VinRColors.gold,
        icon: Icon(_isRecording ? LucideIcons.square : LucideIcons.mic, color: Colors.black),
        label: Text(
          _isRecording ? 'Stop Recording' : 'Voice Entry',
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_isRecording) ...[
                  GlassContainer(
                    color: VinRColors.crimsonGlow,
                    border: Border.all(color: VinRColors.crimson),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.mic, color: VinRColors.crimson),
                            const SizedBox(width: 12),
                            Text('Recording Voice Journal...', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                          ],
                        ),
                        AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                Text('PAST JOURNAL ENTRIES', style: VinRTypography.label),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView.builder(
                    itemCount: _entries.length,
                    itemBuilder: (context, index) {
                      final entry = _entries[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GlassContainer(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(entry.title, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                  Text(
                                    '${entry.createdAt.hour}:${entry.createdAt.minute.toString().padLeft(2, '0')}',
                                    style: VinRTypography.caption,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(entry.content, style: VinRTypography.bodySm),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 8,
                                children: entry.moodTags.map((tag) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: VinRColors.goldMuted,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: VinRColors.borderGold),
                                    ),
                                    child: Text(tag, style: VinRTypography.caption.copyWith(color: VinRColors.goldLight)),
                                  );
                                }).toList(),
                              ),
                              if (entry.aiReflectionSummary != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: VinRColors.surface,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.sparkles, color: VinRColors.goldLight, size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(entry.aiReflectionSummary!, style: VinRTypography.caption)),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
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
