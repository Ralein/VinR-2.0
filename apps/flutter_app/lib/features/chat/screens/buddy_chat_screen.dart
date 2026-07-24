import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/audio_waveform_visualizer.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../models/chat_message_model.dart';
import '../providers/chat_provider.dart';
import '../../../core/repositories/chat_repository.dart';

// ─────────────────────────────────────────────
// Companion Persona Definitions
// ─────────────────────────────────────────────
class _Persona {
  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final Color bg;
  final String tag;
  const _Persona({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.bg,
    required this.tag,
  });
}

const _personas = [
  _Persona(
    id: 'vinr',
    name: 'VinR Coach',
    icon: LucideIcons.crown,
    color: VinRColors.gold,
    bg: Color(0x25B8832A),
    tag: 'Growth',
  ),
  _Persona(
    id: 'listener',
    name: 'Gentle Listener',
    icon: LucideIcons.heartHandshake,
    color: VinRColors.emerald,
    bg: VinRColors.emeraldGlow,
    tag: 'Empathy',
  ),
  _Persona(
    id: 'stoic',
    name: 'Stoic Mentor',
    icon: LucideIcons.shield,
    color: VinRColors.sapphire,
    bg: Color(0x252C6DB3),
    tag: 'Wisdom',
  ),
];

const _quickPrompts = [
  'I feel anxious today',
  'Give me a 2-min grounding',
  'Help me reframe a thought',
  'Night wind-down reflection',
];

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────
class BuddyChatScreen extends ConsumerStatefulWidget {
  const BuddyChatScreen({super.key});

  @override
  ConsumerState<BuddyChatScreen> createState() => _BuddyChatScreenState();
}

class _BuddyChatScreenState extends ConsumerState<BuddyChatScreen>
    with SingleTickerProviderStateMixin {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  late final AudioPlayer _audioPlayer;

  // Voice recording states
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

  // ── Lifecycle ──────────────────────────────

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _audioPlayer.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _currentlyPlayingAudioId = null);
    });
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
    _audioPlayer.dispose();
    super.dispose();
  }

  // ── Voice Recording Gesture Handlers ───────

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
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _recordingSeconds++);
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
    });
    _scrollToBottom();
  }

  // ── Audio Playback ─────────────────────────

  Future<void> _toggleAudioPlayback(ChatMessageModel msg) async {
    if (_currentlyPlayingAudioId == msg.id) {
      await _audioPlayer.stop();
      if (mounted) setState(() => _currentlyPlayingAudioId = null);
    } else {
      await _audioPlayer.stop();
      String? uri = msg.audioUri;
      if (uri == null || uri.isEmpty) {
        final repository = ChatRepository();
        uri = await repository.generateTts(msg.text, persona: 'vinr');
      }
      if (uri != null && uri.isNotEmpty) {
        try {
          await _audioPlayer.play(UrlSource(uri));
          if (mounted) setState(() => _currentlyPlayingAudioId = msg.id);
        } catch (e) {
          debugPrint('Audio playback error: $e');
        }
      }
    }
  }

  // ── Message Send ───────────────────────────

  void _send([String? textOverride]) {
    final text = textOverride ?? _messageController.text.trim();
    if (text.isNotEmpty) {
      ref.read(chatProvider.notifier).sendMessage(text, isVoice: _voiceModeEnabled);
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

  // ── Bottom Sheets ──────────────────────────

  void _showMoreMenu(BuildContext ctx) {
    final primaryTextColor = ctx.textColor;
    showModalBottomSheet(
      context: ctx,
      backgroundColor: ctx.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: ctx.textGhostColor.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Icon(
                  _voiceModeEnabled ? LucideIcons.volume2 : LucideIcons.volumeX,
                  color: ctx.goldColor,
                ),
                title: Text(
                  _voiceModeEnabled ? 'Voice Mode Active' : 'Enable Voice Replies',
                  style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor),
                ),
                subtitle: Text(
                  _voiceModeEnabled
                      ? 'AI will read responses aloud'
                      : 'Tap to enable spoken audio replies',
                  style: TextStyle(color: ctx.textMutedColor, fontSize: 12),
                ),
                trailing: Switch(
                  value: _voiceModeEnabled,
                  onChanged: (val) {
                    setState(() => _voiceModeEnabled = val);
                    Navigator.pop(ctx);
                    VinRToast.show(
                      ctx,
                      message: val ? 'Voice mode enabled' : 'Voice mode muted',
                      icon: val ? LucideIcons.volume2 : LucideIcons.volumeX,
                      iconColor: ctx.goldColor,
                    );
                  },
                  activeThumbColor: ctx.goldColor,
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(LucideIcons.trash2, color: VinRColors.crimson),
                title: const Text('Clear Chat History',
                    style: TextStyle(color: VinRColors.crimson, fontWeight: FontWeight.bold)),
                subtitle: Text('Reset conversation memory',
                    style: TextStyle(color: ctx.textMutedColor, fontSize: 12)),
                onTap: () {
                  ref.read(chatProvider.notifier).clearMessages();
                  Navigator.pop(ctx);
                  VinRToast.show(
                    ctx,
                    message: 'Chat memory cleared',
                    icon: LucideIcons.trash2,
                    iconColor: VinRColors.crimson,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMessageOptions(ChatMessageModel msg) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: Icon(LucideIcons.copy, color: ctx.goldColor, size: 20),
              title: Text('Copy Text', style: TextStyle(color: ctx.textColor)),
              onTap: () {
                Clipboard.setData(ClipboardData(text: msg.text));
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Message copied to clipboard')),
                );
              },
            ),
            ListTile(
              leading: Icon(LucideIcons.reply, color: ctx.goldColor, size: 20),
              title: Text('Reply', style: TextStyle(color: ctx.textColor)),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _replyingTo = msg);
              },
            ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ────────────────────────────────

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

  _Persona _resolvePersona(String personaName) {
    return _personas.firstWhere(
      (p) => p.name == personaName,
      orElse: () => _personas.first,
    );
  }

  // ── Build ──────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final notifier = ref.read(chatProvider.notifier);

    final isLight = context.isLight;
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;
    final bottomInset = MediaQuery.of(context).padding.bottom;

    final persona = _resolvePersona(chatState.persona);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          bottom: false,
          child: Column(
            children: [
              // ── Header ──────────────────────
              _buildHeader(context, persona, activeGold, primaryTextColor, mutedTextColor, isLight),

              // ── Persona Switcher ────────────
              _buildPersonaSwitcher(context, chatState, notifier, activeGold, primaryTextColor, isLight),

              Divider(color: context.borderColor, height: 1),

              // ── Messages ────────────────────
              Expanded(
                child: _buildMessageList(
                  context,
                  chatState,
                  persona,
                  activeGold,
                  primaryTextColor,
                  mutedTextColor,
                  isLight,
                ),
              ),

              // ── Typing Indicator ────────────
              if (chatState.isGenerating) _buildTypingIndicator(context, chatState, activeGold, mutedTextColor),

              // ── Quick Prompts ───────────────
              _buildQuickPrompts(context, activeGold, primaryTextColor),

              // ── Reply Preview ───────────────
              if (_replyingTo != null)
                _buildReplyPreview(context, activeGold, primaryTextColor),

              // ── Input Bar ──────────────────
              _buildInputBar(context, activeGold, primaryTextColor, mutedTextColor, isLight, bottomInset),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────
  // Sub-widgets
  // ─────────────────────────────────────────────

  Widget _buildHeader(
    BuildContext context,
    _Persona persona,
    Color activeGold,
    Color primaryTextColor,
    Color mutedTextColor,
    bool isLight,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: context.borderColor)),
      ),
      child: Row(
        children: [
          // Back
          GestureDetector(
            onTap: () => context.pop(),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: context.surfaceColor,
                border: Border.all(color: context.borderColor),
              ),
              child: Icon(LucideIcons.chevronLeft, color: primaryTextColor, size: 18),
            ),
          ),
          const SizedBox(width: 12),

          // Persona Avatar
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: persona.bg,
              border: Border.all(color: persona.color, width: 2),
              boxShadow: [
                BoxShadow(
                  color: persona.color.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(persona.icon, color: persona.color, size: 20),
          ),
          const SizedBox(width: 12),

          // Name + Status
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      persona.name,
                      style: VinRTypography.body.copyWith(
                        fontWeight: FontWeight.bold,
                        color: primaryTextColor,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Tag badge — same pill pattern as home dashboard
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: persona.color.withValues(alpha: isLight ? 0.12 : 0.22),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: persona.color.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        persona.tag.toUpperCase(),
                        style: TextStyle(
                          color: persona.color,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: VinRColors.emerald,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Online • Companion Active',
                      style: TextStyle(color: mutedTextColor, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Voice toggle
          GestureDetector(
            onTap: () => setState(() => _voiceModeEnabled = !_voiceModeEnabled),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _voiceModeEnabled
                    ? activeGold.withValues(alpha: 0.15)
                    : context.surfaceColor,
                border: Border.all(
                  color: _voiceModeEnabled ? activeGold : context.borderColor,
                ),
              ),
              child: Icon(
                _voiceModeEnabled ? LucideIcons.volume2 : LucideIcons.volumeX,
                color: _voiceModeEnabled ? activeGold : context.textGhostColor,
                size: 18,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // More
          GestureDetector(
            onTap: () => _showMoreMenu(context),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: context.surfaceColor,
                border: Border.all(color: context.borderColor),
              ),
              child: Icon(LucideIcons.moreVertical, color: primaryTextColor, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonaSwitcher(
    BuildContext context,
    dynamic chatState,
    dynamic notifier,
    Color activeGold,
    Color primaryTextColor,
    bool isLight,
  ) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: _personas.map((p) {
          final isSel = chatState.persona == p.name;
          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: GestureDetector(
              onTap: () {
                notifier.setPersona(p.name);
                notifier.sendMessage('Switched to ${p.name}. How can I help you today?');
                _scrollToBottom();
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSel
                      ? p.color.withValues(alpha: isLight ? 0.14 : 0.24)
                      : context.surfaceColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSel ? p.color : context.borderColor,
                    width: isSel ? 1.5 : 1,
                  ),
                  boxShadow: isSel
                      ? [BoxShadow(color: p.color.withValues(alpha: 0.2), blurRadius: 8)]
                      : [],
                ),
                child: Row(
                  children: [
                    Icon(p.icon, size: 14, color: isSel ? p.color : context.textGhostColor),
                    const SizedBox(width: 6),
                    Text(
                      p.name,
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
    );
  }

  Widget _buildMessageList(
    BuildContext context,
    dynamic chatState,
    _Persona persona,
    Color activeGold,
    Color primaryTextColor,
    Color mutedTextColor,
    bool isLight,
  ) {
    if (chatState.messages.isEmpty) {
      return _buildEmptyState(context, persona, activeGold, primaryTextColor, mutedTextColor, isLight);
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 12),
      itemCount: chatState.messages.length,
      itemBuilder: (context, index) {
        final msg = chatState.messages[index] as ChatMessageModel;
        final isAi = msg.sender == MessageSender.ai;
        final isPlayingThis = _currentlyPlayingAudioId == msg.id;

        // AI bubble: glass card; User bubble: solid gold-tinted sapphire
        final aiBubbleBg = isLight ? Colors.white : VinRColors.surface;
        final userBubbleBg = isLight ? const Color(0xFF2C6DB3) : VinRColors.sapphire;

        return GestureDetector(
          onLongPress: () => _showMessageOptions(msg),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              mainAxisAlignment: isAi ? MainAxisAlignment.start : MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // AI avatar dot
                if (isAi) ...[
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: persona.bg,
                      border: Border.all(color: persona.color.withValues(alpha: 0.6)),
                      boxShadow: [
                        BoxShadow(
                          color: persona.color.withValues(alpha: 0.2),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Icon(persona.icon, color: persona.color, size: 16),
                  ),
                  const SizedBox(width: 8),
                ],

                // Bubble
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    decoration: BoxDecoration(
                      color: isAi ? aiBubbleBg : userBubbleBg,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: Radius.circular(isAi ? 4 : 20),
                        bottomRight: Radius.circular(isAi ? 20 : 4),
                      ),
                      border: isAi
                          ? Border.all(color: context.borderColor)
                          : null,
                      boxShadow: [
                        BoxShadow(
                          color: isLight
                              ? Colors.black.withValues(alpha: 0.06)
                              : Colors.black.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFormattedText(
                          msg.text,
                          VinRTypography.bodySm.copyWith(
                            color: isAi ? primaryTextColor : Colors.white,
                            height: 1.5,
                          ),
                        ),

                        // Voice playback pill
                        if (msg.isVoice || (msg.audioUri != null && msg.audioUri!.isNotEmpty)) ...[
                          const SizedBox(height: 8),
                          GestureDetector(
                            onTap: () => _toggleAudioPlayback(msg),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isAi
                                    ? activeGold.withValues(alpha: 0.12)
                                    : Colors.white.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isAi
                                      ? activeGold.withValues(alpha: 0.3)
                                      : Colors.white.withValues(alpha: 0.3),
                                ),
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
                                        size: 12,
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

                        // Timestamp + checkmarks
                        const SizedBox(height: 6),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${msg.timestamp.hour}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                              style: TextStyle(
                                color: isAi
                                    ? mutedTextColor
                                    : Colors.white.withValues(alpha: 0.65),
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
    );
  }

  Widget _buildEmptyState(
    BuildContext context,
    _Persona persona,
    Color activeGold,
    Color primaryTextColor,
    Color mutedTextColor,
    bool isLight,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Big persona avatar
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: persona.bg,
                border: Border.all(color: persona.color, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: persona.color.withValues(alpha: 0.3),
                    blurRadius: 24,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: Icon(persona.icon, color: persona.color, size: 38),
            ),
            const SizedBox(height: 20),

            // Badge pill — matches home dashboard pattern
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: activeGold.withValues(alpha: isLight ? 0.12 : 0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: activeGold.withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.sparkles, size: 12, color: activeGold),
                  const SizedBox(width: 6),
                  Text(
                    'AI COMPANION READY',
                    style: TextStyle(
                      color: activeGold,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Text(
              persona.name,
              style: VinRTypography.h1.copyWith(fontSize: 22, color: primaryTextColor),
            ),
            const SizedBox(height: 8),
            Text(
              'Your ${persona.tag.toLowerCase()} companion is here.\nShare what\'s on your mind.',
              textAlign: TextAlign.center,
              style: VinRTypography.bodySm.copyWith(color: mutedTextColor, height: 1.6),
            ),
            const SizedBox(height: 24),

            // Starter prompt cards
            GlassContainer(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.zap, size: 14, color: activeGold),
                      const SizedBox(width: 8),
                      Text(
                        'TRY ASKING',
                        style: VinRTypography.label.copyWith(color: mutedTextColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ..._quickPrompts.map((p) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: GestureDetector(
                          onTap: () => _send(p),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: activeGold.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: activeGold.withValues(alpha: 0.2)),
                            ),
                            child: Row(
                              children: [
                                Icon(LucideIcons.messageCircle, size: 14, color: activeGold),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    p,
                                    style: VinRTypography.bodySm.copyWith(color: primaryTextColor),
                                  ),
                                ),
                                Icon(LucideIcons.chevronRight, size: 14, color: mutedTextColor),
                              ],
                            ),
                          ),
                        ),
                      )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator(
    BuildContext context,
    dynamic chatState,
    Color activeGold,
    Color mutedTextColor,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 1.8, color: activeGold),
          ),
          const SizedBox(width: 10),
          Text(
            '${chatState.persona} is reflecting...',
            style: TextStyle(
              color: mutedTextColor,
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickPrompts(BuildContext context, Color activeGold, Color primaryTextColor) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        children: _quickPrompts.map((prompt) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => _send(prompt),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: context.surfaceColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: context.borderColor),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.sparkles, size: 12, color: activeGold),
                    const SizedBox(width: 6),
                    Text(
                      prompt,
                      style: TextStyle(color: primaryTextColor, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildReplyPreview(BuildContext context, Color activeGold, Color primaryTextColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: activeGold.withValues(alpha: 0.08),
        border: Border(top: BorderSide(color: activeGold.withValues(alpha: 0.2))),
      ),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 36,
            decoration: BoxDecoration(
              color: activeGold,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Icon(LucideIcons.reply, size: 14, color: activeGold),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Replying to: "${_replyingTo!.text}"',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: primaryTextColor,
                fontSize: 12,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => setState(() => _replyingTo = null),
            child: Icon(LucideIcons.x, size: 18, color: context.textGhostColor),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar(
    BuildContext context,
    Color activeGold,
    Color primaryTextColor,
    Color mutedTextColor,
    bool isLight,
    double bottomInset,
  ) {
    if (_isRecording) {
      return _buildRecordingBar(context, activeGold, primaryTextColor, mutedTextColor, bottomInset);
    }

    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        top: 10,
        bottom: bottomInset > 0 ? bottomInset + 6 : 12,
      ),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: context.borderColor)),
        color: context.surfaceColor.withValues(alpha: 0.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Mic — raw Listener for reliable hold-to-record
          Listener(
            onPointerDown: (e) {
              _touchStartPosition = e.position;
              _startRecordingGesture();
            },
            onPointerMove: (e) {
              if (_touchStartPosition != null && _isRecording && !_isLocked) {
                final dx = e.position.dx - _touchStartPosition!.dx;
                final dy = e.position.dy - _touchStartPosition!.dy;
                setState(() {
                  _dragX = dx;
                  _dragY = dy;
                });
                if (dx < -30) {
                  _cancelRecordingGesture();
                } else if (dy < -40) {
                  HapticFeedback.heavyImpact();
                  setState(() {
                    _isLocked = true;
                    _dragX = 0;
                    _dragY = 0;
                  });
                }
              }
            },
            onPointerUp: (e) {
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
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: activeGold.withValues(alpha: 0.1),
                border: Border.all(color: activeGold.withValues(alpha: 0.35)),
              ),
              child: Icon(LucideIcons.mic, color: activeGold, size: 20),
            ),
          ),
          const SizedBox(width: 10),

          // Text field
          Expanded(
            child: TextField(
              controller: _messageController,
              style: TextStyle(color: primaryTextColor, fontSize: 15),
              maxLines: 4,
              minLines: 1,
              decoration: InputDecoration(
                hintText: 'Share what\'s on your mind...',
                hintStyle: TextStyle(color: mutedTextColor, fontSize: 14),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                filled: true,
                fillColor: context.surfaceColor,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide(color: context.borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide(color: context.borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide(color: activeGold, width: 1.5),
                ),
              ),
              onSubmitted: (_) => _send(),
            ),
          ),
          const SizedBox(width: 10),

          // Send button — gradient gold orb
          GestureDetector(
            onTap: _send,
            child: Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: VinRColors.goldGradient,
                boxShadow: [
                  BoxShadow(
                    color: activeGold.withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(LucideIcons.send, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordingBar(
    BuildContext context,
    Color activeGold,
    Color primaryTextColor,
    Color mutedTextColor,
    double bottomInset,
  ) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: bottomInset > 0 ? bottomInset + 6 : 12,
      ),
      decoration: BoxDecoration(
        color: VinRColors.crimsonGlow.withValues(alpha: 0.5),
        border: Border(top: BorderSide(color: VinRColors.crimson.withValues(alpha: 0.4))),
      ),
      child: Row(
        children: [
          // Cancel
          GestureDetector(
            onTap: _cancelRecordingGesture,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: VinRColors.crimson.withValues(alpha: 0.15),
                border: Border.all(color: VinRColors.crimson.withValues(alpha: 0.4)),
              ),
              child: const Icon(LucideIcons.trash2, color: VinRColors.crimson, size: 18),
            ),
          ),
          const SizedBox(width: 14),

          // Pulsing dot + timer
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
            style: TextStyle(
              color: primaryTextColor,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(width: 12),

          // Lock hint
          Expanded(
            child: Text(
              _isLocked
                  ? '🔒 Hands-free locked'
                  : (_dragY < -25 ? 'Release to lock ↑' : '← Swipe to cancel  ·  Slide up to lock'),
              style: TextStyle(
                color: (_isLocked || _dragY < -25) ? activeGold : mutedTextColor,
                fontSize: 11,
                fontWeight: (_isLocked || _dragY < -25) ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),

          // Send
          GestureDetector(
            onTap: _stopAndSendRecording,
            child: Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: VinRColors.goldGradient,
                boxShadow: [
                  BoxShadow(
                    color: activeGold.withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(LucideIcons.send, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
