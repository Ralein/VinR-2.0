import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/vinr_colors.dart';
import '../theme/vinr_typography.dart';

class MainNavigationShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainNavigationShell({
    super.key,
    required this.navigationShell,
  });

  void _onItemTapped(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = navigationShell.currentIndex;
    final isLight = Theme.of(context).brightness == Brightness.light;

    final barBg = isLight ? Colors.white : VinRColors.surface;
    final borderColor = isLight ? const Color(0x1A000000) : VinRColors.border;
    final activeGold = isLight ? const Color(0xFFB8832A) : VinRColors.goldLight;
    final inactiveColor = isLight ? const Color(0xFF7A7060) : VinRColors.textGhost;

    return Scaffold(
      body: navigationShell,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: FloatingActionButton(
          onPressed: () => context.push('/buddy-chat'),
          backgroundColor: activeGold,
          elevation: 6,
          shape: const CircleBorder(),
          child: const Icon(LucideIcons.messageCircle, color: Colors.white, size: 24),
        ),
      ),
      bottomNavigationBar: Container(
        height: 76,
        decoration: BoxDecoration(
          color: barBg,
          border: Border(
            top: BorderSide(color: borderColor, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: activeGold.withValues(alpha: isLight ? 0.12 : 0.08),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            // Tab 1: Home
            _buildNavItem(
              index: 0,
              currentIndex: currentIndex,
              icon: LucideIcons.home,
              label: 'HOME',
              activeColor: activeGold,
              inactiveColor: inactiveColor,
              onTap: () => _onItemTapped(0),
            ),

            // Tab 2: Check-in
            _buildNavItem(
              index: 1,
              currentIndex: currentIndex,
              icon: LucideIcons.heart,
              label: 'CHECK-IN',
              activeColor: activeGold,
              inactiveColor: inactiveColor,
              onTap: () => _onItemTapped(1),
            ),

            // Tab 3: Center Raised Glint/Reel Button (Instagram Style)
            GestureDetector(
              onTap: () => _onItemTapped(2),
              child: Transform.translate(
                offset: const Offset(0, -14),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: VinRColors.goldGradient,
                        border: Border.all(
                          color: currentIndex == 2 ? activeGold : VinRColors.borderGold,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: activeGold.withValues(alpha: currentIndex == 2 ? 0.6 : 0.35),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          LucideIcons.film,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'GLINT',
                      style: VinRTypography.label.copyWith(
                        fontSize: 9,
                        color: currentIndex == 2 ? activeGold : inactiveColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Tab 4: Journal
            _buildNavItem(
              index: 3,
              currentIndex: currentIndex,
              icon: LucideIcons.bookOpen,
              label: 'JOURNAL',
              activeColor: activeGold,
              inactiveColor: inactiveColor,
              onTap: () => _onItemTapped(3),
            ),

            // Tab 5: Profile
            _buildNavItem(
              index: 4,
              currentIndex: currentIndex,
              icon: LucideIcons.user,
              label: 'PROFILE',
              activeColor: activeGold,
              inactiveColor: inactiveColor,
              onTap: () => _onItemTapped(4),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required int currentIndex,
    required IconData icon,
    required String label,
    required Color activeColor,
    required Color inactiveColor,
    required VoidCallback onTap,
  }) {
    final isSelected = index == currentIndex;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 22,
            color: isSelected ? activeColor : inactiveColor,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: VinRTypography.label.copyWith(
              fontSize: 9,
              color: isSelected ? activeColor : inactiveColor,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          const SizedBox(height: 2),
          if (isSelected)
            Container(
              width: 16,
              height: 3,
              decoration: BoxDecoration(
                color: activeColor,
                borderRadius: BorderRadius.circular(2),
                boxShadow: [
                  BoxShadow(
                    color: activeColor.withValues(alpha: 0.8),
                    blurRadius: 4,
                  ),
                ],
              ),
            )
          else
            const SizedBox(height: 3),
        ],
      ),
    );
  }
}
