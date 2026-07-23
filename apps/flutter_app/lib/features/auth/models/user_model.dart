class UserModel {
  final String id;
  final String email;
  final String? name;
  final String? avatarUrl;
  final bool onboardingComplete;
  final String timezone;
  final String? age;
  final String? primaryReason;
  final List<String> relaxationMethods;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    this.avatarUrl,
    this.onboardingComplete = false,
    this.timezone = 'UTC',
    this.age,
    this.primaryReason,
    this.relaxationMethods = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      name: json['name'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      onboardingComplete: json['onboardingComplete'] as bool? ?? false,
      timezone: json['timezone'] as String? ?? 'UTC',
      age: json['age'] as String?,
      primaryReason: json['primaryReason'] as String?,
      relaxationMethods: (json['relaxationMethods'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatarUrl': avatarUrl,
      'onboardingComplete': onboardingComplete,
      'timezone': timezone,
      'age': age,
      'primaryReason': primaryReason,
      'relaxationMethods': relaxationMethods,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? avatarUrl,
    bool? onboardingComplete,
    String? timezone,
    String? age,
    String? primaryReason,
    List<String>? relaxationMethods,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      onboardingComplete: onboardingComplete ?? this.onboardingComplete,
      timezone: timezone ?? this.timezone,
      age: age ?? this.age,
      primaryReason: primaryReason ?? this.primaryReason,
      relaxationMethods: relaxationMethods ?? this.relaxationMethods,
    );
  }
}
