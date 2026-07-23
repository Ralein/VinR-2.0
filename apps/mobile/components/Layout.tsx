import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  screenPadding?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = true, 
  screenPadding = false 
}) => {
  const router = useRouter();
  const { colors, fonts, gradients, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <LinearGradient
        colors={isDark ? gradients.void : [colors.void, colors.void]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {showBack && (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
            >
              <ArrowLeft size={24} color={colors.gold} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {title && (
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>{title}</Text>
          )}
        </View>
        <View style={[styles.content, screenPadding && styles.screenPadding]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  title: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  screenPadding: {
    paddingHorizontal: 20,
  },
});
