import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../../features/auth/models/user_model.dart';

class AuthRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await _apiService.dio.post(
        'auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      print('⚠️ AuthRepository login error: ${e.message}');
    } catch (e) {
      print('⚠️ AuthRepository login error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> register(String email, String password, String name) async {
    try {
      final response = await _apiService.dio.post(
        'auth/register',
        data: {
          'email': email,
          'password': password,
          'name': name,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      print('⚠️ AuthRepository register error: ${e.message}');
    } catch (e) {
      print('⚠️ AuthRepository register error: $e');
    }
    return null;
  }

  Future<UserModel?> getMe() async {
    try {
      final response = await _apiService.dio.get('auth/me');
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        return UserModel(
          id: data['id'] as String? ?? 'usr_101',
          email: data['email'] as String? ?? 'champion@vinr.app',
          name: data['name'] as String? ?? 'Winner Champion',
          onboardingComplete: data['onboarding_complete'] as bool? ?? true,
        );
      }
    } on DioException catch (e) {
      print('⚠️ AuthRepository getMe error: ${e.message}');
    } catch (e) {
      print('⚠️ AuthRepository getMe error: $e');
    }
    return null;
  }
}
