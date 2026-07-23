import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/gold_button.dart';
import '../providers/auth_provider.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignUp() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isNotEmpty && password.isNotEmpty) {
      await ref.read(authProvider.notifier).signUp(email, password, name);
      if (mounted) {
        context.go('/onboarding');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: VinRColors.voidGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Begin Your Journey',
                    style: VinRTypography.h1,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create your account to start your 21-day winning streak.',
                    style: VinRTypography.bodySm,
                  ),
                  const SizedBox(height: 32),
                  Text('YOUR FULL NAME', style: VinRTypography.label),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _nameController,
                    style: VinRTypography.body,
                    decoration: const InputDecoration(
                      hintText: 'Alex Rivera',
                      prefixIcon: Icon(Icons.person_outline, color: VinRColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('EMAIL ADDRESS', style: VinRTypography.label),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: VinRTypography.body,
                    decoration: const InputDecoration(
                      hintText: 'alex@example.com',
                      prefixIcon: Icon(Icons.email_outlined, color: VinRColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('PASSWORD', style: VinRTypography.label),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    style: VinRTypography.body,
                    decoration: const InputDecoration(
                      hintText: '••••••••',
                      prefixIcon: Icon(Icons.lock_outline, color: VinRColors.textMuted),
                    ),
                  ),
                  const SizedBox(height: 40),
                  GoldButton(
                    text: 'Create Account',
                    isLoading: authState.isLoading,
                    onPressed: _handleSignUp,
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () => context.push('/sign-in'),
                      child: Text(
                        'Already have an account? Sign In',
                        style: VinRTypography.bodySm.copyWith(
                          color: VinRColors.goldLight,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
