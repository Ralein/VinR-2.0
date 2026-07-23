import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  int _recordingSeconds = 0;
  bool _voiceModeEnabled = false;
  ChatMessageModel? _replyingTo;

  final List<Map<String, dynamic>> _personas = [
    {'id': 'vinr', 'name': 'VinR Coach', 'icon': LucideIcons.sparkles, 'tag': 'Growth'},
    {'id': 'listener', 'name': 'Gentle Listener', 'icon': LucideIcons.heart, 'tag': 'Empathy'},
    {'id': 'stoic', 'name': 'Stoic Mentor', 'icon': LucideIcons.shield, 'tag': 'Wisdom'},
  ];

  final List<String> _quickPrompts = [
    'I feel anxious today',
    'Give me a 2-min grounding',
    'Help me reframe a thought',
    'Night wind-down reflection',
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send([String? textOverride]) {
    final text = textOverride ?? _messageController.text.trim();
    if (text.isNotEmpty) {
      ref.read(chatProvider.notifier).sendMessage(text);
      _messageController.clear();
      setState(() => _replyingTo = null);
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

  void _showMoreMenu(BuildContext context) {
    final primaryTextColor = context.textColor;

    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: context.textGhostColor.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: Icon(
                    _voiceModeEnabled ? LucideIcons.volume2 : LucideIcons.volumeX,
                    color: context.goldColor,
                  ),
                  title: Text(
                    _voiceModeEnabled ? 'Voice Mode Active' : 'Enable Voice Replies',
                    style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor),
                  ),
                  subtitle: Text(
                    _voiceModeEnabled ? 'AI will read responses aloud' : 'Tap to enable spoken audio replies',
                    style: TextStyle(color: context.textMutedColor, fontSize: 12),
                  ),
                  trailing: Switch(
                    value: _voiceModeEnabled,
                    onChanged: (val) {
                      setState(() => _voiceModeEnabled = val);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(val ? 'Voice mode enabled 🔊' : 'Voice mode muted 🔇')),
                      );
                    },
                    activeThumbColor: context.goldColor,
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.trash2, color: VinRColors.crimson),
                  title: const Text('Clear Chat History', style: TextStyle(color: VinRColors.crimson, fontWeight: FontWeight.bold)),
                  subtitle: Text('Reset conversation memory', style: TextStyle(color: context.textMutedColor, fontSize: 12)),
                  onTap: () {
                    ref.read(chatProvider.notifier).clearMessages();
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Chat memory cleared.')),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showMessageOptions(ChatMessageModel msg) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: Icon(LucideIcons.copy, color: context.goldColor, size: 20),
                title: Text('Copy Text', style: TextStyle(color: context.textColor)),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: msg.text));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Message copied to clipboard')),
                  );
                },
              ),
              ListTile(
                leading: Icon(LucideIcons.reply, color: context.goldColor, size: 20),
                title: Text('Reply', style: TextStyle(color: context.textColor)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _replyingTo = msg);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFormattedText(String text, TextStyle baseStyle) {
    final parts = text.split(RegExp(r'(\*\*.*?\*\*)'));
    return RichText(
      text: TextSpan(
        children: parts.map((part) {
          if (part.startsWith('**') && part.endsWith('**')) {
            return TextSpan(
              text: part.substring(2, part.length - 2),
              style: baseStyle.copyWith(fontWeight: FontWeight.bold),
            );
          }
          return TextSpan(text: part, style: baseStyle);
        }).toList(),
      ),
    );
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
    final topInset = MediaQuery.of(context).padding.top;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Top Header Bar — Matching React Native SafeBlurView
              Container(
                padding: EdgeInsets.only(left: 16, right: 16, top: topInset > 0 ? 8 : 16, bottom: 12),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: context.borderColor, width: 1)),
                ),
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
                      icon: Icon(_voiceModeEnabled ? LucideIcons.volume2 : LucideIcons.volumeX, color: activeGold, size: 20),
                      onPressed: () => setState(() => _voiceModeEnabled = !_voiceModeEnabled),
                      tooltip: 'Toggle Voice Audio',
                    ),
                    IconButton(
                      icon: Icon(LucideIcons.moreVertical, color: primaryTextColor, size: 20),
                      onPressed: () => _showMoreMenu(context),
                      tooltip: 'Options',
                    ),
                  ],
                ),
              ),

              // Persona Carousel Switcher Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: _personas.map((p) {
                    final isSel = chatState.persona == p['name'];
                    final icon = p['icon'] as IconData;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () {
                          notifier.setPersona(p['name'] as String);
                          notifier.sendMessage('Switched to ${p['name']}. How can I help you today?');
                          _scrollToBottom();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? activeGold.withValues(alpha: isLight ? 0.15 : 0.25) : context.surfaceColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isSel ? activeGold : context.borderColor, width: isSel ? 1.5 : 1),
                          ),
                          child: Row(
                            children: [
                              Icon(icon, size: 14, color: isSel ? activeGold : context.textGhostColor),
                              const SizedBox(width: 6),
                              Text(
                                p['name'] as String,
                                style: TextStyle(
                                  color: isSel ? primaryTextColor : context.textGhostColor,
                                  fontSize: 12,
                                  fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
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
              Divider(color: context.borderColor, height: 1),

              // Messages Stream List
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

                    return GestureDetector(
                      onLongPress: () => _showMessageOptions(msg),
                      child: Padding(
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
                                    _buildFormattedText(
                                      msg.text,
                                      VinRTypography.bodySm.copyWith(
                                        color: isAi ? primaryTextColor : Colors.white,
                                        height: 1.45,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                          style: TextStyle(
                                            color: isAi ? mutedTextColor : Colors.white.withValues(alpha: 0.7),
                                            fontSize: 10,
                                          ),
                                        ),
                                        if (msg.isVoice) ...[
                                          const SizedBox(width: 6),
                                          Icon(LucideIcons.volume2, size: 12, color: isAi ? activeGold : Colors.white),
                                        ],
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
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
                      Text('${chatState.persona} is reflecting...', style: TextStyle(color: mutedTextColor, fontSize: 12, fontStyle: FontStyle.italic)),
                    ],
                  ),
                ),
              ],

              // Quick Starter Prompts Chips Bar
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  children: _quickPrompts.map((prompt) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(
                        avatar: Icon(LucideIcons.sparkles, size: 12, color: activeGold),
                        label: Text(prompt, style: TextStyle(color: primaryTextColor, fontSize: 11)),
                        backgroundColor: context.surfaceColor,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: context.borderColor)),
                        onPressed: () => _send(prompt),
                      ),
                    );
                  }).toList(),
                ),
              ),

              // Reply Preview Bar
              if (_replyingTo != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: activeGold.withValues(alpha: 0.1),
                  child: Row(
                    children: [
                      Icon(LucideIcons.reply, size: 16, color: activeGold),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Replying to: "${_replyingTo!.text}"',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: primaryTextColor, fontSize: 12, fontStyle: FontStyle.italic),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.x, size: 16),
                        onPressed: () => setState(() => _replyingTo = null),
                      ),
                    ],
                  ),
                ),
              ],

              // Bottom Voice Recording Bar or Text Input Field
              if (_isRecording) ...[
                Container(
                  padding: EdgeInsets.only(left: 16, right: 16, top: 12, bottom: bottomInset > 0 ? bottomInset + 8 : 16),
                  color: context.surfaceColor,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.mic, color: VinRColors.crimson, size: 20),
                          const SizedBox(width: 8),
                          Text('Recording (${_recordingSeconds}s)...', style: const TextStyle(color: VinRColors.crimson, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const AudioWaveformVisualizer(isPlaying: true, barColor: VinRColors.crimson),
                      IconButton(
                        icon: Icon(LucideIcons.send, color: activeGold),
                        onPressed: () {
                          setState(() => _isRecording = false);
                          ref.read(chatProvider.notifier).sendMessage('Voice audio reflection recorded', isVoice: true);
                          _scrollToBottom();
                        },
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Padding(
                  padding: EdgeInsets.only(left: 16, right: 16, top: 6, bottom: bottomInset > 0 ? bottomInset + 8 : 16),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(LucideIcons.mic, color: activeGold),
                        onPressed: () => setState(() {
                          _isRecording = true;
                          _recordingSeconds = 0;
                        }),
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
                        onPressed: () => _send(),
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
