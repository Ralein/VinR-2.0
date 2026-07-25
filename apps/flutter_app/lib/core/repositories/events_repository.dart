import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class EventsRepository {
  final ApiService _api = ApiService();

  Future<List<Map<String, dynamic>>> searchEvents({
    double lat = 37.7749,
    double lon = -122.4194,
    String? keyword,
  }) async {
    try {
      final query = <String, dynamic>{
        'lat': lat,
        'lon': lon,
        'radius': 25,
      };
      if (keyword != null && keyword.isNotEmpty) query['keyword'] = keyword;

      final response = await _api.dio.get('events', queryParameters: query);
      if (response.statusCode == 200 && response.data != null) {
        final events = response.data['events'] as List?;
        if (events != null) {
          return events.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }
    } catch (e) {
      debugPrint('EventsRepository.searchEvents error: $e');
    }
    return [];
  }
}
