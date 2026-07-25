import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../../core/repositories/journal_repository.dart';

class JournalScreen extends ConsumerStatefulWidget {
  const JournalScreen({super.key});

  @override
  ConsumerState<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends ConsumerState<JournalScreen> {
  String _viewMode = 'write'; // 'write' | 'entries'
  String _searchQuery = '';
  bool _isLoading = false;

  final _journalRepo = JournalRepository();

  final _g1Controller = TextEditingController();
  final _g2Controller = TextEditingController();
  final _g3Controller = TextEditingController();
  final _reflectionController = TextEditingController();

  final List<Map<String, dynamic>> _savedEntries = [];

  @override
  void initState() {
    super.initState();
    _loadEntries();
  }

  @override
  void dispose() {
    _g1Controller.dispose();
    _g2Controller.dispose();
    _g3Controller.dispose();
    _reflectionController.dispose();
    super.dispose();
  }

  Future<void> _loadEntries() async {
    setState(() => _isLoading = true);
    final remoteEntries = await _journalRepo.getJournalEntries();
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (remoteEntries.isNotEmpty) {
          _savedEntries.clear();
          for (final item in remoteEntries) {
            final gratitudeList = (item['gratitude_items'] as List?)?.map((e) => e.toString()).toList() ?? [];
            _savedEntries.add({
              'id': item['id'] ?? 'entry_${DateTime.now().millisecondsSinceEpoch}',
              'date': item['date'] ?? 'Today, ${_formatCurrentTime()}',
              'items': gratitudeList.isNotEmpty ? gratitudeList : ['Logged personal reflection'],
              'note': item['reflection_text'] ?? 'Reflected on personal growth and daily wins.',
              'tags': ['Daily Gratitude'],
              'aiReflection': item['ai_response'] ?? 'Gratitude entry saved! Building daily self-reflection strengthens emotional resilience.',
            });
          }
        }
      });
    }
  }

  void _saveEntry() async {
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

    // Optimistic local add
    final tempEntry = {
      'id': 'entry_${DateTime.now().millisecondsSinceEpoch}',
      'date': 'Today, ${_formatCurrentTime()}',
      'items': items.isNotEmpty ? items : ['Logged personal reflection'],
      'note': note.isNotEmpty ? note : 'Reflected on personal growth and daily wins.',
      'tags': ['Daily Gratitude'],
      'aiReflection': 'Gratitude entry saved! Building daily self-reflection strengthens emotional resilience and focus.',
    };

    setState(() {
      _savedEntries.insert(0, tempEntry);
      _g1Controller.clear();
      _g2Controller.clear();
      _g3Controller.clear();
      _reflectionController.clear();
      _viewMode = 'entries';
    });

    VinRToast.show(
      context,
      message: 'Gratitude Entry Saved!',
      icon: LucideIcons.checkCircle2,
      iconColor: VinRColors.gold,
    );

    // Backend sync
    final result = await _journalRepo.createEntry(
      gratitudeItems: items,
      reflectionText: note,
      mood: 'Balanced',
    );

    if (result != null && mounted) {
      _loadEntries();
    }
  }

  void _deleteEntry(Map<String, dynamic> entry) async {
    final id = entry['id'] as String;
    setState(() {
      _savedEntries.remove(entry);
    });
    VinRToast.show(
      context,
      message: 'Journal entry deleted',
      icon: LucideIcons.trash2,
      iconColor: VinRColors.crimson,
    );

    if (!id.startsWith('entry_')) {
      await _journalRepo.deleteEntry(id);
    }
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
                // Premium Top Header Banner
                GlassContainer(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: activeGold.withValues(alpha: 0.18),
                          shape: BoxShape.circle,
                          border: Border.all(color: activeGold.withValues(alpha: 0.4)),
                        ),
                        child: Icon(LucideIcons.bookOpen, color: activeGold, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'DAILY GRATITUDE',
                              style: VinRTypography.label.copyWith(
                                color: activeGold,
                                fontSize: 11,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Mindful Reflections',
                              style: VinRTypography.h2.copyWith(fontSize: 22, color: primaryTextColor),
                            ),
                            Text(
                              'Capture positivity & track daily growth',
                              style: VinRTypography.caption.copyWith(color: mutedTextColor),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Navigation View Toggle Tabs
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _viewMode = 'write'),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: _viewMode == 'write'
                                ? activeGold.withValues(alpha: 0.18)
                                : (isLight ? Colors.white : VinRColors.surface),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _viewMode == 'write' ? activeGold : (isLight ? const Color(0x1A000000) : VinRColors.border),
                              width: _viewMode == 'write' ? 1.5 : 1,
                            ),
                            boxShadow: _viewMode == 'write'
                                ? [BoxShadow(color: activeGold.withValues(alpha: 0.15), blurRadius: 10)]
                                : [],
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
                                  fontSize: 14,
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
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: _viewMode == 'entries'
                                ? activeGold.withValues(alpha: 0.18)
                                : (isLight ? Colors.white : VinRColors.surface),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _viewMode == 'entries' ? activeGold : (isLight ? const Color(0x1A000000) : VinRColors.border),
                              width: _viewMode == 'entries' ? 1.5 : 1,
                            ),
                            boxShadow: _viewMode == 'entries'
                                ? [BoxShadow(color: activeGold.withValues(alpha: 0.15), blurRadius: 10)]
                                : [],
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
                                  fontSize: 14,
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

                  // Prompt 1
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.smile, size: 18, color: VinRColors.gold),
                            const SizedBox(width: 8),
                            Text(
                              '1. Something that made you smile today',
                              style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _g1Controller,
                          style: TextStyle(color: primaryTextColor, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'e.g. Morning coffee, warm sunshine, a warm message...',
                            hintStyle: TextStyle(color: mutedTextColor.withValues(alpha: 0.7), fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Prompt 2
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.award, size: 18, color: VinRColors.emerald),
                            const SizedBox(width: 8),
                            Text(
                              '2. A win or effort you are proud of',
                              style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _g2Controller,
                          style: TextStyle(color: primaryTextColor, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'e.g. Stayed focused on work, completed routine...',
                            hintStyle: TextStyle(color: mutedTextColor.withValues(alpha: 0.7), fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Prompt 3
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.heartHandshake, size: 18, color: VinRColors.sapphire),
                            const SizedBox(width: 8),
                            Text(
                              '3. Someone you appreciate right now',
                              style: VinRTypography.bodySm.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _g3Controller,
                          style: TextStyle(color: primaryTextColor, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'e.g. A supportive friend, mentor, or family member...',
                            hintStyle: TextStyle(color: mutedTextColor.withValues(alpha: 0.7), fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  const SectionHeader(
                    title: 'PERSONAL REFLECTION & NOTES',
                    icon: LucideIcons.fileText,
                    iconColor: VinRColors.sapphire,
                  ),
                  GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(LucideIcons.penTool, size: 16, color: activeGold),
                            const SizedBox(width: 8),
                            Text(
                              'Free Reflection',
                              style: TextStyle(color: activeGold, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _reflectionController,
                          maxLines: 4,
                          style: TextStyle(color: primaryTextColor, fontSize: 14, height: 1.4),
                          decoration: InputDecoration(
                            hintText: 'Write your thoughts, insights, or reflections for today...',
                            hintStyle: TextStyle(color: mutedTextColor.withValues(alpha: 0.7), fontSize: 13),
                            border: InputBorder.none,
                          ),
                        ),
                      ],
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
                      hintText: 'Search gratitude entries...',
                      prefixIcon: Icon(LucideIcons.search, size: 18, color: mutedTextColor),
                      hintStyle: TextStyle(color: mutedTextColor),
                    ),
                  ),
                  const SizedBox(height: 18),

                  const SectionHeader(
                    title: 'SAVED REFLECTIONS',
                    icon: LucideIcons.bookOpen,
                    iconColor: VinRColors.goldLight,
                  ),

                  if (_isLoading)
                    const Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (filteredEntries.isEmpty) ...[
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(LucideIcons.bookOpen, size: 48, color: mutedTextColor.withValues(alpha: 0.4)),
                            const SizedBox(height: 12),
                            Text('No Journal Entries Yet', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor)),
                            const SizedBox(height: 4),
                            Text('Write Entry above to log your first reflection.', style: VinRTypography.caption.copyWith(color: mutedTextColor), textAlign: TextAlign.center),
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
                                  IconButton(
                                    icon: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 16),
                                    onPressed: () => _deleteEntry(item),
                                    constraints: const BoxConstraints(),
                                    padding: EdgeInsets.zero,
                                    tooltip: 'Delete entry',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              ...itemsList.map((itm) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Icon(LucideIcons.checkCircle2, size: 14, color: VinRColors.gold),
                                        const SizedBox(width: 8),
                                        Expanded(child: Text(itm, style: TextStyle(color: primaryTextColor, fontSize: 13, height: 1.3))),
                                      ],
                                    ),
                                  )),
                              if ((item['note'] as String).isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: isLight ? Colors.white.withValues(alpha: 0.6) : VinRColors.surface,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: context.borderColor),
                                  ),
                                  child: Text(item['note'] as String, style: TextStyle(color: mutedTextColor, fontSize: 12.5, fontStyle: FontStyle.italic)),
                                ),
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
                                    border: Border.all(color: activeGold.withValues(alpha: 0.25)),
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
