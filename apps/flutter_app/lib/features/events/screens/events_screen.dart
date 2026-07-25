import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme/theme_context.dart';
import '../../../core/theme/vinr_colors.dart';
import '../../../core/theme/vinr_typography.dart';
import '../../../core/widgets/ambient_background.dart';
import '../../../core/widgets/glass_container.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/vinr_toast.dart';
import '../../../core/repositories/events_repository.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final _eventsRepo = EventsRepository();
  bool _isLoading = false;
  List<Map<String, dynamic>> _events = [
    {
      'name': '21-Day Winning Masterclass',
      'host': 'Dr. Elena Vance • Clinical Psychologist',
      'description': 'Join 450+ members for an interactive live session on building sustainable mental toughness.',
      'rsvped': false,
    },
    {
      'name': 'Sunset Mindfulness & Breathwork Session',
      'host': 'Marcus Thorne • Somatic Coach',
      'description': 'Live guided group breathing and deep relaxation flow to clear evening anxiety.',
      'rsvped': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    final results = await _eventsRepo.searchEvents();
    if (results.isNotEmpty && mounted) {
      setState(() {
        _isLoading = false;
        _events = results.map((e) => {
          'name': e['name'] ?? 'Wellness Workshop',
          'host': e['vicinity'] ?? 'Live Online Session',
          'description': 'Interactive group session for focus, resilience and emotional well-being.',
          'rsvped': false,
        }).toList();
      });
    } else {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _toggleRsvp(Map<String, dynamic> event) {
    setState(() {
      event['rsvped'] = !(event['rsvped'] as bool);
    });
    final isRsvped = event['rsvped'] as bool;
    VinRToast.show(
      context,
      message: isRsvped ? 'RSVP Confirmed for ${event['name']}!' : 'RSVP Canceled',
      icon: isRsvped ? LucideIcons.checkCircle2 : LucideIcons.info,
      iconColor: isRsvped ? VinRColors.emerald : VinRColors.gold,
    );
  }

  @override
  Widget build(BuildContext context) {
    final primaryTextColor = context.textColor;
    final mutedTextColor = context.textMutedColor;

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 140),
            children: [
              Text('Events & Live Workshops', style: VinRTypography.h1.copyWith(fontSize: 26, color: primaryTextColor)),
              Text('Connect with coaches & mindful communities', style: VinRTypography.caption.copyWith(color: mutedTextColor)),
              const SizedBox(height: 20),

              const SectionHeader(
                title: 'UPCOMING LIVE SESSIONS',
                icon: LucideIcons.calendar,
                iconColor: VinRColors.emerald,
              ),

              if (_isLoading)
                const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
              else
                ..._events.map((e) {
                  final isRsvped = e['rsvped'] as bool;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: GlassContainer(
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
                                    Text(e['name'] as String, style: TextStyle(fontWeight: FontWeight.bold, color: primaryTextColor, fontSize: 16)),
                                    Text(e['host'] as String, style: TextStyle(color: mutedTextColor, fontSize: 12)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Text(
                            e['description'] as String,
                            style: TextStyle(color: mutedTextColor, fontSize: 13, height: 1.4),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => _toggleRsvp(e),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isRsvped ? VinRColors.surface : VinRColors.emerald,
                              foregroundColor: isRsvped ? VinRColors.emerald : Colors.black,
                              minimumSize: const Size.fromHeight(46),
                              side: isRsvped ? const BorderSide(color: VinRColors.emerald) : null,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                              isRsvped ? '✓ RSVP Confirmed (Tap to cancel)' : 'RSVP Free →',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}
