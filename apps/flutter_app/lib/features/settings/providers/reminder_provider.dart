import 'package:flutter_riverpod/flutter_riverpod.dart';

class ReminderState {
  final bool isEnabled;
  final String reminderTime;
  final String frequency;
  final DateTime? lastNotifiedAt;

  ReminderState({
    this.isEnabled = true,
    this.reminderTime = '08:00 AM',
    this.frequency = 'Daily',
    this.lastNotifiedAt,
  });

  ReminderState copyWith({
    bool? isEnabled,
    String? reminderTime,
    String? frequency,
    DateTime? lastNotifiedAt,
  }) {
    return ReminderState(
      isEnabled: isEnabled ?? this.isEnabled,
      reminderTime: reminderTime ?? this.reminderTime,
      frequency: frequency ?? this.frequency,
      lastNotifiedAt: lastNotifiedAt ?? this.lastNotifiedAt,
    );
  }
}

class ReminderNotifier extends StateNotifier<ReminderState> {
  ReminderNotifier() : super(ReminderState());

  void toggleReminder(bool enabled) {
    state = state.copyWith(isEnabled: enabled);
  }

  void setReminderTime(String timeStr) {
    state = state.copyWith(reminderTime: timeStr);
  }

  void setFrequency(String freq) {
    state = state.copyWith(frequency: freq);
  }

  void recordNotificationSent() {
    state = state.copyWith(lastNotifiedAt: DateTime.now());
  }
}

final reminderProvider =
    StateNotifierProvider<ReminderNotifier, ReminderState>((ref) {
  return ReminderNotifier();
});
