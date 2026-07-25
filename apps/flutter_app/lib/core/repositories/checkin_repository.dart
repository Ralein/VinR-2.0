import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class CheckinRepository {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>?> submitCheckin({
    required String mood,
    int energyLevel = 3,
    int anxietyLevel = 1,
    String? note,
  }) async {
    try {
      int score = 3;
      if (mood == 'Energized') {
        score = 5;
      } else if (mood == 'Balanced' || mood == 'Good') {
        score = 4;
      } else if (mood == 'Calm' || mood == 'Okay') {
        score = 3;
      } else if (mood == 'Reflective' || mood == 'Low') {
        score = 2;
      }

      final response = await _api.dio.post(
        'checkin',
        data: {
          'mood_score': score,
          'energy_level': energyLevel,
          'anxiety_level': anxietyLevel,
          'notes': note ?? 'Daily check-in',
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data as Map);
      }
    } catch (e) {
      debugPrint('CheckinRepository.submitCheckin error: $e');
    }
    return null;
  }
}
