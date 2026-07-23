import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
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

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: VinRColors.textPrimary),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('VinR AI Companion', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(shape: BoxShape.circle, color: VinRColors.emerald),
                              ),
                              const SizedBox(width: 6),
                              const Text('Online • Ready to listen', style: TextStyle(color: VinRColors.textMuted, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 20),
                      onPressed: notifier.clearMessages,
                    ),
                  ],
                ),
              ),

              // Persona Carousel Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: _personas.map((p) {
                    final isSel = chatState.persona == p['name'];
                    final icon = p['icon'] as IconData;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSel,
                        showCheckmark: false,
                        avatar: Icon(icon, size: 14, color: isSel ? Colors.black : VinRColors.goldLight),
                        label: Text(p['name'] as String, style: TextStyle(color: isSel ? Colors.black : VinRColors.textPrimary, fontSize: 12, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                        selectedColor: VinRColors.gold,
                        backgroundColor: VinRColors.surface,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSel ? VinRColors.gold : VinRColors.border)),
                        onSelected: (_) => notifier.setPersona(p['name'] as String),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const Divider(color: VinRColors.border, height: 1),

              // Messages Stream
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: chatState.messages.length,
                  itemBuilder: (context, index) {
                    final msg = chatState.messages[index];
                    final isAi = msg.sender == MessageSender.ai;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
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
                                color: VinRColors.goldMuted,
                                border: Border.all(color: VinRColors.borderGold),
                              ),
                              child: const Icon(LucideIcons.sparkles, color: VinRColors.goldLight, size: 16),
                            ),
                            const SizedBox(width: 8),
                          ],
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isAi ? VinRColors.surface : VinRColors.sapphire,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(16),
                                  topRight: const Radius.circular(16),
                                  bottomLeft: Radius.circular(isAi ? 4 : 16),
                                  bottomRight: Radius.circular(isAi ? 16 : 4),
                                ),
                                border: isAi ? Border.all(color: VinRColors.borderGold.withValues(alpha: 0.3)) : null,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    msg.text,
                                    style: VinRTypography.bodySm.copyWith(
                                      color: isAi ? VinRColors.textPrimary : Colors.white,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: TextStyle(
                                      color: isAi ? VinRColors.textGhost : Colors.white.withValues(alpha: 0.7),
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
                    children: const [
                      SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: VinRColors.goldLight)),
                      SizedBox(width: 8),
                      Text('VinR is reflecting...', style: TextStyle(color: VinRColors.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
              ],

              // Voice Recording Bar or Text Input
              if (_isRecording) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  color: VinRColors.surface,
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
                        icon: const Icon(LucideIcons.send, color: VinRColors.gold),
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
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.mic, color: VinRColors.goldLight),
                        onPressed: () => setState(() => _isRecording = true),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          style: VinRTypography.body,
                          decoration: InputDecoration(
                            hintText: 'Share what\'s on your mind...',
                            fillColor: VinRColors.surface,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: VinRColors.border)),
                          ),
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _send,
                        icon: const Icon(LucideIcons.send, color: Colors.black, size: 18),
                        style: IconButton.styleFrom(
                          backgroundColor: VinRColors.gold,
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
