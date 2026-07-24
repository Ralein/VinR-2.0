import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:vinr_app/main.dart';

void main() {
  testWidgets('VinR App Smoke Test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: VinRApp()));
    await tester.pump(const Duration(milliseconds: 600));

    expect(find.textContaining('VinR'), findsAtLeastNWidgets(1));
  });
}
