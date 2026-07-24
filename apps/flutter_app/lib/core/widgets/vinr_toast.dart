import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/vinr_colors.dart';

class VinRToast {
  static void show(
    BuildContext context, {
    required String message,
    IconData icon = LucideIcons.checkCircle2,
    Color iconColor = VinRColors.gold,
  }) {
    // Toast pop-up notifications removed per design preference
    return;
  }
}
