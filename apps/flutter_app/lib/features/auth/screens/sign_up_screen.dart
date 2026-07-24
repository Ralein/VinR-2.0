import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/app_animations.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';
import '../providers/auth_provider.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _nameController = TextEditingController(text: 'Alex Rivera');
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

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

  double _calculatePasswordStrength(String password) {
    if (password.isEmpty) return 0.0;
    if (password.length < 6) return 0.3;
    if (password.length < 10) return 0.7;
    return 1.0;
  }

  Color _getPasswordStrengthColor(double strength, BuildContext context) {
    if (strength <= 0.3) return Colors.redAccent;
    if (strength <= 0.7) return context.goldColor;
    return context.emeraldColor;
  }

  String _getPasswordStrengthLabel(double strength) {
    if (strength == 0.0) return '';
    if (strength <= 0.3) return 'Weak';
    if (strength <= 0.7) return 'Good';
    return 'Strong';
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final passwordStrength = _calculatePasswordStrength(_passwordController.text);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Navigation Back Action & Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: context.textColor, size: 20),
                      onPressed: () => context.pop(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    FadeSlideTransition(
                      duration: const Duration(milliseconds: 500),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: context.goldMutedColor.withValues(alpha: 0.5),
                              border: Border.all(color: context.borderGoldColor, width: 1.5),
                            ),
                            child: Icon(LucideIcons.flame, color: context.goldLightColor, size: 20),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'VinR',
                            style: VinRTypography.h3.copyWith(
                              color: context.textColor,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 150),
                  child: Text(
                    'Begin Your Journey',
                    style: VinRTypography.h1.copyWith(
                      color: context.textColor,
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 250),
                  child: Text(
                    'Create your VinR account to start your 21-day winning streak.',
                    style: VinRTypography.bodySm.copyWith(
                      color: context.textMutedColor,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Inputs Card
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 350),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'YOUR FULL NAME',
                          style: VinRTypography.label.copyWith(
                            color: context.textMutedColor,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _nameController,
                          style: TextStyle(color: context.textColor, fontSize: 15),
                          decoration: InputDecoration(
                            hintText: 'Alex Rivera',
                            hintStyle: TextStyle(color: context.textMutedColor),
                            prefixIcon: Icon(LucideIcons.user, color: context.goldColor, size: 20),
                            filled: true,
                            fillColor: context.surfaceColor.withValues(alpha: 0.6),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.goldColor, width: 2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        Text(
                          'EMAIL ADDRESS',
                          style: VinRTypography.label.copyWith(
                            color: context.textMutedColor,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: TextStyle(color: context.textColor, fontSize: 15),
                          decoration: InputDecoration(
                            hintText: 'alex@example.com',
                            hintStyle: TextStyle(color: context.textMutedColor),
                            prefixIcon: Icon(LucideIcons.mail, color: context.goldColor, size: 20),
                            filled: true,
                            fillColor: context.surfaceColor.withValues(alpha: 0.6),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.goldColor, width: 2),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        Text(
                          'PASSWORD',
                          style: VinRTypography.label.copyWith(
                            color: context.textMutedColor,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          onChanged: (_) => setState(() {}),
                          style: TextStyle(color: context.textColor, fontSize: 15),
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            hintStyle: TextStyle(color: context.textMutedColor),
                            prefixIcon: Icon(LucideIcons.lock, color: context.goldColor, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                                color: context.textMutedColor,
                                size: 20,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            filled: true,
                            fillColor: context.surfaceColor.withValues(alpha: 0.6),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.borderColor),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: context.goldColor, width: 2),
                            ),
                          ),
                        ),
                        if (_passwordController.text.isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: passwordStrength,
                                    minHeight: 4,
                                    backgroundColor: context.surfaceColor,
                                    color: _getPasswordStrengthColor(passwordStrength, context),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                _getPasswordStrengthLabel(passwordStrength),
                                style: VinRTypography.caption.copyWith(
                                  color: _getPasswordStrengthColor(passwordStrength, context),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 450),
                  child: GoldButton(
                    text: 'Create Account',
                    isLoading: authState.isLoading,
                    onPressed: _handleSignUp,
                  ),
                ),
                const SizedBox(height: 16),

                FadeSlideTransition(
                  delay: const Duration(milliseconds: 550),
                  child: Center(
                    child: TextButton(
                      onPressed: () => context.push('/sign-in'),
                      child: RichText(
                        text: TextSpan(
                          text: 'Already have an account? ',
                          style: VinRTypography.bodySm.copyWith(color: context.textMutedColor),
                          children: [
                            TextSpan(
                              text: 'Sign In',
                              style: VinRTypography.bodySm.copyWith(
                                color: context.goldColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
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
