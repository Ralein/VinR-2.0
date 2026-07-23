import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Linking,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Film, Play, Pause, RefreshCw, X } from 'lucide-react-native';
import { useReels, Reel } from '../../hooks/useReels';
import { useAuthStore } from '../../stores/authStore';
import { fonts, spacing, borderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80; // Estimated
const REELS_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  index: number;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, index }) => {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const lastTap = useRef<number>(0);
  const controlsTimeout = useRef<any>(null);

  // Shared value for overlay opacity
  const overlayOpacity = useSharedValue(0);

  // Auto-play when active
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      overlayOpacity.value = 0;
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: withSpring(overlayOpacity.value > 0 ? 1 : 0.5) }],
  }));

  const handlePress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Play/Pause
      const newPlaying = !isPlaying;
      setIsPlaying(newPlaying);
      
      // Flash indicator
      overlayOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
    } else {
      // Single tap -> Show/Hide controls
      setShowControls((prev) => !prev);
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    lastTap.current = now;
  }, [isPlaying]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const embedUrl = `https://www.youtube.com/embed/${reel.video_id}?autoplay=1&controls=0&modestbranding=1&loop=1&playlist=${reel.video_id}&rel=0&showinfo=0&mute=${isActive ? 0 : 1}`;

  return (
    <Pressable onPress={handlePress} style={[styles.reelContainer, { backgroundColor: colors.surface }]}>
      {/* Thumbnail / Placeholder */}
      {!isActive && (
         <View style={StyleSheet.absoluteFill}>
            <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.gold} />
         </View>
      )}

      {/* Video Content */}
      {isActive && isPlaying && !hasError && (
        <View style={StyleSheet.absoluteFill}>
          <WebView
            style={styles.webview}
            source={{ uri: embedUrl }}
            allowsFullscreenVideo={false}
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
            onError={() => setHasError(true)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
          />
        </View>
      )}

      {/* Play/Pause Large Overlay Indicator */}
      <Animated.View style={[styles.largeOverlay, animatedOverlayStyle]}>
        {!isPlaying ? (
          <Play size={80} color="#FFFFFF" fill="rgba(255,255,255,0.3)" />
        ) : (
          <Pause size={80} color="#FFFFFF" fill="rgba(255,255,255,0.3)" />
        )}
      </Animated.View>

      {/* Control Overlay */}
      {showControls && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.controlsOverlay}>
          <TouchableOpacity 
             onPress={() => Linking.openURL(`https://www.youtube.com/shorts/${reel.video_id}`)}
             style={styles.externalButton}
          >
            <Play size={20} color={colors.gold} fill={colors.gold} />
            <Text style={styles.externalText}>Open in YT</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Gradient overlays */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      {/* Info overlay */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>{reel.title}</Text>
        <Text style={[styles.channel, { color: colors.gold }]}>{reel.channel}</Text>
      </View>
    </Pressable>
  );
};

export default function ReelsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { reels, loading, error, fetchReels } = useReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const reason = user?.primaryReason || 'Stress Relief';

  useEffect(() => {
    fetchReels(reason);
  }, [reason]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReels(reason);
    setRefreshing(false);
  }, [reason]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (loading && reels.length === 0) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.void }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Curating Reels…</Text>
      </SafeAreaView>
    );
  }

  if (error && reels.length === 0) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.void }]}>
        <Film size={48} color={colors.textGhost} />
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Couldn't load Reels</Text>
        <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.gold }]}
          onPress={() => fetchReels(reason)}
        >
          <RefreshCw size={16} color={colors.void} />
          <Text style={[styles.retryText, { color: colors.void }]}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Film size={18} color={colors.gold} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reels</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={reels}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} index={index} />
        )}
        keyExtractor={(item) => item.video_id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={REELS_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        removeClippedSubviews={true}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: REELS_HEIGHT,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 80,
    zIndex: 5,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  channel: {
    fontWeight: 'bold',
    fontFamily: fonts.bodySemiBold,
    marginLeft: spacing.xs,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'transparent',
  },
  largeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8,
    pointerEvents: 'none',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 7,
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  externalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  errorBox: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: fonts.bodySemiBold,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
