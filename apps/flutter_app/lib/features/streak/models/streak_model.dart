class DailyCompletion {
  final String id;
  final int dayNumber;
  final DateTime completedAt;
  final String? reflectionNote;
  final double? moodRating;

  DailyCompletion({
    required this.id,
    required this.dayNumber,
    required this.completedAt,
    this.reflectionNote,
    this.moodRating,
  });

  factory DailyCompletion.fromJson(Map<String, dynamic> json) {
    return DailyCompletion(
      id: json['id'] as String? ?? '',
      dayNumber: json['dayNumber'] as int? ?? 1,
      completedAt: DateTime.tryParse(json['completedAt'] ?? '') ?? DateTime.now(),
      reflectionNote: json['reflectionNote'] as String?,
      moodRating: (json['moodRating'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'dayNumber': dayNumber,
      'completedAt': completedAt.toIso8601String(),
      'reflectionNote': reflectionNote,
      'moodRating': moodRating,
    };
  }
}

class StreakStateModel {
  final String? activeStreakId;
  final int currentStreak;
  final int longestStreak;
  final int globalStreak;
  final int totalDaysCompleted;
  final DateTime? startDate;
  final List<DailyCompletion> dailyCompletions;
  final bool isCompletedToday;
  final String? milestone;
  final bool isWinner;

  StreakStateModel({
    this.activeStreakId,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.globalStreak = 0,
    this.totalDaysCompleted = 0,
    this.startDate,
    this.dailyCompletions = const [],
    this.isCompletedToday = false,
    this.milestone,
    this.isWinner = false,
  });

  StreakStateModel copyWith({
    String? activeStreakId,
    int? currentStreak,
    int? longestStreak,
    int? globalStreak,
    int? totalDaysCompleted,
    DateTime? startDate,
    List<DailyCompletion>? dailyCompletions,
    bool? isCompletedToday,
    String? milestone,
    bool? isWinner,
  }) {
    return StreakStateModel(
      activeStreakId: activeStreakId ?? this.activeStreakId,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      globalStreak: globalStreak ?? this.globalStreak,
      totalDaysCompleted: totalDaysCompleted ?? this.totalDaysCompleted,
      startDate: startDate ?? this.startDate,
      dailyCompletions: dailyCompletions ?? this.dailyCompletions,
      isCompletedToday: isCompletedToday ?? this.isCompletedToday,
      milestone: milestone ?? this.milestone,
      isWinner: isWinner ?? this.isWinner,
    );
  }
}
