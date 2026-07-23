/**
 * YouTubeCard — YouTube video card with thumbnail, title, channel
 */

import { View, Text, Pressable, StyleSheet, Image, Linking } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../constants/theme';

interface YouTubeCardProps {
    videoId: string;
    title: string;
    channel: string;
    thumbnailUrl: string;
}

export default function YouTubeCard({ videoId, title, channel, thumbnailUrl }: YouTubeCardProps) {
    const handlePress = () => {
        Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
    };

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                    <Text style={styles.placeholderIcon}>▶️</Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.channel} numberOfLines={1}>{channel}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        marginRight: spacing.md,
    },
    thumbnail: {
        width: 200,
        height: 112,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
    },
    placeholderThumbnail: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: { fontSize: 32 },
    info: {
        marginTop: spacing.xs,
    },
    title: {
        fontFamily: fonts.bodySemiBold,
        fontSize: 13,
        color: colors.textPrimary,
        lineHeight: 18,
    },
    channel: {
        fontFamily: fonts.body,
        fontSize: 11,
        color: colors.textGhost,
        marginTop: 2,
    },
});
