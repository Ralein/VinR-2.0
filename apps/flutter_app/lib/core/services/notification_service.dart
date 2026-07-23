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
  final List<ScheduledNotification> scheduledReminders;
  final ScheduledNotification? activeBannerNotification;

  NotificationServiceState({
    this.permissionsGranted = true,
    this.scheduledReminders = const [],
    this.activeBannerNotification,
  });

  NotificationServiceState copyWith({
    bool? permissionsGranted,
    List<ScheduledNotification>? scheduledReminders,
    ScheduledNotification? activeBannerNotification,
  }) {
    return NotificationServiceState(
      permissionsGranted: permissionsGranted ?? this.permissionsGranted,
      scheduledReminders: scheduledReminders ?? this.scheduledReminders,
      activeBannerNotification: activeBannerNotification,
    );
  }
}

class NotificationServiceNotifier extends StateNotifier<NotificationServiceState> {
  Timer? _scheduleTimer;

  NotificationServiceNotifier() : super(NotificationServiceState());

  void requestPermissions() {
    state = state.copyWith(permissionsGranted: true);
  }

  void scheduleDailyStreakReminder(String timeStr) {
    final now = DateTime.now();
    final reminder = ScheduledNotification(
      id: 'streak_reminder_${now.millisecondsSinceEpoch}',
      title: '🔥 VinR Daily Streak Reminder',
      body: 'Time to log your daily win and keep your 21-day winning streak alive!',
      time: timeStr,
      scheduledFor: now.add(const Duration(minutes: 1)),
    );

    state = state.copyWith(
      scheduledReminders: [...state.scheduledReminders, reminder],
    );

    _scheduleTimer?.cancel();
    _scheduleTimer = Timer(const Duration(seconds: 3), () {
      triggerBannerNotification(reminder);
    });
  }

  void triggerBannerNotification(ScheduledNotification notification) {
    state = state.copyWith(activeBannerNotification: notification);
  }

  void dismissBanner() {
    state = NotificationServiceState(
      permissionsGranted: state.permissionsGranted,
      scheduledReminders: state.scheduledReminders,
      activeBannerNotification: null,
    );
  }
}

final notificationServiceProvider =
    StateNotifierProvider<NotificationServiceNotifier, NotificationServiceState>((ref) {
  return NotificationServiceNotifier();
});
