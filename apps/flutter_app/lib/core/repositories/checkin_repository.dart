import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class CheckinRepository {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>?> submitCheckin({
    required String mood,
    String? note,
  }) async {
    try {
      final response = await _api.dio.post(
        'checkin',
        data: {
          'mood_tag': mood,
          'text': note ?? 'Daily check-in',
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
