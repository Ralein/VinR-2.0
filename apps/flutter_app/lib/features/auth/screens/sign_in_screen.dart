import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/gold_button.dart';
import '../providers/auth_provider.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _emailController = TextEditingController(text: 'champion@vinr.app');
  final _passwordController = TextEditingController(text: 'password123');

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignIn() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (email.isNotEmpty && password.isNotEmpty) {
      await ref.read(authProvider.notifier).signIn(email, password);
      if (mounted) {
        context.go('/home');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: context.textColor),
          onPressed: () => context.pop(),
        ),
      ),
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome Back',
                  style: VinRTypography.h1.copyWith(color: context.textColor),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to continue your 21-day winning streak.',
                  style: VinRTypography.bodySm.copyWith(color: context.textMutedColor),
                ),
                const SizedBox(height: 36),
                Text(
                  'EMAIL ADDRESS',
                  style: VinRTypography.label.copyWith(color: context.textMutedColor, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(color: context.textColor),
                  decoration: InputDecoration(
                    hintText: 'name@example.com',
                    hintStyle: TextStyle(color: context.textMutedColor),
                    prefixIcon: Icon(Icons.email_outlined, color: context.textMutedColor),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'PASSWORD',
                  style: VinRTypography.label.copyWith(color: context.textMutedColor, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: TextStyle(color: context.textColor),
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    hintStyle: TextStyle(color: context.textMutedColor),
                    prefixIcon: Icon(Icons.lock_outline, color: context.textMutedColor),
                  ),
                ),
                const Spacer(),
                GoldButton(
                  text: 'Sign In',
                  isLoading: authState.isLoading,
                  onPressed: _handleSignIn,
                ),
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: () => context.push('/sign-up'),
                    child: Text(
                      "Don't have an account? Sign Up",
                      style: VinRTypography.bodySm.copyWith(
                        color: context.goldColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
