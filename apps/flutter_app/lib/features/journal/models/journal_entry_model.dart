class JournalEntryModel {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;
  final List<String> moodTags;
  final String? audioPath;
  final String? aiReflectionSummary;

  JournalEntryModel({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    this.moodTags = const [],
    this.audioPath,
    this.aiReflectionSummary,
  });
}
