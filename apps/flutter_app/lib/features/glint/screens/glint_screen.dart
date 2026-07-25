import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/vinr_toast.dart';

class GlintScreen extends StatefulWidget {
  const GlintScreen({super.key});

  @override
  State<GlintScreen> createState() => _GlintScreenState();
}

class _GlintScreenState extends State<GlintScreen> {
  String _selectedTopic = 'Stress Relief';
  bool _showSettings = false;

  final List<Map<String, dynamic>> _glints = [
    {
      'title': 'How 4-7-8 Breathing Resets Your Vagus Nerve in 60 Seconds',
      'channel': 'VinR Science',
      'tag': 'Stress Relief',
      'icon': LucideIcons.wind,
      'color': VinRColors.emerald,
    },
    {
      'title': 'Overcoming the 3-Day Habit Slump on Your 21-Day Winning Streak',
      'channel': 'Growth Partner',
      'tag': 'Discipline',
      'icon': LucideIcons.target,
      'color': VinRColors.gold,
    },
    {
      'title': '3 Stoic Mindset Tricks for Emotional Fortitude and Calm',
      'channel': 'Stoic Mind',
      'tag': 'Mindfulness',
      'icon': LucideIcons.brain,
      'color': VinRColors.sapphire,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.flame, color: activeGold, size: 24),
                        const SizedBox(width: 8),
                        Text('Glint', style: VinRTypography.h1.copyWith(fontSize: 26, color: primaryTextColor)),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => setState(() => _showSettings = !_showSettings),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: activeGold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: activeGold.withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              _selectedTopic,
                              style: TextStyle(color: activeGold, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: Icon(LucideIcons.refreshCw, color: mutedTextColor, size: 20),
                      onPressed: () {
                        VinRToast.show(
                          context,
                          message: 'Feed refreshed!',
                          icon: LucideIcons.refreshCw,
                          iconColor: activeGold,
                        );
                      },
                    ),
                  ],
                ),
              ),

              // Perspective Tuning Bar
              if (_showSettings) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  color: context.surfaceColor,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('PERSPECTIVE TUNING', style: VinRTypography.label.copyWith(color: activeGold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: ['Stress Relief', 'Focus', 'Discipline', 'Mindfulness'].map((topic) {
                          final isSel = _selectedTopic == topic;
                          return ChoiceChip(
                            selected: isSel,
                            label: Text(topic, style: TextStyle(color: isSel ? Colors.black : primaryTextColor)),
                            selectedColor: activeGold,
                            backgroundColor: context.surfaceColor,
                            onSelected: (_) {
                              setState(() {
                                _selectedTopic = topic;
                                _showSettings = false;
                              });
                            },
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ],

              // Shorts Feed List
              Expanded(
                child: PageView.builder(
                  scrollDirection: Axis.vertical,
                  itemCount: _glints.length,
                  itemBuilder: (context, index) {
                    final item = _glints[index];
                    final color = item['color'] as Color;

                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      child: GlassContainer(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Center(
                              child: Container(
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: color.withValues(alpha: 0.15),
                                  border: Border.all(color: color, width: 2),
                                ),
                                child: Icon(item['icon'] as IconData, color: color, size: 54),
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(item['tag'] as String, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(height: 8),
                            Text(item['title'] as String, style: VinRTypography.h3.copyWith(color: primaryTextColor)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: activeGold.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(item['channel'] as String, style: TextStyle(color: activeGold, fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 12),
                                Icon(LucideIcons.music, color: mutedTextColor, size: 14),
                                const SizedBox(width: 4),
                                Text('Original Audio', style: TextStyle(color: mutedTextColor, fontSize: 12)),
                              ],
                            ),
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
    );
  }
}
