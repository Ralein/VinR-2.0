import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class TherapistRepository {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>?> getTherapistDirectory({String? specialty}) async {
    try {
      final params = <String, dynamic>{'telehealth': true};
      if (specialty != null && specialty.isNotEmpty) {
        params['specialty'] = specialty;
      }

      final response = await _api.dio.get('therapist/directory', queryParameters: params);
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data as Map);
      }
    } catch (e) {
      debugPrint('TherapistRepository.getTherapistDirectory error: $e');
    }
    return null;
  }
}
