import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class ChatRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>?> sendMessage(
    String text, {
    bool voiceEnabled = false,
    String persona = 'vinr',
  }) async {
    try {
      final response = await _apiService.dio.post(
        'chat/message',
        data: {
          'text': text,
          'voice_enabled': voiceEnabled,
          'persona': persona,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } on DioException catch (e) {
      debugPrint('ChatRepository sendMessage error: ${e.message}');
    } catch (e) {
      debugPrint('ChatRepository sendMessage error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getHistory() async {
    try {
      final response = await _apiService.dio.get('chat/history');
      if (response.statusCode == 200 && response.data != null) {
        return response.data['messages'] as List<dynamic>?;
      }
    } on DioException catch (e) {
      debugPrint('ChatRepository getHistory error: ${e.message}');
    } catch (e) {
      debugPrint('ChatRepository getHistory error: $e');
    }
    return null;
  }

  Future<String?> generateTts(String text, {String persona = 'vinr'}) async {
    try {
      final response = await _apiService.dio.post(
        'chat/tts',
        data: {
          'text': text,
          'persona': persona,
        },
      );
      if (response.statusCode == 200 && response.data != null) {
        return response.data['audio_url'] as String?;
      }
    } catch (e) {
      debugPrint('ChatRepository generateTts error: $e');
    }
    return null;
  }
}
