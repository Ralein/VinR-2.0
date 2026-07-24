import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/repositories/streak_repository.dart';
import '../models/streak_model.dart';

class StreakNotifier extends StateNotifier<StreakStateModel> {
  final StreakRepository _repository = StreakRepository();
  String? _activeStreakId;

  StreakNotifier()
      : super(
          StreakStateModel(
            currentStreak: 0,
            longestStreak: 0,
            globalStreak: 0,
            totalDaysCompleted: 0,
            isCompletedToday: false,
            isWinner: false,
            dailyCompletions: const [],
          ),
        ) {
    _initStreak();
  }

  Future<void> _initStreak() async {
    final streakData = await _repository.getActiveStreak();
    if (streakData != null) {
      _activeStreakId = streakData['id'] as String?;
      final current = streakData['current_streak'] as int? ?? 0;
      final longest = streakData['longest_streak'] as int? ?? 0;
      final global = streakData['global_streak'] as int? ?? current;
      final total = streakData['total_days_completed'] as int? ?? current;
      final isDone = streakData['is_completed_today'] as bool? ?? false;

      state = state.copyWith(
        currentStreak: current,
        longestStreak: longest,
        globalStreak: global,
        totalDaysCompleted: total,
        isCompletedToday: isDone,
        isWinner: total >= 21,
      );
    }
  }

  Future<void> markDayComplete({String? note, double? mood}) async {
    final nextDay = state.totalDaysCompleted + 1;
    final completion = DailyCompletion(
      id: 'cmp_${DateTime.now().millisecondsSinceEpoch}',
      dayNumber: nextDay,
      completedAt: DateTime.now(),
      reflectionNote: note,
      moodRating: mood,
    );

    final newStreak = state.currentStreak + 1;
    final isWinner = nextDay >= 21;

    state = state.copyWith(
      currentStreak: newStreak,
      globalStreak: newStreak > state.globalStreak ? newStreak : state.globalStreak,
      totalDaysCompleted: nextDay,
      dailyCompletions: [...state.dailyCompletions, completion],
      isCompletedToday: true,
      isWinner: isWinner,
    );

    if (_activeStreakId != null) {
      await _repository.completeDay(
        _activeStreakId!,
        reflectionNote: note,
        moodRating: mood?.toInt(),
      );
    }
  }

  void checkInToday() {
    if (!state.isCompletedToday) {
      markDayComplete();
    }
  }

  void resetStreak() {
    state = StreakStateModel(
      currentStreak: 0,
      longestStreak: 0,
      globalStreak: 0,
      totalDaysCompleted: 0,
      isCompletedToday: false,
      isWinner: false,
      dailyCompletions: const [],
    );
  }
}

final streakProvider = StateNotifierProvider<StreakNotifier, StreakStateModel>((ref) {
  return StreakNotifier();
});
