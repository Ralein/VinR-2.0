import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
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
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final notifier = ref.read(chatProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text('AI Growth Partner', style: VinRTypography.h3),
            Text(chatState.persona, style: VinRTypography.caption.copyWith(color: VinRColors.goldLight)),
          ],
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.trash2),
            onPressed: notifier.clearMessages,
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: Column(
            children: [
              // Persona Switcher Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: ['VinR Growth Partner', 'Gentle Listener', 'Stoic Mentor'].map((p) {
                    final isSel = chatState.persona == p;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSel,
                        label: Text(p, style: TextStyle(color: isSel ? Colors.black : VinRColors.textPrimary)),
                        selectedColor: VinRColors.gold,
                        backgroundColor: VinRColors.surface,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        onSelected: (_) => notifier.setPersona(p),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const Divider(color: VinRColors.border, height: 1),
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: chatState.messages.length,
                  itemBuilder: (context, index) {
                    final msg = chatState.messages[index];
                    final isAi = msg.sender == MessageSender.ai;

                    return Align(
                      alignment: isAi ? Alignment.centerLeft : Alignment.centerRight,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.78,
                        ),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isAi ? VinRColors.surface : VinRColors.goldMuted,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isAi ? VinRColors.border : VinRColors.borderGold,
                          ),
                        ),
                        child: Text(
                          msg.text,
                          style: VinRTypography.bodySm.copyWith(
                            color: isAi ? VinRColors.textPrimary : VinRColors.goldLight,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              if (chatState.isGenerating) ...[
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: VinRColors.goldLight)),
                      SizedBox(width: 8),
                      Text('VinR is reflecting...', style: TextStyle(color: VinRColors.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
              ],
              // Message Input Box
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        style: VinRTypography.body,
                        decoration: InputDecoration(
                          hintText: 'Share how you feel...',
                          fillColor: VinRColors.surface,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _send,
                      icon: const Icon(LucideIcons.send, color: Colors.black),
                      style: IconButton.styleFrom(
                        backgroundColor: VinRColors.gold,
                        shape: const CircleBorder(),
                        padding: const EdgeInsets.all(14),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
