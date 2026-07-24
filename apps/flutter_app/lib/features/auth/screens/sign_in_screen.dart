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

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _emailController = TextEditingController(text: 'champion@vinr.app');
  final _passwordController = TextEditingController(text: 'password123');
  bool _obscurePassword = true;

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

  void _fillDemoCredentials() {
    setState(() {
      _emailController.text = 'champion@vinr.app';
      _passwordController.text = 'password123';
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Navigation Back Action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: context.textColor, size: 20),
                      onPressed: () => context.pop(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    CinematicHeroEntrance(
                      child: Row(
                        children: [
                          Hero(
                            tag: 'vinr_flame_logo',
                            child: AnimatedPulse(
                              duration: const Duration(milliseconds: 1800),
                              minScale: 0.94,
                              maxScale: 1.06,
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: context.goldMutedColor.withValues(alpha: 0.7),
                                  border: Border.all(color: context.borderGoldColor, width: 1.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: context.goldColor.withValues(alpha: 0.3),
                                      blurRadius: 16,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                child: Icon(LucideIcons.flame, color: context.goldLightColor, size: 20),
                              ),
                            ),
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
                    'Welcome Back',
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
                    'Sign in to continue your 21-day winning streak.',
                    style: VinRTypography.bodySm.copyWith(
                      color: context.textMutedColor,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Form Container
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 350),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                            hintText: 'name@example.com',
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
                        const SizedBox(height: 20),

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
                        const SizedBox(height: 16),

                        // Quick demo filler option
                        Align(
                          alignment: Alignment.centerRight,
                          child: InkWell(
                            onTap: _fillDemoCredentials,
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(LucideIcons.sparkles, size: 13, color: context.goldColor),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Fill Demo Account',
                                    style: VinRTypography.caption.copyWith(
                                      color: context.goldColor,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Sign In Action Button
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 450),
                  child: GoldButton(
                    text: 'Sign In to VinR',
                    isLoading: authState.isLoading,
                    onPressed: _handleSignIn,
                  ),
                ),
                const SizedBox(height: 18),

                // Sign Up Route Prompt
                FadeSlideTransition(
                  delay: const Duration(milliseconds: 550),
                  child: Center(
                    child: TextButton(
                      onPressed: () => context.push('/sign-up'),
                      child: RichText(
                        text: TextSpan(
                          text: "Don't have an account? ",
                          style: VinRTypography.bodySm.copyWith(color: context.textMutedColor),
                          children: [
                            TextSpan(
                              text: 'Sign Up',
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
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
