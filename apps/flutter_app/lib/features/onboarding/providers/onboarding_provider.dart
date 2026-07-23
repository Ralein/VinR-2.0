import 'package:flutter_riverpod/flutter_riverpod.dart';

class OnboardingState {
  final String name;
  final String age;
  final String? avatar;
  final List<String> focusAreas;
  final String identity;
  final String frequency;
  final bool notificationsEnabled;
  final String reminderTime;
  final int currentStep;
  final bool isCompleted;

  OnboardingState({
    this.name = '',
    this.age = '',
    this.avatar,
    this.focusAreas = const [],
    this.identity = '',
    this.frequency = 'Daily',
    this.notificationsEnabled = true,
    this.reminderTime = '08:00',
    this.currentStep = 1,
    this.isCompleted = false,
  });

  OnboardingState copyWith({
    String? name,
    String? age,
    String? avatar,
    List<String>? focusAreas,
    String? identity,
    String? frequency,
    bool? notificationsEnabled,
    String? reminderTime,
    int? currentStep,
    bool? isCompleted,
  }) {
    return OnboardingState(
      name: name ?? this.name,
      age: age ?? this.age,
      avatar: avatar ?? this.avatar,
      focusAreas: focusAreas ?? this.focusAreas,
      identity: identity ?? this.identity,
      frequency: frequency ?? this.frequency,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      reminderTime: reminderTime ?? this.reminderTime,
      currentStep: currentStep ?? this.currentStep,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

class OnboardingNotifier extends StateNotifier<OnboardingState> {
  OnboardingNotifier() : super(OnboardingState());

  void setName(String name) => state = state.copyWith(name: name);
  void setAge(String age) => state = state.copyWith(age: age);
  void setAvatar(String avatar) => state = state.copyWith(avatar: avatar);

  void toggleFocusArea(String area) {
    final list = List<String>.from(state.focusAreas);
    if (list.contains(area)) {
      list.remove(area);
    } else {
      list.add(area);
    }
    state = state.copyWith(focusAreas: list);
  }

  void setIdentity(String identity) => state = state.copyWith(identity: identity);
  void setFrequency(String frequency) => state = state.copyWith(frequency: frequency);
  void setNotificationsEnabled(bool enabled) => state = state.copyWith(notificationsEnabled: enabled);
  void setReminderTime(String time) => state = state.copyWith(reminderTime: time);

  void setStep(int step) => state = state.copyWith(currentStep: step);
  void nextStep() {
    if (state.currentStep < 9) {
      state = state.copyWith(currentStep: state.currentStep + 1);
    }
  }

  void prevStep() {
    if (state.currentStep > 1) {
      state = state.copyWith(currentStep: state.currentStep - 1);
    }
  }

  void complete() => state = state.copyWith(isCompleted: true);
}

final onboardingProvider =
    StateNotifierProvider<OnboardingNotifier, OnboardingState>((ref) {
  return OnboardingNotifier();
});
