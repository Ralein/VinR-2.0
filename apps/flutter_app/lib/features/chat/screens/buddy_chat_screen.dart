import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';
import '../models/chat_message_model.dart';
import '../providers/chat_provider.dart';

class BuddyChatScreen extends ConsumerStatefulWidget {
  const BuddyChatScreen({super.key});

  @override
  ConsumerState<BuddyChatScreen> createState() => _BuddyChatScreenState();
}

class _BuddyChatScreenState extends ConsumerState<BuddyChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isRecording = false;

  final List<Map<String, dynamic>> _personas = [
    {'id': 'vinr', 'name': 'VinR Coach', 'icon': LucideIcons.sparkles, 'tag': 'Growth'},
    {'id': 'listener', 'name': 'Gentle Listener', 'icon': LucideIcons.heart, 'tag': 'Empathy'},
    {'id': 'stoic', 'name': 'Stoic Mentor', 'icon': LucideIcons.shield, 'tag': 'Wisdom'},
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      ref.read(chatProvider.notifier).sendMessage(text);
      _messageController.clear();
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final notifier = ref.read(chatProvider.notifier);

    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header — Brought down slightly with top margin
              Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 12),
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor, size: 20),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('VinR AI Companion', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 17)),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(shape: BoxShape.circle, color: VinRColors.emerald),
                              ),
                              const SizedBox(width: 6),
                              Text('Online • Ready to listen', style: TextStyle(color: mutedTextColor, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 20),
                      onPressed: notifier.clearMessages,
                      tooltip: 'Clear Chat',
                    ),
                  ],
                ),
              ),

              // Persona Carousel Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  children: _personas.map((p) {
                    final isSel = chatState.persona == p['name'];
                    final icon = p['icon'] as IconData;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSel,
                        showCheckmark: false,
                        avatar: Icon(icon, size: 14, color: isSel ? Colors.black : activeGold),
                        label: Text(p['name'] as String, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontSize: 12, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                        selectedColor: activeGold,
                        backgroundColor: context.surfaceColor,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSel ? activeGold : context.borderColor)),
                        onSelected: (_) => notifier.setPersona(p['name'] as String),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 4),
              Divider(color: context.borderColor, height: 1),

              // Messages Stream — comfortable padding
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 12),
                  itemCount: chatState.messages.length,
                  itemBuilder: (context, index) {
                    final msg = chatState.messages[index];
                    final isAi = msg.sender == MessageSender.ai;

                    final aiBubbleBg = isLight ? Colors.white : VinRColors.surface;
                    final userBubbleBg = isLight ? const Color(0xFF2C6DB3) : VinRColors.sapphire;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Row(
                        mainAxisAlignment: isAi ? MainAxisAlignment.start : MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (isAi) ...[
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: context.goldMutedColor,
                                border: Border.all(color: context.borderGoldColor),
                              ),
                              child: Icon(LucideIcons.sparkles, color: activeGold, size: 16),
                            ),
                            const SizedBox(width: 8),
                          ],
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isAi ? aiBubbleBg : userBubbleBg,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(18),
                                  topRight: const Radius.circular(18),
                                  bottomLeft: Radius.circular(isAi ? 4 : 18),
                                  bottomRight: Radius.circular(isAi ? 18 : 4),
                                ),
                                border: isAi ? Border.all(color: context.borderColor) : null,
                                boxShadow: isLight
                                    ? [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))]
                                    : [],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    msg.text,
                                    style: VinRTypography.bodySm.copyWith(
                                      color: isAi ? primaryTextColor : Colors.white,
                                      height: 1.45,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: TextStyle(
                                      color: isAi ? mutedTextColor : Colors.white.withValues(alpha: 0.7),
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              if (chatState.isGenerating) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: activeGold)),
                      const SizedBox(width: 8),
                      Text('VinR is reflecting...', style: TextStyle(color: mutedTextColor, fontSize: 12)),
                    ],
                  ),
                ),
              ],

              // Bottom Voice / Text Input Row aligned neatly with bottom inset
              if (_isRecording) ...[
                Container(
                  padding: EdgeInsets.only(left: 16, right: 16, top: 12, bottom: bottomInset > 0 ? bottomInset + 8 : 16),
                  color: context.surfaceColor,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(LucideIcons.mic, color: VinRColors.crimson, size: 20),
                          SizedBox(width: 8),
                          Text('Recording audio...', style: TextStyle(color: VinRColors.crimson, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      IconButton(
                        icon: Icon(LucideIcons.send, color: activeGold),
                        onPressed: () {
                          setState(() => _isRecording = false);
                          ref.read(chatProvider.notifier).sendMessage('Voice audio reflection captured', isVoice: true);
                          _scrollToBottom();
                        },
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Padding(
                  padding: EdgeInsets.only(left: 16, right: 16, top: 8, bottom: bottomInset > 0 ? bottomInset + 8 : 16),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(LucideIcons.mic, color: activeGold),
                        onPressed: () => setState(() => _isRecording = true),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'Share what\'s on your mind...',
                            hintStyle: TextStyle(color: mutedTextColor),
                            fillColor: context.surfaceColor,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: context.borderColor)),
                          ),
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _send,
                        icon: const Icon(LucideIcons.send, color: Colors.black, size: 18),
                        style: IconButton.styleFrom(
                          backgroundColor: activeGold,
                          shape: const CircleBorder(),
                          padding: const EdgeInsets.all(12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
