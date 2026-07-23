import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/streak_model.dart';

class StreakNotifier extends StateNotifier<StreakStateModel> {
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
        );

  void markDayComplete({String? note, double? mood}) {
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
