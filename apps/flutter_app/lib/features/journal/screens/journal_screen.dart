import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';

class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen> {
  bool _isRecording = false;

  final List<Map<String, dynamic>> _entries = [
    {
      'title': 'Morning Reflection & Focus',
      'text': 'Completed my 4-7-8 breathing and committed to my 21-day winning streak habit today. High clarity.',
      'time': '9:15 AM',
      'tags': ['Focus', 'Victory', 'Resilience'],
      'aiSummary': 'Strong positive mindset shift recorded post-breathing session.',
    },
    {
      'title': 'Evening Gratitude Log',
      'text': 'Documented 3 wins today: stayed calm in meetings, completed daily exercise, and listened to sleep audio.',
      'time': 'Yesterday, 8:45 PM',
      'tags': ['Gratitude', 'Calm'],
      'aiSummary': 'High emotional coherence score.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Gratitude & Reflection Journal', style: VinRTypography.h1.copyWith(fontSize: 24)),
                    IconButton(
                      icon: Icon(_isRecording ? LucideIcons.square : LucideIcons.mic, color: _isRecording ? VinRColors.crimson : VinRColors.goldLight),
                      onPressed: () => setState(() => _isRecording = !_isRecording),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                if (_isRecording) ...[
                  GlassContainer(
                    color: VinRColors.crimsonGlow,
                    border: Border.all(color: VinRColors.crimson),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(LucideIcons.mic, color: VinRColors.crimson),
                            SizedBox(width: 12),
                            Text('Recording Voice Reflection...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                const SectionHeader(
                  title: 'PAST ENTRIES',
                  icon: LucideIcons.bookOpen,
                  iconColor: VinRColors.goldLight,
                ),

                Expanded(
                  child: ListView.builder(
                    itemCount: _entries.length,
                    itemBuilder: (context, index) {
                      final item = _entries[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: GlassContainer(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(item['title'] as String, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                  Text(item['time'] as String, style: VinRTypography.caption),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(item['text'] as String, style: VinRTypography.bodySm.copyWith(height: 1.4)),
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 6,
                                children: (item['tags'] as List<String>).map((t) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: VinRColors.goldMuted,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: VinRColors.borderGold),
                                    ),
                                    child: Text(t, style: VinRTypography.caption.copyWith(color: VinRColors.goldLight, fontSize: 11)),
                                  );
                                }).toList(),
                              ),
                              if (item.containsKey('aiSummary')) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: VinRColors.surface,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.sparkles, color: VinRColors.goldLight, size: 14),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(item['aiSummary'] as String, style: VinRTypography.caption)),
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
