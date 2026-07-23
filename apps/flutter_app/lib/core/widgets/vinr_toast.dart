import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/theme_context.dart';
import '../theme/vinr_colors.dart';

class VinRToast {
  static void show(
    BuildContext context, {
    required String message,
    IconData icon = LucideIcons.checkCircle2,
    Color iconColor = VinRColors.gold,
  }) {
    final isLight = context.isLight;
    final bg = context.surfaceColor;
    final textColor = context.textColor;

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: bg,
        elevation: 6,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isLight ? const Color(0x1A000000) : VinRColors.borderGold,
            width: 1,
          ),
        ),
        content: Row(
          children: [
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: textColor,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
