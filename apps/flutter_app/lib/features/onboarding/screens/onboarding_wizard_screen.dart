import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/onboarding_provider.dart';

class OnboardingWizardScreen extends ConsumerStatefulWidget {
  const OnboardingWizardScreen({super.key});

  @override
  ConsumerState<OnboardingWizardScreen> createState() => _OnboardingWizardScreenState();
}

class _OnboardingWizardScreenState extends ConsumerState<OnboardingWizardScreen> {
  final _nameTextController = TextEditingController();

  @override
  void dispose() {
    _nameTextController.dispose();
    super.dispose();
  }

  Widget _buildStepContent(BuildContext context, OnboardingState state, OnboardingNotifier notifier) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    switch (state.currentStep) {
      case 1:
        return Column(
          children: [
            Icon(LucideIcons.sparkles, color: activeGold, size: 64),
            const SizedBox(height: 24),
            Text('Welcome to VinR 2.0', style: VinRTypography.h2.copyWith(color: primaryTextColor), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Text(
              'Your personalized 21-day winning streak platform. Over the next few steps, we will customize your experience to fit your growth goals.',
              style: VinRTypography.bodySm.copyWith(color: mutedTextColor, height: 1.4),
              textAlign: TextAlign.center,
            ),
          ],
        );

      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('What should we call you?', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('Your growth partner will address you by this name.', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 24),
            TextField(
              controller: _nameTextController,
              onChanged: notifier.setName,
              style: TextStyle(color: primaryTextColor),
              decoration: InputDecoration(
                hintText: 'Enter your preferred name',
                hintStyle: TextStyle(color: mutedTextColor),
                prefixIcon: Icon(LucideIcons.user, color: mutedTextColor),
              ),
            ),
          ],
        );

      case 3:
        final ageGroups = ['18-24', '25-34', '35-44', '45+'];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select your age range', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('Helps tailor reflection algorithms and pacing.', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 24),
            ...ageGroups.map((age) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    color: state.age == age ? context.goldMutedColor : null,
                    border: Border.all(
                      color: state.age == age ? activeGold : context.borderColor,
                    ),
                    onTap: () => notifier.setAge(age),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(age, style: VinRTypography.body.copyWith(color: primaryTextColor)),
                        if (state.age == age)
                          Icon(LucideIcons.checkCircle2, color: activeGold),
                      ],
                    ),
                  ),
                )),
          ],
        );

      case 4:
        final avatars = ['VinR Classic', 'Zen Master', 'Stoic Guardian', 'Solar Spark'];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Choose your Companion Avatar', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('Select your AI partner style.', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 24),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: avatars.map((av) {
                final isSelected = state.avatar == av;
                return GlassContainer(
                  color: isSelected ? context.goldMutedColor : null,
                  border: Border.all(color: isSelected ? activeGold : context.borderColor),
                  onTap: () => notifier.setAvatar(av),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isSelected ? LucideIcons.shieldCheck : LucideIcons.bot,
                        color: isSelected ? activeGold : mutedTextColor,
                        size: 36,
                      ),
                      const SizedBox(height: 12),
                      Text(av, style: VinRTypography.bodySm.copyWith(color: primaryTextColor, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        );

      case 5:
        final areas = [
          'Anxiety & Stress Management',
          '21-Day Habit Consistency',
          'Deep Focus & Discipline',
          'Better Sleep & Wind-Down',
          'Emotional Balance'
        ];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select Focus Areas', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('Select all topics that matter to you.', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 20),
            ...areas.map((area) {
              final isSel = state.focusAreas.contains(area);
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GlassContainer(
                  color: isSel ? context.goldMutedColor : null,
                  border: Border.all(color: isSel ? activeGold : context.borderColor),
                  onTap: () => notifier.toggleFocusArea(area),
                  child: Row(
                    children: [
                      Icon(
                        isSel ? LucideIcons.checkSquare : LucideIcons.square,
                        color: isSel ? activeGold : mutedTextColor,
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(area, style: VinRTypography.bodySm.copyWith(color: primaryTextColor))),
                    ],
                  ),
                ),
              );
            }),
          ],
        );

      case 6:
        final identities = ['Achiever', 'Peace Seeker', 'Stoic Mind', 'Explorer'];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Choose Your Identity', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('How do you approach personal growth?', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 20),
            ...identities.map((id) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    color: state.identity == id ? context.goldMutedColor : null,
                    border: Border.all(color: state.identity == id ? activeGold : context.borderColor),
                    onTap: () => notifier.setIdentity(id),
                    child: Row(
                      children: [
                        Icon(LucideIcons.compass, color: activeGold),
                        const SizedBox(width: 12),
                        Text(id, style: VinRTypography.body.copyWith(color: primaryTextColor)),
                      ],
                    ),
                  ),
                )),
          ],
        );

      case 7:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Daily Commitment', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('How many minutes a day can you dedicate to your streak?', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 24),
            ...['5 mins / day (Quick)', '10 mins / day (Standard)', '20 mins / day (Deep)'].map((freq) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    color: state.frequency == freq ? context.goldMutedColor : null,
                    border: Border.all(color: state.frequency == freq ? activeGold : context.borderColor),
                    onTap: () => notifier.setFrequency(freq),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(freq, style: VinRTypography.body.copyWith(color: primaryTextColor)),
                        if (state.frequency == freq)
                          Icon(LucideIcons.checkCircle2, color: activeGold),
                      ],
                    ),
                  ),
                )),
          ],
        );

      case 8:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Daily Reminders', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
            const SizedBox(height: 8),
            Text('Stay consistent on your 21-day winning journey.', style: VinRTypography.bodySm.copyWith(color: mutedTextColor)),
            const SizedBox(height: 24),
            GlassContainer(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Enable Notifications', style: VinRTypography.body.copyWith(color: primaryTextColor)),
                  Switch(
                    value: state.notificationsEnabled,
                    onChanged: notifier.setNotificationsEnabled,
                    activeThumbColor: activeGold,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text('PREFERRED REMINDER TIME', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GlassContainer(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(state.reminderTime, style: VinRTypography.body.copyWith(color: primaryTextColor)),
                  Icon(LucideIcons.clock, color: activeGold),
                ],
              ),
            ),
          ],
        );

      case 9:
        return Column(
          children: [
            Icon(LucideIcons.trophy, color: activeGold, size: 72),
            const SizedBox(height: 24),
            Text('You Are Ready To Win!', style: VinRTypography.h2.copyWith(color: primaryTextColor), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Text(
              'Your custom 21-day emotional growth roadmap is built and ready.',
              style: VinRTypography.bodySm.copyWith(color: mutedTextColor, height: 1.4),
              textAlign: TextAlign.center,
            ),
          ],
        );

      default:
        return const SizedBox();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (state.currentStep > 1)
                      IconButton(
                        icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor),
                        onPressed: notifier.prevStep,
                      )
                    else
                      const SizedBox(width: 48),
                    Text('Step ${state.currentStep} of 9', style: VinRTypography.label.copyWith(color: mutedTextColor)),
                    const SizedBox(width: 48),
                  ],
                ),
                const SizedBox(height: 16),
                LinearProgressIndicator(
                  value: state.currentStep / 9.0,
                  backgroundColor: context.isLight ? const Color(0xFFEDE9E1) : VinRColors.surface,
                  valueColor: AlwaysStoppedAnimation<Color>(activeGold),
                ),
                const SizedBox(height: 32),
                Expanded(
                  child: SingleChildScrollView(
                    child: _buildStepContent(context, state, notifier),
                  ),
                ),
                GoldButton(
                  text: state.currentStep == 9 ? 'Start My 21-Day Streak' : 'Continue →',
                  onPressed: () {
                    if (state.currentStep == 9) {
                      notifier.complete();
                      ref.read(authProvider.notifier).completeOnboarding();
                      context.go('/home');
                    } else {
                      notifier.nextStep();
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
