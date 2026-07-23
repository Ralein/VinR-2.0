import { colors, typography } from './theme';

export const Colors = colors;
export const Typography = {
    ...typography,
    button: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        letterSpacing: 0.5,
    }
};

export default { Colors, Typography };
