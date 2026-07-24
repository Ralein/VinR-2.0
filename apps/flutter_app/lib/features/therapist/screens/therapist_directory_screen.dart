import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../models/therapist_model.dart';

class TherapistDirectoryScreen extends StatefulWidget {
  const TherapistDirectoryScreen({super.key});

  @override
  State<TherapistDirectoryScreen> createState() => _TherapistDirectoryScreenState();
}

class _TherapistDirectoryScreenState extends State<TherapistDirectoryScreen> {
  String _selectedCategory = 'All';

  final List<TherapistModel> _therapists = [
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

                      Row(
                        children: [
                          CircleAvatar(
                            radius: 26,
                            backgroundColor: context.goldMutedColor,
                            child: Icon(LucideIcons.userCheck, color: activeGold, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(therapist.name, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor), overflow: TextOverflow.ellipsis),
                                Text(therapist.title, style: TextStyle(color: mutedTextColor, fontSize: 12), overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      Text('SELECT SESSION TYPE', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: ['Video Consultation', 'Audio Session', 'In-Person'].map((type) {
                            final isSel = selectedType == type;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                selected: isSel,
                                label: Text(type, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontSize: 11, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                                selectedColor: activeGold,
                                backgroundColor: context.surfaceColor,
                                onSelected: (_) => setModalState(() => selectedType = type),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 20),

                      Text('AVAILABLE TIME SLOTS', style: VinRTypography.label.copyWith(color: mutedTextColor, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Column(
                        children: therapist.availableSlots.map((slot) {
                          final isSel = selectedSlot == slot;
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: InkWell(
                              onTap: () => setModalState(() => selectedSlot = slot),
                              borderRadius: BorderRadius.circular(14),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSel ? activeGold.withValues(alpha: 0.15) : context.surfaceColor,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: isSel ? activeGold : context.borderColor, width: isSel ? 1.5 : 1),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Icon(LucideIcons.calendar, size: 16, color: isSel ? activeGold : mutedTextColor),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Text(slot, style: TextStyle(color: primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal, fontSize: 13), overflow: TextOverflow.ellipsis),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (isSel) Icon(LucideIcons.checkCircle2, color: activeGold, size: 18),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),

                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          VinRToast.show(
                            context,
                            message: '$selectedType booked with ${therapist.name} for $selectedSlot!',
                            icon: LucideIcons.calendarCheck,
                            iconColor: VinRColors.emerald,
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: activeGold,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: Text('Confirm Booking (\$${therapist.hourlyRate.toInt()})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

    final categories = ['All', 'Anxiety & CBT', 'Burnout & Focus', 'Mindfulness & Sleep'];

    final filteredTherapists = _selectedCategory == 'All'
        ? _therapists
        : _therapists.where((t) => t.specialization.contains(_selectedCategory.split(' ').first)).toList();

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Bar
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_ios_new_rounded, color: primaryTextColor, size: 20),
                      onPressed: () => context.pop(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Licensed Specialist Directory',
                        style: VinRTypography.h3.copyWith(color: primaryTextColor),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Category Filter Chips Bar
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: categories.map((cat) {
                      final isSel = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          selected: isSel,
                          label: Text(cat, style: TextStyle(color: isSel ? Colors.black : primaryTextColor, fontWeight: isSel ? FontWeight.bold : FontWeight.normal, fontSize: 12)),
                          selectedColor: activeGold,
                          backgroundColor: context.surfaceColor,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: isSel ? activeGold : context.borderColor),
                          ),
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 16),

                Text(
                  'CERTIFIED THERAPISTS & COACHES (${filteredTherapists.length})',
                  style: VinRTypography.label.copyWith(color: mutedTextColor),
                ),
                const SizedBox(height: 12),

                Expanded(
                  child: ListView.builder(
                    itemCount: filteredTherapists.length,
                    itemBuilder: (context, index) {
                      final therapist = filteredTherapists[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: GlassContainer(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Stack(
                                    alignment: Alignment.bottomRight,
                                    children: [
                                      CircleAvatar(
                                        radius: 28,
                                        backgroundColor: context.goldMutedColor,
                                        child: Icon(LucideIcons.userCheck, color: activeGold, size: 26),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.all(3),
                                        decoration: BoxDecoration(
                                          color: VinRColors.emerald,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: context.surfaceColor, width: 1.5),
                                        ),
                                        child: const Icon(LucideIcons.check, size: 10, color: Colors.white),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(therapist.name, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: primaryTextColor), overflow: TextOverflow.ellipsis),
                                        Text(therapist.title, style: VinRTypography.caption.copyWith(color: mutedTextColor), overflow: TextOverflow.ellipsis),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(Icons.star_rounded, color: activeGold, size: 16),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                '${therapist.rating} (${therapist.reviewsCount} verified reviews)',
                                                style: VinRTypography.caption.copyWith(color: mutedTextColor),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text('SPECIALIZATION', style: VinRTypography.label.copyWith(color: mutedTextColor)),
                              const SizedBox(height: 2),
                              Text(therapist.specialization, style: VinRTypography.bodySm.copyWith(color: primaryTextColor)),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      '\$${therapist.hourlyRate.toInt()} / 50-min session',
                                      style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: activeGold),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton.icon(
                                    icon: const Icon(LucideIcons.calendar, size: 14),
                                    label: const Text('Book Session', style: TextStyle(fontWeight: FontWeight.bold)),
                                    onPressed: () => _showBookingModal(therapist),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: activeGold,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
