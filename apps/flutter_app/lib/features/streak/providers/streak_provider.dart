import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/streak_model.dart';

class StreakNotifier extends StateNotifier<StreakStateModel> {
  StreakNotifier()
      : super(
          StreakStateModel(
            currentStreak: 5,
            longestStreak: 12,
            globalStreak: 12,
            totalDaysCompleted: 5,
            isCompletedToday: false,
            dailyCompletions: [
              DailyCompletion(
                id: 'cmp_1',
                dayNumber: 1,
                completedAt: DateTime.now().subtract(const Duration(days: 4)),
                reflectionNote: 'Started the winning streak!',
                moodRating: 4.5,
              ),
              DailyCompletion(
                id: 'cmp_2',
                dayNumber: 2,
                completedAt: DateTime.now().subtract(const Duration(days: 3)),
                reflectionNote: 'Great breathing session.',
                moodRating: 5.0,
              ),
            ],
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

  void reset() {
    state = StreakStateModel();
  }
}

final streakProvider = StateNotifierProvider<StreakNotifier, StreakStateModel>((ref) {
  return StreakNotifier();
});
