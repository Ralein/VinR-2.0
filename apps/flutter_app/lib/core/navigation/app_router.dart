import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/welcome_screen.dart';
import '../../features/auth/screens/sign_in_screen.dart';
import '../../features/auth/screens/sign_up_screen.dart';
import '../../features/onboarding/screens/onboarding_wizard_screen.dart';
import '../../features/dashboard/screens/home_dashboard_screen.dart';
import '../../features/journey/screens/journey_screen.dart';
import '../../features/glint/screens/glint_screen.dart';
import '../../features/relief/screens/immediate_relief_screen.dart';
import '../../features/journal/screens/journal_screen.dart';
import '../../features/events/screens/events_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/reels/screens/reels_screen.dart';
import '../../features/chat/screens/buddy_chat_screen.dart';
import '../../features/exercises/screens/breathing_exercise_screen.dart';
import '../../features/exercises/screens/grounding_exercise_screen.dart';
import '../../features/exercises/screens/yoga_movement_screen.dart';
import '../../features/therapist/screens/therapist_directory_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import 'main_navigation_shell.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: auth.isAuthenticated
        ? (auth.user?.onboardingComplete == false ? '/onboarding' : '/home')
        : '/welcome',
    routes: [
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/sign-in',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/sign-up',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingWizardScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainNavigationShell(navigationShell: navigationShell);
        },
        branches: [
          // Tab 0: Home
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeDashboardScreen(),
              ),
            ],
          ),
          // Tab 1: Check-in / Journey
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/journey',
                builder: (context, state) => const JourneyScreen(),
              ),
            ],
          ),
          // Tab 2: Glint (Center Instagram-style Reel)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/glint',
                builder: (context, state) => const GlintScreen(),
              ),
            ],
          ),
          // Tab 3: Journal
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/journal',
                builder: (context, state) => const JournalScreen(),
              ),
            ],
          ),
          // Tab 4: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      // Standalone Routes
      GoRoute(
        path: '/immediate-relief',
        builder: (context, state) => const ImmediateReliefScreen(),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/reels',
        builder: (context, state) => const ReelsScreen(),
      ),
      GoRoute(
        path: '/buddy-chat',
        builder: (context, state) => const BuddyChatScreen(),
      ),
      GoRoute(
        path: '/breathing',
        builder: (context, state) => const BreathingExerciseScreen(),
      ),
      GoRoute(
        path: '/grounding',
        builder: (context, state) => const GroundingExerciseScreen(),
      ),
      GoRoute(
        path: '/yoga',
        builder: (context, state) => const YogaMovementScreen(),
      ),
      GoRoute(
        path: '/therapist',
        builder: (context, state) => const TherapistDirectoryScreen(),
      ),
      GoRoute(
        path: '/therapists',
        builder: (context, state) => const TherapistDirectoryScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});
