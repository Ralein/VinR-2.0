import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ScheduledNotification {
  final String id;
  final String title;
  final String body;
  final String time;
  final DateTime scheduledFor;

  ScheduledNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.scheduledFor,
  });
}

class NotificationServiceState {
  final bool permissionsGranted;
  final bool isReminderEnabled;
  final String scheduledTime;
  final List<ScheduledNotification> scheduledReminders;
  final ScheduledNotification? activeBannerNotification;

  NotificationServiceState({
    this.permissionsGranted = true,
    this.isReminderEnabled = true,
    this.scheduledTime = '08:00 AM',
    this.scheduledReminders = const [],
    this.activeBannerNotification,
  });

  NotificationServiceState copyWith({
    bool? permissionsGranted,
    bool? isReminderEnabled,
    String? scheduledTime,
    List<ScheduledNotification>? scheduledReminders,
    ScheduledNotification? activeBannerNotification,
    bool clearBanner = false,
  }) {
    return NotificationServiceState(
      permissionsGranted: permissionsGranted ?? this.permissionsGranted,
      isReminderEnabled: isReminderEnabled ?? this.isReminderEnabled,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      scheduledReminders: scheduledReminders ?? this.scheduledReminders,
      activeBannerNotification: clearBanner
          ? null
          : (activeBannerNotification ?? this.activeBannerNotification),
    );
  }
}

class NotificationServiceNotifier extends StateNotifier<NotificationServiceState> {
  Timer? _scheduleTimer;

  NotificationServiceNotifier() : super(NotificationServiceState());

  void requestPermissions() {
    state = state.copyWith(permissionsGranted: true);
  }

  void scheduleDailyStreakReminder(String timeStr, {bool triggerImmediately = true}) {
    final now = DateTime.now();
    final reminder = ScheduledNotification(
      id: 'streak_reminder_${now.millisecondsSinceEpoch}',
      title: 'VinR Daily Streak Reminder',
      body: 'Keep your 21-day winning streak alive! Tap to check in today.',
      time: timeStr,
      scheduledFor: now.add(const Duration(seconds: 2)),
    );

    state = state.copyWith(
      isReminderEnabled: true,
      scheduledTime: timeStr,
      scheduledReminders: [...state.scheduledReminders, reminder],
    );

    _scheduleTimer?.cancel();
    if (triggerImmediately) {
      _scheduleTimer = Timer(const Duration(milliseconds: 600), () {
        triggerBannerNotification(reminder);
      });
    }
  }

  void cancelReminders() {
    _scheduleTimer?.cancel();
    state = state.copyWith(
      isReminderEnabled: false,
      scheduledReminders: const [],
      clearBanner: true,
    );
  }

  void triggerBannerNotification(ScheduledNotification notification) {
    state = state.copyWith(activeBannerNotification: notification);
  }

  void dismissBanner() {
    state = state.copyWith(clearBanner: true);
  }
}

final notificationServiceProvider =
    StateNotifierProvider<NotificationServiceNotifier, NotificationServiceState>((ref) {
  return NotificationServiceNotifier();
});
