import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';

class ChatState {
  final List<ChatMessageModel> messages;
  final String persona;
  final bool isGenerating;

  ChatState({
    this.messages = const [],
    this.persona = 'VinR Growth Partner',
    this.isGenerating = false,
  });

  ChatState copyWith({
    List<ChatMessageModel>? messages,
    String? persona,
    bool? isGenerating,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      persona: persona ?? this.persona,
      isGenerating: isGenerating ?? this.isGenerating,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier()
      : super(
          ChatState(
            messages: [
              ChatMessageModel(
                id: 'm1',
                text: "Welcome back champion! I'm VinR, your growth partner. How are you feeling right now on Day 5 of your winning streak?",
                sender: MessageSender.ai,
                timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
              ),
            ],
          ),
        );

  void setPersona(String persona) {
    state = state.copyWith(persona: persona);
  }

  Future<void> sendMessage(String text, {bool isVoice = false}) async {
    final userMsg = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      sender: MessageSender.user,
      timestamp: DateTime.now(),
      isVoice: isVoice,
    );

    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isGenerating: true,
    );

    // Simulate AI Reflection response
    await Future.delayed(const Duration(milliseconds: 1200));

    final aiReply = _generateAiReply(text);
    final aiMsg = ChatMessageModel(
      id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
      text: aiReply,
      sender: MessageSender.ai,
      timestamp: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, aiMsg],
      isGenerating: false,
    );
  }

  String _generateAiReply(String prompt) {
    final lower = prompt.toLowerCase();
    if (lower.contains('anxious') || lower.contains('stress') || lower.contains('worried')) {
      return "I hear you. Anxiety is just energy looking for a constructive outlet. Let's take 3 deep box breaths together or try the 5-4-3-2-1 grounding exercise. You are fully in control.";
    } else if (lower.contains('happy') || lower.contains('great') || lower.contains('good')) {
      return "That's fantastic! Channeling high energy into your 21-day growth habit keeps the momentum strong. What's one victory you celebrated today?";
    } else {
      return "Every step forward counts. As your growth partner, I'm here to back your progress. Remember: champions aren't built in comfort zones!";
    }
  }

  void clearMessages() {
    state = state.copyWith(messages: []);
  }
}

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier();
});
