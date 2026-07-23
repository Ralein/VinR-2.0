import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/vinr_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/navigation/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: VinRApp(),
    ),
  );
}

class VinRApp extends ConsumerWidget {
  const VinRApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'VinR 2.0 — Emotional Wellness & Growth Platform',
      debugShowCheckedModeBanner: false,
      theme: VinRTheme.lightTheme,
      darkTheme: VinRTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
