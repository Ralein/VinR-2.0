class TherapistModel {
  final String id;
  final String name;
  final String title;
  final String specialization;
  final double rating;
  final int reviewsCount;
  final String avatarUrl;
  final double hourlyRate;
  final List<String> availableSlots;

  TherapistModel({
    required this.id,
    required this.name,
    required this.title,
    required this.specialization,
    required this.rating,
    required this.reviewsCount,
    required this.avatarUrl,
    required this.hourlyRate,
    required this.availableSlots,
  });
}
