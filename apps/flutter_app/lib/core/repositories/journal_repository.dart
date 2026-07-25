import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class JournalRepository {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> getJournalEntries({String? month}) async {
    final m = month ?? '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}';
    try {
      final response = await _api.dio.get('journal', queryParameters: {'month': m});
      if (response.statusCode == 200 && response.data != null) {
        final list = response.data as List;
        return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (e) {
      debugPrint('JournalRepository.getJournalEntries error: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>?> createEntry({
    required List<String> gratitudeItems,
    required String reflectionText,
    required String mood,
  }) async {
    try {
      // Convert text mood to 1-5 integer if needed
      int moodInt = 3;
      if (mood == 'Energized') {
        moodInt = 5;
      } else if (mood == 'Balanced') {
        moodInt = 4;
      } else if (mood == 'Calm') {
        moodInt = 3;
      } else if (mood == 'Reflective') {
        moodInt = 2;
      }

      final response = await _api.dio.post(
        'journal',
        data: {
          'gratitude_items': gratitudeItems,
          'reflection_text': reflectionText,
          'mood_at_entry': moodInt,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return Map<String, dynamic>.from(response.data as Map);
      }
    } catch (e) {
      debugPrint('JournalRepository.createEntry error: $e');
    }
    return null;
  }

  Future<bool> deleteEntry(String id) async {
    try {
      final response = await _api.dio.delete('journal/$id');
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('JournalRepository.deleteEntry error: $e');
      return false;
    }
  }
}
