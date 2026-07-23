import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 100),
            children: [
              Text('Events Near You', style: VinRTypography.h1.copyWith(fontSize: 26)),
              const SizedBox(height: 16),

              const SectionHeader(
                title: 'UPCOMING WORKSHOPS',
                icon: LucideIcons.calendar,
                iconColor: VinRColors.emerald,
              ),

              GlassContainer(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: const BoxDecoration(
                            color: VinRColors.emeraldGlow,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(LucideIcons.users, color: VinRColors.emerald, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('21-Day Winning Masterclass', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                              Text('Host: Dr. Elena Vance • Clinical Psychologist', style: VinRTypography.caption),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Join 450+ members for an interactive live session on building sustainable mental toughness.',
                      style: VinRTypography.bodySm.copyWith(color: VinRColors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('RSVP Confirmed!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: VinRColors.emerald,
                        foregroundColor: Colors.black,
                        minimumSize: const Size.fromHeight(46),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('RSVP Free', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
