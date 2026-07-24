import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class StreakRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>?> getActiveStreak() async {
    try {
      final response = await _apiService.dio.get('streaks/active');
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      debugPrint('StreakRepository getActiveStreak error: ${e.message}');
    } catch (e) {
      debugPrint('StreakRepository getActiveStreak error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> completeDay(String streakId, {String? reflectionNote, int? moodRating}) async {
    try {
      final response = await _apiService.dio.post(
        'streaks/$streakId/complete-day',
        data: {
          'reflection_note': reflectionNote,
          'mood_rating': moodRating,
        }..removeWhere((key, value) => value == null),
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      debugPrint('StreakRepository completeDay error: ${e.message}');
    } catch (e) {
      debugPrint('StreakRepository completeDay error: $e');
    }
    return null;
  }
}
