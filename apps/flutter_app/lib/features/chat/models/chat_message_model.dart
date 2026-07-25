enum MessageSender { user, ai, system }

class ChatMessageModel {
  final String id;
  final String text;
  final MessageSender sender;
  final DateTime timestamp;
  final String? audioUri;
  final bool isVoice;
  final int? duration;
  final bool isRead;
  final List<String> reactions;

  ChatMessageModel({
    required this.id,
    required this.text,
    required this.sender,
    required this.timestamp,
    this.audioUri,
    this.isVoice = false,
    this.duration,
    this.isRead = true,
    this.reactions = const [],
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    final senderStr = json['sender'] as String? ?? 'user';
    MessageSender senderEnum = MessageSender.user;
    if (senderStr == 'ai' || senderStr == 'assistant') {
      senderEnum = MessageSender.ai;
    } else if (senderStr == 'system') {
      senderEnum = MessageSender.system;
    }

    return ChatMessageModel(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      sender: senderEnum,
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      audioUri: json['audioUri'] as String?,
      isVoice: json['isVoice'] as bool? ?? false,
      duration: json['duration'] as int?,
      isRead: json['isRead'] as bool? ?? true,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    String s = 'user';
    if (sender == MessageSender.ai) s = 'ai';
    if (sender == MessageSender.system) s = 'system';

    return {
      'id': id,
      'text': text,
      'sender': s,
      'timestamp': timestamp.toIso8601String(),
      'audioUri': audioUri,
      'isVoice': isVoice,
      'duration': duration,
      'isRead': isRead,
      'reactions': reactions,
    };
  }
}
