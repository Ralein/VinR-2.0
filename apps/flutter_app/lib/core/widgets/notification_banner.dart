import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/notification_service.dart';
import '../theme/theme_context.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';
import '../../features/streak/providers/streak_provider.dart';
import 'app_animations.dart';
import 'vinr_toast.dart';

class NotificationBannerOverlay extends ConsumerWidget {
  const NotificationBannerOverlay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationState = ref.watch(notificationServiceProvider);
    final activeNotification = notificationState.activeBannerNotification;

    if (activeNotification == null) {
      return const SizedBox.shrink();
    }

    return Positioned(
      top: MediaQuery.of(context).padding.top + 8,
      left: 16,
      right: 16,
      child: FadeSlideTransition(
        duration: const Duration(milliseconds: 400),
        beginOffset: const Offset(0.0, -0.5),
        child: Material(
          elevation: 12,
          shadowColor: VinRColors.gold.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(20),
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  context.surfaceColor.withValues(alpha: 0.96),
                  context.elevatedColor.withValues(alpha: 0.98),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: context.goldColor, width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: VinRColors.gold.withValues(alpha: 0.25),
                  blurRadius: 20,
                  spreadRadius: 2,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AnimatedPulse(
                      duration: const Duration(milliseconds: 1400),
                      minScale: 0.92,
                      maxScale: 1.1,
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: VinRColors.gold.withValues(alpha: 0.2),
                          border: Border.all(color: context.goldColor, width: 1.5),
                        ),
                        child: const Icon(
                          LucideIcons.flame,
                          color: VinRColors.goldLight,
                          size: 22,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            activeNotification.title,
                            style: VinRTypography.body.copyWith(
                              fontWeight: FontWeight.bold,
                              color: context.textColor,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            activeNotification.body,
                            style: VinRTypography.caption.copyWith(
                              color: context.textMutedColor,
                              fontSize: 12,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        ref.read(notificationServiceProvider.notifier).dismissBanner();
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: Icon(
                          LucideIcons.x,
                          size: 18,
                          color: context.textMutedColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () {
                        ref.read(notificationServiceProvider.notifier).dismissBanner();
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'Dismiss',
                        style: VinRTypography.caption.copyWith(
                          color: context.textMutedColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.read(streakProvider.notifier).checkInToday();
                        ref.read(notificationServiceProvider.notifier).dismissBanner();
                        VinRToast.show(
                          context,
                          message: 'Streak Recorded! Great job staying consistent!',
                          icon: LucideIcons.flame,
                          iconColor: VinRColors.gold,
                        );
                      },
                      icon: const Icon(LucideIcons.checkCircle2, size: 15, color: Colors.black),
                      label: const Text(
                        'Check In Now',
                        style: TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.goldColor,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        elevation: 4,
                        shadowColor: context.goldColor.withValues(alpha: 0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
