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
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);
    final themeNotifier = ref.read(themeProvider.notifier);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 8),
                  Text('Settings & Preferences', style: VinRTypography.h2),
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
                    Text('Choose Theme', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(
                      'Switch between Midnight Gold dark mode and Warm Parchment light mode.',
                      style: VinRTypography.caption,
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
                title: 'ONBOARDING & IDENTITY',
                icon: LucideIcons.sparkles,
              ),

              GlassContainer(
                onTap: () => context.push('/onboarding'),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: context.goldMutedColor,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.compass, color: context.goldColor),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Custom Onboarding Wizard', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: context.textColor)),
                          Text('Customize your 9-step identity & focus preferences.', style: VinRTypography.caption.copyWith(color: context.textMutedColor)),
                        ],
                      ),
                    ),
                    Icon(LucideIcons.chevronRight, color: context.textMutedColor, size: 18),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'NOTIFICATIONS',
                icon: LucideIcons.bell,
                iconColor: VinRColors.emerald,
              ),

              GlassContainer(
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(LucideIcons.bell, color: VinRColors.emerald),
                  title: Text('Daily Reminder & Streak Nudges', style: VinRTypography.body),
                  subtitle: const Text('Get notified for daily reflections.', style: TextStyle(color: VinRColors.textMuted, fontSize: 12)),
                  trailing: Switch(
                    value: true,
                    onChanged: (_) {},
                    activeThumbColor: VinRColors.emerald,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              const SectionHeader(
                title: 'ACCOUNT',
                icon: LucideIcons.user,
                iconColor: VinRColors.crimson,
              ),

              GlassContainer(
                onTap: () async {
                  await ref.read(authProvider.notifier).signOut();
                  if (context.mounted) {
                    context.go('/welcome');
                  }
                },
                child: Row(
                  children: [
                    const Icon(LucideIcons.logOut, color: VinRColors.crimson),
                    const SizedBox(width: 14),
                    Text('Sign Out', style: VinRTypography.body.copyWith(color: VinRColors.crimson, fontWeight: FontWeight.bold)),
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
    final isLight = Theme.of(context).brightness == Brightness.light;
    final selectedBg = isLight ? const Color(0xFFB8832A) : VinRColors.gold;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? selectedBg : (isLight ? const Color(0xFFF5F2EC) : VinRColors.surface),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? selectedBg : (isLight ? const Color(0x22000000) : VinRColors.border),
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: isSelected ? Colors.black : (isLight ? Colors.black87 : Colors.white)),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.black : (isLight ? Colors.black87 : Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
