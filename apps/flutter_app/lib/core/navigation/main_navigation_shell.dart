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
    final bottomInset = MediaQuery.of(context).padding.bottom;

    final barBg = isLight ? Colors.white : VinRColors.surface;
    final borderColor = isLight ? const Color(0x1A000000) : VinRColors.border;
    final activeGold = isLight ? const Color(0xFFB8832A) : VinRColors.goldLight;
    final inactiveColor = isLight ? const Color(0xFF7A7060) : VinRColors.textGhost;

    final navBarHeight = 60.0 + bottomInset;

    return Scaffold(
      body: navigationShell,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 2.0, right: 4.0),
        child: GestureDetector(
          onTap: () => context.push('/buddy-chat'),
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: VinRColors.goldGradient,
              boxShadow: [
                BoxShadow(
                  color: activeGold.withValues(alpha: 0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                LucideIcons.messageCircle,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        height: navBarHeight,
        padding: EdgeInsets.only(bottom: bottomInset),
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
                offset: const Offset(0, -10),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
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
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            LucideIcons.film,
                            color: Colors.white,
                            size: 22,
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'GLINT',
                        style: VinRTypography.label.copyWith(
                          fontSize: 8.5,
                          color: currentIndex == 2 ? activeGold : inactiveColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
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

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? activeColor : inactiveColor,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: VinRTypography.label.copyWith(
                  fontSize: 8.5,
                  color: isSelected ? activeColor : inactiveColor,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              const SizedBox(height: 2),
              if (isSelected)
                Container(
                  width: 14,
                  height: 2.5,
                  decoration: BoxDecoration(
                    color: activeColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                )
              else
                const SizedBox(height: 2.5),
            ],
          ),
        ),
      ),
    );
  }
}
