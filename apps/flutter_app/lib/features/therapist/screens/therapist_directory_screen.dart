import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/gold_button.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../../core/repositories/therapist_repository.dart';
import '../models/therapist_model.dart';

class TherapistDirectoryScreen extends StatefulWidget {
  const TherapistDirectoryScreen({super.key});

  @override
  State<TherapistDirectoryScreen> createState() => _TherapistDirectoryScreenState();
}

class _TherapistDirectoryScreenState extends State<TherapistDirectoryScreen> {
  String _selectedCategory = 'All';
  bool _isLoading = false;
  final _therapistRepo = TherapistRepository();

  List<TherapistModel> _therapists = [
    TherapistModel(
      id: 't1',
      name: 'Dr. Sarah Jenkins',
      title: 'Licensed Clinical Psychologist (PsyD)',
      specialization: 'Anxiety, CBT & Trauma Recovery',
      rating: 4.95,
      reviewsCount: 142,
      avatarUrl: '',
      hourlyRate: 120.0,
      availableSlots: ['Today at 04:00 PM', 'Tomorrow at 10:00 AM', 'Tomorrow at 02:30 PM'],
    ),
    TherapistModel(
      id: 't2',
      name: 'Marcus Vance, LMFT',
      title: 'Executive & High-Performance Coach',
      specialization: 'Burnout Recovery, Resilience & Peak Focus',
      rating: 4.88,
      reviewsCount: 98,
      avatarUrl: '',
      hourlyRate: 110.0,
      availableSlots: ['Tomorrow at 11:00 AM', 'Friday at 03:00 PM'],
    ),
    TherapistModel(
      id: 't3',
      name: 'Elena Rostova, PhD',
      title: 'Neuro-Mindfulness & Sleep Specialist',
      specialization: 'Insomnia, Somatic Healing & Stress Relief',
      rating: 4.92,
      reviewsCount: 116,
      avatarUrl: '',
      hourlyRate: 130.0,
      availableSlots: ['Thursday at 01:00 PM', 'Friday at 05:30 PM'],
    ),
    TherapistModel(
      id: 't4',
      name: 'Dr. Aris Thorne',
      title: 'Behavioral Psychologist & Stoic Mentor',
      specialization: 'Discipline, Habit Mastery & Emotional Strength',
      rating: 4.97,
      reviewsCount: 180,
      avatarUrl: '',
      hourlyRate: 140.0,
      availableSlots: ['Tomorrow at 09:00 AM', 'Thursday at 04:00 PM'],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadDirectory();
  }

  Future<void> _loadDirectory() async {
    setState(() => _isLoading = true);
    final data = await _therapistRepo.getTherapistDirectory(
      specialty: _selectedCategory == 'All' ? null : _selectedCategory.toLowerCase(),
    );
    if (data != null && mounted) {
      final providers = data['providers'] as List?;
      if (providers != null && providers.isNotEmpty) {
        setState(() {
          _isLoading = false;
          _therapists = providers.map((p) {
            final m = p as Map<String, dynamic>;
            final specialties = (m['specialties'] as List?)?.join(', ') ?? 'Wellness & Therapy';
            return TherapistModel(
              id: m['id'] ?? 't_${DateTime.now().millisecondsSinceEpoch}',
              name: m['name'] ?? 'Therapy Provider',
              title: m['type'] == 'online' ? 'Online Care Provider' : 'Directory Provider',
              specialization: specialties,
              rating: 4.90,
              reviewsCount: 120,
              avatarUrl: '',
              hourlyRate: 120.0,
              availableSlots: ['Today at 04:00 PM', 'Tomorrow at 10:00 AM'],
            );
          }).toList();
        });
      } else {
        setState(() => _isLoading = false);
      }
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showBookingModal(TherapistModel therapist) {
    String selectedSlot = therapist.availableSlots.first;
    String selectedType = 'Video Consultation';
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 36,
                          height: 4,
                          decoration: BoxDecoration(
                            color: context.textGhostColor.withValues(alpha: 0.3),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      Text(
                        'Book Session with ${therapist.name}',
                        style: VinRTypography.h2.copyWith(color: primaryTextColor),
                      ),
                      Text(
                        therapist.title,
                        style: VinRTypography.caption.copyWith(color: mutedTextColor),
                      ),
                      const SizedBox(height: 20),

                      Text('SELECT CONSULTATION TYPE', style: VinRTypography.label.copyWith(color: activeGold)),
                      const SizedBox(height: 8),
                      Row(
                        children: ['Video Consultation', 'Audio Call', 'In-App Chat'].map((type) {
                          final isSel = selectedType == type;
                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: GestureDetector(
                                onTap: () => setModalState(() => selectedType = type),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSel ? activeGold.withValues(alpha: 0.18) : context.surfaceColor,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSel ? activeGold : context.borderColor,
                                      width: isSel ? 1.5 : 1,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      type.split(' ').first,
                                      style: TextStyle(
                                        color: isSel ? activeGold : primaryTextColor,
                                        fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 20),

                      Text('AVAILABLE TIME SLOTS', style: VinRTypography.label.copyWith(color: activeGold)),
                      const SizedBox(height: 8),
                      Column(
                        children: therapist.availableSlots.map((slot) {
                          final isSel = selectedSlot == slot;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: GestureDetector(
                              onTap: () => setModalState(() => selectedSlot = slot),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSel ? activeGold.withValues(alpha: 0.15) : context.surfaceColor,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSel ? activeGold : context.borderColor,
                                    width: isSel ? 1.5 : 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(LucideIcons.clock, size: 16, color: isSel ? activeGold : mutedTextColor),
                                        const SizedBox(width: 8),
                                        Text(slot, style: TextStyle(color: isSel ? activeGold : primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                                      ],
                                    ),
                                    if (isSel) Icon(LucideIcons.checkCircle2, size: 18, color: activeGold),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),

                      GoldButton(
                        text: 'Confirm Booking • \$${therapist.hourlyRate.toInt()}',
                        onPressed: () {
                          Navigator.pop(context);
                          VinRToast.show(
                            context,
                            message: 'Session Booked for $selectedSlot!',
                            icon: LucideIcons.checkCircle2,
                            iconColor: VinRColors.emerald,
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;
    final activeGold = context.goldColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: Icon(LucideIcons.arrowLeft, color: primaryTextColor),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('THERAPIST DIRECTORY', style: VinRTypography.label.copyWith(color: activeGold)),
                          Text('Professional Care & Coaching', style: VinRTypography.h2.copyWith(color: primaryTextColor)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Specialty filter pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'Anxiety', 'CBT', 'Burnout', 'Sleep', 'Stoic'].map((cat) {
                      final isSel = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _selectedCategory = cat);
                            _loadDirectory();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSel ? activeGold.withValues(alpha: 0.18) : context.surfaceColor,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSel ? activeGold : context.borderColor,
                                width: isSel ? 1.5 : 1,
                              ),
                            ),
                            child: Text(
                              cat,
                              style: TextStyle(
                                color: isSel ? activeGold : primaryTextColor,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),

                if (_isLoading)
                  const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                else
                  ..._therapists.map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: GlassContainer(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    radius: 24,
                                    backgroundColor: activeGold.withValues(alpha: 0.2),
                                    child: Icon(LucideIcons.userCheck, color: activeGold, size: 24),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(t.name, style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 16)),
                                        Text(t.title, style: TextStyle(color: mutedTextColor, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      const Icon(LucideIcons.star, color: VinRColors.gold, size: 14),
                                      const SizedBox(width: 4),
                                      Text('${t.rating}', style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 13)),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(t.specialization, style: TextStyle(color: activeGold, fontSize: 12, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 14),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('\$${t.hourlyRate.toInt()} / session', style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 14)),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: activeGold,
                                      foregroundColor: Colors.black,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    ),
                                    onPressed: () => _showBookingModal(t),
                                    child: const Text('Book Session', style: TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      )),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
