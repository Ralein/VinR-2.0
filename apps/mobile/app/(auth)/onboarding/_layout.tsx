import { Stack } from 'expo-router';
import { ThemeProvider } from '../../../context/ThemeContext';
import { colors } from '../../../constants/theme';

export default function OnboardingLayout() {
  return (
    <ThemeProvider forceIsDark={true}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.void },
        }}
      />
    </ThemeProvider>
  );
}
