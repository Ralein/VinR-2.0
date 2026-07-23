enum MessageSender { user, ai }

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
    return ChatMessageModel(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      sender: (json['sender'] == 'ai') ? MessageSender.ai : MessageSender.user,
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
    return {
      'id': id,
      'text': text,
      'sender': sender == MessageSender.ai ? 'ai' : 'user',
      'timestamp': timestamp.toIso8601String(),
      'audioUri': audioUri,
      'isVoice': isVoice,
      'duration': duration,
      'isRead': isRead,
      'reactions': reactions,
    };
  }
}
