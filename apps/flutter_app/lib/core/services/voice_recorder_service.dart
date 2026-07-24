import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import '../services/api_service.dart';
import 'package:dio/dio.dart';

/// Wraps [AudioRecorder] + backend Whisper transcription into a clean service.
class VoiceRecorderService {
  VoiceRecorderService._();
  static final VoiceRecorderService instance = VoiceRecorderService._();

  final _recorder = AudioRecorder();
  String? _currentFilePath;
  bool _isRecording = false;

  bool get isRecording => _isRecording;

  /// Starts recording into a temp WAV file.
  Future<bool> start() async {
    try {
      final hasPermission = await _recorder.hasPermission();
      if (!hasPermission) return false;

      final dir = await getTemporaryDirectory();
      _currentFilePath = '${dir.path}/vinr_recording_${DateTime.now().millisecondsSinceEpoch}.wav';

      await _recorder.start(
        const RecordConfig(
          encoder: AudioEncoder.wav,
          sampleRate: 16000,
          numChannels: 1,
        ),
        path: _currentFilePath!,
      );
      _isRecording = true;
      return true;
    } catch (e) {
      debugPrint('VoiceRecorderService.start error: $e');
      return false;
    }
  }

  /// Stops recording and sends the audio to the backend Whisper endpoint.
  /// Returns the transcribed text or null on failure.
  Future<String?> stopAndTranscribe({String persona = 'vinr'}) async {
    if (!_isRecording) return null;
    try {
      await _recorder.stop();
      _isRecording = false;

      final file = File(_currentFilePath!);
      if (!await file.exists()) return null;

      final bytes = await file.readAsBytes();
      if (bytes.isEmpty) return null;

      final api = ApiService();
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: 'recording.wav',
          contentType: DioMediaType('audio', 'wav'),
        ),
      });

      final response = await api.dio.post('chat/transcribe', data: formData);
      if (response.statusCode == 200 && response.data != null) {
        return response.data['text'] as String?;
      }
    } catch (e) {
      debugPrint('VoiceRecorderService.stopAndTranscribe error: $e');
    } finally {
      // Clean up temp file
      try {
        if (_currentFilePath != null) await File(_currentFilePath!).delete();
      } catch (_) {}
    }
    return null;
  }

  /// Cancels an in-progress recording without transcribing.
  Future<void> cancel() async {
    if (_isRecording) {
      await _recorder.cancel();
      _isRecording = false;
    }
  }

  Future<void> dispose() async {
    await cancel();
    await _recorder.dispose();
  }
}
