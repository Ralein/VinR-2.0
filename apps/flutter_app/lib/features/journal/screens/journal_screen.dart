import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../../core/services/voice_recorder_service.dart';

class JournalScreen extends ConsumerStatefulWidget {
  const JournalScreen({super.key});

  @override
  ConsumerState<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends ConsumerState<JournalScreen> {
  String _viewMode = 'write'; // 'write' | 'entries'
  bool _isDictating = false;
  bool _isTranscribing = false;
  String _selectedMood = 'Balanced';
  String _searchQuery = '';

  final _recorder = VoiceRecorderService.instance;

  final _g1Controller = TextEditingController();
  final _g2Controller = TextEditingController();
  final _g3Controller = TextEditingController();
  final _reflectionController = TextEditingController();

  final List<Map<String, dynamic>> _savedEntries = [];

  final List<Map<String, dynamic>> _moodOptions = [
    {'name': 'Energized', 'icon': LucideIcons.zap, 'color': VinRColors.gold},
    {'name': 'Balanced', 'icon': LucideIcons.smile, 'color': VinRColors.emerald},
    {'name': 'Calm', 'icon': LucideIcons.wind, 'color': VinRColors.sapphire},
    {'name': 'Reflective', 'icon': LucideIcons.sparkles, 'color': VinRColors.lavender},
  ];

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _g1Controller.dispose();
    _g2Controller.dispose();
    _g3Controller.dispose();
    _reflectionController.dispose();
    _recorder.cancel();
    super.dispose();
  }

  void _onVoicePressStart() async {
    HapticFeedback.mediumImpact();
    final started = await _recorder.start();
    if (!mounted) return;
    if (started) {
      setState(() => _isDictating = true);
    } else {
      VinRToast.show(
        context,
        message: 'Microphone permission required',
        icon: LucideIcons.micOff,
        iconColor: VinRColors.crimson,
      );
    }
  }

  void _onVoicePressEnd() async {
    if (!_isDictating) return;
    HapticFeedback.heavyImpact();
    setState(() {
      _isDictating = false;
      _isTranscribing = true;
    });

    final text = await _recorder.stopAndTranscribe();
    if (!mounted) return;
    setState(() => _isTranscribing = false);

    if (text != null && text.isNotEmpty) {
      setState(() {
        if (_reflectionController.text.isEmpty) {
          _reflectionController.text = text;
        } else {
          _reflectionController.text = '${_reflectionController.text} $text';
        }
      });
      VinRToast.show(
        context,
        message: 'Voice transcribed successfully!',
        icon: LucideIcons.checkCircle2,
        iconColor: VinRColors.emerald,
      );
    } else {
      VinRToast.show(
        context,
        message: 'Could not hear voice clearly — try again',
        icon: LucideIcons.alertCircle,
        iconColor: VinRColors.gold,
      );
    }
  }

  void _onVoicePressCancel() async {
    await _recorder.cancel();
    if (mounted) setState(() => _isDictating = false);
  }

  void _saveEntry() {
    final g1 = _g1Controller.text.trim();
    final g2 = _g2Controller.text.trim();
    final g3 = _g3Controller.text.trim();
    final note = _reflectionController.text.trim();

    if (g1.isEmpty && g2.isEmpty && g3.isEmpty && note.isEmpty) {
      VinRToast.show(
        context,
        message: 'Please enter at least one gratitude prompt or reflection note',
        icon: LucideIcons.alertCircle,
        iconColor: VinRColors.gold,
      );
      return;
    }

    final items = [if (g1.isNotEmpty) g1, if (g2.isNotEmpty) g2, if (g3.isNotEmpty) g3];

    setState(() {
      _savedEntries.insert(0, {
        'id': 'entry_${DateTime.now().millisecondsSinceEpoch}',
        'date': 'Today, ${_formatCurrentTime()}',
        'mood': _selectedMood,
        'items': items.isNotEmpty ? items : ['Logged personal reflection'],
        'note': note.isNotEmpty ? note : 'Reflected on personal growth and daily wins.',
        'tags': ['Daily Gratitude', _selectedMood],
        'aiReflection': 'Gratitude entry saved! Building daily self-reflection strengthens emotional resilience and focus.'
      });

      _g1Controller.clear();
      _g2Controller.clear();
      _g3Controller.clear();
      _reflectionController.clear();
      _isDictating = false;
      _viewMode = 'entries';
    });

    VinRToast.show(
      context,
      message: 'Gratitude Entry Saved!',
      icon: LucideIcons.checkCircle2,
      iconColor: VinRColors.gold,
    );
  }

  void _deleteEntry(Map<String, dynamic> entry) {
    setState(() {
      _savedEntries.remove(entry);
    });
    VinRToast.show(
      context,
      message: 'Journal entry deleted',
      icon: LucideIcons.trash2,
      iconColor: VinRColors.crimson,
    );
  }

  String _formatCurrentTime() {
    final now = DateTime.now();
    final hour = now.hour > 12 ? now.hour - 12 : (now.hour == 0 ? 12 : now.hour);
    final ampm = now.hour >= 12 ? 'PM' : 'AM';
    final minute = now.minute.toString().padLeft(2, '0');
    return '$hour:$minute $ampm';
  }

  @override
  Widget build(BuildContext context) {
    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

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
                // Top Badge Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: activeGold.withValues(alpha: isLight ? 0.12 : 0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: activeGold.withValues(alpha: isLight ? 0.3 : 0.4),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.bookOpen, size: 12, color: activeGold),
                                const SizedBox(width: 4),
                                Text(
                                  'DAILY REFLECTION',
                                  style: TextStyle(
                                    color: activeGold,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text('GRATITUDE JOURNAL', style: VinRTypography.label.copyWith(color: mutedTextColor)),
                          const SizedBox(height: 2),
                          Text('Mindful Daily Reflections', style: VinRTypography.h1.copyWith(fontSize: 26, color: primaryTextColor)),
                        ],
                      ),
                    ),

                    // Voice Dictation — Hold to Record
                    GestureDetector(
                      onLongPressStart: (_) => _onVoicePressStart(),
                      onLongPressEnd: (_) => _onVoicePressEnd(),
                      onLongPressCancel: _onVoicePressCancel,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: _isDictating ? VinRColors.crimson.withValues(alpha: 0.20) : activeGold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _isDictating ? VinRColors.crimson : activeGold,
                            width: _isDictating ? 1.5 : 1,
                          ),
                          boxShadow: isLight
                              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]
                              : [],
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isTranscribing ? LucideIcons.loader : (_isDictating ? LucideIcons.micOff : LucideIcons.mic),
                              color: _isDictating ? VinRColors.crimson : activeGold,
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _isTranscribing ? 'Transcribing...' : (_isDictating ? 'Release to Stop' : 'Hold to Speak'),
                              style: TextStyle(
                                color: _isDictating ? VinRColors.crimson : activeGold,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Live Recording / Transcribing Status Bar
                if (_isDictating || _isTranscribing) ...[
                  GlassContainer(
                    color: _isTranscribing ? VinRColors.sapphireGlow : VinRColors.crimsonGlow,
                    border: Border.all(color: _isTranscribing ? VinRColors.sapphire : VinRColors.crimson),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _isTranscribing ? LucideIcons.loader : LucideIcons.mic,
                              color: _isTranscribing ? VinRColors.sapphire : VinRColors.crimson,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              _isTranscribing ? 'AI Transcribing your voice...' : 'Listening — release button to transcribe',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        if (_isDictating)
                          AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Navigation View Toggle Bar
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _viewMode = 'write'),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
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
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
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
                  // Mood Selector Section
                  const SectionHeader(
                    title: 'HOW ARE YOU FEELING TODAY?',
                    icon: LucideIcons.heartHandshake,
                    iconColor: VinRColors.goldLight,
                  ),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _moodOptions.map((opt) {
                        final isSelected = _selectedMood == opt['name'];
                        final color = opt['color'] as Color;

                        return Padding(
                          padding: const EdgeInsets.only(right: 10),
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedMood = opt['name'] as String),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: isSelected ? color.withValues(alpha: 0.18) : (isLight ? Colors.white : VinRColors.surface),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected ? color : (isLight ? const Color(0x1A000000) : VinRColors.border),
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(opt['icon'] as IconData, size: 16, color: isSelected ? color : mutedTextColor),
                                  const SizedBox(width: 8),
                                  Text(
                                    opt['name'] as String,
                                    style: TextStyle(
                                      color: isSelected ? color : primaryTextColor,
                                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 24),

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
                            hintText: 'e.g. Morning coffee, clear weather...',
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
                            hintText: 'e.g. Completed morning routine...',
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
                            hintText: 'e.g. A supportive friend or colleague...',
                            hintStyle: TextStyle(color: mutedTextColor),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  const SectionHeader(
                    title: 'PERSONAL REFLECTION & VOICE NOTES',
                    icon: LucideIcons.fileText,
                    iconColor: VinRColors.sapphire,
                  ),
                  GlassContainer(
                    child: Column(
                      children: [
                        TextField(
                          controller: _reflectionController,
                          maxLines: 4,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'Write thoughts or tap Voice Input above to dictate your reflection...',
                            hintStyle: TextStyle(color: mutedTextColor),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  GoldButton(
                    text: 'Save Gratitude Journal Entry',
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
                    title: 'SAVED REFLECTIONS',
                    icon: LucideIcons.bookOpen,
                    iconColor: VinRColors.goldLight,
                  ),

                  if (filteredEntries.isEmpty) ...[
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(LucideIcons.bookOpen, size: 48, color: mutedTextColor.withValues(alpha: 0.4)),
                            const SizedBox(height: 12),
                            Text('No Journal Entries Yet', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                            const SizedBox(height: 4),
                            Text('Tap Voice Input or Write Entry above to log your first reflection.', style: VinRTypography.caption.copyWith(color: mutedTextColor), textAlign: TextAlign.center),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
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
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: activeGold.withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          item['mood'] as String? ?? 'Logged',
                                          style: const TextStyle(color: VinRColors.emerald, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      IconButton(
                                        icon: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 16),
                                        onPressed: () => _deleteEntry(item),
                                        constraints: const BoxConstraints(),
                                        padding: EdgeInsets.zero,
                                        tooltip: 'Delete entry',
                                      ),
                                    ],
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
