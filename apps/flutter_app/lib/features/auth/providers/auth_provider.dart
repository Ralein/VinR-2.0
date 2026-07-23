import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/storage_service.dart';
import '../models/user_model.dart';

class AuthState {
  final UserModel? user;
  final String? token;
  final bool isLoading;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.token,
    this.isLoading = false,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    UserModel? user,
    String? token,
    bool? isLoading,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _initAuth();
  }

  Future<void> _initAuth() async {
    final token = await StorageService.getToken();
    if (token != null && token.isNotEmpty) {
      // Demo mock user initialization for instant responsive load
      state = state.copyWith(
        token: token,
        isAuthenticated: true,
        user: UserModel(
          id: 'usr_101',
          email: 'champion@vinr.app',
          name: 'Winner Champion',
          onboardingComplete: true,
        ),
      );
    }
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 800)); // Simulate API call
    const mockToken = 'mock_jwt_vinr_token_123';
    await StorageService.saveToken(mockToken);

    state = state.copyWith(
      isLoading: false,
      token: mockToken,
      isAuthenticated: true,
      user: UserModel(
        id: 'usr_101',
        email: email,
        name: email.split('@').first,
        onboardingComplete: true,
      ),
    );
  }

  Future<void> signUp(String email, String password, String name) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 800));
    const mockToken = 'mock_jwt_vinr_token_123';
    await StorageService.saveToken(mockToken);

    state = state.copyWith(
      isLoading: false,
      token: mockToken,
      isAuthenticated: true,
      user: UserModel(
        id: 'usr_101',
        email: email,
        name: name,
        onboardingComplete: false,
      ),
    );
  }

  Future<void> signOut() async {
    await StorageService.deleteToken();
    state = AuthState();
  }

  void completeOnboarding() {
    if (state.user != null) {
      state = state.copyWith(
        user: state.user!.copyWith(onboardingComplete: true),
      );
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
