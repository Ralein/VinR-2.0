import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/vinr_colors.dart';

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
    return Scaffold(
      body: navigationShell,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/buddy-chat'),
        backgroundColor: VinRColors.gold,
        elevation: 8,
        shape: const CircleBorder(),
        child: const Icon(LucideIcons.bot, color: Colors.black, size: 28),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: VinRColors.surface,
          border: Border(
            top: BorderSide(color: VinRColors.border, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: navigationShell.currentIndex,
          onTap: _onItemTapped,
          backgroundColor: VinRColors.surface,
          selectedItemColor: VinRColors.goldLight,
          unselectedItemColor: VinRColors.textMuted,
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(icon: Icon(LucideIcons.home), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.trophy), label: 'Journey'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.sparkles), label: 'Glint'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.heartPulse), label: 'Relief'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.bookOpen), label: 'Journal'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.calendar), label: 'Events'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.user), label: 'Profile'),
            BottomNavigationBarItem(icon: Icon(LucideIcons.playCircle), label: 'Reels'),
          ],
        ),
      ),
    );
  }
}
