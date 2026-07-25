import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'storage_service.dart';

class ApiService {
  static String get defaultBaseUrl {
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) return envUrl;

    if (!kIsWeb) {
      if (Platform.isAndroid || Platform.isIOS) {
        // ADB reverse on physical Android devices and iOS simulators route via 127.0.0.1:8000
        return 'http://127.0.0.1:8000/api/v1/';
      }
    }
    return 'http://192.168.0.132:8000/api/v1/';
  }

  late final Dio dio;

  ApiService([String? customBaseUrl]) {
    dio = Dio(
      BaseOptions(
        baseUrl: customBaseUrl ?? defaultBaseUrl,
        connectTimeout: const Duration(seconds: 45),
        receiveTimeout: const Duration(seconds: 45),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await StorageService.deleteToken();
          }
          return handler.next(error);
        },
      ),
    );
  }
}
