import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../auth/providers/auth_provider.dart';
import '../../onboarding/providers/onboarding_provider.dart';
import '../providers/reminder_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  void _showEditPreferencesModal(BuildContext context, WidgetRef ref) {
    final onboardingState = ref.read(onboardingProvider);
    final notifier = ref.read(onboardingProvider.notifier);

    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: context.textGhostColor.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Edit Growth Preferences', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                Text('Update your AI companion style and pacing.', style: VinRTypography.caption.copyWith(color: mutedTextColor)),
                const SizedBox(height: 20),

                // Companion Avatar Preference
                Text('COMPANION AVATAR', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ['VinR Coach', 'Zen Master', 'Stoic Guardian', 'Solar Spark'].map((avatar) {
                    final isSel = onboardingState.avatar == avatar;
                    return ChoiceChip(
                      selected: isSel,
                      label: Text(avatar, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                      selectedColor: activeGold,
                      backgroundColor: context.surfaceColor,
                      onSelected: (_) => notifier.setAvatar(avatar),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Daily Pacing Preference
                Text('DAILY PACING', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ['5 mins / day', '10 mins / day', '20 mins / day'].map((freq) {
                    final isSel = onboardingState.frequency.contains(freq.split(' ').first);
                    return ChoiceChip(
                      selected: isSel,
                      label: Text(freq, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                      selectedColor: activeGold,
                      backgroundColor: context.surfaceColor,
                      onSelected: (_) => notifier.setFrequency('$freq (Standard)'),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    VinRToast.show(
                      context,
                      message: 'Preferences Updated Successfully',
                      icon: LucideIcons.checkCircle2,
                      iconColor: activeGold,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: activeGold,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Save Preferences', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);
    final authNotifier = ref.read(authProvider.notifier);
    final reminderState = ref.watch(reminderProvider);
    final reminderNotifier = ref.read(reminderProvider.notifier);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            children: [
              Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back_ios_new_rounded, color: context.textColor),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 8),
                  Text('Settings & Preferences', style: VinRTypography.h2.copyWith(color: context.textColor)),
                ],
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'APPEARANCE & THEME',
                icon: LucideIcons.palette,
                iconColor: VinRColors.goldLight,
              ),

              GlassContainer(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Choose Theme', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor)),
                    const SizedBox(height: 4),
                    Text(
                      'Switch between Midnight Gold dark mode and Warm Parchment light mode.',
                      style: VinRTypography.caption.copyWith(color: context.textMutedColor),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildThemeOption(
                          context: context,
                          label: 'Dark',
                          icon: LucideIcons.moon,
                          isSelected: themeMode == ThemeMode.dark,
                          onTap: () => themeNotifier.setThemeMode(ThemeMode.dark),
                        ),
                        const SizedBox(width: 8),
                        _buildThemeOption(
                          context: context,
                          label: 'Light',
                          icon: LucideIcons.sun,
                          isSelected: themeMode == ThemeMode.light,
                          onTap: () => themeNotifier.setThemeMode(ThemeMode.light),
                        ),
                        const SizedBox(width: 8),
                        _buildThemeOption(
                          context: context,
                          label: 'System',
                          icon: LucideIcons.laptop,
                          isSelected: themeMode == ThemeMode.system,
                          onTap: () => themeNotifier.setThemeMode(ThemeMode.system),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'GROWTH PREFERENCES',
                icon: LucideIcons.sliders,
              ),

              GlassContainer(
                onTap: () => _showEditPreferencesModal(context, ref),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: context.goldMutedColor,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.userCheck, color: context.goldColor),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Edit Growth Preferences', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor)),
                          Text('Update companion avatar, focus areas & pacing.', style: VinRTypography.caption.copyWith(color: context.textMutedColor)),
                        ],
                      ),
                    ),
                    Icon(LucideIcons.chevronRight, color: context.textMutedColor, size: 18),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // DAILY STREAK REMINDERS & NOTIFICATIONS
              const SectionHeader(
                title: 'DAILY STREAK REMINDERS',
                icon: LucideIcons.bell,
                iconColor: VinRColors.emerald,
              ),

              GlassContainer(
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: const BoxDecoration(
                                color: VinRColors.emeraldGlow,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(LucideIcons.bell, color: VinRColors.emerald),
                            ),
                            const SizedBox(width: 14),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Daily Streak Reminder', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor)),
                                Text('Receive daily check-in nudge', style: VinRTypography.caption.copyWith(color: context.textMutedColor)),
                              ],
                            ),
                          ],
                        ),
                        Switch(
                          value: reminderState.isEnabled,
                          onChanged: (val) {
                            reminderNotifier.toggleReminder(val);
                            VinRToast.show(
                              context,
                              message: val ? 'Daily streak reminder activated' : 'Reminders paused',
                              icon: val ? LucideIcons.bell : LucideIcons.bellOff,
                              iconColor: val ? VinRColors.emerald : context.textMutedColor,
                            );
                          },
                          activeThumbColor: context.goldColor,
                        ),
                      ],
                    ),
                    if (reminderState.isEnabled) ...[
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Reminder Time', style: TextStyle(color: context.textColor, fontWeight: FontWeight.w600)),
                          Wrap(
                            spacing: 6,
                            children: ['08:00 AM', '01:00 PM', '08:00 PM'].map((t) {
                              final isSel = reminderState.reminderTime == t;
                              return ChoiceChip(
                                selected: isSel,
                                label: Text(t, style: TextStyle(color: isSel ? Colors.black : context.textColor, fontSize: 11, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                                selectedColor: context.goldColor,
                                backgroundColor: context.surfaceColor,
                                onSelected: (_) => reminderNotifier.setReminderTime(t),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        icon: const Icon(LucideIcons.send, size: 14),
                        label: const Text('Test Live Notification Alert', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          reminderNotifier.recordNotificationSent();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: context.surfaceColor,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: context.goldColor)),
                              content: Row(
                                children: [
                                  Icon(LucideIcons.bellRing, color: context.goldColor),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text('VinR Daily Streak Reminder (${reminderState.reminderTime})', style: TextStyle(color: context.textColor, fontWeight: FontWeight.bold, fontSize: 13)),
                                        Text('Time to record your daily win & keep your 21-day streak alive!', style: TextStyle(color: context.textMutedColor, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: context.goldColor,
                          side: BorderSide(color: context.goldColor),
                          minimumSize: const Size.fromHeight(40),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'ACCOUNT & SECURITY',
                icon: LucideIcons.shield,
                iconColor: VinRColors.crimson,
              ),

              GlassContainer(
                onTap: () async {
                  await authNotifier.signOut();
                  if (context.mounted) {
                    context.go('/welcome');
                  }
                },
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: VinRColors.crimsonGlow,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(LucideIcons.logOut, color: VinRColors.crimson),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Sign Out',
                        style: VinRTypography.body.copyWith(
                          color: VinRColors.crimson,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildThemeOption({
    required BuildContext context,
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final activeGold = context.goldColor;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? activeGold.withValues(alpha: 0.15) : context.surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? activeGold : context.borderColor,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: isSelected ? activeGold : context.textMutedColor),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? activeGold : context.textColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
