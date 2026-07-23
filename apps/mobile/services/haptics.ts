/**
 * Haptics Service — tactile feedback wrapper
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

export const haptics = {
    /** Pressable element feedback */
    light: () => {
        if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },

    /** Selection change */
    medium: () => {
        if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },

    /** Streak milestone, day complete */
    heavy: () => {
        if (isNative) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },

    /** Day completed, plan saved */
    success: () => {
        if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },

    /** Emergency alert, validation error */
    error: () => {
        if (isNative) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },

    /** Mood chip selection */
    selection: () => {
        if (isNative) Haptics.selectionAsync();
    },
};
