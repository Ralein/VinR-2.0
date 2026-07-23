import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';
import '../models/therapist_model.dart';

class TherapistDirectoryScreen extends StatelessWidget {
  const TherapistDirectoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<TherapistModel> therapists = [
      TherapistModel(
        id: 't1',
        name: 'Dr. Sarah Jenkins',
        title: 'Licensed Clinical Psychologist',
        specialization: 'Anxiety, CBT, Habit Mastery',
        rating: 4.9,
        reviewsCount: 128,
        avatarUrl: '',
        hourlyRate: 120.0,
        availableSlots: ['Tomorrow at 10:00 AM', 'Tomorrow at 2:30 PM'],
      ),
      TherapistModel(
        id: 't2',
        name: 'Marcus Vance, LMFT',
        title: 'Growth & Performance Coach',
        specialization: 'Burnout Recovery & Discipline',
        rating: 4.85,
        reviewsCount: 94,
        avatarUrl: '',
        hourlyRate: 100.0,
        availableSlots: ['Friday at 11:00 AM', 'Friday at 4:00 PM'],
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text('Licensed Therapist Directory', style: VinRTypography.h3),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: therapists.length,
            itemBuilder: (context, index) {
              final therapist = therapists[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: GlassContainer(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: VinRColors.goldMuted,
                            child: const Icon(LucideIcons.userCheck, color: VinRColors.goldLight),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(therapist.name, style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                                Text(therapist.title, style: VinRTypography.caption),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded, color: VinRColors.goldLight, size: 16),
                                    const SizedBox(width: 4),
                                    Text('${therapist.rating} (${therapist.reviewsCount} reviews)', style: VinRTypography.caption),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('SPECIALIZATION', style: VinRTypography.label),
                      Text(therapist.specialization, style: VinRTypography.bodySm),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('\$${therapist.hourlyRate.toInt()}/session', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold, color: VinRColors.goldLight)),
                          ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Slot requested with ${therapist.name}')),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: VinRColors.gold,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Book Session', style: TextStyle(fontWeight: FontWeight.bold)),
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
      ),
    );
  }
}
