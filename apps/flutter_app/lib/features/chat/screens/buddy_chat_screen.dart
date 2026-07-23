import 'dart:async';
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
import '../../../core/widgets/vinr_toast.dart';
import '../models/chat_message_model.dart';
import '../providers/chat_provider.dart';

class BuddyChatScreen extends ConsumerStatefulWidget {
  const BuddyChatScreen({super.key});

  @override
  ConsumerState<BuddyChatScreen> createState() => _BuddyChatScreenState();
}

class _BuddyChatScreenState extends ConsumerState<BuddyChatScreen> with SingleTickerProviderStateMixin {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  // Voice recording gesture states (Instagram Style Pointer Listener)
  bool _isRecording = false;
  bool _isLocked = false;
  int _recordingSeconds = 0;
  Timer? _recordingTimer;
  Offset? _touchStartPosition;
  double _dragX = 0;
  double _dragY = 0;

  bool _voiceModeEnabled = false;
  ChatMessageModel? _replyingTo;
  String? _currentlyPlayingAudioId;

  late AnimationController _pulseController;
  late Animation<double> _pulseScale;

  // Persona companion avatars definition (diffo companion avatars)
  final List<Map<String, dynamic>> _personas = [
    {
      'id': 'vinr',
      'name': 'VinR Coach',
      'icon': LucideIcons.crown,
      'color': VinRColors.gold,
      'bgColor': const Color(0x25B8832A),
      'tag': 'Growth'
    },
    {
      'id': 'listener',
      'name': 'Gentle Listener',
      'icon': LucideIcons.heartHandshake,
      'color': VinRColors.emerald,
      'bgColor': VinRColors.emeraldGlow,
      'tag': 'Empathy'
    },
    {
      'id': 'stoic',
      'name': 'Stoic Mentor',
      'icon': LucideIcons.shield,
      'color': VinRColors.sapphire,
      'bgColor': const Color(0x252C6DB3),
      'tag': 'Wisdom'
    },
  ];

  final List<String> _quickPrompts = [
    'I feel anxious today',
    'Give me a 2-min grounding',
    'Help me reframe a thought',
    'Night wind-down reflection',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _pulseScale = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _recordingTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startRecordingGesture() {
    HapticFeedback.mediumImpact();
    setState(() {
      _isRecording = true;
      _isLocked = false;
      _recordingSeconds = 0;
      _dragX = 0;
      _dragY = 0;
    });

    _recordingTimer?.cancel();
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() => _recordingSeconds++);
      }
    });
  }

  void _cancelRecordingGesture() {
    HapticFeedback.lightImpact();
    _recordingTimer?.cancel();
    setState(() {
      _isRecording = false;
      _isLocked = false;
      _recordingSeconds = 0;
      _dragX = 0;
      _dragY = 0;
      _touchStartPosition = null;
    });
  }

  void _stopAndSendRecording() {
    HapticFeedback.heavyImpact();
    _recordingTimer?.cancel();

    final sec = _recordingSeconds > 0 ? _recordingSeconds : 1;
    ref.read(chatProvider.notifier).sendMessage(
      'Voice reflection (${sec}s)',
      isVoice: true,
    );

    setState(() {
      _isRecording = false;
      _isLocked = false;
      _recordingSeconds = 0;
      _dragX = 0;
      _dragY = 0;
      _touchStartPosition = null;
    });

    _scrollToBottom();
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

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '$mins:${secs.toString().padLeft(2, '0')}';
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
                      VinRToast.show(
                        context,
                        message: val ? 'Voice mode enabled' : 'Voice mode muted',
                        icon: val ? LucideIcons.volume2 : LucideIcons.volumeX,
                        iconColor: context.goldColor,
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
                    VinRToast.show(
                      context,
                      message: 'Chat memory cleared',
                      icon: LucideIcons.trash2,
                      iconColor: VinRColors.crimson,
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

    // Distinct persona companion avatar resolution
    IconData activePersonaIcon = LucideIcons.crown;
    Color activePersonaColor = activeGold;
    Color activePersonaBg = context.goldMutedColor;

    if (chatState.persona == 'Gentle Listener') {
      activePersonaIcon = LucideIcons.heartHandshake;
      activePersonaColor = VinRColors.emerald;
      activePersonaBg = VinRColors.emeraldGlow;
    } else if (chatState.persona == 'Stoic Mentor') {
      activePersonaIcon = LucideIcons.shield;
      activePersonaColor = VinRColors.sapphire;
      activePersonaBg = const Color(0x252C6DB3);
    }

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          bottom: false,
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

                    // Active Persona Distinct Companion Avatar
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: activePersonaBg,
                        border: Border.all(color: activePersonaColor, width: 1.5),
                      ),
                      child: Icon(activePersonaIcon, color: activePersonaColor, size: 18),
                    ),
                    const SizedBox(width: 10),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(chatState.persona, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 16)),
                          const SizedBox(height: 1),
                          Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(shape: BoxShape.circle, color: VinRColors.emerald),
                              ),
                              const SizedBox(width: 6),
                              Text('Online • Companion Active', style: TextStyle(color: mutedTextColor, fontSize: 11)),
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

              // Persona Switcher Bar with distinct companion avatars
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: _personas.map((p) {
                    final isSel = chatState.persona == p['name'];
                    final icon = p['icon'] as IconData;
                    final pColor = p['color'] as Color;

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
                            color: isSel ? pColor.withValues(alpha: isLight ? 0.15 : 0.25) : context.surfaceColor,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: isSel ? pColor : context.borderColor, width: isSel ? 1.5 : 1),
                          ),
                          child: Row(
                            children: [
                              Icon(icon, size: 14, color: isSel ? pColor : context.textGhostColor),
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

              // Messages Stream List with distinct companion avatars
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
                    final isPlayingThis = _currentlyPlayingAudioId == msg.id;

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
                                  color: activePersonaBg,
                                  border: Border.all(color: activePersonaColor.withValues(alpha: 0.6)),
                                ),
                                child: Icon(activePersonaIcon, color: activePersonaColor, size: 16),
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

                                    // Voice Playback Pill (React Native parity)
                                    if (msg.isVoice) ...[
                                      const SizedBox(height: 8),
                                      GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            if (isPlayingThis) {
                                              _currentlyPlayingAudioId = null;
                                            } else {
                                              _currentlyPlayingAudioId = msg.id;
                                            }
                                          });
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: isAi ? activeGold.withValues(alpha: 0.12) : Colors.white.withValues(alpha: 0.18),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Container(
                                                width: 26,
                                                height: 26,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: isAi ? activeGold : Colors.white,
                                                ),
                                                child: Center(
                                                  child: Icon(
                                                    isPlayingThis ? LucideIcons.pause : LucideIcons.play,
                                                    size: 13,
                                                    color: isAi ? Colors.white : userBubbleBg,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              AudioWaveformVisualizer(
                                                isPlaying: isPlayingThis,
                                                barColor: isAi ? primaryTextColor : Colors.white,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],

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
                                        if (!isAi) ...[
                                          const SizedBox(width: 4),
                                          const Icon(LucideIcons.checkCheck, size: 12, color: Colors.white70),
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

              // Quick Starter Prompts Chips
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

              // Instagram-Style Hold-to-Record & Swipe-to-Cancel / Slide-to-Lock Bar
              if (_isRecording) ...[
                Container(
                  padding: EdgeInsets.only(left: 16, right: 16, top: 10, bottom: bottomInset > 0 ? bottomInset + 4 : 10),
                  color: context.surfaceColor,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Trash Cancel Button
                      IconButton(
                        icon: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 22),
                        onPressed: _cancelRecordingGesture,
                        tooltip: 'Cancel recording',
                      ),

                      // Timer & Pulsing Dot
                      Row(
                        children: [
                          ScaleTransition(
                            scale: _pulseScale,
                            child: Container(
                              width: 10,
                              height: 10,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: VinRColors.crimson,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatTime(_recordingSeconds),
                            style: TextStyle(color: primaryTextColor, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),

                      // Hint Text ("Swipe up to lock ↑" or "Hands-free locked")
                      Expanded(
                        child: Text(
                          _isLocked
                              ? 'Hands-free locked 🔒'
                              : (_dragY < -25 ? 'Release to lock 🔒' : 'Swipe up to lock ↑'),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: (_isLocked || _dragY < -25) ? activeGold : mutedTextColor,
                            fontSize: 12,
                            fontWeight: (_isLocked || _dragY < -25) ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ),

                      // Send Button
                      GestureDetector(
                        onTap: _stopAndSendRecording,
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: VinRColors.goldGradient,
                            boxShadow: [
                              BoxShadow(
                                color: activeGold.withValues(alpha: 0.35),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(
                              LucideIcons.send,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Padding(
                  padding: EdgeInsets.only(left: 12, right: 12, top: 4, bottom: bottomInset > 0 ? bottomInset + 4 : 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Raw Pointer Listener for Fail-Proof Hold to Record & Swipe Left to Cancel
                      Listener(
                        onPointerDown: (event) {
                          _touchStartPosition = event.position;
                          _startRecordingGesture();
                        },
                        onPointerMove: (event) {
                          if (_touchStartPosition != null && _isRecording && !_isLocked) {
                            final dx = event.position.dx - _touchStartPosition!.dx;
                            final dy = event.position.dy - _touchStartPosition!.dy;
                            setState(() {
                              _dragX = dx;
                              _dragY = dy;
                            });

                            if (dx < -30) {
                              _cancelRecordingGesture();
                            } else if (dy < -40 || _dragY < -40) {
                              HapticFeedback.heavyImpact();
                              setState(() {
                                _isLocked = true;
                                _dragX = 0;
                                _dragY = 0;
                              });
                            }
                          }
                        },
                        onPointerUp: (event) {
                          if (_touchStartPosition != null) {
                            _touchStartPosition = null;
                            if (!_isLocked) {
                              if (_dragX < -30) {
                                _cancelRecordingGesture();
                              } else {
                                _stopAndSendRecording();
                              }
                            }
                          }
                        },
                        onPointerCancel: (_) {
                          if (_touchStartPosition != null) {
                            _touchStartPosition = null;
                            _cancelRecordingGesture();
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          child: Icon(LucideIcons.mic, color: activeGold, size: 22),
                        ),
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          style: TextStyle(color: primaryTextColor),
                          decoration: InputDecoration(
                            hintText: 'Share what\'s on your mind...',
                            hintStyle: TextStyle(color: mutedTextColor),
                            fillColor: context.surfaceColor,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(24),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                          ),
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _send(),
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: VinRColors.goldGradient,
                            boxShadow: [
                              BoxShadow(
                                color: activeGold.withValues(alpha: 0.35),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(
                              LucideIcons.send,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
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
