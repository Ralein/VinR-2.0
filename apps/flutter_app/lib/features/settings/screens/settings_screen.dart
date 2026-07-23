import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Settings & Preferences', style: VinRTypography.h3),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text('PREFERENCES', style: VinRTypography.label),
              const SizedBox(height: 12),
              GlassContainer(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(LucideIcons.bell, color: VinRColors.goldLight),
                      title: Text('Notifications & Reminders', style: VinRTypography.body),
                      trailing: const Icon(Icons.arrow_forward_ios_rounded, color: VinRColors.textMuted, size: 16),
                    ),
                    const Divider(color: VinRColors.border),
                    ListTile(
                      leading: const Icon(LucideIcons.moon, color: VinRColors.goldLight),
                      title: Text('Theme Mode', style: VinRTypography.body),
                      subtitle: const Text('Midnight Gold System', style: TextStyle(color: VinRColors.textMuted, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text('ACCOUNT', style: VinRTypography.label),
              const SizedBox(height: 12),
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
                    const SizedBox(width: 16),
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
}
