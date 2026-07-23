import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/glass_container.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Community & Workshops', style: VinRTypography.h3),
        centerTitle: true,
      ),
      body: Container(
        decoration: const BoxDecoration(gradient: VinRColors.voidGradient),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text('UPCOMING LIVE SESSIONS', style: VinRTypography.label),
              const SizedBox(height: 12),
              GlassContainer(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(LucideIcons.users, color: VinRColors.goldLight),
                        const SizedBox(width: 8),
                        Text('21-Day Winning Masterclass', style: VinRTypography.body.copyWith(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Host: Dr. Elena Vance • Clinical Psychologist', style: VinRTypography.caption),
                    const SizedBox(height: 12),
                    Text(
                      'Join 450+ members for an interactive live session on building sustainable mental toughness.',
                      style: VinRTypography.bodySm,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('RSVP Confirmed for Masterclass!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: VinRColors.gold,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('RSVP Now (Free)', style: TextStyle(fontWeight: FontWeight.bold)),
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
