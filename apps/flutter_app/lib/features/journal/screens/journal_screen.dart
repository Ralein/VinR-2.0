import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';

class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen> {
  String _viewMode = 'write'; // 'write' | 'entries'
  bool _isRecording = false;
  String _searchQuery = '';

  final _g1Controller = TextEditingController();
  final _g2Controller = TextEditingController();
  final _g3Controller = TextEditingController();
  final _reflectionController = TextEditingController();

  final List<Map<String, dynamic>> _savedEntries = [
    {
      'date': 'Today, 9:15 AM',
      'items': [
        'Finished 4-7-8 breathing exercise in the morning',
        'Built momentum on my 21-day winning streak',
        'Grateful for clear weather and calm focus'
      ],
      'note': 'Feeling energized and grounded for the day.',
      'tags': ['Focus', 'Victory', 'Calm'],
      'aiReflection': 'Strong emotional coherence score recorded post-breathing session. Keep building your daily momentum!'
    },
    {
      'date': 'Yesterday, 8:30 PM',
      'items': [
        'Had a great conversation with family',
        'Completed daily workout and stretch',
        'Listened to sleep mode wind-down audio'
      ],
      'note': 'Great balance between effort and recovery.',
      'tags': ['Gratitude', 'Peace'],
      'aiReflection': 'High gratitude density. Your reflection habits are showing sustained improvements in stress reduction.'
    },
  ];

  @override
  void dispose() {
    _g1Controller.dispose();
    _g2Controller.dispose();
    _g3Controller.dispose();
    _reflectionController.dispose();
    super.dispose();
  }

  void _saveEntry() {
    final g1 = _g1Controller.text.trim();
    final g2 = _g2Controller.text.trim();
    final g3 = _g3Controller.text.trim();
    final note = _reflectionController.text.trim();

    if (g1.isEmpty && g2.isEmpty && g3.isEmpty && note.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write at least one gratitude point or reflection.')),
      );
      return;
    }

    final items = [if (g1.isNotEmpty) g1, if (g2.isNotEmpty) g2, if (g3.isNotEmpty) g3];

    setState(() {
      _savedEntries.insert(0, {
        'date': 'Just now',
        'items': items.isNotEmpty ? items : ['Logged personal gratitude reflection'],
        'note': note.isNotEmpty ? note : 'Reflected on daily wins.',
        'tags': ['Daily Gratitude'],
        'aiReflection': 'Reflection saved! Gratitude practice reinforces neural pathways for resilience and positive focus.'
      });
      _g1Controller.clear();
      _g2Controller.clear();
      _g3Controller.clear();
      _reflectionController.clear();
      _viewMode = 'entries';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Journal Entry Saved!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;
    final primaryTextColor = isLight ? const Color(0xFF1A1208) : VinRColors.textPrimary;
    final mutedTextColor = isLight ? const Color(0xFF5C5446) : VinRColors.textMuted;
    final activeGold = isLight ? const Color(0xFFB8832A) : VinRColors.goldLight;

    final filteredEntries = _savedEntries.where((e) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      final dateMatch = (e['date'] as String).toLowerCase().contains(q);
      final noteMatch = (e['note'] as String).toLowerCase().contains(q);
      final itemsMatch = (e['items'] as List<String>).any((i) => i.toLowerCase().contains(q));
      return dateMatch || noteMatch || itemsMatch;
    }).toList();

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Gratitude Journal', style: VinRTypography.h1.copyWith(fontSize: 26, color: primaryTextColor)),
                          const SizedBox(height: 2),
                          Text('What are you grateful for today?', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(_isRecording ? LucideIcons.square : LucideIcons.mic, color: _isRecording ? VinRColors.crimson : activeGold),
                      onPressed: () => setState(() => _isRecording = !_isRecording),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Voice Note Recorder Bar
                if (_isRecording) ...[
                  GlassContainer(
                    color: VinRColors.crimsonGlow,
                    border: Border.all(color: VinRColors.crimson),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Row(
                          children: [
                            Icon(LucideIcons.mic, color: VinRColors.crimson),
                            SizedBox(width: 12),
                            Text('Recording Voice Journal...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Mode Selector Bar (Write vs Entries)
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _viewMode = 'write'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _viewMode == 'write'
                                ? activeGold.withValues(alpha: 0.15)
                                : (isLight ? Colors.white : VinRColors.surface),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: _viewMode == 'write' ? activeGold : (isLight ? const Color(0x1A000000) : VinRColors.border),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.penTool, size: 16, color: _viewMode == 'write' ? activeGold : mutedTextColor),
                              const SizedBox(width: 8),
                              Text(
                                'Write Entry',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: _viewMode == 'write' ? activeGold : mutedTextColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _viewMode = 'entries'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _viewMode == 'entries'
                                ? activeGold.withValues(alpha: 0.15)
                                : (isLight ? Colors.white : VinRColors.surface),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: _viewMode == 'entries' ? activeGold : (isLight ? const Color(0x1A000000) : VinRColors.border),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(LucideIcons.bookOpen, size: 16, color: _viewMode == 'entries' ? activeGold : mutedTextColor),
                              const SizedBox(width: 8),
                              Text(
                                'Past Entries (${_savedEntries.length})',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: _viewMode == 'entries' ? activeGold : mutedTextColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // WRITE MODE
                if (_viewMode == 'write') ...[
                  const SectionHeader(
                    title: 'DAILY GRATITUDE PROMPTS',
                    icon: LucideIcons.sparkles,
                    iconColor: VinRColors.goldLight,
                  ),
                  GlassContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('1. Something that made you smile today', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _g1Controller,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'e.g., Morning coffee, sunshine...',
                            hintStyle: TextStyle(color: mutedTextColor),
                          ),
                        ),
                        const SizedBox(height: 14),

                        Text('2. A win or effort you are proud of', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _g2Controller,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'e.g., Kept my calm in a meeting...',
                            hintStyle: TextStyle(color: mutedTextColor),
                          ),
                        ),
                        const SizedBox(height: 14),

                        Text('3. Someone you appreciate right now', style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _g3Controller,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'e.g., A supportive friend or colleague...',
                            hintStyle: TextStyle(color: mutedTextColor),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  const SectionHeader(
                    title: 'PERSONAL REFLECTION',
                    icon: LucideIcons.fileText,
                    iconColor: VinRColors.sapphire,
                  ),
                  GlassContainer(
                    child: TextField(
                      controller: _reflectionController,
                      maxLines: 4,
                      style: TextStyle(color: primaryTextColor),
                      decoration: InputDecoration(
                        hintText: 'Write any thoughts, reflections, or insights on your mind...',
                        hintStyle: TextStyle(color: mutedTextColor),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  GoldButton(
                    text: 'Save Gratitude Journal Entry →',
                    onPressed: _saveEntry,
                  ),
                ]

                // ENTRIES MODE
                else ...[
                  TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: TextStyle(color: primaryTextColor),
                    decoration: InputDecoration(
                      hintText: 'Search journal entries...',
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      hintStyle: TextStyle(color: mutedTextColor),
                    ),
                  ),
                  const SizedBox(height: 18),

                  const SectionHeader(
                    title: 'SAVED ENTRIES',
                    icon: LucideIcons.bookOpen,
                    iconColor: VinRColors.goldLight,
                  ),

                  ...filteredEntries.map((item) {
                    final itemsList = item['items'] as List<String>;
                    final tags = item['tags'] as List<String>;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: GlassContainer(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(item['date'] as String, style: TextStyle(fontWeight: FontWeight.bold, color: activeGold, fontSize: 13)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: activeGold.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Text('Logged', style: TextStyle(color: VinRColors.emerald, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            ...itemsList.map((itm) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('• ', style: TextStyle(color: VinRColors.gold, fontWeight: FontWeight.bold)),
                                      Expanded(child: Text(itm, style: TextStyle(color: primaryTextColor, fontSize: 13, height: 1.3))),
                                    ],
                                  ),
                                )),
                            if ((item['note'] as String).isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(item['note'] as String, style: TextStyle(color: mutedTextColor, fontSize: 12.5, fontStyle: FontStyle.italic)),
                            ],
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 6,
                              children: tags.map((t) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: VinRColors.goldMuted,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: VinRColors.borderGold),
                                  ),
                                  child: Text(t, style: TextStyle(color: activeGold, fontSize: 10, fontWeight: FontWeight.bold)),
                                );
                              }).toList(),
                            ),
                            if (item.containsKey('aiReflection')) ...[
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isLight ? const Color(0xFFF5F2EC) : VinRColors.surface,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: activeGold.withValues(alpha: 0.2)),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(LucideIcons.sparkles, color: VinRColors.goldLight, size: 16),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        item['aiReflection'] as String,
                                        style: TextStyle(color: primaryTextColor, fontSize: 12, height: 1.4),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
